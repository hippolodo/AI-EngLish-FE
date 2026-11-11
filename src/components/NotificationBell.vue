<template>
  <div class="relative inline-block" ref="bellContainer">
    <!-- Bell Button -->
    <button
      type="button"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      aria-label="Flashcard study reminders"
      class="relative p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center group"
      :class="isOpen ? 'ring-2 ring-indigo-500/30 border-indigo-300 bg-indigo-50/40 text-indigo-700' : ''"
      title="Spaced repetition study reminders"
    >
      <Bell class="w-5 h-5 transition-transform group-hover:rotate-12 duration-200" />
      
      <!-- Counter Badge -->
      <span
        v-if="remindersData?.total_due > 0"
        class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-black text-white bg-rose-500 rounded-full shadow-sm animate-pulse"
      >
        {{ remindersData.today_count > 0 ? remindersData.today_count : remindersData.total_due }}
      </span>
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="isOpen"
        class="notification-dropdown absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white border border-slate-200/90 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]"
      >
        <!-- Dropdown Header -->
        <div class="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Bell class="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-white tracking-tight">Study Reminders</h3>
              <p class="text-[11px] text-slate-300 font-medium">Spaced Repetition (Today & Tomorrow)</p>
            </div>
          </div>
          <button
            @click="isOpen = false"
            class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Scrollable Notifications List -->
        <div class="overflow-y-auto divide-y divide-slate-100 p-2 space-y-2 flex-1">
          <!-- Empty State -->
          <div v-if="!remindersData?.reminders || remindersData.reminders.length === 0" class="py-10 px-4 text-center space-y-2.5">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
              🎉
            </div>
            <p class="text-sm font-bold text-slate-800">All caught up!</p>
            <p class="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              You have no cards due for review right now. Keep up the great work!
            </p>
          </div>

          <!-- Section: Cần ôn hôm nay -->
          <div v-if="todayReminders.length > 0" class="space-y-1 pt-1">
            <div class="px-3 py-1 flex items-center justify-between">
              <span class="text-[11px] font-black uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                Due Today ({{ todayReminders.length }})
              </span>
              <span class="text-[10px] font-semibold text-slate-400">Ready for review</span>
            </div>

            <div
              v-for="item in todayReminders"
              :key="item.card_id"
              @click="onSelectCard(item)"
              class="group p-3 rounded-2xl hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-200/80 flex items-start justify-between gap-3"
            >
              <div class="min-w-0 flex-1 space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                    {{ item.word }}
                  </span>
                  <span v-if="item.ipa" class="text-xs font-mono text-blue-600 font-semibold truncate">
                    /{{ item.ipa.replace(/^\/+|\/+$/g, '') }}/
                  </span>
                  <span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Level {{ item.box_level }}
                  </span>
                </div>
                <p class="text-xs text-slate-600 line-clamp-1">
                  {{ item.meaning }}
                </p>
              </div>

              <div class="shrink-0 flex items-center gap-1 text-xs font-bold text-rose-600 group-hover:translate-x-0.5 transition">
                <span class="text-[11px]">Review now</span>
                <ChevronRight class="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <!-- Section: Nhắc trước ngày mai -->
          <div v-if="tomorrowReminders.length > 0" class="space-y-1 pt-2">
            <div class="px-3 py-1 flex items-center justify-between">
              <span class="text-[11px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                Upcoming Tomorrow ({{ tomorrowReminders.length }})
              </span>
              <span class="text-[10px] font-semibold text-slate-400">Review early</span>
            </div>

            <div
              v-for="item in tomorrowReminders"
              :key="item.card_id"
              @click="onSelectCard(item)"
              class="group p-3 rounded-2xl hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-200/80 flex items-start justify-between gap-3"
            >
              <div class="min-w-0 flex-1 space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                    {{ item.word }}
                  </span>
                  <span v-if="item.ipa" class="text-xs font-mono text-blue-600 font-semibold truncate">
                    /{{ item.ipa.replace(/^\/+|\/+$/g, '') }}/
                  </span>
                  <span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                    Level {{ item.box_level }}
                  </span>
                </div>
                <p class="text-xs text-slate-600 line-clamp-1">
                  {{ item.meaning }}
                </p>
              </div>

              <div class="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition">
                <span class="text-[11px]">Study early</span>
                <ChevronRight class="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        <!-- Dropdown Footer -->
        <div v-if="remindersData?.total_due > 0" class="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            @click="openDueTab"
            class="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
          >
            <Layers class="w-3.5 h-3.5" />
            <span>Practice all due cards ({{ remindersData.today_count || remindersData.total_due }})</span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import { Bell, ChevronRight, Layers, X } from 'lucide-vue-next';

const ctx = inject('screenContext');
const bellContainer = ref(null);
const isOpen = ref(false);

const remindersData = computed(() => {
  return ctx?.flashcardReminders?.value || { total_due: 0, today_count: 0, tomorrow_count: 0, reminders: [] };
});

const todayReminders = computed(() => {
  return (remindersData.value.reminders || []).filter(r => r.due_type === 'TODAY');
});

const tomorrowReminders = computed(() => {
  return (remindersData.value.reminders || []).filter(r => r.due_type === 'TOMORROW');
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && ctx?.loadFlashcardReminders) {
    ctx.loadFlashcardReminders();
  }
};

const onSelectCard = (item) => {
  isOpen.value = false;
  if (ctx?.pushNavState) ctx.pushNavState();
  if (ctx?.openFlashcardWord) {
    const mode = item.due_type === 'TODAY' ? 'due' : 'all';
    ctx.openFlashcardWord(item.card_id, item.deck_id, mode);
  }
};

const openDueTab = () => {
  isOpen.value = false;
  if (ctx?.pushNavState) ctx.pushNavState();
  if (ctx?.studyDeckId) {
    ctx.studyDeckId.value = null; // Bỏ lọc deck đơn lẻ để xem tất cả thẻ đến hạn
  }
  if (ctx?.currentStudyIndex) {
    ctx.currentStudyIndex.value = 0;
  }
  if (ctx?.isFlipped) {
    ctx.isFlipped.value = false;
  }
  if (ctx?.navigateTab) {
    ctx.navigateTab('flashcard');
  }
  if (ctx?.setFlashcardMode) {
    ctx.setFlashcardMode('due');
  }
  if (ctx?.loadFlashcardsData && ctx?.flashcardMode?.value === 'due') {
    void ctx.loadFlashcardsData();
  }
};

const handleClickOutside = (event) => {
  if (bellContainer.value && !bellContainer.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.notification-dropdown {
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
}
</style>
