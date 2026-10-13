<template>
  <section v-if="activeTab === 'profile'" class="space-y-5 p-5 pb-24">
    <header class="flex items-center justify-between">
      <div><p class="text-sm font-semibold uppercase tracking-wide text-indigo-600">Tài khoản</p><h1 class="mt-1 text-slate-900 text-xl font-bold leading-snug">Trang cá nhân</h1></div>
      <button @click="activeTab = 'home'" aria-label="Về trang chủ" class="rounded-xl border border-indigo-100 bg-white p-2 text-indigo-600"><Home class="h-5 w-5" /></button>
    </header>
    <div class="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-lg">
      <div class="flex items-center gap-4">
        <img :src="userAvatarUrl" :alt="userProfile?.full_name || 'Học viên'" class="h-16 w-16 rounded-2xl bg-white/90 object-cover" />
        <div class="min-w-0"><h2 class="truncate text-lg font-semibold">{{ userProfile?.full_name || 'Chào bạn!' }}</h2><p class="mt-1 break-all text-sm text-indigo-100">{{ userProfile?.email || 'Đăng nhập để lưu cài đặt của bạn' }}</p><span v-if="isAuthenticated" class="mt-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{{ levelLabels[userProfile.target_level] }}</span></div>
      </div>
    </div>
    <div v-if="!isAuthenticated" class="space-y-3 rounded-2xl border border-indigo-100 bg-white p-5 text-center">
      <p class="text-sm text-slate-600">Lưu trình độ muốn học, mục tiêu và thời gian học theo tài khoản của bạn.</p>
      <button @click="requireAuthentication" class="w-full rounded-xl bg-indigo-600 p-3 text-sm font-semibold text-white">Đăng nhập / Tạo tài khoản</button>
    </div>
    <template v-else>
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="rounded-2xl border border-slate-100 bg-white p-3"><p class="text-xl font-semibold text-indigo-700">{{ journey.completedCount.value }}</p><p class="mt-1 text-xs text-slate-500">Bài hoàn thành</p></div>
        <div class="rounded-2xl border border-slate-100 bg-white p-3"><p class="text-xl font-semibold text-indigo-700">{{ dashboard?.speaking?.total_sessions || 0 }}</p><p class="mt-1 text-xs text-slate-500">Lượt luyện nói</p></div>
        <div class="rounded-2xl border border-slate-100 bg-white p-3"><p class="text-xl font-semibold text-indigo-700">{{ dashboard?.writing?.total_essays || 0 }}</p><p class="mt-1 text-xs text-slate-500">Bài viết</p></div>
      </div>
      <form @submit.prevent="save" class="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 class="flex items-center gap-2 text-sm font-semibold text-slate-900"><Settings2 class="h-4 w-4 text-indigo-600" /> Thông tin & cài đặt học tập</h2>
        <p v-if="journey.loading.value" role="status" class="text-sm text-slate-500">Đang tải cài đặt đã lưu…</p>
        <fieldset :disabled="saving || journey.loading.value" class="space-y-4 disabled:opacity-60">
          <label class="block text-sm font-semibold text-slate-600">Tên hiển thị<input v-model="form.full_name" required maxlength="100" autocomplete="name" class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-indigo-500" /></label>
          <label class="block text-sm font-semibold text-slate-600">Email<input :value="userProfile.email" type="email" readonly class="mt-2 w-full rounded-xl border border-slate-100 bg-slate-100 p-3 text-sm text-slate-500" /></label>
          <label class="block text-sm font-semibold text-slate-600">Trình độ muốn học
            <select v-model="form.target_level" class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900"><option value="Beginner">Cơ bản — Beginner</option><option value="Intermediate">Trung cấp — Intermediate</option><option value="Advanced">Nâng cao — Advanced</option></select>
          </label>
          <p class="text-xs leading-relaxed text-slate-500">Chọn mức phù hợp với bạn. Đây là lựa chọn học tập, bạn có thể đổi khi bài quá dễ hoặc khó.</p>
          <label class="block text-sm font-semibold text-slate-600">Mục tiêu học
            <select v-model="form.goal" class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900"><option value="communication">Giao tiếp hằng ngày</option><option value="work">Tiếng Anh cho công việc</option><option value="study">Học tập và luyện viết</option></select>
          </label>
          <label class="block text-sm font-semibold text-slate-600">Thời gian dự định mỗi ngày
            <select v-model.number="form.daily_minutes" class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900"><option v-for="minute in minuteOptions" :key="minute" :value="minute">{{ minute }} phút / ngày</option></select>
          </label>
        </fieldset>
        <p v-if="error" role="alert" class="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{{ error }}</p>
        <p v-if="message" role="status" class="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{{ message }}</p>
        <div class="flex gap-2">
          <button :disabled="saving || journey.loading.value || !dirty || !valid" class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 p-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"><Loader2 v-if="saving" class="h-4 w-4 animate-spin" /><Save v-else class="h-4 w-4" />{{ saving ? 'Đang lưu…' : 'Lưu thay đổi' }}</button>
          <button type="button" @click="reset" :disabled="saving || !dirty" class="rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 disabled:opacity-40">Hủy</button>
        </div>
        <p class="text-xs text-slate-500">Các cài đặt này được dùng để gợi ý chủ đề trên Home.</p>
      </form>
      <button @click="logout" :disabled="saving" class="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white p-3 text-sm font-semibold text-rose-600 disabled:opacity-50"><LogOut class="h-4 w-4" />Đăng xuất</button>
    </template>
  </section>
</template>
<script setup>
import { computed, inject } from 'vue';
import { Home, Settings2, Save, Loader2, LogOut } from 'lucide-vue-next';
import { authService } from '../services/authService';
import { useProfileSettings } from '../composables/useProfileSettings';
const ctx = inject('screenContext');
const { activeTab, userProfile, userAvatarUrl, isAuthenticated, journey, dashboard, requireAuthentication, logout } = ctx;
const { form, saving, message, error, dirty, valid, reset, save } = useProfileSettings(ctx, authService);
const minuteOptions = computed(() => [...new Set([5, 10, 15, 20, 30, 45, 60, form.value.daily_minutes])].sort((a, b) => a - b));
const levelLabels = { Beginner: 'Cơ bản', Intermediate: 'Trung cấp', Advanced: 'Nâng cao' };
</script>
