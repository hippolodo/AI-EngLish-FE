<template>
  <div v-if="activeTab === 'study'" class="space-y-6 pb-28 w-full max-w-6xl mx-auto">
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
        <span>{{ ctx.currentLesson.value ? 'Quay lại bài học' : 'Quay lại' }}</span>
      </AnimateButton>
    </div>

    <!-- Header & Flow Progress -->
    <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs uppercase tracking-wide font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Flashcard &amp; Quiz</span>
                <h1 class="text-gray-900 mt-1.5 text-2xl sm:text-3xl font-extrabold leading-snug">Flashcard</h1>
              </div>
              <span v-if="totalStudyItems > 0" class="text-sm sm:text-base font-bold text-gray-700 bg-white border border-gray-200 px-4 py-1.5 rounded-full shadow-2xs">
                Mục {{ currentStudyIndex + 1 }} / {{ totalStudyItems }}
              </span>
            </div>
            <p class="text-sm sm:text-base text-slate-500">{{ ctx.currentLesson.value ? 'Ôn từ vựng và kiểm tra kiến thức của bài đang học.' : 'Ôn từ vựng bằng flashcard hoặc kiểm tra kiến thức qua quiz.' }}</p>
            <div v-if="totalStudyItems > 0" class="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                :style="{ width: ((currentStudyIndex + 1) / totalStudyItems * 100) + '%' }"
                class="h-full bg-indigo-600 rounded-full transition-all duration-300"
              ></div>
            </div>
          </div>

          <!-- Toggle: Flashcard Mode vs Quiz Mode -->
          <div class="flex bg-gray-200/70 p-1.5 rounded-2xl text-base font-bold text-gray-600">
            <button
              :disabled="studyLoading || isSubmittingQuiz || ctx.quizFeedbackLoading.value || isSavingCardNote" @click="switchStudyMode('flashcard')"
              :class="studyMode === 'flashcard' ? 'bg-white text-indigo-600 shadow-sm' : 'hover:text-gray-900'"
              class="flex-1 py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Layers class="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Flashcard</span>
            </button>
            <button
              :disabled="studyLoading || isSubmittingQuiz || ctx.quizFeedbackLoading.value || isSavingCardNote" @click="switchStudyMode('quiz')"
              :class="studyMode === 'quiz' ? 'bg-white text-indigo-600 shadow-sm' : 'hover:text-gray-900'"
              class="flex-1 py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <HelpCircle class="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Quiz</span>
            </button>
          </div>

          <div v-if="studyMode === 'flashcard' && isAuthenticated && ctx.flashcardMode.value === 'all'" class="space-y-3 rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-sky-50 p-5 sm:p-6">
            <label for="flashcard-deck" class="flex items-center gap-2 text-base font-bold text-violet-900"><Layers class="h-5 w-5" aria-hidden="true" />Chọn bộ từ theo bài học</label>
            <select id="flashcard-deck" v-model="ctx.studyDeckId.value" @change="ctx.onStudyDeckChange" :disabled="studyLoading || isSavingCardNote || isSubmittingQuiz || ctx.flashcardDecksLoading.value" class="w-full rounded-2xl border border-violet-200 bg-white p-3.5 text-base text-slate-800 disabled:opacity-60 shadow-2xs">
              <option v-if="!ctx.currentLesson.value" :value="null">Tất cả bài học &amp; bộ từ cá nhân</option>
              <optgroup v-if="ctx.availableFlashcardDecks.value.some(deck => deck.lesson_id)" label="Theo bài học">
                <option v-for="deck in ctx.availableFlashcardDecks.value.filter(deck => deck.lesson_id)" :key="deck.id" :value="deck.id">{{ deck.title.replace(/^Vocabulary:\s*/i, '') }} · {{ deck.total_cards }} từ</option>
              </optgroup>
              <optgroup v-if="ctx.availableFlashcardDecks.value.some(deck => !deck.lesson_id)" label="Bộ từ khác & cá nhân">
                <option v-for="deck in ctx.availableFlashcardDecks.value.filter(deck => !deck.lesson_id)" :key="deck.id" :value="deck.id">{{ deck.title }} · {{ deck.total_cards }} từ</option>
              </optgroup>
            </select>
            <p v-if="ctx.flashcardDecksLoading.value" role="status" class="text-xs sm:text-sm text-violet-700">Đang tải danh sách bộ từ…</p>
            <p v-else-if="ctx.flashcardDecksError.value && !ctx.currentLesson.value" role="alert" class="text-xs sm:text-sm text-rose-700">{{ ctx.flashcardDecksError.value }} <button @click="ctx.loadFlashcardDecks" class="font-semibold underline">Thử lại</button></p>
            <p class="text-xs sm:text-sm text-slate-600">{{ ctx.currentLesson.value ? 'Các bộ từ của bài đang học.' : 'Chọn từ vựng theo bài học hoặc bộ từ cá nhân.' }} Tick những từ bạn muốn xem lại.</p>
          </div>

          <div v-if="studyMode === 'flashcard' && isAuthenticated" class="space-y-3">
            <div class="grid grid-cols-2 gap-3" aria-label="Danh sách flashcard">
              <button v-for="mode in [{ id: 'all', title: ALL_CARDS }, { id: 'noted', title: NOTED_WORDS }]" :key="mode.id" @click="ctx.setFlashcardMode(mode.id)" :disabled="studyLoading || isSavingCardNote" :aria-pressed="ctx.flashcardMode.value === mode.id" class="rounded-2xl border px-4 py-3 font-bold transition disabled:opacity-50" :class="ctx.flashcardMode.value === mode.id ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700'">{{ mode.title }}</button>
            </div>
            <p class="text-sm text-slate-600">{{ ctx.flashcardMode.value === 'noted' ? NOTED_HELP : ALL_HELP }}</p>
          </div>

          <!-- Flashcard Notification Toast -->
          <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
            <div v-if="ctx.flashcardToast?.value" class="rounded-2xl bg-indigo-900 text-white px-4 py-3 text-sm font-semibold shadow-md flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <Check class="w-4 h-4 text-amber-300 shrink-0" />
                <span>{{ ctx.flashcardToast.value }}</span>
              </div>
              <button @click="ctx.flashcardToast.value = ''" class="text-indigo-300 hover:text-white cursor-pointer"><X class="w-4 h-4" /></button>
            </div>
          </transition>

          <p v-if="studyError" role="alert" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm sm:text-base text-rose-700">{{ studyError }}</p>
          <div v-if="!isAuthenticated" class="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm sm:text-base text-indigo-700">
            Đăng nhập để lưu kết quả học và ôn thẻ cá nhân.
            <button @click="requireAuthentication" class="ml-1 font-bold underline cursor-pointer">Đăng nhập</button>
          </div>
          <!-- Loading State -->
          <div v-if="studyLoading" class="py-16 text-center space-y-3">
            <Loader2 class="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <p class="text-base text-gray-500">Đang tải nội dung học tập...</p>
          </div>

          <!-- STATE A: FLASHCARD REVIEW / BROWSING -->
          <div v-else-if="studyMode === 'flashcard' && isAuthenticated" class="space-y-5">
            <div v-if="studyError && flashcards.length === 0" class="rounded-3xl border border-rose-100 bg-white p-8 text-center space-y-4">
              <h3 class="text-lg font-bold text-slate-900">Chưa tải được thẻ</h3>
              <button @click="loadFlashcardsData" class="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white">Thử tải lại</button>
            </div>
            <div v-else-if="flashcards.length === 0" class="p-12 bg-white rounded-3xl border border-gray-100 text-center space-y-4 shadow-xs">
              <Layers class="w-12 h-12 text-indigo-300 mx-auto" />
              <h3 class="text-lg font-bold text-gray-800">{{ ctx.flashcardMode.value === 'noted' ? NO_NOTES : NO_CARDS }}</h3>
              <p class="text-sm sm:text-base text-gray-500 max-w-sm mx-auto leading-relaxed">{{ ctx.flashcardMode.value === 'noted' ? EMPTY_NOTES_HELP : EMPTY_CARDS_HELP }}</p>
              <button v-if="ctx.flashcardMode.value === 'noted'" @click="ctx.setFlashcardMode('all')" class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold">{{ ALL_CARDS }}</button>
              <button @click="loadFlashcardsData" class="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm sm:text-base font-bold hover:bg-indigo-100 cursor-pointer">
                Tải lại danh sách
              </button>
            </div>

            <div v-else class="space-y-5">
              <div
                @click="isFlipped = !isFlipped"
                @keydown.enter.self.prevent="isFlipped = !isFlipped"
                @keydown.space.self.prevent="isFlipped = !isFlipped"
                @keydown.left.self.prevent="ctx.prevFlashcard"
                @keydown.right.self.prevent="ctx.nextFlashcard"
                tabindex="0"
                role="group"
                :aria-label="isFlipped ? 'Quay về mặt trước của flashcard' : 'Lật flashcard để xem nghĩa và ví dụ'"
                class="flashcard-stage w-full h-84 sm:h-96 md:h-[400px] cursor-pointer select-none outline-none"
              >
                <div :class="{ 'is-flipped': isFlipped }" class="flashcard-inner relative w-full h-full">
                  <!-- FRONT SIDE -->
                  <div :aria-hidden="isFlipped" :inert="isFlipped" class="flashcard-face flashcard-front absolute inset-0 bg-white rounded-3xl p-8 border border-violet-100 shadow-xl flex flex-col justify-between items-center text-center">
                    <div class="w-full flex justify-between items-center">
                      <div class="flex items-center gap-2">
                        <span class="text-xs sm:text-sm font-bold px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg">Từ vựng</span>
                        <span v-if="currentCard.is_noted" class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                          <Check class="w-3 h-3 text-amber-600" />
                          <span>Đã note</span>
                        </span>
                      </div>
                      <button @click.stop="speakText(currentCard.word)" aria-label="Nghe phát âm từ" class="w-10 h-10 rounded-full bg-gray-100 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 flex items-center justify-center cursor-pointer transition">
                        <Volume2 class="w-5 h-5" />
                      </button>
                    </div>
                    <div class="space-y-3">
                      <h2 class="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">{{ currentCard.word }}</h2>
                      <div v-if="formatIpa(currentCard.ipa)" class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-indigo-50/90 border border-indigo-100 font-mono font-bold text-base sm:text-lg text-indigo-700 shadow-2xs tracking-wide">
                        <span>{{ formatIpa(currentCard.ipa) }}</span>
                      </div>
                    </div>
                    <div class="text-xs sm:text-sm text-gray-400 flex items-center gap-1.5">
                      <RotateCw class="w-3.5 h-3.5" />
                      <span>Chạm hoặc nhấn Enter / Space để xem nghĩa và ví dụ</span>
                    </div>
                  </div>

                  <!-- BACK SIDE -->
                  <div :aria-hidden="!isFlipped" :inert="!isFlipped" class="flashcard-face flashcard-back absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-amber-50 rounded-3xl p-8 border border-violet-200 shadow-xl flex flex-col justify-between text-left">
                    <div class="flex justify-between items-center">
                      <span class="text-xs sm:text-sm font-bold px-3 py-1 bg-indigo-600 text-white rounded-lg uppercase">Nghĩa tiếng Việt</span>
                      <span v-if="currentCard.is_noted" class="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                        <Check class="w-3.5 h-3.5" /> Đã note
                      </span>
                      <span v-else class="text-xs sm:text-sm font-bold text-gray-500">Ôn tập linh hoạt</span>
                    </div>
                    <div class="space-y-3">
                      <div class="flex items-center gap-2 flex-wrap pb-2 border-b border-indigo-100/60">
                        <span class="font-bold text-gray-900 text-lg sm:text-xl">{{ currentCard.word }}</span>
                        <span v-if="formatIpa(currentCard.ipa)" class="font-mono text-xs sm:text-sm font-semibold text-indigo-600 bg-white px-2.5 py-0.5 rounded-full border border-indigo-100">{{ formatIpa(currentCard.ipa) }}</span>
                      </div>
                      <h3 class="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">{{ currentCard.meaning || 'Chưa cập nhật nghĩa' }}</h3>
                      <p v-if="currentCard.hint_example" class="text-base sm:text-lg text-gray-700 italic border-l-4 border-indigo-400 pl-4 py-1 leading-relaxed">
                        "{{ currentCard.hint_example }}"
                      </p>
                    </div>
                    <p class="text-xs sm:text-sm text-gray-500 text-center">
                      Chạm để quay lại mặt trước
                    </p>
                  </div>
                </div>
              </div>

              <div class="space-y-3 pt-1">
                <div class="grid grid-cols-3 gap-3">
                  <!-- Prev Button -->
                  <AnimateButton
                    variant="outline"
                    size="md"
                    :disabled="isSavingCardNote || currentStudyIndex <= 0"
                    @click="ctx.prevFlashcard"
                  >
                    <template #prefix><ChevronLeft class="w-5 h-5" /></template>
                    <span>Thẻ trước</span>
                  </AnimateButton>

                  <label class="flex items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-3.5 text-indigo-900 font-bold cursor-pointer has-[:disabled]:opacity-50">
                    <input type="checkbox" :checked="!!currentCard.is_noted" :disabled="isSavingCardNote" @change="ctx.toggleCardNote" class="h-5 w-5 accent-indigo-600" />
                    <span>{{ isSavingCardNote ? SAVING_NOTE : NOTE_WORD }}</span>
                  </label>

                  <!-- Next Button -->
                  <AnimateButton
                    variant="default"
                    size="md"
                    :disabled="isSavingCardNote || currentStudyIndex >= flashcards.length - 1"
                    @click="ctx.nextFlashcard"
                  >
                    <span>Thẻ sau</span>
                    <template #suffix><ChevronRight class="w-5 h-5" /></template>
                  </AnimateButton>
                </div>

                <p class="text-sm text-slate-600">Tick để lưu từ vào mục Từ đã note. Bỏ tick để gỡ khỏi danh sách đó.</p>
                <!-- Word Quick-Jump List (All flashcards visible) -->
                <div class="mt-3 rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-2xs">
                  <div class="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700">
                    <span>Toàn bộ từ vựng trong bộ thẻ ({{ flashcards.length }} từ):</span>
                    <span class="text-xs text-slate-400">Bấm từ để xem nhanh</span>
                  </div>
                  <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                    <button
                      v-for="(card, idx) in flashcards"
                      :key="card.id"
                      @click="ctx.jumpToFlashcard(idx)"
                      class="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition flex items-center gap-1.5 cursor-pointer border"
                      :class="idx === currentStudyIndex
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : card.is_noted
                          ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
                    >
                      <span>{{ card.word }}</span>
                      <Check v-if="card.is_noted" class="h-3.5 w-3.5" aria-label="Đã note" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- STATE B: QUIZ MODE (REAL DB QUIZZES) -->
          <div v-else-if="studyMode === 'quiz'" class="space-y-5">
            <div class="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4 sm:p-5">
              <p class="text-base font-bold text-indigo-900">Cách xem kết quả</p>
              <div class="grid grid-cols-2 gap-3">
                <button @click="ctx.setQuizFeedbackMode('end')" :disabled="ctx.quizModeLocked.value" :aria-pressed="ctx.quizFeedbackMode.value === 'end'" class="rounded-xl border px-3 py-2.5 text-sm sm:text-base font-bold transition disabled:cursor-default cursor-pointer" :class="ctx.quizFeedbackMode.value === 'end' ? 'border-indigo-700 bg-indigo-700 text-white shadow-xs' : 'border-indigo-100 bg-white text-indigo-700'">Chấm cuối bài</button>
                <button @click="ctx.setQuizFeedbackMode('immediate')" :disabled="ctx.quizModeLocked.value" :aria-pressed="ctx.quizFeedbackMode.value === 'immediate'" class="rounded-xl border px-3 py-2.5 text-sm sm:text-base font-bold transition disabled:cursor-default cursor-pointer" :class="ctx.quizFeedbackMode.value === 'immediate' ? 'border-indigo-700 bg-indigo-700 text-white shadow-xs' : 'border-indigo-100 bg-white text-indigo-700'">Xem đáp án ngay</button>
              </div>
              <p class="text-xs sm:text-sm text-slate-600">{{ ctx.quizFeedbackMode.value === 'immediate' ? 'Chọn đáp án để xem đúng/sai và giải thích. Câu đã chấm được giữ nguyên đến hết lượt.' : 'Làm các câu rồi nộp toàn bài để xem kết quả.' }}</p>
              <button v-if="ctx.quizModeLocked.value && !isSubmittingQuiz && !ctx.quizFeedbackLoading.value && !quizResult" @click="restartQuiz" class="text-xs sm:text-sm font-bold text-indigo-700 underline underline-offset-4 cursor-pointer">Làm lại để đổi chế độ</button>
            </div>
            <div v-if="quizResult" role="status" class="rounded-3xl border border-indigo-200 bg-indigo-50/90 p-5 sm:p-6 text-base text-indigo-950 shadow-xs">
              <p class="font-bold text-lg">Kết quả: {{ quizResult.score }}/100 — {{ quizResult.is_passed ? '🌟 Đạt' : '⚠️ Chưa đạt' }}</p>
              <p class="mt-1 text-sm sm:text-base">Đúng {{ quizResult.correct_answers }}/{{ quizResult.total_questions }} câu. Xem lại lời giải bên dưới.</p>
              <div class="mt-3 flex gap-4 text-sm sm:text-base font-bold">
                <button @click="restartQuiz" class="underline text-indigo-700 cursor-pointer">Làm lại bài</button>
                <button v-if="ctx.currentLesson.value" @click="ctx.lessonStep.value = 'summary'; activeTab = 'lesson'" class="underline text-indigo-700 cursor-pointer">Tổng kết bài học →</button>
              </div>
            </div>
            <!-- Quiz select -->
            <div v-if="quizzesList.length > 1" class="flex items-center space-x-3">
              <label class="text-sm sm:text-base font-bold text-gray-700 shrink-0">Chọn đề:</label>
              <select
                v-model="selectedQuizId"
                :disabled="isSubmittingQuiz || ctx.quizFeedbackLoading.value" @change="onQuizChange"
                class="flex-1 text-sm sm:text-base bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600 truncate shadow-2xs"
              >
                <option v-for="q in quizzesList" :key="q.id" :value="q.id">
                  {{ q.title }}
                </option>
              </select>
            </div>

            <div v-if="quizQuestions.length === 0" class="p-12 bg-white rounded-3xl border border-gray-100 text-center space-y-4 shadow-xs">
              <HelpCircle class="w-12 h-12 text-indigo-300 mx-auto" />
              <h3 class="text-lg font-bold text-gray-800">Chưa có câu hỏi trắc nghiệm</h3>
              <p class="text-sm sm:text-base text-gray-500 max-w-sm mx-auto leading-relaxed">
                Bộ câu hỏi này hiện chưa có câu hỏi.
              </p>
              <button @click="loadQuizzesData" class="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm sm:text-base font-bold hover:bg-indigo-100 cursor-pointer">
                Tải lại danh sách
              </button>
            </div>

            <div v-else class="space-y-5">
              <div class="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-3">
                <span class="text-xs uppercase tracking-wide font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                  Câu hỏi {{ currentStudyIndex + 1 }} / {{ quizQuestions.length }}
                </span>
                <p class="reading-text text-base sm:text-xl font-bold text-gray-900 leading-relaxed">
                  {{ currentQuestion.question_text }}
                </p>
              </div>

              <audio v-if="currentQuestion.audio_url" :key="currentQuestion.id" :src="getFullAudioUrl(currentQuestion.audio_url)" controls class="w-full" />
              <img v-if="currentQuestion.image_url" :src="getFullAudioUrl(currentQuestion.image_url)" alt="Minh họa câu hỏi" class="max-h-56 rounded-2xl object-contain mx-auto shadow-xs" />
              <label v-if="currentQuestion.question_type === 'FILL_BLANK'" class="block space-y-2 text-sm sm:text-base font-bold text-gray-700">
                Điền đáp án
                <input v-model="quizInputText" :disabled="quizChecked || isSubmittingQuiz || ctx.quizFeedbackLoading.value" @keyup.enter="checkQuizAnswer" class="w-full rounded-2xl border border-gray-200 bg-white p-4 text-base sm:text-lg text-gray-900 shadow-2xs" placeholder="Nhập từ hoặc cụm từ…" />
              </label>
              <!-- Answer options -->
              <div v-if="currentQuestion.question_type !== 'FILL_BLANK'" class="space-y-3">
                <button
                  v-for="(ans, aIdx) in (currentQuestion.answers || [])"
                  :key="ans.id || aIdx"
                  @click="selectQuizAnswer(ans)"
                  :disabled="quizChecked || isSubmittingQuiz || ctx.quizFeedbackLoading.value"
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

              <!-- Explanation Banner -->
              <div
                v-if="quizChecked && submittedQuizDetail" role="status" aria-live="polite"
                :class="submittedQuizDetail?.is_correct ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'"
                class="p-5 rounded-2xl border text-sm sm:text-base space-y-1.5 shadow-2xs"
              >
                <p class="font-bold flex items-center gap-2 text-base">
                  <Check v-if="submittedQuizDetail?.is_correct" class="w-5 h-5 text-emerald-600" />
                  <AlertCircle v-else class="w-5 h-5 text-rose-600" />
                  {{ submittedQuizDetail?.is_correct ? 'Chính xác!' : 'Chưa chính xác rồi!' }}
                </p>
                <p v-if="submittedQuizDetail?.correct_answer_text && !submittedQuizDetail?.is_correct" class="text-sm font-bold">
                  Đáp án đúng: {{ submittedQuizDetail.correct_answer_text }}
                </p>
                <p class="text-sm sm:text-base leading-relaxed opacity-95">
                  {{ submittedQuizDetail?.explanation || 'Hãy lưu ý ngữ nghĩa và ngữ pháp.' }}
                </p>
              </div>

              <!-- Submit / Next Button -->
              <div class="pt-3 space-y-2.5">
                <button v-if="currentStudyIndex > 0" @click="previousQuizQuestion" :disabled="isSubmittingQuiz || ctx.quizFeedbackLoading.value" class="w-full py-2.5 text-sm sm:text-base font-bold text-indigo-600 cursor-pointer">Câu trước</button>
                <button
                  v-if="!quizChecked"
                  @click="checkQuizAnswer"
                  :disabled="!canAnswerQuiz || isSubmittingQuiz || ctx.quizFeedbackLoading.value"
                  class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold text-base sm:text-lg rounded-2xl shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Loader2 v-if="isSubmittingQuiz || ctx.quizFeedbackLoading.value" class="w-5 h-5 animate-spin" />
                  <span>{{ ctx.quizFeedbackLoading.value ? 'Đang kiểm tra…' : isSubmittingQuiz ? 'Đang nộp bài...' : ctx.quizFeedbackMode.value === 'immediate' ? 'Kiểm tra đáp án' : currentStudyIndex < quizQuestions.length - 1 ? 'Lưu đáp án & Câu tiếp theo' : 'Nộp bài kiểm tra' }}</span>
                </button>
                <button
                  v-else
                  @click="nextQuizQuestion"
                  :disabled="isSubmittingQuiz || ctx.quizFeedbackLoading.value"
                  class="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base sm:text-lg rounded-2xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Loader2 v-if="isSubmittingQuiz" class="h-5 w-5 animate-spin" />
                  <span>{{ isSubmittingQuiz ? 'Đang lưu kết quả…' : currentStudyIndex < quizQuestions.length - 1 ? 'Câu tiếp theo' : quizResult ? 'Làm lại bài' : 'Hoàn tất & xem kết quả' }}</span>
                  <ArrowRight class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
</template>

<script setup>
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle, ChevronLeft, ChevronRight, HelpCircle, Layers, Loader2, RotateCw, Volume2, X, XCircle } from 'lucide-vue-next';
import { inject } from 'vue';
import AnimateButton from '../components/ui/Button.vue';
import AnimateCard from '../components/ui/Card.vue';
import AnimateBadge from '../components/ui/Badge.vue';
import AnimateCountingNumber from '../components/ui/CountingNumber.vue';
import { getFullAudioUrl } from '../services/api';
const ctx = inject('screenContext');
const ALL_CARDS = 'Tất cả thẻ';
const NOTED_WORDS = 'Từ đã note';
const NOTED_HELP = 'Các từ bạn đã tick từ mọi bộ thẻ. Bỏ tick để gỡ một từ khỏi mục này.';
const ALL_HELP = 'Lật thẻ để xem nghĩa và ví dụ. Tick để lưu riêng những từ bạn muốn xem lại.';
const NO_NOTES = 'Chưa có từ đã note';
const NO_CARDS = 'Chưa có thẻ từ vựng';
const EMPTY_NOTES_HELP = 'Mở Tất cả thẻ và tick từ bạn muốn lưu. Các từ đã tick sẽ xuất hiện ở đây.';
const EMPTY_CARDS_HELP = 'Bộ từ này chưa có thẻ. Bạn có thể chọn bộ khác hoặc lưu từ từ mục Từ điển.';
const SAVING_NOTE = 'Đang lưu…';
const NOTE_WORD = 'Note từ này';
const goBack = ctx.goBack;
const hasHistory = ctx.hasHistory;

const formatIpa = (ipa) => {
  if (!ipa) return '';
  const clean = String(ipa).replace(/^\/+|\/+$/g, '').trim();
  return clean ? `/${clean}/` : '';
};
const { studyError, isSavingCardNote, quizInputText, quizResult, canAnswerQuiz, previousQuizQuestion, restartQuiz, requireAuthentication } = ctx;
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
