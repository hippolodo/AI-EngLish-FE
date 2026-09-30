<template>
<div v-if="activeTab === 'home'" class="p-5 space-y-5 pb-24 w-full max-w-3xl mx-auto">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="relative cursor-pointer" @click="openAuthModal">
                <img
                  alt="Learner Avatar"
                  class="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-600 p-0.5"
                  :src="userAvatarUrl"
                />
                <span class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500">Xin chào mừng 👋</p>
                <h1 class="text-lg font-bold text-gray-900 leading-tight">
                  {{ userProfile?.full_name || dashboard?.full_name || 'Học viên AI' }}
                </h1>
              </div>
            </div>
            <button
              @click="openAuthModal"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-xs cursor-pointer transition"
            >
              <Award class="w-3.5 h-3.5 text-indigo-600" />
              {{ userProfile?.target_level || dashboard?.target_level || 'Intermediate' }}
            </button>
          </div>

          <!-- Loading State for Dashboard -->
          <div v-if="homeLoading" class="py-10 text-center space-y-2">
            <Loader2 class="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
            <p class="text-xs text-gray-500">Đang tải tiến độ học tập từ CSDL...</p>
          </div>

          <template v-else>
            <!-- Progress & Stats Card -->
            <div class="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
              <div class="flex justify-between items-start mb-4">
                <div>
                  <div class="flex items-center gap-1.5 text-indigo-200 text-xs font-medium">
                    <Flame class="w-4 h-4 text-orange-400 fill-orange-400" />
                    <span>Tổng lượt rèn luyện</span>
                  </div>
                  <div class="text-2xl font-extrabold mt-0.5 tracking-tight flex items-baseline gap-1">
                    {{ totalPracticeCount }} <span class="text-xs font-medium text-indigo-200">Phiên hoàn thành</span>
                  </div>
                </div>
                <div class="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-xl border border-white/10 text-[11px] font-semibold">
                  <Sparkles class="w-3 h-3 text-amber-300" />
                  <span>Mục tiêu: {{ userProfile?.target_level || dashboard?.target_level || 'B1-B2' }}</span>
                </div>
              </div>

              <!-- Quick Stats Row (Real data from DB) -->
              <div class="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-white/15 text-center">
                <div>
                  <p class="text-[10px] text-indigo-200">Phát âm TB</p>
                  <p class="text-sm font-bold text-white">
                    {{ dashboard?.speaking?.average_score ? Math.round(dashboard.speaking.average_score) + 'đ' : 'Chưa có' }}
                  </p>
                  <p class="text-[9px] text-indigo-300 mt-0.5">{{ dashboard?.speaking?.total_sessions || 0 }} bài đọc</p>
                </div>
                <div class="border-x border-white/15">
                  <p class="text-[10px] text-indigo-200">Viết luận</p>
                  <p class="text-sm font-bold text-white">
                    {{ dashboard?.writing?.estimated_band ? 'Band ' + dashboard.writing.estimated_band : 'Chưa có' }}
                  </p>
                  <p class="text-[9px] text-indigo-300 mt-0.5">{{ dashboard?.writing?.total_essays || 0 }} bài chấm</p>
                </div>
                <div>
                  <p class="text-[10px] text-indigo-200">Hội thoại AI</p>
                  <p class="text-sm font-bold text-white">
                    {{ dashboard?.chat?.average_fluency ? Math.round(dashboard.chat.average_fluency) + '%' : 'Chưa có' }}
                  </p>
                  <p class="text-[9px] text-indigo-300 mt-0.5">{{ dashboard?.chat?.total_messages || 0 }} tin nhắn</p>
                </div>
              </div>
            </div>

            <!-- Quick Action AI Banner -->
            <div class="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Bot class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="text-sm font-bold text-emerald-950">AI Chatbot Đóng vai sẵn sàng</h4>
                  <p class="text-[11px] text-emerald-700">Luyện giao tiếp trực tiếp qua giọng nói 2 chiều</p>
                </div>
              </div>
              <button @click="activeTab = 'chat'" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer">
                Nói chuyện
              </button>
            </div>

            <!-- Topics Section (Real data from MySQL) -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h2 class="text-base font-bold text-gray-900">Chủ đề từ CSDL</h2>
                  <p class="text-xs text-gray-500">Giáo trình chuẩn hóa theo khung tham chiếu CEFR</p>
                </div>
                <span class="text-xs text-indigo-600 font-semibold cursor-pointer hover:underline" @click="loadHomeData">Làm mới</span>
              </div>

              <div ref="levelDropdownRoot" class="relative mb-3" @keydown.esc="levelMenuOpen = false">
                <button
                  type="button"
                  :aria-expanded="levelMenuOpen"
                  aria-haspopup="listbox"
                  aria-label="Lọc chủ đề theo trình độ"
                  class="flex w-full items-center gap-2.5 rounded-2xl border border-violet-100 bg-gradient-to-r from-white to-violet-50/80 p-2.5 text-left shadow-sm shadow-violet-100/70 transition hover:border-violet-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100"
                  @click="levelMenuOpen = !levelMenuOpen"
                >
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <SlidersHorizontal class="h-4 w-4" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block text-[9px] font-extrabold uppercase tracking-[0.14em] text-violet-500">Lọc theo trình độ</span>
                    <span class="mt-0.5 block truncate text-xs font-extrabold text-slate-800">{{ selectedLevelLabel }}</span>
                  </span>
                  <span class="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-violet-600 shadow-sm">{{ filteredTopics.length }} chủ đề</span>
                  <ChevronDown :class="levelMenuOpen ? 'rotate-180' : ''" class="h-4 w-4 shrink-0 text-violet-500 transition-transform" />
                </button>

                <Transition name="picker-pop">
                  <div v-if="levelMenuOpen" role="listbox" aria-label="Trình độ chủ đề" class="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-violet-100 bg-white/95 p-1.5 shadow-xl shadow-violet-950/10 backdrop-blur-xl">
                    <button
                      v-for="level in topicLevelOptions"
                      :key="level.value"
                      type="button"
                      role="option"
                      :aria-selected="selectedTopicLevel === level.value"
                      class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-violet-50"
                      :class="selectedTopicLevel === level.value ? 'bg-violet-50' : ''"
                      @click="selectTopicLevel(level.value)"
                    >
                      <span class="h-2.5 w-2.5 shrink-0 rounded-full" :class="level.dotClass"></span>
                      <span class="flex-1 text-xs font-bold text-slate-700">{{ level.label }}</span>
                      <span class="text-[10px] font-semibold text-slate-400">{{ level.count }}</span>
                      <Check v-if="selectedTopicLevel === level.value" class="h-3.5 w-3.5 text-violet-600" />
                    </button>
                  </div>
                </Transition>
              </div>

              <!-- Topic Cards -->
              <div class="space-y-3">
                <div
                  v-for="topic in visibleTopics"
                  :key="topic.id"
                  class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div class="flex items-center space-x-3.5">
                    <div :class="getTopicColor(topic.level)" class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner font-bold">
                      <span>{{ getTopicEmoji(topic.title) }}</span>
                    </div>
                    <div>
                      <div class="flex items-center space-x-2">
                        <h3 class="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition">{{ topic.title }}</h3>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                          {{ topic.level }}
                        </span>
                      </div>
                      <p class="text-xs text-gray-500 mt-0.5 line-clamp-1">{{ topic.description }}</p>
                      <div class="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                        <span class="flex items-center gap-1"><BookOpen class="w-3 h-3 text-indigo-400" /> Giáo trình</span>
                        <span class="flex items-center gap-1"><CheckCircle class="w-3 h-3 text-emerald-500" /> CSDL Aiven</span>
                      </div>
                    </div>
                  </div>
                  <button
                    @click="startTopic(topic)"
                    class="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>Luyện tập</span>
                    <ChevronRight class="w-3.5 h-3.5" />
                  </button>
                </div>
                <p v-if="filteredTopics.length === 0" class="rounded-xl bg-white border border-gray-100 p-4 text-center text-xs text-gray-500">
                  Chưa có chủ đề ở trình độ này.
                </p>
              </div>

              <button
                v-if="filteredTopics.length > 4"
                @click="showAllTopics = !showAllTopics"
                class="w-full mt-3 py-2.5 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition cursor-pointer"
              >
                {{ showAllTopics ? 'Thu gọn' : `Xem thêm (${filteredTopics.length - 4})` }}
              </button>
            </div>

            <!-- Recent Activities (Real) -->
            <div v-if="dashboard?.recent_activities && dashboard.recent_activities.length > 0">
              <h2 class="text-base font-bold text-gray-900 mb-3">Lịch sử rèn luyện gần nhất</h2>
              <div class="space-y-2">
                <div
                  v-for="(act, idx) in dashboard.recent_activities.slice(0, 5)"
                  :key="idx"
                  class="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between text-xs"
                >
                  <div class="flex items-center space-x-2.5">
                    <span :class="getActivityBadgeClass(act.type)" class="px-2 py-0.5 rounded-md font-bold text-[10px]">
                      {{ act.type }}
                    </span>
                    <span class="font-medium text-gray-700 truncate max-w-[200px]">{{ act.title }}</span>
                  </div>
                  <span v-if="act.score !== null && act.score !== undefined" class="font-bold text-emerald-600">
                    {{ Math.round(act.score) }}đ
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { Check, ChevronDown, SlidersHorizontal } from 'lucide-vue-next';
const ctx = inject('screenContext');
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
const submitCardReview = ctx.submitCardReview;
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
const selectedTopicLevel = ref('all');
const showAllTopics = ref(false);
const levelMenuOpen = ref(false);
const levelDropdownRoot = ref(null);
const topicLevelOptions = computed(() => [
  { value: 'all', label: 'Tất cả trình độ', count: topics.value.length, dotClass: 'bg-violet-500' },
  { value: 'Beginner', label: 'Beginner', count: topics.value.filter(topic => topic.level === 'Beginner').length, dotClass: 'bg-emerald-500' },
  { value: 'Intermediate', label: 'Intermediate', count: topics.value.filter(topic => topic.level === 'Intermediate').length, dotClass: 'bg-sky-500' },
  { value: 'Advanced', label: 'Advanced', count: topics.value.filter(topic => topic.level === 'Advanced').length, dotClass: 'bg-fuchsia-500' }
]);
const selectedLevelLabel = computed(() => topicLevelOptions.value.find(level => level.value === selectedTopicLevel.value)?.label || 'Tất cả trình độ');
const filteredTopics = computed(() => selectedTopicLevel.value === 'all'
  ? topics.value
  : topics.value.filter(topic => topic.level === selectedTopicLevel.value));
const visibleTopics = computed(() => showAllTopics.value
  ? filteredTopics.value
  : filteredTopics.value.slice(0, 4));
const selectTopicLevel = (level) => {
  selectedTopicLevel.value = level;
  showAllTopics.value = false;
  levelMenuOpen.value = false;
};
const closeLevelMenuOnOutsideClick = (event) => {
  if (!levelDropdownRoot.value?.contains(event.target)) levelMenuOpen.value = false;
};
onMounted(() => document.addEventListener('click', closeLevelMenuOnOutsideClick));
onBeforeUnmount(() => document.removeEventListener('click', closeLevelMenuOnOutsideClick));
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
