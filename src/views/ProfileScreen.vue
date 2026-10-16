<template>
  <section v-if="activeTab === 'profile'" class="w-full max-w-5xl mx-auto space-y-7 pb-28">
    <header class="flex items-center justify-between">
      <div>
        <p class="text-xs sm:text-sm font-bold uppercase tracking-wide text-indigo-600">Tài khoản</p>
        <h1 class="mt-1 text-slate-900 text-2xl sm:text-3xl font-extrabold leading-snug">Trang cá nhân</h1>
      </div>
      <button @click="activeTab = 'home'" aria-label="Về trang chủ" class="rounded-2xl border border-indigo-100 bg-white p-3 text-indigo-600 shadow-2xs hover:bg-indigo-50 transition cursor-pointer"><Home class="h-6 w-6" /></button>
    </header>
    <div class="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 sm:p-7 text-white shadow-xl">
      <div class="flex items-center gap-5">
        <img :src="userAvatarUrl" :alt="userProfile?.full_name || 'Học viên'" class="h-20 w-20 rounded-2xl bg-white/90 object-cover shadow-md" />
        <div class="min-w-0">
          <h2 class="truncate text-xl sm:text-2xl font-bold">{{ userProfile?.full_name || 'Chào bạn!' }}</h2>
          <p class="mt-1 break-all text-sm sm:text-base text-indigo-100">{{ userProfile?.email || 'Đăng nhập để lưu cài đặt của bạn' }}</p>
          <span v-if="isAuthenticated" class="mt-2.5 inline-block rounded-full bg-white/20 px-3.5 py-1 text-xs sm:text-sm font-bold backdrop-blur-xs">{{ levelLabels[userProfile.target_level] }}</span>
        </div>
      </div>
    </div>
    <div v-if="!isAuthenticated" class="space-y-4 rounded-3xl border border-indigo-100 bg-white p-8 text-center shadow-xs">
      <p class="text-base text-slate-600">Lưu trình độ muốn học, mục tiêu và thời gian học theo tài khoản của bạn.</p>
      <button @click="requireAuthentication" class="w-full rounded-2xl bg-indigo-600 p-4 text-base font-bold text-white shadow-md shadow-indigo-600/20 cursor-pointer">Đăng nhập / Tạo tài khoản</button>
    </div>
    <template v-else>
      <div class="grid grid-cols-3 gap-3 sm:gap-4 text-center">
        <div class="rounded-3xl border border-slate-100 bg-white p-5 shadow-2xs"><p class="text-3xl font-black text-indigo-700">{{ journey.completedCount.value }}</p><p class="mt-1.5 text-xs sm:text-sm font-semibold text-slate-500">Bài hoàn thành</p></div>
        <div class="rounded-3xl border border-slate-100 bg-white p-5 shadow-2xs"><p class="text-3xl font-black text-indigo-700">{{ dashboard?.speaking?.total_sessions || 0 }}</p><p class="mt-1.5 text-xs sm:text-sm font-semibold text-slate-500">Lượt luyện nói</p></div>
        <div class="rounded-3xl border border-slate-100 bg-white p-5 shadow-2xs"><p class="text-3xl font-black text-indigo-700">{{ dashboard?.writing?.total_essays || 0 }}</p><p class="mt-1.5 text-xs sm:text-sm font-semibold text-slate-500">Bài viết</p></div>
      </div>
      <form @submit.prevent="save" class="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-xs">
        <h2 class="flex items-center gap-2.5 text-base sm:text-lg font-bold text-slate-900"><Settings2 class="h-5 w-5 text-indigo-600" /> Thông tin & cài đặt học tập</h2>
        <p v-if="journey.loading.value" role="status" class="text-sm text-slate-500">Đang tải cài đặt đã lưu…</p>
        <fieldset :disabled="saving || journey.loading.value" class="space-y-4 disabled:opacity-60">
          <label class="block text-sm sm:text-base font-bold text-slate-700">Tên hiển thị<input v-model="form.full_name" required maxlength="100" autocomplete="name" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 outline-none focus:border-indigo-500 shadow-2xs" /></label>
          <label class="block text-sm sm:text-base font-bold text-slate-700">Email<input :value="userProfile.email" type="email" readonly class="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-100 p-4 text-base text-slate-500" /></label>
          <label class="block text-sm sm:text-base font-bold text-slate-700">Trình độ muốn học
            <select v-model="form.target_level" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 shadow-2xs"><option value="Beginner">Cơ bản — Beginner</option><option value="Intermediate">Trung cấp — Intermediate</option><option value="Advanced">Nâng cao — Advanced</option></select>
          </label>
          <p class="text-xs sm:text-sm leading-relaxed text-slate-500">Chọn mức phù hợp với bạn. Đây là lựa chọn học tập, bạn có thể đổi khi bài quá dễ hoặc khó.</p>
          <label class="block text-sm sm:text-base font-bold text-slate-700">Mục tiêu học
            <select v-model="form.goal" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 shadow-2xs"><option value="communication">Giao tiếp hằng ngày</option><option value="work">Tiếng Anh cho công việc</option><option value="study">Học tập và luyện viết</option></select>
          </label>
          <label class="block text-sm sm:text-base font-bold text-slate-700">Thời gian dự định mỗi ngày
            <select v-model.number="form.daily_minutes" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 shadow-2xs"><option v-for="minute in minuteOptions" :key="minute" :value="minute">{{ minute }} phút / ngày</option></select>
          </label>
        </fieldset>
        <p v-if="error" role="alert" class="rounded-2xl bg-rose-50 p-4 text-sm sm:text-base text-rose-700">{{ error }}</p>
        <p v-if="message" role="status" class="rounded-2xl bg-emerald-50 p-4 text-sm sm:text-base text-emerald-700">{{ message }}</p>
        <div class="flex gap-3 pt-1">
          <button :disabled="saving || journey.loading.value || !dirty || !valid" class="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 p-4 text-base font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300 shadow-md shadow-indigo-600/20 cursor-pointer"><Loader2 v-if="saving" class="h-5 w-5 animate-spin" /><Save v-else class="h-5 w-5" />{{ saving ? 'Đang lưu…' : 'Lưu thay đổi' }}</button>
          <button type="button" @click="reset" :disabled="saving || !dirty" class="rounded-2xl border border-slate-200 px-5 text-base font-bold text-slate-600 disabled:opacity-40 cursor-pointer">Hủy</button>
        </div>
        <p class="text-xs sm:text-sm text-slate-500">Các cài đặt này được dùng để gợi ý chủ đề trên Home.</p>
      </form>
      <button @click="logout" :disabled="saving" class="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white p-4 text-base font-bold text-rose-600 disabled:opacity-50 hover:bg-rose-50 cursor-pointer shadow-2xs"><LogOut class="h-5 w-5" />Đăng xuất</button>
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
