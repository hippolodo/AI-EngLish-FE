<template>
  <section v-if="activeTab === 'lesson'" class="w-full max-w-6xl mx-auto space-y-8 pb-28">
    
    <!-- STATE 1: BROWSE ALL TOPICS & LESSONS (CATALOG VIEW) -->
    <template v-if="!currentLesson">
      
      <!-- Top Title & Overview Stats -->
      <div class="space-y-4">
        <!-- Back to Topics Catalog (Only visible when filtering by a specific topic) -->
        <div v-if="selectedTopic">
          <button
            @click="clearTopicFilter"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs cursor-pointer group"
          >
            <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Topics</span>
          </button>
        </div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide border border-blue-100">
                CEFR Curriculum
              </span>
              <span v-if="selectedTopic" class="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold flex items-center gap-1.5 border border-amber-200">
                Filter: {{ selectedTopic.title }}
                <button @click="clearTopicFilter" class="hover:text-red-600 font-extrabold cursor-pointer">✕</button>
              </span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Curriculum Topics
            </h1>
            <p class="text-base sm:text-lg text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Explore structured lessons organized by real-world topics. Select any lesson to start practicing.
            </p>
          </div>

          <!-- Quick Progress Widget -->
          <div class="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs flex items-center gap-5 shrink-0 min-w-[280px]">
            <div class="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-2xl font-black shrink-0">
              {{ overallStats.percent }}%
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Progress</p>
              <p class="text-base font-extrabold text-slate-900 mt-0.5">
                {{ overallStats.completed }}/{{ overallStats.total }} completed
              </p>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                <div
                  class="bg-blue-600 h-full rounded-full transition-all duration-500"
                  :style="{ width: `${overallStats.percent}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Bar & Search Input -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          
          <!-- CEFR Level Tabs -->
          <div class="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto shrink-0">
            <button
              v-for="lvl in levelTabs"
              :key="lvl.id"
              @click="selectedLevel = lvl.id"
              :class="selectedLevel === lvl.id ? 'bg-white text-blue-600 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900 font-semibold'"
              class="px-4 py-2 rounded-xl text-sm transition cursor-pointer shrink-0"
            >
              {{ lvl.label }}
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative flex-1 sm:max-w-xs">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search topics or lessons…"
              class="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="catalogLoading || lessonLoading" class="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-100 shadow-2xs">
        <Loader2 class="mx-auto mb-3 h-8 w-8 animate-spin text-blue-600" />
        <span class="text-base font-semibold">Loading lessons and curriculum…</span>
      </div>

      <!-- Error State -->
      <div v-else-if="catalogError || lessonError" role="alert" class="rounded-3xl bg-rose-50 border border-rose-200 p-6 text-base text-rose-700 flex items-center justify-between">
        <span>{{ catalogError || lessonError }}</span>
        <button @click="loadCatalog" class="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 transition cursor-pointer">
          Retry
        </button>
      </div>

      <!-- Curriculum List Grouped by Topic -->
      <div v-else class="space-y-7">
        
        <!-- Each Topic Card Container -->
        <article
          v-for="topic in displayedTopics"
          :key="topic.id"
          class="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200 hover:border-slate-300 hover:shadow-md"
        >
          <!-- Topic Header Header Bar -->
          <div class="p-6 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/40">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div class="flex items-start gap-4">
                <!-- Topic Emoji / Icon Avatar -->
                <div class="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-3xl shrink-0">
                  {{ getTopicEmoji(topic.title) }}
                </div>
                
                <div>
                  <div class="flex items-center gap-2.5 mb-1 flex-wrap">
                    <span
                      class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                      :class="getLevelBadgeClass(topic.level)"
                    >
                      {{ getLevelLabel(topic.level) }}
                    </span>
                    <span class="text-xs font-semibold text-slate-500">
                      Topic {{ topic.id }} · {{ getTopicLessons(topic.id).length }} lessons
                    </span>
                  </div>

                  <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                    {{ topic.title }}
                  </h2>
                  <p v-if="topic.description" class="text-sm sm:text-base text-slate-600 mt-1 leading-relaxed">
                    {{ topic.description }}
                  </p>
                </div>
              </div>

              <!-- Topic Progress Bar (Top Right) -->
              <div class="sm:text-right shrink-0 min-w-[160px] pl-18 sm:pl-0">
                <span class="text-xs font-bold text-slate-500">
                  {{ getTopicProgress(topic.id).completed }}/{{ getTopicProgress(topic.id).total }} completed
                </span>
                <div class="w-full sm:w-36 bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="getTopicProgress(topic.id).percent === 100 ? 'bg-emerald-500' : 'bg-blue-600'"
                    :style="{ width: `${getTopicProgress(topic.id).percent}%` }"
                  ></div>
                </div>
              </div>

            </div>
          </div>

          <!-- Inside Topic: Lessons Grid (Lesson 1, Lesson 2, Lesson 3...) -->
          <div class="p-6 sm:p-7 bg-white">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Lessons:
            </h3>

            <div v-if="getTopicLessons(topic.id).length === 0" class="py-6 text-center text-slate-500 text-sm italic">
              No lessons in this topic yet.
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="(lesson, idx) in getTopicLessons(topic.id)"
                :key="lesson.id"
                @click="handleSelectLesson(lesson)"
                class="group/item flex items-center justify-between p-4.5 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <!-- Left: Number pill & Title -->
                <div class="flex items-center gap-3.5 min-w-0">
                  
                  <!-- Lesson Number Badge -->
                  <div
                    class="w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 transition-colors shadow-2xs"
                    :class="journey.lesson(lesson.id).completed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-white text-slate-700 border border-slate-200 group-hover/item:border-blue-300 group-hover/item:text-blue-600'"
                  >
                    <CheckCircle2 v-if="journey.lesson(lesson.id).completed" class="w-5 h-5 text-emerald-600" />
                    <span v-else>L{{ idx + 1 }}</span>
                  </div>

                  <!-- Details -->
                  <div class="min-w-0">
                    <div v-if="journey.lesson(lesson.id).completed" class="flex items-center gap-2 mb-1 flex-wrap">
                      <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                        Completed
                      </span>
                    </div>

                    <h4 class="text-base sm:text-lg font-bold text-slate-900 group-hover/item:text-blue-600 transition truncate">
                      Lesson {{ idx + 1 }}: {{ lesson.title }}
                    </h4>
                  </div>
                </div>

                <!-- Right: Action Button -->
                <div class="shrink-0 ml-3">
                  <button
                    class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
                    :class="journey.lesson(lesson.id).completed
                      ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-blue-600 text-white shadow-xs group-hover/item:bg-blue-700'"
                  >
                    <span>{{ journey.lesson(lesson.id).completed ? 'Review' : 'Start' }}</span>
                    <ChevronRight class="w-4 h-4 group-hover/item:translate-x-0.5 transition-transform" />
                  </button>
                </div>

              </div>
            </div>
          </div>

        </article>

        <!-- No Results Fallback -->
        <div v-if="displayedTopics.length === 0" class="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-2xs space-y-3">
          <BookOpen class="w-12 h-12 text-slate-400 mx-auto" />
          <h3 class="text-lg font-bold text-slate-800">No matching lessons found</h3>
          <p class="text-sm text-slate-500 max-w-md mx-auto">
            No topics or lessons match your filter "{{ searchQuery || selectedLevel }}". Try choosing another level or clearing your search.
          </p>
          <button
            @click="selectedLevel = 'ALL'; searchQuery = ''; clearTopicFilter()"
            class="px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition cursor-pointer"
          >
            View all lessons
          </button>
        </div>

      </div>

    </template>


    <!-- STATE 2: ACTIVE LESSON STUDY VIEW (When currentLesson is selected) -->
    <template v-else>
      
      <!-- Top Navigation Header -->
      <div class="space-y-2">
        <button
          @click="handleBackToCatalog"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs cursor-pointer group"
        >
          <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Lessons</span>
        </button>

        <div class="pt-1">
          <div class="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span
              class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
              :class="getLevelBadgeClass(selectedTopic?.level)"
            >
              {{ getLevelLabel(selectedTopic?.level) }}
            </span>
            <span class="text-xs sm:text-sm font-bold text-slate-500">
              Topic: {{ selectedTopic?.title }}
            </span>
            <span
              class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
            >
              Practice
            </span>
          </div>

          <h1 class="text-slate-900 text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-snug">
            {{ currentLesson.title }}
          </h1>
        </div>
      </div>

      <!-- Step Navigation Tabs (1. Vocabulary, 2. Practice, 3. Quiz, 4. Summary) -->
      <div class="flex gap-2.5 sm:gap-3 text-xs sm:text-base font-bold overflow-x-auto pb-1">
        <button
          v-if="lessonCards?.length"
          @click="lessonStep = 'vocabulary'"
          class="flex-1 min-w-[140px] rounded-2xl py-3.5 px-4 cursor-pointer transition shadow-2xs flex items-center justify-center text-center"
          :class="lessonStep === 'vocabulary' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'"
        >
          <span>1. Vocabulary</span>
        </button>

        <button
          @click="lessonStep = 'practice'"
          class="flex-1 min-w-[130px] rounded-2xl py-3.5 px-4 cursor-pointer transition shadow-2xs flex items-center justify-center text-center"
          :class="lessonStep === 'practice' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'"
        >
          <span>{{ lessonCards?.length ? '2.' : '1.' }} Practice</span>
        </button>

        <button
          @click="openLessonQuiz"
          :disabled="!lessonQuizzes.length"
          class="flex-1 min-w-[120px] rounded-2xl py-3.5 px-4 disabled:opacity-40 cursor-pointer transition shadow-2xs flex items-center justify-center text-center"
          :class="lessonStep === 'quiz' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'"
        >
          <span>{{ lessonCards?.length ? '3.' : '2.' }} Quiz</span>
        </button>

        <button
          @click="lessonStep = 'summary'"
          class="flex-1 min-w-[120px] rounded-2xl py-3.5 px-4 cursor-pointer transition shadow-2xs flex items-center justify-center text-center"
          :class="lessonStep === 'summary' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'"
        >
          <span>{{ lessonCards?.length ? '4.' : '3.' }} Summary</span>
        </button>
      </div>

      <!-- STEP 3: SUMMARY VIEW -->
      <div v-if="lessonStep === 'summary'" class="space-y-6 rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 shadow-xs">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl">
            {{ lessonProgress?.completed ? '🎉' : '📊' }}
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-slate-900">
              {{ lessonProgress?.completed ? 'Congratulations! Lesson Completed' : 'Lesson Progress' }}
            </h2>
            <p class="text-base text-slate-600 mt-0.5">
              Review your practice results and proceed to the next lesson.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Sentences Practiced</span>
            <p class="text-2xl font-black text-slate-900 mt-1">
              {{ currentLesson.type === 'SPEAKING' ? `${lessonProgress?.completed_content_ids?.length || 0}/${lessonDetail?.contents?.length || 0}` : 'Submitted' }}
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Practice Score</span>
            <p class="text-2xl font-black text-blue-600 mt-1">
              {{ lessonProgress?.writing_score !== null && lessonProgress?.writing_score !== undefined ? `${lessonProgress.writing_score}/100` : '—' }}
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Quiz Score</span>
            <p class="text-2xl font-black text-emerald-600 mt-1">
              {{ lessonProgress?.quiz_score !== null && lessonProgress?.quiz_score !== undefined ? `${lessonProgress.quiz_score}/100` : 'Not taken' }}
            </p>
          </div>
        </div>

        <div class="pt-4 space-y-3">
          <button
            v-if="!lessonProgress?.completed"
            @click="finishLesson"
            :disabled="!canFinishLesson"
            class="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 p-4 text-base font-bold text-white shadow-md shadow-emerald-600/20 disabled:opacity-40 cursor-pointer transition"
          >
            Mark as Completed
          </button>
          
          <p v-if="!canFinishLesson" class="text-sm font-semibold text-amber-700 text-center">
            {{ currentLesson.type === 'SPEAKING' ? '💡 Complete all sentences to mark this lesson completed.' : '💡 Submit at least one draft to complete.' }}
          </p>

          <button
            v-if="lessonProgress?.completed"
            @click="nextLesson"
            class="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 p-4 text-base font-bold text-white shadow-md shadow-blue-600/20 cursor-pointer transition"
          >
            Next Lesson →
          </button>

          <button
            @click="beginLessonPractice"
            class="w-full py-3 text-base font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Review this lesson
          </button>
        </div>
      </div>

      <!-- STEP 1: VOCABULARY FLASHCARD VIEW -->
      <div v-else-if="lessonStep === 'vocabulary'" class="space-y-6">
        <!-- Vocabulary Objective Banner -->
        <div class="space-y-2.5 rounded-3xl bg-indigo-50/80 p-6 sm:p-7 border border-indigo-100 shadow-2xs">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h2 class="text-lg sm:text-xl font-bold text-indigo-950 flex items-center gap-2">
              <span class="text-2xl">🎴</span>
              <span>Step 1: Vocabulary Flashcards</span>
            </h2>
            <span class="px-3.5 py-1 rounded-full bg-white text-indigo-700 text-xs sm:text-sm font-bold border border-indigo-200 shadow-2xs">
              {{ activeCardIndex + 1 }} / {{ lessonCards.length }} words
            </span>
          </div>
          <p class="text-base sm:text-lg text-indigo-900/90 leading-relaxed">
            Master the pronunciation, IPA transcription, and meaning of the vocabulary in this lesson before practicing sentences.
          </p>
        </div>

        <!-- Interactive 3D Flashcard Stage -->
        <div v-if="currentCard" class="space-y-4">
          <div
            @click="toggleCardFlip"
            @keydown.enter.self.prevent="toggleCardFlip"
            @keydown.space.self.prevent="toggleCardFlip"
            @keydown.left.self.prevent="prevCard"
            @keydown.right.self.prevent="nextCard"
            tabindex="0"
            role="group"
            :aria-label="isCardFlipped ? 'Back to front side' : 'Flip card to view definition and example'"
            class="flashcard-stage w-full h-84 sm:h-96 cursor-pointer select-none outline-none"
          >
            <div :class="{ 'is-flipped': isCardFlipped }" class="flashcard-inner relative w-full h-full">
              <!-- FRONT SIDE (Word + IPA + Audio) -->
              <div
                :aria-hidden="isCardFlipped"
                :inert="isCardFlipped"
                class="flashcard-face flashcard-front absolute inset-0 bg-white rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-xl flex flex-col justify-between items-center text-center"
              >
                <div class="w-full flex justify-between items-center">
                  <span class="text-xs sm:text-sm font-bold px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                    Vocabulary Card #{{ activeCardIndex + 1 }}
                  </span>

                  <div class="flex items-center gap-2">
                    <button
                      @click.stop="openSaveWord(currentCard.word, currentCard.hint_example, currentCard.meaning, currentCard.ipa)"
                      class="w-10 h-10 rounded-full bg-gray-50 hover:bg-amber-50 text-gray-500 hover:text-amber-600 border border-gray-200 flex items-center justify-center cursor-pointer transition shadow-2xs"
                      title="Save word to personal vocabulary"
                    >
                      <BookmarkPlus class="w-4.5 h-4.5" />
                    </button>
                    <button
                      @click.stop="speakText(currentCard.word)"
                      class="w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 flex items-center justify-center cursor-pointer transition shadow-2xs group/btn"
                      title="Listen to pronunciation"
                    >
                      <Volume2 class="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                <div class="space-y-3 sm:space-y-4">
                  <h3 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    {{ currentCard.word }}
                  </h3>
                  <div v-if="formatIpa(currentCard.ipa)" class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-indigo-50 border border-indigo-200/80 font-mono font-bold text-base sm:text-xl text-indigo-700 shadow-2xs">
                    <span>{{ formatIpa(currentCard.ipa) }}</span>
                  </div>
                </div>

                <div class="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                  <RotateCw class="w-4 h-4 text-indigo-500 animate-pulse" />
                  <span>Tap card or press Space to flip and view definition & example</span>
                </div>
              </div>

              <!-- BACK SIDE (Meaning + Example Sentence) -->
              <div
                :aria-hidden="!isCardFlipped"
                :inert="!isCardFlipped"
                class="flashcard-face flashcard-back absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-amber-50/40 rounded-3xl p-6 sm:p-8 border border-indigo-200 shadow-xl flex flex-col justify-between text-left"
              >
                <div class="flex justify-between items-center">
                  <span class="text-xs sm:text-sm font-bold px-3 py-1 bg-indigo-600 text-white rounded-xl uppercase tracking-wide">
                    Definition
                  </span>
                  <button
                    @click.stop="speakText(currentCard.word)"
                    class="w-10 h-10 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 flex items-center justify-center cursor-pointer transition shadow-2xs"
                    title="Listen again"
                  >
                    <Volume2 class="w-5 h-5" />
                  </button>
                </div>

                <div class="space-y-3">
                  <div class="flex items-center gap-2 flex-wrap pb-2 border-b border-indigo-100">
                    <span class="font-extrabold text-slate-900 text-lg sm:text-2xl">{{ currentCard.word }}</span>
                    <span v-if="formatIpa(currentCard.ipa)" class="font-mono text-sm sm:text-base font-semibold text-indigo-600 bg-white px-3 py-0.5 rounded-full border border-indigo-100">
                      {{ formatIpa(currentCard.ipa) }}
                    </span>
                  </div>
                  <h4 class="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                    {{ currentCard.meaning || 'No definition available' }}
                  </h4>
                  <p v-if="currentCard.hint_example" class="text-sm sm:text-base text-slate-700 italic border-l-4 border-indigo-500 pl-4 py-1.5 bg-white/70 rounded-r-xl leading-relaxed">
                    "{{ currentCard.hint_example }}"
                  </p>
                </div>

                <p class="text-xs sm:text-sm text-slate-400 text-center">
                  Tap to flip back
                </p>
              </div>
            </div>
          </div>

          <!-- Controls under card -->
          <div class="flex items-center justify-between gap-3 pt-1">
            <button
              :disabled="activeCardIndex <= 0"
              @click="prevCard"
              class="flex-1 py-3 px-4 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-bold text-sm sm:text-base rounded-2xl border border-slate-200 shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft class="w-5 h-5" />
              <span>Previous</span>
            </button>

            <button
              @click="toggleCardFlip"
              class="py-3 px-4 sm:px-6 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm sm:text-base rounded-2xl border border-indigo-200 shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw class="w-4 h-4" />
              <span>{{ isCardFlipped ? 'Front' : 'Flip Card' }}</span>
            </button>

            <button
              :disabled="activeCardIndex >= lessonCards.length - 1"
              @click="nextCard"
              class="flex-1 py-3 px-4 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-bold text-sm sm:text-base rounded-2xl border border-slate-200 shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- All Vocabulary Words Preview Grid -->
        <div class="space-y-4 pt-3">
          <div class="flex items-center justify-between">
            <h3 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>📋</span>
              <span>Vocabulary List ({{ lessonCards.length }} words)</span>
            </h3>
            <span class="text-xs sm:text-sm font-semibold text-slate-500">
              Click any word to preview on flashcard
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div
              v-for="(card, cIdx) in lessonCards"
              :key="card.id || cIdx"
              @click="selectCard(cIdx)"
              class="p-4 rounded-2xl border bg-white transition-all cursor-pointer space-y-2 group"
              :class="activeCardIndex === cIdx ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200/90 hover:border-blue-300 hover:shadow-2xs'"
            >
              <div class="flex items-start justify-between gap-2">
                <span class="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                  {{ card.word }}
                </span>
                <button
                  @click.stop="speakText(card.word)"
                  class="p-1.5 rounded-full hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition shrink-0 cursor-pointer"
                  title="Listen to pronunciation"
                >
                  <Volume2 class="w-4 h-4" />
                </button>
              </div>
              <p v-if="card.ipa" class="text-xs font-mono text-indigo-600 font-medium">
                {{ formatIpa(card.ipa) }}
              </p>
              <p class="text-xs sm:text-sm font-semibold text-slate-600 line-clamp-2">
                {{ card.meaning }}
              </p>
            </div>
          </div>
        </div>

        <!-- Call to Action: Proceed to Practice -->
        <div class="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-7 bg-gradient-to-r from-blue-50 via-indigo-50/40 to-blue-50 border border-blue-200/80 rounded-3xl shadow-xs">
          <div>
            <h3 class="text-base sm:text-lg font-extrabold text-blue-950">
              Ready for practice?
            </h3>
            <p class="text-sm sm:text-base text-blue-800 mt-0.5">
              Proceed to Step 2 to practice sentences and exercises with the vocabulary you just learned.
            </p>
          </div>
          <button
            @click="lessonStep = 'practice'"
            class="w-full sm:w-auto px-7 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg rounded-2xl shadow-lg shadow-blue-600/25 transition cursor-pointer flex items-center justify-center gap-2 shrink-0 transform active:scale-98"
          >
            <span>Step 2: Practice →</span>
          </button>
        </div>
      </div>

      <!-- STEP 2: PRACTICE VIEW -->
      <template v-else>
        
        <!-- Objective Banner -->
        <div class="space-y-3 rounded-3xl bg-blue-50/80 p-6 sm:p-7 border border-blue-100">
          <h2 class="text-lg sm:text-xl font-bold text-blue-950 flex items-center gap-2">
            <span>🎯</span>
            <span>{{ lessonCards?.length ? 'Step 2:' : '' }} Practice</span>
          </h2>
          <p class="text-base sm:text-lg text-blue-900 leading-relaxed">
            {{ currentLesson.type === 'SPEAKING'
              ? 'Listen to native pronunciation and practice speaking each sentence in the lesson.'
              : 'Read the task guidance below carefully and write your response.' }}
          </p>
          <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-sm font-bold text-blue-700">
            <span>{{ currentLesson.type === 'SPEAKING' ? `${lessonDetail?.contents?.length || 0} practice sentences` : 'Practice writing and get instant feedback' }}</span>
            <span v-if="currentLesson.type === 'SPEAKING'" class="text-xs sm:text-sm font-semibold text-blue-600 bg-white/90 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
              👉 Tip: Click on any sentence to practice it directly
            </span>
          </div>
        </div>

        <!-- Contents List -->
        <div class="space-y-5">
          <div
            v-for="(content, idx) in lessonDetail?.contents || []"
            :key="content.id"
            @click="currentLesson.type === 'SPEAKING' && beginLessonPractice(content)"
            class="space-y-3.5 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xs transition-all duration-200"
            :class="currentLesson.type === 'SPEAKING' ? 'hover:border-blue-400 hover:shadow-md hover:bg-blue-50/15 cursor-pointer group' : ''"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <span class="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  Sentence #{{ idx + 1 }}
                </span>
                <span v-if="content.ipa" class="text-sm font-mono font-medium text-slate-500 hidden sm:inline">
                  /{{ content.ipa }}/
                </span>
              </div>

              <button
                v-if="currentLesson.type === 'SPEAKING'"
                type="button"
                @click.stop="beginLessonPractice(content)"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer"
                title="Practice this sentence"
              >
                <Mic class="w-3.5 h-3.5" />
                <span>Practice sentence</span>
                <ChevronRight class="w-3.5 h-3.5" />
              </button>
            </div>

            <p class="reading-text whitespace-pre-line text-lg sm:text-xl font-extrabold text-slate-900 leading-relaxed group-hover:text-blue-900 transition-colors">
              {{ content.target_text }}
            </p>

            <p v-if="content.hint_translation" class="text-base sm:text-lg text-slate-600">
              💡 Hint: <span class="font-medium text-slate-800">{{ content.hint_translation }}</span>
            </p>

            <p v-if="content.task_guidance" class="whitespace-pre-line text-sm sm:text-base text-blue-700 leading-relaxed bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
              {{ content.task_guidance }}
            </p>

            <!-- Sample text if any -->
            <details v-if="content.sample_text" class="rounded-2xl bg-slate-50 p-4 border border-slate-200/70" @click.stop>
              <summary class="cursor-pointer text-sm sm:text-base font-bold text-blue-700">
                View sample answer
              </summary>
              <p class="mt-2 text-xs sm:text-sm text-slate-500">Sample reference:</p>
              <p class="reading-text mt-2 whitespace-pre-line text-slate-800 text-base leading-relaxed">
                {{ content.sample_text }}
              </p>
            </details>

            <!-- Native Audio Player -->
            <div v-if="content.audio_url && currentLesson.type === 'SPEAKING'" class="pt-2" @click.stop>
              <audio :src="getFullAudioUrl(content.audio_url)" controls preload="none" class="w-full rounded-xl" />
            </div>
          </div>
        </div>

        <p v-if="!lessonDetail?.contents?.length" class="rounded-3xl bg-amber-50 border border-amber-200 p-6 text-base text-amber-800 text-center">
          {{ currentLesson.type === 'SPEAKING' ? 'No practice sentences available for this lesson.' : 'No writing prompt instructions available.' }}
        </p>

        <!-- Big Launch Practice Button -->
        <button
          @click="beginLessonPractice"
          :disabled="currentLesson.type === 'SPEAKING' && !lessonDetail?.contents?.length"
          class="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 p-5 text-lg font-bold text-white shadow-lg shadow-blue-600/25 disabled:opacity-40 cursor-pointer transition transform active:scale-[0.99] flex items-center justify-center gap-3"
        >
          <Mic v-if="currentLesson.type === 'SPEAKING'" class="w-6 h-6" />
          <PenLine v-else class="w-6 h-6" />
          <span>{{ currentLesson.type === 'SPEAKING' ? 'Start Speaking Practice' : 'Start Writing Practice' }}</span>
        </button>

        <!-- Navigation Buttons at Bottom of Practice Step -->
        <div class="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-7 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-3xl shadow-xs">
          <div class="flex items-center gap-3 flex-wrap">
            <button
              v-if="lessonCards?.length"
              @click="lessonStep = 'vocabulary'"
              class="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 shadow-2xs transition cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft class="w-4 h-4" />
              <span>← Review Vocabulary</span>
            </button>
            <p class="text-sm sm:text-base text-emerald-950 font-semibold">
              {{ lessonQuizzes.length ? 'Reinforce your knowledge and test retention with the quiz.' : 'View your lesson summary and completion status.' }}
            </p>
          </div>

          <button
            v-if="lessonQuizzes.length"
            @click="openLessonQuiz"
            class="w-full sm:w-auto px-7 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base sm:text-lg rounded-2xl shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-2 shrink-0 transform active:scale-98"
          >
            <span>Step 3: Take Quiz →</span>
          </button>
          <button
            v-else
            @click="lessonStep = 'summary'"
            class="w-full sm:w-auto px-7 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base sm:text-lg rounded-2xl shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-2 shrink-0 transform active:scale-98"
          >
            <span>View Summary →</span>
          </button>
        </div>

        <!-- Supplementary Activities -->
        <div class="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xs">
          <h3 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>✨</span>
            <span>Supplemental Practice</span>
          </h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              v-if="lessonQuizzes.length"
              @click="openLessonQuiz"
              class="flex flex-col items-start p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition cursor-pointer group"
            >
              <span class="text-xs font-bold text-blue-600">Quiz</span>
              <span class="font-bold text-slate-800 group-hover:text-blue-600 mt-1">Reinforcement Quiz ({{ lessonQuizzes.length }})</span>
            </button>

            <button
              v-for="deck in lessonDecks"
              :key="deck.id"
              @click="openLessonDeck(deck)"
              class="flex flex-col items-start p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition cursor-pointer group"
            >
              <span class="text-xs font-bold text-purple-600">Flashcards</span>
              <span class="font-bold text-slate-800 group-hover:text-blue-600 mt-1">{{ deck.title }}</span>
            </button>

            <button
              @click="openLessonChat"
              class="flex flex-col items-start p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition cursor-pointer group"
            >
              <span class="text-xs font-bold text-emerald-600">Roleplay</span>
              <span class="font-bold text-slate-800 group-hover:text-blue-600 mt-1">Topic-based Conversation</span>
            </button>
          </div>
        </div>

      </template>

    </template>

  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue';
import {
  Loader2, Mic, PenLine, CheckCircle2, ChevronRight, BookOpen, Search, ArrowLeft,
  Volume2, RotateCw, ChevronLeft, BookmarkPlus, Layers, Sparkles
} from 'lucide-vue-next';
import { curriculumService } from '../services/curriculumService';
import { getFullAudioUrl, getErrorMessage } from '../services/api';

const ctx = inject('screenContext');
const {
  activeTab, selectedTopic, topicLessons, currentLesson, lessonDetail,
  lessonQuizzes, lessonDecks, lessonCards, lessonLoading, lessonError, lessonStep,
  lessonProgress, canFinishLesson, journey, startLesson, startTopic,
  beginLessonPractice, openLessonQuiz, openLessonDeck, finishLesson,
  nextLesson, leaveLesson, openLessonChat, topics, navigateTab, goBack,
  hasHistory, speakText, openSaveWord
} = ctx;

// Lesson Flashcard State & Methods (Học từ vựng trước khi luyện phát âm)
const activeCardIndex = ref(0);
const isCardFlipped = ref(false);

const currentCard = computed(() => {
  const cards = lessonCards?.value;
  if (!cards || !cards.length) return null;
  const idx = Math.max(0, Math.min(activeCardIndex.value, cards.length - 1));
  return cards[idx];
});

const nextCard = () => {
  const len = lessonCards?.value?.length || 0;
  if (activeCardIndex.value < len - 1) {
    activeCardIndex.value++;
    isCardFlipped.value = false;
  }
};

const prevCard = () => {
  if (activeCardIndex.value > 0) {
    activeCardIndex.value--;
    isCardFlipped.value = false;
  }
};

const selectCard = (index) => {
  activeCardIndex.value = index;
  isCardFlipped.value = false;
};

const toggleCardFlip = () => {
  isCardFlipped.value = !isCardFlipped.value;
};

const formatIpa = (ipa) => {
  if (!ipa) return '';
  const clean = String(ipa).replace(/^\/+|\/+$/g, '').trim();
  return clean ? `/${clean}/` : '';
};

watch(
  () => currentLesson.value?.id,
  () => {
    activeCardIndex.value = 0;
    isCardFlipped.value = false;
  }
);

// Catalog state
const allLessons = ref([]);
const catalogLoading = ref(false);
const catalogError = ref('');
const searchQuery = ref('');
const selectedLevel = ref('ALL');

const levelTabs = [
  { id: 'ALL', label: 'All' },
  { id: 'Beginner', label: 'Beginner' },
  { id: 'Intermediate', label: 'Intermediate' },
  { id: 'Advanced', label: 'Advanced' }
];

const getLevelLabel = (level) => {
  if (level === 'Beginner') return 'Beginner';
  if (level === 'Intermediate') return 'Intermediate';
  if (level === 'Advanced') return 'Advanced';
  return level || 'All Levels';
};

const getLevelBadgeClass = (level) => {
  if (level === 'Beginner') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (level === 'Intermediate') return 'bg-blue-50 text-blue-700 border border-blue-200';
  if (level === 'Advanced') return 'bg-purple-50 text-purple-700 border border-purple-200';
  return 'bg-slate-100 text-slate-700 border border-slate-200';
};

const getTopicEmoji = ctx.getTopicEmoji || ((title = '') => {
  const t = (title || '').toLowerCase();
  if (t.includes('greet') || t.includes('intro') || t.includes('chào')) return '👋';
  if (t.includes('food') || t.includes('drink') || t.includes('restaurant') || t.includes('coffee') || t.includes('ăn')) return '☕';
  if (t.includes('travel') || t.includes('hotel') || t.includes('du lịch')) return '✈️';
  if (t.includes('interview') || t.includes('career') || t.includes('job') || t.includes('phỏng vấn')) return '💼';
  if (t.includes('tech') || t.includes('ai') || t.includes('intelligence') || t.includes('công nghệ')) return '🤖';
  if (t.includes('climate') || t.includes('environment') || t.includes('môi trường')) return '🌿';
  return '📚';
});

// Load all lessons & topics for complete curriculum catalog
const loadCatalog = async () => {
  catalogLoading.value = true;
  catalogError.value = '';
  try {
    const [fetchedLessons, fetchedTopics] = await Promise.all([
      curriculumService.getLessons(),
      (!topics.value || !topics.value.length) ? curriculumService.getTopics() : Promise.resolve(topics.value)
    ]);
    allLessons.value = fetchedLessons || [];
    if (fetchedTopics && (!topics.value || !topics.value.length)) {
      topics.value = fetchedTopics;
    }
  } catch (err) {
    catalogError.value = getErrorMessage(err, 'Could not load curriculum catalog. Please try again.');
  } finally {
    catalogLoading.value = false;
  }
};

// Map lessons by topic
const getTopicLessons = (topicId) => {
  return allLessons.value
    .filter(lesson => lesson.topic_id === topicId)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
};

// Calculate progress per topic
const getTopicProgress = (topicId) => {
  const lessons = getTopicLessons(topicId);
  if (!lessons.length) return { completed: 0, total: 0, percent: 0 };
  const completed = lessons.filter(l => journey.lesson(l.id).completed).length;
  const percent = Math.round((completed / lessons.length) * 100);
  return { completed, total: lessons.length, percent };
};

// Overall progress
const overallStats = computed(() => {
  const total = allLessons.value.length || 0;
  if (!total) return { completed: 0, total: 0, percent: 0 };
  const completed = allLessons.value.filter(l => journey.lesson(l.id).completed).length;
  const percent = Math.round((completed / total) * 100);
  return { completed, total, percent };
});

// Filter topics by CEFR Level, Search Query, or Active Selected Topic
const displayedTopics = computed(() => {
  const list = topics.value || [];
  return list.filter(topic => {
    // If user specifically filtered to a selectedTopic
    if (selectedTopic.value && topic.id !== selectedTopic.value.id) {
      return false;
    }

    // Level filter
    if (selectedLevel.value !== 'ALL' && topic.level !== selectedLevel.value) {
      return false;
    }

    // Search query filter (matches topic title/desc or any lesson title)
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      const matchTopic = (topic.title || '').toLowerCase().includes(q) || (topic.description || '').toLowerCase().includes(q);
      const topicLessonsList = getTopicLessons(topic.id);
      const matchLesson = topicLessonsList.some(l => (l.title || '').toLowerCase().includes(q));
      if (!matchTopic && !matchLesson) return false;
    }

    return true;
  });
});

const clearTopicFilter = () => {
  selectedTopic.value = null;
};

const handleSelectLesson = (lesson) => {
  startLesson(lesson);
};

const handleBackToCatalog = () => {
  if (hasHistory?.value) {
    goBack();
  } else if (leaveLesson) {
    leaveLesson();
  } else {
    currentLesson.value = null;
    lessonDetail.value = null;
  }
};

onMounted(() => {
  if (activeTab.value === 'lesson' || allLessons.value.length === 0) {
    loadCatalog();
  }
});

watch(activeTab, (tab) => {
  if (tab === 'lesson' && allLessons.value.length === 0) {
    loadCatalog();
  }
});
</script>

<style scoped>
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
  outline: 3px solid rgba(59, 130, 246, 0.45);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .flashcard-inner {
    transition-duration: 1ms;
  }
}
</style>
