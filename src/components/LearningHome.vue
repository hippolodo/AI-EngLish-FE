<template>
  <div class="space-y-3">
    <div v-if="isAuthenticated" class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-5 text-white shadow-lg shadow-indigo-200/50">
      <div aria-hidden="true" class="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full border-[24px] border-white/10"></div>
      <div class="relative space-y-4">
        <div class="flex items-center justify-between gap-3">
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15"><BookOpen class="h-6 w-6" aria-hidden="true" /></span>
          <span class="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">{{ journey.state.value.daily_minutes }} phút / ngày</span>
        </div>
        <div>
          <h2 class="text-lg font-semibold">{{ journey.state.value.resume ? 'Tiếp tục từ nơi bạn dừng' : 'Bắt đầu một bài học' }}</h2>
          <p v-if="nextTopicTitle" class="mt-1 text-sm text-indigo-100">{{ nextTopicTitle }}</p>
        </div>
        <button @click="continueLearning" :disabled="journey.loading.value || homeLoading" class="flex w-full items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:opacity-50"><span>{{ journey.state.value.resume ? 'Tiếp tục học' : 'Bắt đầu học' }}</span><ArrowRight class="h-4 w-4" aria-hidden="true" /></button>
        <button v-if="!journey.state.value.onboarded" @click="ctx.openAuthModal" class="text-xs font-medium text-indigo-100 underline underline-offset-4">Thiết lập mục tiêu học của bạn</button>
      </div>
    </div>
    <div v-else class="space-y-4 rounded-3xl bg-gradient-to-br from-indigo-700 to-violet-600 p-5 text-white shadow-lg shadow-indigo-200/50">
      <BookOpen class="h-8 w-8 text-indigo-100" aria-hidden="true" />
      <div><h2 class="text-lg font-semibold">Một chút tiếng Anh mỗi ngày</h2><p class="mt-1 text-sm leading-relaxed text-indigo-100">Chọn chủ đề bên dưới, hoặc đăng nhập để lưu tiến độ học.</p></div>
      <button @click="ctx.requireAuthentication" class="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">Đăng nhập để bắt đầu</button>
    </div>
    <button v-if="isAuthenticated" @click="openReview" class="flex w-full items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-left transition hover:bg-emerald-100/70 focus-visible:outline-emerald-600"><span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700"><Layers class="h-5 w-5" aria-hidden="true" /></span><span class="min-w-0 flex-1"><span class="block text-sm font-semibold text-slate-800">Luyện tập từ vựng</span><span class="mt-0.5 block text-xs text-slate-600">Ôn bằng flashcard mỗi ngày</span></span><ChevronRight class="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" /></button>
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
