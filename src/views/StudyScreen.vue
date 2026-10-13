<template>
<div v-if="activeTab === 'study'" class="p-5 space-y-5 pb-24 w-full max-w-3xl mx-auto">
          <!-- Header & Flow Progress -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs uppercase tracking-wide font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Flashcard &amp; Quiz</span>
                <h1 class="text-gray-900 mt-1 text-xl font-bold leading-snug">Luyện tập</h1>
              </div>
              <span v-if="totalStudyItems > 0" class="text-sm font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-full">
                Mục {{ currentStudyIndex + 1 }} / {{ totalStudyItems }}
              </span>
            </div>
            <p class="text-sm text-slate-500">{{ ctx.currentLesson.value ? 'Ôn từ vựng và kiểm tra kiến thức của bài đang học.' : 'Ôn từ vựng bằng flashcard hoặc kiểm tra kiến thức qua quiz.' }}</p>
            <div v-if="totalStudyItems > 0" class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                :style="{ width: ((currentStudyIndex + 1) / totalStudyItems * 100) + '%' }"
                class="h-full bg-indigo-600 rounded-full transition-all duration-300"
              ></div>
            </div>
          </div>

          <!-- Toggle: Flashcard Mode vs Quiz Mode -->
          <div class="flex bg-gray-200/70 p-1 rounded-xl text-sm font-semibold text-gray-600">
            <button
              :disabled="studyLoading || isSubmittingQuiz || ctx.quizFeedbackLoading.value || isReviewingCard" @click="switchStudyMode('flashcard')"
              :class="studyMode === 'flashcard' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-gray-900'"
              class="flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Layers class="w-3.5 h-3.5" />
              <span>Flashcard</span>
            </button>
            <button
              :disabled="studyLoading || isSubmittingQuiz || ctx.quizFeedbackLoading.value || isReviewingCard" @click="switchStudyMode('quiz')"
              :class="studyMode === 'quiz' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-gray-900'"
              class="flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle class="w-3.5 h-3.5" />
              <span>Quiz</span>
            </button>
          </div>

          <div v-if="studyMode === 'flashcard' && isAuthenticated" class="space-y-2 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-sky-50 p-4">
            <label for="flashcard-deck" class="flex items-center gap-2 text-sm font-semibold text-violet-900"><Layers class="h-4 w-4" aria-hidden="true" />Chọn bộ từ theo bài học</label>
            <select id="flashcard-deck" v-model="ctx.studyDeckId.value" @change="ctx.onStudyDeckChange" :disabled="studyLoading || isReviewingCard || isSubmittingQuiz || ctx.flashcardDecksLoading.value" class="w-full rounded-xl border border-violet-200 bg-white p-3 text-sm text-slate-800 disabled:opacity-60">
              <option v-if="!ctx.currentLesson.value" :value="null">Tất cả bài học &amp; bộ từ cá nhân</option>
              <optgroup v-if="ctx.availableFlashcardDecks.value.some(deck => deck.lesson_id)" label="Theo bài học">
                <option v-for="deck in ctx.availableFlashcardDecks.value.filter(deck => deck.lesson_id)" :key="deck.id" :value="deck.id">{{ deck.title.replace(/^Vocabulary:\s*/i, '') }} · {{ deck.total_cards }} từ</option>
              </optgroup>
              <optgroup v-if="ctx.availableFlashcardDecks.value.some(deck => !deck.lesson_id)" label="Bộ từ khác & cá nhân">
                <option v-for="deck in ctx.availableFlashcardDecks.value.filter(deck => !deck.lesson_id)" :key="deck.id" :value="deck.id">{{ deck.title }} · {{ deck.total_cards }} từ</option>
              </optgroup>
            </select>
            <p v-if="ctx.flashcardDecksLoading.value" role="status" class="text-xs text-violet-700">Đang tải danh sách bộ từ…</p>
            <p v-else-if="ctx.flashcardDecksError.value && !ctx.currentLesson.value" role="alert" class="text-xs text-rose-700">{{ ctx.flashcardDecksError.value }} <button @click="ctx.loadFlashcardDecks" class="font-semibold underline">Thử lại</button></p>
            <p class="text-xs text-slate-600">{{ ctx.currentLesson.value ? 'Các bộ từ của bài đang học. Chọn Luyện tự do để ôn bài khác.' : 'Chọn bài để ôn riêng, hoặc chọn Tất cả để ôn chung.' }} Chỉ hiện thẻ mới và thẻ đến hạn.</p>
          </div>

          <p v-if="studyError" role="alert" class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{{ studyError }}</p>
          <div v-if="!isAuthenticated" class="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-700">
            Đăng nhập để lưu kết quả học và ôn thẻ cá nhân.
            <button @click="requireAuthentication" class="ml-1 font-semibold underline">Đăng nhập</button>
          </div>
          <!-- Loading State -->
          <div v-if="studyLoading" class="py-12 text-center space-y-2">
            <Loader2 class="w-7 h-7 animate-spin text-indigo-600 mx-auto" />
            <p class="text-sm text-gray-500">Đang tải nội dung học tập...</p>
          </div>

          <!-- STATE A: FLASHCARD MODE (REAL SRS) -->
          <div v-else-if="studyMode === 'flashcard'" class="space-y-4">
            <div v-if="ctx.reviewSummary.value" class="space-y-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
              <p class="font-semibold">Đã ôn {{ ctx.reviewSummary.value.total }} lượt thẻ.</p>
              <p class="text-sm">{{ ctx.reviewSummary.value.retry }} thẻ cần luyện lại.</p>
              <button v-if="ctx.reviewSummary.value.retry" @click="ctx.retryForgottenCards" class="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Luyện lại thẻ chưa nhớ</button>
              <div v-if="ctx.currentLesson.value" class="flex flex-wrap gap-3 pt-2">
                <button v-if="ctx.lessonQuizzes.value.length" @click="ctx.openLessonQuiz" class="font-semibold underline underline-offset-4">Làm quiz của bài →</button>
                <button @click="activeTab = 'lesson'" class="font-semibold underline underline-offset-4">Trở về bài học</button>
              </div>
            </div>
            <div v-if="flashcards.length === 0" class="p-8 bg-white rounded-3xl border border-gray-100 text-center space-y-3">
              <Layers class="w-10 h-10 text-indigo-300 mx-auto" />
              <h3 class="text-sm font-semibold text-gray-800">Chưa có thẻ cần ôn tập</h3>
              <p class="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                {{ ctx.studyDeckId.value ? 'Bộ từ đã chọn không có thẻ mới hoặc thẻ đến hạn.' : 'Bạn đã ôn xong các thẻ hiện có hoặc chưa có thẻ mới.' }} Thẻ đã nhớ sẽ xuất hiện lại theo lịch ôn.
              </p>
              <button @click="loadFlashcardsData" class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-100 cursor-pointer">
                Tải lại danh sách
              </button>
            </div>

            <div v-else class="space-y-4">
              <div
                @click="isFlipped = !isFlipped"
                @keydown.enter.self.prevent="isFlipped = !isFlipped"
                @keydown.space.self.prevent="isFlipped = !isFlipped"
                tabindex="0"
                role="group"
                :aria-label="isFlipped ? 'Quay về mặt trước của flashcard' : 'Lật flashcard để xem nghĩa và ví dụ'"
                class="flashcard-stage w-full h-72 cursor-pointer select-none outline-none"
              >
                <div :class="{ 'is-flipped': isFlipped }" class="flashcard-inner relative w-full h-full">
                  <!-- FRONT SIDE -->
                  <div class="flashcard-face flashcard-front absolute inset-0 bg-white rounded-3xl p-6 border border-violet-100 shadow-lg flex flex-col justify-between items-center text-center">
                    <div class="w-full flex justify-between items-center">
                      <span class="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg">Từ vựng</span>
                      <button @click.stop="speakText(currentCard.word)" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 flex items-center justify-center cursor-pointer">
                        <Volume2 class="w-4 h-4" />
                      </button>
                    </div>
                    <div class="space-y-2">
                      <h2 class="text-3xl font-semibold text-gray-900 tracking-normal">{{ currentCard.word }}</h2>
                      <p v-if="currentCard.ipa" class="text-sm font-sans text-gray-500">{{ currentCard.ipa }}</p>
                    </div>
                    <div class="text-xs text-gray-400 flex items-center gap-1">
                      <RotateCw class="w-3 h-3" />
                      <span>Chạm để lật xem nghĩa &amp; ví dụ</span>
                    </div>
                  </div>

                  <!-- BACK SIDE -->
                  <div class="flashcard-face flashcard-back absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-amber-50 rounded-3xl p-6 border border-violet-200 shadow-lg flex flex-col justify-between text-left">
                    <div class="flex justify-between items-center">
                      <span class="text-xs font-semibold px-2.5 py-1 bg-indigo-600 text-white rounded-lg uppercase">Nghĩa tiếng Việt</span>
                      <span class="text-xs font-semibold text-gray-500">Ôn tập thông minh</span>
                    </div>
                    <div class="space-y-2">
                      <h3 class="text-xl font-semibold text-gray-900">{{ currentCard.meaning || 'Chưa cập nhật nghĩa' }}</h3>
                      <p v-if="currentCard.hint_example" class="text-sm text-gray-600 italic border-l-2 border-indigo-400 pl-3 py-1">
                        "{{ currentCard.hint_example }}"
                      </p>
                    </div>
                    <p class="text-xs text-gray-500 text-center">
                      Chạm để quay lại mặt trước
                    </p>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="grid grid-cols-2 gap-3 pt-2">
                <button :disabled="isReviewingCard" @click="submitCardReview(false)" class="py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer">
                  <RotateCcw class="w-4 h-4" />
                  <span>Chưa nhớ (Ôn lại)</span>
                </button>
                <button :disabled="isReviewingCard" @click="submitCardReview(true)" class="py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer">
                  <Check class="w-4 h-4" />
                  <span>{{ isReviewingCard ? 'Đang lưu…' : 'Đã thuộc' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- STATE B: QUIZ MODE (REAL DB QUIZZES) -->
          <div v-else-if="studyMode === 'quiz'" class="space-y-4">
            <div class="space-y-2 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3">
              <p class="text-sm font-semibold text-indigo-900">Cách xem kết quả</p>
              <div class="grid grid-cols-2 gap-2">
                <button @click="ctx.setQuizFeedbackMode('end')" :disabled="ctx.quizModeLocked.value" :aria-pressed="ctx.quizFeedbackMode.value === 'end'" class="rounded-xl border px-2 py-2 text-sm font-semibold transition disabled:cursor-default" :class="ctx.quizFeedbackMode.value === 'end' ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-indigo-100 bg-white text-indigo-700'">Chấm cuối bài</button>
                <button @click="ctx.setQuizFeedbackMode('immediate')" :disabled="ctx.quizModeLocked.value" :aria-pressed="ctx.quizFeedbackMode.value === 'immediate'" class="rounded-xl border px-2 py-2 text-sm font-semibold transition disabled:cursor-default" :class="ctx.quizFeedbackMode.value === 'immediate' ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-indigo-100 bg-white text-indigo-700'">Xem đáp án ngay</button>
              </div>
              <p class="text-xs text-slate-600">{{ ctx.quizFeedbackMode.value === 'immediate' ? 'Chọn đáp án để xem đúng/sai và giải thích. Câu đã chấm được giữ nguyên đến hết lượt.' : 'Làm các câu rồi nộp toàn bài để xem kết quả.' }}</p>
              <button v-if="ctx.quizModeLocked.value && !isSubmittingQuiz && !ctx.quizFeedbackLoading.value && !quizResult" @click="restartQuiz" class="text-xs font-semibold text-indigo-700 underline underline-offset-4">Làm lại để đổi chế độ</button>
            </div>
            <div v-if="quizResult" role="status" class="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
              <p class="font-semibold">Kết quả: {{ quizResult.score }}/100 — {{ quizResult.is_passed ? 'Đạt' : 'Chưa đạt' }}</p>
              <p class="mt-1 text-sm">Đúng {{ quizResult.correct_answers }}/{{ quizResult.total_questions }} câu. Xem lại lời giải bên dưới.</p>
              <button @click="restartQuiz" class="mt-2 text-sm font-semibold underline">Làm lại bài</button>
              <button v-if="ctx.currentLesson.value" @click="ctx.lessonStep.value = 'summary'; activeTab = 'lesson'" class="ml-3 text-sm font-semibold underline">Tổng kết bài học →</button>
            </div>
            <!-- Quiz select -->
            <div v-if="quizzesList.length > 1" class="flex items-center space-x-2">
              <label class="text-sm font-semibold text-gray-500 shrink-0">Chọn đề:</label>
              <select
                v-model="selectedQuizId"
                :disabled="isSubmittingQuiz || ctx.quizFeedbackLoading.value" @change="onQuizChange"
                class="flex-1 text-sm bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-600 truncate"
              >
                <option v-for="q in quizzesList" :key="q.id" :value="q.id">
                  {{ q.title }}
                </option>
              </select>
            </div>

            <div v-if="quizQuestions.length === 0" class="p-8 bg-white rounded-3xl border border-gray-100 text-center space-y-3">
              <HelpCircle class="w-10 h-10 text-indigo-300 mx-auto" />
              <h3 class="text-sm font-semibold text-gray-800">Chưa có câu hỏi trắc nghiệm</h3>
              <p class="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                Bộ câu hỏi này hiện chưa có câu hỏi.
              </p>
              <button @click="loadQuizzesData" class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-100 cursor-pointer">
                Tải lại danh sách
              </button>
            </div>

            <div v-else class="space-y-4">
              <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-2">
                <span class="text-xs font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Câu hỏi {{ currentStudyIndex + 1 }} / {{ quizQuestions.length }}
                </span>
                <p class="reading-text text-sm text-gray-900 leading-relaxed">
                  {{ currentQuestion.question_text }}
                </p>
              </div>

              <audio v-if="currentQuestion.audio_url" :key="currentQuestion.id" :src="getFullAudioUrl(currentQuestion.audio_url)" controls class="w-full" />
              <img v-if="currentQuestion.image_url" :src="getFullAudioUrl(currentQuestion.image_url)" alt="Minh họa câu hỏi" class="max-h-48 rounded-xl object-contain mx-auto" />
              <label v-if="currentQuestion.question_type === 'FILL_BLANK'" class="block space-y-2 text-sm font-semibold text-gray-600">
                Điền đáp án
                <input v-model="quizInputText" :disabled="quizChecked || isSubmittingQuiz || ctx.quizFeedbackLoading.value" @keyup.enter="checkQuizAnswer" class="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-900" placeholder="Nhập từ hoặc cụm từ…" />
              </label>
              <!-- Answer options -->
              <div v-if="currentQuestion.question_type !== 'FILL_BLANK'" class="space-y-2.5">
                <button
                  v-for="(ans, aIdx) in (currentQuestion.answers || [])"
                  :key="ans.id || aIdx"
                  @click="selectQuizAnswer(ans)"
                  :disabled="quizChecked || isSubmittingQuiz || ctx.quizFeedbackLoading.value"
                  :class="getQuizAnswerClass(ans)"
                  class="w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center justify-between text-sm font-semibold cursor-pointer"
                >
                  <span class="flex items-center gap-2.5">
                    <span class="w-6 h-6 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-semibold text-xs">
                      {{ ['A','B','C','D'][aIdx] || (aIdx + 1) }}
                    </span>
                    <span>{{ ans.answer_text }}</span>
                  </span>
                  <CheckCircle v-if="quizChecked && submittedQuizDetail?.is_correct && selectedQuizAnswer?.id === ans.id" class="w-4 h-4 text-emerald-600" />
                  <XCircle v-else-if="quizChecked && !submittedQuizDetail?.is_correct && selectedQuizAnswer?.id === ans.id" class="w-4 h-4 text-rose-500" />
                </button>
              </div>

              <!-- Explanation Banner -->
              <div
                v-if="quizChecked && submittedQuizDetail" role="status" aria-live="polite"
                :class="submittedQuizDetail?.is_correct ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'"
                class="p-4 rounded-xl border text-sm space-y-1"
              >
                <p class="font-semibold flex items-center gap-1.5">
                  <Check v-if="submittedQuizDetail?.is_correct" class="w-4 h-4 text-emerald-600" />
                  <AlertCircle v-else class="w-4 h-4 text-rose-600" />
                  {{ submittedQuizDetail?.is_correct ? 'Chính xác!' : 'Chưa chính xác rồi!' }}
                </p>
                <p v-if="submittedQuizDetail?.correct_answer_text && !submittedQuizDetail?.is_correct" class="text-xs font-semibold">
                  Đáp án đúng: {{ submittedQuizDetail.correct_answer_text }}
                </p>
                <p class="text-xs leading-relaxed opacity-90">
                  {{ submittedQuizDetail?.explanation || 'Hãy lưu ý ngữ nghĩa và ngữ pháp.' }}
                </p>
              </div>

              <!-- Submit / Next Button -->
              <div class="pt-2 space-y-2">
                <button v-if="currentStudyIndex > 0" @click="previousQuizQuestion" :disabled="isSubmittingQuiz || ctx.quizFeedbackLoading.value" class="w-full py-2 text-sm font-semibold text-indigo-600">Câu trước</button>
                <button
                  v-if="!quizChecked"
                  @click="checkQuizAnswer"
                  :disabled="!canAnswerQuiz || isSubmittingQuiz || ctx.quizFeedbackLoading.value"
                  class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Loader2 v-if="isSubmittingQuiz || ctx.quizFeedbackLoading.value" class="w-4 h-4 animate-spin" />
                  <span>{{ ctx.quizFeedbackLoading.value ? 'Đang kiểm tra…' : isSubmittingQuiz ? 'Đang nộp bài...' : ctx.quizFeedbackMode.value === 'immediate' ? 'Kiểm tra đáp án' : currentStudyIndex < quizQuestions.length - 1 ? 'Lưu đáp án & Câu tiếp theo' : 'Nộp bài kiểm tra' }}</span>
                </button>
                <button
                  v-else
                  @click="nextQuizQuestion"
                  :disabled="isSubmittingQuiz || ctx.quizFeedbackLoading.value"
                  class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Loader2 v-if="isSubmittingQuiz" class="h-4 w-4 animate-spin" />
                  <span>{{ isSubmittingQuiz ? 'Đang lưu kết quả…' : currentStudyIndex < quizQuestions.length - 1 ? 'Câu tiếp theo' : quizResult ? 'Làm lại bài' : 'Hoàn tất & xem kết quả' }}</span>
                  <ArrowRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
</template>

<script setup>
import { AlertCircle, ArrowRight, Check, CheckCircle, HelpCircle, Layers, Loader2, RotateCcw, RotateCw, Volume2, XCircle } from 'lucide-vue-next';
import { inject } from 'vue';
import { getFullAudioUrl } from '../services/api';
const ctx = inject('screenContext');
const { studyError, isReviewingCard, quizInputText, quizResult, canAnswerQuiz, previousQuizQuestion, restartQuiz, requireAuthentication } = ctx;
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

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.flashcard-stage {
  perspective: 1000px;
  perspective-origin: center;
}

.flashcard-inner {
  transform-style: preserve-3d;
  transform-origin: center;
  transition: transform 560ms ease-in-out;
  will-change: transform;
}

.flashcard-inner.is-flipped {
  transform: rotateY(180deg);
}

.flashcard-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flashcard-back {
  transform: rotateY(180deg);
}

.flashcard-stage:focus-visible .flashcard-front,
.flashcard-stage:focus-visible .flashcard-back {
  outline: 3px solid rgba(139, 92, 246, 0.45);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .flashcard-inner {
    transition-duration: 1ms;
  }
}
</style>
