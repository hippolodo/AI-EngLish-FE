<template>
  <div class="min-h-screen bg-[#eef0ff] flex items-center justify-center p-0 sm:p-4 font-sans app-backdrop">
    <!-- Centered Mobile Container -->
    <div class="w-full max-w-md mx-auto min-h-[100dvh] sm:min-h-[880px] sm:max-h-[920px] bg-[#fbfbff] shadow-2xl relative flex flex-col justify-between overflow-hidden sm:rounded-[32px] border border-white/70 app-shell">
      
      <!-- Top Mobile Status Bar (Cosmetic) -->
      <div class="bg-white/80 backdrop-blur-md px-5 pt-3 pb-3 flex items-center justify-between text-xs font-semibold text-gray-500 z-30 border-b border-gray-100/80">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white flex items-center justify-center shadow-md shadow-violet-200">
            <Sparkles class="w-4 h-4" />
          </div>
          <div class="leading-tight">
            <span class="block tracking-tight text-gray-900 font-black text-sm">lingo<span class="text-violet-600">up</span></span>
            <span class="hidden sm:block text-[10px] text-gray-400 font-medium">English, but make it fun</span>
          </div>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="mr-1 text-gray-500">{{ currentTime }}</span>
          <Signal class="w-3.5 h-3.5 text-gray-700" />
          <Wifi class="w-3.5 h-3.5 text-gray-700" />
          <div class="w-5 h-2.5 border border-gray-600 rounded-sm p-0.5 flex items-center">
            <div class="bg-gray-800 h-full w-full rounded-xs"></div>
          </div>
        </div>
      </div>

      <!-- Main Scrollable Screen Content Container -->
      <main class="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
        
        <!-- ========================================== -->
        <!-- SCREEN 1: HOME (DASHBOARD - REAL DATA)     -->
        <!-- ========================================== -->
        <HomeScreen />

        <!-- ========================================== -->
        <!-- SCREEN 2: SPEAKING (PRONUNCIATION REAL)    -->
        <!-- ========================================== -->
        <SpeakingScreen />

        <!-- ========================================== -->
        <!-- SCREEN 3: WRITING (AI ESSAY REAL)          -->
        <!-- ========================================== -->
        <WritingScreen />

        <!-- ========================================== -->
        <!-- SCREEN 4: CHAT (AI ROLEPLAY REAL)          -->
        <!-- ========================================== -->
        <ChatScreen />

        <!-- ========================================== -->
        <!-- SCREEN 5: STUDY (FLASHCARD & QUIZ REAL)    -->
        <!-- ========================================== -->
        <StudyScreen />

      </main>

      <!-- ========================================== -->
      <!-- STICKY BOTTOM NAVIGATION BAR (5 TABS)      -->
      <!-- ========================================== -->
      <nav class="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-3 py-2.5 z-40 shadow-[0_-8px_30px_rgba(44,35,94,0.08)]">
        <div class="flex items-center justify-around">
          <button
            @click="activeTab = 'home'"
            :class="activeTab === 'home' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'"
            class="flex flex-col items-center py-1.5 px-2 transition-all relative cursor-pointer"
          >
            <Home :class="activeTab === 'home' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform duration-200" />
            <span class="text-[10px] mt-1">Home</span>
            <span v-if="activeTab === 'home'" class="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          </button>

          <button
            @click="activeTab = 'speaking'"
            :class="activeTab === 'speaking' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'"
            class="flex flex-col items-center py-1.5 px-2 transition-all relative cursor-pointer"
          >
            <Mic :class="activeTab === 'speaking' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform duration-200" />
            <span class="text-[10px] mt-1">Speaking</span>
            <span v-if="activeTab === 'speaking'" class="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          </button>

          <button
            @click="activeTab = 'writing'"
            :class="activeTab === 'writing' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'"
            class="flex flex-col items-center py-1.5 px-2 transition-all relative cursor-pointer"
          >
            <PenTool :class="activeTab === 'writing' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform duration-200" />
            <span class="text-[10px] mt-1">Writing</span>
            <span v-if="activeTab === 'writing'" class="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          </button>

          <button
            @click="activeTab = 'chat'"
            :class="activeTab === 'chat' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'"
            class="flex flex-col items-center py-1.5 px-2 transition-all relative cursor-pointer"
          >
            <MessageSquare :class="activeTab === 'chat' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform duration-200" />
            <span class="text-[10px] mt-1">AI Chat</span>
            <span v-if="activeTab === 'chat'" class="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          </button>

          <button
            @click="activeTab = 'study'"
            :class="activeTab === 'study' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'"
            class="flex flex-col items-center py-1.5 px-2 transition-all relative cursor-pointer"
          >
            <BookOpen :class="activeTab === 'study' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform duration-200" />
            <span class="text-[10px] mt-1">Study</span>
            <span v-if="activeTab === 'study'" class="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          </button>
        </div>
      </nav>

      <ProfileModal
        :is-open="isProfileOpen"
        :user="userProfile"
        :dashboard="dashboard"
        :is-authenticated="isAuthenticated"
        @auth="isAuthOpen = true"
        @close="isProfileOpen = false"
        @profile-updated="onProfileUpdated"
        @logout="logout"
      />
      <AuthModal
        :is-open="isAuthOpen"
        @close="isAuthOpen = false"
        @auth-success="onAuthSuccess"
      />

    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, provide } from 'vue';
import HomeScreen from './views/HomeScreen.vue';
import SpeakingScreen from './views/SpeakingScreen.vue';
import WritingScreen from './views/WritingScreen.vue';
import ChatScreen from './views/ChatScreen.vue';
import StudyScreen from './views/StudyScreen.vue';
import {
  Signal, Wifi, Award, Flame, Bot, BookOpen, CheckCircle, ChevronRight,
  Sparkles, Volume2, Cpu, Lightbulb, Mic, Square, Loader2, ArrowRight,
  Copy, Check, RotateCcw, Send, Layers, HelpCircle,
  RotateCw, XCircle, AlertCircle, Home, PenTool, MessageSquare
} from 'lucide-vue-next';

// Real services
import { progressService } from './services/progressService';
import { curriculumService } from './services/curriculumService';
import { pronunciationService } from './services/pronunciationService';
import { writingService } from './services/writingService';
import { chatService } from './services/chatService';
import { studyService } from './services/studyService';
import { authService } from './services/authService';
import { AudioRecorder } from './services/audioRecorder';
import { getFullAudioUrl } from './services/api';
import ProfileModal from './components/ProfileModal.vue';
import AuthModal from './components/AuthModal.vue';



// Main Navigation Tab
const activeTab = ref('home');
const isProfileOpen = ref(false);
const isAuthOpen = ref(false);
const isAuthenticated = ref(authService.isAuthenticated());
const currentTime = ref('');

// User Profile
const userProfile = ref(authService.getUser());

const userAvatarUrl = computed(() => {
  const name = userProfile.value?.full_name || dashboard.value?.full_name || 'Learner';
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
});

const openAuthModal = () => {
  isProfileOpen.value = true;
};

const onProfileUpdated = (profile) => {
  userProfile.value = profile;
  isAuthenticated.value = authService.isAuthenticated();
};

const onAuthSuccess = async () => {
  userProfile.value = authService.getUser();
  isAuthenticated.value = authService.isAuthenticated();
  isAuthOpen.value = false;
  await loadHomeData();
};

const logout = () => {
  authService.logout();
  isAuthenticated.value = false;
  userProfile.value = null;
  dashboard.value = null;
  isProfileOpen.value = false;
  loadHomeData();
};

// ==========================================
// SCREEN 1: HOME (REAL DATA)
// ==========================================
const homeLoading = ref(true);
const dashboard = ref(null);
const topics = ref([]);

const totalPracticeCount = computed(() => {
  if (!dashboard.value) return 0;
  return (
    (dashboard.value.speaking?.total_sessions || 0) +
    (dashboard.value.writing?.total_essays || 0) +
    (dashboard.value.chat?.total_conversations || 0)
  );
});

const loadHomeData = async () => {
  homeLoading.value = true;
  try {
    const [dash, top] = await Promise.all([
      authService.isAuthenticated()
        ? progressService.getDashboard().catch(() => null)
        : Promise.resolve(null),
      curriculumService.getTopics().catch(() => [])
    ]);
    dashboard.value = dash;
    topics.value = top || [];

    // Pre-populate speaking topic if available
    if (topics.value.length > 0 && !speakingTopicId.value) {
      speakingTopicId.value = topics.value[0].id;
      await onSpeakingTopicChange();
    }
  } catch (err) {
    console.warn('Load home error:', err);
  } finally {
    homeLoading.value = false;
  }
};

const startTopic = async (topic) => {
  speakingTopicId.value = topic.id;
  await onSpeakingTopicChange();
  activeTab.value = 'speaking';
};

const getTopicColor = (level) => {
  if (level === 'Beginner') return 'bg-emerald-100 text-emerald-700';
  if (level === 'Intermediate') return 'bg-sky-100 text-sky-700';
  return 'bg-purple-100 text-purple-700';
};

const getTopicEmoji = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('greet') || t.includes('intro')) return '👋';
  if (t.includes('food') || t.includes('restaurant') || t.includes('drink')) return '🍽️';
  if (t.includes('travel') || t.includes('hotel')) return '✈️';
  if (t.includes('interview') || t.includes('career') || t.includes('job')) return '💼';
  if (t.includes('tech') || t.includes('ai') || t.includes('intelligence')) return '🤖';
  if (t.includes('climate') || t.includes('environment')) return '🌱';
  return '📚';
};

const getActivityBadgeClass = (type) => {
  if (type === 'SPEAKING') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (type === 'WRITING') return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
  return 'bg-purple-50 text-purple-700 border border-purple-200';
};

// ==========================================
// SCREEN 2: SPEAKING (PRONUNCIATION REAL)
// ==========================================
const isCustomSpeakingMode = ref(false);
const speakingTopicId = ref(null);
const speakingLessonId = ref(null);
const speakingLessons = ref([]);
const speakingLessonsLoading = ref(false);
const speakingLessonContents = ref([]);
const selectedSpeakingContentId = ref(null);
const currentSpeakingSentenceIndex = computed(() => Math.max(
  0,
  speakingLessonContents.value.findIndex(content => content.id === selectedSpeakingContentId.value)
));
let speakingTopicRequestId = 0;
let speakingLessonRequestId = 0;
const targetSpeakingText = ref('Hello, welcome to AI English Learning!');
const targetIpa = ref('');
const targetTranslation = ref('');
const nativeAudioUrl = ref('');

const isRecording = ref(false);
const isAnalyzingSpeaking = ref(false);
const speakingResult = ref(null);
const speakingError = ref('');
const recorder = new AudioRecorder();

const onSpeakingTopicChange = async () => {
  const requestId = ++speakingTopicRequestId;
  speakingLessonRequestId += 1;
  speakingLessons.value = [];
  speakingLessonId.value = null;
  speakingLessonContents.value = [];
  selectedSpeakingContentId.value = null;
  if (!isCustomSpeakingMode.value) targetSpeakingText.value = '';
  targetIpa.value = '';
  targetTranslation.value = '';
  nativeAudioUrl.value = '';
  if (!speakingTopicId.value) return;

  speakingLessonsLoading.value = true;
  try {
    const list = await curriculumService.getLessonsByTopic(speakingTopicId.value, 'SPEAKING');
    if (requestId !== speakingTopicRequestId) return;
    speakingLessons.value = list || [];
    if (speakingLessons.value.length > 0) {
      speakingLessonId.value = speakingLessons.value[0].id;
      await onSpeakingLessonChange();
    }
  } catch (err) {
    console.warn('Load lessons error:', err);
  } finally {
    if (requestId === speakingTopicRequestId) speakingLessonsLoading.value = false;
  }
};

const onSpeakingLessonChange = async () => {
  if (!speakingLessonId.value) return;
  const requestId = ++speakingLessonRequestId;
  speakingLessonContents.value = [];
  selectedSpeakingContentId.value = null;
  if (!isCustomSpeakingMode.value) targetSpeakingText.value = '';
  targetIpa.value = '';
  targetTranslation.value = '';
  nativeAudioUrl.value = '';
  try {
    const detail = await curriculumService.getLessonDetail(speakingLessonId.value);
    if (requestId !== speakingLessonRequestId) return;
    if (detail && detail.contents && detail.contents.length > 0) {
      speakingLessonContents.value = detail.contents;
      selectSpeakingSentence(detail.contents[0]);
    } else {
      speakingLessonContents.value = [];
      selectedSpeakingContentId.value = null;
      const currentL = speakingLessons.value.find(l => l.id === speakingLessonId.value);
      if (currentL && !isCustomSpeakingMode.value) {
        targetSpeakingText.value = currentL.title;
      }
      targetIpa.value = '';
      targetTranslation.value = '';
      nativeAudioUrl.value = '';
    }
  } catch (err) {
    console.warn('Lesson detail error:', err);
  }
};

const selectSpeakingSentence = (content) => {
  if (!content) return;
  selectedSpeakingContentId.value = content.id;
  if (!isCustomSpeakingMode.value) targetSpeakingText.value = content.target_text;
  targetIpa.value = content.ipa_guide || '';
  targetTranslation.value = content.hint_translation || '';
  nativeAudioUrl.value = content.audio_url || '';
  speakingResult.value = null;
  speakingError.value = '';
};

const navigateSpeakingSentence = (offset) => {
  const nextIndex = currentSpeakingSentenceIndex.value + offset;
  if (nextIndex < 0 || nextIndex >= speakingLessonContents.value.length) return;
  selectSpeakingSentence(speakingLessonContents.value[nextIndex]);
};

const playNativeAudio = () => {
  if (nativeAudioUrl.value) {
    const url = getFullAudioUrl(nativeAudioUrl.value);
    const a = new Audio(url);
    a.play().catch(() => speakText(targetSpeakingText.value));
  } else {
    speakText(targetSpeakingText.value);
  }
};

const toggleRecording = async () => {
  speakingError.value = '';
  if (isRecording.value) {
    await stopAndAnalyzeSpeaking();
  } else {
    try {
      await recorder.start();
      isRecording.value = true;
    } catch (err) {
      speakingError.value = 'Không thể mở micro: ' + err.message;
    }
  }
};

const stopAndAnalyzeSpeaking = async () => {
  try {
    const blob = await recorder.stop();
    isRecording.value = false;
    if (!blob) return;

    isAnalyzingSpeaking.value = true;
    const lessonId = !isCustomSpeakingMode.value ? speakingLessonId.value : null;
    const res = await pronunciationService.analyzePronunciation(
      blob,
      targetSpeakingText.value.trim(),
      lessonId
    );
    speakingResult.value = res;
  } catch (err) {
    speakingError.value = 'Chấm điểm thất bại: ' + (err.response?.data?.detail || err.message);
  } finally {
    isAnalyzingSpeaking.value = false;
  }
};

const getWordBg = (w) => {
  if (w.color) return w.color + '22';
  return w.status === 'CORRECT' ? '#22c55e22' : '#ef444422';
};

const getWordTextColor = (w) => {
  if (w.color) return w.color;
  return w.status === 'CORRECT' ? '#15803d' : '#b91c1c';
};

// ==========================================
// SCREEN 3: WRITING (AI ESSAY REAL)
// ==========================================
const essayInput = ref('');
const isEvaluating = ref(false);
const writingResult = ref(null);
const writingSubTab = ref('grammar');
const copied = ref(false);
const writingError = ref('');

const wordCount = computed(() => {
  if (!essayInput.value.trim()) return 0;
  return essayInput.value.trim().split(/\s+/).length;
});

const submitWritingEvaluation = async () => {
  if (!essayInput.value.trim()) return;
  isEvaluating.value = true;
  writingError.value = '';
  try {
    const res = await writingService.evaluateEssay(essayInput.value.trim());
    writingResult.value = res;
    writingSubTab.value = 'grammar';
  } catch (err) {
    writingError.value = 'Chấm bài thất bại: ' + (err.response?.data?.detail || err.message);
  } finally {
    isEvaluating.value = false;
  }
};

const copyRewritten = () => {
  if (!writingResult.value?.corrected_text) return;
  navigator.clipboard.writeText(writingResult.value.corrected_text);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1800);
};

// ==========================================
// SCREEN 4: CHAT (AI ROLEPLAY REAL)
// ==========================================
const chatScrollContainer = ref(null);
const scenarios = ref([]);
const chatScenarioId = ref('hotel_checkin');
const conversationId = ref(null);
const chatMessages = ref([]);
const chatInput = ref('');
const chatLoading = ref(false);
const isChatHistoryOpen = ref(false);
const chatHistoryLoading = ref(false);
const chatHistoryError = ref('');
const chatConversations = ref([]);
const isBotTyping = ref(false);
const isChatRecording = ref(false);
const chatRecorder = new AudioRecorder();

const currentChatScenario = computed(() => {
  return scenarios.value.find(s => s.id === chatScenarioId.value);
});

const loadChatConversations = async () => {
  chatHistoryLoading.value = true;
  chatHistoryError.value = '';
  try {
    chatConversations.value = await chatService.getConversations() || [];
  } catch (err) {
    chatHistoryError.value = err.response?.data?.detail || 'Không tải được lịch sử trò chuyện. Vui lòng thử lại.';
  } finally {
    chatHistoryLoading.value = false;
  }
};

const toggleChatHistory = async () => {
  isChatHistoryOpen.value = !isChatHistoryOpen.value;
  if (isChatHistoryOpen.value) await loadChatConversations();
};

const openChatConversation = async (conversation) => {
  chatLoading.value = true;
  chatHistoryError.value = '';
  try {
    const detail = await chatService.getConversationDetail(conversation.id);
    conversationId.value = detail.id;
    chatMessages.value = detail.messages || [];
    const scenario = scenarios.value.find(item => item.title === detail.scenario_title);
    if (scenario) chatScenarioId.value = scenario.id;
    isChatHistoryOpen.value = false;
    await scrollChatToBottom();
  } catch (err) {
    chatHistoryError.value = err.response?.data?.detail || 'Không mở được cuộc trò chuyện này. Vui lòng thử lại.';
  } finally {
    chatLoading.value = false;
  }
};

const loadChatScenarios = async () => {
  chatLoading.value = true;
  try {
    const list = await chatService.getScenarios();
    scenarios.value = list || [];
    if (scenarios.value.length > 0) {
      if (!scenarios.value.some(s => s.id === chatScenarioId.value)) {
        chatScenarioId.value = scenarios.value[0].id;
      }
      await startChatConversation();
    }
  } catch (err) {
    console.warn('Chat scenarios error:', err);
  } finally {
    chatLoading.value = false;
  }
};

const startChatConversation = async () => {
  if (!chatScenarioId.value) return;
  isBotTyping.value = false;
  try {
    const conv = await chatService.startConversation(chatScenarioId.value);
    conversationId.value = conv.id;
    chatMessages.value = conv.messages || [];
    await scrollChatToBottom();
  } catch (err) {
    console.warn('Start conversation error:', err);
  }
};

const switchChatScenario = async () => {
  await startChatConversation();
};

const resetChatConversation = async () => {
  await startChatConversation();
};

const scrollChatToBottom = async () => {
  await nextTick();
  if (chatScrollContainer.value) {
    chatScrollContainer.value.scrollTop = chatScrollContainer.value.scrollHeight;
  }
};

const sendChatText = async () => {
  const text = chatInput.value.trim();
  if (!text || isBotTyping.value || !conversationId.value) return;

  chatInput.value = '';
  chatMessages.value.push({
    sender: 'user',
    message_text: text
  });
  await scrollChatToBottom();

  isBotTyping.value = true;
  try {
    const reply = await chatService.sendMessage(conversationId.value, text);
    chatMessages.value.push(reply);
    await scrollChatToBottom();
  } catch (err) {
    console.warn('Send message error:', err);
  } finally {
    isBotTyping.value = false;
  }
};

const toggleChatVoice = async () => {
  if (isChatRecording.value) {
    try {
      const blob = await chatRecorder.stop();
      isChatRecording.value = false;
      if (!blob || !conversationId.value) return;

      isBotTyping.value = true;
      const turnResult = await chatService.sendVoiceMessage(conversationId.value, blob);
      if (turnResult) {
        if (turnResult.user_message) chatMessages.value.push(turnResult.user_message);
        if (turnResult.bot_message) chatMessages.value.push(turnResult.bot_message);
        await scrollChatToBottom();
      }
    } catch (err) {
      console.warn('Voice chat error:', err);
    } finally {
      isBotTyping.value = false;
      isChatRecording.value = false;
    }
  } else {
    try {
      await chatRecorder.start();
      isChatRecording.value = true;
    } catch (err) {
      alert('Không thể truy cập microphone: ' + err.message);
    }
  }
};

const speakBotMessage = (msg) => {
  const text = msg.message_text || msg.text || '';
  if (msg.audio_url) {
    const url = getFullAudioUrl(msg.audio_url);
    const a = new Audio(url);
    a.play().catch(() => speakText(text));
  } else {
    speakText(text);
  }
};

// ==========================================
// SCREEN 5: STUDY (FLASHCARD & QUIZ REAL)
// ==========================================
const studyMode = ref('flashcard');
const studyLoading = ref(false);
const currentStudyIndex = ref(0);
const isFlipped = ref(false);

// Flashcards
const flashcards = ref([]);
const currentCard = computed(() => flashcards.value[currentStudyIndex.value] || {});

// Quizzes
const quizzesList = ref([]);
const selectedQuizId = ref(null);
const quizQuestions = ref([]);
const currentQuestion = computed(() => quizQuestions.value[currentStudyIndex.value] || {});
const selectedQuizAnswer = ref(null);
const quizChecked = ref(false);
const isSubmittingQuiz = ref(false);
const submittedQuizDetail = ref(null);

const totalStudyItems = computed(() => {
  return studyMode.value === 'flashcard' ? flashcards.value.length : quizQuestions.value.length;
});

const switchStudyMode = async (mode) => {
  studyMode.value = mode;
  currentStudyIndex.value = 0;
  isFlipped.value = false;
  selectedQuizAnswer.value = null;
  quizChecked.value = false;
  submittedQuizDetail.value = null;

  if (mode === 'flashcard' && flashcards.value.length === 0) {
    await loadFlashcardsData();
  } else if (mode === 'quiz' && quizQuestions.value.length === 0) {
    await loadQuizzesData();
  }
};

const loadFlashcardsData = async () => {
  studyLoading.value = true;
  try {
    const list = await studyService.getCardsForReview();
    flashcards.value = list || [];
    currentStudyIndex.value = 0;
  } catch (err) {
    console.warn('Load flashcards error:', err);
  } finally {
    studyLoading.value = false;
  }
};

const submitCardReview = async (isRemembered) => {
  const card = currentCard.value;
  isFlipped.value = false;
  if (card && card.id) {
    try {
      await studyService.reviewCard(card.id, isRemembered);
    } catch (err) {
      console.warn('Card review error:', err);
    }
  }

  if (currentStudyIndex.value < flashcards.value.length - 1) {
    currentStudyIndex.value++;
  } else {
    currentStudyIndex.value = 0;
  }
};

const loadQuizzesData = async () => {
  studyLoading.value = true;
  try {
    const list = await studyService.getQuizzes();
    quizzesList.value = list || [];
    if (quizzesList.value.length > 0) {
      selectedQuizId.value = quizzesList.value[0].id;
      await onQuizChange();
    }
  } catch (err) {
    console.warn('Load quizzes error:', err);
  } finally {
    studyLoading.value = false;
  }
};

const onQuizChange = async () => {
  if (!selectedQuizId.value) return;
  studyLoading.value = true;
  selectedQuizAnswer.value = null;
  quizChecked.value = false;
  submittedQuizDetail.value = null;
  currentStudyIndex.value = 0;
  try {
    const detail = await studyService.getQuizDetail(selectedQuizId.value);
    if (detail && detail.questions) {
      quizQuestions.value = detail.questions;
    }
  } catch (err) {
    console.warn('Quiz detail error:', err);
  } finally {
    studyLoading.value = false;
  }
};

const selectQuizAnswer = (ans) => {
  if (quizChecked.value) return;
  selectedQuizAnswer.value = ans;
};

const checkQuizAnswer = async () => {
  if (!selectedQuizAnswer.value || !currentQuestion.value || !selectedQuizId.value) return;
  isSubmittingQuiz.value = true;
  try {
    const payload = [
      {
        question_id: currentQuestion.value.id,
        selected_answer_id: selectedQuizAnswer.value.id
      }
    ];
    const res = await studyService.submitQuiz(selectedQuizId.value, payload);
    if (res && res.details && res.details.length > 0) {
      submittedQuizDetail.value = res.details[0];
    }
    quizChecked.value = true;
  } catch (err) {
    quizChecked.value = true;
    submittedQuizDetail.value = {
      is_correct: false,
      explanation: err.response?.data?.detail || err.message
    };
  } finally {
    isSubmittingQuiz.value = false;
  }
};

const nextQuizQuestion = () => {
  selectedQuizAnswer.value = null;
  quizChecked.value = false;
  submittedQuizDetail.value = null;
  if (currentStudyIndex.value < quizQuestions.value.length - 1) {
    currentStudyIndex.value++;
  } else {
    currentStudyIndex.value = 0;
  }
};

const getQuizAnswerClass = (ans) => {
  if (!quizChecked.value) {
    return selectedQuizAnswer.value?.id === ans.id
      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-800';
  }
  if (selectedQuizAnswer.value?.id === ans.id) {
    return submittedQuizDetail.value?.is_correct
      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
      : 'border-rose-500 bg-rose-50 text-rose-900';
  }
  return 'border-gray-200 bg-white text-gray-400 opacity-60';
};

// ==========================================
// UTILITIES
// ==========================================
const speakText = (text) => {
  if (!text) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }
};

const updateClock = () => {
  const d = new Date();
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  currentTime.value = `${h}:${m}`;
};

let clockInterval = null;

provide('screenContext', { activeTab, chatConversations, chatHistoryError, chatHistoryLoading, chatInput, chatLoading, chatMessages, chatRecorder, chatScenarioId, chatScrollContainer, checkQuizAnswer, clockInterval, conversationId, copied, copyRewritten, currentCard, currentChatScenario, currentQuestion, currentSpeakingSentenceIndex, currentStudyIndex, currentTime, dashboard, essayInput, flashcards, getActivityBadgeClass, getQuizAnswerClass, getTopicColor, getTopicEmoji, getWordBg, getWordTextColor, homeLoading, isAnalyzingSpeaking, isAuthOpen, isAuthenticated, isBotTyping, isChatHistoryOpen, isChatRecording, isCustomSpeakingMode, isEvaluating, isFlipped, isProfileOpen, isRecording, isSubmittingQuiz, loadChatConversations, loadChatScenarios, loadFlashcardsData, loadHomeData, loadQuizzesData, logout, nativeAudioUrl, navigateSpeakingSentence, nextQuizQuestion, onAuthSuccess, onProfileUpdated, onQuizChange, onSpeakingLessonChange, onSpeakingTopicChange, openAuthModal, openChatConversation, playNativeAudio, quizChecked, quizQuestions, quizzesList, recorder, resetChatConversation, scenarios, scrollChatToBottom, selectQuizAnswer, selectSpeakingSentence, selectedQuizAnswer, selectedQuizId, selectedSpeakingContentId, sendChatText, speakBotMessage, speakText, speakingError, speakingLessonContents, speakingLessonId, speakingLessons, speakingLessonsLoading, speakingResult, speakingTopicId, startChatConversation, startTopic, stopAndAnalyzeSpeaking, studyLoading, studyMode, submitCardReview, submitWritingEvaluation, submittedQuizDetail, switchChatScenario, switchStudyMode, targetIpa, targetSpeakingText, targetTranslation, toggleChatHistory, toggleChatVoice, toggleRecording, topics, totalPracticeCount, totalStudyItems, updateClock, userAvatarUrl, userProfile, wordCount, writingError, writingResult, writingSubTab });

onMounted(async () => {
  updateClock();
  clockInterval = setInterval(updateClock, 30000);
  await loadHomeData();
  await loadChatScenarios();
  await loadFlashcardsData();
});

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval);
  recorder.cleanup();
  chatRecorder.cleanup();
});
</script>

