<template>
  <section v-if="activeTab === 'home'" class="home-screen pb-20">
    <div class="max-w-[1440px] mx-auto flex flex-col xl:flex-row gap-8 items-start">
      
      <!-- LEFT / CENTER COLUMN: LEARNING MODES & COURSES GRID -->
      <div class="flex-1 min-w-0 space-y-8">
        
        <!-- Header Tiêu đề chính -->
        <div>
          <h1 class="text-2xl font-bold text-[#1f242e] mb-1">Chế độ luyện tập AI</h1>
          <p class="text-[14px] text-[#6b7280]">Lựa chọn kỹ năng bạn muốn trau dồi cùng trợ lý thông minh</p>
        </div>

        <!-- Modes Grid (Dùng đúng tỷ lệ & typography mẫu) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Card 1: Chat -->
          <div
            @click="activeTab = 'chat'"
            class="group cursor-pointer flex flex-col select-none"
          >
            <div class="relative w-full h-44 rounded-2xl bg-[#ffdc69] flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:shadow-md">
              <!-- Floating Message Bubbles -->
              <div class="absolute top-3 left-6 sm:left-10 bg-white/95 backdrop-blur rounded-lg px-2.5 py-1 text-[11px] font-bold text-gray-700 shadow-xs flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Hi there!
              </div>
              <div class="absolute top-10 right-6 sm:right-10 bg-blue-500 text-white rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-xs">
                Let's practice!
              </div>

              <!-- 3D Smartphone & Hand Graphic -->
              <div class="relative flex flex-col items-center">
                <div class="w-16 h-28 bg-[#f8fafc] border-4 border-slate-700 rounded-2xl shadow-xl flex flex-col items-center p-1 relative z-10 rotate-[-8deg]">
                  <div class="w-4 h-1 bg-gray-400 rounded-full mb-1"></div>
                  <div class="w-full h-3 bg-blue-100 rounded my-0.5"></div>
                  <div class="w-3/4 h-3 bg-pink-100 rounded my-0.5 self-start"></div>
                  <div class="w-full h-3 bg-blue-100 rounded my-0.5"></div>
                  <div class="mt-auto w-4 h-4 rounded-full bg-slate-200"></div>
                </div>
                <div class="w-20 h-10 bg-[#e2936a] rounded-t-xl -mt-6 border-2 border-[#b56740] shadow-md z-0 rotate-[-4deg]"></div>
              </div>
            </div>
            <div class="mt-3.5">
              <h2 class="text-[17px] font-bold text-[#1e2229] mb-1 group-hover:text-[#2b59ff] transition-colors">Hội thoại AI thông minh</h2>
              <p class="text-[13px] text-[#6b7280] leading-snug">Giao tiếp phản xạ theo 12+ tình huống thực tế hoặc tự tạo ngữ cảnh trò chuyện cùng AI.</p>
            </div>
          </div>

          <!-- Card 2: Sentence Mode (Luyện phát âm AI) -->
          <div
            @click="activeTab = 'speaking'"
            class="group cursor-pointer flex flex-col select-none"
          >
            <div class="relative w-full h-44 rounded-2xl bg-[#f2f4f7] flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:shadow-md">
              <!-- Feature Tag -->
              <div class="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-emerald-100 px-2.5 py-1 rounded-full shadow-2xs">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span class="text-[11px] font-bold text-emerald-700">GOP • Chuẩn IPA</span>
              </div>

              <!-- Character Illustration -->
              <div class="w-36 h-36 flex items-center justify-center text-slate-400">
                <svg class="w-full h-full text-slate-400" fill="none" viewBox="0 0 120 120">
                  <path d="M25 45c-2 2-2 6 0 8M20 40c-4 5-4 13 0 18M15 35c-7 8-7 21 0 28" stroke="#94a3b8" stroke-linecap="round" stroke-width="2.2"></path>
                  <circle cx="70" cy="38" fill="#94a3b8" r="16"></circle>
                  <rect fill="none" height="6" rx="2" stroke="#334155" stroke-width="2" width="12" x="66" y="36"></rect>
                  <path d="M50 85c0-16 10-24 24-24s24 8 24 24v8H50v-8z" fill="#94a3b8"></path>
                  <rect fill="#475569" height="20" rx="3" transform="rotate(-25 42 44)" width="10" x="42" y="44"></rect>
                </svg>
              </div>
            </div>
            <div class="mt-3.5">
              <h2 class="text-[17px] font-bold text-[#1e2229] mb-1 group-hover:text-[#2b59ff] transition-colors">Luyện phát âm AI (Speaking Lab)</h2>
              <p class="text-[13px] text-[#6b7280] leading-snug">Chấm điểm từng âm vị IPA, chỉ rõ âm đọc đúng/sai và đối chiếu phát âm với người bản xứ.</p>
            </div>
          </div>

          <!-- Card 3: Word Mode (Flashcard từ vựng) -->
          <div
            @click="openReview"
            class="group cursor-pointer flex flex-col select-none"
          >
            <div class="relative w-full h-44 rounded-2xl bg-[#f2f4f7] flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:shadow-md">
              <!-- Feature Tag -->
              <div class="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-sky-100 px-2.5 py-1 rounded-full shadow-2xs">
                <span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                <span class="text-[11px] font-bold text-sky-700">Thuật toán SRS</span>
              </div>

              <!-- Cards Illustration (Apple & Book) -->
              <div class="flex items-center justify-center gap-2">
                <div class="w-16 h-24 bg-white rounded-xl shadow-md border border-gray-200 transform -rotate-12 flex flex-col items-center justify-center p-1.5">
                  <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mb-1">
                    <span class="text-xs">🍎</span>
                  </div>
                  <span class="text-[9px] font-bold text-gray-600">Apple</span>
                </div>
                <div class="w-16 h-24 bg-white rounded-xl shadow-md border border-gray-200 transform rotate-6 flex flex-col items-center justify-center p-1.5">
                  <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                    <span class="text-xs">📖</span>
                  </div>
                  <span class="text-[9px] font-bold text-gray-600">Book</span>
                </div>
              </div>
            </div>
            <div class="mt-3.5">
              <h2 class="text-[17px] font-bold text-[#1e2229] mb-1 group-hover:text-[#2b59ff] transition-colors">Học từ vựng Flashcard</h2>
              <p class="text-[13px] text-[#6b7280] leading-snug">Ghi nhớ từ vựng dài hạn với phương pháp lặp lại ngắt quãng, tự nhắc thẻ đến hạn ôn.</p>
            </div>
          </div>

          <!-- Card 4: Writing Mode (Trợ lý luyện viết) -->
          <div
            @click="activeTab = 'writing'"
            class="group cursor-pointer flex flex-col select-none"
          >
            <div class="relative w-full h-44 rounded-2xl bg-[#f2f4f7] flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:shadow-md">
              <!-- Feature Tag -->
              <div class="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-purple-100 px-2.5 py-1 rounded-full shadow-2xs">
                <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <span class="text-[11px] font-bold text-purple-700">Gemini Sửa lỗi</span>
              </div>

              <!-- Speech Bubble & Sound Wave Graphic -->
              <div class="relative w-36 h-28 flex items-center justify-center">
                <div class="w-20 h-16 bg-slate-300 rounded-2xl p-2.5 flex flex-col justify-around absolute left-4">
                  <div class="w-full h-1.5 bg-slate-400 rounded-full"></div>
                  <div class="w-3/4 h-1.5 bg-slate-400 rounded-full"></div>
                </div>
                <div class="w-22 h-18 bg-slate-600 rounded-2xl p-3 shadow-lg flex items-center gap-2 z-10 absolute right-4">
                  <div class="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center">
                    <svg class="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4"></circle>
                      <path d="M12 14c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4z"></path>
                    </svg>
                  </div>
                  <div class="flex flex-col gap-1">
                    <div class="w-1.5 h-3 bg-white/70 rounded-full"></div>
                    <div class="w-1.5 h-5 bg-white rounded-full"></div>
                    <div class="w-1.5 h-2 bg-white/70 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-3.5">
              <h2 class="text-[17px] font-bold text-[#1e2229] mb-1 group-hover:text-[#2b59ff] transition-colors">Trợ lý luyện viết AI</h2>
              <p class="text-[13px] text-[#6b7280] leading-snug">Viết đoạn văn theo đề hoặc tự do, nhận phân tích chi tiết lỗi ngữ pháp và gợi ý sửa bài.</p>
            </div>
          </div>

          <!-- Card 5: Flashcards / Quiz (Kiểm tra nhanh) -->
          <div
            @click="openQuizMode"
            class="group cursor-pointer flex flex-col select-none"
          >
            <div class="relative w-full h-44 rounded-2xl bg-[#f2f4f7] flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:shadow-md">
              <!-- Feature Tag -->
              <div class="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-amber-100 px-2.5 py-1 rounded-full shadow-2xs">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span class="text-[11px] font-bold text-amber-700">Trắc nghiệm</span>
              </div>

              <!-- Tablet/Flashcard Illustration with hand -->
              <div class="relative flex items-center justify-center">
                <div class="w-24 h-32 bg-white rounded-xl shadow-md border border-gray-200 p-2 flex flex-col items-center">
                  <div class="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 mb-2">
                    <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8 2 6 6 6 9c0 2 1 4 2 5v4h8v-4c1-1 2-3 2-5 0-3-2-7-6-7z"></path>
                      <rect fill="currentColor" height="4" width="2" x="11" y="18"></rect>
                    </svg>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-4 h-4 rounded-full border border-green-500 flex items-center justify-center text-[10px] text-green-500 font-bold">✓</div>
                    <div class="w-4 h-4 rounded-full border border-red-400 flex items-center justify-center text-[10px] text-red-400 font-bold">✕</div>
                  </div>
                </div>
                <div class="absolute bottom-[-10px] right-2 w-12 h-14 text-slate-400">
                  <svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74c1.21-.81 2-2.18 2-3.74a4.5 4.5 0 0 0-9 0c0 1.56.79 2.93 2 3.74zM16 13h-1v-2a1 1 0 0 0-2 0v2h-2v-4a1 1 0 0 0-2 0v5.5L7.4 13.1a1 1 0 0 0-1.4.1l-.7.7 4.2 4.2c.4.4.9.6 1.4.6h6.1c1.1 0 2-.9 2-2V15c0-1.1-.9-2-2-2z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div class="mt-3.5">
              <h2 class="text-[17px] font-bold text-[#1e2229] mb-1 group-hover:text-[#2b59ff] transition-colors">Kiểm tra trắc nghiệm Quiz</h2>
              <p class="text-[13px] text-[#6b7280] leading-snug">Đánh giá nhanh mức độ ghi nhớ bài học, cấu trúc ngữ pháp và nghĩa của từ vựng.</p>
            </div>
          </div>

          <!-- Card 6: Call Mode (Luyện nói qua Micro) -->
          <div
            @click="activeTab = 'chat'"
            class="group cursor-pointer flex flex-col select-none"
          >
            <div class="relative w-full h-44 rounded-2xl bg-[#f2f4f7] flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:shadow-md">
              <!-- Feature Tag -->
              <div class="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-teal-100 px-2.5 py-1 rounded-full shadow-2xs">
                <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span class="text-[11px] font-bold text-teal-700">Phản xạ âm thanh</span>
              </div>

              <!-- Character on Call Illustration -->
              <div class="relative w-36 h-36 flex items-center justify-center">
                <div class="absolute top-4 left-3 w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-200 p-0.5 z-10">
                  <div class="w-full h-full bg-slate-300 rounded flex items-center justify-center">
                    <span class="text-[9px]">👤</span>
                  </div>
                </div>
                <svg class="w-32 h-32 text-slate-800" fill="none" viewBox="0 0 100 100">
                  <path d="M50 35c8 0 15 6 15 14v10c0 15-8 23-15 23s-15-8-15-23V49c0-8 7-14 15-14z" fill="#94a3b8"></path>
                  <path d="M38 70c0-10 6-16 12-16s12 6 12 16v18H38V70z" fill="#1e293b"></path>
                  <rect fill="#0f172a" height="18" rx="2" transform="rotate(-15 32 52)" width="10" x="32" y="52"></rect>
                </svg>
              </div>
            </div>
            <div class="mt-3.5">
              <h2 class="text-[17px] font-bold text-[#1e2229] mb-1 group-hover:text-[#2b59ff] transition-colors">Luyện phản xạ giọng nói</h2>
              <p class="text-[13px] text-[#6b7280] leading-snug">Trò chuyện hoàn toàn bằng giọng nói qua micro cùng AI để tăng tốc độ phản xạ tự nhiên.</p>
            </div>
          </div>

        </div>

        <!-- KHO CHỦ ĐỀ BÀI HỌC (COURSES & TOPICS) -->
        <section class="space-y-4 pt-6 border-t border-gray-100" aria-labelledby="home-courses-title">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 id="home-courses-title" class="text-xl font-bold text-[#1f242e]">Chủ đề bài học theo trình độ</h2>
              <p class="text-[13px] text-[#6b7280]">Khám phá các bài học được phân cấp khoa học từ cơ bản đến nâng cao</p>
            </div>

            <!-- Level Filter Pills -->
            <div class="flex items-center gap-1.5 p-1 bg-gray-100 rounded-full shrink-0 overflow-x-auto">
              <button
                v-for="lvl in levels"
                :key="lvl.id"
                @click="selectedTopicLevel = lvl.id; showAllTopics = false"
                :class="selectedTopicLevel === lvl.id ? 'bg-white text-[#2b59ff] font-bold shadow-2xs' : 'text-[#4a5568] hover:text-black font-medium'"
                class="px-3.5 py-1.5 rounded-full text-[13px] transition cursor-pointer shrink-0"
              >
                {{ lvl.label }}
              </button>
            </div>
          </div>

          <div v-if="homeLoading" role="status" class="flex items-center justify-center gap-2 py-10 text-[14px] text-gray-500 bg-white rounded-2xl border border-gray-100">
            <Loader2 class="h-4 w-4 animate-spin text-[#2b59ff]" /> Đang tải bài học…
          </div>

          <template v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <button
                v-for="topic in visibleTopics"
                :key="topic.id"
                @click="startTopic(topic)"
                class="group flex flex-col justify-between p-5 rounded-2xl bg-white border border-gray-100 hover:border-gray-300 text-left shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition duration-200 cursor-pointer min-h-[150px]"
              >
                <div>
                  <div class="flex items-center justify-between mb-2.5">
                    <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-xl group-hover:scale-105 transition-transform">
                      {{ getTopicEmoji(topic.title) }}
                    </span>
                    <span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-gray-600">
                      {{ levelLabels[topic.level] || topic.level }}
                    </span>
                  </div>
                  <h4 class="text-[15px] font-bold text-[#1e2229] leading-snug group-hover:text-[#2b59ff] transition-colors">
                    {{ topic.title }}
                  </h4>
                </div>

                <div class="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between text-[12px] font-bold text-gray-400 group-hover:text-[#2b59ff]">
                  <span>Vào bài học</span>
                  <ChevronRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <p v-if="!filteredTopics.length" class="col-span-full rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
                Chưa có chủ đề nào ở trình độ này.
              </p>
            </div>

            <div v-if="filteredTopics.length > 6" class="text-center pt-2">
              <button
                @click="showAllTopics = !showAllTopics"
                :aria-expanded="showAllTopics"
                class="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[13px] font-bold text-gray-700 transition cursor-pointer"
              >
                <span>{{ showAllTopics ? 'Thu gọn' : `Xem toàn bộ ${filteredTopics.length} chủ đề` }}</span>
                <ChevronRight :class="showAllTopics ? '-rotate-90' : 'rotate-90'" class="w-3.5 h-3.5 transition-transform" />
              </button>
            </div>
          </template>
        </section>

      </div>

      <!-- RIGHT COLUMN: STATS & PROGRESS RAIL (xl:w-[350px] shrink-0) -->
      <div class="w-full xl:w-[350px] shrink-0 space-y-4 xl:sticky xl:top-6">
        
        <!-- 1. Next Lesson Goal Card (Dùng banner gradient nhẹ) -->
        <div class="bg-gradient-to-br from-[#2b59ff] to-[#1d4ed8] rounded-3xl p-6 text-white shadow-sm space-y-3">
          <div class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white">
            <BookOpen class="w-3.5 h-3.5" />
            <span>Mục tiêu tiếp theo</span>
          </div>

          <div>
            <h2 class="text-lg font-bold leading-tight">
              {{ journey.state.value.resume ? 'Tiếp tục bài đang dở' : 'Bắt đầu bài học hôm nay' }}
            </h2>
            <p class="text-xs text-white/90 leading-relaxed mt-1 font-medium">
              {{ nextTopicTitle }}
            </p>
          </div>

          <button
            @click="continueLearning"
            :disabled="journey.loading.value || homeLoading"
            class="bg-white hover:bg-slate-50 transition-colors text-[#1e2026] text-xs font-bold py-2.5 px-5 rounded-full shadow-sm cursor-pointer disabled:opacity-50"
          >
            {{ journey.state.value.resume ? 'Tiếp tục học ngay' : 'Vào học ngay' }}
          </button>
        </div>

        <!-- 2. Level Status Card -->
        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <h3 class="text-lg font-bold text-[#1e2026]">
            Trình độ: {{ levelLabels[userProfile?.target_level] || 'Cơ bản' }}
          </h3>
          <p class="text-xs text-gray-400 font-medium mt-0.5 mb-5">
            Cấp độ mục tiêu hiện tại: {{ userProfile?.target_level || 'Beginner' }}
          </p>

          <!-- Progress Track -->
          <div class="bg-[#f0f4ff] rounded-2xl py-3 px-5 flex items-center gap-4">
            <span class="text-sm font-bold text-[#2d68ff]">1</span>
            <div class="flex-1 bg-blue-100/70 h-2 rounded-full overflow-hidden relative">
              <div
                class="bg-[#2d68ff] h-full rounded-full transition-all duration-300"
                :style="{ width: userLevelPercent + '%' }"
              ></div>
            </div>
            <span class="text-sm font-bold text-blue-300">3</span>
          </div>
        </div>

        <!-- 3. Streak Tracker Cards -->
        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
          <!-- Ongoing streak -->
          <div class="flex items-center justify-between">
            <span class="text-base font-bold text-[#1e2026]">Chuỗi học liên tục</span>
            <span class="bg-[#2036cc] text-white text-xs font-semibold px-4 py-1.5 rounded-full min-w-[70px] text-center">
              {{ dashboard?.streak || 0 }} ngày
            </span>
          </div>

          <!-- Total Practice Count -->
          <div class="flex items-center justify-between">
            <span class="text-base font-bold text-[#1e2026]">Lượt luyện tập hoàn thành</span>
            <span class="bg-[#eef2f9] text-[#2d68ff] text-xs font-semibold px-4 py-1.5 rounded-full min-w-[70px] text-center">
              {{ totalPracticeCount || 0 }} lượt
            </span>
          </div>
        </div>

        <!-- 4. Daily Feedback Card -->
        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <h3 class="text-base font-bold text-[#1e2026] mb-1">Mẹo luyện tập hôm nay</h3>
          <p class="text-xs text-gray-500 font-medium leading-relaxed">
            Luyện phát âm 10–15 phút mỗi ngày với đối chiếu âm vị IPA sẽ giúp não bộ hình thành phản xạ phát âm tự nhiên nhanh gấp 3 lần.
          </p>
        </div>

      </div>

    </div>
  </section>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import { ChevronRight, Loader2, BookOpen } from 'lucide-vue-next';

const ctx = inject('screenContext');
const {
  activeTab, userProfile,
  homeLoading, topics, startTopic, getTopicEmoji, dashboard,
  journey, continueLearning, recommendedTopic, totalPracticeCount
} = ctx;

const selectedTopicLevel = ref('all');
const showAllTopics = ref(false);

const levels = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Beginner', label: 'Cơ bản' },
  { id: 'Intermediate', label: 'Trung cấp' },
  { id: 'Advanced', label: 'Nâng cao' }
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
