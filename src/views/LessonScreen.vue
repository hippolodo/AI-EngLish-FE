<template>
  <section v-if="activeTab === 'lesson'" class="w-full max-w-6xl mx-auto space-y-8 pb-28">
    
    <!-- STATE 1: BROWSE ALL TOPICS & LESSONS (CATALOG VIEW) -->
    <template v-if="!currentLesson">
      
      <!-- Top Title & Overview Stats -->
      <div class="space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide border border-blue-100">
                Lộ trình CEFR chuẩn quốc tế
              </span>
              <span v-if="selectedTopic" class="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold flex items-center gap-1.5 border border-amber-200">
                Đang lọc: {{ selectedTopic.title }}
                <button @click="clearTopicFilter" class="hover:text-red-600 font-extrabold cursor-pointer">✕</button>
              </span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Chủ đề bài học
            </h1>
            <p class="text-base sm:text-lg text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Khám phá hệ thống bài học được phân chia theo từng chủ đề thực tế. Chọn bất kỳ bài học nào để bắt đầu luyện tập trực tiếp.
            </p>
          </div>

          <!-- Quick Progress Widget -->
          <div class="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs flex items-center gap-5 shrink-0 min-w-[280px]">
            <div class="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-2xl font-black shrink-0">
              {{ overallStats.percent }}%
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiến độ tổng thể</p>
              <p class="text-base font-extrabold text-slate-900 mt-0.5">
                {{ overallStats.completed }}/{{ overallStats.total }} bài hoàn thành
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
              placeholder="Tìm chủ đề hoặc bài học…"
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
        <span class="text-base font-semibold">Đang tải danh sách bài học và chủ đề…</span>
      </div>

      <!-- Error State -->
      <div v-else-if="catalogError || lessonError" role="alert" class="rounded-3xl bg-rose-50 border border-rose-200 p-6 text-base text-rose-700 flex items-center justify-between">
        <span>{{ catalogError || lessonError }}</span>
        <button @click="loadCatalog" class="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 transition cursor-pointer">
          Thử lại
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
                      Chủ đề {{ topic.id }} · {{ getTopicLessons(topic.id).length }} bài học
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
                  {{ getTopicProgress(topic.id).completed }}/{{ getTopicProgress(topic.id).total }} hoàn thành
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
              Danh sách bài học trong chủ đề:
            </h3>

            <div v-if="getTopicLessons(topic.id).length === 0" class="py-6 text-center text-slate-500 text-sm italic">
              Chưa có bài học nào trong chủ đề này.
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
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        class="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        :class="lesson.type === 'SPEAKING' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'"
                      >
                        {{ lesson.type === 'SPEAKING' ? '🎙️ Luyện nói & phản xạ' : '✍️ Luyện viết câu' }}
                      </span>
                      
                      <span v-if="journey.lesson(lesson.id).completed" class="text-xs font-bold text-emerald-700">
                        Đã học
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
                    <span>{{ journey.lesson(lesson.id).completed ? 'Luyện lại' : 'Vào học' }}</span>
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
          <h3 class="text-lg font-bold text-slate-800">Không tìm thấy bài học phù hợp</h3>
          <p class="text-sm text-slate-500 max-w-md mx-auto">
            Không có chủ đề hoặc bài học nào khớp với bộ lọc "{{ searchQuery || selectedLevel }}". Hãy thử chọn cấp độ khác hoặc xoá tìm kiếm.
          </p>
          <button
            @click="selectedLevel = 'ALL'; searchQuery = ''; clearTopicFilter()"
            class="px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition cursor-pointer"
          >
            Xem tất cả bài học
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
          class="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer group"
        >
          <ArrowLeft class="w-4.5 h-4.5 group-hover:-translate-x-1 transition-transform" />
          <span>Danh mục tất cả chủ đề & bài học</span>
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
              Chủ đề: {{ selectedTopic?.title }}
            </span>
            <span
              class="px-3 py-1 rounded-full text-xs font-bold"
              :class="currentLesson.type === 'SPEAKING' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'"
            >
              {{ currentLesson.type === 'SPEAKING' ? '🎙️ Luyện phát âm & Phản xạ' : '✍️ Trợ lý luyện viết AI' }}
            </span>
          </div>

          <h1 class="text-slate-900 text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-snug">
            {{ currentLesson.title }}
          </h1>
        </div>
      </div>

      <!-- Step Navigation Tabs (1. Luyện tập, 2. Quiz, 3. Tổng kết) -->
      <div class="flex gap-3 text-sm sm:text-base font-bold">
        <button
          @click="lessonStep = 'practice'"
          class="flex-1 rounded-2xl py-3.5 cursor-pointer transition shadow-2xs"
          :class="lessonStep === 'practice' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'"
        >
          1. Luyện tập chính
        </button>

        <button
          @click="openLessonQuiz"
          :disabled="!lessonQuizzes.length"
          class="flex-1 rounded-2xl py-3.5 disabled:opacity-40 cursor-pointer transition shadow-2xs"
          :class="lessonStep === 'quiz' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'"
        >
          2. Quiz củng cố {{ lessonQuizzes.length ? `(${lessonQuizzes.length})` : '' }}
        </button>

        <button
          @click="lessonStep = 'summary'"
          class="flex-1 rounded-2xl py-3.5 cursor-pointer transition shadow-2xs"
          :class="lessonStep === 'summary' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'"
        >
          3. Tổng kết bài
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
              {{ lessonProgress?.completed ? 'Chúc mừng! Bạn đã hoàn thành bài học này' : 'Tiến độ hoàn thành bài học' }}
            </h2>
            <p class="text-base text-slate-600 mt-0.5">
              Xem lại kết quả luyện tập và tiếp tục bài học kế tiếp.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Số câu đã luyện</span>
            <p class="text-2xl font-black text-slate-900 mt-1">
              {{ currentLesson.type === 'SPEAKING' ? `${lessonProgress?.completed_content_ids?.length || 0}/${lessonDetail?.contents?.length || 0}` : 'Đã nộp bài viết' }}
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Điểm viết / Phát âm</span>
            <p class="text-2xl font-black text-blue-600 mt-1">
              {{ lessonProgress?.writing_score !== null && lessonProgress?.writing_score !== undefined ? `${lessonProgress.writing_score}/100` : '—' }}
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Điểm trắc nghiệm Quiz</span>
            <p class="text-2xl font-black text-emerald-600 mt-1">
              {{ lessonProgress?.quiz_score !== null && lessonProgress?.quiz_score !== undefined ? `${lessonProgress.quiz_score}/100` : 'Chưa làm' }}
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
            Ghi nhận hoàn thành bài học
          </button>
          
          <p v-if="!canFinishLesson" class="text-sm font-semibold text-amber-700 text-center">
            {{ currentLesson.type === 'SPEAKING' ? '💡 Luyện đủ các câu trong bài để ghi nhận hoàn thành.' : '💡 Nộp ít nhất một bài viết để hoàn thành hoạt động.' }}
          </p>

          <button
            v-if="lessonProgress?.completed"
            @click="nextLesson"
            class="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 p-4 text-base font-bold text-white shadow-md shadow-blue-600/20 cursor-pointer transition"
          >
            Tiếp tục bài học tiếp theo →
          </button>

          <button
            @click="beginLessonPractice"
            class="w-full py-3 text-base font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Luyện lại bài này từ đầu
          </button>
        </div>
      </div>

      <!-- STEP 1 & 2: PRACTICE VIEW -->
      <template v-else>
        
        <!-- Objective Banner -->
        <div class="space-y-3 rounded-3xl bg-blue-50/80 p-6 sm:p-7 border border-blue-100">
          <h2 class="text-lg sm:text-xl font-bold text-blue-950 flex items-center gap-2">
            <span>🎯</span>
            <span>Mục tiêu của bài học</span>
          </h2>
          <p class="text-base sm:text-lg text-blue-900 leading-relaxed">
            {{ currentLesson.type === 'SPEAKING'
              ? 'Lắng nghe phát âm mẫu chuẩn bản xứ, đọc hiểu nghĩa và luyện phát âm từng câu trong bài. AI sẽ phân tích âm vị IPA và chỉ ra lỗi cần cải thiện.'
              : 'Đọc kỹ yêu cầu đề bài bên dưới, viết câu hoặc đoạn văn bằng tiếng Anh. Trợ lý AI sẽ phân tích ngữ pháp, từ vựng và gợi ý bản sửa tối ưu.' }}
          </p>
          <p class="text-sm font-bold text-blue-700">
            {{ currentLesson.type === 'SPEAKING' ? `${lessonDetail?.contents?.length || 0} câu luyện tập trong bài` : 'Viết và nhận phân tích chi tiết từ AI' }}
          </p>
        </div>

        <!-- Contents List -->
        <div class="space-y-5">
          <div
            v-for="(content, idx) in lessonDetail?.contents || []"
            :key="content.id"
            class="space-y-3.5 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xs"
          >
            <div class="flex items-center justify-between">
              <span class="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                Câu mẫu #{{ idx + 1 }}
              </span>
              <span v-if="content.ipa" class="text-sm font-mono font-medium text-slate-500">
                /{{ content.ipa }}/
              </span>
            </div>

            <p class="reading-text whitespace-pre-line text-lg sm:text-xl font-extrabold text-slate-900 leading-relaxed">
              {{ content.target_text }}
            </p>

            <p v-if="content.hint_translation" class="text-base sm:text-lg text-slate-600">
              💡 Nghĩa: <span class="font-medium text-slate-800">{{ content.hint_translation }}</span>
            </p>

            <p v-if="content.task_guidance" class="whitespace-pre-line text-sm sm:text-base text-blue-700 leading-relaxed bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
              {{ content.task_guidance }}
            </p>

            <!-- Sample text if any -->
            <details v-if="content.sample_text" class="rounded-2xl bg-slate-50 p-4 border border-slate-200/70">
              <summary class="cursor-pointer text-sm sm:text-base font-bold text-blue-700">
                Xem bài mẫu tham khảo
              </summary>
              <p class="mt-2 text-xs sm:text-sm text-slate-500">Tham khảo ý tưởng, sau đó tự viết theo lời của bạn:</p>
              <p class="reading-text mt-2 whitespace-pre-line text-slate-800 text-base leading-relaxed">
                {{ content.sample_text }}
              </p>
            </details>

            <!-- Native Audio Player -->
            <div v-if="content.audio_url && currentLesson.type === 'SPEAKING'" class="pt-2">
              <audio :src="getFullAudioUrl(content.audio_url)" controls preload="none" class="w-full rounded-xl" />
            </div>
          </div>
        </div>

        <p v-if="!lessonDetail?.contents?.length" class="rounded-3xl bg-amber-50 border border-amber-200 p-6 text-base text-amber-800 text-center">
          {{ currentLesson.type === 'SPEAKING' ? 'Bài này chưa có câu luyện tập. Hãy chọn bài khác.' : 'Bài chưa có hướng dẫn chi tiết; hãy viết theo chủ đề trong tiêu đề.' }}
        </p>

        <!-- Big Launch Practice Button -->
        <button
          @click="beginLessonPractice"
          :disabled="currentLesson.type === 'SPEAKING' && !lessonDetail?.contents?.length"
          class="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 p-5 text-lg font-bold text-white shadow-lg shadow-blue-600/25 disabled:opacity-40 cursor-pointer transition transform active:scale-[0.99] flex items-center justify-center gap-3"
        >
          <Mic v-if="currentLesson.type === 'SPEAKING'" class="w-6 h-6" />
          <PenLine v-else class="w-6 h-6" />
          <span>{{ currentLesson.type === 'SPEAKING' ? 'Bắt đầu nghe & luyện phát âm' : 'Bắt đầu viết theo đề bài' }}</span>
        </button>

        <!-- Supplementary Activities -->
        <div class="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xs">
          <h3 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>✨</span>
            <span>Luyện tập bổ trợ cho bài học</span>
          </h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              v-if="lessonQuizzes.length"
              @click="openLessonQuiz"
              class="flex flex-col items-start p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition cursor-pointer group"
            >
              <span class="text-xs font-bold text-blue-600">Trắc nghiệm</span>
              <span class="font-bold text-slate-800 group-hover:text-blue-600 mt-1">Làm quiz củng cố ({{ lessonQuizzes.length }})</span>
            </button>

            <button
              v-for="deck in lessonDecks"
              :key="deck.id"
              @click="openLessonDeck(deck)"
              class="flex flex-col items-start p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition cursor-pointer group"
            >
              <span class="text-xs font-bold text-purple-600">Flashcard</span>
              <span class="font-bold text-slate-800 group-hover:text-blue-600 mt-1">{{ deck.title }}</span>
            </button>

            <button
              @click="openLessonChat"
              class="flex flex-col items-start p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition cursor-pointer group"
            >
              <span class="text-xs font-bold text-emerald-600">AI Roleplay</span>
              <span class="font-bold text-slate-800 group-hover:text-blue-600 mt-1">Hội thoại thực tế theo chủ đề</span>
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
  Loader2, Mic, PenLine, CheckCircle2, ChevronRight, BookOpen, Search, ArrowLeft
} from 'lucide-vue-next';
import { curriculumService } from '../services/curriculumService';
import { getFullAudioUrl, getErrorMessage } from '../services/api';

const ctx = inject('screenContext');
const {
  activeTab, selectedTopic, topicLessons, currentLesson, lessonDetail,
  lessonQuizzes, lessonDecks, lessonLoading, lessonError, lessonStep,
  lessonProgress, canFinishLesson, journey, startLesson, startTopic,
  beginLessonPractice, openLessonQuiz, openLessonDeck, finishLesson,
  nextLesson, leaveLesson, openLessonChat, topics
} = ctx;

// Catalog state
const allLessons = ref([]);
const catalogLoading = ref(false);
const catalogError = ref('');
const searchQuery = ref('');
const selectedLevel = ref('ALL');

const levelTabs = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'Beginner', label: 'Cơ bản (A1 - A2)' },
  { id: 'Intermediate', label: 'Trung cấp (B1 - B2)' },
  { id: 'Advanced', label: 'Nâng cao (C1 - C2)' }
];

const getLevelLabel = (level) => {
  if (level === 'Beginner') return 'Cơ bản A1-A2';
  if (level === 'Intermediate') return 'Trung cấp B1-B2';
  if (level === 'Advanced') return 'Nâng cao C1-C2';
  return level || 'Mọi cấp độ';
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
    catalogError.value = getErrorMessage(err, 'Không tải được danh mục bài học. Vui lòng thử lại.');
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
  if (leaveLesson) {
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
