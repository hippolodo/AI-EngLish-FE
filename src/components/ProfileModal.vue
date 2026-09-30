<template>
  <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" @click.self="$emit('close')">
    <section class="w-full max-w-md overflow-hidden rounded-t-[28px] bg-slate-50 shadow-2xl sm:rounded-[28px]" role="dialog" aria-modal="true" aria-labelledby="profile-title">
      <header class="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 pb-8 pt-5 text-white">
        <button class="absolute right-4 top-4 rounded-full bg-white/15 p-2 transition hover:bg-white/25" aria-label="Đóng hồ sơ" @click="$emit('close')">
          <X class="h-5 w-5" />
        </button>
        <div class="mb-5 flex items-center gap-2 text-sm font-semibold text-indigo-100"><UserRound class="h-4 w-4" /> Hồ sơ học viên</div>
        <div class="flex items-center gap-4">
          <img :src="avatarUrl" :alt="displayName" class="h-16 w-16 rounded-full border-2 border-white/80 bg-white object-cover p-0.5" />
          <div class="min-w-0">
            <h2 id="profile-title" class="truncate text-xl font-bold">{{ displayName }}</h2>
            <p class="mt-1 truncate text-sm text-indigo-100">{{ user?.email || 'Khách' }}</p>
          </div>
        </div>
      </header>

      <div class="max-h-[65vh] space-y-5 overflow-y-auto p-5">
        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <div class="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><Target class="h-4 w-4 text-indigo-600" /> Trình độ mục tiêu</div>
          <div class="flex items-center gap-2">
            <select v-model="selectedLevel" :disabled="!isAuthenticated || saving" class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-70">
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
            <button v-if="isAuthenticated" :disabled="saving || selectedLevel === user?.target_level" class="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300" @click="saveLevel">
              {{ saving ? 'Đang lưu…' : 'Lưu' }}
            </button>
          </div>
          <p v-if="!isAuthenticated" class="mt-2 text-xs text-slate-500">Đăng nhập để lưu thay đổi trình độ.</p>
          <p v-if="message" class="mt-2 text-xs" :class="saveError ? 'text-rose-600' : 'text-emerald-700'">{{ message }}</p>
          <button v-if="!isAuthenticated" class="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700" @click="$emit('auth')">
            <LogIn class="h-4 w-4" /> Đăng nhập hoặc tạo tài khoản
          </button>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <div class="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><ChartNoAxesColumnIncreasing class="h-4 w-4 text-indigo-600" /> Tổng quan học tập</div>
          <div class="grid grid-cols-3 divide-x divide-slate-100 text-center">
            <div class="px-1"><p class="text-xl font-extrabold text-indigo-700">{{ stats.speaking }}</p><p class="mt-1 text-[11px] text-slate-500">Bài nói</p></div>
            <div class="px-1"><p class="text-xl font-extrabold text-indigo-700">{{ stats.writing }}</p><p class="mt-1 text-[11px] text-slate-500">Bài viết</p></div>
            <div class="px-1"><p class="text-xl font-extrabold text-indigo-700">{{ stats.chat }}</p><p class="mt-1 text-[11px] text-slate-500">Hội thoại</p></div>
          </div>
        </div>

        <button v-if="isAuthenticated" class="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50" @click="$emit('logout')">
          <LogOut class="h-4 w-4" /> Đăng xuất
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { ChartNoAxesColumnIncreasing, LogIn, LogOut, Target, UserRound, X } from 'lucide-vue-next';
import { authService } from '../services/authService';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  user: { type: Object, default: null },
  dashboard: { type: Object, default: null },
  isAuthenticated: { type: Boolean, default: false }
});
const emit = defineEmits(['auth', 'close', 'profile-updated', 'logout']);
const selectedLevel = ref('Intermediate');
const saving = ref(false);
const message = ref('');
const saveError = ref(false);

const displayName = computed(() => props.user?.full_name || props.dashboard?.full_name || 'Học viên AI');
const avatarUrl = computed(() => props.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName.value)}`);
const stats = computed(() => ({
  speaking: props.dashboard?.speaking?.total_sessions || 0,
  writing: props.dashboard?.writing?.total_essays || 0,
  chat: props.dashboard?.chat?.total_conversations || 0
}));

watch(() => [props.isOpen, props.user?.target_level], ([open, level]) => {
  if (open) {
    selectedLevel.value = level || props.dashboard?.target_level || 'Intermediate';
    message.value = '';
  }
});

const saveLevel = async () => {
  saving.value = true;
  message.value = '';
  saveError.value = false;
  try {
    const updatedUser = await authService.updateTargetLevel(selectedLevel.value);
    emit('profile-updated', updatedUser);
    message.value = 'Đã cập nhật trình độ mục tiêu.';
  } catch (error) {
    saveError.value = true;
    message.value = error.response?.data?.detail || 'Không thể cập nhật. Vui lòng thử lại.';
  } finally {
    saving.value = false;
  }
};
</script>
