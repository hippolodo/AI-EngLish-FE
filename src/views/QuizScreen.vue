<template>
  <div v-if="activeTab === 'quiz'" class="space-y-6 pb-28 w-full max-w-6xl mx-auto">
    <!-- Top Back Button (Only visible when navigated from a lesson or another screen) -->
    <div v-if="hasHistory">
      <button
        @click="goBack"
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs cursor-pointer group"
      >
        <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>{{ ctx.currentLesson?.value ? 'Back to Lesson' : 'Back' }}</span>
      </button>
    </div>

    <!-- Header & Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span class="text-xs uppercase tracking-wide font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Quiz &amp; Testing</span>
        <h1 class="text-gray-900 mt-1.5 text-2xl sm:text-3xl font-extrabold leading-snug">Quiz</h1>
        <p class="text-sm sm:text-base text-slate-500 mt-1">
          {{ ctx.currentLesson?.value ? 'Practice quiz to reinforce concepts from the current lesson.' : 'Take interactive quizzes, strengthen grammar, or generate custom test sets.' }}
        </p>
      </div>

      <!-- Action: Create Custom Quiz -->
      <button
        @click="openCreateQuizModal"
        class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-md shadow-blue-600/20 transition cursor-pointer shrink-0 self-start sm:self-auto transform active:scale-98"
      >
        <Plus class="w-5 h-5" />
        <span>Create Custom Quiz</span>
      </button>
    </div>

    <!-- Top Flow Progress Bar -->
    <div v-if="quizQuestions?.length > 0" class="space-y-2">
      <div class="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-600">
        <span>Question {{ currentStudyIndex + 1 }} / {{ quizQuestions.length }}</span>
        <span>{{ Math.round(((currentStudyIndex + 1) / quizQuestions.length) * 100) }}%</span>
      </div>
      <div class="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          :style="{ width: ((currentStudyIndex + 1) / quizQuestions.length * 100) + '%' }"
          class="h-full bg-blue-600 rounded-full transition-all duration-300"
        ></div>
      </div>
    </div>

    <!-- Feedback Mode Toggle (Review at End vs Instant Feedback) -->
    <div class="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5 shadow-2xs">
      <p class="text-base font-bold text-blue-950">Quiz Mode</p>
      <div class="grid grid-cols-2 gap-3">
        <button
          @click="ctx.setQuizFeedbackMode('end')"
          :disabled="ctx.quizModeLocked?.value"
          :aria-pressed="ctx.quizFeedbackMode?.value === 'end'"
          class="rounded-xl border px-3 py-2.5 text-sm sm:text-base font-bold transition disabled:cursor-default cursor-pointer"
          :class="ctx.quizFeedbackMode?.value === 'end' ? 'border-blue-700 bg-blue-700 text-white shadow-xs' : 'border-blue-100 bg-white text-blue-700 hover:bg-blue-50'"
        >
          Review at the End
        </button>
        <button
          @click="ctx.setQuizFeedbackMode('immediate')"
          :disabled="ctx.quizModeLocked?.value"
          :aria-pressed="ctx.quizFeedbackMode?.value === 'immediate'"
          class="rounded-xl border px-3 py-2.5 text-sm sm:text-base font-bold transition disabled:cursor-default cursor-pointer"
          :class="ctx.quizFeedbackMode?.value === 'immediate' ? 'border-blue-700 bg-blue-700 text-white shadow-xs' : 'border-blue-100 bg-white text-blue-700 hover:bg-blue-50'"
        >
          Instant Feedback
        </button>
      </div>
      <p class="text-xs sm:text-sm text-slate-600">
        {{ ctx.quizFeedbackMode?.value === 'immediate' ? 'Choose an answer to see instant results and detailed explanations.' : 'Answer all questions first and submit to see your total score and detailed explanations.' }}
      </p>
      <button
        v-if="ctx.quizModeLocked?.value && !isSubmittingQuiz && !ctx.quizFeedbackLoading?.value && !quizResult"
        @click="restartQuiz"
        class="text-xs sm:text-sm font-bold text-blue-700 underline underline-offset-4 cursor-pointer"
      >
        Restart quiz to switch mode
      </button>
    </div>

    <!-- Quiz Result Banner (When finished) -->
    <div v-if="quizResult" role="status" class="rounded-3xl border border-blue-200 bg-blue-50/90 p-5 sm:p-7 text-base text-blue-950 shadow-xs space-y-3">
      <div class="flex items-center gap-3">
        <span class="text-3xl">{{ quizResult.is_passed ? '🎉' : '📊' }}</span>
        <div>
          <p class="font-extrabold text-xl sm:text-2xl text-slate-900">
            Result: {{ quizResult.score }}/100 — {{ quizResult.is_passed ? '🌟 Passed' : '⚠️ Keep Practicing' }}
          </p>
          <p class="text-sm sm:text-base text-slate-600 mt-0.5">
            Correct: {{ quizResult.correct_answers }}/{{ quizResult.total_questions }} questions. Review detailed explanations below.
          </p>
        </div>
      </div>
      <div class="flex gap-4 text-sm sm:text-base font-bold pt-2">
        <button @click="restartQuiz" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-2xs cursor-pointer transition">Retake Quiz</button>
        <button v-if="ctx.currentLesson?.value" @click="ctx.lessonStep.value = 'summary'; activeTab = 'lesson'" class="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer transition">Back to Lesson →</button>
      </div>
    </div>

    <!-- Quiz Selector Dropdown -->
    <div v-if="quizzesList?.length > 1" class="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
      <label class="text-sm sm:text-base font-bold text-gray-700 shrink-0">Select Quiz:</label>
      <select
        v-model="selectedQuizId"
        :disabled="isSubmittingQuiz || ctx.quizFeedbackLoading?.value"
        @change="onQuizChange"
        class="flex-1 text-sm sm:text-base bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 truncate shadow-2xs cursor-pointer"
      >
        <option v-for="q in quizzesList" :key="q.id" :value="q.id">
          {{ q.title }}
        </option>
      </select>
    </div>

    <!-- Error state -->
    <p v-if="studyError" role="alert" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm sm:text-base text-rose-700">{{ studyError }}</p>

    <!-- Loading State -->
    <div v-if="studyLoading" class="py-16 text-center space-y-3">
      <Loader2 class="w-8 h-8 animate-spin text-blue-600 mx-auto" />
      <p class="text-base text-gray-500">Loading quiz questions...</p>
    </div>

    <!-- Empty Quiz State -->
    <div v-else-if="!quizQuestions || quizQuestions.length === 0" class="p-12 bg-white rounded-3xl border border-gray-100 text-center space-y-4 shadow-xs">
      <HelpCircle class="w-12 h-12 text-blue-300 mx-auto" />
      <h3 class="text-lg font-bold text-gray-800">No quiz questions available</h3>
      <p class="text-sm sm:text-base text-gray-500 max-w-sm mx-auto leading-relaxed">
        This quiz currently has no questions, or you can create your own custom quiz right now.
      </p>
      <div class="flex items-center justify-center gap-3">
        <button @click="loadQuizzesData" class="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm sm:text-base font-bold hover:bg-blue-100 cursor-pointer">
          Reload Quizzes
        </button>
        <button @click="openCreateQuizModal" class="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm sm:text-base font-bold hover:bg-blue-700 cursor-pointer">
          Create New Quiz
        </button>
      </div>
    </div>

    <!-- Active Question View -->
    <div v-else class="space-y-5">
      <!-- Question Prompt Box -->
      <div class="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-3">
        <span class="text-xs uppercase tracking-wide font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
          Question {{ currentStudyIndex + 1 }} / {{ quizQuestions.length }}
        </span>
        <p class="reading-text text-base sm:text-xl font-bold text-gray-900 leading-relaxed">
          {{ currentQuestion?.question_text }}
        </p>
      </div>

      <!-- Question Audio if available -->
      <audio v-if="currentQuestion?.audio_url" :key="currentQuestion.id" :src="getFullAudioUrl(currentQuestion.audio_url)" controls class="w-full rounded-xl" />

      <!-- Question Image if available -->
      <img v-if="currentQuestion?.image_url" :src="getFullAudioUrl(currentQuestion.image_url)" alt="Question illustration" class="max-h-56 rounded-2xl object-contain mx-auto shadow-xs" />

      <!-- Fill-in-Blank Question Type -->
      <label v-if="currentQuestion?.question_type === 'FILL_BLANK'" class="block space-y-2 text-sm sm:text-base font-bold text-gray-700">
        Fill in the Blank
        <input
          v-model="quizInputText"
          :disabled="quizChecked || isSubmittingQuiz || ctx.quizFeedbackLoading?.value"
          @keyup.enter="checkQuizAnswer"
          class="w-full rounded-2xl border border-gray-200 bg-white p-4 text-base sm:text-lg text-gray-900 shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Type word or phrase…"
        />
      </label>

      <!-- Multiple-Choice Options -->
      <div v-if="currentQuestion?.question_type !== 'FILL_BLANK'" class="space-y-3">
        <button
          v-for="(ans, aIdx) in (currentQuestion?.answers || [])"
          :key="ans.id || aIdx"
          @click="selectQuizAnswer(ans)"
          :disabled="quizChecked || isSubmittingQuiz || ctx.quizFeedbackLoading?.value"
          :class="getQuizAnswerClass(ans)"
          class="w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between text-base sm:text-lg font-bold cursor-pointer shadow-2xs"
        >
          <span class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-sm shrink-0">
              {{ ['A','B','C','D'][aIdx] || (aIdx + 1) }}
            </span>
            <span>{{ ans.answer_text }}</span>
          </span>
          <CheckCircle v-if="quizChecked && submittedQuizDetail?.is_correct && selectedQuizAnswer?.id === ans.id" class="w-5 h-5 text-emerald-600 shrink-0" />
          <XCircle v-else-if="quizChecked && !submittedQuizDetail?.is_correct && selectedQuizAnswer?.id === ans.id" class="w-5 h-5 text-rose-500 shrink-0" />
        </button>
      </div>

      <!-- Explanation Box -->
      <div
        v-if="quizChecked && submittedQuizDetail"
        role="status"
        aria-live="polite"
        :class="submittedQuizDetail?.is_correct ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'"
        class="p-5 rounded-2xl border text-sm sm:text-base space-y-1.5 shadow-2xs"
      >
        <p class="font-bold flex items-center gap-2 text-base">
          <Check v-if="submittedQuizDetail?.is_correct" class="w-5 h-5 text-emerald-600" />
          <AlertCircle v-else class="w-5 h-5 text-rose-600" />
          {{ submittedQuizDetail?.is_correct ? 'Correct!' : 'Incorrect!' }}
        </p>
        <p v-if="submittedQuizDetail?.correct_answer_text && !submittedQuizDetail?.is_correct" class="text-sm font-bold">
          Correct answer: {{ submittedQuizDetail.correct_answer_text }}
        </p>
        <p class="text-sm sm:text-base leading-relaxed opacity-95">
          {{ submittedQuizDetail?.explanation || 'Review the explanation and grammar structure above.' }}
        </p>
      </div>

      <!-- Action Navigation Buttons -->
      <div class="pt-3 space-y-2.5">
        <button
          v-if="currentStudyIndex > 0"
          @click="previousQuizQuestion"
          :disabled="isSubmittingQuiz || ctx.quizFeedbackLoading?.value"
          class="w-full py-2.5 text-sm sm:text-base font-bold text-blue-600 hover:underline cursor-pointer"
        >
          ← Previous Question
        </button>

        <button
          v-if="!quizChecked"
          @click="checkQuizAnswer"
          :disabled="!canAnswerQuiz || isSubmittingQuiz || ctx.quizFeedbackLoading?.value"
          class="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold text-base sm:text-lg rounded-2xl shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Loader2 v-if="isSubmittingQuiz || ctx.quizFeedbackLoading?.value" class="w-5 h-5 animate-spin" />
          <span>{{ ctx.quizFeedbackLoading?.value ? 'Checking answer…' : isSubmittingQuiz ? 'Submitting quiz...' : ctx.quizFeedbackMode?.value === 'immediate' ? 'Check Answer' : currentStudyIndex < quizQuestions.length - 1 ? 'Save & Next Question' : 'Submit Quiz' }}</span>
        </button>

        <button
          v-else
          @click="nextQuizQuestion"
          :disabled="isSubmittingQuiz || ctx.quizFeedbackLoading?.value"
          class="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base sm:text-lg rounded-2xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Loader2 v-if="isSubmittingQuiz" class="h-5 w-5 animate-spin" />
          <span>{{ isSubmittingQuiz ? 'Saving results…' : currentStudyIndex < quizQuestions.length - 1 ? 'Next Question' : quizResult ? 'Retake Quiz' : 'Finish & View Results' }}</span>
          <ArrowRight class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: CUSTOM QUIZ CREATOR                                                -->
    <!-- ========================================================================= -->
    <div
      v-if="isCreateQuizOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
      @click.self="isCreateQuizOpen = false"
    >
      <div class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Plus class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-xl font-extrabold text-slate-900">Create Custom Quiz</h3>
              <p class="text-xs sm:text-sm text-slate-500">Generate a quiz by topic or build your own custom questions</p>
            </div>
          </div>
          <button @click="isCreateQuizOpen = false" class="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Mode Tabs: AI Generate vs Manual Create -->
        <div class="flex border-b border-slate-100 px-6 pt-3 gap-4">
          <button
            @click="createMode = 'ai'"
            class="pb-3 font-bold text-sm sm:text-base border-b-2 transition cursor-pointer"
            :class="createMode === 'ai' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
          >
            Generate by Topic
          </button>
          <button
            @click="createMode = 'manual'"
            class="pb-3 font-bold text-sm sm:text-base border-b-2 transition cursor-pointer"
            :class="createMode === 'manual' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
          >
            Manual Question Builder
          </button>
        </div>

        <!-- Tab 1: AI Topic Generate Form -->
        <div v-if="createMode === 'ai'" class="p-6 space-y-5">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-slate-800">Quiz Topic</label>
            <input
              v-model="aiTopicInput"
              type="text"
              placeholder="e.g. Airport Conversations, Simple Past Tense, Job Interview..."
              class="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <!-- Suggested Topic Chips -->
          <div class="space-y-1.5">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wide">Suggested Topics:</span>
            <div class="flex flex-wrap gap-2 pt-1">
              <button
                v-for="chip in suggestedTopics"
                :key="chip"
                type="button"
                @click="aiTopicInput = chip"
                class="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
              >
                {{ chip }}
              </button>
            </div>
          </div>

          <!-- Number of questions -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-bold text-slate-800">Number of Questions</label>
              <select v-model.number="aiNumQuestions" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-semibold bg-white cursor-pointer">
                <option :value="3">3 questions</option>
                <option :value="5">5 questions</option>
                <option :value="10">10 questions</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-bold text-slate-800">Time Limit</label>
              <select v-model.number="aiTimeLimit" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-semibold bg-white cursor-pointer">
                <option :value="5">5 minutes</option>
                <option :value="10">10 minutes</option>
                <option :value="15">15 minutes</option>
              </select>
            </div>
          </div>

          <p v-if="createError" class="text-xs text-rose-600 font-bold bg-rose-50 p-3 rounded-xl border border-rose-200">{{ createError }}</p>

          <button
            @click="handleGenerateAIQuiz"
            :disabled="!aiTopicInput.trim() || isCreatingQuiz"
            class="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-600/25 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Loader2 v-if="isCreatingQuiz" class="w-5 h-5 animate-spin" />
            <span>{{ isCreatingQuiz ? 'Generating quiz…' : 'Generate Quiz 🚀' }}</span>
          </button>
        </div>

        <!-- Tab 2: Manual Quiz Builder -->
        <div v-else class="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-slate-800">Quiz Title</label>
            <input
              v-model="manualTitle"
              type="text"
              placeholder="e.g. 15-Minute Travel Vocabulary Quiz"
              class="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-slate-800">Question List ({{ manualQuestions.length }}):</span>
              <button
                type="button"
                @click="addManualQuestion"
                class="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus class="w-3.5 h-3.5" /> Add Question
              </button>
            </div>

            <div
              v-for="(q, qIdx) in manualQuestions"
              :key="qIdx"
              class="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-blue-700 uppercase">Question #{{ qIdx + 1 }}</span>
                <button
                  v-if="manualQuestions.length > 1"
                  type="button"
                  @click="manualQuestions.splice(qIdx, 1)"
                  class="text-xs text-rose-500 hover:underline cursor-pointer"
                >
                  Delete
                </button>
              </div>

              <input
                v-model="q.question_text"
                type="text"
                placeholder="Question text..."
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
              />

              <div class="space-y-2">
                <span class="text-xs font-semibold text-slate-500">Options (select the correct answer):</span>
                <div v-for="(ans, aIdx) in q.answers" :key="aIdx" class="flex items-center gap-2">
                  <input
                    type="radio"
                    :name="'correct_answer_' + qIdx"
                    :checked="ans.is_correct"
                    @change="setCorrectAnswer(qIdx, aIdx)"
                    class="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <input
                    v-model="ans.answer_text"
                    type="text"
                    :placeholder="'Option ' + ['A','B','C','D'][aIdx]"
                    class="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                  />
                </div>
              </div>

              <input
                v-model="q.explanation"
                type="text"
                placeholder="Explanation for the correct answer (optional)..."
                class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-600"
              />
            </div>
          </div>

          <p v-if="createError" class="text-xs text-rose-600 font-bold bg-rose-50 p-3 rounded-xl border border-rose-200">{{ createError }}</p>

          <button
            @click="handleSaveManualQuiz"
            :disabled="!manualTitle.trim() || isCreatingQuiz"
            class="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-600/25 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Loader2 v-if="isCreatingQuiz" class="w-5 h-5 animate-spin" />
            <span>{{ isCreatingQuiz ? 'Saving quiz…' : 'Save Quiz' }}</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle, ChevronLeft, ChevronRight,
  HelpCircle, Loader2, Plus, X, XCircle
} from 'lucide-vue-next';
import { inject } from 'vue';
import { getFullAudioUrl, getErrorMessage } from '../services/api';
import { studyService } from '../services/studyService';

const ctx = inject('screenContext');
const goBack = ctx.goBack;
const hasHistory = ctx.hasHistory;

const {
  activeTab, studyError, studyLoading, quizzesList, selectedQuizId,
  quizQuestions, currentQuestion, currentStudyIndex, canAnswerQuiz,
  quizChecked, submittedQuizDetail, selectedQuizAnswer, quizInputText,
  quizResult, onQuizChange, selectQuizAnswer, checkQuizAnswer,
  nextQuizQuestion, previousQuizQuestion, restartQuiz, isSubmittingQuiz,
  getQuizAnswerClass, loadQuizzesData
} = ctx;

// Custom Quiz Creator State
const isCreateQuizOpen = ref(false);
const createMode = ref('ai');
const isCreatingQuiz = ref(false);
const createError = ref('');

// AI Form State
const aiTopicInput = ref('');
const aiNumQuestions = ref(5);
const aiTimeLimit = ref(10);
const suggestedTopics = [
  'Business Communication', 'Travel & Hotel', 'Restaurant & Cafe',
  'Past Simple Tense', 'Present Perfect', 'IELTS Vocabulary'
];

// Manual Form State
const manualTitle = ref('');
const manualQuestions = ref([
  {
    question_text: '',
    explanation: '',
    answers: [
      { answer_text: '', is_correct: true },
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false }
    ]
  }
]);

const openCreateQuizModal = () => {
  createError.value = '';
  isCreateQuizOpen.value = true;
};

const addManualQuestion = () => {
  manualQuestions.value.push({
    question_text: '',
    explanation: '',
    answers: [
      { answer_text: '', is_correct: true },
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false },
      { answer_text: '', is_correct: false }
    ]
  });
};

const setCorrectAnswer = (qIdx, aIdx) => {
  manualQuestions.value[qIdx].answers.forEach((ans, idx) => {
    ans.is_correct = idx === aIdx;
  });
};

const handleGenerateAIQuiz = async () => {
  if (!aiTopicInput.value.trim()) return;
  isCreatingQuiz.value = true;
  createError.value = '';
  try {
    const payload = {
      topic: aiTopicInput.value.trim(),
      num_questions: aiNumQuestions.value,
      time_limit_minutes: aiTimeLimit.value,
      pass_score: 70.0
    };
    const created = await studyService.generateQuiz(payload);
    await loadQuizzesData();
    if (created?.id) {
      selectedQuizId.value = created.id;
      await onQuizChange();
    }
    isCreateQuizOpen.value = false;
    aiTopicInput.value = '';
  } catch (err) {
    createError.value = getErrorMessage(err, 'Unable to create quiz at this time. Please try again.');
  } finally {
    isCreatingQuiz.value = false;
  }
};

const handleSaveManualQuiz = async () => {
  if (!manualTitle.value.trim()) return;
  const invalidQ = manualQuestions.value.find(q => !q.question_text.trim() || q.answers.every(a => !a.answer_text.trim()));
  if (invalidQ) {
    createError.value = 'Please fill in all question fields and answer options.';
    return;
  }
  isCreatingQuiz.value = true;
  createError.value = '';
  try {
    const payload = {
      title: manualTitle.value.trim(),
      description: 'User-created custom quiz',
      time_limit_minutes: 10,
      pass_score: 70.0,
      questions: manualQuestions.value.map((q, idx) => ({
        question_text: q.question_text.trim(),
        explanation: q.explanation?.trim() || null,
        order_index: idx + 1,
        answers: q.answers.filter(a => a.answer_text.trim()).map(a => ({
          answer_text: a.answer_text.trim(),
          is_correct: !!a.is_correct
        }))
      }))
    };
    const created = await studyService.createQuiz(payload);
    await loadQuizzesData();
    if (created?.id) {
      selectedQuizId.value = created.id;
      await onQuizChange();
    }
    isCreateQuizOpen.value = false;
    manualTitle.value = '';
  } catch (err) {
    createError.value = getErrorMessage(err, 'Unable to save quiz. Please try again.');
  } finally {
    isCreatingQuiz.value = false;
  }
};
</script>

