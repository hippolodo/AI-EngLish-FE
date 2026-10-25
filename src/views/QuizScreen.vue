<template>
  <div v-if="activeTab === 'quiz'" class="space-y-6 pb-28 w-full max-w-6xl mx-auto">
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
        <span>{{ ctx.currentLesson?.value ? 'Back to Lesson' : 'Back' }}</span>
      </AnimateButton>
    </div>

    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5 flex-wrap">
          <AnimateBadge variant="default" size="sm">
            <template #icon><Sparkles class="w-3.5 h-3.5 text-blue-600" /></template>
            Knowledge Quiz
          </AnimateBadge>
          <span
            v-if="ctx.currentLesson?.value"
            class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80"
          >
            Lesson: {{ ctx.currentLesson.value.title }}
          </span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Quiz &amp; Testing
        </h1>
        <p class="text-base sm:text-lg text-slate-600 mt-1 max-w-2xl leading-relaxed">
          {{ ctx.currentLesson?.value ? 'Reinforce key grammar, vocabulary, and concepts learned in this lesson.' : 'Strengthen retention with interactive quizzes, instant feedback, and customizable tests.' }}
        </p>
      </div>

      <!-- Action: Create Custom Quiz -->
      <div class="flex items-center gap-2 self-start sm:self-auto shrink-0">
        <AnimateButton
          variant="gradient"
          size="md"
          @click="openCreateQuizModal"
          class="shadow-md shadow-indigo-600/20"
        >
          <template #prefix><Plus class="w-4 h-4" /></template>
          <span>Create Custom Quiz</span>
        </AnimateButton>
      </div>
    </div>

    <!-- Quiz Result Screen (Celebration Hero Card when finished) -->
    <div
      v-if="quizResult"
      role="status"
      class="bento-card bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 rounded-3xl border border-blue-200/90 p-7 sm:p-9 shadow-lg space-y-6"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-blue-100">
        <div class="flex items-center gap-4">
          <div
            class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-4xl shadow-md shrink-0"
            :class="quizResult.is_passed ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' : 'bg-amber-50 border border-amber-200 text-amber-600'"
          >
            {{ quizResult.is_passed ? '🎉' : '📊' }}
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span
                class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                :class="quizResult.is_passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
              >
                {{ quizResult.is_passed ? 'PASSED' : 'PRACTICE NEEDED' }}
              </span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {{ quizResult.is_passed ? 'Congratulations! Quiz Passed' : 'Good Effort! Keep Practicing' }}
            </h2>
            <p class="text-slate-600 text-sm sm:text-base mt-0.5">
              You answered {{ quizResult.correct_answers }} of {{ quizResult.total_questions }} questions correctly.
            </p>
          </div>
        </div>

        <!-- Big Score Pill -->
        <div class="flex items-center gap-3 bg-white px-6 py-4 rounded-3xl border border-slate-200/90 shadow-sm shrink-0">
          <div class="text-right">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Final Score</p>
            <p class="text-3xl sm:text-4xl font-black text-indigo-600">
              <AnimateCountingNumber :number="quizResult.score" />
              <span class="text-lg text-slate-400 font-bold">/100</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Accuracy Rate</span>
          <p class="text-2xl font-black text-slate-900 mt-1">
            {{ quizResult.total_questions ? Math.round((quizResult.correct_answers / quizResult.total_questions) * 100) : 0 }}%
          </p>
        </div>

        <div class="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Correct Answers</span>
          <p class="text-2xl font-black text-emerald-600 mt-1">
            {{ quizResult.correct_answers }} / {{ quizResult.total_questions }}
          </p>
        </div>

        <div class="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
          <p class="text-2xl font-black mt-1" :class="quizResult.is_passed ? 'text-emerald-600' : 'text-amber-600'">
            {{ quizResult.is_passed ? 'Qualified 🌟' : 'Review needed ⚠️' }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <AnimateButton
          variant="default"
          size="lg"
          @click="restartQuiz"
          class="w-full sm:w-auto"
        >
          <template #prefix><RotateCcw class="w-4 h-4" /></template>
          <span>Retake Quiz</span>
        </AnimateButton>

        <AnimateButton
          v-if="ctx.currentLesson?.value"
          variant="outline"
          size="lg"
          @click="ctx.lessonStep.value = 'summary'; activeTab = 'lesson'"
          class="w-full sm:w-auto"
        >
          <span>Back to Lesson Summary →</span>
        </AnimateButton>
      </div>
    </div>

    <!-- Active Flow Toolbar: Progress Rail & Mode Switch Pill -->
    <div v-if="quizQuestions?.length > 0 && !quizResult" class="space-y-3">
      <!-- Progress Bar & Question Step Counter -->
      <div class="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm">
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-slate-900 text-sm sm:text-base">
              Question {{ currentStudyIndex + 1 }} of {{ quizQuestions.length }}
            </span>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200/60">
              {{ currentQuestion?.question_type === 'FILL_BLANK' ? 'Fill in Blank' : 'Multiple Choice' }}
            </span>
          </div>

          <!-- Compact Mode Switch Segmented Pill -->
          <div class="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              @click="ctx.setQuizFeedbackMode('end')"
              :disabled="ctx.quizModeLocked?.value"
              class="px-3 py-1.5 rounded-lg transition cursor-pointer"
              :class="ctx.quizFeedbackMode?.value === 'end' ? 'bg-white text-blue-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'"
              title="Answer all questions first and submit for results"
            >
              Review at End
            </button>
            <button
              @click="ctx.setQuizFeedbackMode('immediate')"
              :disabled="ctx.quizModeLocked?.value"
              class="px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
              :class="ctx.quizFeedbackMode?.value === 'immediate' ? 'bg-white text-blue-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'"
              title="Get instant answer verification after each selection"
            >
              <Zap class="w-3 h-3 text-amber-500" />
              <span>Instant Feedback</span>
            </button>
          </div>
        </div>

        <!-- Sleek Smooth Progress Rail -->
        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            :style="{ width: `${((currentStudyIndex + 1) / quizQuestions.length) * 100}%` }"
            class="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-300"
          ></div>
        </div>
      </div>
    </div>

    <!-- Quiz Selector Dropdown if multiple quizzes available -->
    <div
      v-if="quizzesList?.length > 1 && !quizResult"
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs"
    >
      <label class="text-sm font-bold text-slate-700 shrink-0 flex items-center gap-2">
        <span>📋</span>
        <span>Choose Quiz Set:</span>
      </label>
      <select
        v-model="selectedQuizId"
        :disabled="isSubmittingQuiz || ctx.quizFeedbackLoading?.value"
        @change="onQuizChange"
        class="flex-1 max-w-md text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        <option v-for="q in quizzesList" :key="q.id" :value="q.id">
          {{ q.title }}
        </option>
      </select>
    </div>

    <!-- Error state -->
    <div v-if="studyError" role="alert" class="rounded-3xl bg-rose-50 border border-rose-200 p-5 text-sm sm:text-base text-rose-700 flex items-center gap-3">
      <AlertCircle class="w-5 h-5 shrink-0" />
      <span>{{ studyError }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="studyLoading" class="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-100 shadow-2xs">
      <Loader2 class="w-9 h-9 animate-spin text-blue-600 mx-auto" />
      <p class="text-base font-bold text-slate-800">Loading quiz questions…</p>
      <p class="text-xs sm:text-sm text-slate-500">Preparing test questions and feedback rules…</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!quizQuestions || quizQuestions.length === 0"
      class="p-12 sm:p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs"
    >
      <div class="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 text-3xl">
        📝
      </div>
      <h3 class="text-xl font-black text-slate-900">No quiz questions available</h3>
      <p class="text-sm sm:text-base text-slate-500 max-w-md mx-auto leading-relaxed">
        This quiz currently has no questions, or you can generate your own custom quiz right now.
      </p>
      <div class="flex items-center justify-center gap-3 pt-2">
        <AnimateButton variant="outline" size="md" @click="loadQuizzesData">
          Reload Quizzes
        </AnimateButton>
        <AnimateButton variant="gradient" size="md" @click="openCreateQuizModal">
          <template #prefix><Plus class="w-4 h-4" /></template>
          <span>Create New Quiz</span>
        </AnimateButton>
      </div>
    </div>

    <!-- ACTIVE QUESTION STAGE -->
    <div v-else-if="!quizResult" class="space-y-6">
      
      <!-- Bento Question Card -->
      <div class="bento-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5 relative overflow-hidden">
        
        <!-- Header line with Question Badge -->
        <div class="flex items-center justify-between gap-3">
          <span class="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-xs sm:text-sm border border-blue-100 shadow-2xs">
            Question {{ currentStudyIndex + 1 }}
          </span>

          <span v-if="currentQuestion?.order_index" class="text-xs font-semibold text-slate-400">
            Order #{{ currentQuestion.order_index }}
          </span>
        </div>

        <!-- Question Text in crisp Jakarta Sans -->
        <h2 class="reading-text text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
          {{ currentQuestion?.question_text }}
        </h2>

        <!-- Custom Audio Player if question has audio -->
        <div v-if="currentQuestion?.audio_url" :key="currentQuestion.id" class="pt-1">
          <AudioPlayer
            :src="getFullAudioUrl(currentQuestion.audio_url)"
            label="Listen to Question Audio"
            :fallback-text="currentQuestion.question_text"
          />
        </div>

        <!-- Illustration Image if available -->
        <div v-if="currentQuestion?.image_url" class="pt-2">
          <img
            :src="getFullAudioUrl(currentQuestion.image_url)"
            alt="Question illustration"
            class="max-h-60 rounded-2xl object-contain mx-auto shadow-sm border border-slate-100"
          />
        </div>

        <!-- Fill-in-Blank Input Area -->
        <div v-if="currentQuestion?.question_type === 'FILL_BLANK'" class="pt-2 space-y-2">
          <label class="block text-sm font-extrabold text-slate-700">
            Type your answer below:
          </label>
          <div class="relative">
            <input
              v-model="quizInputText"
              :disabled="quizChecked || isSubmittingQuiz || ctx.quizFeedbackLoading?.value"
              @keyup.enter="checkQuizAnswer"
              type="text"
              class="w-full rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5 text-base sm:text-xl font-bold text-slate-900 shadow-2xs focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all placeholder-slate-400"
              placeholder="Type word or phrase here…"
            />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hidden sm:inline">
              Press Enter ↵
            </span>
          </div>
        </div>

        <!-- Multiple Choice Options -->
        <div v-if="currentQuestion?.question_type !== 'FILL_BLANK'" class="space-y-3.5 pt-2">
          <button
            v-for="(ans, aIdx) in (currentQuestion?.answers || [])"
            :key="ans.id || aIdx"
            @click="selectQuizAnswer(ans)"
            :disabled="quizChecked || isSubmittingQuiz || ctx.quizFeedbackLoading?.value"
            :class="[
              'group w-full text-left p-4.5 sm:p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer select-none card-spring',
              getOptionCardClass(ans)
            ]"
          >
            <!-- Left: Option Letter Pill + Answer Text -->
            <div class="flex items-center gap-3.5 min-w-0">
              <span
                class="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 transition-colors shadow-2xs"
                :class="getLetterBadgeClass(ans, aIdx)"
              >
                {{ ['A', 'B', 'C', 'D'][aIdx] || (aIdx + 1) }}
              </span>
              <span class="text-base sm:text-lg font-bold leading-snug">
                {{ ans.answer_text }}
              </span>
            </div>

            <!-- Right: Status Indicator (Check / Cross / Radio Ring) -->
            <div class="shrink-0 flex items-center justify-center">
              <CheckCircle2
                v-if="quizChecked && submittedQuizDetail?.is_correct && selectedQuizAnswer?.id === ans.id"
                class="w-6 h-6 text-emerald-600"
              />
              <XCircle
                v-else-if="quizChecked && !submittedQuizDetail?.is_correct && selectedQuizAnswer?.id === ans.id"
                class="w-6 h-6 text-rose-500"
              />
              <CheckCircle2
                v-else-if="quizChecked && submittedQuizDetail?.correct_answer_id === ans.id"
                class="w-6 h-6 text-emerald-600"
              />
              <span
                v-else-if="!quizChecked && selectedQuizAnswer?.id === ans.id"
                class="w-5 h-5 rounded-full border-2 border-blue-600 bg-blue-600 flex items-center justify-center"
              >
                <span class="w-2 h-2 rounded-full bg-white"></span>
              </span>
              <span
                v-else
                class="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-blue-400 transition-colors"
              ></span>
            </div>
          </button>
        </div>

      </div>

      <!-- Explanation & Feedback Alert (Revealed after check) -->
      <div
        v-if="quizChecked && submittedQuizDetail"
        role="status"
        aria-live="polite"
        class="p-5 sm:p-6 rounded-3xl border text-sm sm:text-base space-y-2 shadow-xs transition-all"
        :class="submittedQuizDetail?.is_correct
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          : 'bg-rose-50/80 border-rose-200 text-rose-950'"
      >
        <div class="flex items-center gap-2.5 font-extrabold text-base sm:text-lg">
          <CheckCircle2 v-if="submittedQuizDetail?.is_correct" class="w-5 h-5 text-emerald-600 shrink-0" />
          <AlertCircle v-else class="w-5 h-5 text-rose-600 shrink-0" />
          <span>{{ submittedQuizDetail?.is_correct ? 'Spot on! Correct answer.' : 'Not quite right!' }}</span>
        </div>

        <p v-if="submittedQuizDetail?.correct_answer_text && !submittedQuizDetail?.is_correct" class="text-sm font-bold flex items-center gap-2 pt-0.5 flex-wrap">
          <span class="text-slate-600">Correct Answer:</span>
          <span class="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold">
            {{ submittedQuizDetail.correct_answer_text }}
          </span>
        </p>

        <p class="text-sm sm:text-base leading-relaxed opacity-95 pt-1">
          {{ submittedQuizDetail?.explanation || 'Review the explanation and vocabulary grammar above.' }}
        </p>
      </div>

      <!-- Action Footer Navigation Buttons -->
      <div class="pt-2 space-y-3">
        <!-- Previous Question Link -->
        <button
          v-if="currentStudyIndex > 0"
          type="button"
          @click="previousQuizQuestion"
          :disabled="isSubmittingQuiz || ctx.quizFeedbackLoading?.value"
          class="w-full py-2.5 text-sm sm:text-base font-bold text-slate-600 hover:text-blue-600 cursor-pointer transition text-center"
        >
          ← Previous Question
        </button>

        <!-- Main Submission / Next Button -->
        <button
          v-if="!quizChecked"
          type="button"
          @click="checkQuizAnswer"
          :disabled="!canAnswerQuiz || isSubmittingQuiz || ctx.quizFeedbackLoading?.value"
          class="btn-spring w-full py-4.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-105 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-lg shadow-blue-600/25 transition cursor-pointer flex items-center justify-center gap-2 select-none"
        >
          <Loader2 v-if="isSubmittingQuiz || ctx.quizFeedbackLoading?.value" class="w-5 h-5 animate-spin" />
          <span>
            {{ ctx.quizFeedbackLoading?.value
              ? 'Checking answer…'
              : isSubmittingQuiz
                ? 'Submitting quiz...'
                : ctx.quizFeedbackMode?.value === 'immediate'
                  ? 'Check Answer'
                  : currentStudyIndex < quizQuestions.length - 1
                    ? 'Save & Next Question →'
                    : 'Submit Quiz 🎯' }}
          </span>
        </button>

        <button
          v-else
          type="button"
          @click="nextQuizQuestion"
          :disabled="isSubmittingQuiz || ctx.quizFeedbackLoading?.value"
          class="btn-spring w-full py-4.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-2 select-none"
        >
          <Loader2 v-if="isSubmittingQuiz" class="h-5 w-5 animate-spin" />
          <span>
            {{ isSubmittingQuiz
              ? 'Saving results…'
              : currentStudyIndex < quizQuestions.length - 1
                ? 'Next Question →'
                : quizResult
                  ? 'Retake Quiz'
                  : 'Finish & View Results 🏆' }}
          </span>
          <ArrowRight v-if="!isSubmittingQuiz" class="w-5 h-5" />
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
  AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronLeft, ChevronRight,
  HelpCircle, Loader2, Plus, X, XCircle, Sparkles, Zap, RotateCcw
} from 'lucide-vue-next';
import { inject } from 'vue';
import AnimateButton from '../components/ui/Button.vue';
import AnimateBadge from '../components/ui/Badge.vue';
import AnimateCountingNumber from '../components/ui/CountingNumber.vue';
import AudioPlayer from '../components/ui/AudioPlayer.vue';
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
  loadQuizzesData
} = ctx;

// Dynamic Styling Helpers for Multiple Choice Options
const getOptionCardClass = (ans) => {
  if (!quizChecked?.value) {
    return selectedQuizAnswer?.value?.id === ans.id
      ? 'border-blue-600 bg-blue-50/60 text-blue-950 ring-2 ring-blue-500/20 shadow-sm'
      : 'border-slate-200/90 bg-white hover:border-blue-300 hover:bg-slate-50/60 text-slate-800 hover:shadow-2xs';
  }
  if (submittedQuizDetail?.value?.correct_answer_id === ans.id) {
    return 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm';
  }
  if (selectedQuizAnswer?.value?.id === ans.id) {
    return submittedQuizDetail?.value?.is_correct
      ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-sm'
      : 'border-rose-400 bg-rose-50/80 text-rose-950 ring-2 ring-rose-400/20 shadow-sm';
  }
  return 'border-slate-200/60 bg-slate-50/40 text-slate-400 opacity-60';
};

const getLetterBadgeClass = (ans, aIdx) => {
  if (!quizChecked?.value) {
    return selectedQuizAnswer?.value?.id === ans.id
      ? 'bg-blue-600 text-white shadow-sm'
      : 'bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700';
  }
  if (submittedQuizDetail?.value?.correct_answer_id === ans.id) {
    return 'bg-emerald-600 text-white shadow-sm';
  }
  if (selectedQuizAnswer?.value?.id === ans.id) {
    return submittedQuizDetail?.value?.is_correct
      ? 'bg-emerald-600 text-white shadow-sm'
      : 'bg-rose-500 text-white shadow-sm';
  }
  return 'bg-slate-100 text-slate-400';
};

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
