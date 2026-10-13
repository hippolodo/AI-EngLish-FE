<template>
  <section v-if="activeTab === 'home'" class="home-screen space-y-6 p-5 pb-24">
    <header class="flex items-center justify-between gap-4">
      <div class="min-w-0">
        <p class="text-sm text-slate-500">{{ isAuthenticated ? 'Chào bạn,' : 'Chào mừng bạn' }}</p>
        <h1 class="mt-1 truncate text-xl font-bold text-slate-900">{{ userProfile?.full_name || 'Học tiếng Anh mỗi ngày' }}</h1>
      </div>
      <button @click="openAuthModal" aria-label="Mở trang cá nhân" class="shrink-0 rounded-full focus-visible:outline-offset-4">
        <img :src="userAvatarUrl" alt="" class="h-11 w-11 rounded-full border border-slate-200 bg-white" />
      </button>
    </header>
    <div v-if="homeError" role="alert" class="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
      {{ homeError }} <button @click="loadHomeData" :disabled="homeLoading" class="font-semibold underline">Thử lại</button>
    </div>
    <LearningHome />
    <section class="space-y-3" aria-labelledby="home-topics-title">
      <div class="flex items-center justify-between gap-3">
        <h2 id="home-topics-title" class="text-base font-semibold text-slate-900">Khám phá chủ đề</h2>
        <select v-model="selectedTopicLevel" @change="showAllTopics = false" aria-label="Lọc chủ đề theo trình độ" class="max-w-[140px] rounded-xl border border-slate-200 bg-white px-2 py-1 text-slate-600">
          <option value="all">Tất cả</option><option value="Beginner">Cơ bản</option><option value="Intermediate">Trung cấp</option><option value="Advanced">Nâng cao</option>
        </select>
      </div>
      <div v-if="homeLoading" role="status" class="flex items-center justify-center gap-2 py-8 text-sm text-slate-500"><Loader2 class="h-4 w-4 animate-spin" /> Đang tải chủ đề…</div>
      <template v-else>
        <div class="grid grid-cols-2 gap-3">
          <button v-for="(topic, index) in visibleTopics" :key="topic.id" @click="startTopic(topic)" :class="topicColors[index % topicColors.length]" class="flex min-w-0 flex-col items-start rounded-2xl border p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 motion-reduce:transform-none">
            <span class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-2xl" aria-hidden="true">{{ getTopicEmoji(topic.title) }}</span>
            <span class="mb-3 block w-full break-words text-sm font-semibold leading-snug text-slate-800">{{ topic.title }}</span>
            <span class="mt-auto flex w-full items-center justify-between gap-1"><span class="rounded-full bg-white/80 px-2 py-1 text-xs text-slate-600">{{ levelLabels[topic.level] || topic.level }}</span><ChevronRight class="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" /></span>
          </button>
          <p v-if="!filteredTopics.length" class="col-span-2 rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">Chưa có chủ đề ở trình độ này.</p>
        </div>
        <button v-if="filteredTopics.length > 4" @click="showAllTopics = !showAllTopics" :aria-expanded="showAllTopics" class="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50">{{ showAllTopics ? 'Thu gọn' : `Xem thêm ${filteredTopics.length - 4} chủ đề` }}</button>
      </template>
    </section>
    <details v-if="dashboard?.recent_activities?.length" class="rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
      <summary class="cursor-pointer py-1 text-sm font-medium text-slate-500">Hoạt động gần đây</summary>
      <div class="mt-2 space-y-2">
        <div v-for="(activity, index) in dashboard.recent_activities.slice(0, 5)" :key="index" class="flex items-center justify-between gap-3 py-2 text-sm"><span class="min-w-0 flex-1 truncate text-slate-600">{{ activity.title }}</span><span v-if="activity.score != null" class="shrink-0 text-xs text-slate-500">{{ Math.round(activity.score) }}đ</span></div>
      </div>
    </details>
  </section>
</template>
<script setup>
import { computed, inject, ref } from 'vue';
import { ChevronRight, Loader2 } from 'lucide-vue-next';
import LearningHome from '../components/LearningHome.vue';
const ctx = inject('screenContext');
const { activeTab, isAuthenticated, userProfile, userAvatarUrl, openAuthModal, homeError, homeLoading, loadHomeData, topics, startTopic, getTopicEmoji, dashboard } = ctx;
const selectedTopicLevel = ref('all');
const showAllTopics = ref(false);
const levelLabels = { Beginner: 'Cơ bản', Intermediate: 'Trung cấp', Advanced: 'Nâng cao' };
const topicColors = ['border-sky-100 bg-sky-50', 'border-amber-100 bg-amber-50', 'border-violet-100 bg-violet-50', 'border-rose-100 bg-rose-50'];
const filteredTopics = computed(() => selectedTopicLevel.value === 'all' ? topics.value : topics.value.filter(topic => topic.level === selectedTopicLevel.value));
const visibleTopics = computed(() => showAllTopics.value ? filteredTopics.value : filteredTopics.value.slice(0, 4));
</script>
