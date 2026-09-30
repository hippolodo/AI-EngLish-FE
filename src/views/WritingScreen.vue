<template>
<div v-if="activeTab === 'writing'" class="p-5 space-y-5 pb-24 w-full max-w-3xl mx-auto">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Writing Assistant</span>
              <h1 class="text-lg font-bold text-gray-900 mt-1">AI Essay &amp; Grammar Lab</h1>
            </div>
          </div>

          <!-- Input Area -->
          <div class="space-y-3">
            <div class="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-xs relative focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-transparent">
              <textarea
                v-model="essayInput"
                rows="6"
                class="w-full text-xs text-gray-800 placeholder-gray-400 bg-transparent resize-none focus:outline-none leading-relaxed"
                placeholder="Nhập đoạn văn hoặc bài luận tiếng Anh bạn muốn AI sửa lỗi và chấm điểm IELTS..."
              ></textarea>
              <div class="flex justify-between items-center pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                <span>{{ wordCount }} words • {{ essayInput.length }} chars</span>
                <span class="text-indigo-600 font-medium">Hỗ trợ IELTS &amp; GEC Grammar</span>
              </div>
            </div>

            <!-- Error message if any -->
            <div v-if="writingError" class="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600">
              ⚠️ {{ writingError }}
            </div>

            <!-- Evaluate Button -->
            <button
              @click="submitWritingEvaluation"
              :disabled="isEvaluating || !essayInput.trim()"
              class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles v-if="!isEvaluating" class="w-4 h-4" />
              <Loader2 v-else class="w-4 h-4 animate-spin" />
              <span>{{ isEvaluating ? 'AI Gemini đang chấm bài luận...' : 'Chấm điểm & Sửa lỗi với AI' }}</span>
            </button>
          </div>

          <!-- Real Results Dashboard -->
          <div v-if="writingResult" class="space-y-4 pt-1 border-t border-gray-200/70">
            <!-- Score Card -->
            <div class="bg-gradient-to-r from-gray-900 to-indigo-950 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
              <div>
                <p class="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Điểm đánh giá AI</p>
                <div class="flex items-baseline gap-2 mt-1">
                  <span class="text-3xl font-extrabold text-white">{{ writingResult.overall_score }}</span>
                  <span class="text-xs text-gray-400">/ 100</span>
                </div>
              </div>
              <div class="text-right">
                <span class="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  IELTS Band {{ writingResult.estimated_band || 'N/A' }}
                </span>
                <p class="text-[11px] text-gray-400 mt-1">
                  {{ (writingResult.errors || []).length }} lỗi cần sửa
                </p>
              </div>
            </div>

            <!-- Sub Tabs -->
            <div class="flex bg-gray-200/70 p-1 rounded-xl text-xs font-bold text-gray-600">
              <button
                @click="writingSubTab = 'grammar'"
                :class="writingSubTab === 'grammar' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-gray-900'"
                class="flex-1 py-2 rounded-lg transition text-center flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Sửa lỗi</span>
                <span class="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                  {{ (writingResult.errors || []).length }}
                </span>
              </button>
              <button
                @click="writingSubTab = 'vocab'"
                :class="writingSubTab === 'vocab' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-gray-900'"
                class="flex-1 py-2 rounded-lg transition text-center cursor-pointer"
              >
                Gợi ý từ vựng
              </button>
              <button
                @click="writingSubTab = 'rewrite'"
                :class="writingSubTab === 'rewrite' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-gray-900'"
                class="flex-1 py-2 rounded-lg transition text-center cursor-pointer"
              >
                Bản viết lại chuẩn
              </button>
            </div>

            <!-- Subview 1: Grammar Errors (Real) -->
            <div v-if="writingSubTab === 'grammar'" class="space-y-3">
              <div v-if="!writingResult.errors || writingResult.errors.length === 0" class="p-6 bg-white rounded-2xl border border-gray-100 text-center text-xs text-emerald-600 font-bold">
                🎉 Bài viết không có lỗi ngữ pháp! Rất xuất sắc.
              </div>

              <div
                v-for="(err, idx) in writingResult.errors"
                :key="idx"
                class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2"
              >
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-gray-600">Lỗi #{{ idx + 1 }} • {{ err.error_type || 'Syntax Error' }}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600">Cần sửa</span>
                </div>
                <div class="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between text-xs gap-2">
                  <span class="text-rose-500 line-through font-medium">{{ err.original_fragment }}</span>
                  <ArrowRight class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span class="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {{ err.corrected_fragment }}
                  </span>
                </div>
                <div class="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                  <strong class="text-amber-950">Giải thích:</strong> {{ err.explanation }}
                </div>
              </div>
            </div>

            <!-- Subview 2: Vocab Upgrades (Real) -->
            <div v-if="writingSubTab === 'vocab'" class="space-y-3">
              <div v-if="!writingResult.vocabulary_suggestions || writingResult.vocabulary_suggestions.length === 0" class="p-6 bg-white rounded-2xl border border-gray-100 text-center text-xs text-gray-500">
                Không có gợi ý nâng cấp từ vựng thêm.
              </div>

              <div
                v-for="(vocab, idx) in writingResult.vocabulary_suggestions"
                :key="idx"
                class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs text-xs space-y-1"
              >
                <div class="flex items-center gap-1.5 text-indigo-700 font-semibold">
                  <Sparkles class="w-3.5 h-3.5 text-indigo-500" />
                  <span>Gợi ý #{{ idx + 1 }}:</span>
                </div>
                <p class="text-gray-700 leading-relaxed">{{ vocab }}</p>
              </div>
            </div>

            <!-- Subview 3: Rewritten Essay (Real) -->
            <div v-if="writingSubTab === 'rewrite'" class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Sparkles class="w-4 h-4 text-indigo-600" />
                  Bản AI biên tập hoàn thiện
                </span>
                <button @click="copyRewritten" class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer">
                  <Check v-if="copied" class="w-3 h-3" />
                  <Copy v-else class="w-3 h-3" />
                  <span>{{ copied ? 'Đã sao chép!' : 'Sao chép' }}</span>
                </button>
              </div>
              <div class="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 leading-relaxed font-normal whitespace-pre-line">
                {{ writingResult.corrected_text }}
              </div>
            </div>
          </div>
        </div>
</template>

<script setup>
import { inject } from 'vue';
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
