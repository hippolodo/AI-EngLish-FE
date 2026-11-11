<template>
  <div v-if="activeTab === 'writing' && isAuthenticated" class="space-y-6 pb-28 w-full max-w-6xl mx-auto">
    <!-- Top Back Button -->
    <div>
      <AnimateButton
        variant="outline"
        size="sm"
        @click="goBack"
        class="group hover:bg-slate-50"
      >
        <template #prefix>
          <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </template>
        <span>{{ ctx.currentLesson?.value ? 'Back to Lesson' : 'Back' }}</span>
      </AnimateButton>
    </div>

    <!-- Header & Mode Tabs -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span class="text-xs uppercase tracking-wide font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
          <Sparkles class="w-3.5 h-3.5 text-blue-500" /> Writing Assistant
        </span>
        <h1 class="text-gray-900 mt-1.5 text-2xl sm:text-3xl font-extrabold leading-snug">
          {{ ctx.currentLesson?.value?.type === 'WRITING' ? 'Guided Writing' : 'English Writing Studio' }}
        </h1>
        <p class="text-slate-500 text-sm mt-1">
          Luyện viết tiếng Anh với AI: Phân tích ngữ pháp, nâng cấp từ vựng và xem bài viết mẫu chuẩn bản xứ.
        </p>
      </div>

      <!-- Top Tab Switcher: Viết bài vs Lịch sử -->
      <div v-if="!ctx.currentLesson?.value" class="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80 shrink-0 self-start sm:self-auto">
        <button
          @click="currentView = 'editor'"
          :class="currentView === 'editor' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 font-semibold'"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm transition cursor-pointer"
        >
          <FileText class="w-4 h-4" />
          <span>Luyện viết bài</span>
        </button>
        <button
          @click="switchToHistory"
          :class="currentView === 'history' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 font-semibold'"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm transition cursor-pointer"
        >
          <History class="w-4 h-4" />
          <span>Lịch sử bài viết</span>
          <span v-if="writingHistory.length > 0" class="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-100 text-blue-700">
            {{ writingHistory.length }}
          </span>
        </button>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 1: EDITOR (LUYỆN VIẾT BÀI)                                            -->
    <!-- ========================================================================= -->
    <div v-if="currentView === 'editor'" class="space-y-6">

      <!-- 1. Lesson Guided Writing Mode (Nếu đang học theo bài học lộ trình) -->
      <div v-if="ctx.currentLesson?.value?.type === 'WRITING'" class="space-y-3 rounded-2xl bg-indigo-50/80 p-5 sm:p-6 text-sm sm:text-base text-indigo-950 border border-indigo-100">
        <div class="flex items-start justify-between gap-3">
          <h2 class="text-lg font-bold">{{ ctx.currentLesson.value.title }}</h2>
          <button @click="goBack" :disabled="isEvaluating" class="shrink-0 rounded-xl bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-indigo-700 shadow-2xs disabled:opacity-50 cursor-pointer">
            Quay lại bài học
          </button>
        </div>
        <div v-for="content in ctx.lessonDetail?.value?.contents || []" :key="content.id" class="space-y-2.5">
          <p class="pt-1 font-bold">Writing Prompt</p>
          <p class="reading-text whitespace-pre-line text-base sm:text-lg leading-relaxed text-slate-900">{{ content.target_text }}</p>
          <details v-if="content.hint_translation">
            <summary class="cursor-pointer text-xs sm:text-sm font-semibold text-indigo-700">Xem bản dịch tiếng Việt</summary>
            <p class="mt-2 whitespace-pre-line text-slate-600 text-sm sm:text-base">{{ content.hint_translation }}</p>
          </details>
          <div v-if="content.task_guidance" class="rounded-xl bg-white/80 p-4 border border-indigo-100">
            <p class="mb-1 font-bold text-indigo-900">Writing Guidance</p>
            <p class="whitespace-pre-line text-indigo-800 text-sm sm:text-base leading-relaxed">{{ content.task_guidance }}</p>
          </div>
        </div>
      </div>

      <!-- 2. Free Writing Mode: Chọn chủ đề mẫu hoặc tự nhập đề bài -->
      <div v-else class="space-y-4">
        
        <!-- Thanh chọn chủ đề mẫu (Sample Prompts) -->
        <div class="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/50 via-sky-50/40 to-slate-50/60 p-5 sm:p-6 shadow-2xs space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Chọn chủ đề luyện viết</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">3–4 chủ đề gợi ý</span>
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
                Chọn một chủ đề thực chiến bên dưới hoặc tự nhập đề tài của riêng bạn để có dàn ý gợi ý.
              </p>
            </div>
            
            <button
              @click="openCustomPromptModal"
              :disabled="isEvaluating"
              class="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm font-bold transition shadow-2xs cursor-pointer"
            >
              <Plus class="w-4 h-4 text-blue-600" />
              <span>Tự nhập chủ đề</span>
            </button>
          </div>

          <!-- Grid 4 thẻ chủ đề mẫu -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              v-for="item in SAMPLE_PROMPTS"
              :key="item.id"
              @click="selectSamplePrompt(item)"
              :disabled="isEvaluating"
              class="p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 group"
              :class="activeWritingPrompt?.id === item.id
                ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-600/20'
                : 'border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-xs text-slate-800'"
            >
              <div>
                <div class="flex items-center justify-between gap-1 mb-2">
                  <span
                    class="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md border"
                    :class="activeWritingPrompt?.id === item.id ? 'bg-white/20 text-white border-white/30' : item.categoryColor"
                  >
                    {{ item.category }}
                  </span>
                  <span
                    class="text-[10px] font-mono font-bold"
                    :class="activeWritingPrompt?.id === item.id ? 'text-blue-100' : 'text-slate-400'"
                  >
                    {{ item.wordCount }}
                  </span>
                </div>
                <h3 class="text-xs sm:text-sm font-bold leading-snug line-clamp-2" :class="activeWritingPrompt?.id === item.id ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'">
                  {{ item.title }}
                </h3>
              </div>
              <div class="flex items-center justify-between pt-1 text-[11px] font-semibold" :class="activeWritingPrompt?.id === item.id ? 'text-blue-100' : 'text-blue-600'">
                <span>{{ activeWritingPrompt?.id === item.id ? '✓ Đang chọn' : 'Chọn viết →' }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Khung hiển thị Đề bài & Writing Guidance (Dàn ý gợi ý) khi có chủ đề được chọn -->
        <div
          v-if="activeWritingPrompt"
          class="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-white p-5 sm:p-6 shadow-xs space-y-3.5 animate-in fade-in duration-200"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-600 text-white">
                  {{ activeWritingPrompt.category || 'Topic' }}
                </span>
                <span class="text-xs font-mono font-bold text-indigo-700">
                  Mục tiêu: {{ activeWritingPrompt.wordCount || '80–120 words' }}
                </span>
              </div>
              <h2 class="text-base sm:text-lg font-black text-indigo-950">
                {{ activeWritingPrompt.title }}
              </h2>
            </div>

            <button
              @click="clearActivePrompt"
              title="Bỏ chọn chủ đề này"
              class="shrink-0 p-1.5 rounded-xl hover:bg-indigo-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Yêu cầu đề bài (Prompt Text) -->
          <div class="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-2xs">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Yêu cầu đề bài (Prompt)</p>
            <p class="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
              {{ activeWritingPrompt.prompt }}
            </p>
          </div>

          <!-- Dàn ý gợi ý (Writing Guidance) -->
          <div class="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-2">
            <div class="flex items-center gap-2 text-indigo-900 font-extrabold text-xs sm:text-sm">
              <Lightbulb class="w-4 h-4 text-amber-500 shrink-0" />
              <span>Writing Guidance (Dàn ý gợi ý các ý chính cần viết)</span>
            </div>
            <ul class="space-y-1.5 text-xs sm:text-sm text-indigo-950 leading-relaxed pl-1">
              <li
                v-for="(guide, gIdx) in (Array.isArray(activeWritingPrompt.guidance) ? activeWritingPrompt.guidance : [activeWritingPrompt.guidance])"
                :key="gIdx"
                class="flex items-start gap-2"
              >
                <span class="text-indigo-600 font-black shrink-0">•</span>
                <span>{{ guide }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Khung nhập bài viết (Textarea Editor) -->
      <div class="space-y-4">
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-xs relative focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent">
          <textarea
            v-model="essayInput"
            :readonly="isEvaluating"
            maxlength="10000"
            rows="9"
            class="w-full text-base sm:text-lg text-gray-900 placeholder-gray-400 bg-transparent resize-none focus:outline-none leading-relaxed"
            :placeholder="activeWritingPrompt ? `Viết bài luận tiếng Anh của bạn theo chủ đề & dàn ý gợi ý ở trên...` : 'Nhập đoạn văn, email hoặc bài luận tiếng Anh của bạn tại đây...'"
          ></textarea>

          <div class="flex justify-between items-center pt-3 border-t border-gray-100 text-xs sm:text-sm text-gray-500">
            <span>{{ wordCount }} words · {{ essayInput.length }} chars</span>
            <span class="text-indigo-600 font-bold">{{ isAuthenticated ? 'Bản nháp tự động lưu' : 'Đăng nhập để lưu nháp' }}</span>
          </div>
        </div>

        <!-- Báo lỗi nếu có -->
        <div v-if="writingError" class="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm sm:text-base text-rose-700 font-medium">
          ⚠️ {{ writingError }}
        </div>

        <!-- Action Row: Chấm bài & Bắt đầu bài mới -->
        <div class="flex items-center gap-3">
          <button
            @click="submitWritingEvaluation"
            :disabled="isEvaluating || !essayInput.trim()"
            class="btn-spring flex-1 py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 text-white rounded-2xl text-base font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            <Sparkles v-if="!isEvaluating" class="w-5 h-5" />
            <Loader2 v-else class="w-5 h-5 animate-spin" />
            <span>{{ isEvaluating ? 'AI đang phân tích & chấm bài...' : (writingResult ? 'Chấm lại bài viết' : 'Chấm bài & Xem nhận xét chi tiết') }}</span>
          </button>

          <button
            v-if="writingResult || essayInput.trim().length > 0"
            @click="startNewEssay"
            :disabled="isEvaluating"
            class="px-5 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-sm shadow-2xs transition-all flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
            title="Xóa nội dung để bắt đầu bài viết mới"
          >
            <RotateCcw class="w-4 h-4 text-slate-500" />
            <span class="hidden sm:inline">Viết bài mới</span>
            <span class="sm:hidden">Bài mới</span>
          </button>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- BẢNG KẾT QUẢ ĐÁNH GIÁ (DASHBOARD RESULTS)                                  -->
      <!-- ========================================================================= -->
      <div v-if="writingResult" class="space-y-5 pt-3 border-t border-gray-200/70 animate-in fade-in duration-300">

        <!-- Results Header with New Essay Button -->
        <div class="flex items-center justify-between flex-wrap gap-2">
          <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
            <span>Kết quả đánh giá chi tiết</span>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Hoàn tất chấm</span>
          </h3>
          <button
            @click="startNewEssay"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-bold transition cursor-pointer"
          >
            <Plus class="w-4 h-4 text-blue-600" />
            <span>Bắt đầu bài viết mới</span>
          </button>
        </div>
        
        <!-- Score Card -->
        <div v-if="writingResult.overall_score != null" class="bg-gradient-to-r from-gray-900 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-lg flex items-center justify-between">
          <div>
            <p class="text-xs sm:text-sm font-bold text-indigo-300 uppercase tracking-wide">Điểm đánh giá tổng quan</p>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-4xl sm:text-5xl font-black text-white">
                <AnimateCountingNumber :number="writingResult.overall_score" />
              </span>
              <span class="text-base text-gray-400">/ 100</span>
            </div>
          </div>
          <div class="text-right">
            <span v-if="writingResult.estimated_band" class="inline-block px-4 py-1.5 rounded-full text-sm sm:text-base font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Estimated IELTS Band {{ writingResult.estimated_band }}
            </span>
            <p class="text-xs sm:text-sm text-gray-400 mt-1.5 font-medium">
              {{ (writingResult.errors || []).length }} lỗi cần khắc phục
            </p>
          </div>
        </div>

        <!-- Nhận xét chung của giáo viên AI -->
        <div v-if="writingResult.task_feedback" role="status" class="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-5 text-sm sm:text-base text-indigo-950 leading-relaxed">
          <p class="mb-1 font-bold text-indigo-900 flex items-center gap-1.5">
            <Sparkles class="w-4 h-4 text-indigo-600" /> Nhận xét tổng quan của giáo viên AI
          </p>
          <p class="text-slate-800 leading-relaxed">{{ writingResult.task_feedback }}</p>
        </div>

        <!-- 3 Tab con: Ngữ pháp / Từ vựng / Bản viết lại -->
        <div class="flex bg-gray-200/70 p-1 rounded-xl text-sm font-semibold text-gray-600">
          <button
            @click="writingSubTab = 'grammar'"
            :class="writingSubTab === 'grammar' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-gray-900'"
            class="flex-1 py-2 rounded-lg transition text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Ngữ pháp & Lỗi diễn đạt</span>
            <span class="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-xs">
              {{ (writingResult.errors || []).length }}
            </span>
          </button>
          <button
            @click="writingSubTab = 'vocab'"
            :class="writingSubTab === 'vocab' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-gray-900'"
            class="flex-1 py-2 rounded-lg transition text-center cursor-pointer"
          >
            Từ vựng nâng cao
          </button>
          <button
            @click="writingSubTab = 'rewrite'"
            :class="writingSubTab === 'rewrite' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-gray-900'"
            class="flex-1 py-2 rounded-lg transition text-center cursor-pointer"
          >
            Bản viết lại mẫu chuẩn bản xứ
          </button>
        </div>

        <!-- Tab 1: Chi tiết các lỗi sai ngữ pháp -->
        <div v-if="writingSubTab === 'grammar'" class="space-y-3">
          <div v-if="!writingResult.errors || writingResult.errors.length === 0" class="p-6 bg-white rounded-2xl border border-gray-100 text-center text-sm text-emerald-600 font-semibold">
            🎉 Không phát hiện lỗi ngữ pháp nào! Bài viết có cấu trúc câu rất chuẩn xác.
          </div>

          <div
            v-for="(err, idx) in writingResult.errors"
            :key="idx"
            class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2"
          >
            <div class="flex items-center justify-between text-sm">
              <span class="font-semibold text-gray-600">Lỗi #{{ idx + 1 }} • {{ err.error_type || 'Syntax Error' }}</span>
              <span class="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-600">Cần sửa</span>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between text-sm gap-2">
              <span class="text-rose-500 line-through font-medium">{{ err.original_fragment }}</span>
              <ArrowRight class="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span class="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {{ err.corrected_fragment }}
              </span>
            </div>
            <div class="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
              <strong class="text-amber-950">Giải thích chi tiết:</strong> {{ err.explanation }}
            </div>
          </div>
        </div>

        <!-- Tab 2: Từ vựng nâng cao -->
        <div v-if="writingSubTab === 'vocab'" class="space-y-3">
          <div v-if="!writingResult.vocabulary_suggestions || writingResult.vocabulary_suggestions.length === 0" class="p-6 bg-white rounded-2xl border border-gray-100 text-center text-sm text-gray-500">
            Chưa có gợi ý từ vựng bổ sung nào cho bài viết này.
          </div>

          <div
            v-for="(vocab, idx) in writingResult.vocabulary_suggestions"
            :key="idx"
            class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs text-sm space-y-1"
          >
            <div class="flex items-center gap-1.5 text-indigo-700 font-semibold">
              <Sparkles class="w-3.5 h-3.5 text-indigo-500" />
              <span>Gợi ý nâng cấp từ vựng #{{ idx + 1 }}:</span>
            </div>
            <p class="text-gray-700 leading-relaxed">{{ vocab }}</p>
          </div>
        </div>

        <!-- Tab 3: Bản viết lại chuẩn bản xứ -->
        <div v-if="writingSubTab === 'rewrite'" class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
              <Sparkles class="w-4 h-4 text-indigo-600" />
              Bản viết lại tham khảo (Suggested Rewrite)
            </span>
            <button
              @click="copyRewritten"
              class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Check v-if="copied" class="w-3 h-3 text-emerald-600" />
              <Copy v-else class="w-3 h-3" />
              <span>{{ copied ? 'Đã sao chép!' : 'Sao chép bản viết lại' }}</span>
            </button>
          </div>
          <div class="reading-text p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 leading-relaxed font-normal whitespace-pre-line">
            {{ writingResult.corrected_text }}
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 2: WRITING HISTORY (LỊCH SỬ BÀI VIẾT ĐÃ NỘP)                         -->
    <!-- ========================================================================= -->
    <div v-else-if="currentView === 'history'" class="space-y-6">
      
      <!-- Subview A: Nếu đang xem chi tiết 1 bài trong lịch sử -->
      <div v-if="selectedHistoryItem" class="space-y-5 animate-in fade-in duration-200">
        <div class="flex items-center justify-between">
          <button
            @click="selectedHistoryItem = null"
            class="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Quay lại danh sách lịch sử</span>
          </button>
          <span class="text-xs text-slate-500 font-medium">
            Đã nộp vào: {{ formatDateTime(selectedHistoryItem.created_at) }}
          </span>
        </div>

        <!-- Bài viết gốc của người dùng -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-2">
          <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider">Bài viết gốc của bạn:</h2>
          <p class="text-slate-800 whitespace-pre-line leading-relaxed text-sm sm:text-base">
            {{ selectedHistoryItem.original_text }}
          </p>
        </div>

        <!-- Bảng điểm & Nhận xét của bài nộp này -->
        <div class="bg-gradient-to-r from-gray-900 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-lg flex items-center justify-between">
          <div>
            <p class="text-xs sm:text-sm font-bold text-indigo-300 uppercase tracking-wide">Điểm số bài này</p>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-4xl sm:text-5xl font-black text-white">{{ selectedHistoryItem.overall_score || 0 }}</span>
              <span class="text-base text-gray-400">/ 100</span>
            </div>
          </div>
          <div class="text-right">
            <span v-if="selectedHistoryItem.estimated_band" class="inline-block px-4 py-1.5 rounded-full text-sm sm:text-base font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Band {{ selectedHistoryItem.estimated_band }}
            </span>
            <p class="text-xs sm:text-sm text-gray-400 mt-1.5 font-medium">
              {{ (selectedHistoryItem.errors || []).length }} lỗi ngữ pháp
            </p>
          </div>
        </div>

        <!-- Nhận xét chung -->
        <div v-if="selectedHistoryItem.task_feedback" class="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-5 text-sm text-indigo-950 leading-relaxed">
          <p class="mb-1 font-bold text-indigo-900">Nhận xét của giáo viên AI:</p>
          <p>{{ selectedHistoryItem.task_feedback }}</p>
        </div>

        <!-- Danh sách lỗi sai -->
        <div v-if="selectedHistoryItem.errors && selectedHistoryItem.errors.length > 0" class="space-y-3">
          <h3 class="text-sm font-bold text-slate-800">Các lỗi đã được sửa trong bài này:</h3>
          <div
            v-for="(err, idx) in selectedHistoryItem.errors"
            :key="idx"
            class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2"
          >
            <div class="flex items-center justify-between text-sm">
              <span class="font-semibold text-gray-600">Lỗi #{{ idx + 1 }} • {{ err.error_type || 'Syntax Error' }}</span>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between text-sm gap-2">
              <span class="text-rose-500 line-through font-medium">{{ err.original_fragment }}</span>
              <ArrowRight class="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span class="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {{ err.corrected_fragment }}
              </span>
            </div>
            <div class="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
              <strong>Giải thích:</strong> {{ err.explanation }}
            </div>
          </div>
        </div>

        <!-- Bản viết lại mẫu -->
        <div v-if="selectedHistoryItem.corrected_text" class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Sparkles class="w-4 h-4 text-indigo-600" />
            Bản viết lại mẫu chuẩn bản xứ:
          </h3>
          <p class="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
            {{ selectedHistoryItem.corrected_text }}
          </p>
        </div>
      </div>

      <!-- Subview B: Danh sách tổng hợp lịch sử bài viết -->
      <div v-else class="space-y-4">
        
        <!-- Loading state -->
        <div v-if="isHistoryLoading" class="py-16 text-center space-y-3">
          <Loader2 class="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p class="text-sm text-slate-500">Đang tải lịch sử các bài viết của bạn...</p>
        </div>

        <!-- Empty state nếu chưa có bài nào -->
        <div v-else-if="writingHistory.length === 0" class="py-16 text-center rounded-3xl bg-white border border-slate-200/80 p-8 space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <BookOpen class="w-6 h-6" />
          </div>
          <h3 class="text-base font-bold text-slate-900">Chưa có bài viết nào được nộp</h3>
          <p class="text-sm text-slate-500 max-w-sm mx-auto">
            Hãy chọn một chủ đề mẫu hoặc tự viết bài đầu tiên để nhận đánh giá chi tiết từ AI nhé!
          </p>
          <button
            @click="currentView = 'editor'"
            class="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
          >
            <span>Bắt đầu viết bài ngay</span>
          </button>
        </div>

        <!-- Danh sách các bài đã nộp -->
        <div v-else class="space-y-3">
          <div
            v-for="item in writingHistory"
            :key="item.id"
            @click="viewHistoryDetail(item)"
            class="group rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-md p-4 sm:p-5 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div class="min-w-0 flex-1 space-y-1.5">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                  <Clock class="w-3.5 h-3.5 text-slate-400" />
                  {{ formatDateTime(item.created_at) }}
                </span>
                <span
                  class="text-[10px] font-extrabold px-2 py-0.5 rounded-md"
                  :class="item.overall_score >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : item.overall_score >= 60 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                >
                  {{ item.overall_score || 0 }}/100
                </span>
                <span v-if="item.estimated_band" class="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                  IELTS Band {{ item.estimated_band }}
                </span>
                <span class="text-xs text-slate-400">
                  • {{ (item.errors || []).length }} lỗi đã sửa
                </span>
              </div>

              <!-- Preview 2 dòng đầu của bài viết -->
              <p class="text-sm text-slate-700 line-clamp-2 leading-relaxed font-normal">
                {{ item.original_text }}
              </p>
            </div>

            <!-- Nút xem chi tiết -->
            <div class="shrink-0 flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition">
              <span>Xem chi tiết bài sửa</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: TỰ NHẬP CHỦ ĐỀ CỦA BẠN (CUSTOM PROMPT MODAL)                       -->
    <!-- ========================================================================= -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isCustomPromptModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        @click.self="isCustomPromptModalOpen = false"
      >
        <div class="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PenLine class="w-5 h-5 text-blue-600" />
              <span>Tự nhập chủ đề luyện viết</span>
            </h3>
            <button
              @click="isCustomPromptModalOpen = false"
              class="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Nhập chủ đề hoặc câu hỏi bạn muốn luyện viết. Bạn có thể tự thêm các gợi ý dàn ý để định hình bài viết của mình.
          </p>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tên chủ đề / Tiêu đề bài viết
              </label>
              <input
                v-model="customTitleInput"
                type="text"
                placeholder="VD: My Hometown, Job Interview Experience..."
                class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Yêu cầu chi tiết (Prompt)
              </label>
              <textarea
                v-model="customPromptInput"
                rows="3"
                placeholder="VD: Write a short paragraph describing the place where you grew up and what makes it special to you."
                class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gợi ý dàn ý (Writing Guidance - mỗi ý 1 dòng, không bắt buộc)
              </label>
              <textarea
                v-model="customGuidanceInput"
                rows="3"
                placeholder="• Mở bài: Giới thiệu quê hương ở đâu
• Thân bài: Điểm đặc trưng (ẩm thực, cảnh sắc, con người)
• Kết bài: Tình cảm hoặc kỷ niệm đáng nhớ nhất"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
              ></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              @click="isCustomPromptModalOpen = false"
              class="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              @click="applyCustomPrompt"
              :disabled="!customTitleInput.trim() && !customPromptInput.trim()"
              class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer"
            >
              Áp dụng chủ đề này
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import {
  ArrowLeft, ArrowRight, Check, Copy, Loader2, Sparkles, PenLine,
  History, Lightbulb, Plus, BookOpen, Clock, X, FileText, RotateCcw
} from 'lucide-vue-next';
import AnimateButton from '../components/ui/Button.vue';
import AnimateCountingNumber from '../components/ui/CountingNumber.vue';
import { writingService } from '../services/writingService';

const ctx = inject('screenContext');
const {
  activeTab, goBack, hasHistory, isAuthenticated,
  essayInput, wordCount, isEvaluating, writingError,
  writingResult, writingSubTab, submitWritingEvaluation,
  copyRewritten, copied, activeWritingPrompt
} = ctx;

const startNewEssay = () => {
  if (essayInput) essayInput.value = '';
  if (writingResult) writingResult.value = null;
  if (writingError) writingError.value = '';
  if (ctx.journey?.update) {
    const key = ctx.currentLesson?.value?.type === 'WRITING' ? String(ctx.currentLesson.value.id) : 'free';
    ctx.journey.update(data => { data.writing_drafts[key] = ''; });
  }
};

// 1. Chế độ xem: 'editor' (viết bài) hoặc 'history' (lịch sử các bài đã nộp)
const currentView = ref('editor');

// 2. 4 Chủ đề mẫu thiết kế sẵn (Curated Sample Prompts)
const SAMPLE_PROMPTS = [
  {
    id: 'leave_email',
    category: 'Workplace',
    categoryColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    title: 'Email xin nghỉ phép 3 ngày',
    prompt: 'Write a professional email to your manager requesting 3 days of annual leave next week.',
    wordCount: '60–100 words',
    guidance: [
      'Nêu rõ thời gian & lý do xin nghỉ (dates & reason).',
      'Đề cập kế hoạch bàn giao công việc / người hỗ trợ thay (handover plan).',
      'Cung cấp phương thức liên lạc khẩn cấp khi cần thiết (emergency contact).'
    ]
  },
  {
    id: 'travel_memory',
    category: 'Daily Life',
    categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Kể về chuyến du lịch đáng nhớ',
    prompt: 'Describe a memorable trip or vacation you took. Where did you go and why was it special?',
    wordCount: '80–120 words',
    guidance: [
      'Bạn đã đi đâu, vào thời gian nào và đi cùng ai?',
      'Điểm ấn tượng nhất (cảnh sắc, món ăn, con người hoặc trải nghiệm độc đáo).',
      'Cảm xúc hoặc bài học sau chuyến đi đó.'
    ]
  },
  {
    id: 'wfh_opinion',
    category: 'Opinion',
    categoryColor: 'bg-amber-50 text-amber-800 border-amber-200',
    title: 'Làm việc từ xa (WFH) hay tại văn phòng?',
    prompt: 'Do you prefer working remotely (from home) or working in an office? Explain your reasons.',
    wordCount: '90–140 words',
    guidance: [
      'Nêu rõ quan điểm của bạn (thích WFH hay Office hơn).',
      'Đưa ra 2 lý do chính (tiết kiệm thời gian di chuyển, sự tập trung, hay tương tác đồng nghiệp).',
      'Tóm tắt lại quan điểm trong 1 câu kết luận.'
    ]
  },
  {
    id: 'new_skill',
    category: 'Growth',
    categoryColor: 'bg-purple-50 text-purple-700 border-purple-200',
    title: 'Một kỹ năng mới bạn muốn học',
    prompt: 'Describe a new skill or hobby you would like to master in the future. Why is it important to you?',
    wordCount: '80–120 words',
    guidance: [
      'Kỹ năng hoặc sở thích bạn muốn học là gì (nấu ăn, tiếng Anh, lập trình, chơi đàn...)?',
      'Lý do vì sao bạn muốn thành thạo kỹ năng này.',
      'Kế hoạch bạn dự định sắp xếp thời gian để học nó.'
    ]
  }
];

// 3. Chọn & Xóa chủ đề mẫu
const selectSamplePrompt = (item) => {
  if (activeWritingPrompt?.value?.id === item.id) {
    activeWritingPrompt.value = null;
  } else if (activeWritingPrompt) {
    activeWritingPrompt.value = item;
  }
};

const clearActivePrompt = () => {
  if (activeWritingPrompt) activeWritingPrompt.value = null;
};

// 4. Modal Tự nhập chủ đề
const isCustomPromptModalOpen = ref(false);
const customTitleInput = ref('');
const customPromptInput = ref('');
const customGuidanceInput = ref('');

const openCustomPromptModal = () => {
  customTitleInput.value = '';
  customPromptInput.value = '';
  customGuidanceInput.value = '';
  isCustomPromptModalOpen.value = true;
};

const applyCustomPrompt = () => {
  if (!customTitleInput.value.trim() && !customPromptInput.value.trim()) return;
  const title = customTitleInput.value.trim() || 'Chủ đề tự chọn';
  const prompt = customPromptInput.value.trim() || title;
  const guidance = customGuidanceInput.value.trim()
    ? customGuidanceInput.value.split('\n').filter(Boolean)
    : [
        'Mở đoạn: Nêu ngắn gọn chủ đề / quan điểm của bạn.',
        'Thân đoạn: Đưa ra 2 ý chính hoặc ví dụ cụ thể để giải thích.',
        'Kết đoạn: Tóm tắt lại cảm nghĩ hoặc kết luận.'
      ];

  if (activeWritingPrompt) {
    activeWritingPrompt.value = {
      id: 'custom_' + Date.now(),
      category: 'Tự chọn',
      categoryColor: 'bg-sky-50 text-sky-700 border-sky-200',
      title,
      prompt,
      wordCount: '80–150 words',
      guidance
    };
  }
  isCustomPromptModalOpen.value = false;
};

// 5. Quản lý Lịch sử bài viết (Writing History)
const writingHistory = ref([]);
const isHistoryLoading = ref(false);
const selectedHistoryItem = ref(null);

const loadWritingHistory = async () => {
  if (!isAuthenticated?.value) return;
  isHistoryLoading.value = true;
  try {
    const list = await writingService.getHistory();
    writingHistory.value = Array.isArray(list) ? list : [];
  } catch (err) {
    console.warn('Could not load writing history:', err);
  } finally {
    isHistoryLoading.value = false;
  }
};

const switchToHistory = () => {
  currentView.value = 'history';
  selectedHistoryItem.value = null;
  void loadWritingHistory();
};

const viewHistoryDetail = (item) => {
  selectedHistoryItem.value = item;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

onMounted(() => {
  void loadWritingHistory();
});
</script>