<template>
  <section v-if="activeTab === 'home'" class="home-screen space-y-8 pb-20">
    <!-- Welcome & Hero Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs">
      <div class="space-y-1">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700">
          <Sparkles class="w-3.5 h-3.5" /> Nền tảng học Tiếng Anh AI toàn diện
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {{ isAuthenticated ? `Chào mừng trở lại, ${userProfile?.full_name || 'Học viên'}!` : 'Chào mừng bạn đến với LingoUp AI!' }}
        </h1>
        <p class="text-sm text-slate-500 max-w-2xl">
          Nâng cao khả năng phát âm chuẩn IPA, luyện phản xạ hội thoại thực tế, và trau dồi vốn từ mỗi ngày cùng trợ lý trí tuệ nhân tạo.
        </p>
      </div>

      <!-- Quick Stats Card -->
      <div class="flex items-center gap-3 shrink-0 bg-slate-50 border border-slate-200/60 p-3 rounded-2xl">
        <div class="text-center px-3 py-1">
          <span class="block text-lg font-black text-indigo-600">{{ dashboard?.streak || 0 }}</span>
          <span class="text-[11px] font-semibold text-slate-500">Ngày streak 🔥</span>
        </div>
        <div class="w-px h-8 bg-slate-200"></div>
        <div class="text-center px-3 py-1">
          <span class="block text-lg font-black text-emerald-600">{{ totalPracticeCount || 0 }}</span>
          <span class="text-[11px] font-semibold text-slate-500">Lượt luyện tập</span>
        </div>
      </div>
    </div>

    <!-- Error Alert if any -->
    <div v-if="homeError" role="alert" class="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 flex items-center justify-between">
      <span>{{ homeError }}</span>
      <button @click="loadHomeData" :disabled="homeLoading" class="font-bold underline cursor-pointer">Thử lại</button>
    </div>

    <!-- Main Learning Journey Banner -->
    <LearningHome />

    <!-- 4 Main Feature Cards (Quick Launchers) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <button
        @click="activeTab = 'speaking'"
        class="group flex flex-col justify-between p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition text-left cursor-pointer"
      >
        <div class="space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
            <Mic class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h3 class="font-bold text-slate-900 group-hover:text-emerald-700 transition">Luyện phát âm</h3>
              <span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">GOP AI</span>
            </div>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              Phân tích từng âm vị IPA, chỉ rõ âm đọc đúng/sai và khẩu hình chuẩn.
            </p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
          <span>Luyện ngay</span>
          <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      <button
        @click="activeTab = 'chat'"
        class="group flex flex-col justify-between p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition text-left cursor-pointer"
      >
        <div class="space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
            <MessageSquare class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h3 class="font-bold text-slate-900 group-hover:text-indigo-700 transition">Hội thoại AI</h3>
              <span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800">12+ Chủ đề</span>
            </div>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              Giao tiếp phản xạ theo tình huống thực tế hoặc tự tạo chủ đề theo ý muốn.
            </p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
          <span>Trò chuyện ngay</span>
          <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      <button
        @click="activeTab = 'writing'"
        class="group flex flex-col justify-between p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition text-left cursor-pointer"
      >
        <div class="space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
            <PenTool class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h3 class="font-bold text-slate-900 group-hover:text-purple-700 transition">Luyện viết AI</h3>
              <span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800">Gemini</span>
            </div>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              Viết theo đề bài hoặc tự do, nhận sửa lỗi ngữ pháp, gợi ý từ vựng chuyên sâu.
            </p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
          <span>Tập viết ngay</span>
          <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      <button
        @click="activeTab = 'study'"
        class="group flex flex-col justify-between p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition text-left cursor-pointer"
      >
        <div class="space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
            <BookOpen class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h3 class="font-bold text-slate-900 group-hover:text-amber-700 transition">Flashcard & Quiz</h3>
              <span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">SRS</span>
            </div>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              Học từ vựng qua lặp lại ngắt quãng khoa học và kiểm tra quiz nhanh.
            </p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
          <span>Ôn tập ngay</span>
          <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    </div>

    <!-- Discover Topics Catalog Section -->
    <section class="space-y-4" aria-labelledby="home-topics-title">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 id="home-topics-title" class="text-xl font-bold text-slate-900 tracking-tight">Khám phá chủ đề bài học</h2>
          <p class="text-xs text-slate-500 mt-0.5">Chọn chủ đề phù hợp với mục tiêu và trình độ học tập của bạn</p>
        </div>

        <!-- Level Filter Pills -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0 overflow-x-auto">
          <button
            v-for="lvl in levels"
            :key="lvl.id"
            @click="selectedTopicLevel = lvl.id; showAllTopics = false"
            :class="selectedTopicLevel === lvl.id ? 'bg-white text-indigo-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900 font-semibold'"
            class="px-3 py-1.5 rounded-xl text-xs transition cursor-pointer shrink-0"
          >
            {{ lvl.label }}
          </button>
        </div>
      </div>

      <div v-if="homeLoading" role="status" class="flex items-center justify-center gap-2 py-12 text-sm text-slate-500 bg-white rounded-3xl border border-slate-200/80">
        <Loader2 class="h-5 w-5 animate-spin text-indigo-600" /> Đang tải kho chủ đề…
      </div>

      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <button
            v-for="(topic, index) in visibleTopics"
            :key="topic.id"
            @click="startTopic(topic)"
            :class="topicColors[index % topicColors.length]"
            class="group flex flex-col justify-between p-5 rounded-3xl border text-left shadow-2xs hover:shadow-md transition duration-200 hover:-translate-y-1 cursor-pointer min-h-[170px]"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-2xs text-2xl group-hover:scale-110 transition-transform" aria-hidden="true">
                  {{ getTopicEmoji(topic.title) }}
                </span>
                <span class="rounded-full bg-white/90 border border-slate-200/60 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs">
                  {{ levelLabels[topic.level] || topic.level }}
                </span>
              </div>
              <h4 class="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-700 transition">
                {{ topic.title }}
              </h4>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-200/40 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Bắt đầu bài học</span>
              <ChevronRight class="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </div>
          </button>

          <p v-if="!filteredTopics.length" class="col-span-full rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Chưa có chủ đề ở trình độ này. Vui lòng chọn trình độ khác.
          </p>
        </div>

        <div v-if="filteredTopics.length > 8" class="text-center pt-2">
          <button
            @click="showAllTopics = !showAllTopics"
            :aria-expanded="showAllTopics"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-sm font-bold text-indigo-700 transition cursor-pointer shadow-2xs"
          >
            <span>{{ showAllTopics ? 'Thu gọn danh sách' : `Xem toàn bộ ${filteredTopics.length} chủ đề` }}</span>
            <ChevronRight :class="showAllTopics ? '-rotate-90' : 'rotate-90'" class="w-4 h-4 transition-transform" />
          </button>
        </div>
      </template>
    </section>

    <!-- Recent Activities Details / Card -->
    <div v-if="dashboard?.recent_activities?.length" class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs">
      <h3 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
        <span>⏱️</span> Hoạt động học gần đây
      </h3>
      <div class="divide-y divide-slate-100">
        <div v-for="(activity, index) in dashboard.recent_activities.slice(0, 6)" :key="index" class="flex items-center justify-between gap-3 py-2.5 text-sm">
          <span class="min-w-0 flex-1 truncate font-medium text-slate-700">{{ activity.title }}</span>
          <span v-if="activity.score != null" class="shrink-0 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs">
            {{ Math.round(activity.score) }} điểm
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import { ChevronRight, Loader2, Sparkles, Mic, MessageSquare, PenTool, BookOpen } from 'lucide-vue-next';
import LearningHome from '../components/LearningHome.vue';

const ctx = inject('screenContext');
const {
  activeTab, isAuthenticated, userProfile, userAvatarUrl, openAuthModal,
  homeError, homeLoading, loadHomeData, topics, startTopic, getTopicEmoji, dashboard,
  totalPracticeCount
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

const topicColors = [
  'border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-sky-50/40',
  'border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-amber-50/40',
  'border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-violet-50/40',
  'border-rose-200/80 bg-gradient-to-br from-rose-50 via-white to-rose-50/40',
  'border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40',
  'border-indigo-200/80 bg-gradient-to-br from-indigo-50 via-white to-indigo-50/40'
];

const filteredTopics = computed(() => {
  if (selectedTopicLevel.value === 'all') return topics.value || [];
  return (topics.value || []).filter(topic => topic.level === selectedTopicLevel.value);
});

const visibleTopics = computed(() => {
  if (showAllTopics.value) return filteredTopics.value;
  return filteredTopics.value.slice(0, 8);
});
</script>
