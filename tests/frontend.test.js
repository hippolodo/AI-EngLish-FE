import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as vue from 'vue';
import * as icons from 'lucide-vue-next';
import { parse, compileScript } from '@vue/compiler-sfc';
import { renderToString } from '@vue/server-renderer';
import { AudioRecorder } from '../src/services/audioRecorder.js';

const { ref, computed, watch, nextTick } = vue;
import { createLearningState, useLearningJourney } from '../src/composables/useLearningJourney.js';
import { useProfileSettings } from '../src/composables/useProfileSettings.js';

const appSource = fs.readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
  .split('<script setup>')[1].split('</script>')[0]
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\s*$/gm, '');
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};

function createApp(overrides = {}) {
  let authenticated = true;
  let context;
  const mounted = [];
  const services = {
    progressService: { getDashboard: async () => ({ speaking: { total_sessions: 1 } }) },
    curriculumService: { getTopics: async () => [] },
    pronunciationService: {},
    writingService: { evaluateEssay: async () => ({ corrected_text: 'Corrected' }) },
    chatService: { getScenarios: async () => [{ id: 'hotel', title: 'Hotel' }] },
    studyService: { getCardsForReview: async () => [], reviewCard: async () => {} },
    authService: {
      isAuthenticated: () => authenticated,
      getUser: () => authenticated ? { id: 2 } : null,
      logout: () => { authenticated = false; }
    },
    learningService: {},
    useLearningJourney: () => {
      const state = ref(createLearningState());
      const lesson = id => state.value.lessons[String(id)] || { completed_content_ids: [], speaking_scores: {}, writing_score: null, quiz_score: null, practiced: false, completed: false };
      return { state, loading: ref(false), error: ref(''), completedCount: computed(() => Object.values(state.value.lessons).filter(p => p.completed).length),
        update: fn => fn(state.value), sync: async () => {}, lesson,
        updateLesson: (id, fn) => { const progress = lesson(id); fn(progress); state.value.lessons[String(id)] = progress; },
        remember: (topic_id, lesson_id, step = 'practice', content_id = null) => { state.value.resume = { topic_id, lesson_id, step, content_id }; }
      };
    },
    ...overrides
  };
  services.studyService = { getFlashcardDecks: async () => [], ...services.studyService };
  vm.runInNewContext(appSource, {
    ref, computed, watch, nextTick, provide: (_, value) => { context = value; },
    onMounted: fn => mounted.push(fn), onUnmounted: () => {},
    window: { speechSynthesis: { cancel() {} }, addEventListener() {}, removeEventListener() {} },
    navigator: {}, setTimeout, setInterval, clearInterval, console,
    getFullAudioUrl: value => value,
    getErrorMessage: (error, fallback) => error.message || fallback,
    AudioRecorder: class { cleanup() {} },
    ...services
  });
  return { ctx: context, services, mounted, setAuthenticated: value => { authenticated = value; } };
}

const questions = [
  { id: 10, order_index: 1, question_type: 'MULTIPLE_CHOICE', answers: [{ id: 100 }] },
  { id: 20, order_index: 2, question_type: 'FILL_BLANK', answers: [] }
];

test('quiz submits the complete attempt once and matches results by question id', async () => {
  const submissions = [];
  const { ctx } = createApp({ studyService: {
    submitQuiz: async (id, answers) => {
      submissions.push({ id, answers });
      return { score: 100, details: [{ question_id: 20, is_correct: true }, { question_id: 10, is_correct: false }] };
    }
  } });
  ctx.selectedQuizId.value = 7;
  ctx.quizQuestions.value = questions;
  ctx.selectQuizAnswer(questions[0].answers[0]);
  await ctx.checkQuizAnswer();
  assert.equal(submissions.length, 0);
  assert.equal(ctx.currentQuestion.value.id, 20);
  ctx.quizInputText.value = ' colleague ';
  await ctx.checkQuizAnswer();
  assert.deepEqual(JSON.parse(JSON.stringify(submissions)), [{ id: 7, answers: [
    { question_id: 10, selected_answer_id: 100 }, { question_id: 20, user_input_text: 'colleague' }
  ] }]);
  assert.equal(ctx.submittedQuizDetail.value.question_id, 10);
  assert.equal(ctx.submittedQuizDetail.value.is_correct, false);
  ctx.nextQuizQuestion();
  assert.equal(ctx.submittedQuizDetail.value.question_id, 20);
  assert.equal(ctx.quizInputText.value, 'colleague');
  ctx.nextQuizQuestion();
  assert.equal(ctx.quizChecked.value, false);
});

test('immediate feedback locks each choice and submits one complete attempt at the end', async () => {
  const submissions = [];
  const checks = [];
  const { ctx } = createApp({ studyService: {
    checkQuizAnswer: async (id, answer) => {
      checks.push(answer);
      return { question_id: answer.question_id, is_correct: answer.question_id === 20, correct_answer_id: 101, correct_answer_text: 'Hello', explanation: 'A greeting' };
    },
    submitQuiz: async (id, answers) => { submissions.push(answers); return { score: 50, details: [{ question_id: 10, is_correct: false }, { question_id: 20, is_correct: true }] }; }
  } });
  ctx.selectedQuizId.value = 7;
  ctx.quizQuestions.value = questions;
  ctx.setQuizFeedbackMode('immediate');
  await ctx.selectQuizAnswer(questions[0].answers[0]);
  assert.equal(ctx.currentStudyIndex.value, 0);
  assert.equal(ctx.quizChecked.value, true);
  assert.equal(ctx.submittedQuizDetail.value.is_correct, false);
  assert.match(ctx.getQuizAnswerClass({ id: 101 }), /emerald/);
  assert.match(ctx.getQuizAnswerClass({ id: 100 }), /rose/);
  await ctx.selectQuizAnswer({ id: 101 });
  assert.equal(checks.length, 1);
  ctx.setQuizFeedbackMode('end');
  assert.equal(ctx.quizFeedbackMode.value, 'immediate');
  await ctx.nextQuizQuestion();
  ctx.quizInputText.value = 'Hello';
  await ctx.checkQuizAnswer();
  assert.equal(ctx.submittedQuizDetail.value.is_correct, true);
  assert.equal(submissions.length, 0);
  ctx.previousQuizQuestion();
  assert.equal(ctx.submittedQuizDetail.value.is_correct, false);
  await ctx.nextQuizQuestion();
  await ctx.nextQuizQuestion();
  assert.equal(submissions.length, 1);
  assert.equal(submissions[0].length, 2);
  assert.equal(ctx.quizResult.value.score, 50);
});

test('immediate feedback failure can be retried and late feedback is ignored after restarting', async () => {
  let calls = 0;
  const pending = deferred();
  const { ctx } = createApp({ studyService: {
    checkQuizAnswer: async () => { calls++; if (calls === 1) throw new Error('Unavailable'); return pending.promise; }
  } });
  ctx.selectedQuizId.value = 7;
  ctx.quizQuestions.value = questions;
  ctx.setQuizFeedbackMode('immediate');
  await ctx.selectQuizAnswer(questions[0].answers[0]);
  assert.equal(ctx.quizChecked.value, false);
  assert.equal(ctx.selectedQuizAnswer.value.id, 100);
  assert.equal(ctx.studyError.value, 'Unavailable');
  const retry = ctx.checkQuizAnswer();
  assert.equal(ctx.quizFeedbackLoading.value, true);
  ctx.restartQuiz();
  pending.resolve({ question_id: 10, is_correct: true });
  await retry;
  assert.equal(ctx.quizChecked.value, false);
  assert.equal(ctx.quizFeedbackLoading.value, false);
});

test('quiz submission failure preserves answers and allows retry', async () => {
  let calls = 0;
  const { ctx } = createApp({ studyService: { submitQuiz: async () => {
    if (++calls === 1) throw new Error('Offline');
    return { score: 100, details: [] };
  } } });
  ctx.selectedQuizId.value = 7;
  ctx.quizQuestions.value = [questions[0]];
  ctx.selectQuizAnswer(questions[0].answers[0]);
  await ctx.checkQuizAnswer();
  assert.equal(ctx.quizChecked.value, false);
  assert.equal(ctx.selectedQuizAnswer.value.id, 100);
  assert.equal(ctx.studyError.value, 'Offline');
  await ctx.checkQuizAnswer();
  assert.equal(calls, 2);
  assert.equal(ctx.quizChecked.value, true);
});

test('previous quiz question restores a saved answer', async () => {
  const { ctx } = createApp();
  ctx.quizQuestions.value = questions;
  ctx.selectedQuizId.value = 7;
  ctx.selectQuizAnswer(questions[0].answers[0]);
  await ctx.checkQuizAnswer();
  ctx.previousQuizQuestion();
  assert.equal(ctx.selectedQuizAnswer.value.id, 100);
});

test('flashcard failure keeps the card; success removes it and finishes the queue', async () => {
  let fail = true;
  const { ctx } = createApp({ studyService: { reviewCard: async () => { if (fail) throw new Error('Offline'); } } });
  ctx.flashcards.value = [{ id: 1, word: 'hello' }];
  await ctx.submitCardReview(true);
  assert.equal(ctx.flashcards.value.length, 1);
  assert.equal(ctx.studyError.value, 'Offline');
  fail = false;
  await ctx.submitCardReview(true);
  assert.equal(ctx.flashcards.value.length, 0);
  assert.equal(ctx.isReviewingCard.value, false);
});

test('logout clears private state and ignores a late writing response', async () => {
  const pending = deferred();
  const { ctx } = createApp({ writingService: { evaluateEssay: () => pending.promise } });
  ctx.essayInput.value = 'Private essay';
  ctx.conversationId.value = 8;
  ctx.chatMessages.value = [{ message_text: 'Private chat' }];
  ctx.flashcards.value = [{ id: 1 }];
  const request = ctx.submitWritingEvaluation();
  ctx.logout();
  pending.resolve({ corrected_text: 'Old private result' });
  await request;
  assert.equal(ctx.writingResult.value, null);
  assert.equal(ctx.essayInput.value, '');
  assert.equal(ctx.conversationId.value, null);
  assert.equal(ctx.chatMessages.value.length, 0);
  assert.equal(ctx.flashcards.value.length, 0);
  assert.equal(ctx.isEvaluating.value, false);
});

test('a late writing evaluation cannot overwrite a different lesson draft', async () => {
  const pending = deferred();
  const { ctx } = createApp({ writingService: { evaluateEssay: () => pending.promise } });
  ctx.currentLesson.value = { id: 1, type: 'WRITING', title: 'First lesson' };
  ctx.lessonDetail.value = { contents: [{ target_text: 'First task' }] };
  ctx.essayInput.value = 'First draft';
  const evaluation = ctx.submitWritingEvaluation();
  ctx.currentLesson.value = { id: 2, type: 'WRITING', title: 'Second lesson' };
  ctx.essayInput.value = 'Second draft';
  pending.resolve({ overall_score: 90, corrected_text: 'First draft corrected' });
  await evaluation;
  assert.equal(ctx.writingResult.value, null);
  assert.equal(ctx.essayInput.value, 'Second draft');
  assert.equal(ctx.journey.lesson(2).practiced, false);
});

test('writing picker opens in place, filters writing topics and restores the selected lesson draft', async () => {
  const filters = [];
  const lessons = [
    { id: 8, topic_id: 4, type: 'WRITING', title: 'Cover letter', contents: [{ id: 29, target_text: 'Write a cover letter.', task_guidance: '120–180 words', sample_text: 'Sample letter' }] },
    { id: 10, topic_id: 5, type: 'WRITING', title: 'Social media', contents: [{ id: 36, target_text: 'Discuss social media.' }] },
    { id: 1, topic_id: 1, type: 'SPEAKING', title: 'Greetings' }
  ];
  const { ctx } = createApp({ curriculumService: {
    getTopics: async () => [{ id: 1, title: 'Greetings' }, { id: 4, title: 'Career' }, { id: 5, title: 'Tech' }],
    getLessons: async type => { filters.push(type); return lessons; },
    getLessonsByTopic: async topicId => lessons.filter(lesson => lesson.topic_id === topicId),
    getLessonDetail: async id => lessons.find(lesson => lesson.id === id)
  }, studyService: { getQuizzes: async () => [], getFlashcardDecks: async () => [] } });
  ctx.activeTab.value = 'writing';
  ctx.essayInput.value = 'Free draft';
  ctx.journey.state.value.writing_drafts['8'] = 'Saved lesson draft';
  await ctx.openWritingTaskPicker();
  assert.equal(ctx.activeTab.value, 'writing');
  assert.equal(ctx.writingPickerOpen.value, true);
  assert.deepEqual(filters, ['WRITING']);
  assert.deepEqual(Array.from(ctx.writingPickerTopics.value, topic => topic.id), [4, 5]);
  ctx.writingPickerTopicId.value = 4;
  assert.equal(ctx.writingPickerLessons.value.length, 1);
  await ctx.openWritingLesson(ctx.writingPickerLessons.value[0]);
  assert.equal(ctx.activeTab.value, 'writing');
  assert.equal(ctx.currentLesson.value.id, 8);
  assert.equal(ctx.lessonDetail.value.contents[0].target_text, 'Write a cover letter.');
  assert.equal(ctx.essayInput.value, 'Saved lesson draft');
  assert.equal(ctx.journey.state.value.writing_drafts.free, 'Free draft');
  assert.equal(ctx.writingPickerOpen.value, false);
});

test('writing picker reports load errors and supports retry', async () => {
  let calls = 0;
  const { ctx } = createApp({ curriculumService: {
    getTopics: async () => [{ id: 1, title: 'Topic' }],
    getLessons: async () => { if (++calls === 1) throw new Error('Unavailable'); return [{ id: 2, topic_id: 1, type: 'WRITING' }]; }
  } });
  ctx.activeTab.value = 'writing';
  await ctx.openWritingTaskPicker();
  assert.equal(ctx.writingPickerError.value, 'Unavailable');
  assert.equal(ctx.activeTab.value, 'writing');
  await ctx.loadWritingTasks();
  assert.equal(ctx.writingPickerError.value, '');
  assert.equal(ctx.writingPickerLessons.value.length, 1);
});

test('late writing catalog response is ignored after logout', async () => {
  const pending = deferred();
  const { ctx } = createApp({ curriculumService: { getTopics: async () => [], getLessons: () => pending.promise } });
  const loading = ctx.openWritingTaskPicker();
  ctx.logout();
  pending.resolve([{ id: 2, topic_id: 1, type: 'WRITING' }]);
  await loading;
  assert.equal(ctx.writingPickerOpen.value, false);
  assert.equal(ctx.writingPickerLoading.value, false);
  assert.equal(ctx.writingPickerLessons.value.length, 0);
});

test('basic writing feedback records practice without inventing a score', async () => {
  const { ctx } = createApp({ writingService: { evaluateEssay: async () => ({ overall_score: null, estimated_band: null, assessment_method: 'rules' }) } });
  ctx.currentLesson.value = { id: 1, type: 'WRITING', title: 'Letter' };
  ctx.lessonDetail.value = { contents: [{ target_text: 'Write a letter.' }] };
  ctx.essayInput.value = 'Dear Manager, thank you.';
  await ctx.submitWritingEvaluation();
  assert.equal(ctx.lessonProgress.value.practiced, true);
  assert.equal(ctx.lessonProgress.value.writing_score, null);
  assert.equal(ctx.canFinishLesson.value, true);
});

test('scenario loading never creates a conversation automatically', async () => {
  let calls = 0;
  const { ctx } = createApp({ chatService: {
    getScenarios: async () => [{ id: 'hotel', title: 'Hotel' }],
    startConversation: async () => { calls++; }
  } });
  await ctx.loadChatScenarios();
  assert.equal(calls, 0);
  assert.equal(ctx.conversationId.value, null);
});

test('failed chat sends preserve the draft and do not add a successful-looking message', async () => {
  const { ctx } = createApp({ chatService: { sendMessage: async () => { throw new Error('Offline'); } } });
  ctx.conversationId.value = 8;
  ctx.chatInput.value = 'Hello';
  await ctx.sendChatText();
  assert.equal(ctx.chatInput.value, 'Hello');
  assert.equal(ctx.chatMessages.value.length, 0);
  assert.equal(ctx.chatError.value, 'Offline');
  assert.equal(ctx.isBotTyping.value, false);
});

test('late conversation response cannot restore private data after logout', async () => {
  const pending = deferred();
  const { ctx } = createApp({ chatService: { startConversation: () => pending.promise } });
  const request = ctx.startChatConversation();
  ctx.logout();
  pending.resolve({ id: 99, messages: [{ message_text: 'Private' }] });
  await request;
  assert.equal(ctx.conversationId.value, null);
  assert.equal(ctx.chatMessages.value.length, 0);
});

test('guest actions open login and never call personal APIs', async () => {
  let calls = 0;
  const { ctx, setAuthenticated } = createApp({ studyService: { getCardsForReview: async () => { calls++; } } });
  setAuthenticated(false);
  await ctx.loadFlashcardsData();
  ctx.essayInput.value = 'Essay';
  await ctx.submitWritingEvaluation();
  assert.equal(calls, 0);
  assert.equal(ctx.isAuthOpen.value, true);
});

test('authentication rejects expired or malformed cached tokens', () => {
  const storage = new Map();
  const source = fs.readFileSync(new URL('../src/services/authService.js', import.meta.url), 'utf8')
    .replace(/^import[^\n]+\n/, '').replace('export const authService', 'globalThis.authService');
  const sandbox = { apiClient: {}, atob, localStorage: {
    getItem: key => storage.get(key), removeItem: key => storage.delete(key), setItem: (key, value) => storage.set(key, value)
  } };
  vm.runInNewContext(source, sandbox);
  const token = exp => `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
  storage.set('token', token(Math.floor(Date.now() / 1000) + 60));
  assert.equal(sandbox.authService.isAuthenticated(), true);
  storage.set('token', token(1));
  storage.set('user', 'old');
  assert.equal(sandbox.authService.isAuthenticated(), false);
  assert.equal(storage.has('user'), false);
  storage.set('token', 'invalid');
  assert.equal(sandbox.authService.isAuthenticated(), false);
});

test('API 401 handling only expires the session associated with the failed request', async () => {
  let rejectResponse;
  let events = 0;
  const storage = new Map([['token', 'new-token'], ['user', 'new-user']]);
  const source = fs.readFileSync(new URL('../src/services/api.js', import.meta.url), 'utf8')
    .replace(/^import[^\n]+\n/, '').replaceAll('import.meta.env', '{}').replaceAll('export ', '');
  vm.runInNewContext(source, {
    axios: { create: () => ({ interceptors: {
      request: { use() {} }, response: { use: (_, reject) => { rejectResponse = reject; } }
    } }) },
    localStorage: { getItem: key => storage.get(key), removeItem: key => storage.delete(key) },
    window: { dispatchEvent: () => { events++; } }, Event, File
  });
  const error = token => ({ response: { status: 401 }, config: { url: '/auth/me', headers: { Authorization: `Bearer ${token}` } } });
  await assert.rejects(rejectResponse(error('old-token')));
  assert.equal(storage.get('token'), 'new-token');
  await assert.rejects(rejectResponse(error('new-token')));
  assert.equal(storage.has('token'), false);
  assert.equal(events, 1);
});

test('audio cleanup cancels a pending microphone request and stops its late stream', async () => {
  const pending = deferred();
  let stopped = 0;
  const oldNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const oldRecorder = globalThis.MediaRecorder;
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: { getUserMedia: () => pending.promise } } });
  globalThis.MediaRecorder = class {};
  try {
    const recorder = new AudioRecorder();
    const starting = recorder.start();
    recorder.cleanup();
    pending.resolve({ getTracks: () => [{ stop: () => { stopped++; } }] });
    await assert.rejects(starting);
    assert.equal(stopped, 1);
    assert.equal(recorder.stream, null);
  } finally {
    if (oldNavigator) Object.defineProperty(globalThis, 'navigator', oldNavigator);
    else delete globalThis.navigator;
    globalThis.MediaRecorder = oldRecorder;
  }
});

test('all five screens render without unresolved components', async () => {
  const { ctx } = createApp();
  const cases = [['HomeScreen', 'home'], ['SpeakingScreen', 'speaking'], ['WritingScreen', 'writing'], ['ChatScreen', 'chat'], ['StudyScreen', 'study'], ['StudyScreen', 'study', 'views', 'flashcard'], ['LessonScreen', 'lesson'], ['LearningHome', 'home', 'components'], ['ProfileScreen', 'profile']];
  for (const [name, tab, directory = 'views', variant] of cases) {
    const source = fs.readFileSync(new URL(`../src/${directory}/${name}.vue`, import.meta.url), 'utf8');
    const { descriptor } = parse(source);
    let code = compileScript(descriptor, { id: name, inlineTemplate: true }).content;
    code = code.replace(/^import\s+\{([\s\S]*?)\}\s+from\s+['"]([^'"]+)['"];?\s*$/gm, (_, names, module) => {
      const target = module === 'vue' ? 'vue' : module === 'lucide-vue-next' ? 'icons' : 'services';
      return `const { ${names.replace(/\bas\b/g, ':')} } = ${target};`;
    }).replace(/^import\s+(\w+)\s+from\s+['"][^'"]+['"];?\s*$/gm, (_, name) => `const ${name} = { render: () => null };`)
      .replace('export default', 'return');
    const component = new Function('vue', 'icons', 'services', code)(vue, icons, { getFullAudioUrl: value => value, authService: {}, useProfileSettings });
    ctx.activeTab.value = tab;
    if (tab === 'lesson') { ctx.selectedTopic.value = { id: 1, title: 'Topic', level: 'Beginner' }; ctx.topicLessons.value = [{ id: 1, title: 'Lesson', type: 'SPEAKING' }]; }
    if (tab === 'study') {
      ctx.studyMode.value = variant || 'quiz';
      ctx.flashcardDecks.value = [{ id: 1, lesson_id: 1, title: 'Vocabulary: Meeting a New Colleague', total_cards: 8 }, { id: 2, lesson_id: null, title: 'Saved words', total_cards: 3 }];
      ctx.quizQuestions.value = questions;
      ctx.quizResult.value = { score: 100, is_passed: true, correct_answers: 2, total_questions: 2, details: [{ question_id: 10, is_correct: true }] };
    }
    const app = vue.createSSRApp({ render: () => vue.h(component) });
    app.provide('screenContext', ctx);
    const warnings = [];
    app.config.warnHandler = warning => warnings.push(warning);
    const html = await renderToString(app);
    assert.equal(warnings.length, 0, `${name}: ${warnings.join(', ')}`);
    assert.match(html, /<svg/, `${name} should render its icons`);
    if (tab === 'study' && variant === 'flashcard') {
      assert.match(html, /flashcard-deck/);
      assert.match(html, /Meeting a New Colleague/);
      assert.match(html, /Saved words/);
    } else if (tab === 'study') {
      assert.match(html, /100\/100/);
      assert.doesNotMatch(html, /\+20 XP/);
    }
  }
});

function profileFixture(service) {
  const { ctx } = createApp();
  ctx.userProfile.value = { id: 2, full_name: 'Learner', email: 'learner@example.com', target_level: 'Beginner' };
  ctx.journey.state.value.writing_drafts.free = 'Keep this draft';
  ctx.journey.state.value.lessons['1'] = { completed: true };
  const scope = vue.effectScope();
  const settings = scope.run(() => useProfileSettings(ctx, service));
  return { ctx, settings, scope };
}

test('profile settings save the user and preferences without losing learning data', async () => {
  const calls = [];
  const { ctx, settings, scope } = profileFixture({ updatePreferences: async payload => {
    calls.push(payload);
    return { user: { id: 2, full_name: payload.full_name, target_level: payload.target_level }, goal: payload.goal, daily_minutes: payload.daily_minutes };
  } });
  try {
    settings.form.value = { full_name: ' New name ', target_level: 'Advanced', goal: 'work', daily_minutes: 20 };
    await settings.save();
    assert.equal(calls[0].full_name, 'New name');
    assert.equal(ctx.userProfile.value.target_level, 'Advanced');
    assert.equal(ctx.journey.state.value.goal, 'work');
    assert.equal(ctx.journey.state.value.daily_minutes, 20);
    assert.equal(ctx.journey.state.value.lessons['1'].completed, true);
    assert.equal(ctx.journey.state.value.writing_drafts.free, 'Keep this draft');
    assert.equal(settings.dirty.value, false);
    assert.ok(settings.message.value);
  } finally { scope.stop(); }
});

test('profile save failure preserves edits and allows retry', async () => {
  const { settings, scope } = profileFixture({ updatePreferences: async () => { throw new Error('Offline'); } });
  try {
    settings.form.value.target_level = 'Intermediate';
    await settings.save();
    assert.equal(settings.form.value.target_level, 'Intermediate');
    assert.equal(settings.dirty.value, true);
    assert.ok(settings.error.value);
    assert.equal(settings.saving.value, false);
  } finally { scope.stop(); }
});

test('profile changes reset on account switch and a late save is ignored', async () => {
  const pending = deferred();
  const { ctx, settings, scope } = profileFixture({ updatePreferences: () => pending.promise });
  try {
    settings.form.value.target_level = 'Advanced';
    const request = settings.save();
    await nextTick();
    ctx.userProfile.value = { id: 3, full_name: 'Another learner', target_level: 'Beginner' };
    pending.resolve({ user: { id: 2, full_name: 'Old name', target_level: 'Advanced' }, goal: 'work', daily_minutes: 60 });
    await request;
    assert.equal(settings.form.value.full_name, 'Another learner');
    assert.equal(ctx.userProfile.value.id, 3);
    assert.equal(settings.message.value, '');
    assert.equal(settings.saving.value, false);
  } finally { scope.stop(); }
});

test('profile validation blocks blank names and cancel restores saved settings', async () => {
  let calls = 0;
  const { settings, scope } = profileFixture({ updatePreferences: async () => { calls++; } });
  try {
    settings.form.value.full_name = '   ';
    await settings.save();
    assert.equal(calls, 0);
    assert.ok(settings.error.value);
    settings.reset();
    assert.equal(settings.form.value.full_name, 'Learner');
    assert.equal(settings.dirty.value, false);
  } finally { scope.stop(); }
});

test('guest writing draft survives login', async () => {
  const { ctx, setAuthenticated } = createApp();
  setAuthenticated(false); ctx.isAuthenticated.value = false;
  ctx.essayInput.value = 'My draft';
  await ctx.submitWritingEvaluation();
  assert.equal(ctx.isAuthOpen.value, true);
  setAuthenticated(true);
  await ctx.onAuthSuccess();
  assert.equal(ctx.essayInput.value, 'My draft');
});

test('leaving a recording screen cleans up the microphone', async () => {
  const { ctx } = createApp();
  let stopped = 0;
  ctx.recorder.cleanup = () => { stopped++; };
  ctx.activeTab.value = 'speaking'; ctx.isRecording.value = true;
  ctx.activeTab.value = 'home';
  assert.equal(stopped, 1);
  assert.equal(ctx.isRecording.value, false);
  ctx.chatRecorder.cleanup = () => { stopped++; };
  ctx.activeTab.value = 'chat'; ctx.isChatRecording.value = true;
  ctx.activeTab.value = 'home';
  assert.equal(stopped, 2);
  assert.equal(ctx.isChatRecording.value, false);
});

test('topic selection opens all lesson types, and writing is submitted with the lesson prompt', async () => {
  const submitted = [];
  const lesson = { id: 4, topic_id: 1, title: 'Describe your job', type: 'WRITING', contents: [{ id: 8, target_text: 'Write about your daily work.', task_guidance: 'Write 120–180 words.', sample_text: 'A sample that must not be sent as the task.' }] };
  const { ctx } = createApp({
    curriculumService: { getTopics: async () => [], getLessonsByTopic: async () => [lesson], getLessonDetail: async () => lesson },
    studyService: { getQuizzes: async () => [], getFlashcardDecks: async () => [] },
    writingService: { evaluateEssay: async (...args) => { submitted.push(args); return { overall_score: 75 }; } }
  });
  await ctx.startTopic({ id: 1, title: 'Work' });
  assert.equal(ctx.activeTab.value, 'lesson');
  assert.equal(ctx.topicLessons.value[0].type, 'WRITING');
  await ctx.startLesson(lesson);
  assert.equal(ctx.lessonQuizzes.value.length, 0);
  ctx.beginLessonPractice();
  assert.equal(ctx.activeTab.value, 'writing');
  ctx.essayInput.value = 'I work in an office.';
  await ctx.submitWritingEvaluation();
  assert.deepEqual(submitted[0], ['I work in an office.', 4, 'Write about your daily work.\nWrite 120–180 words.']);
  assert.equal(ctx.lessonProgress.value.writing_score, 75);
  ctx.finishLesson();
  assert.equal(ctx.lessonProgress.value.completed, true);
  assert.equal(ctx.lessonStep.value, 'summary');
});

test('speaking lesson restores its resume point and requires practice before completion', async () => {
  const lesson = { id: 2, topic_id: 1, type: 'SPEAKING', contents: [{ id: 10, target_text: 'Hello' }, { id: 20, target_text: 'Sarah: Goodbye' }] };
  const { ctx } = createApp({
    curriculumService: { getLessonDetail: async () => lesson },
    studyService: {
      getQuizzes: async () => [{ id: 1, lesson_id: 2 }, { id: 10, lesson_id: 2 }, { id: 20, topic_id: 1 }, { id: 30, lesson_id: 3, topic_id: 1 }],
      getQuizDetail: async () => ({ questions: [] }), getFlashcardDecks: async () => []
    }
  });
  await ctx.startLesson(lesson, { content_id: 20, step: 'practice' });
  assert.equal(ctx.selectedSpeakingContentId.value, 20);
  assert.equal(ctx.targetSpeakingText.value, 'Goodbye');
  await ctx.openLessonQuiz();
  assert.deepEqual(Array.from(ctx.lessonQuizzes.value, item => item.id), [10, 1, 20]);
  assert.equal(ctx.selectedQuizId.value, 10);
  ctx.finishLesson();
  assert.equal(ctx.lessonProgress.value.completed, false);
  ctx.journey.updateLesson(2, p => { p.practiced = true; p.completed_content_ids = [10, 20]; });
  ctx.finishLesson();
  assert.equal(ctx.lessonProgress.value.completed, true);
});

test('forgotten cards can be retried after the current review queue', async () => {
  const { ctx } = createApp();
  ctx.flashcards.value = [{ id: 1, word: 'Hello' }];
  await ctx.submitCardReview(false);
  assert.equal(ctx.flashcards.value.length, 0);
  assert.equal(ctx.reviewSummary.value.retry, 1);
  ctx.retryForgottenCards();
  assert.equal(ctx.currentCard.value.id, 1);
  assert.equal(ctx.reviewSummary.value, null);
});

test('practice navigation loads the free review queue once and avoids hidden reloads', async () => {
  const requests = [];
  const { ctx } = createApp({
    studyService: { getCardsForReview: async deckId => { requests.push(deckId); return [{ id: 1, word: 'Hello' }]; } }
  });
  ctx.activeTab.value = 'study';
  ctx.currentLesson.value = { id: 1, type: 'SPEAKING' };
  ctx.studyDeckId.value = 7;
  ctx.navigateTab('study');
  await nextTick();
  assert.deepEqual(requests, [null]);
  assert.equal(ctx.currentLesson.value, null);
  ctx.navigateTab('study');
  assert.equal(requests.length, 1);
  ctx.navigateTab('writing');
  assert.equal(requests.length, 1);
  ctx.navigateTab('study');
  await nextTick();
  assert.deepEqual(requests, [null, null]);
});

test('flashcard selection filters by deck and resets the previous review session', async () => {
  const requests = [];
  const { ctx } = createApp({ studyService: {
    getFlashcardDecks: async () => [{ id: 10, lesson_id: 1, title: 'Lesson 1' }, { id: 20, lesson_id: null, title: 'Saved words' }],
    getCardsForReview: async id => { requests.push(id); return [{ id: id || 1, deck_id: id || 10, word: 'Hello' }]; }
  } });
  await ctx.loadFlashcardsData();
  assert.equal(ctx.availableFlashcardDecks.value.length, 2);
  ctx.studyDeckId.value = 20;
  ctx.isFlipped.value = true;
  ctx.currentStudyIndex.value = 3;
  ctx.reviewSummary.value = { total: 3, retry: 0 };
  await ctx.onStudyDeckChange();
  assert.deepEqual(requests, [null, 20]);
  assert.equal(ctx.currentCard.value.deck_id, 20);
  assert.equal(ctx.currentStudyIndex.value, 0);
  assert.equal(ctx.isFlipped.value, false);
  assert.equal(ctx.reviewSummary.value, null);
  ctx.studyDeckId.value = null;
  await ctx.onStudyDeckChange();
  assert.deepEqual(requests, [null, 20, null]);
});

test('topic flashcards only offer decks from the current lesson', async () => {
  let catalogCalls = 0;
  const { ctx } = createApp({ studyService: {
    getFlashcardDecks: async () => { catalogCalls++; return []; },
    getCardsForReview: async id => [{ id: 1, deck_id: id }]
  } });
  ctx.flashcardDecks.value = [{ id: 20, lesson_id: 2 }];
  ctx.currentLesson.value = { id: 1, type: 'SPEAKING' };
  ctx.lessonDecks.value = [{ id: 10, lesson_id: 1 }];
  ctx.studyDeckId.value = 10;
  await ctx.onStudyDeckChange();
  assert.equal(ctx.availableFlashcardDecks.value.length, 1);
  assert.equal(ctx.availableFlashcardDecks.value[0].id, 10);
  assert.equal(ctx.currentCard.value.deck_id, 10);
  assert.equal(catalogCalls, 0);
});

test('late deck catalog response cannot restore private options after logout', async () => {
  const pending = deferred();
  const { ctx } = createApp({ studyService: { getFlashcardDecks: () => pending.promise } });
  const loading = ctx.loadFlashcardDecks();
  ctx.logout();
  pending.resolve([{ id: 1, user_id: 2, title: 'Private saved words' }]);
  await loading;
  assert.equal(ctx.flashcardDecks.value.length, 0);
  assert.equal(ctx.flashcardDecksLoading.value, false);
});

test('deck catalog failure does not block the review queue', async () => {
  const { ctx } = createApp({ studyService: {
    getFlashcardDecks: async () => { throw new Error('Catalog unavailable'); },
    getCardsForReview: async () => [{ id: 1, word: 'Hello' }]
  } });
  await ctx.loadFlashcardsData();
  assert.equal(ctx.currentCard.value.word, 'Hello');
  assert.equal(ctx.studyError.value, '');
  assert.equal(ctx.flashcardDecksError.value, 'Catalog unavailable');
});

test('learning state is cached, synced, reloaded and isolated between accounts', async () => {
  const cache = new Map();
  const storage = { getItem: key => cache.get(key), setItem: (key, value) => cache.set(key, value) };
  const remote = new Map();
  const user = ref({ id: 1 }); const authenticated = ref(true);
  const service = {
    getState: async () => remote.get(user.value.id) || createLearningState(),
    saveState: async state => remote.set(user.value.id, state)
  };
  const scope = vue.effectScope();
  const journey = scope.run(() => useLearningJourney(user, authenticated, service, storage));
  try {
    await nextTick();
    journey.update(state => { state.writing_drafts.free = 'Private'; });
    journey.remember(1, 2, 'practice', 20);
    await journey.sync();
    assert.equal(remote.get(1).writing_drafts.free, 'Private');
    user.value = { id: 2 };
    await nextTick();
    assert.equal(journey.state.value.writing_drafts.free, undefined);
    user.value = { id: 1 };
    await nextTick();
    assert.equal(journey.state.value.writing_drafts.free, 'Private');
    assert.equal(journey.state.value.resume.content_id, 20);
  } finally { scope.stop(); }
});

test('failed synchronization keeps a dirty local draft for retry', async () => {
  const cache = new Map(); const user = ref({ id: 1 }); const authenticated = ref(true);
  let fail = true;
  const service = { getState: async () => createLearningState(), saveState: async () => { if (fail) throw new Error('Offline'); } };
  const scope = vue.effectScope();
  const journey = scope.run(() => useLearningJourney(user, authenticated, service, { getItem: key => cache.get(key), setItem: (key, value) => cache.set(key, value) }));
  try {
    await nextTick();
    journey.update(state => { state.writing_drafts.free = 'Offline draft'; });
    await journey.sync();
    assert.equal(JSON.parse(cache.get('lingoup:learning:1')).dirty, true);
    assert.ok(journey.error.value);
    fail = false; await journey.sync();
    assert.equal(JSON.parse(cache.get('lingoup:learning:1')).dirty, false);
  } finally { scope.stop(); }
});

test('editing while loading does not overwrite existing remote progress or preferences', async () => {
  const pending = deferred();
  const user = ref({ id: 1 }); const authenticated = ref(true);
  const scope = vue.effectScope();
  const journey = scope.run(() => useLearningJourney(user, authenticated, {
    getState: () => pending.promise, saveState: async () => {}
  }, { getItem: () => null, setItem() {} }));
  try {
    journey.update(state => { state.writing_drafts.free = 'New draft'; });
    pending.resolve({ ...createLearningState(), goal: 'work', lessons: { '8': { practiced: true, completed: true } } });
    await nextTick();
    await journey.sync();
    assert.equal(journey.state.value.goal, 'work');
    assert.equal(journey.state.value.lessons['8'].completed, true);
    assert.equal(journey.state.value.writing_drafts.free, 'New draft');
  } finally { scope.stop(); }
});

test('late remote state from another account is ignored', async () => {
  const pending = deferred();
  const user = ref({ id: 1 }); const authenticated = ref(true);
  const scope = vue.effectScope();
  const journey = scope.run(() => useLearningJourney(user, authenticated, {
    getState: () => user.value.id === 1 ? pending.promise : Promise.resolve(createLearningState()), saveState: async () => {}
  }, { getItem: () => null, setItem() {} }));
  try {
    user.value = { id: 2 };
    pending.resolve({ ...createLearningState(), writing_drafts: { free: 'Account 1 secret' } });
    await nextTick();
    assert.equal(journey.state.value.writing_drafts.free, undefined);
  } finally { scope.stop(); }
});
