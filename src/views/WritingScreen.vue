<template>
  <div v-if="activeTab === 'writing' && isAuthenticated" class="space-y-6 pb-28 w-full max-w-6xl mx-auto">
    <!-- Top Back Button (Only visible when navigated from a lesson or another screen) -->
    <div v-if="hasHistory">
      <AnimateButton
        variant="outline"
        size="sm"
        @click="goBack"
        class="group"
      >
        <template #prefix>
          <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </template>
        <span>{{ ctx.currentLesson.value ? 'Back to Lesson' : 'Back' }}</span>
      </AnimateButton>
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs uppercase tracking-wide font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5"><Sparkles class="w-3.5 h-3.5 text-blue-500" /> Writing Assistant</span>
        <h1 class="text-gray-900 mt-1.5 text-2xl sm:text-3xl font-extrabold leading-snug">{{ ctx.currentLesson.value?.type === 'WRITING' ? 'Guided Writing' : 'Free Writing Practice' }}</h1>
      </div>
    </div>

    <!-- Input Area -->
    <div v-if="ctx.currentLesson.value?.type === 'WRITING'" class="space-y-3 rounded-2xl bg-indigo-50/80 p-5 sm:p-6 text-sm sm:text-base text-indigo-950 border border-indigo-100">
      <div class="flex items-start justify-between gap-3"><h2 class="text-lg font-bold">{{ ctx.currentLesson.value.title }}</h2><button @click="ctx.openWritingTaskPicker" :disabled="isEvaluating" class="shrink-0 rounded-xl bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-indigo-700 shadow-2xs disabled:opacity-50 cursor-pointer">Change Prompt</button></div>
      <div v-for="content in ctx.lessonDetail.value?.contents || []" :key="content.id" class="space-y-2.5">
        <p class="pt-1 font-bold">Writing Prompt</p><p class="reading-text whitespace-pre-line text-base sm:text-lg leading-relaxed text-slate-900">{{ content.target_text }}</p>
        <details v-if="content.hint_translation"><summary class="cursor-pointer text-xs sm:text-sm font-semibold text-indigo-700">View Vietnamese Translation</summary><p class="mt-2 whitespace-pre-line text-slate-600 text-sm sm:text-base">{{ content.hint_translation }}</p></details>
        <div v-if="content.task_guidance" class="rounded-xl bg-white/80 p-4 border border-indigo-100"><p class="mb-1 font-bold text-indigo-900">Writing Guidance</p><p class="whitespace-pre-line text-indigo-800 text-sm sm:text-base leading-relaxed">{{ content.task_guidance }}</p></div>
        <details v-if="content.sample_text" class="rounded-xl bg-white/90 p-4 border border-indigo-100">
          <summary class="cursor-pointer font-bold text-indigo-900">View Sample Reference</summary>
          <p class="mt-2 text-xs sm:text-sm text-slate-500">Reference idea development; write in your own words.</p>
          <p class="reading-text mt-2 whitespace-pre-line text-slate-800 text-sm sm:text-base leading-relaxed">{{ content.sample_text }}</p>
        </details>
      </div>
      <p class="text-blue-700 font-medium text-xs sm:text-sm">Draft your response, inspect feedback, then revise and resubmit. Drafts are auto-saved.</p>
    </div>
    <div v-else class="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6 text-sm sm:text-base text-blue-950">
      <p class="max-w-xl text-slate-700 leading-relaxed font-normal">Write paragraphs, emails, or essays. The system analyzes grammar, vocabulary, and provides suggestions to raise your score.</p>
      <button @click="ctx.openWritingTaskPicker" :disabled="isEvaluating" :aria-expanded="ctx.writingPickerOpen.value" aria-controls="writing-task-picker" class="mt-3.5 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-sm sm:text-base text-white transition hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer">Select Prompt from Topics →</button>
    </div>
    <section v-if="ctx.writingPickerOpen.value" id="writing-task-picker" aria-labelledby="writing-picker-title" class="space-y-4 rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-sky-50/60 p-5 sm:p-6 shadow-2xs">
      <div class="flex items-center justify-between gap-3"><h2 id="writing-picker-title" class="text-lg font-bold text-blue-950">Select Writing Prompt</h2><button @click="ctx.writingPickerOpen.value = false" class="rounded-xl bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 cursor-pointer shadow-2xs">Close</button></div>
      <p v-if="ctx.writingPickerLoading.value" role="status" class="flex items-center gap-2 py-3 text-sm sm:text-base text-blue-700"><Loader2 class="h-5 w-5 animate-spin" />Loading prompts…</p>
      <div v-else-if="ctx.writingPickerError.value" role="alert" class="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{{ ctx.writingPickerError.value }} <button @click="ctx.loadWritingTasks" class="font-semibold underline">Retry</button></div>
      <template v-else>
        <label class="block space-y-2 text-sm sm:text-base font-semibold text-slate-800"><span>Topics with writing prompts</span><select v-model="ctx.writingPickerTopicId.value" class="w-full rounded-xl border border-blue-200 bg-white p-3.5 text-sm sm:text-base text-slate-800"><option :value="null">All topics with writing prompts</option><option v-for="topic in ctx.writingPickerTopics.value" :key="topic.id" :value="topic.id">{{ topic.title }}</option></select></label>
        <div class="space-y-2.5">
          <button v-for="lesson in ctx.writingPickerLessons.value" :key="lesson.id" @click="ctx.openWritingLesson(lesson)" :disabled="isEvaluating" class="flex w-full items-center gap-3.5 rounded-2xl border border-blue-100 bg-white p-4 sm:p-5 text-left shadow-2xs transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 cursor-pointer"><span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><PenLine class="h-5 w-5" aria-hidden="true" /></span><span class="min-w-0 flex-1"><span class="block text-sm sm:text-base font-bold text-slate-900">{{ lesson.title }}</span><span class="mt-1 block text-xs sm:text-sm text-slate-500">{{ ctx.writingPickerTopics.value.find(topic => topic.id === lesson.topic_id)?.title }}</span></span><ArrowRight class="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" /></button>
        </div>
        <p v-if="!ctx.writingPickerLessons.value.length" class="rounded-2xl bg-white p-5 text-sm text-slate-600">No writing prompts in this topic yet. Please choose another topic.</p>
      </template>
    </section>
    <div class="space-y-4">
      <div class="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-xs relative focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent">
        <textarea
          v-model="essayInput" :readonly="isEvaluating" maxlength="10000"
          rows="8"
          class="w-full text-base sm:text-lg text-gray-900 placeholder-gray-400 bg-transparent resize-none focus:outline-none leading-relaxed"
          :placeholder="ctx.currentLesson.value?.type === 'WRITING' ? 'Write your essay in English following the instructions above…' : 'Type your paragraph, email, or essay in English…'"
        ></textarea>
        <div class="flex justify-between items-center pt-3 border-t border-gray-100 text-xs sm:text-sm text-gray-500">
          <span>{{ wordCount }} words · {{ essayInput.length }} chars</span>
          <span class="text-indigo-600 font-bold">{{ isAuthenticated ? 'Draft auto-saved' : 'Sign in to save draft' }}</span>
        </div>
      </div>

      <!-- Error message if any -->
      <div v-if="writingError" class="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm sm:text-base text-rose-700 font-medium">
        ⚠️ {{ writingError }}
      </div>

      <!-- Evaluate Button -->
      <button
        @click="submitWritingEvaluation"
        :disabled="isEvaluating || !essayInput.trim()"
        class="btn-spring w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 text-white rounded-2xl text-base font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
      >
        <Sparkles v-if="!isEvaluating" class="w-5 h-5" />
        <Loader2 v-else class="w-5 h-5 animate-spin" />
        <span>{{ isEvaluating ? 'Evaluating writing…' : 'Get Feedback & Suggestions' }}</span>
      </button>
    </div>

    <!-- Real Results Dashboard -->
    <div v-if="writingResult" class="space-y-5 pt-2 border-t border-gray-200/70">
      <p class="text-xs sm:text-sm text-slate-500">{{ writingResult.assessment_method === 'rules' ? 'Basic rule-based check result.' : 'Evaluation result is for reference to improve writing skills.' }}</p>
      <div v-if="writingResult.task_feedback" role="status" class="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-5 text-sm sm:text-base text-indigo-950 leading-relaxed"><p class="mb-1 font-bold text-indigo-900">General Feedback</p><p>{{ writingResult.task_feedback }}</p></div>
      <p v-if="ctx.currentLesson.value?.type === 'WRITING' && ctx.lessonProgress.value.writing_previous_score != null && writingResult.overall_score != null" class="text-sm font-semibold text-indigo-700">Previous: {{ ctx.lessonProgress.value.writing_previous_score }}/100 · Current: {{ ctx.lessonProgress.value.writing_score }}/100. Review feedback to compare fixed errors.</p>
      <div class="flex gap-4 text-sm sm:text-base font-bold text-indigo-600">
        <button @click="ctx.openSaveWord('', essayInput)" class="hover:underline cursor-pointer">Save Words</button>
        <button v-if="ctx.currentLesson.value?.type === 'WRITING'" @click="ctx.finishLesson" class="hover:underline cursor-pointer">Complete &amp; Summary →</button>
      </div>
      <!-- Score Card -->
      <div v-if="writingResult.overall_score != null" class="bg-gradient-to-r from-gray-900 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-lg flex items-center justify-between">
        <div>
          <p class="text-xs sm:text-sm font-bold text-indigo-300 uppercase tracking-wide">Overall Score</p>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-4xl sm:text-5xl font-black text-white"><AnimateCountingNumber :number="writingResult.overall_score" /></span>
            <span class="text-base text-gray-400">/ 100</span>
          </div>
        </div>
        <div class="text-right">
          <span v-if="writingResult.task_type === 'ielts_task2' && writingResult.estimated_band" class="inline-block px-4 py-1.5 rounded-full text-sm sm:text-base font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            Estimated IELTS Band {{ writingResult.estimated_band }}
          </span>
          <p class="text-xs sm:text-sm text-gray-400 mt-1.5 font-medium">
            {{ (writingResult.errors || []).length }} issues to revise
          </p>
        </div>
      </div>

      <!-- Sub Tabs -->
      <div class="flex bg-gray-200/70 p-1 rounded-xl text-sm font-semibold text-gray-600">
        <button
          @click="writingSubTab = 'grammar'"
          :class="writingSubTab === 'grammar' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-gray-900'"
          class="flex-1 py-2 rounded-lg transition text-center flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Grammar &amp; Style</span>
          <span class="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-xs">
            {{ (writingResult.errors || []).length }}
          </span>
        </button>
        <button
          @click="writingSubTab = 'vocab'"
          :class="writingSubTab === 'vocab' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-gray-900'"
          class="flex-1 py-2 rounded-lg transition text-center cursor-pointer"
        >
          Vocabulary
        </button>
        <button
          @click="writingSubTab = 'rewrite'"
          :class="writingSubTab === 'rewrite' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-gray-900'"
          class="flex-1 py-2 rounded-lg transition text-center cursor-pointer"
        >
          Rewritten Version
        </button>
      </div>

            <!-- Subview 1: Grammar Errors (Real) -->
            <div v-if="writingSubTab === 'grammar'" class="space-y-3">
              <div v-if="!writingResult.errors || writingResult.errors.length === 0" class="p-6 bg-white rounded-2xl border border-gray-100 text-center text-sm text-emerald-600 font-semibold">
                No grammar errors detected. Review suggestions and phrasing.
              </div>

              <div
                v-for="(err, idx) in writingResult.errors"
                :key="idx"
                class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2"
              >
                <div class="flex items-center justify-between text-sm">
                  <span class="font-semibold text-gray-600">Issue #{{ idx + 1 }} • {{ err.error_type || 'Syntax Error' }}</span>
                  <span class="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-600">Fix</span>
                </div>
                <div class="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between text-sm gap-2">
                  <span class="text-rose-500 line-through font-medium">{{ err.original_fragment }}</span>
                  <ArrowRight class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span class="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {{ err.corrected_fragment }}
                  </span>
                </div>
                <div class="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
                  <strong class="text-amber-950">Explanation:</strong> {{ err.explanation }}
                </div>
              </div>
            </div>

            <!-- Subview 2: Vocab Upgrades (Real) -->
            <div v-if="writingSubTab === 'vocab'" class="space-y-3">
              <div v-if="!writingResult.vocabulary_suggestions || writingResult.vocabulary_suggestions.length === 0" class="p-6 bg-white rounded-2xl border border-gray-100 text-center text-sm text-gray-500">
                No additional vocabulary suggestions.
              </div>

              <div
                v-for="(vocab, idx) in writingResult.vocabulary_suggestions"
                :key="idx"
                class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs text-sm space-y-1"
              >
                <div class="flex items-center gap-1.5 text-indigo-700 font-semibold">
                  <Sparkles class="w-3.5 h-3.5 text-indigo-500" />
                  <span>Suggestion #{{ idx + 1 }}:</span>
                </div>
                <p class="text-gray-700 leading-relaxed">{{ vocab }}</p>
              </div>
            </div>

            <!-- Subview 3: Rewritten Essay (Real) -->
            <div v-if="writingSubTab === 'rewrite'" class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                  <Sparkles class="w-4 h-4 text-indigo-600" />
                  Suggested Rewrite
                </span>
                <button @click="copyRewritten" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer">
                  <Check v-if="copied" class="w-3 h-3" />
                  <Copy v-else class="w-3 h-3" />
                  <span>{{ copied ? 'Copied!' : 'Copy' }}</span>
                </button>
              </div>
              <div class="reading-text p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 leading-relaxed font-normal whitespace-pre-line">
                {{ writingResult.corrected_text }}
              </div>
            </div>
          </div>
        </div>
</template>

<script setup>
import { ArrowLeft, ArrowRight, Check, Copy, Loader2, Sparkles, PenLine } from 'lucide-vue-next';
import AnimateButton from '../components/ui/Button.vue';
import AnimateCard from '../components/ui/Card.vue';
import AnimateBadge from '../components/ui/Badge.vue';
import AnimateCountingNumber from '../components/ui/CountingNumber.vue';
import { inject } from 'vue';
const ctx = inject('screenContext');
const goBack = ctx.goBack;
const hasHistory = ctx.hasHistory;
const activeTab = ctx.activeTab;
const chatInput = ctx.chatInput;
const chatLoading = ctx.chatLoading;
const chatMessages = ctx.chatMessages;
const chatRecorder = ctx.chatRecorder;
const chatScenarioId = ctx.chatScenarioId;
const chatScrollContainer = ctx.chatScrollContainer;
const checkQuizAnswer = ctx.checkQuizAnswer;
const clockInterval = ctx.clockInterval;
const conversationId = ctx.conversationId;
const copied = ctx.copied;
const copyRewritten = ctx.copyRewritten;
const currentCard = ctx.currentCard;
const currentChatScenario = ctx.currentChatScenario;
const currentQuestion = ctx.currentQuestion;
const currentStudyIndex = ctx.currentStudyIndex;
const currentTime = ctx.currentTime;
const dashboard = ctx.dashboard;
const essayInput = ctx.essayInput;
const flashcards = ctx.flashcards;
const getActivityBadgeClass = ctx.getActivityBadgeClass;
const getQuizAnswerClass = ctx.getQuizAnswerClass;
const getTopicColor = ctx.getTopicColor;
const getTopicEmoji = ctx.getTopicEmoji;
const getWordBg = ctx.getWordBg;
const getWordTextColor = ctx.getWordTextColor;
const homeLoading = ctx.homeLoading;
const isAnalyzingSpeaking = ctx.isAnalyzingSpeaking;
const isAuthOpen = ctx.isAuthOpen;
const isAuthenticated = ctx.isAuthenticated;
const isBotTyping = ctx.isBotTyping;
const isChatRecording = ctx.isChatRecording;
const isCustomSpeakingMode = ctx.isCustomSpeakingMode;
const isEvaluating = ctx.isEvaluating;
const isFlipped = ctx.isFlipped;
const isProfileOpen = ctx.isProfileOpen;
const isRecording = ctx.isRecording;
const isSubmittingQuiz = ctx.isSubmittingQuiz;
const loadChatScenarios = ctx.loadChatScenarios;
const loadFlashcardsData = ctx.loadFlashcardsData;
const loadHomeData = ctx.loadHomeData;
const loadQuizzesData = ctx.loadQuizzesData;
const logout = ctx.logout;
const nativeAudioUrl = ctx.nativeAudioUrl;
const nextQuizQuestion = ctx.nextQuizQuestion;
const onAuthSuccess = ctx.onAuthSuccess;
const onProfileUpdated = ctx.onProfileUpdated;
const onQuizChange = ctx.onQuizChange;
const onSpeakingLessonChange = ctx.onSpeakingLessonChange;
const onSpeakingTopicChange = ctx.onSpeakingTopicChange;
const openAuthModal = ctx.openAuthModal;
const playNativeAudio = ctx.playNativeAudio;
const quizChecked = ctx.quizChecked;
const quizQuestions = ctx.quizQuestions;
const quizzesList = ctx.quizzesList;
const recorder = ctx.recorder;
const resetChatConversation = ctx.resetChatConversation;
const scenarios = ctx.scenarios;
const scrollChatToBottom = ctx.scrollChatToBottom;
const selectQuizAnswer = ctx.selectQuizAnswer;
const selectedQuizAnswer = ctx.selectedQuizAnswer;
const selectedQuizId = ctx.selectedQuizId;
const sendChatText = ctx.sendChatText;
const speakBotMessage = ctx.speakBotMessage;
const speakText = ctx.speakText;
const speakingError = ctx.speakingError;
const speakingLessonId = ctx.speakingLessonId;
const speakingLessons = ctx.speakingLessons;
const speakingResult = ctx.speakingResult;
const speakingTopicId = ctx.speakingTopicId;
const startChatConversation = ctx.startChatConversation;
const startTopic = ctx.startTopic;
const stopAndAnalyzeSpeaking = ctx.stopAndAnalyzeSpeaking;
const studyLoading = ctx.studyLoading;
const studyMode = ctx.studyMode;
const submitWritingEvaluation = ctx.submitWritingEvaluation;
const submittedQuizDetail = ctx.submittedQuizDetail;
const switchChatScenario = ctx.switchChatScenario;
const switchStudyMode = ctx.switchStudyMode;
const targetIpa = ctx.targetIpa;
const targetSpeakingText = ctx.targetSpeakingText;
const targetTranslation = ctx.targetTranslation;
const toggleChatVoice = ctx.toggleChatVoice;
const toggleRecording = ctx.toggleRecording;
const topics = ctx.topics;
const totalPracticeCount = ctx.totalPracticeCount;
const totalStudyItems = ctx.totalStudyItems;
const updateClock = ctx.updateClock;
const userAvatarUrl = ctx.userAvatarUrl;
const userProfile = ctx.userProfile;
const wordCount = ctx.wordCount;
const writingError = ctx.writingError;
const writingResult = ctx.writingResult;
const writingSubTab = ctx.writingSubTab;
</script>
