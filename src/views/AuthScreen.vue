<template>
  <section class="w-full max-w-6xl mx-auto py-6 sm:py-10 px-4 sm:px-6 my-auto">
    <!-- Header with Back to Home -->
    <div class="mb-8 flex items-center justify-between">
      <button
        @click="goBack ? goBack() : navigateTab('home')"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs cursor-pointer group"
      >
        <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Home</span>
      </button>

      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-xs sm:text-sm font-semibold text-slate-500">Online English Learning Platform</span>
      </div>
    </div>

    <!-- Main Dual Column Container -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <!-- Left Column: Branding, Value Props & Feature Highlights (lg:col-span-5) -->
      <div class="lg:col-span-5 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 sm:p-10 text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
        <!-- Background decorative ambient circles -->
        <div class="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-violet-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10 space-y-6">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <svg class="w-10 h-10 text-white shrink-0 drop-shadow" fill="none" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6L20 18L12 30" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4.5"></path>
              <path d="M20 10L26 18L20 26" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4.5"></path>
            </svg>
            <div>
              <h2 class="text-2xl font-black tracking-tight">LingoUp</h2>
              <p class="text-xs text-indigo-200 font-medium">Smart English Learning Platform</p>
            </div>
          </div>

          <!-- Headline -->
          <div class="space-y-2 pt-2">
            <h1 class="text-2xl sm:text-3xl font-extrabold leading-snug">
              {{ isRegister ? 'Start Your English Mastery Journey' : 'Welcome Back!' }}
            </h1>
            <p class="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              {{ isRegister 
                ? 'Create an account to build a personalized study path, save your pronunciation scores, and track your essays.'
                : 'Sign in to resume lessons, practice conversations, and build your daily streak.' }}
            </p>
          </div>

          <!-- Feature Bullets -->
          <div class="space-y-4 pt-4 border-t border-white/15">
            <div class="flex items-start gap-3.5">
              <div class="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <Mic class="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-white">Native IPA Pronunciation Scoring</h4>
                <p class="text-xs text-indigo-200 mt-0.5">Phoneme-level feedback identifying exact pronunciation accuracy with GOP scoring.</p>
              </div>
            </div>

            <div class="flex items-start gap-3.5">
              <div class="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare class="w-4 h-4 text-sky-300" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-white">Interactive Conversations</h4>
                <p class="text-xs text-indigo-200 mt-0.5">Roleplay across 12+ scenarios with instant error analysis and suggestions.</p>
              </div>
            </div>

            <div class="flex items-start gap-3.5">
              <div class="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <PenTool class="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-white">Writing Assistant &amp; Essay Review</h4>
                <p class="text-xs text-indigo-200 mt-0.5">Grammar correction and vocabulary upgrades benchmarked to IELTS standards.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="relative z-10 pt-8 mt-8 border-t border-white/15 text-xs text-indigo-200 flex items-center justify-between">
          <span>Completely Free to Start</span>
          <span class="font-bold text-white">100% Data Privacy</span>
        </div>
      </div>

      <!-- Right Column: Form Container (lg:col-span-7) -->
      <div class="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm flex flex-col justify-between">
        <div class="space-y-6">
          <!-- Tab Navigation Switcher -->
          <div class="flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200/70">
            <button
              type="button"
              @click="setMode(false)"
              :class="!isRegister ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900 font-semibold'"
              class="flex-1 py-3 rounded-xl text-base transition-all text-center cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn class="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              @click="setMode(true)"
              :class="isRegister ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900 font-semibold'"
              class="flex-1 py-3 rounded-xl text-base transition-all text-center cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus class="w-4 h-4" />
              <span>Register</span>
            </button>
          </div>

          <!-- Form Header -->
          <div>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {{ isRegister ? 'Create New Account' : 'Sign in to Your Account' }}
            </h3>
            <p class="text-sm sm:text-base text-slate-500 mt-1.5 leading-relaxed">
              {{ isRegister ? 'Fill in your details below to set up your account and personalize your study plan.' : 'Enter your credentials to continue your practice.' }}
            </p>
          </div>

          <!-- Alert error message -->
          <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm sm:text-base text-rose-700 flex items-start gap-3">
            <AlertCircle class="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div class="flex-1">
              <span class="font-bold block">Error:</span>
              <span>{{ errorMessage }}</span>
            </div>
          </div>

          <!-- Auth Form -->
          <form @submit.prevent="submitAuth" class="space-y-4 sm:space-y-5">
            <!-- Full Name (Register only) -->
            <div v-if="isRegister" class="space-y-1.5">
              <label class="block text-sm sm:text-base font-bold text-slate-700">
                Full Name <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model.trim="fullName"
                  type="text"
                  required
                  maxlength="100"
                  autocomplete="name"
                  placeholder="e.g. Alex Johnson"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 sm:px-5 py-3.5 sm:py-4 text-base sm:text-lg text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition shadow-2xs"
                />
              </div>
            </div>

            <!-- Email -->
            <div class="space-y-1.5">
              <label class="block text-sm sm:text-base font-bold text-slate-700">
                Email Address <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model.trim="email"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="alex@example.com"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 sm:px-5 py-3.5 sm:py-4 text-base sm:text-lg text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition shadow-2xs"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-sm sm:text-base font-bold text-slate-700">
                  Password <span class="text-rose-500">*</span>
                </label>
                <span v-if="isRegister" class="text-xs text-slate-400 font-medium">Minimum 6 characters</span>
              </div>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  :autocomplete="isRegister ? 'new-password' : 'current-password'"
                  :minlength="isRegister ? 6 : undefined"
                  required
                  :placeholder="isRegister ? 'Enter a secure password' : 'Enter your password'"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 sm:px-5 py-3.5 sm:py-4 pr-12 text-base sm:text-lg text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition shadow-2xs"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  tabindex="-1"
                >
                  <Eye v-if="!showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
              <button
                type="submit"
                :disabled="loading"
                class="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] py-4 text-base sm:text-lg font-bold text-white shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
                <Sparkles v-else class="w-5 h-5" />
                <span>{{ loading ? 'Processing...' : isRegister ? 'Register &amp; Personalize' : 'Sign In' }}</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Footer Switch helper -->
        <div class="pt-6 mt-6 border-t border-slate-100 text-center">
          <p class="text-sm sm:text-base text-slate-600">
            {{ isRegister ? 'Already have an account?' : 'New learner without an account?' }}
            <button
              type="button"
              @click="setMode(!isRegister)"
              class="font-bold text-indigo-600 hover:text-indigo-800 ml-1.5 underline cursor-pointer"
            >
              {{ isRegister ? 'Sign in now' : 'Register for free' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, inject } from 'vue';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  MessageSquare,
  Mic,
  PenTool,
  Sparkles,
  UserPlus
} from 'lucide-vue-next';
import { authService } from '../services/authService';

const ctx = inject('screenContext');
const { activeTab, onAuthSuccess, goBack, navigateTab } = ctx;

const isRegister = ref(false);
const fullName = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const setMode = (register) => {
  isRegister.value = register;
  errorMessage.value = '';
};

const submitAuth = async () => {
  if (loading.value) return;
  loading.value = true;
  errorMessage.value = '';

  try {
    if (isRegister.value) {
      if (!fullName.value.trim()) {
        errorMessage.value = 'Please enter your full name.';
        loading.value = false;
        return;
      }
      if (password.value.length < 6) {
        errorMessage.value = 'Password must be at least 6 characters.';
        loading.value = false;
        return;
      }
      await authService.register(email.value.trim(), password.value, fullName.value.trim(), 'Intermediate');
      if (onAuthSuccess) {
        await onAuthSuccess(true); // isNewAccount = true
      }
    } else {
      await authService.login(email.value.trim(), password.value);
      if (onAuthSuccess) {
        await onAuthSuccess(false); // isNewAccount = false
      }
    }
  } catch (error) {
    const detail = error.response?.data?.detail;
    errorMessage.value = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(', ')
      : detail || 'Could not connect to server. Please check your information and try again.';
  } finally {
    loading.value = false;
  }
};
</script>

