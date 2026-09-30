<template>
<div v-if="activeTab === 'speaking'" class="p-5 space-y-5 pb-28 w-full max-w-3xl mx-auto">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Speaking Lab</span>
              <h1 class="text-lg font-bold text-gray-900 mt-1">Chẩn đoán Phát âm AI</h1>
            </div>
            <span class="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles class="w-3.5 h-3.5 text-indigo-500" /> Luyện phát âm cùng AI
            </span>
          </div>

          <!-- Lesson & Target Picker -->
          <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-gray-700">Câu luyện tập:</span>
              <button
                @click="isCustomSpeakingMode = !isCustomSpeakingMode"
                class="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
              >
                {{ isCustomSpeakingMode ? 'Chọn từ bài học' : 'Tự nhập câu tự do' }}
              </button>
            </div>

            <TopicLessonDropdowns
              v-if="!isCustomSpeakingMode"
              :topics="topics"
              :lessons="speakingLessons"
              v-model:topic-id="speakingTopicId"
              v-model:lesson-id="speakingLessonId"
              :loading="speakingLessonsLoading"
              @topic-change="onSpeakingTopicChange"
              @lesson-change="onSpeakingLessonChange"
            />

            <div v-if="!isCustomSpeakingMode && speakingLessonContents.length > 0" class="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 via-white to-amber-50/60 p-3">
              <div class="mb-2 flex items-center justify-between">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-violet-700">Luyện từng câu</span>
                <span class="rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold text-violet-600 shadow-sm">
                  {{ currentSpeakingSentenceIndex + 1 }} / {{ speakingLessonContents.length }}
                </span>
              </div>
              <div class="mb-3 flex gap-1">
                <span
                  v-for="(_, index) in speakingLessonContents"
                  :key="index"
                  class="h-1.5 flex-1 rounded-full transition-colors"
                  :class="index <= currentSpeakingSentenceIndex ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-violet-100'"
                ></span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <button
                  type="button"
                  :disabled="currentSpeakingSentenceIndex === 0"
                  class="inline-flex items-center gap-1 rounded-xl border border-violet-100 bg-white px-3 py-2 text-[11px] font-bold text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
                  @click="navigateSpeakingSentence(-1)"
                >
                  <ChevronLeft class="h-3.5 w-3.5" /> Trước
                </button>
                <span class="text-[10px] font-semibold text-slate-400">Đọc câu hiện tại rồi chuyển câu</span>
                <button
                  type="button"
                  :disabled="currentSpeakingSentenceIndex >= speakingLessonContents.length - 1"
                  class="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-2 text-[11px] font-bold text-white shadow-md shadow-violet-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                  @click="navigateSpeakingSentence(1)"
                >
                  Tiếp <ChevronRight class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <!-- Target Sentence Display / Input -->
            <div class="space-y-2">
              <textarea
                v-model="targetSpeakingText"
                :readonly="!isCustomSpeakingMode"
                rows="2"
                class="w-full text-sm font-semibold text-gray-900 rounded-xl p-3 border leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-600"
                :class="isCustomSpeakingMode ? 'bg-white border-indigo-300' : 'bg-gray-50 border-gray-100 cursor-default'"
                placeholder="Nhập câu tiếng Anh bạn muốn luyện nói..."
              ></textarea>

              <div class="flex items-center justify-between pt-1">
                <button
                  @click="playNativeAudio"
                  :disabled="!targetSpeakingText"
                  class="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
                >
                  <Volume2 class="w-4 h-4" />
                  <span>Nghe phát âm mẫu</span>
                </button>
                <span v-if="targetIpa" class="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  /{{ targetIpa }}/
                </span>
              </div>

              <p v-if="targetTranslation" class="text-xs text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200/60">
                💡 <strong>Dịch:</strong> {{ targetTranslation }}
              </p>
            </div>
          </div>

          <!-- AI Evaluation Results (Real from API) -->
          <div v-if="speakingResult" class="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Cpu class="w-4 h-4 text-indigo-600" />
                <h3 class="text-sm font-bold text-gray-900">Kết quả phân tích âm vị thực tế</h3>
              </div>
              <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-sm font-extrabold text-emerald-600">{{ Math.round(speakingResult.overall_score) }} / 100</span>
              </div>
            </div>

            <!-- Pitch F0 & Recognized Text -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <span class="text-gray-500 block">Cao độ giọng nói:</span>
                <span class="font-bold text-gray-800 text-sm">
                  {{ speakingResult.average_pitch ? Math.round(speakingResult.average_pitch) + ' Hz' : 'N/A' }}
                </span>
              </div>
              <div class="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <span class="text-gray-500 block">Kết quả nhận diện:</span>
                <span class="font-semibold text-gray-800 text-xs truncate block" :title="speakingResult.transcribed_text">
                  "{{ speakingResult.transcribed_text || 'Chưa ghi nhận' }}"
                </span>
              </div>
            </div>

            <!-- Sentence Breakdown with word highlighting -->
            <div v-if="speakingResult.word_analysis && speakingResult.word_analysis.length > 0" class="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
              <p class="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wide">Chi tiết độ khớp từng từ:</p>
              <div class="flex flex-wrap gap-2 text-xs leading-loose">
                <span
                  v-for="(w, idx) in speakingResult.word_analysis"
                  :key="idx"
                  :style="{ backgroundColor: getWordBg(w), color: getWordTextColor(w) }"
                  class="font-semibold px-2 py-0.5 rounded border border-gray-200/60"
                  :title="`Phát âm mẫu: /${w.target_ipa}/ - Phát âm của bạn: /${w.user_ipa}/`"
                >
                  {{ w.word }}
                  <span class="text-[10px] ml-0.5">{{ w.status === 'CORRECT' ? '✓' : '✕' }}</span>
                </span>
              </div>
            </div>

            <!-- Phonetic Error Tip Box -->
            <div v-if="speakingResult.ai_feedback" class="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-1">
              <p class="font-bold text-amber-900 flex items-center gap-1.5">
                <Lightbulb class="w-3.5 h-3.5 text-amber-600" /> Nhận xét từ AI:
              </p>
              <p class="text-amber-800 text-[11px] leading-relaxed whitespace-pre-line">
                {{ speakingResult.ai_feedback }}
              </p>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="speakingError" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600">
            ⚠️ {{ speakingError }}
          </div>

          <!-- Interaction Area (Centered Mic button with pulsating rings) -->
          <div class="pt-4 flex flex-col items-center justify-center space-y-3">
            <div class="relative flex items-center justify-center">
              <span v-if="isRecording" class="absolute w-24 h-24 rounded-full bg-rose-500/30 animate-ping"></span>
              <span v-if="isRecording" class="absolute w-20 h-20 rounded-full bg-rose-500/40 animate-pulse"></span>
              <button
                @click="toggleRecording"
                :disabled="isAnalyzingSpeaking"
                :aria-label="isAnalyzingSpeaking ? 'Đang phân tích giọng nói' : isRecording ? 'Dừng ghi âm và gửi chấm điểm' : 'Bắt đầu ghi âm'"
                :title="isRecording ? 'Dừng ghi âm và gửi chấm điểm' : 'Bắt đầu ghi âm'"
                :class="isRecording ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'"
                class="relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Square v-if="isRecording" class="w-8 h-8" />
                <Mic v-else-if="!isAnalyzingSpeaking" class="w-8 h-8" />
                <Loader2 v-else class="w-8 h-8 animate-spin" />
              </button>
            </div>
            <div class="text-center">
              <p class="text-xs font-bold text-gray-800">
                {{ isAnalyzingSpeaking ? 'AI đang đánh giá cách phát âm...' : (isRecording ? 'Đang nghe... Bấm để gửi bài đọc' : 'Nhấn nút để bắt đầu đọc câu mẫu') }}
              </p>
              <p class="text-[11px] text-gray-400 mt-0.5">
                {{ isRecording ? 'Nói to, rõ câu tiếng Anh vào micro' : 'Ghi âm bằng micro, nhận góp ý tự động' }}
              </p>
            </div>
          </div>
        </div>
</template>

<script setup>
import { inject } from 'vue';
import { ChevronLeft, ChevronRight, Cpu, Lightbulb, Loader2, Mic, Sparkles, Square, Volume2 } from 'lucide-vue-next';
import TopicLessonDropdowns from '../components/TopicLessonDropdowns.vue';
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
const speakingLessonsLoading = ctx.speakingLessonsLoading;
const speakingLessonContents = ctx.speakingLessonContents;
const currentSpeakingSentenceIndex = ctx.currentSpeakingSentenceIndex;
const navigateSpeakingSentence = ctx.navigateSpeakingSentence;
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
