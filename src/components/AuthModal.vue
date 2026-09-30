<template>
  <div v-if="isOpen" class="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" @click.self="$emit('close')">
    <section class="w-full max-w-md rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px]" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div class="mb-5 flex items-start justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-indigo-600">AI English Learning</p>
          <h2 id="auth-title" class="mt-1 text-2xl font-extrabold text-slate-900">{{ isRegister ? 'Tạo tài khoản' : 'Chào mừng trở lại' }}</h2>
          <p class="mt-1 text-sm text-slate-500">{{ isRegister ? 'Đăng ký để lưu tiến độ học tập của bạn.' : 'Đăng nhập để tiếp tục học tập.' }}</p>
        </div>
        <button class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Đóng" @click="$emit('close')"><X class="h-5 w-5" /></button>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <label v-if="isRegister" class="block space-y-1.5">
          <span class="text-xs font-semibold text-slate-700">Họ và tên</span>
          <input v-model.trim="fullName" autocomplete="name" required maxlength="100" class="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="Nguyễn Văn An" />
        </label>
        <label class="block space-y-1.5">
          <span class="text-xs font-semibold text-slate-700">Email</span>
          <input v-model.trim="email" type="email" autocomplete="email" required class="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="ban@example.com" />
        </label>
        <label class="block space-y-1.5">
          <span class="text-xs font-semibold text-slate-700">Mật khẩu</span>
          <input v-model="password" type="password" :autocomplete="isRegister ? 'new-password' : 'current-password'" :minlength="isRegister ? 8 : undefined" required class="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" :placeholder="isRegister ? 'Ít nhất 8 ký tự' : 'Nhập mật khẩu'" />
        </label>
        <label v-if="isRegister" class="block space-y-1.5">
          <span class="text-xs font-semibold text-slate-700">Trình độ mục tiêu</span>
          <select v-model="targetLevel" class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
        </label>

        <p v-if="errorMessage" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{{ errorMessage }}</p>
        <button :disabled="loading" class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">
          <LoaderCircle v-if="loading" class="h-4 w-4 animate-spin" />
          {{ loading ? 'Đang xử lý…' : isRegister ? 'Đăng ký' : 'Đăng nhập' }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-slate-500">
        {{ isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?' }}
        <button class="font-bold text-indigo-600 hover:text-indigo-800" @click="toggleMode">{{ isRegister ? 'Đăng nhập' : 'Tạo tài khoản' }}</button>
      </p>
    </section>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { LoaderCircle, X } from 'lucide-vue-next';
import { authService } from '../services/authService';

const props = defineProps({ isOpen: { type: Boolean, default: false } });
const emit = defineEmits(['close', 'auth-success']);
const isRegister = ref(false);
const fullName = ref('');
const email = ref('');
const password = ref('');
const targetLevel = ref('Intermediate');
const loading = ref(false);
const errorMessage = ref('');

watch(() => props.isOpen, (open) => {
  if (open) errorMessage.value = '';
});

const toggleMode = () => {
  isRegister.value = !isRegister.value;
  errorMessage.value = '';
};

const submit = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    if (isRegister.value) {
      await authService.register(email.value, password.value, fullName.value, targetLevel.value);
    } else {
      await authService.login(email.value, password.value);
    }
    emit('auth-success');
  } catch (error) {
    const detail = error.response?.data?.detail;
    errorMessage.value = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(', ')
      : detail || 'Không thể kết nối máy chủ. Hãy kiểm tra backend rồi thử lại.';
  } finally {
    loading.value = false;
  }
};
</script>
