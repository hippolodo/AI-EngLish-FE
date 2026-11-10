<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none"
        role="dialog"
        aria-modal="true"
        aria-label="Daily Streak Details"
      >
        <!-- Modal Card Container -->
        <div
          class="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Ambient Glow Background -->
          <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-amber-400/25 to-orange-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

          <!-- Close Button (Top Right) -->
          <button
            @click="handleClose"
            type="button"
            class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer z-10"
            title="Đóng"
          >
            <X class="w-4 h-4 stroke-[2.5]" />
          </button>

          <!-- Modal Body -->
          <div class="p-6 sm:p-7 text-center space-y-6">
            
            <!-- Animated Flame Avatar & Streak Count -->
            <div class="flex flex-col items-center pt-2">
              <!-- Flame Circle with Ripple -->
              <div class="relative flex items-center justify-center mb-3">
                <div
                  v-if="todayStudied"
                  class="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 opacity-20 animate-ping [animation-duration:2.5s]"
                ></div>
                <div
                  class="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-lg transition-transform duration-300 hover:scale-105"
                  :class="todayStudied
                    ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white shadow-orange-500/30'
                    : 'bg-gradient-to-tr from-slate-100 to-amber-50 border border-amber-200 text-amber-600 shadow-amber-200/50'"
                >
                  <span class="inline-block transition-transform duration-200">🔥</span>
                </div>
              </div>

              <!-- Streak Number & Status -->
              <div class="space-y-1">
                <h3 class="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                  <span>{{ streak }} NGÀY</span>
                  <span class="text-sm font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200/80">
                    Liên tiếp
                  </span>
                </h3>
                <p class="text-sm font-semibold text-slate-600 max-w-xs mx-auto leading-snug">
                  {{ statusMessage }}
                </p>
              </div>
            </div>

            <!-- Weekly Calendar Strip (T2 -> CN) -->
            <div class="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Tuần này
                </span>
                <span class="text-xs font-bold text-amber-700">
                  {{ studiedDaysThisWeek }}/7 ngày đã học
                </span>
              </div>

              <!-- 7 Day Badges Row -->
              <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
                <div
                  v-for="d in weeklyActivity"
                  :key="d.date"
                  class="flex flex-col items-center gap-1.5"
                >
                  <span class="text-[11px] font-bold text-slate-500 uppercase">
                    {{ d.day }}
                  </span>

                  <!-- Day Indicator Node -->
                  <div
                    class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-all shadow-2xs relative"
                    :class="getDayNodeClass(d)"
                    :title="`${d.day_name} (${d.date}): ${d.studied ? 'Đã học' : d.is_today ? 'Hôm nay' : 'Chưa học'}`"
                  >
                    <!-- Flame icon if studied -->
                    <span v-if="d.studied" class="text-sm">🔥</span>
                    <!-- Today dot indicator if not studied yet -->
                    <span
                      v-else-if="d.is_today"
                      class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                    ></span>
                    <!-- Future / Past empty icon -->
                    <span v-else class="text-[10px] text-slate-300 font-bold">·</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stats Highlight Bar -->
            <div class="grid grid-cols-2 gap-3 pt-1">
              <div class="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-left space-y-0.5">
                <span class="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <Trophy class="w-3.5 h-3.5 text-amber-600" />
                  Kỷ lục chuỗi
                </span>
                <p class="text-lg font-black text-slate-900">
                  {{ longestStreak }} <span class="text-xs font-bold text-slate-500">ngày</span>
                </p>
              </div>

              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-left space-y-0.5">
                <span class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Flame class="w-3.5 h-3.5 text-orange-500" />
                  Hôm nay
                </span>
                <p
                  class="text-sm font-bold flex items-center gap-1 pt-0.5"
                  :class="todayStudied ? 'text-emerald-600' : 'text-amber-600'"
                >
                  <CheckCircle2 v-if="todayStudied" class="w-4 h-4 text-emerald-600 shrink-0" />
                  <Clock v-else class="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{{ todayStudied ? 'Đã thắp lửa' : 'Chờ luyện tập' }}</span>
                </p>
              </div>
            </div>

            <!-- Action Button -->
            <div class="pt-2">
              <button
                @click="handleAction"
                type="button"
                class="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-md shadow-blue-500/25 hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>{{ todayStudied ? 'Luyện tập thêm bài mới' : 'Luyện tập ngay để giữ chuỗi 🔥' }}</span>
                <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import {
  X,
  Flame,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  streak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  todayStudied: {
    type: Boolean,
    default: false
  },
  weeklyActivity: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'start-practice']);

const statusMessage = computed(() => {
  if (props.todayStudied) {
    return 'Tuyệt vời! Bạn đã hoàn thành mục tiêu học hôm nay và giữ vững ngọn lửa!';
  }
  if (props.streak > 0) {
    return 'Hôm nay bạn chưa học! Hãy hoàn thành 1 bài luyện nói để không bị mất chuỗi lửa nhé.';
  }
  return 'Hãy bắt đầu thói quen học tiếng Anh mỗi ngày để thắp sáng chuỗi lửa đầu tiên!';
});

const studiedDaysThisWeek = computed(() => {
  return (props.weeklyActivity || []).filter(d => d.studied).length;
});

const getDayNodeClass = (d) => {
  if (d.studied) {
    return 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-xs border border-amber-300';
  }
  if (d.is_today) {
    return 'bg-amber-50 border-2 border-dashed border-amber-400 text-amber-700 ring-4 ring-amber-100';
  }
  if (d.is_future) {
    return 'bg-slate-100/60 border border-slate-200/60 text-slate-300';
  }
  return 'bg-slate-100 border border-slate-200 text-slate-400';
};

const handleClose = () => {
  emit('close');
};

const handleAction = () => {
  emit('close');
  emit('start-practice');
};
</script>
