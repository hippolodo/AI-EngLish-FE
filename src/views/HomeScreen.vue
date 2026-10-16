<template>
  <section v-if="activeTab === 'home'" class="home-screen pb-20">
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      
      <!-- LEFT / CENTER COLUMN: LEARNING MODES & COURSES (col-span-8) -->
      <div class="xl:col-span-8 space-y-8">
        
        <!-- Section Header -->
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Learning modes</h1>
        </div>

        <!-- 6 Mode Cards Grid (Exactly matching Talkpal AI layout) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          <!-- 1. Chat Mode (Warm Yellow Background with Phone & Chat Bubbles Illustration) -->
          <div
            @click="activeTab = 'chat'"
            class="group cursor-pointer text-left select-none"
          >
            <div class="w-full h-44 sm:h-48 rounded-3xl relative overflow-hidden flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.01] bg-[#fef08a]">
              <!-- Premium Pill Badge -->
              <span class="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-rose-600 font-bold text-[11px] shadow-2xs">
                <Star class="w-3 h-3 fill-rose-600 text-rose-600" />
                <span>Premium</span>
              </span>

              <!-- Illustration: Hand holding smartphone with floating chat bubbles -->
              <svg viewBox="0 0 160 140" class="w-36 h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Phone -->
                <rect x="52" y="20" width="56" height="98" rx="12" fill="#1e293b" />
                <rect x="55" y="23" width="50" height="92" rx="9" fill="#ffffff" />
                <rect x="71" y="27" width="18" height="3" rx="1.5" fill="#cbd5e1" />
                <!-- Chat bubble 1 (Blue) -->
                <rect x="22" y="34" width="46" height="20" rx="10" fill="#93c5fd" />
                <circle cx="34" cy="44" r="2.5" fill="#ffffff" />
                <circle cx="45" cy="44" r="2.5" fill="#ffffff" />
                <circle cx="56" cy="44" r="2.5" fill="#ffffff" />
                <!-- Chat bubble 2 (Coral / Rose) -->
                <rect x="80" y="58" width="50" height="20" rx="10" fill="#f87171" />
                <circle cx="93" cy="68" r="2.5" fill="#ffffff" />
                <circle cx="105" cy="68" r="2.5" fill="#ffffff" />
                <circle cx="117" cy="68" r="2.5" fill="#ffffff" />
                <!-- Chat bubble 3 (Cyan) -->
                <rect x="30" y="84" width="46" height="20" rx="10" fill="#38bdf8" />
                <circle cx="42" cy="94" r="2.5" fill="#ffffff" />
                <circle cx="53" cy="94" r="2.5" fill="#ffffff" />
                <circle cx="64" cy="94" r="2.5" fill="#ffffff" />
              </svg>
            </div>
            <div class="pt-3">
              <h3 class="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">Chat</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">Enhance your language skills by chatting with our AI teacher.</p>
            </div>
          </div>

          <!-- 2. Sentence Mode (Neutral Cool Gray Background with Person Speaking & Waves) -->
          <div
            @click="activeTab = 'speaking'"
            class="group cursor-pointer text-left select-none"
          >
            <div class="w-full h-44 sm:h-48 rounded-3xl relative overflow-hidden flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.01] bg-[#f1f5f9]">
              <span class="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-rose-600 font-bold text-[11px] shadow-2xs">
                <Star class="w-3 h-3 fill-rose-600 text-rose-600" />
                <span>Premium</span>
              </span>

              <!-- Illustration: Man speaking with soundwaves -->
              <svg viewBox="0 0 160 140" class="w-36 h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="80" cy="50" r="22" fill="#334155" />
                <path d="M50 114C50 94 63 84 80 84C97 84 110 94 110 114" fill="#475569" />
                <!-- Glasses -->
                <rect x="68" y="44" width="10" height="7" rx="2" stroke="#94a3b8" stroke-width="2" fill="none" />
                <rect x="82" y="44" width="10" height="7" rx="2" stroke="#94a3b8" stroke-width="2" fill="none" />
                <line x1="78" y1="47" x2="82" y2="47" stroke="#94a3b8" stroke-width="2" />
                <!-- Soundwaves radiating from speech -->
                <path d="M112 48C116 52 116 58 112 62" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" />
                <path d="M120 42C126 49 126 61 120 68" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" />
                <path d="M128 36C136 46 136 64 128 74" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" />
              </svg>
            </div>
            <div class="pt-3">
              <h3 class="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">Sentence Mode</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">Build a solid foundation of your language skills by learning basics.</p>
            </div>
          </div>

          <!-- 3. Word Mode (Vocabulary Decks & Flashcards) -->
          <div
            @click="openReview"
            class="group cursor-pointer text-left select-none"
          >
            <div class="w-full h-44 sm:h-48 rounded-3xl relative overflow-hidden flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.01] bg-[#f1f5f9]">
              <span class="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-rose-600 font-bold text-[11px] shadow-2xs">
                <Star class="w-3 h-3 fill-rose-600 text-rose-600" />
                <span>Premium</span>
              </span>

              <!-- Illustration: 2 Tilted Cards (Apple & Book) -->
              <svg viewBox="0 0 160 140" class="w-36 h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Left card -->
                <g transform="rotate(-8 60 70)">
                  <rect x="25" y="26" width="54" height="76" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5" />
                  <circle cx="52" cy="56" r="14" fill="#fee2e2" />
                  <circle cx="52" cy="58" r="8" fill="#ef4444" />
                  <path d="M52 46C55 42 59 44 60 46" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" />
                  <rect x="36" y="82" width="32" height="5" rx="2.5" fill="#94a3b8" />
                </g>
                <!-- Right card -->
                <g transform="rotate(8 100 70)">
                  <rect x="80" y="26" width="54" height="76" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5" />
                  <circle cx="107" cy="56" r="14" fill="#e0f2fe" />
                  <path d="M99 52L107 55L115 52V64L107 67L99 64Z" fill="#0284c7" />
                  <rect x="91" y="82" width="32" height="5" rx="2.5" fill="#94a3b8" />
                </g>
              </svg>
            </div>
            <div class="pt-3">
              <h3 class="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">Word Mode</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">Learn basic vocabulary with the word decks.</p>
            </div>
          </div>

          <!-- 4. Dialogue Mode (Conversations) -->
          <div
            @click="activeTab = 'chat'"
            class="group cursor-pointer text-left select-none"
          >
            <div class="w-full h-44 sm:h-48 rounded-3xl relative overflow-hidden flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.01] bg-[#f1f5f9]">
              <span class="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-rose-600 font-bold text-[11px] shadow-2xs">
                <Star class="w-3 h-3 fill-rose-600 text-rose-600" />
                <span>Premium</span>
              </span>

              <!-- Illustration: Overlapping Dialogue Bubbles -->
              <svg viewBox="0 0 160 140" class="w-36 h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- White bubble -->
                <rect x="30" y="32" width="65" height="48" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5" />
                <path d="M42 80L38 88L48 80Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5" />
                <rect x="42" y="44" width="40" height="5" rx="2.5" fill="#64748b" />
                <rect x="42" y="55" width="28" height="5" rx="2.5" fill="#94a3b8" />
                <!-- Dark slate bubble -->
                <rect x="68" y="54" width="65" height="48" rx="14" fill="#334155" />
                <path d="M120 102L124 110L114 102Z" fill="#334155" />
                <rect x="80" y="66" width="40" height="5" rx="2.5" fill="#93c5fd" />
                <rect x="80" y="77" width="28" height="5" rx="2.5" fill="#cbd5e1" />
              </svg>
            </div>
            <div class="pt-3">
              <h3 class="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">Dialogue Mode</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">Practice essential daily vocabulary with pre-scripted conversations.</p>
            </div>
          </div>

          <!-- 5. Flashcards (SRS Repetition with Tree & Checkmark) -->
          <div
            @click="openReview"
            class="group cursor-pointer text-left select-none"
          >
            <div class="w-full h-44 sm:h-48 rounded-3xl relative overflow-hidden flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.01] bg-[#f1f5f9]">
              <span class="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-rose-600 font-bold text-[11px] shadow-2xs">
                <Star class="w-3 h-3 fill-rose-600 text-rose-600" />
                <span>Premium</span>
              </span>

              <!-- Illustration: Flashcard with Tree & Checkmark -->
              <svg viewBox="0 0 160 140" class="w-36 h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="46" y="20" width="68" height="100" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5" />
                <!-- Tree -->
                <path d="M80 36C74 36 70 40 70 45C66 46 64 50 65 54C64 59 68 63 73 63H87C92 63 96 59 95 54C96 50 94 46 90 45C90 40 86 36 80 36Z" fill="#10b981" />
                <rect x="78" y="63" width="4" height="12" fill="#78350f" />
                <line x1="58" y1="84" x2="102" y2="84" stroke="#f1f5f9" stroke-width="2" />
                <!-- Cross & Check buttons -->
                <circle cx="66" cy="98" r="8" fill="#fee2e2" />
                <path d="M63 95L69 101M69 95L63 101" stroke="#ef4444" stroke-width="2" stroke-linecap="round" />
                <circle cx="94" cy="98" r="8" fill="#dcfce7" />
                <path d="M90 98L93 101L98 95" stroke="#16a34a" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
            <div class="pt-3">
              <h3 class="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">Flashcards</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">Practice and memorize new vocabulary.</p>
            </div>
          </div>

          <!-- 6. Call Mode (Audio Only Conversation) -->
          <div
            @click="activeTab = 'chat'"
            class="group cursor-pointer text-left select-none"
          >
            <div class="w-full h-44 sm:h-48 rounded-3xl relative overflow-hidden flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.01] bg-[#f1f5f9]">
              <span class="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-rose-600 font-bold text-[11px] shadow-2xs">
                <Star class="w-3 h-3 fill-rose-600 text-rose-600" />
                <span>Premium</span>
              </span>

              <!-- Illustration: Audio Calling with Wave Rings -->
              <svg viewBox="0 0 160 140" class="w-36 h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="55" y="26" width="50" height="88" rx="12" fill="#1e293b" />
                <rect x="59" y="30" width="42" height="80" rx="8" fill="#0f172a" />
                <circle cx="80" cy="64" r="16" fill="#22c55e" />
                <path d="M74 60C74 67 79 72 86 72" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
                <!-- Ripples -->
                <circle cx="80" cy="64" r="28" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4 4" />
                <circle cx="80" cy="64" r="40" stroke="#22c55e" stroke-width="1" opacity="0.5" stroke-dasharray="3 3" />
              </svg>
            </div>
            <div class="pt-3">
              <h3 class="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">Call Mode</h3>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">Audio-only conversation to boost your speaking proficiency.</p>
            </div>
          </div>

        </div>

        <!-- COURSES & LESSONS SECTION -->
        <section class="space-y-4 pt-6 border-t border-slate-100" aria-labelledby="home-courses-title">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 id="home-courses-title" class="text-xl font-bold text-slate-900 tracking-tight">Courses & Topics</h2>
              <p class="text-xs text-slate-500 mt-0.5">Explore structured curricula by proficiency level</p>
            </div>

            <!-- Level Filter Pills -->
            <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0 overflow-x-auto">
              <button
                v-for="lvl in levels"
                :key="lvl.id"
                @click="selectedTopicLevel = lvl.id; showAllTopics = false"
                :class="selectedTopicLevel === lvl.id ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-900 font-medium'"
                class="px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer shrink-0"
              >
                {{ lvl.label }}
              </button>
            </div>
          </div>

          <div v-if="homeLoading" role="status" class="flex items-center justify-center gap-2 py-10 text-sm text-slate-500 bg-white rounded-3xl border border-slate-100">
            <Loader2 class="h-4 w-4 animate-spin text-blue-600" /> Loading courses…
          </div>

          <template v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <button
                v-for="(topic, index) in visibleTopics"
                :key="topic.id"
                @click="startTopic(topic)"
                class="group flex flex-col justify-between p-5 rounded-3xl bg-white border border-slate-100 hover:border-slate-300 text-left shadow-2xs hover:shadow-xs transition duration-200 cursor-pointer min-h-[160px]"
              >
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-2xl group-hover:scale-105 transition-transform" aria-hidden="true">
                      {{ getTopicEmoji(topic.title) }}
                    </span>
                    <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {{ topic.level }}
                    </span>
                  </div>
                  <h4 class="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition">
                    {{ topic.title }}
                  </h4>
                </div>

                <div class="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-slate-700">
                  <span>Start lesson</span>
                  <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <p v-if="!filteredTopics.length" class="col-span-full rounded-3xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">
                No courses available at this level.
              </p>
            </div>

            <div v-if="filteredTopics.length > 6" class="text-center pt-2">
              <button
                @click="showAllTopics = !showAllTopics"
                :aria-expanded="showAllTopics"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                <span>{{ showAllTopics ? 'Show less' : `View all ${filteredTopics.length} courses` }}</span>
                <ChevronRight :class="showAllTopics ? '-rotate-90' : 'rotate-90'" class="w-3.5 h-3.5 transition-transform" />
              </button>
            </div>
          </template>
        </section>

      </div>

      <!-- RIGHT COLUMN: STATS & WIDGETS RAIL (Exactly matching Talkpal AI layout) -->
      <div class="xl:col-span-4 space-y-4 xl:sticky xl:top-6">
        
        <!-- 1. Special Offer Promo Banner (Magenta/Rose Gradient Card) -->
        <div class="rounded-3xl p-6 text-white shadow-xs space-y-3 bg-gradient-to-r from-[#e11d48] to-[#db2777]">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
            <Star class="w-3.5 h-3.5 fill-white text-white" />
            <span>Premium</span>
          </div>
          <div>
            <h3 class="text-xl font-bold leading-tight">Special offer: up to 79% off!</h3>
            <p class="text-xs text-rose-100 mt-1 leading-relaxed">For a limited time TalkAI Premium is on sale.</p>
          </div>
          <button
            @click="openAuthModal"
            class="bg-white text-rose-600 hover:bg-rose-50 font-bold px-5 py-2.5 rounded-full text-xs shadow-xs transition cursor-pointer inline-block mt-2"
          >
            Get premium
          </button>
        </div>

        <!-- 2. Level Card -->
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-3">
          <div>
            <h3 class="text-base font-bold text-slate-900">Level {{ userCurrentLevelNumber }}</h3>
            <p class="text-xs text-slate-500 mt-0.5">Your current level.</p>
          </div>

          <!-- Progress Bar with Level Indicator Track -->
          <div class="flex items-center gap-3 pt-2">
            <span class="text-xs font-bold text-slate-500">{{ userCurrentLevelNumber }}</span>
            <div class="flex-1 h-2 bg-slate-100 rounded-full relative overflow-hidden">
              <div
                class="h-full bg-blue-600 rounded-full transition-all duration-300"
                :style="{ width: userLevelPercent + '%' }"
              ></div>
            </div>
            <span class="text-xs font-bold text-slate-400">{{ userCurrentLevelNumber + 1 }}</span>
          </div>
        </div>

        <!-- 3. Streak Card (Ongoing & Longest Streak) -->
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-slate-900">Ongoing streak</span>
            <span class="bg-[#2563eb] text-white px-3 py-1 rounded-full text-xs font-bold">
              {{ dashboard?.streak || 0 }} days
            </span>
          </div>

          <div class="flex items-center justify-between pt-1 border-t border-slate-50">
            <span class="text-sm font-semibold text-slate-900">Longest streak</span>
            <span class="bg-[#eff6ff] text-[#2563eb] px-3 py-1 rounded-full text-xs font-bold">
              {{ dashboard?.streak || 0 }} days
            </span>
          </div>
        </div>

        <!-- 4. Daily Feedback Card -->
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-2">
          <h3 class="text-base font-bold text-slate-900">Daily feedback</h3>
          <p class="text-xs text-slate-500 leading-relaxed">
            Practice in AI modes and receive personalized feedback to boost your fluency faster.
          </p>
        </div>

      </div>

    </div>
  </section>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import { ChevronRight, Loader2, Star } from 'lucide-vue-next';

const ctx = inject('screenContext');
const {
  activeTab, isAuthenticated, userProfile, openAuthModal,
  homeLoading, topics, startTopic, getTopicEmoji, dashboard
} = ctx;

const selectedTopicLevel = ref('all');
const showAllTopics = ref(false);

const levels = [
  { id: 'all', label: 'All' },
  { id: 'Beginner', label: 'Beginner' },
  { id: 'Intermediate', label: 'Intermediate' },
  { id: 'Advanced', label: 'Advanced' }
];

const openReview = () => {
  ctx.leaveLesson(false);
  ctx.studyDeckId.value = null;
  ctx.studyMode.value = 'flashcard';
  ctx.activeTab.value = 'study';
  void ctx.loadFlashcardsData();
};

const userCurrentLevelNumber = computed(() => {
  if (userProfile.value?.target_level === 'Advanced') return 3;
  if (userProfile.value?.target_level === 'Intermediate') return 2;
  return 1;
});

const userLevelPercent = computed(() => {
  const completed = ctx.journey?.completedCount?.value || 0;
  return Math.min(100, Math.max(15, (completed % 5) * 20 + 20));
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
