<template>
  <section v-if="activeTab === 'profile'" class="w-full max-w-5xl mx-auto space-y-7 pb-28">
    <header class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          v-if="hasHistory"
          @click="goBack"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs cursor-pointer group"
          title="Back"
        >
          <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
        <div>
          <p class="text-xs sm:text-sm font-bold uppercase tracking-wide text-indigo-600">Account</p>
          <h1 class="mt-1 text-slate-900 text-2xl sm:text-3xl font-extrabold leading-snug">Profile &amp; Settings</h1>
        </div>
      </div>
      <button @click="navigateTab('home')" aria-label="Go to Home" class="rounded-2xl border border-indigo-100 bg-white p-3 text-indigo-600 shadow-2xs hover:bg-indigo-50 transition cursor-pointer"><Home class="h-6 w-6" /></button>
    </header>
    <div class="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 sm:p-7 text-white shadow-xl">
      <div class="flex items-center gap-5">
        <img :src="userAvatarUrl" :alt="userProfile?.full_name || 'Student'" class="h-20 w-20 rounded-2xl bg-white/90 object-cover shadow-md" />
        <div class="min-w-0">
          <h2 class="truncate text-xl sm:text-2xl font-bold">{{ userProfile?.full_name || 'Welcome!' }}</h2>
          <p class="mt-1 break-all text-sm sm:text-base text-indigo-100">{{ userProfile?.email || 'Sign in to save your settings' }}</p>
          <span v-if="isAuthenticated" class="mt-2.5 inline-block rounded-full bg-white/20 px-3.5 py-1 text-xs sm:text-sm font-bold backdrop-blur-xs">{{ levelLabels[userProfile.target_level] }}</span>
        </div>
      </div>
    </div>
    <div v-if="!isAuthenticated" class="space-y-4 rounded-3xl border border-indigo-100 bg-white p-8 text-center shadow-xs">
      <p class="text-base text-slate-600">Save your learning goals, target proficiency, and daily study time.</p>
      <button @click="requireAuthentication" class="w-full rounded-2xl bg-indigo-600 p-4 text-base font-bold text-white shadow-md shadow-indigo-600/20 cursor-pointer">Sign In / Register</button>
    </div>
    <template v-else>
      <div class="grid grid-cols-3 gap-3 sm:gap-4 text-center">
        <div class="rounded-3xl border border-slate-100 bg-white p-5 shadow-2xs"><p class="text-3xl font-black text-indigo-700">{{ journey.completedCount.value }}</p><p class="mt-1.5 text-xs sm:text-sm font-semibold text-slate-500">Completed Lessons</p></div>
        <div class="rounded-3xl border border-slate-100 bg-white p-5 shadow-2xs"><p class="text-3xl font-black text-indigo-700">{{ dashboard?.speaking?.total_sessions || 0 }}</p><p class="mt-1.5 text-xs sm:text-sm font-semibold text-slate-500">Speaking Sessions</p></div>
        <div class="rounded-3xl border border-slate-100 bg-white p-5 shadow-2xs"><p class="text-3xl font-black text-indigo-700">{{ dashboard?.writing?.total_essays || 0 }}</p><p class="mt-1.5 text-xs sm:text-sm font-semibold text-slate-500">Writing Submissions</p></div>
      </div>
      <form @submit.prevent="save" class="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-xs">
        <h2 class="flex items-center gap-2.5 text-base sm:text-lg font-bold text-slate-900"><Settings2 class="h-5 w-5 text-indigo-600" /> Profile &amp; Study Settings</h2>
        <p v-if="journey.loading.value" role="status" class="text-sm text-slate-500">Loading saved settings…</p>
        <fieldset :disabled="saving || journey.loading.value" class="space-y-4 disabled:opacity-60">
          <label class="block text-sm sm:text-base font-bold text-slate-700">Display Name<input v-model="form.full_name" required maxlength="100" autocomplete="name" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 outline-none focus:border-indigo-500 shadow-2xs" /></label>
          <label class="block text-sm sm:text-base font-bold text-slate-700">Email<input :value="userProfile.email" type="email" readonly class="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-100 p-4 text-base text-slate-500" /></label>
          <label class="block text-sm sm:text-base font-bold text-slate-700">Target Level
            <select v-model="form.target_level" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 shadow-2xs"><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select>
          </label>
          <p class="text-xs sm:text-sm leading-relaxed text-slate-500">Select your target level. You can change this at any time as you advance.</p>
          <label class="block text-sm sm:text-base font-bold text-slate-700">Learning Goal
            <select v-model="form.goal" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 shadow-2xs"><option value="communication">Daily Communication</option><option value="work">Business &amp; Work</option><option value="study">Academic &amp; Writing</option></select>
          </label>
          <label class="block text-sm sm:text-base font-bold text-slate-700">Daily Practice Goal
            <select v-model.number="form.daily_minutes" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 shadow-2xs"><option v-for="minute in minuteOptions" :key="minute" :value="minute">{{ minute }} mins / day</option></select>
          </label>
        </fieldset>
        <p v-if="error" role="alert" class="rounded-2xl bg-rose-50 p-4 text-sm sm:text-base text-rose-700">{{ error }}</p>
        <p v-if="message" role="status" class="rounded-2xl bg-emerald-50 p-4 text-sm sm:text-base text-emerald-700">{{ message }}</p>
        <div class="flex gap-3 pt-1">
          <button :disabled="saving || journey.loading.value || !dirty || !valid" class="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 p-4 text-base font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300 shadow-md shadow-indigo-600/20 cursor-pointer"><Loader2 v-if="saving" class="h-5 w-5 animate-spin" /><Save v-else class="h-5 w-5" />{{ saving ? 'Saving…' : 'Save Changes' }}</button>
          <button type="button" @click="reset" :disabled="saving || !dirty" class="rounded-2xl border border-slate-200 px-5 text-base font-bold text-slate-600 disabled:opacity-40 cursor-pointer">Cancel</button>
        </div>
        <p class="text-xs sm:text-sm text-slate-500">These preferences are used to tailor recommendations on your Home screen.</p>
      </form>
      <button @click="logout" :disabled="saving" class="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white p-4 text-base font-bold text-rose-600 disabled:opacity-50 hover:bg-rose-50 cursor-pointer shadow-2xs"><LogOut class="h-5 w-5" />Sign Out</button>
    </template>
  </section>
</template>
<script setup>
import { computed, inject } from 'vue';
import { Home, Settings2, Save, Loader2, LogOut, ArrowLeft } from 'lucide-vue-next';
import { authService } from '../services/authService';
import { useProfileSettings } from '../composables/useProfileSettings';
const ctx = inject('screenContext');
const { activeTab, userProfile, userAvatarUrl, isAuthenticated, journey, dashboard, requireAuthentication, logout, goBack, navigateTab, hasHistory } = ctx;
const { form, saving, message, error, dirty, valid, reset, save } = useProfileSettings(ctx, authService);
const minuteOptions = computed(() => [...new Set([5, 10, 15, 20, 30, 45, 60, form.value.daily_minutes])].sort((a, b) => a - b));
const levelLabels = { Beginner: 'Beginner', Intermediate: 'Intermediate', Advanced: 'Advanced' };
</script>
