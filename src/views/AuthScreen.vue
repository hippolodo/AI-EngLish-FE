<template>
  <section v-if="activeTab === 'auth'" class="w-full max-w-6xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
    <!-- Header with Back to Home -->
    <div class="mb-8 flex items-center justify-between">
      <button
        @click="activeTab = 'home'"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition shadow-2xs cursor-pointer"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Về trang chủ</span>
      </button>

      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-xs sm:text-sm font-semibold text-slate-500">Hệ thống học tiếng Anh AI trực tuyến</span>
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
            <div class="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-xl shadow-inner">
              <Sparkles class="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 class="text-2xl font-black tracking-tight">AI English Hub</h2>
              <p class="text-xs text-indigo-200 font-medium">TalkPal Style Learning Platform</p>
            </div>
          </div>

          <!-- Headline -->
          <div class="space-y-2 pt-2">
            <h1 class="text-2xl sm:text-3xl font-extrabold leading-snug">
              {{ isRegister ? 'Bắt đầu hành trình làm chủ tiếng Anh cùng AI' : 'Chào mừng bạn quay trở lại luyện tập!' }}
            </h1>
            <p class="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              {{ isRegister 
                ? 'Đăng ký tài khoản để AI thiết lập lộ trình học cá nhân hóa, lưu giữ điểm phát âm và bài viết của bạn.'
                : 'Đăng nhập để tiếp tục các bài học dở dang, luyện phản xạ với Emma và tích lũy streak mỗi ngày.' }}
            </p>
          </div>

          <!-- Feature Bullets -->
          <div class="space-y-4 pt-4 border-t border-white/15">
            <div class="flex items-start gap-3.5">
              <div class="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <Mic class="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-white">Chấm phát âm chuẩn IPA</h4>
                <p class="text-xs text-indigo-200 mt-0.5">Phân tích từng âm vị, chỉ rõ từ đọc đúng hay sai bằng công nghệ GOP.</p>
              </div>
            </div>

            <div class="flex items-start gap-3.5">
              <div class="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare class="w-4 h-4 text-sky-300" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-white">Hội thoại phản xạ TalkPal</h4>
                <p class="text-xs text-indigo-200 mt-0.5">Đóng vai theo 12+ tình huống và nhận phân tích lỗi sai trong thời gian thực.</p>
              </div>
            </div>

            <div class="flex items-start gap-3.5">
              <div class="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <PenTool class="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-white">Trợ lý viết & Chữa luận AI</h4>
                <p class="text-xs text-indigo-200 mt-0.5">Sửa lỗi ngữ pháp, nâng cấp từ vựng học thuật theo tiêu chuẩn IELTS.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="relative z-10 pt-8 mt-8 border-t border-white/15 text-xs text-indigo-200 flex items-center justify-between">
          <span>Hoàn toàn miễn phí trải nghiệm</span>
          <span class="font-bold text-white">100% Bảo mật dữ liệu</span>
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
              <span>Đăng nhập</span>
            </button>
            <button
              type="button"
              @click="setMode(true)"
              :class="isRegister ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900 font-semibold'"
              class="flex-1 py-3 rounded-xl text-base transition-all text-center cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus class="w-4 h-4" />
              <span>Đăng ký mới</span>
            </button>
          </div>

          <!-- Form Header -->
          <div>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {{ isRegister ? 'Tạo tài khoản học viên mới' : 'Đăng nhập vào tài khoản' }}
            </h3>
            <p class="text-sm sm:text-base text-slate-500 mt-1.5 leading-relaxed">
              {{ isRegister ? 'Điền thông tin bên dưới để tạo tài khoản và làm khảo sát thiết lập lộ trình.' : 'Nhập thông tin tài khoản của bạn để tiếp tục luyện tập.' }}
            </p>
          </div>

          <!-- Alert error message -->
          <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm sm:text-base text-rose-700 flex items-start gap-3">
            <AlertCircle class="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div class="flex-1">
              <span class="font-bold block">Thông báo lỗi:</span>
              <span>{{ errorMessage }}</span>
            </div>
          </div>

          <!-- Auth Form -->
          <form @submit.prevent="submitAuth" class="space-y-4 sm:space-y-5">
            <!-- Full Name (Register only) -->
            <div v-if="isRegister" class="space-y-1.5">
              <label class="block text-sm sm:text-base font-bold text-slate-700">
                Họ và tên của bạn <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model.trim="fullName"
                  type="text"
                  required
                  maxlength="100"
                  autocomplete="name"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 sm:px-5 py-3.5 sm:py-4 text-base sm:text-lg text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition shadow-2xs"
                />
              </div>
            </div>

            <!-- Email -->
            <div class="space-y-1.5">
              <label class="block text-sm sm:text-base font-bold text-slate-700">
                Địa chỉ Email <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model.trim="email"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="ban@example.com"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 sm:px-5 py-3.5 sm:py-4 text-base sm:text-lg text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition shadow-2xs"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-sm sm:text-base font-bold text-slate-700">
                  Mật khẩu <span class="text-rose-500">*</span>
                </label>
                <span v-if="isRegister" class="text-xs text-slate-400 font-medium">Tối thiểu 6 ký tự</span>
              </div>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  :autocomplete="isRegister ? 'new-password' : 'current-password'"
                  :minlength="isRegister ? 6 : undefined"
                  required
                  :placeholder="isRegister ? 'Nhập mật khẩu an toàn' : 'Nhập mật khẩu của bạn'"
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
                <span>{{ loading ? 'Đang xử lý...' : isRegister ? 'Đăng ký & Bắt đầu khảo sát' : 'Đăng nhập vào hệ thống' }}</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Footer Switch helper -->
        <div class="pt-6 mt-6 border-t border-slate-100 text-center">
          <p class="text-sm sm:text-base text-slate-600">
            {{ isRegister ? 'Bạn đã có tài khoản rồi?' : 'Bạn là học viên mới chưa có tài khoản?' }}
            <button
              type="button"
              @click="setMode(!isRegister)"
              class="font-bold text-indigo-600 hover:text-indigo-800 ml-1.5 underline cursor-pointer"
            >
              {{ isRegister ? 'Đăng nhập ngay' : 'Đăng ký miễn phí' }}
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
const { activeTab, onAuthSuccess } = ctx;

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
        errorMessage.value = 'Vui lòng nhập họ và tên của bạn.';
        loading.value = false;
        return;
      }
      if (password.value.length < 6) {
        errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự.';
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
      : detail || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại thông tin và thử lại sau.';
  } finally {
    loading.value = false;
  }
};
</script>
