<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div v-if="isAuthenticated" class="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-lg shadow-indigo-500/10 flex flex-col justify-between">
      <div aria-hidden="true" class="pointer-events-none absolute -right-8 -top-10 h-48 w-48 rounded-full border-[24px] border-white/10"></div>
      <div class="relative space-y-4">
        <div class="flex items-center justify-between gap-3">
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-xs"><BookOpen class="h-6 w-6" aria-hidden="true" /></span>
          <span class="rounded-full bg-white/15 backdrop-blur-xs px-3.5 py-1 text-xs font-semibold">{{ journey.state.value.daily_minutes }} phút / ngày</span>
        </div>
        <div>
          <span class="text-xs uppercase tracking-wider font-bold text-indigo-200">Lộ trình học cá nhân hóa</span>
          <h2 class="text-xl sm:text-2xl font-bold mt-1">{{ journey.state.value.resume ? 'Tiếp tục từ nơi bạn dừng' : 'Bắt đầu một bài học' }}</h2>
          <p v-if="nextTopicTitle" class="mt-1.5 text-sm text-indigo-100/90 leading-relaxed max-w-xl">{{ nextTopicTitle }}</p>
        </div>
        <div class="pt-2 flex flex-wrap items-center gap-3">
          <button @click="continueLearning" :disabled="journey.loading.value || homeLoading" class="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 shadow-sm disabled:opacity-50 cursor-pointer">
            <span>{{ journey.state.value.resume ? 'Tiếp tục học ngay' : 'Bắt đầu học ngay' }}</span>
            <ArrowRight class="h-4 w-4" aria-hidden="true" />
          </button>
          <button v-if="!journey.state.value.onboarded" @click="ctx.openAuthModal" class="text-xs font-semibold text-indigo-100 hover:text-white underline underline-offset-4 cursor-pointer">
            Thiết lập mục tiêu học của bạn
          </button>
        </div>
      </div>
    </div>
    <div v-else class="lg:col-span-3 space-y-4 rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-lg shadow-indigo-500/10">
      <div class="flex items-center gap-3">
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-xs"><BookOpen class="h-6 w-6" aria-hidden="true" /></span>
        <div>
          <h2 class="text-xl font-bold">Một chút tiếng Anh mỗi ngày</h2>
          <p class="text-sm text-indigo-100">Chọn chủ đề bên dưới để luyện ngay, hoặc đăng nhập để lưu tiến độ và chuỗi streak.</p>
        </div>
      </div>
      <button @click="ctx.requireAuthentication" class="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50 shadow-sm cursor-pointer">Đăng nhập để bắt đầu</button>
    </div>

    <div v-if="isAuthenticated" class="lg:col-span-1 flex flex-col justify-between rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-50/40 p-6 shadow-xs">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xs text-emerald-600"><Layers class="h-5 w-5" aria-hidden="true" /></span>
          <span class="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">SRS Spaced</span>
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900">Luyện tập từ vựng</h3>
          <p class="mt-1 text-xs text-slate-600 leading-relaxed">Ôn từ vựng đã lưu và thẻ từ bài học bằng phương pháp lặp lại ngắt quãng.</p>
        </div>
      </div>
      <button @click="openReview" class="mt-4 flex w-full items-center justify-between gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3 text-xs font-bold text-white transition shadow-xs cursor-pointer">
        <span>Vào ôn Flashcard</span>
        <ChevronRight class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
<script setup>
import { computed, inject } from 'vue';
import { BookOpen, Layers, ArrowRight, ChevronRight } from 'lucide-vue-next';
const ctx = inject('screenContext');
const { journey, isAuthenticated, homeLoading, continueLearning, recommendedTopic } = ctx;
const nextTopicTitle = computed(() => journey.state.value.resume
  ? ctx.topics.value.find(topic => topic.id === journey.state.value.resume.topic_id)?.title || 'Bài học đang dở'
  : recommendedTopic.value?.title || 'Chọn một chủ đề phù hợp với bạn');
const openReview = () => { ctx.leaveLesson(false); ctx.studyDeckId.value = null; ctx.studyMode.value = 'flashcard'; ctx.activeTab.value = 'study'; void ctx.loadFlashcardsData(); };
</script>
