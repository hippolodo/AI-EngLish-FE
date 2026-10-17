<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
  >
    <div
      class="bg-white w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header with Step Progress Bar -->
      <div class="px-6 py-5 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/80 border-b border-slate-100">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-xs">
              <Sparkles class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 leading-tight">Khảo sát thiết lập lộ trình AI</h2>
              <p class="text-xs text-slate-500">Cá nhân hóa trải nghiệm học theo mục tiêu của bạn</p>
            </div>
          </div>

          <div class="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
            Bước {{ currentStep }} / 3
          </div>
        </div>

        <!-- Progress Indicator Bar -->
        <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            class="bg-gradient-to-r from-indigo-600 to-violet-600 h-full transition-all duration-300"
            :style="{ width: `${(currentStep / 3) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Survey Body (Scrollable) -->
      <div class="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
        <!-- STEP 1: Target Level -->
        <div v-if="currentStep === 1" class="space-y-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Bước 1: Trình độ</span>
            <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">Trình độ mục tiêu bạn muốn hướng tới?</h3>
            <p class="text-sm text-slate-500 mt-1">AI sẽ tinh chỉnh bài nghe, từ vựng và câu nói phù hợp với bạn.</p>
          </div>

          <div class="space-y-3 pt-2">
            <button
              v-for="level in LEVEL_OPTIONS"
              :key="level.id"
              type="button"
              @click="selectedLevel = level.id"
              class="w-full p-4.5 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer"
              :class="selectedLevel === level.id 
                ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs' 
                : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/60'"
            >
              <span class="text-2xl p-2 rounded-xl bg-white shadow-2xs border border-slate-100 shrink-0">{{ level.emoji }}</span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h4 class="text-base sm:text-lg font-bold text-slate-900">{{ level.title }}</h4>
                  <span v-if="level.recommended" class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Khuyên dùng</span>
                </div>
                <p class="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{{ level.desc }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- STEP 2: Primary Goal -->
        <div v-else-if="currentStep === 2" class="space-y-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Bước 2: Mục tiêu chính</span>
            <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">Bạn muốn cải thiện tiếng Anh để làm gì?</h3>
            <p class="text-sm text-slate-500 mt-1">AI sẽ ưu tiên các chủ đề hội thoại và bài học phục vụ đúng nhu cầu này.</p>
          </div>

          <div class="space-y-3 pt-2">
            <button
              v-for="goal in GOAL_OPTIONS"
              :key="goal.id"
              type="button"
              @click="selectedGoal = goal.id"
              class="w-full p-4.5 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer"
              :class="selectedGoal === goal.id 
                ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs' 
                : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/60'"
            >
              <span class="text-2xl p-2 rounded-xl bg-white shadow-2xs border border-slate-100 shrink-0">{{ goal.emoji }}</span>
              <div class="flex-1 min-w-0">
                <h4 class="text-base sm:text-lg font-bold text-slate-900">{{ goal.title }}</h4>
                <p class="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{{ goal.desc }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- STEP 3: Daily Commitment -->
        <div v-else class="space-y-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Bước 3: Thời gian mỗi ngày</span>
            <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">Mỗi ngày bạn muốn dành bao nhiêu thời gian?</h3>
            <p class="text-sm text-slate-500 mt-1">Học đều đặn mỗi ngày một chút hiệu quả hơn học dồn dập vào cuối tuần.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <button
              v-for="time in TIME_OPTIONS"
              :key="time.minutes"
              type="button"
              @click="selectedMinutes = time.minutes"
              class="p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer"
              :class="selectedMinutes === time.minutes 
                ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs' 
                : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/60'"
            >
              <div class="flex items-center justify-between">
                <span class="text-2xl">{{ time.emoji }}</span>
                <span v-if="time.recommended" class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Khuyên dùng</span>
              </div>
              <div class="mt-3">
                <h4 class="text-base font-bold text-slate-900">{{ time.title }}</h4>
                <p class="text-xs text-slate-500 mt-0.5">{{ time.desc }}</p>
              </div>
            </button>
          </div>

          <!-- Quick Recap Badge -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-600 space-y-1 mt-4">
            <p class="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 class="w-4 h-4 text-emerald-600" /> Tóm tắt hồ sơ học tập:
            </p>
            <p>• Trình độ: <strong class="text-indigo-600">{{ getLevelLabel(selectedLevel) }}</strong></p>
            <p>• Mục tiêu: <strong class="text-indigo-600">{{ getGoalLabel(selectedGoal) }}</strong></p>
            <p>• Thời gian: <strong class="text-indigo-600">{{ selectedMinutes }} phút mỗi ngày</strong></p>
          </div>
        </div>

        <p v-if="errorMessage" class="text-xs sm:text-sm text-rose-600 font-semibold bg-rose-50 p-3 rounded-xl border border-rose-200">
          ⚠️ {{ errorMessage }}
        </p>
      </div>

      <!-- Footer Buttons -->
      <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
        <button
          v-if="currentStep > 1"
          type="button"
          @click="currentStep--"
          :disabled="submitting"
          class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-100 transition cursor-pointer"
        >
          Quay lại
        </button>
        <div v-else></div>

        <button
          v-if="currentStep < 3"
          type="button"
          @click="currentStep++"
          class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-md shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer"
        >
          <span>Tiếp tục</span>
          <ChevronRight class="w-4 h-4" />
        </button>

        <button
          v-else
          type="button"
          @click="finishSurvey"
          :disabled="submitting"
          class="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
          <Sparkles v-else class="w-4 h-4" />
          <span>{{ submitting ? 'Đang lưu thiết lập...' : 'Bắt đầu học ngay 🚀' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { CheckCircle2, ChevronRight, Loader2, Sparkles } from 'lucide-vue-next';
import { authService } from '../services/authService';

const props = defineProps({
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'completed']);

const currentStep = ref(1);
const selectedLevel = ref('Intermediate');
const selectedGoal = ref('communication');
const selectedMinutes = ref(15);
const submitting = ref(false);
const errorMessage = ref('');

const LEVEL_OPTIONS = [
  {
    id: 'Beginner',
    emoji: '🌱',
    title: 'Cơ bản (Beginner - A1/A2)',
    desc: 'Mới bắt đầu hoặc mất gốc, muốn học lại từ phát âm bảng IPA và từ vựng thông dụng cơ bản.'
  },
  {
    id: 'Intermediate',
    emoji: '🚀',
    title: 'Trung cấp (Intermediate - B1/B2)',
    desc: 'Đã có nền tảng từ vựng, muốn nâng cao phản xạ tự nhiên và giao tiếp thành câu trôi chảy.',
    recommended: true
  },
  {
    id: 'Advanced',
    emoji: '👑',
    title: 'Nâng cao (Advanced - C1/C2)',
    desc: 'Đã nói tốt, muốn tinh chỉnh độ tự nhiên như người bản xứ, viết luận và đàm phán công việc.'
  }
];

const GOAL_OPTIONS = [
  {
    id: 'communication',
    emoji: '💬',
    title: 'Giao tiếp hàng ngày (Communication)',
    desc: 'Tự tin bắt chuyện với người nước ngoài, đi du lịch, xem phim hoặc nghe podcast không phụ đề.'
  },
  {
    id: 'work',
    emoji: '💼',
    title: 'Công việc & Sự nghiệp (Career & IT)',
    desc: 'Phỏng vấn xin việc, thuyết trình, trao đổi email và làm việc tự tin trong môi trường quốc tế.'
  },
  {
    id: 'study',
    emoji: '🎓',
    title: 'Học tập & Luyện thi (Academic & IELTS)',
    desc: 'Rèn luyện ngữ pháp chuyên sâu, cải thiện kỹ năng viết luận và chuẩn bị cho các kỳ thi chứng chỉ.'
  }
];

const TIME_OPTIONS = [
  { minutes: 10, emoji: '☕', title: '10 phút / ngày', desc: 'Thư giãn, nhẹ nhàng duy trì thói quen.' },
  { minutes: 15, emoji: '⭐', title: '15 phút / ngày', desc: 'Tiêu chuẩn, tiến bộ rõ rệt sau 30 ngày.', recommended: true },
  { minutes: 30, emoji: '🔥', title: '30 phút / ngày', desc: 'Chăm chỉ, bứt phá phản xạ giao tiếp.' },
  { minutes: 45, emoji: '🚀', title: '45 phút / ngày', desc: 'Cấp tốc, đạt mục tiêu nhanh nhất.' }
];

const getLevelLabel = (id) => {
  const f = LEVEL_OPTIONS.find(l => l.id === id);
  return f ? f.title : id;
};

const getGoalLabel = (id) => {
  const f = GOAL_OPTIONS.find(g => g.id === id);
  return f ? f.title : id;
};

const finishSurvey = async () => {
  if (submitting.value) return;
  submitting.value = true;
  errorMessage.value = '';

  try {
    const user = authService.getUser() || {};
    const fullName = user.full_name || 'Học viên';
    
    await authService.updatePreferences({
      full_name: fullName,
      target_level: selectedLevel.value,
      goal: selectedGoal.value,
      daily_minutes: Number(selectedMinutes.value)
    });

    if (user.id) {
      localStorage.setItem(`lingoup:onboarded:${user.id}`, 'true');
    }

    emit('completed', {
      target_level: selectedLevel.value,
      goal: selectedGoal.value,
      daily_minutes: selectedMinutes.value
    });
  } catch (err) {
    const detail = err.response?.data?.detail;
    errorMessage.value = Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : (detail || 'Không thể lưu khảo sát lúc này. Vui lòng thử lại.');
  } finally {
    submitting.value = false;
  }
};
</script>
