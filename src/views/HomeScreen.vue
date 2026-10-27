<template>
  <section v-if="activeTab === 'home'" class="home-screen pb-20">
    <div class="w-full flex flex-col xl:flex-row gap-8 items-start">
      
      <!-- LEFT / CENTER COLUMN: BENTO GRID PRACTICE MODES -->
      <div class="flex-1 min-w-0 space-y-8">
        
        <!-- Header Section -->
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles class="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Language Studio</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Practice Modes</h1>
          <p class="text-base text-slate-500 mt-1">Choose an intelligent module to accelerate your English speaking fluency</p>
        </div>

        <!-- Bento Grid Layout -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- FEATURED HERO BENTO: SPEAKING STUDIO (Spans 2 columns) -->
          <div
            v-if="isAuthenticated"
            @click="ctx.navigateTab('speaking')"
            class="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-7 sm:p-8 shadow-xl border border-slate-800 card-spring cursor-pointer group flex flex-col justify-between min-h-[220px]"
          >
            <!-- Glowing background ambient orb -->
            <div class="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

            <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div class="space-y-2 max-w-xl">
                <div class="inline-flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Featured · Speaking Lab</span>
                </div>
                <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-white group-hover:text-blue-300 transition-colors">
                  Pronunciation &amp; Speech Studio
                </h2>
                <p class="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  Phoneme-level IPA scoring with Goodness of Pronunciation (GOP) acoustic evaluation and real-time mouth-position coaching.
                </p>
                <div class="pt-2">
                  <span class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white text-slate-900 font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                    <span>Launch Speaking Studio</span>
                    <ArrowRight class="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>

              <!-- Live Soundwave Animation & Score Preview Capsule -->
              <div class="shrink-0 flex flex-col items-center sm:items-end justify-center gap-3">
                <div class="flex items-center gap-1.5 px-4.5 py-3 rounded-2xl bg-white/10 backdrop-blur-md shadow-inner">
                  <span class="sound-bar" v-for="n in 9" :key="n"></span>
                </div>
                <div class="flex items-center gap-2 text-xs font-mono font-bold text-blue-200 bg-white/10 px-3.5 py-1.5 rounded-xl">
                  <span>/prəˌnʌnsiˈeɪʃn/</span>
                  <span class="text-emerald-400 font-sans font-bold">98% IPA</span>
                </div>
              </div>
            </div>
          </div>

          <!-- BENTO CARD 2: INTERACTIVE AI CHAT TUTOR -->
          <div
            @click="ctx.navigateTab ? ctx.navigateTab('chat') : (activeTab = 'chat')"
            class="bento-card group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-100 flex items-center gap-1.5">
                  <MessageSquare class="w-3.5 h-3.5 text-sky-700" /> AI Conversation
                </span>
                <span class="w-7 h-7 rounded-xl bg-sky-100/70 flex items-center justify-center text-sky-800 group-hover:scale-110 transition-transform">
                  <ArrowRight class="w-4 h-4" />
                </span>
              </div>
              <h2 class="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Interactive Chat Tutor
              </h2>
              <p class="text-sm text-slate-500 mt-1 leading-relaxed">
                Real-time voice and text conversation with contextual phrasing tips and natural speech feedback.
              </p>
            </div>

            <!-- Preview illustration bubble -->
            <div class="mt-5 p-3.5 rounded-2xl bg-slate-100/70 flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                AI
              </div>
              <p class="text-xs text-slate-900 italic truncate font-semibold">
                "Tell me about your plans for this weekend!"
              </p>
            </div>
          </div>

          <!-- BENTO CARD 3: 3D FLASHCARDS -->
          <div
            @click="openReview"
            class="bento-card group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1.5">
                  <Layers class="w-3.5 h-3.5 text-amber-600" /> Spaced Repetition
                </span>
                <span class="w-7 h-7 rounded-xl bg-amber-100/60 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform">
                  <ArrowRight class="w-4 h-4" />
                </span>
              </div>
              <h2 class="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Vocabulary Flashcards
              </h2>
              <p class="text-sm text-slate-500 mt-1 leading-relaxed">
                3D tactile flip cards with accurate IPA phonetics, contextual examples, and personal notebook bookmarks.
              </p>
            </div>

            <!-- Preview cards -->
            <div class="mt-5 p-3.5 rounded-2xl bg-amber-50/80 flex items-center justify-between">
              <span class="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <span>🎴</span> 3D Flip Card System
              </span>
              <span class="text-xs font-mono font-semibold text-amber-700 bg-white px-2 py-0.5 rounded-md border border-amber-200/60">
                /vəˈkæbjələri/
              </span>
            </div>
          </div>

          <!-- BENTO CARD 4: WRITING ASSISTANT -->
          <div
            v-if="isAuthenticated"
            @click="ctx.navigateTab('writing')"
            class="bento-card group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5">
                  <PenLine class="w-3.5 h-3.5 text-indigo-600" /> Guided Writing
                </span>
                <span class="w-7 h-7 rounded-xl bg-indigo-100/60 flex items-center justify-center text-indigo-700 group-hover:scale-110 transition-transform">
                  <ArrowRight class="w-4 h-4" />
                </span>
              </div>
              <h2 class="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Writing Studio
              </h2>
              <p class="text-sm text-slate-500 mt-1 leading-relaxed">
                Draft essays, emails, or paragraphs. Receive instant grammar checks, CEFR rubric scoring, and rewrite suggestions.
              </p>
            </div>

            <!-- Preview snippet -->
            <div class="mt-5 p-3.5 rounded-2xl bg-indigo-50/80 flex items-center justify-between">
              <span class="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" /> Grammar &amp; Rubric
              </span>
              <span class="text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200/60">
                CEFR Scoring
              </span>
            </div>
          </div>

          <!-- BENTO CARD 5: RETENTION QUIZ -->
          <div
            @click="openQuizMode"
            class="bento-card group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1.5">
                  <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" /> Retention Check
                </span>
                <span class="w-7 h-7 rounded-xl bg-emerald-100/60 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform">
                  <ArrowRight class="w-4 h-4" />
                </span>
              </div>
              <h2 class="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Knowledge Quiz
              </h2>
              <p class="text-sm text-slate-500 mt-1 leading-relaxed">
                Test vocabulary and grammar comprehension with immediate or end-of-test answer explanations.
              </p>
            </div>

            <!-- Preview item -->
            <div class="mt-5 p-3.5 rounded-2xl bg-emerald-50/80 flex items-center justify-between">
              <span class="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>🎯</span> Multiple Choice &amp; Fill
              </span>
              <span class="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200/60">
                100% Retain
              </span>
            </div>
          </div>

          <!-- BENTO CARD 6: SMART DICTIONARY -->
          <div
            @click="ctx.navigateTab ? ctx.navigateTab('dictionary') : (activeTab = 'dictionary')"
            class="bento-card group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100 flex items-center gap-1.5">
                  <BookA class="w-3.5 h-3.5 text-sky-600" /> Instant Lookup
                </span>
                <span class="w-7 h-7 rounded-xl bg-sky-100/60 flex items-center justify-center text-sky-700 group-hover:scale-110 transition-transform">
                  <ArrowRight class="w-4 h-4" />
                </span>
              </div>
              <h2 class="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Smart IPA Dictionary
              </h2>
              <p class="text-sm text-slate-500 mt-1 leading-relaxed">
                Instant vocabulary search with native audio pronunciation, contextual definitions, and one-tap flashcard saving.
              </p>
            </div>

            <!-- Preview item -->
            <div class="mt-5 p-3.5 rounded-2xl bg-sky-50/80 flex items-center justify-between">
              <span class="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                <Volume2 class="w-3.5 h-3.5 text-sky-600" /> Native Audio IPA
              </span>
              <span class="text-xs font-bold text-sky-700 bg-white px-2 py-0.5 rounded-md border border-sky-200/60">
                3,000+ Words
              </span>
            </div>
          </div>

        </div>

      </div>

      <!-- RIGHT COLUMN: STATS & PROGRESS RAIL (xl:w-[380px] shrink-0) -->
      <div class="w-full xl:w-[380px] shrink-0 space-y-6 xl:sticky xl:top-6">
        
        <!-- 1. Next Lesson Goal Card (Sleek Gradient Banner) -->
        <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-7 text-white shadow-xl border border-slate-800/80 space-y-4 relative overflow-hidden">
          <div class="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

          <div class="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-white">
            <BookOpen class="w-3.5 h-3.5" />
            <span>Next Milestone</span>
          </div>

          <div>
            <h2 class="text-xl sm:text-2xl font-black leading-tight text-white">
              {{ journey.state.value.resume ? 'Continue Lesson' : "Start Today's Lesson" }}
            </h2>
            <p class="text-sm text-blue-100 leading-relaxed mt-1.5 font-medium">
              {{ nextTopicTitle }}
            </p>
          </div>

          <button
            @click="continueLearning"
            :disabled="journey.loading.value || homeLoading"
            class="btn-spring w-full bg-white hover:bg-slate-50 transition-colors text-slate-900 text-sm font-extrabold py-3.5 px-6 rounded-2xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{{ journey.state.value.resume ? 'Continue Lesson' : 'Start Learning' }}</span>
            <ArrowRight class="w-4 h-4 text-blue-600" />
          </button>
        </div>

        <!-- 2. Level Status Card -->
        <div class="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-3.5">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">
              Proficiency Level
            </h3>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
              {{ levelLabels[userProfile?.target_level] || userProfile?.target_level || 'Beginner' }}
            </span>
          </div>
          <p class="text-xs text-slate-500 font-medium">
            Target CEFR: {{ userProfile?.target_level || 'Beginner' }}
          </p>

          <!-- Progress Track -->
          <div class="bg-slate-100/75 rounded-2xl p-4 space-y-2">
            <div class="flex justify-between text-xs font-bold text-slate-600">
              <span>Progress to next level</span>
              <span class="text-blue-700 font-extrabold">{{ userLevelPercent }}%</span>
            </div>
            <div class="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
              <div
                class="bg-blue-600 h-full rounded-full transition-all duration-500"
                :style="{ width: userLevelPercent + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 3. Streak & Practice Counters -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Daily Streak -->
          <div class="bg-white/90 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span class="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Streak</span>
            <p class="text-2xl font-black text-slate-900 flex items-center gap-1.5">
              <span>🔥</span>
              <AnimateCountingNumber :number="dashboard?.streak || 0" />
            </p>
            <p class="text-xs text-slate-500 font-medium">Days active</p>
          </div>

          <!-- Total Practice Count -->
          <div class="bg-white/90 backdrop-blur-xl rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span class="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Sessions</span>
            <p class="text-2xl font-black text-slate-900 flex items-center gap-1.5">
              <span>⚡</span>
              <AnimateCountingNumber :number="totalPracticeCount || 0" />
            </p>
            <p class="text-xs text-slate-500 font-medium">Completed</p>
          </div>
        </div>

        <!-- 4. Daily Practice Tip -->
        <div class="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
          <div class="flex items-center gap-2 text-indigo-900 font-bold text-sm">
            <span class="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-amber-500 text-sm">💡</span>
            <span>Daily Practice Tip</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Practicing pronunciation for 10–15 minutes daily with IPA feedback helps your brain build natural speaking reflexes 3x faster.
          </p>
        </div>

      </div>

    </div>
  </section>
</template>

<script setup>
import { computed, inject } from 'vue';
import {
  BookOpen, Sparkles, ArrowRight, MessageSquare, Layers,
  PenLine, CheckCircle2, BookA, Volume2
} from 'lucide-vue-next';
import AnimateButton from '../components/ui/Button.vue';
import AnimateCard from '../components/ui/Card.vue';
import AnimateBadge from '../components/ui/Badge.vue';
import AnimateCountingNumber from '../components/ui/CountingNumber.vue';

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
