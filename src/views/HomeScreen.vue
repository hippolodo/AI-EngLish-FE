<template>
  <section v-if="activeTab === 'home'" class="home-screen pb-20">
    <div class="w-full flex flex-col xl:flex-row gap-9 items-start">
      
      <!-- LEFT / CENTER COLUMN: LEARNING MODES & COURSES GRID -->
      <div class="flex-1 min-w-0 space-y-10">
        
        <!-- Header Tiêu đề chính -->
        <div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-[#1f242e] tracking-tight">Practice Modes</h1>
          <p class="text-base sm:text-lg text-[#6b7280] mt-1.5">Choose a skill to sharpen and elevate your English proficiency</p>
        </div>

        <!-- Modes Grid (Ô to, cao, hình to, chữ to rõ) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-7">
          
          <!-- Card 1: Chat -->
          <div
            @click="ctx.navigateTab ? ctx.navigateTab('chat') : (activeTab = 'chat')"
            class="group cursor-pointer flex flex-col select-none"
          >
            <div class="relative w-full h-56 sm:h-64 rounded-3xl bg-[#ffdc69] flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:shadow-lg">
              <!-- Floating Message Bubbles -->
              <div class="absolute top-4 left-8 sm:left-12 bg-white/95 backdrop-blur rounded-xl px-3.5 py-1.5 text-xs font-bold text-gray-700 shadow-xs flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span> Hi there!
              </div>
              <div class="absolute top-12 right-8 sm:right-12 bg-blue-600 text-white rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-xs">
                Let's practice!
              </div>

              <!-- 3D Smartphone & Hand Graphic -->
              <div class="relative flex flex-col items-center scale-110 sm:scale-125">
                <div class="w-18 h-32 bg-[#f8fafc] border-4 border-slate-700 rounded-2xl shadow-xl flex flex-col items-center p-1 relative z-10 rotate-[-8deg]">
                  <div class="w-5 h-1.5 bg-gray-400 rounded-full mb-1"></div>
                  <div class="w-full h-3.5 bg-blue-100 rounded my-0.5"></div>
                  <div class="w-3/4 h-3.5 bg-pink-100 rounded my-0.5 self-start"></div>
                  <div class="w-full h-3.5 bg-blue-100 rounded my-0.5"></div>
                  <div class="mt-auto w-5 h-5 rounded-full bg-slate-200"></div>
                </div>
                <div class="w-24 h-12 bg-[#e2936a] rounded-t-xl -mt-6 border-2 border-[#b56740] shadow-md z-0 rotate-[-4deg]"></div>
              </div>
            </div>
            <div class="mt-4">
              <h2 class="text-xl sm:text-2xl font-bold text-[#1e2229] mb-1.5 group-hover:text-[#2b59ff] transition-colors">Chat</h2>
              <p class="text-sm sm:text-base text-[#64748b] leading-relaxed">Interactive speaking and messaging practice with real-life scenarios or custom topics.</p>
            </div>
          </div>

          <!-- Card 2: Sentence Mode (Luyện phát âm) -->
          <div
            v-if="isAuthenticated"
            @click="ctx.navigateTab('speaking')"
            class="group cursor-pointer flex flex-col select-none"
          >
            <div class="relative w-full h-56 sm:h-64 rounded-3xl bg-[#f2f4f7] flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:shadow-lg">
              <!-- Character Illustration -->
              <div class="w-48 h-48 flex items-center justify-center text-slate-400 scale-110 sm:scale-120">
                <svg class="w-full h-full text-slate-400" fill="none" viewBox="0 0 120 120">
                  <path d="M25 45c-2 2-2 6 0 8M20 40c-4 5-4 13 0 18M15 35c-7 8-7 21 0 28" stroke="#94a3b8" stroke-linecap="round" stroke-width="2.5"></path>
                  <circle cx="70" cy="38" fill="#94a3b8" r="16"></circle>
                  <rect fill="none" height="6" rx="2" stroke="#334155" stroke-width="2" width="12" x="66" y="36"></rect>
                  <path d="M50 85c0-16 10-24 24-24s24 8 24 24v8H50v-8z" fill="#94a3b8"></path>
                  <rect fill="#475569" height="20" rx="3" transform="rotate(-25 42 44)" width="10" x="42" y="44"></rect>
                </svg>
              </div>
            </div>
            <div class="mt-4">
              <h2 class="text-xl sm:text-2xl font-bold text-[#1e2229] mb-1.5 group-hover:text-[#2b59ff] transition-colors">Speaking</h2>
              <p class="text-sm sm:text-base text-[#64748b] leading-relaxed">Phoneme-level IPA scoring, detailed accuracy feedback, and native audio comparison.</p>
            </div>
          </div>

          <!-- Card 3: Word Mode (Flashcard từ vựng) -->
          <div
            @click="openReview"
            class="group cursor-pointer flex flex-col select-none"
          >
            <div class="relative w-full h-56 sm:h-64 rounded-3xl bg-[#f2f4f7] flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:shadow-lg">
              <!-- Cards Illustration (Apple & Book) -->
              <div class="flex items-center justify-center gap-3 scale-110 sm:scale-120">
                <div class="w-20 h-28 bg-white rounded-2xl shadow-md border border-gray-200 transform -rotate-12 flex flex-col items-center justify-center p-2">
                  <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-1.5">
                    <span class="text-base">🍎</span>
                  </div>
                  <span class="text-xs font-bold text-gray-700">Apple</span>
                </div>
                <div class="w-20 h-28 bg-white rounded-2xl shadow-md border border-gray-200 transform rotate-6 flex flex-col items-center justify-center p-2">
                  <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-1.5">
                    <span class="text-base">📖</span>
                  </div>
                  <span class="text-xs font-bold text-gray-700">Book</span>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <h2 class="text-xl sm:text-2xl font-bold text-[#1e2229] mb-1.5 group-hover:text-[#2b59ff] transition-colors">Flashcards</h2>
              <p class="text-sm sm:text-base text-[#64748b] leading-relaxed">Memorize words with 3D flashcards, accurate IPA phonetics, and contextual examples.</p>
            </div>
          </div>

          <!-- Card 4: Writing Mode (Luyện viết) -->
          <div
            v-if="isAuthenticated"
            @click="ctx.navigateTab('writing')"
            class="group cursor-pointer flex flex-col select-none"
          >
            <div class="relative w-full h-56 sm:h-64 rounded-3xl bg-[#f2f4f7] flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:shadow-lg">
              <!-- Speech Bubble & Sound Wave Graphic -->
              <div class="relative w-44 h-32 flex items-center justify-center scale-110 sm:scale-120">
                <div class="w-24 h-20 bg-slate-300 rounded-2xl p-3 flex flex-col justify-around absolute left-3">
                  <div class="w-full h-2 bg-slate-400 rounded-full"></div>
                  <div class="w-3/4 h-2 bg-slate-400 rounded-full"></div>
                </div>
                <div class="w-26 h-22 bg-slate-600 rounded-2xl p-3.5 shadow-lg flex items-center gap-2.5 z-10 absolute right-3">
                  <div class="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center">
                    <svg class="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4"></circle>
                      <path d="M12 14c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4z"></path>
                    </svg>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <div class="w-2 h-3.5 bg-white/70 rounded-full"></div>
                    <div class="w-2 h-6 bg-white rounded-full"></div>
                    <div class="w-2 h-2.5 bg-white/70 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <h2 class="text-xl sm:text-2xl font-bold text-[#1e2229] mb-1.5 group-hover:text-[#2b59ff] transition-colors">Writing</h2>
              <p class="text-sm sm:text-base text-[#64748b] leading-relaxed">Write essays or free-form text with detailed grammar feedback and suggestions.</p>
            </div>
          </div>

          <!-- Card 5: Flashcards / Quiz (Kiểm tra nhanh) -->
          <div
            @click="openQuizMode"
            class="group cursor-pointer flex flex-col select-none"
          >
            <div class="relative w-full h-56 sm:h-64 rounded-3xl bg-[#f2f4f7] flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:shadow-lg">
              <!-- Tablet/Flashcard Illustration with hand -->
              <div class="relative flex items-center justify-center scale-110 sm:scale-120">
                <div class="w-28 h-36 bg-white rounded-2xl shadow-md border border-gray-200 p-2.5 flex flex-col items-center">
                  <div class="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 mb-2.5">
                    <svg class="w-9 h-9 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8 2 6 6 6 9c0 2 1 4 2 5v4h8v-4c1-1 2-3 2-5 0-3-2-7-6-7z"></path>
                      <rect fill="currentColor" height="4" width="2" x="11" y="18"></rect>
                    </svg>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="w-5 h-5 rounded-full border border-green-500 flex items-center justify-center text-xs text-green-500 font-bold">✓</div>
                    <div class="w-5 h-5 rounded-full border border-red-400 flex items-center justify-center text-xs text-red-400 font-bold">✕</div>
                  </div>
                </div>
                <div class="absolute bottom-[-10px] right-2 w-14 h-16 text-slate-400">
                  <svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74c1.21-.81 2-2.18 2-3.74a4.5 4.5 0 0 0-9 0c0 1.56.79 2.93 2 3.74zM16 13h-1v-2a1 1 0 0 0-2 0v2h-2v-4a1 1 0 0 0-2 0v5.5L7.4 13.1a1 1 0 0 0-1.4.1l-.7.7 4.2 4.2c.4.4.9.6 1.4.6h6.1c1.1 0 2-.9 2-2V15c0-1.1-.9-2-2-2z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <h2 class="text-xl sm:text-2xl font-bold text-[#1e2229] mb-1.5 group-hover:text-[#2b59ff] transition-colors">Quiz</h2>
              <p class="text-sm sm:text-base text-[#64748b] leading-relaxed">Assess lesson retention, test grammar comprehension, or create custom topic quizzes.</p>
            </div>
          </div>

          <!-- Card 6: Dictionary Mode (Tra cứu từ điển) -->
          <div
            @click="ctx.navigateTab ? ctx.navigateTab('dictionary') : (activeTab = 'dictionary')"
            class="group cursor-pointer flex flex-col select-none"
          >
            <div class="relative w-full h-56 sm:h-64 rounded-3xl bg-[#f2f4f7] flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:shadow-lg">
              <!-- Dictionary Graphic -->
              <div class="relative flex flex-col items-center scale-110 sm:scale-120">
                <div class="w-28 h-36 bg-white rounded-2xl shadow-md border border-gray-200 p-3 flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="text-xl">📖</span>
                    <span class="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">IPA</span>
                  </div>
                  <div class="space-y-1.5">
                    <div class="w-full h-2.5 bg-slate-200 rounded"></div>
                    <div class="w-3/4 h-2 bg-slate-100 rounded"></div>
                    <div class="w-5/6 h-2 bg-blue-100 rounded"></div>
                  </div>
                  <div class="text-[11px] font-bold text-slate-700 border-t border-slate-100 pt-1">A-Z Vocab</div>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <h2 class="text-xl sm:text-2xl font-bold text-[#1e2229] mb-1.5 group-hover:text-[#2b59ff] transition-colors">Dictionary</h2>
              <p class="text-sm sm:text-base text-[#64748b] leading-relaxed">Instant word lookup, IPA pronunciation, contextual definitions, and practical examples.</p>
            </div>
          </div>

        </div>

      </div>

      <!-- RIGHT COLUMN: STATS & PROGRESS RAIL (xl:w-[380px] shrink-0) -->
      <div class="w-full xl:w-[380px] shrink-0 space-y-5 xl:sticky xl:top-6">
        
        <!-- 1. Next Lesson Goal Card (Dùng banner gradient nhẹ) -->
        <div class="bg-gradient-to-br from-[#2b59ff] to-[#1d4ed8] rounded-3xl p-7 text-white shadow-md shadow-blue-500/20 space-y-4">
          <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-white">
            <BookOpen class="w-4 h-4" />
            <span>Next Goal</span>
          </div>

          <div>
            <h2 class="text-xl sm:text-2xl font-bold leading-tight">
              {{ journey.state.value.resume ? 'Continue Lesson' : "Start Today's Lesson" }}
            </h2>
            <p class="text-sm text-white/90 leading-relaxed mt-1.5 font-medium">
              {{ nextTopicTitle }}
            </p>
          </div>

          <button
            @click="continueLearning"
            :disabled="journey.loading.value || homeLoading"
            class="w-full bg-white hover:bg-slate-50 transition-colors text-[#1e2026] text-sm font-bold py-3.5 px-6 rounded-full shadow-sm cursor-pointer disabled:opacity-50"
          >
            {{ journey.state.value.resume ? 'Continue Now' : 'Start Learning' }}
          </button>
        </div>

        <!-- 2. Level Status Card -->
        <div class="bg-white rounded-3xl p-7 border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3.5">
          <h3 class="text-xl font-bold text-[#1e2026]">
            Level: {{ levelLabels[userProfile?.target_level] || userProfile?.target_level || 'Beginner' }}
          </h3>
          <p class="text-xs sm:text-sm text-gray-500 font-medium">
            Target level: {{ userProfile?.target_level || 'Beginner' }}
          </p>

          <!-- Progress Track -->
          <div class="bg-[#f0f4ff] rounded-2xl py-4 px-6 flex items-center gap-4">
            <span class="text-base font-bold text-[#2d68ff]">Lv.1</span>
            <div class="flex-1 bg-blue-100/70 h-3 rounded-full overflow-hidden relative">
              <div
                class="bg-[#2d68ff] h-full rounded-full transition-all duration-300"
                :style="{ width: userLevelPercent + '%' }"
              ></div>
            </div>
            <span class="text-base font-bold text-blue-300">Lv.3</span>
          </div>
        </div>

        <!-- 3. Streak Tracker Cards -->
        <div class="bg-white rounded-3xl p-7 border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
          <!-- Ongoing streak -->
          <div class="flex items-center justify-between">
            <span class="text-base sm:text-lg font-bold text-[#1e2026]">Daily Streak</span>
            <span class="bg-[#2036cc] text-white text-xs sm:text-sm font-bold px-4.5 py-2 rounded-full min-w-[80px] text-center shadow-xs">
              {{ dashboard?.streak || 0 }} days
            </span>
          </div>

          <!-- Total Practice Count -->
          <div class="flex items-center justify-between pt-2 border-t border-gray-100">
            <span class="text-base sm:text-lg font-bold text-[#1e2026]">Practice Sessions</span>
            <span class="bg-[#eef2f9] text-[#2d68ff] text-xs sm:text-sm font-bold px-4.5 py-2 rounded-full min-w-[80px] text-center border border-blue-100">
              {{ totalPracticeCount || 0 }} sessions
            </span>
          </div>
        </div>

        <!-- 4. Daily Feedback Card -->
        <div class="bg-white rounded-3xl p-7 border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2">
          <h3 class="text-lg font-bold text-[#1e2026]">Daily Practice Tip</h3>
          <p class="text-sm text-gray-600 font-medium leading-relaxed">
            Practicing pronunciation for 10–15 minutes daily with IPA feedback helps your brain build natural speaking reflexes 3x faster.
          </p>
        </div>

      </div>

    </div>
  </section>
</template>

<script setup>
import { computed, inject } from 'vue';
import { BookOpen } from 'lucide-vue-next';

const ctx = inject('screenContext');
const {
  activeTab, userProfile, isAuthenticated,
  homeLoading, topics, dashboard,
  journey, continueLearning, recommendedTopic, totalPracticeCount
} = ctx;

const levelLabels = {
  Beginner: 'Beginner',
  Intermediate: 'Intermediate',
  Advanced: 'Advanced'
};

const nextTopicTitle = computed(() => {
  if (journey.state.value.resume) {
    const found = topics.value?.find(topic => topic.id === journey.state.value.resume.topic_id);
    return found ? `Lesson in "${found.title}"` : 'In-progress lesson';
  }
  return recommendedTopic.value?.title ? `Recommended: "${recommendedTopic.value.title}"` : 'Choose a topic to begin in Lessons';
});

const openReview = () => {
  if (ctx.pushNavState) ctx.pushNavState();
  ctx.leaveLesson(false);
  ctx.studyDeckId.value = null;
  ctx.studyMode.value = 'flashcard';
  ctx.activeTab.value = 'flashcard';
  void ctx.loadFlashcardsData();
};

const openQuizMode = () => {
  if (ctx.pushNavState) ctx.pushNavState();
  ctx.leaveLesson(false);
  ctx.studyMode.value = 'quiz';
  ctx.activeTab.value = 'quiz';
  void ctx.loadQuizzesData();
};

const userLevelPercent = computed(() => {
  const completed = journey.completedCount?.value || 0;
  return Math.min(100, Math.max(25, (completed % 5) * 20 + 20));
});
</script>
