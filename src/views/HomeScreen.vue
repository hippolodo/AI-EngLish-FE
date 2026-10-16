<template>
  <section v-if="activeTab === 'home'" class="home-screen pb-20">
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      
      <!-- LEFT / CENTER COLUMN: CHẾ ĐỘ LUYỆN TẬP & KHO CHỦ ĐỀ (xl:col-span-8) -->
      <div class="xl:col-span-8 space-y-9">
        
        <!-- Header Tiêu đề chính -->
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Các chế độ luyện tập AI</h1>
          <p class="text-sm sm:text-base text-slate-500 mt-1">Lựa chọn kỹ năng bạn muốn trau dồi cùng trợ lý thông minh</p>
        </div>

        <!-- Lưới 6 thẻ chế độ luyện tập (Kích thước to, chữ rõ nét, minh họa sắc sảo) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <!-- 1. Luyện phát âm AI (Speaking Lab) -->
          <div
            @click="activeTab = 'speaking'"
            class="group cursor-pointer text-left select-none"
          >
            <div class="w-full h-52 sm:h-56 rounded-3xl relative overflow-hidden flex items-center justify-center transition-all duration-200 group-hover:shadow-md bg-[#f1f5f9] border border-slate-200/60">
              <!-- Feature Tag -->
              <span class="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-emerald-700 font-bold text-xs shadow-2xs border border-emerald-100">
                <Mic class="w-3.5 h-3.5 text-emerald-600" />
                <span>GOP • Chuẩn IPA</span>
              </span>

              <!-- Illustration: Man speaking with soundwaves -->
              <svg viewBox="0 0 160 140" class="w-40 h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="80" cy="50" r="24" fill="#334155" />
                <path d="M48 116C48 94 62 84 80 84C98 84 112 94 112 116" fill="#475569" />
                <!-- Glasses -->
                <rect x="67" y="44" width="11" height="8" rx="2" stroke="#94a3b8" stroke-width="2" fill="none" />
                <rect x="82" y="44" width="11" height="8" rx="2" stroke="#94a3b8" stroke-width="2" fill="none" />
                <line x1="78" y1="48" x2="82" y2="48" stroke="#94a3b8" stroke-width="2" />
                <!-- Soundwaves radiating from speech -->
                <path d="M114 46C119 51 119 59 114 64" stroke="#0ea5e9" stroke-width="3.5" stroke-linecap="round" />
                <path d="M123 39C130 47 130 63 123 71" stroke="#0ea5e9" stroke-width="3.5" stroke-linecap="round" />
                <path d="M132 32C142 43 142 67 132 78" stroke="#0ea5e9" stroke-width="3.5" stroke-linecap="round" />
              </svg>
            </div>
            <div class="pt-3.5">
              <h3 class="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">Luyện phát âm AI</h3>
              <p class="text-sm text-slate-600 mt-1 leading-relaxed">
                Chấm điểm từng âm vị IPA, chỉ rõ âm đọc đúng/sai và khẩu hình chuẩn so với người bản xứ.
              </p>
            </div>
          </div>

          <!-- 2. Hội thoại AI thông minh (AI Chat) -->
          <div
            @click="activeTab = 'chat'"
            class="group cursor-pointer text-left select-none"
          >
            <div class="w-full h-52 sm:h-56 rounded-3xl relative overflow-hidden flex items-center justify-center transition-all duration-200 group-hover:shadow-md bg-[#fef08a] border border-amber-200/60">
              <!-- Feature Tag -->
              <span class="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-indigo-700 font-bold text-xs shadow-2xs border border-indigo-100">
                <MessageSquare class="w-3.5 h-3.5 text-indigo-600" />
                <span>12+ Chủ đề • Đóng vai</span>
              </span>

              <!-- Illustration: Hand holding smartphone with floating chat bubbles -->
              <svg viewBox="0 0 160 140" class="w-40 h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="52" y="18" width="56" height="102" rx="12" fill="#1e293b" />
                <rect x="55" y="21" width="50" height="96" rx="9" fill="#ffffff" />
                <rect x="71" y="25" width="18" height="3" rx="1.5" fill="#cbd5e1" />
                <!-- Chat bubble 1 (Blue) -->
                <rect x="20" y="32" width="48" height="22" rx="11" fill="#93c5fd" />
                <circle cx="33" cy="43" r="3" fill="#ffffff" />
                <circle cx="44" cy="43" r="3" fill="#ffffff" />
                <circle cx="55" cy="43" r="3" fill="#ffffff" />
                <!-- Chat bubble 2 (Coral / Rose) -->
                <rect x="80" y="58" width="52" height="22" rx="11" fill="#f87171" />
                <circle cx="94" cy="69" r="3" fill="#ffffff" />
                <circle cx="106" cy="69" r="3" fill="#ffffff" />
                <circle cx="118" cy="69" r="3" fill="#ffffff" />
                <!-- Chat bubble 3 (Cyan) -->
                <rect x="28" y="86" width="48" height="22" rx="11" fill="#38bdf8" />
                <circle cx="41" cy="97" r="3" fill="#ffffff" />
                <circle cx="52" cy="97" r="3" fill="#ffffff" />
                <circle cx="63" cy="97" r="3" fill="#ffffff" />
              </svg>
            </div>
            <div class="pt-3.5">
              <h3 class="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">Hội thoại AI thông minh</h3>
              <p class="text-sm text-slate-600 mt-1 leading-relaxed">
                Luyện phản xạ giao tiếp tự nhiên theo 12+ tình huống thực tế hoặc tự tạo chủ đề trò chuyện theo ý bạn.
              </p>
            </div>
          </div>

          <!-- 3. Trợ lý luyện viết AI (Writing Coach) -->
          <div
            @click="activeTab = 'writing'"
            class="group cursor-pointer text-left select-none"
          >
            <div class="w-full h-52 sm:h-56 rounded-3xl relative overflow-hidden flex items-center justify-center transition-all duration-200 group-hover:shadow-md bg-[#f1f5f9] border border-slate-200/60">
              <!-- Feature Tag -->
              <span class="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-purple-700 font-bold text-xs shadow-2xs border border-purple-100">
                <PenTool class="w-3.5 h-3.5 text-purple-600" />
                <span>Gemini • Sửa ngữ pháp</span>
              </span>

              <!-- Illustration: Writing Tablet / Essay Note -->
              <svg viewBox="0 0 160 140" class="w-40 h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="42" y="22" width="76" height="96" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5" />
                <!-- Lines of writing text -->
                <rect x="56" y="38" width="48" height="6" rx="3" fill="#6366f1" />
                <rect x="56" y="52" width="38" height="5" rx="2.5" fill="#94a3b8" />
                <rect x="56" y="64" width="44" height="5" rx="2.5" fill="#94a3b8" />
                <rect x="56" y="76" width="32" height="5" rx="2.5" fill="#94a3b8" />
                <!-- Pen / Stylus -->
                <g transform="rotate(25 105 75)">
                  <rect x="100" y="50" width="10" height="42" rx="4" fill="#8b5cf6" />
                  <path d="M100 92L105 102L110 92Z" fill="#6d28d9" />
                </g>
              </svg>
            </div>
            <div class="pt-3.5">
              <h3 class="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">Trợ lý luyện viết AI</h3>
              <p class="text-sm text-slate-600 mt-1 leading-relaxed">
                Tập viết văn hoặc trả lời đề bài, nhận phân tích chi tiết lỗi ngữ pháp, từ vựng và gợi ý viết hay hơn.
              </p>
            </div>
          </div>

          <!-- 4. Học từ vựng Flashcard (SRS Spaced Repetition) -->
          <div
            @click="openReview"
            class="group cursor-pointer text-left select-none"
          >
            <div class="w-full h-52 sm:h-56 rounded-3xl relative overflow-hidden flex items-center justify-center transition-all duration-200 group-hover:shadow-md bg-[#f1f5f9] border border-slate-200/60">
              <!-- Feature Tag -->
              <span class="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-sky-700 font-bold text-xs shadow-2xs border border-sky-100">
                <Layers class="w-3.5 h-3.5 text-sky-600" />
                <span>Thuật toán SRS</span>
              </span>

              <!-- Illustration: 2 Tilted Vocabulary Cards -->
              <svg viewBox="0 0 160 140" class="w-40 h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Left card -->
                <g transform="rotate(-8 60 70)">
                  <rect x="25" y="24" width="56" height="80" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5" />
                  <circle cx="53" cy="56" r="15" fill="#fee2e2" />
                  <circle cx="53" cy="58" r="9" fill="#ef4444" />
                  <path d="M53 45C56 41 60 43 61 45" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" />
                  <rect x="37" y="84" width="32" height="5" rx="2.5" fill="#94a3b8" />
                </g>
                <!-- Right card -->
                <g transform="rotate(8 100 70)">
                  <rect x="80" y="24" width="56" height="80" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5" />
                  <circle cx="108" cy="56" r="15" fill="#e0f2fe" />
                  <path d="M100 52L108 55L116 52V65L108 68L100 65Z" fill="#0284c7" />
                  <rect x="92" y="84" width="32" height="5" rx="2.5" fill="#94a3b8" />
                </g>
              </svg>
            </div>
            <div class="pt-3.5">
              <h3 class="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">Học từ vựng Flashcard</h3>
              <p class="text-sm text-slate-600 mt-1 leading-relaxed">
                Ghi nhớ từ vựng dài hạn với phương pháp lặp lại ngắt quãng, tự động nhắc nhở từ đến hạn ôn tập.
              </p>
            </div>
          </div>

          <!-- 5. Trắc nghiệm Quiz (Kiểm tra nhanh) -->
          <div
            @click="openQuizMode"
            class="group cursor-pointer text-left select-none"
          >
            <div class="w-full h-52 sm:h-56 rounded-3xl relative overflow-hidden flex items-center justify-center transition-all duration-200 group-hover:shadow-md bg-[#f1f5f9] border border-slate-200/60">
              <!-- Feature Tag -->
              <span class="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-amber-700 font-bold text-xs shadow-2xs border border-amber-100">
                <BookOpen class="w-3.5 h-3.5 text-amber-600" />
                <span>Trắc nghiệm nhanh</span>
              </span>

              <!-- Illustration: Quiz Card with Tree & Checkmark -->
              <svg viewBox="0 0 160 140" class="w-40 h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="44" y="18" width="72" height="104" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5" />
                <!-- Tree -->
                <path d="M80 34C74 34 70 38 70 43C66 44 64 48 65 52C64 57 68 61 73 61H87C92 61 96 57 95 52C96 48 94 44 90 43C90 38 86 34 80 34Z" fill="#10b981" />
                <rect x="78" y="61" width="4" height="12" fill="#78350f" />
                <line x1="56" y1="84" x2="104" y2="84" stroke="#e2e8f0" stroke-width="2" />
                <!-- Cross & Check buttons -->
                <circle cx="65" cy="98" r="8" fill="#fee2e2" />
                <path d="M62 95L68 101M68 95L62 101" stroke="#ef4444" stroke-width="2" stroke-linecap="round" />
                <circle cx="95" cy="98" r="8" fill="#dcfce7" />
                <path d="M91 98L94 101L99 95" stroke="#16a34a" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
            <div class="pt-3.5">
              <h3 class="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">Kiểm tra trắc nghiệm Quiz</h3>
              <p class="text-sm text-slate-600 mt-1 leading-relaxed">
                Đánh giá mức độ ghi nhớ bài học, ngữ pháp và nghĩa từ vựng qua các bộ câu hỏi trắc nghiệm ngắn.
              </p>
            </div>
          </div>

          <!-- 6. Luyện phản xạ giọng nói (Free Voice Talk) -->
          <div
            @click="activeTab = 'chat'"
            class="group cursor-pointer text-left select-none"
          >
            <div class="w-full h-52 sm:h-56 rounded-3xl relative overflow-hidden flex items-center justify-center transition-all duration-200 group-hover:shadow-md bg-[#f1f5f9] border border-slate-200/60">
              <!-- Feature Tag -->
              <span class="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-teal-700 font-bold text-xs shadow-2xs border border-teal-100">
                <Volume2 class="w-3.5 h-3.5 text-teal-600" />
                <span>Phản xạ qua Micro</span>
              </span>

              <!-- Illustration: Audio Device with Waves -->
              <svg viewBox="0 0 160 140" class="w-40 h-36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="54" y="24" width="52" height="92" rx="12" fill="#1e293b" />
                <rect x="58" y="28" width="44" height="84" rx="8" fill="#0f172a" />
                <circle cx="80" cy="64" r="17" fill="#22c55e" />
                <path d="M74 59C74 67 79 72 86 72" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
                <!-- Wave Ripples -->
                <circle cx="80" cy="64" r="29" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4 4" />
                <circle cx="80" cy="64" r="42" stroke="#22c55e" stroke-width="1" opacity="0.6" stroke-dasharray="3 3" />
              </svg>
            </div>
            <div class="pt-3.5">
              <h3 class="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">Luyện phản xạ giọng nói</h3>
              <p class="text-sm text-slate-600 mt-1 leading-relaxed">
                Tập nói liên tục trực tiếp qua micro cùng AI, rèn luyện tư duy phản xạ tiếng Anh không cần gõ phím.
              </p>
            </div>
          </div>

        </div>

        <!-- KHO CHỦ ĐỀ BÀI HỌC (COURSES & TOPICS) -->
        <section class="space-y-5 pt-8 border-t border-slate-200/80" aria-labelledby="home-courses-title">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 id="home-courses-title" class="text-2xl font-bold text-slate-900 tracking-tight">Chủ đề bài học theo trình độ</h2>
              <p class="text-sm text-slate-500 mt-0.5">Khám phá các bài học được phân cấp khoa học từ cơ bản đến nâng cao</p>
            </div>

            <!-- Level Filter Pills -->
            <div class="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl shrink-0 overflow-x-auto">
              <button
                v-for="lvl in levels"
                :key="lvl.id"
                @click="selectedTopicLevel = lvl.id; showAllTopics = false"
                :class="selectedTopicLevel === lvl.id ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900 font-semibold'"
                class="px-4 py-2 rounded-xl text-xs sm:text-sm transition cursor-pointer shrink-0"
              >
                {{ lvl.label }}
              </button>
            </div>
          </div>

          <div v-if="homeLoading" role="status" class="flex items-center justify-center gap-2 py-12 text-sm text-slate-500 bg-white rounded-3xl border border-slate-100">
            <Loader2 class="h-5 w-5 animate-spin text-blue-600" /> Đang tải danh sách bài học…
          </div>

          <template v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <button
                v-for="(topic, index) in visibleTopics"
                :key="topic.id"
                @click="startTopic(topic)"
                class="group flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 text-left shadow-2xs hover:shadow-xs transition duration-200 cursor-pointer min-h-[170px]"
              >
                <div>
                  <div class="flex items-center justify-between mb-3.5">
                    <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-2xl group-hover:scale-105 transition-transform" aria-hidden="true">
                      {{ getTopicEmoji(topic.title) }}
                    </span>
                    <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {{ levelLabels[topic.level] || topic.level }}
                    </span>
                  </div>
                  <h4 class="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition">
                    {{ topic.title }}
                  </h4>
                </div>

                <div class="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-blue-600">
                  <span>Vào bài học</span>
                  <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <p v-if="!filteredTopics.length" class="col-span-full rounded-3xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">
                Chưa có chủ đề nào ở trình độ này.
              </p>
            </div>

            <div v-if="filteredTopics.length > 6" class="text-center pt-2">
              <button
                @click="showAllTopics = !showAllTopics"
                :aria-expanded="showAllTopics"
                class="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 transition cursor-pointer shadow-2xs"
              >
                <span>{{ showAllTopics ? 'Thu gọn' : `Xem toàn bộ ${filteredTopics.length} chủ đề bài học` }}</span>
                <ChevronRight :class="showAllTopics ? '-rotate-90' : 'rotate-90'" class="w-4 h-4 transition-transform" />
              </button>
            </div>
          </template>
        </section>

      </div>

      <!-- RIGHT COLUMN: STATS & PROGRESS RAIL (xl:col-span-4) - THỰC TẾ & THIẾT THỰC -->
      <div class="xl:col-span-4 space-y-5 xl:sticky xl:top-6">
        
        <!-- 1. Thẻ Lộ trình & Bài học tiếp theo (Next Lesson Action) -->
        <div class="rounded-3xl p-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-blue-500/15 space-y-4">
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-white">
              <BookOpen class="w-3.5 h-3.5" />
              <span>Mục tiêu tiếp theo</span>
            </span>
            <span class="text-xs font-semibold text-blue-100">{{ journey.state.value.daily_minutes || 15 }} phút / ngày</span>
          </div>

          <div>
            <h3 class="text-xl font-bold leading-tight">
              {{ journey.state.value.resume ? 'Tiếp tục từ bài bạn đang dở' : 'Bắt đầu bài học hôm nay' }}
            </h3>
            <p class="text-xs text-blue-100/90 mt-1.5 leading-relaxed">
              {{ nextTopicTitle }}
            </p>
          </div>

          <button
            @click="continueLearning"
            :disabled="journey.loading.value || homeLoading"
            class="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-4 rounded-2xl text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{{ journey.state.value.resume ? 'Tiếp tục học ngay' : 'Vào bài học ngay' }}</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <!-- 2. Thẻ Thống kê chuỗi ngày học & Lượt luyện tập (Real Streak & Stats) -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>🔥</span> Thống kê hoạt động
          </h3>

          <div class="flex items-center justify-between py-2 border-b border-slate-100">
            <span class="text-sm font-medium text-slate-600">Chuỗi học liên tục</span>
            <span class="bg-blue-600 text-white px-3.5 py-1 rounded-full text-xs font-bold">
              {{ dashboard?.streak || 0 }} ngày
            </span>
          </div>

          <div class="flex items-center justify-between py-2 border-b border-slate-100">
            <span class="text-sm font-medium text-slate-600">Lượt luyện tập hoàn thành</span>
            <span class="bg-emerald-50 text-emerald-700 px-3.5 py-1 rounded-full text-xs font-bold border border-emerald-100">
              {{ totalPracticeCount || 0 }} lượt
            </span>
          </div>

          <div class="flex items-center justify-between pt-1">
            <span class="text-sm font-medium text-slate-600">Bài học đã hoàn thành</span>
            <span class="bg-purple-50 text-purple-700 px-3.5 py-1 rounded-full text-xs font-bold border border-purple-100">
              {{ journey.completedCount.value || 0 }} bài
            </span>
          </div>
        </div>

        <!-- 3. Thẻ Trình độ học tập của người dùng (Proficiency Level) -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-slate-900">
                Trình độ: {{ levelLabels[userProfile?.target_level] || 'Cơ bản' }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Mục tiêu cấp độ học hiện tại</p>
            </div>
            <span class="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
              {{ userProfile?.target_level || 'Beginner' }}
            </span>
          </div>

          <!-- Progress Bar with Level Indicator Track -->
          <div class="flex items-center gap-3 pt-2">
            <span class="text-xs font-bold text-slate-500">Lv.1</span>
            <div class="flex-1 h-2.5 bg-slate-100 rounded-full relative overflow-hidden">
              <div
                class="h-full bg-blue-600 rounded-full transition-all duration-300"
                :style="{ width: userLevelPercent + '%' }"
              ></div>
            </div>
            <span class="text-xs font-bold text-slate-400">Lv.3</span>
          </div>
          <p class="text-[11px] text-slate-400 pt-1">Hoàn thành bài tập và quiz để nâng cấp độ.</p>
        </div>

        <!-- 4. Thẻ Mẹo học hôm nay (Daily Tips) -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>💡</span> Mẹo luyện tập hôm nay
          </h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Dành 10–15 phút mỗi ngày để luyện nói và đối chiếu âm vị IPA sẽ giúp não bộ hình thành phản xạ phát âm tự nhiên nhanh gấp 3 lần so với học dồn một buổi.
          </p>
        </div>

      </div>

    </div>
  </section>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import {
  ChevronRight, Loader2, Mic, MessageSquare, PenTool,
  Layers, BookOpen, Volume2
} from 'lucide-vue-next';

const ctx = inject('screenContext');
const {
  activeTab, userProfile,
  homeLoading, topics, startTopic, getTopicEmoji, dashboard,
  journey, continueLearning, recommendedTopic, totalPracticeCount
} = ctx;

const selectedTopicLevel = ref('all');
const showAllTopics = ref(false);

const levels = [
  { id: 'all', label: 'Tất cả trình độ' },
  { id: 'Beginner', label: 'Cơ bản (Beginner)' },
  { id: 'Intermediate', label: 'Trung cấp (Intermediate)' },
  { id: 'Advanced', label: 'Nâng cao (Advanced)' }
];

const levelLabels = {
  Beginner: 'Cơ bản',
  Intermediate: 'Trung cấp',
  Advanced: 'Nâng cao'
};

const nextTopicTitle = computed(() => {
  if (journey.state.value.resume) {
    const found = topics.value?.find(topic => topic.id === journey.state.value.resume.topic_id);
    return found ? `Bài học thuộc chủ đề "${found.title}"` : 'Bài học đang dở';
  }
  return recommendedTopic.value?.title ? `Gợi ý bắt đầu: "${recommendedTopic.value.title}"` : 'Chọn một chủ đề phù hợp bên dưới để bắt đầu';
});

const openReview = () => {
  ctx.leaveLesson(false);
  ctx.studyDeckId.value = null;
  ctx.studyMode.value = 'flashcard';
  ctx.activeTab.value = 'study';
  void ctx.loadFlashcardsData();
};

const openQuizMode = () => {
  ctx.leaveLesson(false);
  ctx.studyMode.value = 'quiz';
  ctx.activeTab.value = 'study';
  void ctx.loadQuizzesData();
};

const userLevelPercent = computed(() => {
  const completed = journey.completedCount?.value || 0;
  return Math.min(100, Math.max(25, (completed % 5) * 20 + 20));
});

const filteredTopics = computed(() => {
  if (selectedTopicLevel.value === 'all') return topics.value || [];
  return (topics.value || []).filter(topic => topic.level === selectedTopicLevel.value);
});

const visibleTopics = computed(() => {
  if (showAllTopics.value) return filteredTopics.value;
  return filteredTopics.value.slice(0, 6);
});
</script>
