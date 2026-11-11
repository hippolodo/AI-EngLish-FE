<template>
  <teleport to="body">
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        @click.self="$emit('close')"
      >
        <div
          class="w-full max-w-xl rounded-3xl bg-white border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="recent-activities-title"
        >
          <!-- Modal Header -->
          <div class="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
                <Zap class="w-5 h-5 fill-amber-300 text-amber-300" />
              </div>
              <div>
                <h2 id="recent-activities-title" class="text-lg font-bold text-white tracking-tight">
                  Recent Practice History
                </h2>
                <p class="text-xs text-slate-300 font-medium">
                  Timeline across Speaking, Writing, AI Chat, Quiz &amp; Flashcards
                </p>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition"
              aria-label="Close"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Skill Breakdown Summary Grid -->
          <div class="grid grid-cols-5 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/70 text-center shrink-0 py-3 px-2">
            <div>
              <p class="text-base font-black text-emerald-700">{{ dashboard?.speaking?.total_sessions || 0 }}</p>
              <p class="text-[10px] font-bold text-slate-500 uppercase">Speaking</p>
            </div>
            <div>
              <p class="text-base font-black text-indigo-700">{{ dashboard?.writing?.total_essays || 0 }}</p>
              <p class="text-[10px] font-bold text-slate-500 uppercase">Writing</p>
            </div>
            <div>
              <p class="text-base font-black text-sky-700">{{ dashboard?.chat?.total_conversations || 0 }}</p>
              <p class="text-[10px] font-bold text-slate-500 uppercase">Chat</p>
            </div>
            <div>
              <p class="text-base font-black text-amber-700">{{ dashboard?.quiz?.total_attempts || 0 }}</p>
              <p class="text-[10px] font-bold text-slate-500 uppercase">Quiz</p>
            </div>
            <div>
              <p class="text-base font-black text-purple-700">{{ dashboard?.flashcard?.total_reviews || 0 }}</p>
              <p class="text-[10px] font-bold text-slate-500 uppercase">Cards</p>
            </div>
          </div>

          <!-- Timeline Activities List -->
          <div class="overflow-y-auto p-4 sm:p-6 space-y-3 flex-1 divide-y divide-slate-100">
            <!-- Empty state -->
            <div v-if="!activities || activities.length === 0" class="py-12 text-center space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl">
                ⚡
              </div>
              <p class="text-sm font-bold text-slate-800">No practice sessions yet</p>
              <p class="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Complete your first speaking practice, essay, quiz or flashcard review to start tracking your timeline!
              </p>
            </div>

            <!-- Activity Items -->
            <div
              v-for="(activity, index) in activities"
              :key="index"
              class="pt-3 first:pt-0 flex items-start gap-3.5 group"
            >
              <!-- Icon badge -->
              <div
                class="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5 border"
                :class="getActivityTypeClass(activity.type)"
              >
                <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
              </div>

              <!-- Main details -->
              <div class="min-w-0 flex-1 space-y-0.5">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md" :class="getActivityBadgeClass(activity.type)">
                    {{ getActivityTypeLabel(activity.type) }}
                  </span>
                  <span class="text-[11px] font-medium text-slate-400">
                    {{ formatTimeAgo(activity.created_at) }}
                  </span>
                </div>
                <p class="text-sm font-bold text-slate-900 leading-snug truncate">
                  {{ activity.title }}
                </p>
              </div>

              <!-- Score / Result tag -->
              <div v-if="activity.score !== null && activity.score !== undefined" class="shrink-0 text-right">
                <span class="text-xs font-extrabold px-2 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80">
                  {{ formatScore(activity) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
            <span class="text-xs font-bold text-slate-600">
              Total: {{ totalSessions }} completed sessions
            </span>
            <button
              @click="$emit('close')"
              class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue';
import { X, Zap, Mic, PenTool, MessageSquare, CheckCircle2, Layers } from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  dashboard: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['close']);

const activities = computed(() => {
  return props.dashboard?.recent_activities || [];
});

const totalSessions = computed(() => {
  if (props.dashboard?.total_sessions) return props.dashboard.total_sessions;
  return (
    (props.dashboard?.speaking?.total_sessions || 0) +
    (props.dashboard?.writing?.total_essays || 0) +
    (props.dashboard?.chat?.total_conversations || 0) +
    (props.dashboard?.quiz?.total_attempts || 0) +
    (props.dashboard?.flashcard?.total_reviews || 0)
  );
});

const getActivityTypeLabel = (type) => {
  switch (type) {
    case 'SPEAKING': return 'Speaking';
    case 'WRITING': return 'Writing';
    case 'CHAT': return 'AI Chat';
    case 'QUIZ': return 'Quiz';
    case 'FLASHCARD': return 'Flashcard';
    default: return type || 'Practice';
  }
};

const getActivityIcon = (type) => {
  switch (type) {
    case 'SPEAKING': return Mic;
    case 'WRITING': return PenTool;
    case 'CHAT': return MessageSquare;
    case 'QUIZ': return CheckCircle2;
    case 'FLASHCARD': return Layers;
    default: return Zap;
  }
};

const getActivityTypeClass = (type) => {
  switch (type) {
    case 'SPEAKING': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'WRITING': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    case 'CHAT': return 'bg-sky-50 text-sky-600 border-sky-200';
    case 'QUIZ': return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'FLASHCARD': return 'bg-purple-50 text-purple-600 border-purple-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const getActivityBadgeClass = (type) => {
  switch (type) {
    case 'SPEAKING': return 'bg-emerald-50 text-emerald-700 border border-emerald-200/80';
    case 'WRITING': return 'bg-indigo-50 text-indigo-700 border border-indigo-200/80';
    case 'CHAT': return 'bg-sky-50 text-sky-700 border border-sky-200/80';
    case 'QUIZ': return 'bg-amber-50 text-amber-700 border border-amber-200/80';
    case 'FLASHCARD': return 'bg-purple-50 text-purple-700 border border-purple-200/80';
    default: return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
};

const formatScore = (activity) => {
  if (activity.score === null || activity.score === undefined) return '';
  if (activity.type === 'SPEAKING') return `${Math.round(activity.score)}%`;
  if (activity.type === 'WRITING') return `Score ${activity.score}`;
  if (activity.type === 'CHAT') return `${Math.round(activity.score)} pts`;
  if (activity.type === 'QUIZ') return `${Math.round(activity.score)}%`;
  if (activity.type === 'FLASHCARD') return `${Math.round(activity.score)}%`;
  return String(activity.score);
};

const parseUtcDate = (dateStr) => {
  if (!dateStr) return null;
  // If string does not have timezone specifier (Z or +HH:mm / -HH:mm), it's UTC from backend
  const hasTimezone = /Z|[+-]\d{2}:?\d{2}$/i.test(dateStr);
  const normalized = hasTimezone ? dateStr : `${dateStr}Z`;
  return new Date(normalized);
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = parseUtcDate(dateStr);
  if (!date || isNaN(date.getTime())) return '';
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
</script>
