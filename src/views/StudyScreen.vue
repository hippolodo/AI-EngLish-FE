<template>
  <div class="p-5 space-y-5 pb-24">
    <!-- Header & Flow Progress -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Từ vựng & Bài kiểm tra</span>
          <h1 class="text-lg font-bold text-gray-900 mt-1">Luyện tập thông minh</h1>
        </div>
        <span v-if="totalItems > 0" class="text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-full">
          Mục {{ currentIndex + 1 }} / {{ totalItems }}
        </span>
      </div>
      <div v-if="totalItems > 0" class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          :style="{ width: ((currentIndex + 1) / totalItems * 100) + '%' }"
          class="h-full bg-indigo-600 rounded-full transition-all duration-300"
        ></div>
      </div>
    </div>

    <!-- Toggle: Flashcard Mode vs Quiz Mode -->
    <div class="flex bg-gray-200/70 p-1 rounded-xl text-xs font-bold text-gray-600">
      <button
        @click="switchMode('flashcard')"
        :class="studyMode === 'flashcard' ? 'bg-white text-indigo-600 shadow-sm' : 'hover:text-gray-900'"
        class="flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Layers class="w-3.5 h-3.5" />
        <span>Thẻ Flashcard (SRS)</span>
      </button>
      <button
        @click="switchMode('quiz')"
        :class="studyMode === 'quiz' ? 'bg-white text-indigo-600 shadow-sm' : 'hover:text-gray-900'"
        class="flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <HelpCircle class="w-3.5 h-3.5" />
        <span>Bài trắc nghiệm (Quiz)</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-12 text-center space-y-2">
      <Loader2 class="w-7 h-7 animate-spin text-indigo-600 mx-auto" />
      <p class="text-xs text-gray-500">Đang tải dữ liệu từ CSDL...</p>
    </div>

    <!-- ============================================== -->
    <!-- PHẦN 1: FLASHCARD MODE (DỮ LIỆU THẬT TỪ API)   -->
    <!-- ============================================== -->
    <div v-else-if="studyMode === 'flashcard'" class="space-y-4">
      <!-- Empty State nếu CSDL chưa có thẻ -->
      <div v-if="flashcards.length === 0" class="p-8 bg-white rounded-3xl border border-gray-100 text-center space-y-3">
        <Layers class="w-10 h-10 text-indigo-300 mx-auto" />
        <h3 class="text-sm font-bold text-gray-800">Chưa có thẻ cần ôn tập hôm nay</h3>
        <p class="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
          Tất cả các thẻ từ vựng trong CSDL đã được bạn hoàn thành hoặc chưa được tạo.
        </p>
        <button
          @click="loadFlashcards"
          class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 cursor-pointer"
        >
          Tải lại danh sách
        </button>
      </div>

      <div v-else class="space-y-4">
        <!-- 3D FLIP CARD -->
        <div @click="isFlipped = !isFlipped" class="perspective-1000 w-full h-72 cursor-pointer select-none">
          <div :class="isFlipped ? 'rotate-y-180' : ''" class="relative w-full h-full duration-500 transform-style-preserve-3d transition-transform">
            <!-- FRONT SIDE -->
            <div class="absolute inset-0 backface-hidden bg-white rounded-3xl p-6 border border-gray-100 shadow-lg flex flex-col justify-between items-center text-center">
              <div class="w-full flex justify-between items-center">
                <span class="text-[10px] font-bold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg">
                  {{ currentCard.part_of_speech || 'Vocabulary' }}
                </span>
                <button
                  @click.stop="speakWord(currentCard.word)"
                  class="w-8 h-8 rounded-full bg-gray-100 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 flex items-center justify-center cursor-pointer"
                >
                  <Volume2 class="w-4 h-4" />
                </button>
              </div>
              <div class="space-y-2">
                <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ currentCard.word }}</h2>
                <p v-if="currentCard.ipa" class="text-sm font-mono text-gray-500">{{ currentCard.ipa }}</p>
              </div>
              <div class="text-[11px] text-gray-400 flex items-center gap-1">
                <RotateCw class="w-3 h-3" />
                <span>Chạm để lật xem nghĩa & câu ví dụ</span>
              </div>
            </div>

            <!-- BACK SIDE -->
            <div class="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-50 via-white to-gray-50 rounded-3xl p-6 border border-indigo-100 shadow-lg flex flex-col justify-between text-left">
              <div class="flex justify-between items-center">
                <span class="text-[10px] font-extrabold px-2.5 py-1 bg-indigo-600 text-white rounded-lg uppercase">
                  Nghĩa tiếng Việt
                </span>
                <span class="text-[10px] font-semibold text-gray-400">Leitner SRS</span>
              </div>
              <div class="space-y-2">
                <h3 class="text-xl font-bold text-gray-900">{{ currentCard.vietnamese_meaning || 'Chưa cập nhật nghĩa' }}</h3>
                <p v-if="currentCard.example_sentence" class="text-xs text-gray-600 italic border-l-2 border-indigo-400 pl-3 py-1">
                  "{{ currentCard.example_sentence }}"
                </p>
              </div>
              <p class="text-[11px] text-gray-400 text-center">
                Chạm để quay lại mặt trước
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons (Đồng bộ thuật toán SRS lên Backend) -->
        <div class="grid grid-cols-2 gap-3 pt-2">
          <button
            @click="submitCardReview(false)"
            class="py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm shadow-amber-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw class="w-4 h-4" />
            <span>Chưa nhớ (Ôn lại)</span>
          </button>
          <button
            @click="submitCardReview(true)"
            class="py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check class="w-4 h-4" />
            <span>Đã thuộc (+15 XP)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- PHẦN 2: QUIZ MODE (DỮ LIỆU THẬT TỪ API)        -->
    <!-- ============================================== -->
    <div v-else-if="studyMode === 'quiz'" class="space-y-4">
      <!-- Empty State nếu CSDL chưa có Quiz -->
      <div v-if="questions.length === 0" class="p-8 bg-white rounded-3xl border border-gray-100 text-center space-y-3">
        <HelpCircle class="w-10 h-10 text-indigo-300 mx-auto" />
        <h3 class="text-sm font-bold text-gray-800">Chưa có bài kiểm tra nào trong CSDL</h3>
        <p class="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
          Hiện tại hệ thống chưa có đề thi trắc nghiệm được kích hoạt trong CSDL.
        </p>
        <button
          @click="loadQuizzes"
          class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 cursor-pointer"
        >
          Tải lại danh sách
        </button>
      </div>

      <div v-else class="space-y-4">
        <!-- Question Card -->
        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2">
          <span class="text-[10px] font-extrabold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            Câu hỏi {{ currentIndex + 1 }} / {{ questions.length }}
          </span>
          <p class="text-sm font-bold text-gray-900 leading-relaxed">
            {{ currentQuestion.question_text }}
          </p>
        </div>

        <!-- Answers List -->
        <div class="space-y-2.5">
          <button
            v-for="(ans, aIdx) in currentQuestion.answers"
            :key="ans.id || aIdx"
            @click="selectAnswer(ans)"
            :disabled="quizChecked"
            :class="getAnswerClass(ans)"
            class="w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center justify-between text-xs font-semibold cursor-pointer"
          >
            <span class="flex items-center gap-2.5">
              <span class="w-6 h-6 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-[11px]">
                {{ ['A','B','C','D'][aIdx] || (aIdx + 1) }}
              </span>
              <span>{{ ans.answer_text }}</span>
            </span>
            <CheckCircle v-if="quizChecked && ans.is_correct" class="w-4 h-4 text-emerald-600" />
            <XCircle v-else-if="quizChecked && selectedAnswer?.id === ans.id && !ans.is_correct" class="w-4 h-4 text-rose-500" />
          </button>
        </div>

        <!-- Explanation Banner (Hiển thị sau khi kiểm tra) -->
        <div
          v-if="quizChecked"
          :class="isAnswerCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'"
          class="p-4 rounded-xl border text-xs space-y-1"
        >
          <p class="font-bold flex items-center gap-1.5">
            <Check v-if="isAnswerCorrect" class="w-4 h-4" />
            <AlertCircle v-else class="w-4 h-4" />
            {{ isAnswerCorrect ? 'Chính xác! (+20 XP)' : 'Chưa chính xác rồi!' }}
          </p>
          <p class="text-[11px] leading-relaxed opacity-90">
            {{ currentQuestion.explanation || 'Hãy lưu ý ngữ nghĩa và ngữ pháp của câu.' }}
          </p>
        </div>

        <!-- Action Button -->
        <div class="pt-2">
          <button
            v-if="!quizChecked"
            @click="checkQuizAnswer"
            :disabled="!selectedAnswer"
            class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            Kiểm tra đáp án
          </button>
          <button
            v-else
            @click="nextQuestion"
            class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>{{ currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Bắt đầu lại' }}</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  Layers, HelpCircle, Volume2, RotateCw, RotateCcw, Check, CheckCircle,
  XCircle, AlertCircle, ArrowRight, Loader2
} from 'lucide-vue-next';
import { studyService } from '../services/studyService';

const studyMode = ref('flashcard');
const isLoading = ref(false);
const currentIndex = ref(0);
const isFlipped = ref(false);

// Flashcards state
const flashcards = ref([]);
const currentCard = computed(() => flashcards.value[currentIndex.value] || {});

// Quiz state
const currentQuizId = ref(null);
const questions = ref([]);
const currentQuestion = computed(() => questions.value[currentIndex.value] || {});
const selectedAnswer = ref(null);
const quizChecked = ref(false);

const totalItems = computed(() => {
  return studyMode.value === 'flashcard' ? flashcards.value.length : questions.value.length;
});

const isAnswerCorrect = computed(() => {
  return selectedAnswer.value?.is_correct === true;
});

// Chuyển tab Flashcard <-> Quiz
const switchMode = (mode) => {
  studyMode.value = mode;
  currentIndex.value = 0;
  isFlipped.value = false;
  selectedAnswer.value = null;
  quizChecked.value = false;

  if (mode === 'flashcard' && flashcards.value.length === 0) {
    loadFlashcards();
  } else if (mode === 'quiz' && questions.value.length === 0) {
    loadQuizzes();
  }
};

// 1. TẢI FLASHCARDS THẬT TỪ CSDL BACKEND
const loadFlashcards = async () => {
  isLoading.value = true;
  try {
    const list = await studyService.getCardsForReview();
    flashcards.value = list || [];
    currentIndex.value = 0;
  } catch (err) {
    console.warn('Cannot load flashcards from DB:', err);
  } finally {
    isLoading.value = false;
  }
};

// Gửi kết quả nhớ/quên lên Backend (Spaced Repetition)
const submitCardReview = async (isRemembered) => {
  const card = currentCard.value;
  isFlipped.value = false;

  if (card && card.id) {
    try {
      await studyService.reviewCard(card.id, isRemembered);
    } catch (err) {
      console.warn('Failed to submit card review:', err);
    }
  }

  if (currentIndex.value < flashcards.value.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0;
  }
};

const speakWord = (word) => {
  if (!word) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }
};

// 2. TẢI QUIZZES THẬT TỪ CSDL BACKEND
const loadQuizzes = async () => {
  isLoading.value = true;
  try {
    const quizzesList = await studyService.getQuizzes();
    if (quizzesList && quizzesList.length > 0) {
      currentQuizId.value = quizzesList[0].id;
      // Lấy chi tiết đề thi kèm câu hỏi và đáp án
      const detail = await studyService.getQuizDetail(currentQuizId.value);
      if (detail && detail.questions) {
        questions.value = detail.questions;
        currentIndex.value = 0;
      }
    }
  } catch (err) {
    console.warn('Cannot load quizzes from DB:', err);
  } finally {
    isLoading.value = false;
  }
};

const selectAnswer = (ans) => {
  if (quizChecked.value) return;
  selectedAnswer.value = ans;
};

const checkQuizAnswer = () => {
  if (!selectedAnswer.value) return;
  quizChecked.value = true;
};

const nextQuestion = () => {
  selectedAnswer.value = null;
  quizChecked.value = false;
  if (currentIndex.value < questions.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0;
  }
};

const getAnswerClass = (ans) => {
  if (!quizChecked.value) {
    return selectedAnswer.value?.id === ans.id
      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm'
      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-800';
  }
  if (ans.is_correct) {
    return 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
  }
  if (selectedAnswer.value?.id === ans.id && !ans.is_correct) {
    return 'border-rose-500 bg-rose-50 text-rose-900';
  }
  return 'border-gray-200 bg-white text-gray-400 opacity-60';
};

onMounted(() => {
  loadFlashcards();
});
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-preserve-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>
