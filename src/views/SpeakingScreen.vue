<template>
  <div class="space-y-6 pb-24">
    <!-- Header -->
    <div class="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 text-white shadow-xl">
      <div class="flex items-center justify-between">
        <div>
          <span class="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-emerald-100 mb-2">
            AI Speech Recognition &amp; G2P
          </span>
          <h1 class="text-2xl font-bold tracking-tight">Phân tích Phát âm Chuẩn Bản Xứ</h1>
          <p class="text-sm text-emerald-100 mt-1">
            Đánh giá khẩu hình, âm vị IPA và cao độ ngữ điệu bằng Whisper AI &amp; Librosa
          </p>
        </div>
        <div class="hidden sm:flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Mode Selector & Lesson Picker -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
      <div class="flex items-center justify-between">
        <label class="text-xs font-bold uppercase tracking-wider text-slate-500">
          Chọn bài học hoặc nhập câu thực hành
        </label>
        <div class="flex items-center space-x-2">
          <button 
            @click="isCustomMode = false" 
            :class="!isCustomMode ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            Từ giáo trình
          </button>
          <button 
            @click="isCustomMode = true" 
            :class="isCustomMode ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            Tự nhập câu
          </button>
        </div>
      </div>

      <!-- Curriculum Select -->
      <div v-if="!isCustomMode" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Chủ đề (Topic)</label>
          <select 
            v-model="selectedTopicId" 
            @change="onTopicChange"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option v-for="t in topics" :key="t.id" :value="t.id">
              {{ t.title }} ({{ t.level }})
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Câu mẫu bài học (Lesson)</label>
          <select 
            v-model="selectedLessonId" 
            @change="onLessonChange"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option v-for="l in lessons" :key="l.id" :value="l.id">
              {{ l.title }}
            </option>
          </select>
        </div>
      </div>

      <!-- Target Text Input or Display -->
      <div class="relative">
        <label class="block text-xs font-medium text-slate-500 mb-1">Nội dung câu tiếng Anh cần đọc:</label>
        <textarea
          v-model="targetText"
          :readonly="!isCustomMode"
          rows="2"
          class="w-full rounded-xl p-3 text-slate-800 font-medium text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          :class="isCustomMode ? 'bg-white border border-emerald-300' : 'bg-slate-50 border border-slate-200 cursor-default'"
          placeholder="Nhập câu tiếng Anh bạn muốn luyện nói..."
        ></textarea>
        
        <!-- Listen Native Audio Button -->
        <div class="mt-2 flex items-center justify-between">
          <button 
            @click="playNativeAudio" 
            :disabled="!targetText || isSpeakingNative"
            class="inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
            </svg>
            <span>{{ isSpeakingNative ? 'Đang phát...' : 'Nghe giọng mẫu bản ngữ' }}</span>
          </button>

          <span v-if="currentLesson?.ipa_transcription" class="text-xs text-slate-500 font-mono">
            IPA: /{{ currentLesson.ipa_transcription }}/
          </span>
        </div>
      </div>
    </div>

    <!-- Recorder Studio Section -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center space-y-6">
      <div class="max-w-md mx-auto space-y-4">
        <div class="relative inline-block">
          <!-- Pulse animation when recording -->
          <div 
            v-if="isRecording" 
            class="absolute -inset-3 bg-red-500/20 rounded-full animate-ping"
          ></div>
          <button
            @click="toggleRecording"
            :disabled="isAnalyzing"
            :class="[
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200',
              'relative w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 transform active:scale-95 disabled:opacity-50'
            ]"
          >
            <svg v-if="!isRecording" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <div v-else class="w-7 h-7 bg-white rounded-md"></div>
          </button>
        </div>

        <div>
          <p class="text-base font-semibold text-slate-800">
            {{ isRecording ? 'Đang ghi âm giọng đọc của bạn...' : (recordedBlob ? 'Đã ghi âm xong! Bấm gửi để AI chấm điểm' : 'Bấm micro để bắt đầu nói') }}
          </p>
          <p class="text-xs text-slate-500 mt-1">
            <span v-if="isRecording" class="text-red-500 font-mono font-bold text-sm">
              Thời gian: {{ formattedTime }}
            </span>
            <span v-else>Microphone 16kHz Mono • Lọc nhiễu thời gian thực</span>
          </p>
        </div>

        <!-- Recorded audio playback & Action buttons -->
        <div v-if="recordedAudioUrl && !isRecording" class="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-3">
          <audio :src="recordedAudioUrl" controls class="w-full h-9"></audio>
          <div class="flex items-center justify-center space-x-3">
            <button
              @click="submitPronunciation"
              :disabled="isAnalyzing"
              class="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-sm shadow-md hover:from-emerald-700 hover:to-teal-700 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <svg v-if="isAnalyzing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>{{ isAnalyzing ? 'Whisper & AI đang chấm điểm...' : 'Gửi chấm điểm AI' }}</span>
            </button>
            <button
              @click="clearRecording"
              :disabled="isAnalyzing"
              class="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-sm transition"
            >
              Thu âm lại
            </button>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 text-left">
          ⚠️ {{ errorMessage }}
        </div>
      </div>
    </div>

    <!-- AI Evaluation Results Section -->
    <div v-if="result" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6 animate-fadeIn">
      <div class="flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 pb-4 gap-4">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-600">Kết quả đánh giá AI</span>
          <h2 class="text-xl font-bold text-slate-800">Báo cáo Phân tích Âm vị Chi tiết</h2>
        </div>

        <!-- Overall Score Card -->
        <div class="flex items-center space-x-4">
          <div class="text-right">
            <div class="text-xs text-slate-500 font-medium">Điểm phát âm tổng quát</div>
            <div class="text-xs font-semibold" :class="getScoreColorClass(result.overall_score)">
              {{ getScoreBadgeText(result.overall_score) }}
            </div>
          </div>
          <div 
            class="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-lg"
            :class="getScoreBgClass(result.overall_score)"
          >
            {{ Math.round(result.overall_score) }}
          </div>
        </div>
      </div>

      <!-- Metric Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div class="text-xs text-slate-500">Cao độ F0 (Pitch)</div>
          <div class="text-lg font-bold text-slate-800 mt-1">
            {{ result.average_pitch ? Math.round(result.average_pitch) + ' Hz' : 'N/A' }}
          </div>
          <div class="text-[11px] text-slate-400">Đo bằng Librosa Audio</div>
        </div>

        <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div class="text-xs text-slate-500">Số từ chính xác</div>
          <div class="text-lg font-bold text-emerald-600 mt-1">
            {{ correctWordsCount }} / {{ (result.word_analysis || []).length }}
          </div>
          <div class="text-[11px] text-slate-400">Độ khớp âm vị G2P</div>
        </div>

        <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 col-span-2 sm:col-span-1">
          <div class="text-xs text-slate-500">Whisper nhận diện</div>
          <div class="text-sm font-semibold text-slate-800 mt-1 truncate">
            "{{ result.transcribed_text || 'Chưa ghi nhận' }}"
          </div>
          <div class="text-[11px] text-slate-400">Mô hình Whisper STT</div>
        </div>
      </div>

      <!-- Word-by-word Phoneme Highlighting -->
      <div class="space-y-3">
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500">
          Chi tiết từng từ (Bấm vào từ để xem âm vị IPA và nghe mẫu):
        </label>
        
        <div class="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <button
            v-for="(w, idx) in result.word_analysis"
            :key="idx"
            @click="selectedWord = w"
            class="px-3 py-1.5 rounded-xl font-medium text-sm transition transform hover:scale-105 flex items-center space-x-1.5 shadow-sm"
            :style="{ backgroundColor: getWordBg(w), color: getWordTextColor(w) }"
          >
            <span>{{ w.word }}</span>
            <span v-if="w.status === 'CORRECT'" class="text-xs">✓</span>
            <span v-else class="text-xs">✕</span>
          </button>
        </div>

        <!-- Selected Word Detail Card -->
        <div v-if="selectedWord" class="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2 text-sm text-slate-800">
          <div class="flex items-center justify-between">
            <span class="font-bold text-base text-emerald-900">Từ: "{{ selectedWord.word }}"</span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="selectedWord.status === 'CORRECT' ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'">
              {{ selectedWord.status === 'CORRECT' ? 'Phát âm chuẩn' : (selectedWord.error_type || 'Cần cải thiện') }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-slate-500">Phiên âm mẫu (Target IPA):</span>
              <span class="font-mono font-bold text-slate-800 ml-1">/{{ selectedWord.target_ipa || 'N/A' }}/</span>
            </div>
            <div>
              <span class="text-slate-500">Bạn đã phát âm (User IPA):</span>
              <span class="font-mono font-bold text-red-600 ml-1">/{{ selectedWord.user_ipa || 'N/A' }}/</span>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Gemini Feedback -->
      <div v-if="result.ai_feedback" class="p-5 bg-gradient-to-br from-indigo-50/70 to-blue-50/70 border border-indigo-100 rounded-2xl space-y-2">
        <div class="flex items-center space-x-2 text-indigo-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="font-bold text-sm">Lời khuyên từ Trợ lý AI Gemini:</span>
        </div>
        <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {{ result.ai_feedback }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { curriculumService } from '../services/curriculumService';
import { pronunciationService } from '../services/pronunciationService';
import { AudioRecorder } from '../services/audioRecorder';
import { getFullAudioUrl } from '../services/api';

const topics = ref([]);
const lessons = ref([]);
const selectedTopicId = ref(null);
const selectedLessonId = ref(null);
const currentLesson = ref(null);

const isCustomMode = ref(false);
const targetText = ref('Hello, nice to meet you. Welcome to AI English!');

// Audio recording
const recorder = new AudioRecorder();
const isRecording = ref(false);
const recordingSeconds = ref(0);
let timerInterval = null;
const recordedBlob = ref(null);
const recordedAudioUrl = ref(null);
const isAnalyzing = ref(false);
const isSpeakingNative = ref(false);
const errorMessage = ref('');

// Result
const result = ref(null);
const selectedWord = ref(null);

const formattedTime = computed(() => {
  const m = Math.floor(recordingSeconds.value / 60);
  const s = recordingSeconds.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

const correctWordsCount = computed(() => {
  if (!result.value || !result.value.word_analysis) return 0;
  return result.value.word_analysis.filter((w) => w.status === 'CORRECT').length;
});

onMounted(async () => {
  await loadCurriculum();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  recorder.cleanup();
  if (recordedAudioUrl.value) {
    URL.revokeObjectURL(recordedAudioUrl.value);
  }
});

async function loadCurriculum() {
  try {
    const data = await curriculumService.getTopics();
    topics.value = data || [];
    if (topics.value.length > 0) {
      selectedTopicId.value = topics.value[0].id;
      await onTopicChange();
    }
  } catch (err) {
    console.warn('Could not load topics:', err);
  }
}

async function onTopicChange() {
  if (!selectedTopicId.value) return;
  try {
    const data = await curriculumService.getTopicLessons(selectedTopicId.value);
    lessons.value = data || [];
    if (lessons.value.length > 0) {
      selectedLessonId.value = lessons.value[0].id;
      onLessonChange();
    }
  } catch (err) {
    console.warn('Could not load lessons for topic:', err);
  }
}

function onLessonChange() {
  const lesson = lessons.value.find((l) => l.id === selectedLessonId.value);
  if (lesson) {
    currentLesson.value = lesson;
    if (!isCustomMode.value) {
      targetText.value = lesson.content || lesson.title;
    }
  }
}

async function playNativeAudio() {
  if (!targetText.value) return;

  if (currentLesson.value?.audio_url) {
    const audioUrl = getFullAudioUrl(currentLesson.value.audio_url);
    const audio = new Audio(audioUrl);
    isSpeakingNative.value = true;
    audio.onended = () => { isSpeakingNative.value = false; };
    audio.onerror = () => { fallbackTTS(); };
    try {
      await audio.play();
      return;
    } catch {
      fallbackTTS();
      return;
    }
  }

  fallbackTTS();
}

function fallbackTTS() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(targetText.value);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    isSpeakingNative.value = true;
    utterance.onend = () => { isSpeakingNative.value = false; };
    utterance.onerror = () => { isSpeakingNative.value = false; };
    window.speechSynthesis.speak(utterance);
  }
}

async function toggleRecording() {
  errorMessage.value = '';
  if (isRecording.value) {
    await stopRecording();
  } else {
    await startRecording();
  }
}

async function startRecording() {
  try {
    clearRecording();
    await recorder.start();
    isRecording.value = true;
    recordingSeconds.value = 0;
    timerInterval = setInterval(() => {
      recordingSeconds.value++;
    }, 1000);
  } catch (err) {
    errorMessage.value = err.message || 'Không thể truy cập microphone. Vui lòng cấp quyền!';
  }
}

async function stopRecording() {
  try {
    if (timerInterval) clearInterval(timerInterval);
    const blob = await recorder.stop();
    isRecording.value = false;
    if (blob) {
      recordedBlob.value = blob;
      recordedAudioUrl.value = URL.createObjectURL(blob);
    }
  } catch (err) {
    errorMessage.value = 'Lỗi dừng ghi âm: ' + err.message;
  }
}

function clearRecording() {
  if (recordedAudioUrl.value) {
    URL.revokeObjectURL(recordedAudioUrl.value);
    recordedAudioUrl.value = null;
  }
  recordedBlob.value = null;
  selectedWord.value = null;
  result.value = null;
  errorMessage.value = '';
}

async function submitPronunciation() {
  if (!recordedBlob.value) {
    errorMessage.value = 'Chưa có file ghi âm!';
    return;
  }
  if (!targetText.value.trim()) {
    errorMessage.value = 'Vui lòng nhập câu mẫu cần đọc!';
    return;
  }

  isAnalyzing.value = true;
  errorMessage.value = '';
  try {
    const lessonId = !isCustomMode.value ? selectedLessonId.value : null;
    const res = await pronunciationService.analyzePronunciation(
      recordedBlob.value,
      targetText.value.trim(),
      lessonId
    );
    result.value = res;
    if (res.word_analysis && res.word_analysis.length > 0) {
      selectedWord.value = res.word_analysis[0];
    }
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    errorMessage.value = `Chấm điểm thất bại: ${detail}`;
  } finally {
    isAnalyzing.value = false;
  }
}

function getScoreBgClass(score) {
  if (score >= 80) return 'bg-emerald-500 shadow-emerald-200';
  if (score >= 60) return 'bg-amber-500 shadow-amber-200';
  return 'bg-red-500 shadow-red-200';
}

function getScoreColorClass(score) {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

function getScoreBadgeText(score) {
  if (score >= 80) return 'Xuất sắc (Native-like)';
  if (score >= 60) return 'Khá (Good Comprehension)';
  return 'Cần luyện tập thêm';
}

function getWordBg(word) {
  if (word.color) return word.color + '22';
  return word.status === 'CORRECT' ? '#22c55e22' : '#ef444422';
}

function getWordTextColor(word) {
  if (word.color) return word.color;
  return word.status === 'CORRECT' ? '#15803d' : '#b91c1c';
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
