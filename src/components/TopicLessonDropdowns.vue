<template>
  <div class="grid grid-cols-1 gap-2.5">
    <div ref="topicRoot" class="relative min-w-0">
      <span class="mb-1.5 block text-[9px] font-extrabold uppercase tracking-[0.14em] text-violet-500">Chủ đề luyện tập</span>
      <button
        type="button"
        :aria-expanded="topicOpen"
        aria-haspopup="listbox"
        aria-label="Chọn chủ đề luyện tập"
        class="flex w-full items-center gap-2.5 rounded-2xl border border-violet-100 bg-gradient-to-r from-white to-violet-50/80 p-2.5 text-left shadow-sm shadow-violet-100/70 transition hover:border-violet-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100"
        @click="topicOpen = !topicOpen; lessonOpen = false"
      >
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <Layers class="h-4 w-4" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-xs font-extrabold text-slate-800">{{ selectedTopic?.title || 'Chọn chủ đề' }}</span>
          <span class="mt-0.5 block truncate text-[10px] font-medium text-slate-400">{{ selectedTopic?.level || 'Khám phá chủ đề học' }}</span>
        </span>
        <ChevronDown :class="topicOpen ? 'rotate-180' : ''" class="h-4 w-4 shrink-0 text-violet-500 transition-transform" />
      </button>

      <Transition name="picker-pop">
        <div v-if="topicOpen" role="listbox" aria-label="Danh sách chủ đề" class="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-violet-100 bg-white/95 p-1.5 shadow-xl shadow-violet-950/10 backdrop-blur-xl">
          <button
            v-for="topic in topics"
            :key="topic.id"
            type="button"
            role="option"
            :aria-selected="topic.id === topicId"
            class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition hover:bg-violet-50"
            :class="topic.id === topicId ? 'bg-violet-50' : ''"
            @click="selectTopic(topic)"
          >
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <BookOpen class="h-3.5 w-3.5" />
            </span>
            <span class="min-w-0 flex-1 truncate text-xs font-bold text-slate-700">{{ topic.title }}</span>
            <span class="shrink-0 rounded-full px-2 py-1 text-[9px] font-bold" :class="levelClass(topic.level)">{{ topic.level }}</span>
            <Check v-if="topic.id === topicId" class="h-3.5 w-3.5 shrink-0 text-violet-600" />
          </button>
          <p v-if="topics.length === 0" class="px-3 py-4 text-center text-xs text-slate-400">Chưa có chủ đề.</p>
        </div>
      </Transition>
    </div>

    <div ref="lessonRoot" class="relative min-w-0">
      <span class="mb-1.5 flex items-center justify-between text-[9px] font-extrabold uppercase tracking-[0.14em] text-emerald-600">
        <span>Bài học</span>
        <span v-if="!loading && lessons.length" class="normal-case tracking-normal text-slate-400">{{ lessons.length }} bài</span>
      </span>
      <button
        type="button"
        :disabled="loading || lessons.length === 0"
        :aria-expanded="lessonOpen"
        aria-haspopup="listbox"
        aria-label="Chọn bài học"
        class="flex w-full items-center gap-2.5 rounded-2xl border border-emerald-100 bg-gradient-to-r from-white to-emerald-50/80 p-2.5 text-left shadow-sm shadow-emerald-100/70 transition hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        @click="lessonOpen = !lessonOpen; topicOpen = false"
      >
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <BookOpen class="h-4 w-4" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-xs font-extrabold text-slate-800">{{ loading ? 'Đang tải bài học...' : selectedLesson?.title || 'Chưa có bài Speaking' }}</span>
          <span class="mt-0.5 block truncate text-[10px] font-medium text-slate-400">{{ selectedLesson ? `Bài ${selectedLesson.order_index || 1}` : 'Bài học thuộc chủ đề đã chọn' }}</span>
        </span>
        <ChevronDown :class="lessonOpen ? 'rotate-180' : ''" class="h-4 w-4 shrink-0 text-emerald-500 transition-transform" />
      </button>

      <Transition name="picker-pop">
        <div v-if="lessonOpen" role="listbox" aria-label="Danh sách bài học" class="absolute left-0 right-0 top-full z-40 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-emerald-100 bg-white/95 p-1.5 shadow-xl shadow-emerald-950/10 backdrop-blur-xl">
          <button
            v-for="(lesson, index) in lessons"
            :key="lesson.id"
            type="button"
            role="option"
            :aria-selected="lesson.id === lessonId"
            class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-emerald-50"
            :class="lesson.id === lessonId ? 'bg-emerald-50' : ''"
            @click="selectLesson(lesson)"
          >
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[10px] font-extrabold text-emerald-700">{{ lesson.order_index || index + 1 }}</span>
            <span class="min-w-0 flex-1 truncate text-xs font-bold text-slate-700">{{ lesson.title }}</span>
            <Check v-if="lesson.id === lessonId" class="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          </button>
          <p v-if="loading" class="px-3 py-4 text-center text-xs text-slate-400">Đang tải bài học...</p>
          <p v-else-if="lessons.length === 0" class="px-3 py-4 text-center text-xs text-slate-400">Chủ đề này chưa có bài Speaking.</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { BookOpen, Check, ChevronDown, Layers } from 'lucide-vue-next';

const props = defineProps({
  topics: { type: Array, default: () => [] },
  lessons: { type: Array, default: () => [] },
  topicId: { type: [Number, String], default: null },
  lessonId: { type: [Number, String], default: null },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['update:topicId', 'update:lessonId', 'topic-change', 'lesson-change']);
const topicOpen = ref(false);
const lessonOpen = ref(false);
const topicRoot = ref(null);
const lessonRoot = ref(null);
const selectedTopic = computed(() => props.topics.find(topic => topic.id === props.topicId));
const selectedLesson = computed(() => props.lessons.find(lesson => lesson.id === props.lessonId));

const levelClass = (level) => ({
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-sky-100 text-sky-700',
  Advanced: 'bg-fuchsia-100 text-fuchsia-700'
}[level] || 'bg-slate-100 text-slate-600');

const selectTopic = (topic) => {
  topicOpen.value = false;
  emit('update:topicId', topic.id);
  emit('topic-change');
};

const selectLesson = (lesson) => {
  lessonOpen.value = false;
  emit('update:lessonId', lesson.id);
  emit('lesson-change');
};

const closeOnOutsideClick = (event) => {
  if (!topicRoot.value?.contains(event.target)) topicOpen.value = false;
  if (!lessonRoot.value?.contains(event.target)) lessonOpen.value = false;
};

onMounted(() => document.addEventListener('click', closeOnOutsideClick));
onBeforeUnmount(() => document.removeEventListener('click', closeOnOutsideClick));
</script>

<style scoped>
.picker-pop-enter-active,
.picker-pop-leave-active {
  transition: opacity 140ms ease, transform 140ms ease;
  transform-origin: top center;
}

.picker-pop-enter-from,
.picker-pop-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}
</style>
