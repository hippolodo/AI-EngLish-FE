<template>
  <section v-if="activeTab === 'lesson'" class="w-full max-w-6xl mx-auto space-y-8 pb-28">
    
    <!-- STATE 1: BROWSE ALL TOPICS & LESSONS (CATALOG VIEW) -->
    <template v-if="!currentLesson">
      
      <!-- Top Title & Overview Stats -->
      <div class="space-y-4">
        <!-- Back to Topics Catalog (Only visible when filtering by a specific topic) -->
        <div v-if="selectedTopic">
          <AnimateButton
            variant="outline"
            size="sm"
            @click="clearTopicFilter"
            class="group"
          >
            <template #prefix>
              <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </template>
            <span>Back to Topics</span>
          </AnimateButton>
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
              <p class="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Overall Progress</p>
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
              :class="selectedLevel === lvl.id ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20' : 'text-slate-600 hover:text-slate-900 font-semibold'"
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
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-4">
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
                @mouseenter="ctx.prefetchLesson ? ctx.prefetchLesson(lesson.id) : null"
                class="group/item min-w-0 w-full flex items-center justify-between p-4.5 sm:p-5 rounded-2xl bg-slate-100/75 hover:bg-blue-50/80 transition-all duration-200 cursor-pointer overflow-hidden"
              >
                <!-- Left: Number pill & Title -->
                <div class="flex items-center gap-3.5 flex-1 min-w-0 overflow-hidden">
                  
                  <!-- Lesson Number Badge -->
                  <div
                    class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-extrabold text-xs sm:text-sm shrink-0 transition-colors shadow-2xs"
                    :class="journey.lesson(lesson.id).completed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-white text-slate-700 border border-slate-200 group-hover/item:border-blue-300 group-hover/item:text-blue-600'"
                  >
                    <CheckCircle2 v-if="journey.lesson(lesson.id).completed" class="w-5 h-5 text-emerald-600" />
                    <span v-else>L{{ idx + 1 }}</span>
                  </div>

                  <!-- Details with strict width bounding -->
                  <div class="flex-1 min-w-0 overflow-hidden">
                    <div v-if="journey.lesson(lesson.id).completed" class="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.2 rounded-full">
                        Completed
                      </span>
                    </div>

                    <h4
                      class="text-sm sm:text-base font-bold text-slate-900 group-hover/item:text-blue-600 transition leading-snug line-clamp-2 break-words"
                      :title="'Lesson ' + (idx + 1) + ': ' + lesson.title"
                    >
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
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <AnimateButton
            variant="outline"
            size="sm"
            @click="handleBackToCatalog"
            class="group"
          >
            <template #prefix>
              <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </template>
            <span>Back to Lessons</span>
          </AnimateButton>

          <span
            v-if="journey.lesson(currentLesson.id).completed"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-2xs"
          >
            <Check class="w-3.5 h-3.5 text-emerald-600" />
            Lesson Completed
          </span>
        </div>

        <div class="pt-1">
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <span
              class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
              :class="getLevelBadgeClass(selectedTopic?.level || currentLesson.level)"
            >
              {{ getLevelLabel(selectedTopic?.level || currentLesson.level || 'Beginner') }}
            </span>
            <span v-if="selectedTopic?.title" class="text-xs sm:text-sm font-bold text-slate-500">
              Topic: {{ selectedTopic.title }}
            </span>
            <span
              class="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80"
            >
              {{ currentLesson.type === 'SPEAKING' ? 'Speaking Practice' : 'Writing Practice' }}
            </span>
          </div>

          <h1 class="text-slate-900 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug">
            {{ currentLesson.title }}
          </h1>
        </div>
      </div>

      <!-- Modern Segmented Control Step Tabs -->
      <div class="p-1.5 bg-slate-100/90 backdrop-blur-md rounded-2xl border border-slate-200/80 flex gap-1.5 overflow-x-auto shadow-2xs">
        <!-- 1. Vocabulary -->
        <button
          v-if="lessonCards?.length"
          @click="lessonStep = 'vocabulary'"
          class="flex-1 min-w-[130px] rounded-xl py-3 px-4 transition-all duration-200 flex items-center justify-center cursor-pointer text-xs sm:text-sm"
          :class="lessonStep === 'vocabulary'
            ? 'bg-white text-blue-600 shadow-sm font-extrabold ring-1 ring-slate-200/60'
            : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-white/50'"
        >
          <span>1. Vocabulary</span>
        </button>

        <!-- 2. Practice -->
        <button
          @click="lessonStep = 'practice'"
          class="flex-1 min-w-[130px] rounded-xl py-3 px-4 transition-all duration-200 flex items-center justify-center cursor-pointer text-xs sm:text-sm"
          :class="lessonStep === 'practice'
            ? 'bg-white text-blue-600 shadow-sm font-extrabold ring-1 ring-slate-200/60'
            : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-white/50'"
        >
          <span>{{ lessonCards?.length ? '2.' : '1.' }} Practice</span>
        </button>

        <!-- 3. Quiz -->
        <button
          @click="handleSelectQuizStep"
          :disabled="!lessonQuizzes?.length"
          class="flex-1 min-w-[120px] rounded-xl py-3 px-4 disabled:opacity-40 transition-all duration-200 flex items-center justify-center cursor-pointer text-xs sm:text-sm"
          :class="lessonStep === 'quiz'
            ? 'bg-white text-blue-600 shadow-sm font-extrabold ring-1 ring-slate-200/60'
            : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-white/50'"
        >
          <span>{{ lessonCards?.length ? '3.' : '2.' }} Quiz</span>
        </button>

        <!-- 4. Summary -->
        <button
          @click="lessonStep = 'summary'"
          class="flex-1 min-w-[120px] rounded-xl py-3 px-4 transition-all duration-200 flex items-center justify-center cursor-pointer text-xs sm:text-sm"
          :class="lessonStep === 'summary'
            ? 'bg-white text-blue-600 shadow-sm font-extrabold ring-1 ring-slate-200/60'
            : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-white/50'"
        >
          <span>{{ lessonCards?.length ? '4.' : '3.' }} Summary</span>
        </button>
      </div>

      <!-- STEP 4: ENHANCED PEDAGOGICAL SUMMARY VIEW -->
      <div v-if="lessonStep === 'summary'" class="space-y-6">
        <!-- Hero Evaluation & Grade Card -->
        <div class="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <span class="text-3xl">{{ performanceTier.grade === 'A+' ? '🏆' : performanceTier.grade === 'A' ? '🎉' : '📊' }}</span>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span
                    class="px-3 py-1 rounded-full text-xs font-bold border"
                    :class="performanceTier.badgeClass"
                  >
                    {{ performanceTier.badge }}
                  </span>
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {{ currentLesson.type === 'SPEAKING' ? 'Luyện nói & Phát âm' : 'Luyện viết câu' }}
                  </span>
                </div>
                <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  {{ performanceTier.title }}
                </h2>
                <p class="text-sm sm:text-base text-slate-600 mt-0.5">
                  {{ currentLesson.title }} · Tổng kết thành tích học tập và đánh giá sư phạm
                </p>
              </div>
            </div>

            <!-- Overall Grade Pill Badge -->
            <div class="flex items-center sm:flex-col justify-end gap-1.5 shrink-0 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200/80">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Grade</span>
              <span class="text-3xl sm:text-4xl font-black" :class="performanceTier.gradeColor">
                {{ performanceTier.grade }}
              </span>
            </div>
          </div>

          <!-- 3 Stat Metrics -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Sentences Practiced -->
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
                <span>{{ currentLesson.type === 'SPEAKING' ? 'Sentences Practiced' : 'Writing Status' }}</span>
                <span class="text-emerald-700 font-extrabold">{{ sentencesCompletionRatio }}%</span>
              </div>
              <p class="text-2xl font-black text-slate-900">
                {{ currentLesson.type === 'SPEAKING' ? (completedSentencesCount + '/' + totalSentencesCount) : 'Submitted' }}
              </p>
              <p class="text-xs text-slate-500 font-medium">Hoàn thành bài luyện tập</p>
            </div>

            <!-- Practice Score -->
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
                <span>Practice Score</span>
                <span v-if="averagePracticeScore !== null" class="font-extrabold text-blue-700">{{ averagePracticeScore >= 85 ? 'Xuất sắc' : averagePracticeScore >= 70 ? 'Khá' : 'Đạt' }}</span>
              </div>
              <p class="text-2xl font-black text-blue-700">
                {{ practiceScoreDisplay }}
              </p>
              <p class="text-xs text-slate-500 font-medium">Độ chuẩn âm vị & ngữ điệu (GOP)</p>
            </div>

            <!-- Quiz Score -->
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
                <span>Quiz Score</span>
                <span v-if="lessonProgress?.quiz_score !== null && lessonProgress?.quiz_score !== undefined" class="font-extrabold text-emerald-700">Đã chấm</span>
              </div>
              <p class="text-2xl font-black" :class="lessonProgress?.quiz_score !== null && lessonProgress?.quiz_score !== undefined ? 'text-emerald-700' : 'text-slate-400'">
                {{ lessonProgress?.quiz_score !== null && lessonProgress?.quiz_score !== undefined ? (lessonProgress.quiz_score + '/100') : 'Chưa làm' }}
              </p>
              <p class="text-xs text-slate-500 font-medium">Khả năng ghi nhớ từ vựng</p>
            </div>
          </div>
        </div>

        <!-- AI TUTOR PEDAGOGICAL EVALUATION & REMARKS -->
        <div class="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-2xs">
              <Sparkles class="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900 leading-tight">Đánh giá &amp; Nhận xét của Giáo viên AI</h3>
              <p class="text-xs sm:text-sm text-slate-500">Phân tích sư phạm chuyên sâu dựa trên kết quả bài học</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- 1. Strengths -->
            <div class="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
              <div class="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 class="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span>Điểm sáng đạt được</span>
              </div>
              <p class="text-xs sm:text-sm text-emerald-950 leading-relaxed font-normal">
                {{ performanceTier.strengths }}
              </p>
            </div>

            <!-- 2. Improvements -->
            <div class="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div class="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertCircle class="w-4.5 h-4.5 text-amber-600 shrink-0" />
                <span>Cần lưu ý cải thiện</span>
              </div>
              <p class="text-xs sm:text-sm text-amber-950 leading-relaxed font-normal">
                {{ performanceTier.improvements }}
              </p>
            </div>

            <!-- 3. Next Actions -->
            <div class="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
              <div class="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <Sparkles class="w-4.5 h-4.5 text-blue-600 shrink-0" />
                <span>Kế hoạch hành động</span>
              </div>
              <p class="text-xs sm:text-sm text-blue-950 leading-relaxed font-normal">
                {{ performanceTier.actionAdvice }}
              </p>
            </div>
          </div>
        </div>

        <!-- SENTENCE-BY-SENTENCE BREAKDOWN -->
        <div v-if="currentLesson.type === 'SPEAKING' && speakingScoresList.length" class="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <h3 class="text-lg font-bold text-slate-900 leading-tight">Chi tiết từng câu luyện tập</h3>
              <p class="text-xs sm:text-sm text-slate-500">Xem lại phát âm mẫu và bấm luyện lại bất kỳ câu nào</p>
            </div>
            <span class="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {{ completedSentencesCount }}/{{ totalSentencesCount }} câu hoàn thành
            </span>
          </div>

          <div class="space-y-3">
            <div
              v-for="item in speakingScoresList"
              :key="item.id"
              class="p-4.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div class="space-y-1.5 min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-600">
                    Câu {{ item.index }}
                  </span>
                  <span
                    v-if="item.score !== null"
                    class="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                    :class="item.score >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : item.score >= 70 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
                  >
                    {{ item.score }}% · {{ item.score >= 85 ? 'Xuất sắc' : item.score >= 70 ? 'Tốt' : 'Cần rèn thêm' }}
                  </span>
                  <span v-else-if="item.completed" class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Đã hoàn thành
                  </span>
                  <span v-else class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                    Chưa luyện
                  </span>
                </div>

                <p class="text-base font-bold text-slate-900 leading-snug">
                  {{ item.target_text }}
                </p>
                <p v-if="item.hint_translation" class="text-xs sm:text-sm text-slate-600">
                  {{ item.hint_translation }}
                </p>
              </div>

              <!-- Action Buttons for Sentence -->
              <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  @click="speakText(item.target_text)"
                  class="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition shadow-2xs cursor-pointer"
                  title="Nghe phát âm chuẩn"
                  aria-label="Nghe câu này"
                >
                  <Volume2 class="w-4 h-4 text-blue-600" />
                </button>
                <button
                  type="button"
                  @click="beginLessonPractice(item)"
                  class="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-blue-700 text-xs sm:text-sm font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Mic class="w-3.5 h-3.5 text-blue-600" />
                  <span>Luyện lại</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- CALL TO ACTION CONTROLS -->
        <div class="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-3">
          <AnimateButton
            v-if="!lessonProgress?.completed"
            variant="emerald"
            size="lg"
            class="w-full text-base font-extrabold"
            @click="finishLesson"
            :disabled="!canFinishLesson"
          >
            Đánh dấu hoàn thành bài học 🎉
          </AnimateButton>

          <p v-if="!canFinishLesson" class="text-sm font-semibold text-amber-700 text-center">
            {{ currentLesson.type === 'SPEAKING' ? '💡 Hoàn thành toàn bộ các câu luyện tập để kết thúc bài học.' : '💡 Nộp ít nhất một bài viết để hoàn thành.' }}
          </p>

          <div v-if="lessonProgress?.completed" class="flex flex-col sm:flex-row gap-3">
            <AnimateButton
              variant="default"
              size="lg"
              class="flex-1 text-base font-extrabold"
              @click="nextLesson"
            >
              Chuyển sang bài học tiếp theo →
            </AnimateButton>
            <AnimateButton
              variant="outline"
              size="lg"
              class="sm:w-auto text-base font-bold"
              @click="beginLessonPractice()"
            >
              Luyện lại từ đầu
            </AnimateButton>
          </div>

          <div class="flex items-center justify-center gap-4 pt-2">
            <button
              v-if="lessonCards?.length"
              @click="lessonStep = 'vocabulary'"
              class="text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 cursor-pointer flex items-center gap-1.5"
            >
              <Layers class="w-4 h-4 text-slate-500" />
              <span>Ôn từ vựng bài này (Flashcards)</span>
            </button>
            <span v-if="lessonCards?.length && lessonQuizzes?.length" class="text-slate-300">·</span>
            <button
              v-if="lessonQuizzes?.length"
              @click="handleSelectQuizStep"
              class="text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen class="w-4 h-4 text-slate-500" />
              <span>Làm lại bài Quiz</span>
            </button>
          </div>
        </div>
      </div>

      <!-- STEP 1: VOCABULARY FLASHCARD VIEW -->
      <div v-else-if="lessonStep === 'vocabulary'" class="space-y-6">
        <!-- Vocabulary Objective Banner -->
        <div class="space-y-2.5 rounded-3xl bg-blue-50/80 p-6 sm:p-7 border border-blue-100 shadow-2xs">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span class="text-2xl">🎴</span>
              <span>Step 1: Vocabulary Flashcards</span>
            </h2>
            <span class="px-3.5 py-1 rounded-full bg-white text-blue-700 text-xs sm:text-sm font-bold border border-blue-200 shadow-2xs">
              {{ activeCardIndex + 1 }} / {{ lessonCards.length }} words
            </span>
          </div>
          <p class="max-w-2xl text-base sm:text-lg text-slate-700 leading-relaxed">
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
                v-show="!isCardFlipped"
                :aria-hidden="isCardFlipped"
                :inert="isCardFlipped"
                :class="isCardFlipped ? 'invisible pointer-events-none' : 'visible'"
                class="flashcard-face flashcard-front absolute inset-0 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl flex flex-col justify-between items-center text-center"
              >
                <div class="w-full flex justify-between items-center">
                  <span class="text-xs sm:text-sm font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-xl">
                    Vocabulary Card #{{ activeCardIndex + 1 }}
                  </span>

                  <div class="flex items-center gap-2">
                    <button
                      @click.stop="openSaveWord(currentCard.word, currentCard.hint_example, currentCard.meaning, currentCard.ipa)"
                      class="w-10 h-10 rounded-full bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-600 border border-slate-200 flex items-center justify-center cursor-pointer transition shadow-2xs"
                      title="Save word to personal vocabulary"
                    >
                      <BookmarkPlus class="w-4.5 h-4.5" />
                    </button>
                    <button
                      @click.stop="speakText(currentCard.word)"
                      class="w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 flex items-center justify-center cursor-pointer transition shadow-2xs group/btn"
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
                  <div v-if="formatIpa(currentCard.ipa)" class="font-mono font-bold text-lg sm:text-2xl text-blue-600 tracking-wide">
                <span>{{ formatIpa(currentCard.ipa) }}</span>
              </div>
                </div>

                <div class="text-xs sm:text-sm text-slate-600 font-semibold flex items-center gap-2">
                  <RotateCw class="w-4 h-4 text-blue-600 animate-pulse" />
                  <span>Tap card or press Space to flip and view definition & example</span>
                </div>
              </div>

              <!-- BACK SIDE (Meaning + Example Sentence) -->
              <div
                v-show="isCardFlipped"
                :aria-hidden="!isCardFlipped"
                :inert="!isCardFlipped"
                :class="!isCardFlipped ? 'invisible pointer-events-none' : 'visible'"
                class="flashcard-face flashcard-back absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-amber-50/30 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl flex flex-col justify-between text-left"
              >
                <div class="flex justify-between items-center">
                  <span class="text-xs sm:text-sm font-bold px-3 py-1 bg-blue-600 text-white rounded-xl uppercase tracking-wide">
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
                  <div class="flex items-center gap-2 flex-wrap pb-2 border-b border-slate-100">
                    <span class="font-extrabold text-slate-900 text-lg sm:text-2xl">{{ currentCard.word }}</span>
                    <span v-if="formatIpa(currentCard.ipa)" class="font-mono text-sm sm:text-base font-semibold text-blue-700 bg-blue-50 px-3 py-0.5 rounded-full">
                      {{ formatIpa(currentCard.ipa) }}
                    </span>
                  </div>
                  <h4 class="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                    {{ currentCard.meaning || 'No definition available' }}
                  </h4>
                  <p v-if="currentCard.hint_example" class="text-sm sm:text-base text-slate-700 italic px-5 py-3.5 bg-slate-100/75 rounded-2xl leading-relaxed">
                    "{{ currentCard.hint_example }}"
                  </p>
                </div>

                <p class="text-xs sm:text-sm text-slate-600 font-semibold text-center">
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
              class="py-3 px-4 sm:px-6 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm sm:text-base rounded-2xl border border-blue-200 shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
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
              <p v-if="card.ipa" class="text-xs font-mono text-blue-600 font-medium">
                {{ formatIpa(card.ipa) }}
              </p>
              <p class="text-xs sm:text-sm font-semibold text-slate-600 line-clamp-2">
                {{ card.meaning }}
              </p>
            </div>
          </div>
        </div>

        <!-- Call to Action: Proceed to Practice -->
        <div class="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-7 bg-blue-50/80 border border-blue-200/80 rounded-3xl shadow-xs">
          <div class="max-w-xl">
            <h3 class="text-base sm:text-lg font-extrabold text-slate-900">
              Ready for practice?
            </h3>
            <p class="text-sm sm:text-base text-slate-700 mt-1 leading-relaxed">
              Proceed to Step 2 to practice sentences and exercises with the vocabulary you just learned.
            </p>
          </div>
          <button
            @click="lessonStep = 'practice'"
            class="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center justify-center gap-2 shrink-0 transform active:scale-98"
          >
            <span>Step 2: Practice →</span>
          </button>
        </div>
      </div>

      <!-- STEP 3: QUIZ VIEW (Directly embedded in Tab 3!) -->
      <div v-else-if="lessonStep === 'quiz'" class="space-y-6">

        <!-- Quiz Completion Hero Card (Shown when quiz attempt is submitted) -->
        <div
          v-if="quizResult"
          role="status"
          class="bento-card bg-gradient-to-br from-white via-blue-50/30 to-sky-50/40 rounded-3xl border border-blue-200/90 p-7 sm:p-10 shadow-lg space-y-7"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-blue-100">
            <div class="flex items-center gap-5">
              <div
                class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-4xl shadow-md shrink-0"
                :class="quizResult.is_passed ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-600' : 'bg-amber-50 border-2 border-amber-200 text-amber-600'"
              >
                {{ quizResult.is_passed ? '🎉' : '📊' }}
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1.5">
                  <span
                    class="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                    :class="quizResult.is_passed ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'"
                  >
                    {{ quizResult.is_passed ? 'PASSED · QUALIFIED 🌟' : 'PRACTICE NEEDED 💡' }}
                  </span>
                </div>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {{ quizResult.is_passed ? 'Congratulations! Quiz Completed' : 'Good Attempt! Review & Retake' }}
                </h2>
                <p class="text-slate-600 text-sm sm:text-base mt-1">
                  You scored <span class="font-extrabold text-blue-600">{{ quizResult.correct_answers }}</span> of <span class="font-extrabold text-slate-800">{{ quizResult.total_questions }}</span> questions correct.
                </p>
              </div>
            </div>

            <!-- Big Score Badge -->
            <div class="flex items-center gap-4 bg-white px-7 py-5 rounded-3xl border border-slate-200/90 shadow-sm shrink-0">
              <div class="text-right">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Lesson Score</p>
                <p class="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">
                  <AnimateCountingNumber :number="quizResult.score" />
                  <span class="text-lg text-slate-400 font-bold">/100</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Quick Stats Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Accuracy Rate</span>
              <p class="text-2xl font-black text-slate-900 mt-1">
                {{ quizResult.total_questions ? Math.round((quizResult.correct_answers / quizResult.total_questions) * 100) : 0 }}%
              </p>
            </div>

            <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Correct Answers</span>
              <p class="text-2xl font-black text-emerald-600 mt-1">
                {{ quizResult.correct_answers }} / {{ quizResult.total_questions }}
              </p>
            </div>

            <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Result Status</span>
              <p class="text-2xl font-black mt-1" :class="quizResult.is_passed ? 'text-emerald-600' : 'text-amber-600'">
                {{ quizResult.is_passed ? 'Mastered 🌟' : 'Review needed ⚠️' }}
              </p>
            </div>
          </div>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
            <button
              @click="lessonStep = 'summary'"
              class="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base rounded-2xl shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center justify-center gap-2 transform active:scale-98"
            >
              <span>Step 4: View Lesson Summary →</span>
            </button>

            <button
              @click="restartQuiz"
              class="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-base rounded-2xl border border-slate-200 shadow-2xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw class="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>

        <!-- Active Question Flow (When quiz is in progress) -->
        <div v-else class="space-y-6">

          <!-- Sleek Gamified Progress Rail (Minimalist, Duolingo-style) -->
          <div class="flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div class="flex items-center gap-3">
              <span class="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs sm:text-sm font-extrabold border border-blue-100 shadow-2xs">
                Question {{ currentStudyIndex + 1 }} of {{ quizQuestions?.length || 1 }}
              </span>
              <span class="text-xs font-bold text-slate-400 hidden sm:inline">
                {{ currentQuestion?.question_type === 'FILL_BLANK' ? '✏️ Fill in the Blank' : '🎯 Multiple Choice' }}
              </span>
            </div>

            <!-- Animated Smooth Progress Bar -->
            <div class="flex-1 max-w-xs sm:max-w-md h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/70">
              <div
                class="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out shadow-xs"
                :style="{ width: `${((currentStudyIndex + 1) / (quizQuestions?.length || 1)) * 100}%` }"
              ></div>
            </div>

            <div class="text-xs sm:text-sm font-extrabold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 shrink-0">
              {{ Math.round(((currentStudyIndex + 1) / (quizQuestions?.length || 1)) * 100) }}%
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="studyLoading" class="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-100 shadow-2xs">
            <Loader2 class="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p class="text-base font-bold text-slate-800">Loading quiz questions…</p>
          </div>

          <!-- Empty fallback -->
          <div v-else-if="!quizQuestions?.length" class="p-10 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
            <p class="text-base font-bold text-slate-700">No questions found for this lesson quiz.</p>
            <button @click="handleSelectQuizStep" class="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm cursor-pointer">
              Load Quiz Questions
            </button>
          </div>

          <!-- Active Question Card Arena -->
          <div v-else class="space-y-6">
            <div class="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
              <div class="flex items-center justify-between gap-3 flex-wrap">
                <span class="px-3.5 py-1 rounded-xl bg-slate-100 text-slate-600 font-extrabold text-xs uppercase tracking-wider">
                  {{ currentQuestion?.question_type === 'FILL_BLANK' ? '✏️ Type Your Answer' : '🎯 Choose the Correct Option' }}
                </span>
                <button
                  v-if="currentQuestion?.question_text"
                  type="button"
                  @click="speakText(currentQuestion.question_text)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
                >
                  <Volume2 class="w-3.5 h-3.5" />
                  <span>Listen Prompt</span>
                </button>
              </div>

              <!-- Question Prompt Text -->
              <h3 class="reading-text text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {{ currentQuestion?.question_text }}
              </h3>

              <!-- Custom Audio Player if present -->
              <div v-if="currentQuestion?.audio_url" :key="currentQuestion.id" class="pt-1">
                <AudioPlayer
                  :src="getFullAudioUrl(currentQuestion.audio_url)"
                  label="Question Audio"
                  :fallback-text="currentQuestion.question_text"
                />
              </div>

              <!-- Illustration Image if present -->
              <div v-if="currentQuestion?.image_url" class="pt-2">
                <img
                  :src="getFullAudioUrl(currentQuestion.image_url)"
                  alt="Question illustration"
                  class="max-h-56 rounded-2xl object-contain mx-auto shadow-sm border border-slate-100"
                />
              </div>

              <!-- Fill in Blank Input -->
              <div v-if="currentQuestion?.question_type === 'FILL_BLANK'" class="pt-2 space-y-3">
                <label class="block text-sm font-extrabold text-slate-700">Type your answer:</label>
                <div class="relative">
                  <input
                    v-model="quizInputText"
                    :disabled="quizChecked || isSubmittingQuiz || quizFeedbackLoading"
                    @keyup.enter="checkQuizAnswer"
                    type="text"
                    class="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 p-4 sm:p-5 text-base sm:text-lg font-bold text-slate-900 shadow-2xs focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all placeholder-slate-400"
                    placeholder="Type answer here…"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hidden sm:inline">
                    Press Enter ↵
                  </span>
                </div>
              </div>

              <!-- Multiple Choice 3D Tactile Buttons (Duolingo Style: 2 columns on tablet/desktop, 1 on mobile) -->
              <div v-if="currentQuestion?.question_type !== 'FILL_BLANK'" class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <button
                  v-for="(ans, aIdx) in (currentQuestion?.answers || [])"
                  :key="ans.id || aIdx"
                  @click="selectQuizAnswer(ans)"
                  :disabled="quizChecked || isSubmittingQuiz || quizFeedbackLoading"
                  :class="[
                    'group w-full text-left p-4.5 sm:p-5 rounded-2xl border-2 border-b-4 transition-all duration-150 flex items-center justify-between gap-4 cursor-pointer select-none',
                    getOptionCardClass(ans)
                  ]"
                >
                  <div class="flex items-center gap-3.5 min-w-0">
                    <span
                      class="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 transition-colors shadow-2xs"
                      :class="getLetterBadgeClass(ans, aIdx)"
                    >
                      {{ ['A', 'B', 'C', 'D'][aIdx] || (aIdx + 1) }}
                    </span>
                    <span class="text-base sm:text-lg font-bold leading-snug break-words">
                      {{ ans.answer_text }}
                    </span>
                  </div>

                  <div class="shrink-0 flex items-center justify-center">
                    <CheckCircle2
                      v-if="quizChecked && submittedQuizDetail?.is_correct && selectedQuizAnswer?.id === ans.id"
                      class="w-6 h-6 text-emerald-600 animate-bounce"
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

            <!-- Explanation & Feedback Alert (Slides up on check with high satisfaction) -->
            <div
              v-if="quizChecked && submittedQuizDetail"
              role="status"
              aria-live="polite"
              class="p-6 rounded-3xl border text-sm sm:text-base space-y-3 shadow-md transition-all duration-300"
              :class="submittedQuizDetail?.is_correct
                ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border-rose-200 text-rose-950'"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  :class="submittedQuizDetail?.is_correct ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'"
                >
                  <CheckCircle2 v-if="submittedQuizDetail?.is_correct" class="w-6 h-6" />
                  <XCircle v-else class="w-6 h-6" />
                </div>
                <div>
                  <h4 class="font-black text-lg sm:text-xl">
                    {{ submittedQuizDetail?.is_correct ? 'Spot on! Correct answer.' : 'Not quite right!' }}
                  </h4>
                  <p v-if="submittedQuizDetail?.correct_answer_text && !submittedQuizDetail?.is_correct" class="text-sm font-bold flex items-center gap-2 pt-1 flex-wrap">
                    <span>Correct Answer:</span>
                    <span class="px-3 py-1 rounded-xl bg-white text-emerald-800 border border-emerald-300 font-black shadow-2xs">
                      {{ submittedQuizDetail.correct_answer_text }}
                    </span>
                  </p>
                </div>
              </div>

              <p v-if="submittedQuizDetail?.explanation" class="text-sm sm:text-base leading-relaxed pl-13 opacity-95">
                {{ submittedQuizDetail.explanation }}
              </p>
            </div>

            <!-- Action Navigation Buttons -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                v-if="currentStudyIndex > 0"
                type="button"
                @click="previousQuizQuestion"
                :disabled="isSubmittingQuiz || quizFeedbackLoading"
                class="w-full sm:w-auto px-5 py-3.5 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-sm cursor-pointer transition flex items-center justify-center gap-2"
              >
                <ChevronLeft class="w-4 h-4" />
                <span>Previous Question</span>
              </button>
              <div v-else class="hidden sm:block"></div>

              <button
                v-if="!quizChecked"
                type="button"
                @click="checkQuizAnswer"
                :disabled="!canAnswerQuiz || isSubmittingQuiz || quizFeedbackLoading"
                class="w-full sm:w-auto min-w-[220px] py-4.5 px-8 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-base rounded-2xl shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Loader2 v-if="isSubmittingQuiz || quizFeedbackLoading" class="w-5 h-5 animate-spin" />
                <span>
                  {{ quizFeedbackLoading
                    ? 'Checking answer…'
                    : isSubmittingQuiz
                      ? 'Submitting quiz...'
                      : quizFeedbackMode === 'immediate'
                        ? 'Check Answer ↵'
                        : currentStudyIndex < quizQuestions.length - 1
                          ? 'Save & Next Question →'
                          : 'Submit Quiz 🎯' }}
                </span>
              </button>

              <button
                v-else
                type="button"
                @click="nextQuizQuestion"
                :disabled="isSubmittingQuiz || quizFeedbackLoading"
                class="w-full sm:w-auto min-w-[220px] py-4.5 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 active:scale-[0.98] disabled:opacity-40 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Loader2 v-if="isSubmittingQuiz" class="h-5 w-5 animate-spin" />
                <span>
                  {{ isSubmittingQuiz
                    ? 'Saving results…'
                    : currentStudyIndex < quizQuestions.length - 1
                      ? 'Continue to Next →'
                      : 'Finish & View Results 🏆' }}
                </span>
                <ArrowRight v-if="!isSubmittingQuiz" class="w-5 h-5" />
              </button>
            </div>

          </div>

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
          <p class="max-w-2xl text-base sm:text-lg text-slate-700 leading-relaxed">
            {{ currentLesson.type === 'SPEAKING'
              ? 'Listen to native pronunciation and practice speaking each sentence in the lesson.'
              : 'Read the task guidance below carefully and write your response.' }}
          </p>
          <div class="flex flex-wrap items-center justify-between gap-3 pt-1 text-sm font-bold text-blue-800">
            <span>{{ currentLesson.type === 'SPEAKING' ? `${lessonDetail?.contents?.length || 0} practice sentences` : 'Practice writing and get instant feedback' }}</span>
            <span v-if="currentLesson.type === 'SPEAKING'" class="text-xs sm:text-sm font-bold text-blue-700 bg-white px-5 py-2.5 rounded-full border border-blue-200 shadow-2xs">
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
            class="bento-card space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xs transition-all duration-300"
            :class="currentLesson.type === 'SPEAKING' ? 'hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer group' : ''"
          >
            <!-- Card Header: Sentence Number & Action Button -->
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 flex-wrap">
                <span class="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                  Sentence #{{ idx + 1 }}
                </span>
                
                <!-- Dialogue Speaker Pill (e.g. Tom, Alice) -->
                <span
                  v-if="parseSpeakerLine(content.target_text).speaker"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-extrabold text-blue-700"
                >
                  <User class="w-3 h-3 text-blue-500" />
                  {{ parseSpeakerLine(content.target_text).speaker }}
                </span>

                <!-- Practiced Indicator -->
                <span
                  v-if="lessonProgress?.completed_content_ids?.includes(content.id)"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold"
                >
                  <Check class="w-3 h-3 text-emerald-600" />
                  Practiced
                  <span v-if="lessonProgress?.speaking_scores?.[String(content.id)]" class="font-extrabold">
                    · {{ Math.round(lessonProgress.speaking_scores[String(content.id)]) }}%
                  </span>
                </span>
              </div>

              <button
                v-if="currentLesson.type === 'SPEAKING'"
                type="button"
                @click.stop="beginLessonPractice(content)"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer group-hover:scale-102"
                title="Practice speaking this sentence"
              >
                <Mic class="w-3.5 h-3.5" />
                <span>Practice sentence</span>
                <ChevronRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <!-- Target English Text -->
            <p class="reading-text whitespace-pre-line text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-relaxed group-hover:text-blue-900 transition-colors">
              {{ parseSpeakerLine(content.target_text).speaker ? parseSpeakerLine(content.target_text).text : content.target_text }}
            </p>

            <!-- Hint Translation (Clean inline callout, no borders, no side-tab accent, no nested card) -->
            <div v-if="content.hint_translation" class="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 pt-1">
              <span class="text-amber-500 shrink-0 text-base">💡</span>
              <p class="leading-relaxed">
                <span class="font-bold text-amber-900">Meaning: </span>
                <span class="font-medium text-slate-800">{{ parseHintLine(content.hint_translation) }}</span>
              </p>
            </div>

            <!-- Task Guidance if any -->
            <p v-if="content.task_guidance" class="whitespace-pre-line text-sm sm:text-base text-blue-800 leading-relaxed bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
              {{ content.task_guidance }}
            </p>

            <!-- Sample Reference if any -->
            <details v-if="content.sample_text" class="rounded-2xl bg-slate-50 p-4 border border-slate-200/70" @click.stop>
              <summary class="cursor-pointer text-sm sm:text-base font-bold text-blue-700 hover:underline">
                View sample answer
              </summary>
              <p class="mt-2 text-xs sm:text-sm text-slate-500 font-semibold">Sample reference:</p>
              <p class="reading-text mt-2 whitespace-pre-line text-slate-800 text-base leading-relaxed">
                {{ content.sample_text }}
              </p>
            </details>

            <!-- Custom Audio Player (Replaced ugly browser HTML5 audio) -->
            <div v-if="content.audio_url && currentLesson.type === 'SPEAKING'" class="pt-1" @click.stop>
              <AudioPlayer
                :src="getFullAudioUrl(content.audio_url)"
                :label="'Native Pronunciation · Sentence #' + (idx + 1)"
                :fallback-text="parseSpeakerLine(content.target_text).text"
              />
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
            @click="handleSelectQuizStep"
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
  Volume2, RotateCw, ChevronLeft, BookmarkPlus, Layers, Sparkles, User, Check,
  XCircle, AlertCircle, RotateCcw, ArrowRight, Trophy, HelpCircle
} from 'lucide-vue-next';
import AnimateButton from '../components/ui/Button.vue';
import AudioPlayer from '../components/ui/AudioPlayer.vue';
import AnimateCard from '../components/ui/Card.vue';
import AnimateBadge from '../components/ui/Badge.vue';
import AnimateCountingNumber from '../components/ui/CountingNumber.vue';
import { curriculumService } from '../services/curriculumService';
import { getFullAudioUrl, getErrorMessage } from '../services/api';

const ctx = inject('screenContext');
const {
  activeTab, selectedTopic, topicLessons, currentLesson, lessonDetail,
  lessonQuizzes, lessonDecks, lessonCards, lessonLoading, lessonError, lessonStep,
  lessonProgress, canFinishLesson, journey, startLesson, startTopic,
  beginLessonPractice, openLessonQuiz, openLessonDeck, finishLesson,
  nextLesson, leaveLesson, openLessonChat, topics, navigateTab, goBack,
  hasHistory, speakText, openSaveWord,
  quizzesList, selectedQuizId, quizQuestions, currentQuestion, currentStudyIndex,
  canAnswerQuiz, quizChecked, submittedQuizDetail, selectedQuizAnswer,
  quizInputText, quizResult, onQuizChange, selectQuizAnswer, checkQuizAnswer,
  nextQuizQuestion, previousQuizQuestion, restartQuiz, isSubmittingQuiz,
  quizFeedbackLoading, quizFeedbackMode, studyLoading, loadQuizzesData, studyLessonId
} = ctx;

// Lesson Flashcard State & Methods (Học từ vựng trước khi luyện phát âm)
// Comprehensive Summary & Pedagogical Evaluation Computed Properties
const totalSentencesCount = computed(() => lessonDetail.value?.contents?.length || 0);
const completedSentencesCount = computed(() => {
  if (currentLesson.value?.type !== 'SPEAKING') return lessonProgress.value?.practiced ? 1 : 0;
  return lessonProgress.value?.completed_content_ids?.length || 0;
});
const sentencesCompletionRatio = computed(() => {
  if (!totalSentencesCount.value) return completedSentencesCount.value ? 100 : 0;
  return Math.min(100, Math.round((completedSentencesCount.value / totalSentencesCount.value) * 100));
});

const speakingScoresList = computed(() => {
  const scoresObj = lessonProgress.value?.speaking_scores || {};
  const contents = lessonDetail.value?.contents || [];
  return contents.map((c, index) => {
    const rawScore = scoresObj[String(c.id)];
    const score = rawScore !== undefined && rawScore !== null ? Math.round(Number(rawScore)) : null;
    return {
      id: c.id,
      index: index + 1,
      target_text: c.target_text,
      hint_translation: c.hint_translation,
      audio_url: c.audio_url,
      score,
      completed: !!(lessonProgress.value?.completed_content_ids?.includes(c.id) || score !== null)
    };
  });
});

const averagePracticeScore = computed(() => {
  if (currentLesson.value?.type === 'SPEAKING') {
    const scores = speakingScoresList.value.map(i => i.score).filter(s => s !== null && s !== undefined);
    if (scores.length) {
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
    if (lessonProgress.value?.speaking_score !== null && lessonProgress.value?.speaking_score !== undefined) {
      return Math.round(Number(lessonProgress.value.speaking_score));
    }
    // Fallback when sentences are completed but individual scores not in speaking_scores
    if (completedSentencesCount.value > 0) {
      const ratio = totalSentencesCount.value ? completedSentencesCount.value / totalSentencesCount.value : 1;
      return Math.min(100, Math.round(80 + ratio * 15));
    }
    return null;
  }
  if (lessonProgress.value?.writing_score !== null && lessonProgress.value?.writing_score !== undefined) {
    return Math.round(Number(lessonProgress.value.writing_score));
  }
  return null;
});

const practiceScoreDisplay = computed(() => {
  return averagePracticeScore.value !== null ? `${averagePracticeScore.value}/100` : '—';
});

const overallSummaryScore = computed(() => {
  const pScore = averagePracticeScore.value;
  const qScore = lessonProgress.value?.quiz_score;
  if (pScore !== null && qScore !== null && qScore !== undefined) {
    return Math.round(pScore * 0.6 + qScore * 0.4);
  }
  if (pScore !== null) return pScore;
  if (qScore !== null && qScore !== undefined) return qScore;
  return null;
});

const performanceTier = computed(() => {
  const score = overallSummaryScore.value ?? averagePracticeScore.value ?? 80;
  if (score >= 90) {
    return {
      grade: 'A+',
      badge: 'Xuất sắc · Mastered',
      title: 'Thành thạo xuất sắc bài học!',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      gradeColor: 'text-emerald-600',
      strengths: 'Phát âm rất rõ ràng, trường độ các nguyên âm chuẩn xác và nắm vững toàn bộ từ vựng trọng tâm của bài.',
      improvements: 'Tiếp tục duy trì tốc độ nói tự nhiên, chú ý nối âm đuôi (linking sounds) giữa các từ liền kề để câu nói mượt mà như người bản xứ.',
      actionAdvice: 'Lưu từ vựng vào Flashcards để ôn Spaced Repetition, hoặc thử trò chuyện với AI Tutor để thực hành giao tiếp phản xạ ngay!'
    };
  }
  if (score >= 75) {
    return {
      grade: 'A',
      badge: 'Đạt kết quả Tốt · Proficient',
      title: 'Hoàn thành tốt các kỹ năng bài học!',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      gradeColor: 'text-blue-600',
      strengths: 'Nắm chắc từ vựng chính và cấu trúc ngữ pháp; phát âm tương đối chuẩn xác và tự tin khi hoàn thành các câu thực hành.',
      improvements: 'Cần chú ý phát âm rõ các phụ âm gió và âm đuôi (/s/, /t/, /d/, /θ/); tránh ngắt hơi đột ngột ở giữa cụm danh từ.',
      actionAdvice: 'Ôn tập lại các câu đạt dưới 85% bằng cách bấm "Luyện lại câu" ngay bên dưới để hoàn thiện ngữ điệu.'
    };
  }
  if (score >= 60) {
    return {
      grade: 'B',
      badge: 'Đạt yêu cầu · Developing',
      title: 'Đã hoàn thành, cần rèn thêm độ mượt',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      gradeColor: 'text-amber-600',
      strengths: 'Đã nỗ lực hoàn thành toàn bộ bài tập và nắm được ngữ cảnh giao tiếp cơ bản của bài học.',
      improvements: 'Cần lắng nghe kỹ mẫu phát âm chuẩn, nhấn đúng trọng âm của từ (word stress) và điều chỉnh luồng hơi để âm không bị bẹt.',
      actionAdvice: 'Nên dành thêm 5 phút luyện nói lại các câu trong bài trước khi bước sang bài học tiếp theo.'
    };
  }
  return {
    grade: 'C',
    badge: 'Cần rèn luyện thêm · Needs Practice',
    title: 'Nên luyện tập thêm để cải thiện',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    gradeColor: 'text-rose-600',
    strengths: 'Có tinh thần kiên trì học hỏi và đã hoàn thành phần luyện tập cơ bản.',
    improvements: 'Nhiều từ chưa đạt chuẩn âm vị hoặc bị thiếu âm cuối; tốc độ đọc còn ngập ngừng.',
    actionAdvice: 'Hãy nghe kỹ audio mẫu 2-3 lần cho từng câu rồi bấm mic thu âm lại để nâng cao điểm số.'
  };
});

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

const parseSpeakerLine = (text = '') => {
  if (!text) return { speaker: null, text: '' };
  const match = text.match(/^([A-Za-z]+)\s*:\s*([\s\S]+)$/);
  if (match) {
    return { speaker: match[1], text: match[2].trim() };
  }
  return { speaker: null, text: text.trim() };
};

const parseHintLine = (hint = '') => {
  if (!hint) return '';
  return hint.replace(/^[A-Za-z]+\s*:\s*/, '').trim();
};

const handleSelectQuizStep = async () => {
  lessonStep.value = 'quiz';
  if (!quizQuestions?.value?.length || studyLessonId?.value !== currentLesson.value?.id) {
    await openLessonQuiz();
  }
};

const getOptionCardClass = (ans) => {
  if (!quizChecked?.value) {
    return selectedQuizAnswer?.value?.id === ans.id
      ? 'border-blue-600 border-b-blue-700 bg-blue-50/80 text-blue-950 ring-2 ring-blue-500/30 shadow-md translate-y-0.5'
      : 'border-slate-200 border-b-slate-300 bg-white hover:border-blue-300 hover:border-b-blue-400 hover:bg-blue-50/30 text-slate-800 shadow-2xs hover:-translate-y-0.5 active:translate-y-0.5';
  }
  if (submittedQuizDetail?.value?.correct_answer_id === ans.id) {
    return 'border-emerald-500 border-b-emerald-600 bg-emerald-50/90 text-emerald-950 font-bold ring-2 ring-emerald-500/30 shadow-md';
  }
  if (selectedQuizAnswer?.value?.id === ans.id) {
    return submittedQuizDetail?.value?.is_correct
      ? 'border-emerald-500 border-b-emerald-600 bg-emerald-50/90 text-emerald-950 font-bold ring-2 ring-emerald-500/30 shadow-md'
      : 'border-rose-400 border-b-rose-500 bg-rose-50/90 text-rose-950 font-bold ring-2 ring-rose-400/30 shadow-md';
  }
  return 'border-slate-200/60 border-b-slate-200 bg-slate-50/40 text-slate-400 opacity-60';
};

const getLetterBadgeClass = (ans, aIdx) => {
  if (!quizChecked?.value) {
    return selectedQuizAnswer?.value?.id === ans.id
      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-200'
      : 'bg-white text-slate-950 font-black border border-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600';
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

.flashcard-front {
  transform: rotateY(0deg);
  z-index: 2;
}

.flashcard-back {
  transform: rotateY(180deg);
  z-index: 1;
}

/* Prevent 2D DOM bounding box occlusion / collision when face is inactive */
.flashcard-inner:not(.is-flipped) .flashcard-back {
  visibility: hidden;
  pointer-events: none;
}

.flashcard-inner.is-flipped .flashcard-front {
  visibility: hidden;
  pointer-events: none;
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
