<template>
<div v-if="activeTab === 'chat'" class="flex-1 flex flex-col justify-between h-full min-h-[580px] w-full max-w-3xl mx-auto">
          <!-- Chat Scenario Header (Real from Backend) -->
          <div class="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between shadow-xs">
            <div class="flex items-center space-x-3">
              <div class="relative">
                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
                  <Bot class="w-5 h-5" />
                </div>
                <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <select
                  v-model="chatScenarioId"
                  @change="switchChatScenario"
                  class="text-xs font-extrabold text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  <option v-for="sc in scenarios" :key="sc.id" :value="sc.id">
                    {{ sc.title }}
                  </option>
                </select>
                <p class="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sẵn sàng • Luyện hội thoại cùng AI
                </p>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <button @click="toggleChatHistory" title="Lịch sử trò chuyện" class="inline-flex items-center gap-1.5 rounded-xl border border-violet-100 bg-violet-50 px-2.5 py-2 text-[10px] font-bold text-violet-700 transition hover:bg-violet-100 cursor-pointer">
                <History class="w-3.5 h-3.5" />
                <span>Lịch sử</span>
              </button>
              <button @click="resetChatConversation" title="Bắt đầu cuộc trò chuyện mới" class="text-xs text-gray-400 hover:text-gray-700 p-2 rounded-xl border border-gray-200 cursor-pointer">
                <RotateCcw class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div v-if="isChatHistoryOpen" class="flex-1 min-h-0 overflow-y-auto bg-gradient-to-b from-violet-50/70 to-white p-4">
            <div class="mb-3 flex items-center justify-between">
              <div>
                <h2 class="text-sm font-extrabold text-slate-800">Các cuộc trò chuyện</h2>
                <p class="mt-0.5 text-[10px] text-slate-500">Chọn một cuộc trò chuyện để xem lại tin nhắn</p>
              </div>
              <button @click="toggleChatHistory" aria-label="Đóng lịch sử" class="rounded-xl border border-violet-100 bg-white p-2 text-slate-500 transition hover:bg-violet-50">
                <X class="h-4 w-4" />
              </button>
            </div>

            <div v-if="chatHistoryLoading" class="py-10 text-center text-xs text-slate-500">
              <Loader2 class="mx-auto mb-2 h-5 w-5 animate-spin text-violet-600" />
              Đang tải lịch sử...
            </div>
            <p v-else-if="chatHistoryError" class="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{{ chatHistoryError }}</p>
            <div v-else-if="chatConversations.length" class="space-y-2">
              <button
                v-for="conversation in chatConversations"
                :key="conversation.id"
                type="button"
                class="flex w-full items-center gap-3 rounded-2xl border border-violet-100 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
                @click="openChatConversation(conversation)"
              >
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600">
                  <MessageSquare class="h-4 w-4" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-xs font-extrabold text-slate-800">{{ conversation.scenario_title }}</span>
                  <span class="mt-1 block text-[10px] text-slate-400">{{ formatConversationDate(conversation.created_at) }}</span>
                </span>
                <span class="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{{ Math.round(conversation.fluency_score || 0) }}%</span>
              </button>
            </div>
            <div v-else class="rounded-2xl border border-dashed border-violet-200 bg-white/80 px-5 py-10 text-center">
              <History class="mx-auto mb-2 h-7 w-7 text-violet-300" />
              <p class="text-xs font-bold text-slate-600">Chưa có cuộc trò chuyện nào</p>
              <p class="mt-1 text-[10px] text-slate-400">Các phiên chat của bạn sẽ xuất hiện ở đây.</p>
            </div>
          </div>

          <!-- Chat Scrollable Messages Area -->
          <div v-else ref="chatScrollContainer" class="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">
            <div v-if="chatLoading" class="py-8 text-center text-xs text-gray-500">
              <Loader2 class="w-5 h-5 animate-spin mx-auto text-indigo-600 mb-1" />
              Đang kết nối phiên hội thoại AI...
            </div>

            <template v-else>
              <div v-if="currentChatScenario" class="text-center my-1">
                <span class="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[11px] font-semibold">
                  {{ currentChatScenario.description || 'Nói tiếng Anh tự nhiên cùng AI' }}
                </span>
              </div>

              <!-- Message bubbles -->
              <div v-for="(msg, idx) in chatMessages" :key="idx" class="flex flex-col">
                <!-- Bot Message -->
                <div v-if="msg.sender === 'BOT' || msg.sender === 'bot'" class="flex items-start space-x-2.5 max-w-[85%] self-start">
                  <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles class="w-3.5 h-3.5" />
                  </div>
                  <div class="space-y-1">
                    <div class="bg-white text-gray-800 p-3.5 rounded-2xl rounded-tl-none border border-gray-100 shadow-xs text-xs leading-relaxed">
                      {{ msg.message_text || msg.text }}
                    </div>
                    <button @click="speakBotMessage(msg)" class="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-indigo-600 px-1 transition cursor-pointer">
                      <Volume2 class="w-3 h-3" />
                      <span>Nghe phát âm</span>
                    </button>
                  </div>
                </div>

                <!-- User Message -->
                <div v-else class="flex flex-col items-end max-w-[85%] self-end space-y-1">
                  <div class="bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-none shadow-xs text-xs leading-relaxed">
                    {{ msg.message_text || msg.text }}
                  </div>
                  <div v-if="msg.fluency_score" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Sparkles class="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />
                    Lưu loát: {{ Math.round(msg.fluency_score) }}%
                  </div>
                </div>
              </div>

              <!-- Typing indicator -->
              <div v-if="isBotTyping" class="flex items-start space-x-2.5 max-w-[85%] self-start">
                <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot class="w-4 h-4" />
                </div>
                <div class="bg-white text-gray-400 p-3.5 rounded-2xl rounded-tl-none border border-gray-100 shadow-xs text-xs flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                  <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                  <span class="text-[11px] ml-1">AI đang suy nghĩ...</span>
                </div>
              </div>
            </template>
          </div>

          <!-- Bottom Chat Input Bar -->
          <div v-if="!isChatHistoryOpen" class="p-3 bg-white border-t border-gray-100">
            <div class="flex items-center space-x-2">
              <button
                @click="toggleChatVoice"
                :title="isChatRecording ? 'Dừng & gửi giọng nói' : 'Ghi âm giọng nói'"
                :class="isChatRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                class="w-10 h-10 rounded-xl flex items-center justify-center transition shrink-0 cursor-pointer"
              >
                <Square v-if="isChatRecording" class="w-5 h-5" />
                <Mic v-else class="w-5 h-5" />
              </button>
              <input
                v-model="chatInput"
                @keyup.enter="sendChatText"
                :disabled="isBotTyping || isChatRecording"
                type="text"
                placeholder="Nhập hoặc nhấn mic nói tiếng Anh..."
                class="flex-1 bg-gray-100 text-xs text-gray-800 placeholder-gray-400 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
              />
              <button
                @click="sendChatText"
                :disabled="isBotTyping || !chatInput.trim()"
                class="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white flex items-center justify-center shadow-xs shadow-indigo-600/30 transition shrink-0 cursor-pointer"
              >
                <Send class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
</template>

<script setup>
import { inject } from 'vue';
import { Bot, History, Loader2, MessageSquare, Mic, RotateCcw, Send, Sparkles, Square, Volume2, X } from 'lucide-vue-next';
const ctx = inject('screenContext');
const activeTab = ctx.activeTab;
const chatInput = ctx.chatInput;
const chatLoading = ctx.chatLoading;
const chatMessages = ctx.chatMessages;
const chatConversations = ctx.chatConversations;
const chatHistoryError = ctx.chatHistoryError;
const chatHistoryLoading = ctx.chatHistoryLoading;
const isChatHistoryOpen = ctx.isChatHistoryOpen;
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
const toggleChatHistory = ctx.toggleChatHistory;
const openChatConversation = ctx.openChatConversation;
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

const formatConversationDate = (date) => {
  if (!date) return 'Ngày chưa xác định';
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};
</script>
