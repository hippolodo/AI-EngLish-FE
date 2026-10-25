<template>
  <!-- 1. FULL-SCREEN DEDICATED AUTH SCREEN (Màn hình đăng nhập / đăng ký riêng biệt) -->
  <div
    v-if="activeTab === 'auth'"
    class="min-h-screen w-full bg-[#f8fafc] font-sans text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-800 flex flex-col justify-center items-center py-6 sm:py-10 px-4 sm:px-6"
  >
    <AuthScreen />
  </div>

  <!-- 2. GIAO DIỆN CHÍNH CỦA ỨNG DỤNG (SIDEBAR + HEADER + MAIN CONTENT) -->
  <div
    v-else
    class="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row font-sans text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-800"
  >
    
    <!-- DESKTOP / TABLET SIDEBAR NAVIGATION (Sticky on Left) -->
    <aside class="hidden lg:flex w-72 xl:w-80 border-r border-gray-100 flex-col justify-between py-7 px-5 bg-white select-none shrink-0 min-h-screen sticky top-0 h-screen z-30">
      <div class="flex flex-col">
        <!-- Logo -->
        <div class="px-2 mb-8 flex items-center justify-between cursor-pointer" @click="navigateSidebar('home')">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6L20 18L12 30" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"></path>
                <path d="M20 10L26 18L20 26" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"></path>
              </svg>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-xl font-black tracking-tight text-slate-900">LingoUp</span>
              <span class="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">AI</span>
            </div>
          </div>

          <!-- Streak Badge in Desktop Sidebar -->
          <div v-if="dashboard?.streak !== undefined" class="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-full text-xs font-bold text-amber-800 shadow-2xs" title="Daily Study Streak">
            <span>🔥</span>
            <span><AnimateCountingNumber :number="dashboard?.streak || 0" /></span>
          </div>
        </div>

        <!-- Main Navigation Menu -->
        <nav aria-label="Main Navigation" class="space-y-1.5">
          <button
            @click="navigateSidebar('home')"
            :class="activeTab === 'home' ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-semibold'"
            class="btn-spring relative w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] transition-all duration-200 cursor-pointer text-left overflow-hidden"
          >
            <LayoutGrid class="w-5 h-5 shrink-0" :class="activeTab === 'home' ? 'text-white' : 'text-slate-500'" />
            <span>Home</span>
          </button>

          <button
            @click="navigateSidebar('lesson')"
            :class="activeTab === 'lesson' ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-semibold'"
            class="btn-spring relative w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] transition-all duration-200 cursor-pointer text-left overflow-hidden"
          >
            <GraduationCap class="w-5 h-5 shrink-0" :class="activeTab === 'lesson' ? 'text-white' : 'text-slate-500'" />
            <span>Lessons</span>
          </button>

          <button
            @click="navigateSidebar('dictionary')"
            :class="activeTab === 'dictionary' ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-semibold'"
            class="btn-spring relative w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] transition-all duration-200 cursor-pointer text-left overflow-hidden"
          >
            <BookA class="w-5 h-5 shrink-0" :class="activeTab === 'dictionary' ? 'text-white' : 'text-slate-500'" />
            <span>Dictionary</span>
          </button>

          <button
            @click="navigateSidebar('profile')"
            :class="activeTab === 'profile' ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-semibold'"
            class="btn-spring relative w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] transition-all duration-200 cursor-pointer text-left overflow-hidden"
          >
            <TrendingUp class="w-5 h-5 shrink-0" :class="activeTab === 'profile' ? 'text-white' : 'text-slate-500'" />
            <span>Progress</span>
          </button>
        </nav>
      </div>

      <!-- Sidebar Footer (Account) -->
      <div class="pt-4 border-t border-slate-100 space-y-2">
        <button
          @click="openAuthOrProfile"
          class="btn-spring w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-100/80 transition-all cursor-pointer text-left border border-slate-200/60 bg-slate-50/70"
          :class="activeTab === (isAuthenticated ? 'profile' : 'auth') ? 'ring-2 ring-indigo-500/30 border-indigo-300 bg-indigo-50/50' : ''"
        >
          <img :src="userAvatarUrl" alt="" class="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-2xs shrink-0" />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-900 truncate">{{ isAuthenticated ? (userProfile?.full_name || 'Account') : 'Sign In / Register' }}</p>
            <p class="text-xs text-slate-500 truncate">{{ isAuthenticated ? (userProfile?.email || 'Learner') : 'Tap to start learning' }}</p>
          </div>
          <ChevronRight class="w-4 h-4 text-slate-400 shrink-0" />
        </button>
      </div>
    </aside>

    <!-- MAIN RIGHT CONTENT COLUMN -->
    <div class="flex-1 flex flex-col min-w-0 min-h-screen">
      
      <!-- MOBILE-ONLY APP BAR (lg:hidden - On Desktop there is NO top header, exactly like TalkPal) -->
      <header class="lg:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-2xs">
        <!-- Mobile Brand Logo -->
        <div class="flex items-center gap-2 cursor-pointer" @click="navigateSidebar('home')">
          <svg class="w-7 h-7 text-[#2e5bff] shrink-0" fill="none" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6L20 18L12 30" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4.5"></path>
            <path d="M20 10L26 18L20 26" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4.5"></path>
          </svg>
          <span class="text-lg font-bold tracking-tight text-slate-900">LingoUp</span>
        </div>

        <!-- Mobile Right: Streak & Profile -->
        <div class="flex items-center gap-2.5 shrink-0">
          <div class="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-bold text-amber-700">
            <span>🔥</span>
            <span>{{ dashboard?.streak || 0 }} days</span>
          </div>

          <button
            @click="openAuthOrProfile"
            class="flex items-center p-1 rounded-full border border-slate-200 bg-white shadow-2xs cursor-pointer"
          >
            <img :src="userAvatarUrl" alt="" class="w-7 h-7 rounded-full object-cover" />
          </button>
        </div>
      </header>

      <!-- Active Lesson Alert for Mobile -->
      <div v-if="currentLesson && activeTab !== 'home' && activeTab !== 'lesson' && activeTab !== 'profile' && activeTab !== 'auth'" class="sm:hidden mx-4 mt-3 flex items-center justify-between gap-2 p-3 bg-violet-50 border border-violet-200 rounded-2xl text-xs font-semibold">
        <button @click="activeTab = 'lesson'" class="font-bold text-violet-800 truncate">
          Current Lesson: {{ currentLesson.title }}
        </button>
        <button @click="leaveLesson" class="text-slate-500 font-bold px-2 py-0.5 rounded hover:bg-violet-100">✕</button>
      </div>

      <!-- MAIN PAGE CONTENT (Max width 1540px, generous padding, spacious) -->
      <main class="flex-1 w-full max-w-[1540px] mx-auto px-6 sm:px-8 lg:px-12 py-8 pb-24 lg:pb-12">

        <HomeScreen />
        <ProfileScreen />
        <LessonScreen />
        <SpeakingScreen />
        <WritingScreen />
        <ChatScreen />
        <FlashcardScreen />
        <QuizScreen />
        <DictionaryScreen />
      </main>

      <!-- MOBILE BOTTOM NAVIGATION BAR (lg:hidden) -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 z-40 shadow-[0_-8px_30px_rgba(44,35,94,0.08)]">
        <div class="flex items-center justify-around">
          <button
            @click="navigateSidebar('home')"
            :class="activeTab === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-400 font-medium'"
            class="flex flex-col items-center py-1 px-2 text-xs transition cursor-pointer"
          >
            <Home :class="activeTab === 'home' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform" />
            <span class="mt-1">Home</span>
          </button>

          <button
            @click="navigateSidebar('lesson')"
            :class="activeTab === 'lesson' ? 'text-indigo-600 font-bold' : 'text-slate-400 font-medium'"
            class="flex flex-col items-center py-1 px-2 text-xs transition cursor-pointer"
          >
            <GraduationCap :class="activeTab === 'lesson' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform" />
            <span class="mt-1">Lessons</span>
          </button>

          <button
            @click="navigateSidebar('dictionary')"
            :class="activeTab === 'dictionary' ? 'text-indigo-600 font-bold' : 'text-slate-400 font-medium'"
            class="flex flex-col items-center py-1 px-2 text-xs transition cursor-pointer"
          >
            <BookA :class="activeTab === 'dictionary' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform" />
            <span class="mt-1">Dictionary</span>
          </button>

          <button
            @click="navigateSidebar('profile')"
            :class="activeTab === 'profile' ? 'text-indigo-600 font-bold' : 'text-slate-400 font-medium'"
            class="flex flex-col items-center py-1 px-2 text-xs transition cursor-pointer"
          >
            <TrendingUp :class="activeTab === 'profile' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform" />
            <span class="mt-1">Progress</span>
          </button>
        </div>
      </nav>

    </div>
  </div>

  <!-- GLOBAL MODALS -->
  <AuthModal
    :is-open="isAuthOpen"
    @close="isAuthOpen = false"
    @auth-success="onAuthSuccess"
  />
  <OnboardingSurveyModal
    :is-open="isOnboardingOpen"
    @close="isOnboardingOpen = false"
    @completed="onOnboardingCompleted"
  />
  <SaveWordModal :is-open="saveWordOpen" :initial-word="wordToSave" :example="wordExample" :initial-meaning="wordMeaning" :initial-ipa="wordIpa" @close="saveWordOpen = false" @saved="onWordSaved" />
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, provide } from 'vue';
import AnimateCountingNumber from './components/ui/CountingNumber.vue';
import AnimateBadge from './components/ui/Badge.vue';
import LessonScreen from './views/LessonScreen.vue';
import SaveWordModal from './components/SaveWordModal.vue';
import { learningService } from './services/learningService';
import { useLearningJourney } from './composables/useLearningJourney';
import HomeScreen from './views/HomeScreen.vue';
import SpeakingScreen from './views/SpeakingScreen.vue';
import WritingScreen from './views/WritingScreen.vue';
import ChatScreen from './views/ChatScreen.vue';
import FlashcardScreen from './views/FlashcardScreen.vue';
import QuizScreen from './views/QuizScreen.vue';
import AuthScreen from './views/AuthScreen.vue';
import DictionaryScreen from './views/DictionaryScreen.vue';
import OnboardingSurveyModal from './components/OnboardingSurveyModal.vue';
import {
  Signal, Wifi, BookOpen, Sparkles, Mic, Home, PenTool, MessageSquare, UserRound, ArrowLeft, Compass, ChevronRight,
  LayoutGrid, GraduationCap, Layers, TrendingUp, Gift, Star, BookA
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
import { getFullAudioUrl, getErrorMessage } from './services/api';
import ProfileScreen from './views/ProfileScreen.vue';
import AuthModal from './components/AuthModal.vue';



// Main Navigation Tab
const activeTab = ref('home');
const isProfileOpen = ref(false);
const isAuthOpen = ref(false);
const isOnboardingOpen = ref(false);
const isAuthenticated = ref(authService.isAuthenticated());
const currentTime = ref('');
let sessionVersion = 0;
let homeRequestId = 0;
let chatRequestId = 0;
let studyRequestId = 0;
let flashcardDeckRequestId = 0;

// User Profile
const userProfile = ref(authService.getUser());
const journey = useLearningJourney(userProfile, isAuthenticated, learningService);
const selectedTopic = ref(null);
const topicLessons = ref([]);
const currentLesson = ref(null);
const pendingLesson = ref(null);
const lessonDetail = ref(null);
const lessonQuizzes = ref([]);
const lessonDecks = ref([]);
const lessonCards = ref([]);
const lessonLoading = ref(false);
const lessonError = ref('');
const lessonStep = ref('practice');
const studyDeckId = ref(null);
const studyLessonId = ref(null);
const studyTopicId = ref(null);
const saveWordOpen = ref(false);
const wordToSave = ref('');
const wordExample = ref('');
const wordMeaning = ref('');
const wordIpa = ref('');
const savedWordMessage = ref('');
const lessonProgress = computed(() => currentLesson.value ? journey.lesson(currentLesson.value.id) : null);
const recommendedTopic = computed(() => {
  const levelTopics = topics.value.filter(topic => topic.level === userProfile.value?.target_level);
  const candidates = levelTopics.length ? levelTopics : topics.value;
  const pattern = journey.state.value.goal === 'work' ? /business|work|job|interview|career/i
    : journey.state.value.goal === 'study' ? /tech|education|academic|environment|science/i
      : /daily|greet|travel|food|conversation/i;
  return candidates.find(topic => pattern.test(topic.title)) || candidates[0];
});
const previousTab = ref('home');
const navHistory = ref([]);
const hasHistory = computed(() => navHistory.value.length > 0);

const navigateSidebar = tab => {
  if ((tab === 'speaking' || tab === 'writing') && !isAuthenticated.value) {
    requireAuthentication();
    return;
  }
  // Khi ấn vào các mục ở sidebar thì xóa lịch sử để không hiện nút quay lại
  navHistory.value = [];

  if (tab === 'lesson') {
    currentLesson.value = null;
    selectedTopic.value = null;
    lessonCards.value = [];
  } else if (tab === 'speaking') {
    currentLesson.value = null;
  } else if (tab === 'writing') {
    currentLesson.value = null;
    writingPickerOpen.value = false;
  } else if (tab === 'study' || tab === 'flashcard') {
    currentLesson.value = null;
    studyDeckId.value = null;
    studyLessonId.value = null;
    studyTopicId.value = null;
  } else if (tab === 'quiz') {
    currentLesson.value = null;
  } else if (tab === 'chat') {
    currentLesson.value = null;
  }

  activeTab.value = tab;
  if (tab === 'study' || tab === 'flashcard') void loadFlashcardsData();
  else if (tab === 'quiz') void loadQuizzesData();
};

const pushNavState = () => {
  const current = {
    tab: activeTab.value,
    currentLesson: currentLesson.value,
    lessonDetail: lessonDetail.value,
    lessonStep: lessonStep.value,
    selectedTopic: selectedTopic.value,
    studyMode: studyMode.value,
    studyDeckId: studyDeckId.value,
    studyLessonId: studyLessonId.value,
    studyTopicId: studyTopicId.value,
    selectedSpeakingContentId: selectedSpeakingContentId.value
  };
  const last = navHistory.value[navHistory.value.length - 1];
  if (
    last &&
    last.tab === current.tab &&
    last.currentLesson?.id === current.currentLesson?.id &&
    last.selectedTopic?.id === current.selectedTopic?.id &&
    last.studyMode === current.studyMode &&
    last.studyDeckId === current.studyDeckId
  ) {
    return;
  }
  navHistory.value.push(current);
};

const navigateTab = tab => {
  if ((tab === 'speaking' || tab === 'writing') && !isAuthenticated.value) {
    requireAuthentication();
    return;
  }
  if (tab === activeTab.value && !currentLesson.value) return;
  if (currentLesson.value && (tab === 'study' || tab === 'flashcard' || tab === 'quiz')) {
    leaveLesson(false);
  }
  if (activeTab.value !== tab) {
    pushNavState();
    previousTab.value = activeTab.value;
  }
  activeTab.value = tab;
  if (tab === 'study') void (studyMode.value === 'quiz' ? loadQuizzesData() : loadFlashcardsData());
  else if (tab === 'flashcard') void loadFlashcardsData();
  else if (tab === 'quiz') void loadQuizzesData();
};

const goBack = () => {
  // 1. Nếu đang mở bảng chọn đề viết trong WritingScreen, đóng bảng chọn trước
  if (activeTab.value === 'writing' && writingPickerOpen.value) {
    writingPickerOpen.value = false;
    return;
  }

  // 2. Nếu có lịch sử trong navHistory stack, pop và khôi phục chính xác
  while (navHistory.value.length > 0) {
    const prev = navHistory.value.pop();
    const isSameAsCurrent =
      prev.tab === activeTab.value &&
      prev.currentLesson?.id === currentLesson.value?.id &&
      prev.selectedTopic?.id === selectedTopic.value?.id &&
      prev.studyMode === studyMode.value &&
      prev.studyDeckId === studyDeckId.value;

    if (isSameAsCurrent) continue;

    activeTab.value = prev.tab;
    currentLesson.value = prev.currentLesson;
    lessonDetail.value = prev.lessonDetail;
    lessonStep.value = prev.lessonStep || 'practice';
    selectedTopic.value = prev.selectedTopic;
    studyMode.value = prev.studyMode || 'flashcard';
    studyDeckId.value = prev.studyDeckId;
    studyLessonId.value = prev.studyLessonId;
    studyTopicId.value = prev.studyTopicId;

    if (prev.tab === 'speaking' && prev.selectedSpeakingContentId && lessonDetail.value?.contents) {
      const c = lessonDetail.value.contents.find(item => item.id === prev.selectedSpeakingContentId);
      if (c) selectSpeakingSentence(c);
    }

    if (prev.tab === 'study') {
      if (prev.studyMode === 'quiz') void loadQuizzesData();
      else void loadFlashcardsData();
    } else if (prev.tab === 'flashcard') {
      void loadFlashcardsData();
    } else if (prev.tab === 'quiz') {
      void loadQuizzesData();
    }
    return;
  }

  // 3. Fallback khi stack rỗng:
  if (activeTab.value === 'lesson') {
    if (currentLesson.value) {
      leaveLesson();
      return;
    }
    if (selectedTopic.value) {
      selectedTopic.value = null;
      return;
    }
  }
  if (activeTab.value !== 'home') {
    activeTab.value = 'home';
    return;
  }
};
const chatSummary = ref(null);
const endChatSession = () => {
  if (isBotTyping.value || isChatRecording.value || chatLoading.value) return;
  const turns = chatMessages.value.filter(item => item.sender?.toLowerCase() === 'user');
  if (!turns.length) return;
  chatSummary.value = { turns: turns.length, words: turns.reduce((count, item) => count + (item.message_text || '').trim().split(/\s+/).filter(Boolean).length, 0) };
};
let lessonRequestId = 0;
let pauseDrafts = false;
const canFinishLesson = computed(() => {
  if (!lessonProgress.value?.practiced) return false;
  if (currentLesson.value?.type !== 'SPEAKING') return true;
  return !!lessonDetail.value?.contents?.length && lessonDetail.value.contents.every(item => lessonProgress.value.completed_content_ids.includes(item.id));
});

const userAvatarUrl = computed(() => {
  const name = userProfile.value?.full_name || dashboard.value?.full_name || 'Learner';
  return userProfile.value?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
});

const openAuthOrProfile = () => {
  if (isAuthenticated.value) {
    navigateSidebar('profile');
  } else {
    navigateTab('auth');
  }
};

const openAuthModal = () => {
  openAuthOrProfile();
};

const onProfileUpdated = (profile) => {
  if (!authService.isAuthenticated() || profile?.id !== userProfile.value?.id) return;
  userProfile.value = profile;
  isAuthenticated.value = authService.isAuthenticated();
  void loadHomeData();
};

const requireAuthentication = () => {
  if (authService.isAuthenticated()) return true;
  if (isAuthenticated.value) logout();
  isProfileOpen.value = false;
  activeTab.value = 'auth';
  return false;
};

const resetPersonalData = () => {
  pauseDrafts = true;
  sessionVersion += 1;
  homeRequestId += 1;
  chatRequestId += 1;
  studyRequestId += 1;
  flashcardDeckRequestId += 1;
  recorder.cleanup();
  chatRecorder.cleanup();
  window.speechSynthesis?.cancel();
  isRecording.value = false;
  isChatRecording.value = false;
  isAnalyzingSpeaking.value = false;
  isEvaluating.value = false;
  isBotTyping.value = false;
  isSubmittingQuiz.value = false;
  quizFeedbackMode.value = 'end';
  isSavingCardNote.value = false;
  chatLoading.value = false;
  chatHistoryLoading.value = false;
  studyLoading.value = false;
  dashboard.value = null;
  speakingResult.value = null;
  speakingError.value = '';
  essayInput.value = '';
  writingResult.value = null;
  writingError.value = '';
  writingPickerRequestId += 1;
  writingPickerOpen.value = false;
  writingPickerLoading.value = false;
  writingPickerError.value = '';
  writingTaskCatalog.value = [];
  writingPickerTopicId.value = null;
  copied.value = false;
  conversationId.value = null;
  chatMessages.value = [];
  chatInput.value = '';
  chatConversations.value = [];
  chatError.value = '';
  chatHistoryError.value = '';
  isChatHistoryOpen.value = false;
  flashcards.value = [];
  flashcardMode.value = 'all';
  clearTimeout(flashcardToastTimer);
  flashcardToast.value = '';
  flashcardDecks.value = [];
  flashcardDecksLoading.value = false;
  flashcardDecksError.value = '';
  studyError.value = '';
  isFlipped.value = false;
  restartQuiz();
  currentLesson.value = null;
  pendingLesson.value = null;
  lessonDetail.value = null;
  lessonQuizzes.value = [];
  lessonDecks.value = [];
  studyDeckId.value = null;
  studyLessonId.value = null;
  studyTopicId.value = null;
  lessonRequestId += 1;
  lessonLoading.value = false;
  saveWordOpen.value = false;
  savedWordMessage.value = '';
  chatSummary.value = null;
  pauseDrafts = false;
};

const onAuthSuccess = async (isNewAccount = false) => {
  const guestDraft = !isAuthenticated.value ? essayInput.value : '';
  const lessonToOpen = pendingLesson.value;
  const guestQuiz = !isAuthenticated.value && studyMode.value === 'quiz' ? {
    answers: { ...quizAnswers.value }, selected: selectedQuizAnswer.value, text: quizInputText.value, index: currentStudyIndex.value
  } : null;
  resetPersonalData();
  userProfile.value = authService.getUser();
  isAuthenticated.value = authService.isAuthenticated();
  isAuthOpen.value = false;
  isProfileOpen.value = false;
  if (guestDraft) essayInput.value = guestDraft;
  if (guestQuiz) { quizAnswers.value = guestQuiz.answers; selectedQuizAnswer.value = guestQuiz.selected; quizInputText.value = guestQuiz.text; currentStudyIndex.value = guestQuiz.index; }
  await Promise.all([loadHomeData(), studyMode.value === 'flashcard' ? loadFlashcardsData() : Promise.resolve(), loadChatScenarios()]);
  if (lessonToOpen) await startLesson(lessonToOpen);

  // Kiểm tra tài khoản mới hoặc chưa hoàn thành khảo sát
  const user = userProfile.value;
  const isLocalOnboarded = user?.id ? localStorage.getItem(`lingoup:onboarded:${user.id}`) === 'true' : false;
  if (isNewAccount || (!journey.state.value.onboarded && !isLocalOnboarded)) {
    isOnboardingOpen.value = true;
  } else {
    activeTab.value = 'home';
  }
};

const onOnboardingCompleted = async (surveyData) => {
  isOnboardingOpen.value = false;
  if (surveyData?.target_level && userProfile.value) {
    userProfile.value.target_level = surveyData.target_level;
  }
  journey.state.value.onboarded = true;
  if (surveyData?.goal) journey.state.value.goal = surveyData.goal;
  if (surveyData?.daily_minutes) journey.state.value.daily_minutes = surveyData.daily_minutes;
  activeTab.value = 'home';
  await loadHomeData();
};

const logout = () => {
  authService.logout();
  resetPersonalData();
  isAuthenticated.value = false;
  userProfile.value = null;
  isProfileOpen.value = false;
  if (activeTab.value === 'speaking' || activeTab.value === 'writing' || activeTab.value === 'profile') {
    activeTab.value = 'home';
  }
  void loadHomeData();
};

const onSessionExpired = () => {
  logout();
  activeTab.value = 'auth';
};

// ==========================================
// SCREEN 1: HOME (REAL DATA)
// ==========================================
const homeLoading = ref(true);
const homeError = ref('');
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
  const requestId = ++homeRequestId;
  const version = sessionVersion;
  homeLoading.value = true;
  homeError.value = '';
  try {
    const [dash, top] = await Promise.allSettled([
      authService.isAuthenticated() ? progressService.getDashboard() : Promise.resolve(null),
      curriculumService.getTopics()
    ]);
    if (version !== sessionVersion || requestId !== homeRequestId) return;
    dashboard.value = dash.status === 'fulfilled' ? dash.value : null;
    topics.value = top.status === 'fulfilled' ? top.value || [] : [];
    const failed = [dash, top].find(result => result.status === 'rejected');
    if (failed) homeError.value = getErrorMessage(failed.reason, 'Không tải được đầy đủ dữ liệu. Vui lòng thử lại.');
    if (topics.value.length > 0 && !speakingTopicId.value) {
      speakingTopicId.value = topics.value[0].id;
      await onSpeakingTopicChange();
    }
  } finally {
    if (version === sessionVersion && requestId === homeRequestId) homeLoading.value = false;
  }
};

const startTopic = async (topic) => {
  if (!topic) return;
  pushNavState();
  const requestId = ++lessonRequestId;
  selectedTopic.value = topic;
  currentLesson.value = null;
  lessonDetail.value = null;
  topicLessons.value = [];
  activeTab.value = 'lesson';
  lessonLoading.value = true;
  lessonError.value = '';
  try {
    const list = await curriculumService.getLessonsByTopic(topic.id);
    if (requestId === lessonRequestId) topicLessons.value = list || [];
  } catch (err) {
    if (requestId === lessonRequestId) lessonError.value = getErrorMessage(err, 'Không tải được danh sách bài.');
  } finally {
    if (requestId === lessonRequestId) lessonLoading.value = false;
  }
};

const startLesson = async (lesson, resume = null) => {
  if (!requireAuthentication()) { pendingLesson.value = lesson; return; }
  pushNavState();
  const requestId = ++lessonRequestId;
  const version = sessionVersion;
  lessonLoading.value = true;
  lessonError.value = '';
  activeTab.value = 'lesson';
  currentLesson.value = null;

  // Resolve topic early to avoid layout flicker or "ALL LEVELS" fallback
  if (lesson.topic_id && (!selectedTopic.value || selectedTopic.value.id !== lesson.topic_id)) {
    selectedTopic.value = topics.value?.find(t => t.id === lesson.topic_id) || selectedTopic.value;
  }

  try {
    const detail = await curriculumService.getLessonDetail(lesson.id);
    const [quizzes, decks] = await Promise.allSettled([
      Promise.all([studyService.getQuizzes(detail.id), studyService.getQuizzes(null, detail.topic_id)]).then(lists => [...new Map(lists.flat().map(item => [item.id, item])).values()]),
      studyService.getFlashcardDecks(detail.id)
    ]);
    if (version !== sessionVersion || requestId !== lessonRequestId) return;

    const loadedDecks = decks.status === 'fulfilled' ? decks.value || [] : [];
    if (quizzes.status === 'rejected' || decks.status === 'rejected') {
      lessonError.value = 'Đã tải bài học; chưa tải được đầy đủ quiz/bộ từ. Bạn có thể thử lại.';
    }

    // Tải trước danh sách từ vựng flashcard của bài để người học học từ trước
    let cards = [];
    if (loadedDecks.length > 0) {
      try {
        cards = await studyService.getFlashcards(loadedDecks[0].id);
      } catch (err) {
        console.warn('Could not prefetch lesson flashcards:', err);
      }
    }

    if (version !== sessionVersion || requestId !== lessonRequestId) return;

    // Resolve topic detail & topic lessons if needed
    if (!selectedTopic.value || selectedTopic.value.id !== detail.topic_id) {
      selectedTopic.value = topics.value?.find(t => t.id === detail.topic_id) || null;
      try {
        topicLessons.value = await curriculumService.getLessonsByTopic(detail.topic_id) || [];
      } catch (e) {
        // ignore
      }
    }

    // Populate all prerequisite data BEFORE publishing currentLesson to prevent tab jumping
    lessonCards.value = cards || [];
    lessonQuizzes.value = quizzes.status === 'fulfilled' ? (quizzes.value || [])
      .filter(q => q.lesson_id === detail.id || (!q.lesson_id && q.topic_id === detail.topic_id))
      .sort((a, b) => Number(b.lesson_id === detail.id) - Number(a.lesson_id === detail.id) || b.id - a.id) : [];
    lessonDecks.value = loadedDecks;

    // Determine initial step: vocabulary first if lesson has cards, otherwise practice
    if (cards && cards.length > 0) {
      lessonStep.value = resume?.step || 'vocabulary';
    } else {
      lessonStep.value = resume?.step || 'practice';
    }

    studyLessonId.value = detail.id;
    studyTopicId.value = detail.topic_id;

    lessonDetail.value = detail;
    currentLesson.value = detail; // Atomically set currentLesson after all dependencies ready

    if (detail.type === 'SPEAKING') {
      isCustomSpeakingMode.value = false;
      speakingTopicId.value = detail.topic_id;
      speakingLessonId.value = detail.id;
      speakingLessons.value = topicLessons.value?.filter(item => item.type === 'SPEAKING') || [];
      speakingLessonContents.value = detail.contents || [];
      targetSpeakingText.value = '';
      const content = detail.contents?.find(item => item.id === resume?.content_id) || detail.contents?.[0];
      if (content) selectSpeakingSentence(content);
    } else {
      essayInput.value = journey.state.value.writing_drafts[String(detail.id)] || '';
      writingResult.value = null;
    }

    journey.remember(detail.topic_id, detail.id, lessonStep.value, resume?.content_id || null);
  } catch (err) {
    if (version === sessionVersion && requestId === lessonRequestId) lessonError.value = getErrorMessage(err, 'Không mở được bài học.');
  } finally {
    if (version === sessionVersion && requestId === lessonRequestId) lessonLoading.value = false;
  }
};

const continueLearning = async () => {
  const resume = journey.state.value.resume;
  if (!resume) { if (recommendedTopic.value) await startTopic(recommendedTopic.value); return; }
  const topic = topics.value.find(item => item.id === resume.topic_id);
  if (!topic) return;
  await startTopic(topic);
  const lesson = topicLessons.value.find(item => item.id === resume.lesson_id);
  if (lesson) {
    await startLesson(lesson, resume);
    if (resume.step === 'quiz' && currentLesson.value?.id === lesson.id) await openLessonQuiz();
  }
};

const beginLessonPractice = (specificContent = null) => {
  if (!currentLesson.value) return;
  if (!requireAuthentication()) return;
  pushNavState();
  lessonStep.value = 'practice';
  if (currentLesson.value.type === 'SPEAKING') {
    speakingTopicId.value = currentLesson.value.topic_id;
    speakingLessonId.value = currentLesson.value.id;
    if (lessonDetail.value?.contents?.length) {
      speakingLessonContents.value = lessonDetail.value.contents;
      const isContentObj = specificContent && typeof specificContent === 'object' && ('id' in specificContent) && ('target_text' in specificContent);
      const targetContent = isContentObj
        ? (lessonDetail.value.contents.find(c => c.id === specificContent.id) || specificContent)
        : (selectedSpeakingContentId.value ? lessonDetail.value.contents.find(c => c.id === selectedSpeakingContentId.value) : null) || lessonDetail.value.contents[0];
      selectSpeakingSentence(targetContent);
    }
    activeTab.value = 'speaking';
  } else {
    activeTab.value = 'writing';
  }
  journey.remember(currentLesson.value.topic_id, currentLesson.value.id, 'practice', selectedSpeakingContentId.value);
};

const openLessonQuiz = async () => {
  if (!currentLesson.value || !requireAuthentication()) return;
  pushNavState();
  studyMode.value = 'quiz';
  studyLessonId.value = currentLesson.value.id;
  studyTopicId.value = currentLesson.value.topic_id;
  lessonStep.value = 'quiz';
  journey.remember(currentLesson.value.topic_id, currentLesson.value.id, 'quiz', currentLesson.value.type === 'SPEAKING' ? selectedSpeakingContentId.value : null);
  activeTab.value = 'quiz';
  await loadQuizzesData();
};

const openLessonDeck = async (deck) => {
  if (!requireAuthentication()) return;
  pushNavState();
  studyDeckId.value = deck.id;
  flashcardMode.value = 'all';
  studyMode.value = 'flashcard';
  activeTab.value = 'flashcard';
  await loadFlashcardsData();
};

const finishLesson = () => {
  if (!currentLesson.value || !canFinishLesson.value) return;
  journey.updateLesson(currentLesson.value.id, progress => { progress.completed = true; });
  lessonStep.value = 'summary';
  journey.remember(currentLesson.value.topic_id, currentLesson.value.id, 'summary');
  activeTab.value = 'lesson';
};

const nextLesson = async () => {
  const index = topicLessons.value.findIndex(item => item.id === currentLesson.value?.id);
  const next = topicLessons.value.slice(index + 1).find(item => !journey.lesson(item.id).completed);
  if (next) await startLesson(next);
  else { currentLesson.value = null; activeTab.value = 'lesson'; }
};

const leaveLesson = (reloadStudy = true) => {
  currentLesson.value = null;
  lessonDetail.value = null;
  lessonCards.value = [];
  studyDeckId.value = null;
  studyLessonId.value = null;
  studyTopicId.value = null;
  if (reloadStudy && (activeTab.value === 'study' || activeTab.value === 'flashcard')) void loadFlashcardsData();
  if (reloadStudy && activeTab.value === 'quiz') void loadQuizzesData();
  if (activeTab.value === 'writing') essayInput.value = journey.state.value.writing_drafts.free || '';
};

const openSaveWord = (word = '', example = '', meaning = '', ipa = '') => {
  if (!requireAuthentication()) return;
  wordToSave.value = typeof word === 'string' ? word : '';
  wordExample.value = example || '';
  wordMeaning.value = meaning || '';
  wordIpa.value = ipa || '';
  saveWordOpen.value = true;
};
const onWordSaved = () => {
  saveWordOpen.value = false;
  savedWordMessage.value = 'Đã lưu vào bộ thẻ "Từ đã lưu" trong mục Flashcard!';
};

const openLessonChat = async () => {
  pushNavState();
  const title = selectedTopic.value?.title?.toLowerCase() || '';
  const scenarioId = /food|restaurant|order/.test(title) ? 'restaurant_order' : /hotel|travel/.test(title) ? 'hotel_checkin' : /job|career|interview/.test(title) ? 'job_interview' : 'daily_smalltalk';
  if (scenarios.value.some(item => item.id === scenarioId)) chatScenarioId.value = scenarioId;
  activeTab.value = 'chat';
  await startChatConversation();
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
  speakingResult.value = null;
  speakingError.value = '';
  speakingLessonsLoading.value = false;
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
    if (requestId === speakingTopicRequestId) speakingError.value = getErrorMessage(err, 'Không tải được bài học.');
  } finally {
    if (requestId === speakingTopicRequestId) speakingLessonsLoading.value = false;
  }
};

const onSpeakingLessonChange = async () => {
  if (!speakingLessonId.value) return;
  const requestId = ++speakingLessonRequestId;
  speakingResult.value = null;
  speakingError.value = '';
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
    if (requestId === speakingLessonRequestId) speakingError.value = getErrorMessage(err, 'Không tải được câu luyện tập.');
  }
};

const selectSpeakingSentence = (content) => {
  if (!content) return;
  selectedSpeakingContentId.value = content.id;
  if (!isCustomSpeakingMode.value) targetSpeakingText.value = content.target_text.replace(/^[A-Za-z]+\s*:\s*/, '');
  targetIpa.value = content.ipa_guide || '';
  targetTranslation.value = content.hint_translation || '';
  nativeAudioUrl.value = content.audio_url || '';
  speakingResult.value = null;
  speakingError.value = '';
  if (currentLesson.value?.id === speakingLessonId.value) journey.remember(currentLesson.value.topic_id, currentLesson.value.id, 'practice', content.id);
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
  if (isAnalyzingSpeaking.value) return;
  speakingError.value = '';
  if (isRecording.value) return stopAndAnalyzeSpeaking();
  if (!targetSpeakingText.value.trim()) {
    speakingError.value = 'Please select or enter a practice sentence before recording.';
    return;
  }
  if (!requireAuthentication()) return;
  const version = sessionVersion;
  try {
    await recorder.start();
    if (version !== sessionVersion) { recorder.cleanup(); return; }
    isRecording.value = true;
  } catch (err) {
    if (version === sessionVersion) speakingError.value = getErrorMessage(err, 'Could not access microphone.');
  }
};

const stopAndAnalyzeSpeaking = async () => {
  const version = sessionVersion;
  const targetText = targetSpeakingText.value.trim();
  const lessonId = !isCustomSpeakingMode.value ? speakingLessonId.value : null;
  const contentId = selectedSpeakingContentId.value;
  try {
    const blob = await recorder.stop();
    if (version !== sessionVersion) return;
    isRecording.value = false;
    if (!blob?.size || !requireAuthentication()) return;
    isAnalyzingSpeaking.value = true;
    speakingResult.value = null;
    const res = await pronunciationService.analyzePronunciation(blob, targetText, lessonId);
    if (version !== sessionVersion || targetText !== targetSpeakingText.value.trim()) return;
    speakingResult.value = res;
    if (lessonId && currentLesson.value?.id === lessonId && contentId) journey.updateLesson(lessonId, progress => {
      progress.practiced = true;
      if (!progress.completed_content_ids.includes(contentId)) progress.completed_content_ids.push(contentId);
      progress.speaking_scores[String(contentId)] = res.overall_score;
    });
    void loadHomeData();
  } catch (err) {
    if (version === sessionVersion) speakingError.value = getErrorMessage(err, 'Pronunciation evaluation failed.');
  } finally {
    if (version === sessionVersion) { isRecording.value = false; isAnalyzingSpeaking.value = false; }
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
const writingPickerOpen = ref(false);
const writingPickerLoading = ref(false);
const writingPickerError = ref('');
const writingTaskCatalog = ref([]);
const writingPickerTopicId = ref(null);
let writingPickerRequestId = 0;
const writingPickerTopics = computed(() => topics.value.filter(topic => writingTaskCatalog.value.some(lesson => lesson.topic_id === topic.id)));
const writingPickerLessons = computed(() => writingPickerTopicId.value === null ? writingTaskCatalog.value : writingTaskCatalog.value.filter(lesson => lesson.topic_id === writingPickerTopicId.value));

const loadWritingTasks = async () => {
  const requestId = ++writingPickerRequestId;
  const version = sessionVersion;
  writingPickerLoading.value = true;
  writingPickerError.value = '';
  try {
    const [allTopics, lessons] = await Promise.all([
      topics.value.length ? Promise.resolve(topics.value) : curriculumService.getTopics(),
      curriculumService.getLessons('WRITING')
    ]);
    if (version !== sessionVersion || requestId !== writingPickerRequestId) return;
    topics.value = allTopics || [];
    writingTaskCatalog.value = (lessons || []).filter(lesson => lesson.type === 'WRITING');
    if (!writingPickerTopics.value.some(topic => topic.id === writingPickerTopicId.value)) writingPickerTopicId.value = null;
  } catch (err) {
    if (version === sessionVersion && requestId === writingPickerRequestId) writingPickerError.value = getErrorMessage(err, 'Could not load writing topics. Please try again.');
  } finally {
    if (version === sessionVersion && requestId === writingPickerRequestId) writingPickerLoading.value = false;
  }
};

const openWritingTaskPicker = async () => {
  if (isEvaluating.value) return;
  writingPickerOpen.value = true;
  if (!writingTaskCatalog.value.length || writingPickerError.value) await loadWritingTasks();
};

const openWritingLesson = async lesson => {
  if (isEvaluating.value || writingPickerLoading.value || lesson.type !== 'WRITING') return;
  const topic = writingPickerTopics.value.find(item => item.id === lesson.topic_id);
  if (!topic) return;
  const version = sessionVersion;
  writingPickerError.value = '';
  writingPickerLoading.value = true;
  try {
    await startTopic(topic);
    if (version !== sessionVersion || activeTab.value !== 'lesson' || selectedTopic.value?.id !== topic.id) return;
    if (lessonError.value) { writingPickerError.value = lessonError.value; activeTab.value = 'writing'; return; }
    await startLesson(lesson);
    if (version !== sessionVersion || activeTab.value !== 'lesson') return;
    if (isAuthOpen.value && !currentLesson.value) { activeTab.value = 'writing'; return; }
    if (currentLesson.value?.id === lesson.id && currentLesson.value.type === 'WRITING') {
      writingPickerOpen.value = false;
      beginLessonPractice();
    } else {
      writingPickerError.value = lessonError.value || 'Could not load prompt. Please try again.';
      activeTab.value = 'writing';
    }
  } finally {
    if (version === sessionVersion) writingPickerLoading.value = false;
  }
};

const wordCount = computed(() => {
  if (!essayInput.value.trim()) return 0;
  return essayInput.value.trim().split(/\s+/).length;
});

const submitWritingEvaluation = async () => {
  if (isEvaluating.value || !essayInput.value.trim() || !requireAuthentication()) return;
  const version = sessionVersion;
  isEvaluating.value = true;
  writingError.value = '';
  writingResult.value = null;
  const lessonId = currentLesson.value?.type === 'WRITING' ? currentLesson.value.id : null;
  const submittedText = essayInput.value.trim();
  try {
    const prompt = lessonId ? lessonDetail.value?.contents?.map(item => [item.target_text, item.task_guidance].filter(Boolean).join('\n')).join('\n') || currentLesson.value.title : null;
    const res = await writingService.evaluateEssay(submittedText, lessonId, prompt);
    const activeWritingLesson = currentLesson.value?.type === 'WRITING' ? currentLesson.value.id : null;
    if (version !== sessionVersion || activeWritingLesson !== lessonId || essayInput.value.trim() !== submittedText) return;
    writingResult.value = res;
    writingSubTab.value = 'grammar';
    if (lessonId) journey.updateLesson(lessonId, progress => {
      progress.practiced = true;
      progress.writing_previous_score = progress.writing_score;
      progress.writing_score = res.overall_score ?? null;
      progress.writing_attempts = (progress.writing_attempts || 0) + 1;
    });
    void loadHomeData();
  } catch (err) {
    if (version === sessionVersion) writingError.value = getErrorMessage(err, 'Essay assessment failed.');
  } finally {
    if (version === sessionVersion) isEvaluating.value = false;
  }
};

const copyRewritten = async () => {
  if (!writingResult.value?.corrected_text) return;
  const version = sessionVersion;
  try {
    await navigator.clipboard.writeText(writingResult.value.corrected_text);
    if (version !== sessionVersion) return;
    copied.value = true;
    setTimeout(() => { if (version === sessionVersion) copied.value = false; }, 1800);
  } catch (err) {
    if (version === sessionVersion) writingError.value = 'Could not copy text. Please select text to copy manually.';
  }
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
const chatError = ref('');
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
  if (!requireAuthentication()) return;
  const version = sessionVersion;
  chatHistoryLoading.value = true;
  chatHistoryError.value = '';
  try {
    const list = await chatService.getConversations();
    if (version === sessionVersion) chatConversations.value = list || [];
  } catch (err) {
    if (version === sessionVersion) chatHistoryError.value = getErrorMessage(err, 'Could not load chat history.');
  } finally {
    if (version === sessionVersion) chatHistoryLoading.value = false;
  }
};

const toggleChatHistory = async () => {
  if (chatLoading.value || isBotTyping.value || isChatRecording.value || !requireAuthentication()) return;
  isChatHistoryOpen.value = !isChatHistoryOpen.value;
  if (isChatHistoryOpen.value) await loadChatConversations();
};

const openChatConversation = async (conversation) => {
  if (chatLoading.value || isBotTyping.value || isChatRecording.value || !requireAuthentication()) return;
  const version = sessionVersion;
  const requestId = ++chatRequestId;
  chatLoading.value = true;
  chatHistoryError.value = '';
  chatError.value = '';
  try {
    const detail = await chatService.getConversationDetail(conversation.id);
    if (version !== sessionVersion || requestId !== chatRequestId) return;
    conversationId.value = detail.id;
    chatMessages.value = detail.messages || [];
    const scenario = scenarios.value.find(item => item.title === detail.scenario_title);
    if (scenario) chatScenarioId.value = scenario.id;
    isChatHistoryOpen.value = false;
    await scrollChatToBottom();
  } catch (err) {
    if (version === sessionVersion && requestId === chatRequestId) chatHistoryError.value = getErrorMessage(err, 'Could not open conversation.');
  } finally {
    if (version === sessionVersion && requestId === chatRequestId) chatLoading.value = false;
  }
};

const loadChatScenarios = async () => {
  const requestId = ++chatRequestId;
  chatLoading.value = true;
  chatError.value = '';
  try {
    const list = await chatService.getScenarios();
    if (requestId !== chatRequestId) return;
    scenarios.value = list || [];
    if (scenarios.value.length && !scenarios.value.some(s => s.id === chatScenarioId.value)) {
      chatScenarioId.value = scenarios.value[0].id;
    }
  } catch (err) {
    if (requestId === chatRequestId) chatError.value = getErrorMessage(err, 'Could not load conversation scenarios.');
  } finally {
    if (requestId === chatRequestId) chatLoading.value = false;
  }
};

const startChatConversation = async (customTopic = null) => {
  if (chatLoading.value || isBotTyping.value || isChatRecording.value || !requireAuthentication()) return;
  const version = sessionVersion;
  const requestId = ++chatRequestId;
  chatLoading.value = true;
  chatError.value = '';
  conversationId.value = null;
  chatSummary.value = null;
  chatMessages.value = [];
  isChatHistoryOpen.value = false;
  try {
    const conv = await chatService.startConversation(chatScenarioId.value, customTopic);
    if (version !== sessionVersion || requestId !== chatRequestId) return;
    conversationId.value = conv.id;
    chatMessages.value = conv.messages || [];
    if (customTopic) {
      await loadChatScenarios();
      const matched = scenarios.value.find(s => s.title === conv.scenario_title);
      if (matched) chatScenarioId.value = matched.id;
    }
    await scrollChatToBottom();
    if (chatMessages.value.length > 0 && (chatMessages.value[0].sender === 'bot' || chatMessages.value[0].sender === 'BOT')) {
      speakBotMessage(chatMessages.value[0]);
    }
  } catch (err) {
    if (version === sessionVersion && requestId === chatRequestId) chatError.value = getErrorMessage(err, 'Could not start conversation.');
  } finally {
    if (version === sessionVersion && requestId === chatRequestId) chatLoading.value = false;
  }
};

const createAndSelectCustomScenario = async (topic) => {
  if (!topic || !topic.trim() || !requireAuthentication()) return null;
  chatLoading.value = true;
  chatError.value = '';
  try {
    const newScenario = await chatService.generateCustomScenario(topic.trim());
    if (newScenario && !scenarios.value.some(s => s.id === newScenario.id)) {
      scenarios.value.unshift(newScenario);
    }
    chatScenarioId.value = newScenario.id;
    await startChatConversation();
    return newScenario;
  } catch (err) {
    chatError.value = getErrorMessage(err, 'Could not create new scenario.');
    throw err;
  } finally {
    chatLoading.value = false;
  }
};

const switchChatScenario = () => startChatConversation();
const resetChatConversation = () => startChatConversation();

const scrollChatToBottom = async () => {
  await nextTick();
  if (chatScrollContainer.value) {
    chatScrollContainer.value.scrollTop = chatScrollContainer.value.scrollHeight;
  }
};

const sendChatText = async (customText = null) => {
  const text = (typeof customText === 'string' && customText.trim()) ? customText.trim() : chatInput.value.trim();
  if (!text || chatLoading.value || isBotTyping.value || isChatRecording.value || !conversationId.value || !requireAuthentication()) return;
  const version = sessionVersion;
  const id = conversationId.value;

  // 1. Clear input immediately so user gets instant visual feedback
  chatInput.value = '';

  // 2. Optimistically push user message to chatMessages and scroll immediately
  const userMsgObj = {
    sender: 'user',
    message_text: text,
    created_at: new Date().toISOString()
  };
  chatMessages.value.push(userMsgObj);
  await scrollChatToBottom();

  // 3. Trigger typing indicator
  isBotTyping.value = true;
  chatError.value = '';

  try {
    const reply = await chatService.sendMessage(id, text);
    if (version !== sessionVersion || id !== conversationId.value) return;

    if (reply) {
      if (reply.user_feedback) {
        userMsgObj.feedback = reply.user_feedback;
      }
      chatMessages.value.push(reply);
      await scrollChatToBottom();
      speakBotMessage(reply);
    }
    void loadHomeData();
  } catch (err) {
    if (version === sessionVersion) {
      chatError.value = getErrorMessage(err, 'Could not send message. Please try again.');
      // Restore draft if empty so user can retry without retyping
      if (!chatInput.value) {
        chatInput.value = text;
      }
      // Remove optimistic message on failure
      const idx = chatMessages.value.indexOf(userMsgObj);
      if (idx !== -1) {
        chatMessages.value.splice(idx, 1);
      }
    }
  } finally {
    if (version === sessionVersion) isBotTyping.value = false;
  }
};

const isRecordingPaused = ref(false);
const recordingDuration = ref(0);
let recordingInterval = null;

const startRecordingTimer = () => {
  stopRecordingTimer();
  recordingDuration.value = 0;
  recordingInterval = setInterval(() => {
    if (!isRecordingPaused.value) {
      recordingDuration.value += 1;
    }
  }, 1000);
};

const stopRecordingTimer = () => {
  if (recordingInterval) {
    clearInterval(recordingInterval);
    recordingInterval = null;
  }
};

const formattedRecordingTime = computed(() => {
  const m = Math.floor(recordingDuration.value / 60);
  const s = recordingDuration.value % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
});

const startChatVoice = async () => {
  if (chatLoading.value || isBotTyping.value || !conversationId.value || !requireAuthentication()) return;
  const version = sessionVersion;
  chatError.value = '';
  try {
    await chatRecorder.start();
    if (version !== sessionVersion) { chatRecorder.cleanup(); return; }
    isChatRecording.value = true;
    isRecordingPaused.value = false;
    startRecordingTimer();
  } catch (err) {
    if (version === sessionVersion) chatError.value = getErrorMessage(err, 'Could not access microphone.');
  }
};

const cancelChatVoice = () => {
  stopRecordingTimer();
  chatRecorder.cleanup();
  isChatRecording.value = false;
  isRecordingPaused.value = false;
  recordingDuration.value = 0;
};

const togglePauseRecording = () => {
  if (!isChatRecording.value) return;
  if (isRecordingPaused.value) {
    chatRecorder.resume();
    isRecordingPaused.value = false;
  } else {
    chatRecorder.pause();
    isRecordingPaused.value = true;
  }
};

const sendChatVoice = async () => {
  if (!isChatRecording.value || !conversationId.value) return;
  const version = sessionVersion;
  const id = conversationId.value;
  stopRecordingTimer();
  isChatRecording.value = false;
  isRecordingPaused.value = false;
  chatError.value = '';

  let tempUserMsg = null;
  try {
    const blob = await chatRecorder.stop();
    if (version !== sessionVersion) return;
    if (!blob?.size) return;

    // 1. Hiển thị NGAY LẬP TỨC tin nhắn người dùng ở trạng thái đang xử lý (Image 2 style)
    const audioBlobUrl = URL.createObjectURL(blob);
    tempUserMsg = {
      id: `pending-${Date.now()}`,
      sender: 'user',
      message_text: '',
      isPending: true,
      audio_blob_url: audioBlobUrl,
      created_at: new Date().toISOString()
    };
    chatMessages.value.push(tempUserMsg);
    await scrollChatToBottom();

    // 2. Kích hoạt hiệu ứng Emma đang suy nghĩ
    isBotTyping.value = true;

    // 3. Gửi sang backend
    const result = await chatService.sendVoiceMessage(id, blob);
    if (version !== sessionVersion || id !== conversationId.value) return;

    // 4. Khi backend trả về, thay thế bong bóng loading bằng tin nhắn thực tế của người dùng
    const pendingIdx = chatMessages.value.findIndex(m => m.id === tempUserMsg.id);
    if (result?.user_message) {
      const completedUserMsg = {
        ...result.user_message,
        audio_blob_url: audioBlobUrl // Giữ URL blob để phát lại tức thì
      };
      if (pendingIdx !== -1) {
        chatMessages.value.splice(pendingIdx, 1, completedUserMsg);
      } else {
        chatMessages.value.push(completedUserMsg);
      }
    } else if (pendingIdx !== -1) {
      chatMessages.value.splice(pendingIdx, 1);
    }

    // 5. Thêm phản hồi của Bot và phát âm thanh
    if (result?.bot_message) {
      chatMessages.value.push(result.bot_message);
      await scrollChatToBottom();
      speakBotMessage(result.bot_message);
    }
    void loadHomeData();
  } catch (err) {
    if (version === sessionVersion) {
      chatError.value = getErrorMessage(err, 'Could not send audio recording.');
      if (tempUserMsg) {
        const pendingIdx = chatMessages.value.findIndex(m => m.id === tempUserMsg.id);
        if (pendingIdx !== -1) {
          chatMessages.value.splice(pendingIdx, 1);
        }
      }
    }
  } finally {
    if (version === sessionVersion) {
      isBotTyping.value = false;
      isChatRecording.value = false;
    }
  }
};

const toggleChatVoice = async () => {
  if (isChatRecording.value) {
    await sendChatVoice();
  } else {
    await startChatVoice();
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
const flashcardMode = ref('all');
const NOTE_ADDED = 'Added to Bookmarked Cards.';
const NOTE_REMOVED = 'Removed from Bookmarked Cards.';
const NOTE_FAILED = 'Could not save bookmark. Please try again.';
const studyLoading = ref(false);
const studyError = ref('');
const currentStudyIndex = ref(0);
const isFlipped = ref(false);
const isSavingCardNote = ref(false);
const flashcards = ref([]);
const flashcardDecks = ref([]);
const flashcardDecksLoading = ref(false);
const flashcardDecksError = ref('');
const availableFlashcardDecks = computed(() => currentLesson.value ? lessonDecks.value : flashcardDecks.value);

const loadFlashcardDecks = async () => {
  if (!authService.isAuthenticated()) return;
  const version = sessionVersion;
  const requestId = ++flashcardDeckRequestId;
  flashcardDecksLoading.value = true;
  flashcardDecksError.value = '';
  try {
    const decks = await studyService.getFlashcardDecks();
    if (version !== sessionVersion || requestId !== flashcardDeckRequestId) return;
    flashcardDecks.value = decks || [];
  } catch (err) {
    if (version === sessionVersion && requestId === flashcardDeckRequestId) flashcardDecksError.value = getErrorMessage(err, 'Could not load vocabulary decks.');
  } finally {
    if (version === sessionVersion && requestId === flashcardDeckRequestId) flashcardDecksLoading.value = false;
  }
};

const onStudyDeckChange = async () => {
  if (studyLoading.value || isSavingCardNote.value || isSubmittingQuiz.value) return;
  if (studyDeckId.value !== null && !availableFlashcardDecks.value.some(deck => deck.id === studyDeckId.value)) return;
  await loadFlashcardsData();
};
const setFlashcardMode = async mode => {
  if (!['all', 'noted'].includes(mode) || mode === flashcardMode.value || studyLoading.value || isSavingCardNote.value) return;
  flashcardMode.value = mode;
  await loadFlashcardsData();
};
const currentCard = computed(() => flashcards.value[currentStudyIndex.value] || {});
const quizzesList = ref([]);
const selectedQuizId = ref(null);
const quizQuestions = ref([]);
const currentQuestion = computed(() => quizQuestions.value[currentStudyIndex.value] || {});
const selectedQuizAnswer = ref(null);
const quizInputText = ref('');
const quizAnswers = ref({});
const quizResult = ref(null);
const quizFeedbackMode = ref('end');
const quizFeedback = ref({});
const quizFeedbackLoading = ref(false);
let quizAttemptVersion = 0;
const quizChecked = computed(() => !!quizResult.value || (quizFeedbackMode.value === 'immediate' && !!quizFeedback.value[currentQuestion.value.id]));
const isSubmittingQuiz = ref(false);
const submittedQuizDetail = computed(() => quizResult.value?.details?.find(item => item.question_id === currentQuestion.value.id) || quizFeedback.value[currentQuestion.value.id] || null);
const canAnswerQuiz = computed(() => currentQuestion.value.question_type === 'FILL_BLANK' ? !!quizInputText.value.trim() : !!selectedQuizAnswer.value);
const quizModeLocked = computed(() => isSubmittingQuiz.value || quizFeedbackLoading.value || !!quizResult.value || canAnswerQuiz.value || Object.keys(quizAnswers.value).length > 0);
const setQuizFeedbackMode = mode => {
  if (!quizModeLocked.value && ['end', 'immediate'].includes(mode)) quizFeedbackMode.value = mode;
};
const totalStudyItems = computed(() => studyMode.value === 'flashcard' ? flashcards.value.length : quizQuestions.value.length);

const restartQuiz = () => {
  quizAttemptVersion += 1;
  quizFeedback.value = {};
  quizFeedbackLoading.value = false;
  isSubmittingQuiz.value = false;
  quizAnswers.value = {};
  quizResult.value = null;
  selectedQuizAnswer.value = null;
  quizInputText.value = '';
  currentStudyIndex.value = 0;
};

const restoreQuizAnswer = () => {
  const saved = quizAnswers.value[currentQuestion.value.id];
  selectedQuizAnswer.value = currentQuestion.value.answers?.find(answer => answer.id === saved?.selected_answer_id) || null;
  quizInputText.value = saved?.user_input_text || '';
};

const switchStudyMode = async (mode) => {
  if (isSubmittingQuiz.value || quizFeedbackLoading.value || isSavingCardNote.value || studyLoading.value || mode === studyMode.value) return;
  studyMode.value = mode;
  currentStudyIndex.value = 0;
  studyError.value = '';
  isFlipped.value = false;
  if (mode === 'flashcard') {
    if (flashcardMode.value === 'all' && currentLesson.value && !lessonDecks.value.length) { flashcards.value = []; studyError.value = 'This lesson has no cards yet. You can open Bookmarked Cards or select another deck.'; return; }
    if (currentLesson.value && lessonDecks.value.length) studyDeckId.value = lessonDecks.value[0].id;
    await loadFlashcardsData();
  }
  else if (studyLessonId.value || !quizQuestions.value.length) await loadQuizzesData();
  else restoreQuizAnswer();
};

const loadFlashcardsData = async () => {
  flashcards.value = [];
  isSavingCardNote.value = false;
  clearTimeout(flashcardToastTimer);
  flashcardToast.value = '';
  currentStudyIndex.value = 0;
  isFlipped.value = false;
  if (!authService.isAuthenticated()) return;
  // Fetch the selector independently so a catalog failure never hides valid cards.
  if (!currentLesson.value) void loadFlashcardDecks();
  const version = sessionVersion;
  const requestId = ++studyRequestId;
  studyLoading.value = true;
  studyError.value = '';
  try {
    const list = await studyService.getFlashcards(flashcardMode.value === 'noted' ? null : studyDeckId.value, flashcardMode.value === 'noted');
    if (version !== sessionVersion || requestId !== studyRequestId) return;
    flashcards.value = list || [];
    currentStudyIndex.value = 0;
  } catch (err) {
    if (version === sessionVersion && requestId === studyRequestId) studyError.value = getErrorMessage(err, 'Could not load vocabulary cards.');
  } finally {
    if (version === sessionVersion && requestId === studyRequestId) studyLoading.value = false;
  }
};

const flashcardToast = ref('');
let flashcardToastTimer = null;
const showFlashcardToast = (msg) => {
  if (flashcardToastTimer) clearTimeout(flashcardToastTimer);
  flashcardToast.value = msg;
  flashcardToastTimer = setTimeout(() => { flashcardToast.value = ''; }, 3500);
};

// Every note mutation belongs to the account and list that started it.
const flashcardScope = () => ({ version: sessionVersion, request: studyRequestId });
const isCurrentFlashcardScope = scope => scope.version === sessionVersion && scope.request === studyRequestId;
const toggleCardNote = async (event = null) => {
  const card = currentCard.value;
  // Keep the native checkbox in sync if persistence fails or the action is blocked.
  if (event?.target) event.target.checked = !!card.is_noted;
  if (!card.id || studyLoading.value || isSavingCardNote.value || !requireAuthentication()) return;
  const scope = flashcardScope();
  isSavingCardNote.value = true;
  studyError.value = '';
  try {
    const result = await studyService.setCardNote(card.id, !card.is_noted);
    if (!isCurrentFlashcardScope(scope)) return;
    card.is_noted = result.is_noted;
    if (flashcardMode.value === 'noted' && !card.is_noted) {
      flashcards.value = flashcards.value.filter(item => item.id !== card.id);
      currentStudyIndex.value = Math.max(0, Math.min(currentStudyIndex.value, flashcards.value.length - 1));
      isFlipped.value = false;
    }
    showFlashcardToast(card.is_noted ? NOTE_ADDED : NOTE_REMOVED);
  } catch (err) {
    if (isCurrentFlashcardScope(scope)) studyError.value = getErrorMessage(err, NOTE_FAILED);
  } finally {
    if (isCurrentFlashcardScope(scope)) isSavingCardNote.value = false;
  }
};

const jumpToFlashcard = idx => {
  if (studyLoading.value || isSavingCardNote.value) return;
  if (idx >= 0 && idx < flashcards.value.length) {
    currentStudyIndex.value = idx;
    isFlipped.value = false;
  }
};
const nextFlashcard = () => jumpToFlashcard(currentStudyIndex.value + 1);
const prevFlashcard = () => jumpToFlashcard(currentStudyIndex.value - 1);

const loadQuizzesData = async () => {
  const version = sessionVersion;
  const requestId = ++studyRequestId;
  studyLoading.value = true;
  studyError.value = '';
  quizQuestions.value = [];
  restartQuiz();
  try {
    const list = studyLessonId.value ? lessonQuizzes.value : await studyService.getQuizzes();
    if (version !== sessionVersion || requestId !== studyRequestId) return;
    quizzesList.value = list || [];
    selectedQuizId.value = quizzesList.value[0]?.id || null;
    if (selectedQuizId.value) await onQuizChange();
  } catch (err) {
    if (version === sessionVersion && requestId === studyRequestId) studyError.value = getErrorMessage(err, 'Could not load quizzes.');
  } finally {
    if (version === sessionVersion && requestId === studyRequestId) studyLoading.value = false;
  }
};

const onQuizChange = async () => {
  if (isSubmittingQuiz.value) return;
  const version = sessionVersion;
  const requestId = ++studyRequestId;
  quizQuestions.value = [];
  restartQuiz();
  studyError.value = '';
  studyLoading.value = false;
  if (!selectedQuizId.value) return;
  studyLoading.value = true;
  try {
    const detail = await studyService.getQuizDetail(selectedQuizId.value);
    if (version !== sessionVersion || requestId !== studyRequestId) return;
    quizQuestions.value = [...(detail?.questions || [])].sort((a, b) => a.order_index - b.order_index);
    const saved = journey.state.value.quiz_drafts[String(selectedQuizId.value)];
    if (saved) { quizAnswers.value = saved.answers || {}; currentStudyIndex.value = Math.min(saved.index || 0, Math.max(0, quizQuestions.value.length - 1)); restoreQuizAnswer(); }
  } catch (err) {
    if (version === sessionVersion && requestId === studyRequestId) studyError.value = getErrorMessage(err, 'Could not load quiz questions.');
  } finally {
    if (version === sessionVersion && requestId === studyRequestId) studyLoading.value = false;
  }
};

const selectQuizAnswer = async (answer) => {
  if (quizChecked.value || isSubmittingQuiz.value || quizFeedbackLoading.value) return;
  selectedQuizAnswer.value = answer;
  if (quizFeedbackMode.value === 'immediate') await checkQuizAnswer();
};

const checkQuizAnswer = async () => {
  if (isSubmittingQuiz.value || quizFeedbackLoading.value || quizChecked.value || !canAnswerQuiz.value || !currentQuestion.value.id || !requireAuthentication()) return;
  const question = currentQuestion.value;
  quizAnswers.value[question.id] = question.question_type === 'FILL_BLANK'
    ? { question_id: question.id, user_input_text: quizInputText.value.trim() }
    : { question_id: question.id, selected_answer_id: selectedQuizAnswer.value.id };
  if (quizFeedbackMode.value === 'immediate') {
    const version = sessionVersion;
    const attempt = quizAttemptVersion;
    const quizId = selectedQuizId.value;
    quizFeedbackLoading.value = true;
    studyError.value = '';
    try {
      const feedback = await studyService.checkQuizAnswer(quizId, quizAnswers.value[question.id]);
      if (version !== sessionVersion || attempt !== quizAttemptVersion || quizId !== selectedQuizId.value) return;
      quizFeedback.value[question.id] = feedback;
    } catch (err) {
      if (version === sessionVersion && attempt === quizAttemptVersion) studyError.value = getErrorMessage(err, 'Could not check answer. Please try again.');
    } finally {
      if (version === sessionVersion && attempt === quizAttemptVersion) quizFeedbackLoading.value = false;
    }
    return;
  }
  if (currentStudyIndex.value < quizQuestions.value.length - 1) {
    currentStudyIndex.value += 1;
    restoreQuizAnswer();
    return;
  }
  await submitQuizAttempt();
};

const submitQuizAttempt = async () => {
  if (isSubmittingQuiz.value || quizResult.value || !requireAuthentication()) return;
  if (quizQuestions.value.some(question => !quizAnswers.value[question.id])) return;
  const version = sessionVersion;
  const attempt = quizAttemptVersion;
  isSubmittingQuiz.value = true;
  studyError.value = '';
  try {
    const result = await studyService.submitQuiz(selectedQuizId.value, quizQuestions.value.map(q => quizAnswers.value[q.id]));
    if (version !== sessionVersion || attempt !== quizAttemptVersion) return;
    quizResult.value = result;
    journey.update(data => { delete data.quiz_drafts[String(selectedQuizId.value)]; });
    if (studyLessonId.value) journey.updateLesson(studyLessonId.value, progress => { progress.quiz_score = result.score; });
    currentStudyIndex.value = 0;
    restoreQuizAnswer();
  } catch (err) {
    if (version === sessionVersion && attempt === quizAttemptVersion) studyError.value = getErrorMessage(err, 'Could not submit quiz. Your selected answers have been preserved so you can retry.');
  } finally {
    if (version === sessionVersion && attempt === quizAttemptVersion) isSubmittingQuiz.value = false;
  }
};

const previousQuizQuestion = () => {
  if (isSubmittingQuiz.value || quizFeedbackLoading.value || currentStudyIndex.value === 0) return;
  if (!quizChecked.value && canAnswerQuiz.value) {
    const q = currentQuestion.value;
    quizAnswers.value[q.id] = q.question_type === 'FILL_BLANK'
      ? { question_id: q.id, user_input_text: quizInputText.value.trim() }
      : { question_id: q.id, selected_answer_id: selectedQuizAnswer.value.id };
  }
  currentStudyIndex.value -= 1;
  restoreQuizAnswer();
};

const nextQuizQuestion = async () => {
  if (isSubmittingQuiz.value || quizFeedbackLoading.value) return;
  if (quizFeedbackMode.value === 'immediate' && !quizResult.value && !quizChecked.value) return;
  if (currentStudyIndex.value < quizQuestions.value.length - 1) {
    currentStudyIndex.value += 1;
    restoreQuizAnswer();
  } else if (quizFeedbackMode.value === 'immediate' && !quizResult.value) await submitQuizAttempt();
  else restartQuiz();
};

const getQuizAnswerClass = (answer) => {
  if (!quizChecked.value) return selectedQuizAnswer.value?.id === answer.id
    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-800';
  if (submittedQuizDetail.value?.correct_answer_id === answer.id) return 'border-emerald-500 bg-emerald-50 text-emerald-900';
  if (selectedQuizAnswer.value?.id === answer.id) return submittedQuizDetail.value?.is_correct
    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
    : 'border-rose-500 bg-rose-50 text-rose-900';
  return 'border-gray-200 bg-white text-gray-400 opacity-60';
};

watch(activeTab, (tab, previous) => {
  if ((previous === 'study' || previous === 'flashcard' || previous === 'quiz') && tab !== 'study' && tab !== 'flashcard' && tab !== 'quiz') {
    studyRequestId += 1;
    studyLoading.value = false;
    isSavingCardNote.value = false;
    clearTimeout(flashcardToastTimer);
    flashcardToast.value = '';
  }
  if (previous === 'speaking' && tab !== 'speaking') { recorder.cleanup(); isRecording.value = false; }
  if (previous === 'chat' && tab !== 'chat') { chatRecorder.cleanup(); isChatRecording.value = false; }
  window.speechSynthesis?.cancel();
}, { flush: 'sync' });

watch(essayInput, text => {
  if (pauseDrafts || !isAuthenticated.value) return;
  const key = currentLesson.value?.type === 'WRITING' ? String(currentLesson.value.id) : 'free';
  journey.update(data => { data.writing_drafts[key] = text.slice(0, 10000); });
}, { flush: 'sync' });

watch(journey.loading, loading => {
  if (!loading && isAuthenticated.value && !currentLesson.value && !essayInput.value) essayInput.value = journey.state.value.writing_drafts.free || '';
}, { flush: 'sync' });

watch([quizAnswers, quizInputText, selectedQuizAnswer, currentStudyIndex], () => {
  if (pauseDrafts || quizChecked.value || !selectedQuizId.value || studyMode.value !== 'quiz') return;
  const answers = JSON.parse(JSON.stringify(quizAnswers.value));
  const q = currentQuestion.value;
  if (q.id && canAnswerQuiz.value) answers[q.id] = q.question_type === 'FILL_BLANK'
    ? { question_id: q.id, user_input_text: quizInputText.value.trim() }
    : { question_id: q.id, selected_answer_id: selectedQuizAnswer.value.id };
  journey.update(data => { data.quiz_drafts[String(selectedQuizId.value)] = { answers, index: currentStudyIndex.value }; });
}, { deep: true });

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

provide('screenContext', { hasHistory, navigateSidebar, pushNavState, flashcardMode, setFlashcardMode, goBack, previousTab, openAuthOrProfile, isOnboardingOpen, onOnboardingCompleted, writingPickerOpen, writingPickerLoading, writingPickerError, writingPickerTopicId, writingPickerTopics, writingPickerLessons, loadWritingTasks, openWritingTaskPicker, openWritingLesson, quizFeedbackMode, quizFeedbackLoading, quizModeLocked, setQuizFeedbackMode, flashcardDecks, flashcardDecksLoading, flashcardDecksError, availableFlashcardDecks, loadFlashcardDecks, onStudyDeckChange, navigateTab, chatSummary, endChatSession, journey, selectedTopic, topicLessons, currentLesson, lessonDetail, lessonQuizzes, lessonDecks, lessonCards, lessonLoading, lessonError, lessonStep, lessonProgress, canFinishLesson, recommendedTopic, startLesson, continueLearning, beginLessonPractice, openLessonQuiz, openLessonDeck, finishLesson, nextLesson, leaveLesson, openSaveWord, savedWordMessage, openLessonChat, studyDeckId, homeError, studyError, chatError, isSavingCardNote, quizInputText, quizResult, canAnswerQuiz, previousQuizQuestion, restartQuiz, requireAuthentication, activeTab, chatConversations, chatHistoryError, chatHistoryLoading, chatInput, chatLoading, chatMessages, chatRecorder, chatScenarioId, chatScrollContainer, checkQuizAnswer, clockInterval, conversationId, copied, copyRewritten, currentCard, currentChatScenario, currentQuestion, currentSpeakingSentenceIndex, currentStudyIndex, currentTime, dashboard, essayInput, flashcards, getActivityBadgeClass, getQuizAnswerClass, getTopicColor, getTopicEmoji, getWordBg, getWordTextColor, homeLoading, isAnalyzingSpeaking, isAuthOpen, isAuthenticated, isBotTyping, isChatHistoryOpen, isChatRecording, startChatVoice, cancelChatVoice, togglePauseRecording, sendChatVoice, isRecordingPaused, recordingDuration, formattedRecordingTime, isCustomSpeakingMode, isEvaluating, isFlipped, isProfileOpen, isRecording, isSubmittingQuiz, loadChatConversations, loadChatScenarios, loadFlashcardsData, loadHomeData, loadQuizzesData, logout, nativeAudioUrl, navigateSpeakingSentence, nextQuizQuestion, onAuthSuccess, onProfileUpdated, onQuizChange, onSpeakingLessonChange, onSpeakingTopicChange, openAuthModal, openChatConversation, playNativeAudio, quizChecked, quizQuestions, quizzesList, recorder, resetChatConversation, scenarios, scrollChatToBottom, selectQuizAnswer, selectedQuizAnswer, selectedQuizId, selectedSpeakingContentId, sendChatText, speakBotMessage, speakText, speakingError, speakingLessonContents, speakingLessonId, speakingLessons, speakingLessonsLoading, speakingResult, speakingTopicId, startChatConversation, createAndSelectCustomScenario, startTopic, stopAndAnalyzeSpeaking, studyLoading, studyMode, submitWritingEvaluation, submittedQuizDetail, switchChatScenario, switchStudyMode, targetIpa, targetSpeakingText, targetTranslation, toggleChatHistory, toggleChatVoice, toggleRecording, topics, totalPracticeCount, totalStudyItems, updateClock, userAvatarUrl, userProfile, wordCount, writingError, writingResult, writingSubTab, flashcardToast, toggleCardNote, nextFlashcard, prevFlashcard, jumpToFlashcard });

onMounted(async () => {
  updateClock();
  clockInterval = setInterval(updateClock, 30000);
  window.addEventListener('auth-expired', onSessionExpired);
  if (authService.isAuthenticated()) {
    const version = sessionVersion;
    try {
      const profile = await authService.getProfile();
      if (version === sessionVersion) userProfile.value = profile;
    } catch (err) {
      // The response interceptor handles invalid sessions. Network failures keep the cached profile.
    }
  }
  await Promise.all([loadHomeData(), loadChatScenarios(), loadFlashcardsData()]);
});

onUnmounted(() => {
  sessionVersion += 1;
  if (clockInterval) clearInterval(clockInterval);
  clearTimeout(flashcardToastTimer);
  window.removeEventListener('auth-expired', onSessionExpired);
  recorder.cleanup();
  chatRecorder.cleanup();
  window.speechSynthesis?.cancel();
});

</script>

