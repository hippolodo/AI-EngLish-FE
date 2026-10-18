<template>
  <section v-if="activeTab === 'dictionary'" class="w-full max-w-6xl mx-auto space-y-7 pb-28">
    
    <!-- Top Back Button -->
    <div>
      <button
        @click="goBack"
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs cursor-pointer group"
      >
        <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Quay lại</span>
      </button>
    </div>

    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide border border-blue-100 flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-blue-600" /> Tra cứu từ điển AI Gemini
          </span>
          <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            IPA Chuẩn bản xứ
          </span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Từ điển thông minh AI
        </h1>
        <p class="text-base sm:text-lg text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Tra cứu từ vựng Anh - Việt tức thì, chuẩn phiên âm IPA, giải nghĩa ngữ cảnh chi tiết, ví dụ thực tế và tự động phân tích từ mới cùng AI.
        </p>
      </div>

      <!-- Quick Feature Pill -->
      <div class="hidden lg:flex items-center gap-3 p-4 bg-white border border-slate-200/90 rounded-3xl shadow-2xs">
        <div class="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl">
          📖
        </div>
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Học từ mới</p>
          <p class="text-sm font-bold text-slate-800">Lưu vào Flashcard SRS</p>
        </div>
      </div>
    </div>

    <!-- Big Search Bar & Controls -->
    <div class="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
      <form @submit.prevent="handleSearch" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div class="relative flex-1">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Nhập từ tiếng Anh hoặc nghĩa tiếng Việt (ví dụ: resilient, fluency, truyền cảm hứng...)"
            class="w-full pl-12 pr-10 py-3.5 sm:py-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-base sm:text-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition shadow-2xs"
            @input="onSearchInput"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''; searchResults = []"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 hover:text-slate-600 p-1"
          >
            ✕
          </button>
        </div>

        <button
          type="submit"
          :disabled="loading || !searchQuery.trim()"
          class="px-7 py-3.5 sm:py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
          <Search v-else class="w-5 h-5" />
          <span>Tra từ</span>
        </button>

        <button
          type="button"
          @click="handleAiLookup"
          :disabled="loading || !searchQuery.trim()"
          class="px-5 py-3.5 sm:py-4 rounded-2xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100/90 text-indigo-700 font-bold text-base transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-2xs"
          title="Dùng Gemini AI phân tích chi tiết nếu từ chưa có trong từ điển"
        >
          <Sparkles class="w-5 h-5 text-indigo-600" />
          <span>Tra cứu bằng AI</span>
        </button>
      </form>

      <!-- Auto Suggestions Dropdown (if multiple matches found) -->
      <div v-if="searchResults.length > 1 && !selectedWord" class="pt-2 border-t border-slate-100 space-y-2">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Các kết quả gợi ý:</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in searchResults"
            :key="item.id"
            @click="selectWord(item)"
            class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-sm font-semibold text-slate-800 hover:text-blue-600 transition flex items-center gap-2 cursor-pointer"
          >
            <span class="font-bold">{{ item.word }}</span>
            <span v-if="item.ipa" class="text-xs text-slate-500 font-mono">/{{ item.ipa }}/</span>
            <span class="text-xs text-slate-600 truncate max-w-[150px]">— {{ item.meaning_vi }}</span>
          </button>
        </div>
      </div>

      <!-- Quick Word Chips for Inspiration -->
      <div class="flex items-center gap-2 pt-1 flex-wrap text-xs sm:text-sm">
        <span class="font-bold text-slate-500 flex items-center gap-1">
          <Lightbulb class="w-3.5 h-3.5 text-amber-500" /> Gợi ý tra từ:
        </span>
        <button
          v-for="word in popularKeywords"
          :key="word"
          type="button"
          @click="searchQuickWord(word)"
          class="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-medium text-slate-700 transition cursor-pointer"
        >
          {{ word }}
        </button>
      </div>
    </div>

    <!-- Loading State Indicator -->
    <div v-if="loading" class="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-3">
      <Loader2 class="mx-auto h-9 w-9 animate-spin text-blue-600" />
      <p class="text-base font-bold text-slate-800">Đang tra cứu từ điển và phân tích ngữ cảnh...</p>
      <p class="text-sm text-slate-500">Hệ thống đang đối chiếu dữ liệu ngữ âm và phân tích cùng Gemini AI</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" role="alert" class="rounded-3xl bg-rose-50 border border-rose-200 p-6 text-base text-rose-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p class="font-bold">Chưa tìm thấy từ phù hợp</p>
        <p class="text-sm mt-0.5">{{ errorMessage }}</p>
      </div>
      <button
        v-if="searchQuery"
        @click="handleAiLookup"
        class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition cursor-pointer shrink-0 flex items-center gap-2"
      >
        <Sparkles class="w-4 h-4" />
        <span>Thử phân tích tự động bằng AI</span>
      </button>
    </div>

    <!-- MAIN RESULT: WORD DETAILS CARD -->
    <article
      v-else-if="selectedWord"
      class="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-6 p-6 sm:p-9"
    >
      <!-- Word Header: Word Title, Part of speech, Level, Pronounce & Save -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-100 pb-6">
        <div>
          <div class="flex items-center gap-3 flex-wrap mb-2">
            <!-- Part of Speech Pill -->
            <span
              v-if="selectedWord.part_of_speech"
              class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200"
            >
              {{ selectedWord.part_of_speech }}
            </span>

            <!-- CEFR Level Pill -->
            <span
              v-if="selectedWord.level"
              class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              CEFR {{ selectedWord.level }}
            </span>

            <span class="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" /> Đã xác thực
            </span>
          </div>

          <!-- Main Word Display -->
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3 flex-wrap">
            <span>{{ selectedWord.word }}</span>
            
            <!-- Audio Speaker Button -->
            <button
              @click="speak(selectedWord.word)"
              class="w-11 h-11 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center transition cursor-pointer shadow-2xs hover:scale-105"
              title="Nghe phát âm chuẩn"
            >
              <Volume2 class="w-6 h-6" />
            </button>
          </h2>

          <!-- Phonetic IPA -->
          <div v-if="selectedWord.ipa" class="mt-2 flex items-center gap-2">
            <span class="text-lg sm:text-xl font-mono font-bold text-indigo-700 bg-indigo-50/80 px-3 py-0.5 rounded-xl border border-indigo-100">
              {{ formatIpa(selectedWord.ipa) }}
            </span>
          </div>
        </div>

        <!-- Action Buttons: Save Word & Practice Speaking -->
        <div class="flex items-center gap-3 flex-wrap sm:flex-col sm:items-end">
          <!-- Save to Flashcard SRS -->
          <button
            @click="saveToNotebook"
            class="px-4.5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-800 font-bold text-sm transition shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <BookmarkPlus class="w-4.5 h-4.5 text-amber-500" />
            <span>Lưu vào sổ từ vựng</span>
          </button>

          <!-- Practice Speaking in Lab -->
          <button
            @click="practiceInLab"
            class="px-4.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Mic class="w-4.5 h-4.5" />
            <span>Luyện phát âm AI từ này</span>
          </button>
        </div>
      </div>

      <!-- Meaning in Vietnamese -->
      <div class="space-y-2">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Định nghĩa tiếng Việt:</h3>
        <p class="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
          {{ selectedWord.meaning_vi }}
        </p>
      </div>

      <!-- English Definition (if available) -->
      <div v-if="selectedWord.definition_en" class="space-y-2 rounded-2xl bg-slate-50 p-5 border border-slate-200/80">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">English Definition:</h3>
        <p class="text-base sm:text-lg text-slate-800 font-medium leading-relaxed">
          {{ selectedWord.definition_en }}
        </p>
      </div>

      <!-- Real-world Example Sentence -->
      <div v-if="selectedWord.example_sentence" class="space-y-3 rounded-2xl bg-blue-50/60 p-5 sm:p-6 border border-blue-100">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
            <span>💬</span> Ví dụ câu thực tế (Real-world Example):
          </h3>
          <button
            @click="speak(selectedWord.example_sentence)"
            class="p-1.5 rounded-xl bg-white text-blue-600 hover:bg-blue-100 transition cursor-pointer shadow-2xs text-xs font-bold flex items-center gap-1"
            title="Nghe câu ví dụ"
          >
            <Volume2 class="w-4 h-4" />
            <span class="hidden sm:inline">Nghe câu</span>
          </button>
        </div>

        <p class="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed font-sans">
          "{{ selectedWord.example_sentence }}"
        </p>

        <p v-if="selectedWord.example_translation" class="text-sm sm:text-base text-slate-600 italic">
          👉 {{ selectedWord.example_translation }}
        </p>
      </div>

    </article>

    <!-- SEARCH HISTORY & RECENT WORDS -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <History class="w-5 h-5 text-slate-600" />
          <span>Lịch sử tra cứu gần đây</span>
        </h3>
        <span v-if="searchHistory.length" class="text-xs font-bold text-slate-500">
          {{ searchHistory.length }} từ đã tra
        </span>
      </div>

      <div v-if="historyLoading" class="py-8 text-center text-slate-400 text-sm">
        <Loader2 class="mx-auto w-5 h-5 animate-spin mb-2" /> Đang tải lịch sử tra cứu...
      </div>

      <div v-else-if="searchHistory.length === 0" class="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-2xs space-y-2">
        <BookOpen class="w-10 h-10 text-slate-300 mx-auto" />
        <p class="font-bold text-slate-700">Chưa có lịch sử tra từ</p>
        <p class="text-xs sm:text-sm text-slate-500">Các từ bạn tra cứu sẽ xuất hiện tại đây để tiện xem lại bất cứ lúc nào.</p>
      </div>

      <!-- History Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div
          v-for="item in searchHistory"
          :key="item.id"
          @click="selectWord(item.word || item)"
          class="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-2xs"
        >
          <div class="min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition truncate">
                {{ (item.word?.word || item.word) }}
              </span>
              <span v-if="item.word?.part_of_speech" class="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                {{ item.word?.part_of_speech }}
              </span>
            </div>
            <p v-if="item.word?.ipa" class="text-xs font-mono text-indigo-600 font-medium truncate">
              {{ formatIpa(item.word?.ipa) }}
            </p>
            <p class="text-xs sm:text-sm text-slate-600 truncate mt-1">
              {{ item.word?.meaning_vi }}
            </p>
          </div>

          <button
            @click.stop="speak(item.word?.word || item.word)"
            class="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition shrink-0 cursor-pointer"
            title="Phát âm"
          >
            <Volume2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import {
  ArrowLeft, Search, Sparkles, Loader2, Volume2, BookmarkPlus,
  Mic, CheckCircle2, History, BookOpen, Lightbulb
} from 'lucide-vue-next';
import { dictionaryService } from '../services/dictionaryService';
import { getErrorMessage } from '../services/api';

const ctx = inject('screenContext');
const {
  activeTab, goBack, navigateTab, speakText, openSaveWord,
  isCustomSpeakingMode, targetSpeakingText
} = ctx;

const searchQuery = ref('');
const loading = ref(false);
const errorMessage = ref('');
const selectedWord = ref(null);
const searchResults = ref([]);
const searchHistory = ref([]);
const historyLoading = ref(false);

const popularKeywords = [
  'resilient', 'fluency', 'pronunciation', 'serendipity',
  'innovative', 'empathy', 'sustainable', 'collaboration'
];

let debounceTimer = null;

const formatIpa = (ipa) => {
  if (!ipa) return '';
  const clean = ipa.trim();
  if (clean.startsWith('/') && clean.endsWith('/')) return clean;
  return `/${clean}/`;
};

const speak = (text) => {
  if (!text) return;
  if (speakText) {
    speakText(text);
  } else if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }
};

const onSearchInput = () => {
  clearTimeout(debounceTimer);
  const q = searchQuery.value.trim();
  if (!q) {
    searchResults.value = [];
    return;
  }
  debounceTimer = setTimeout(() => {
    quickSearch(q);
  }, 350);
};

const quickSearch = async (query) => {
  try {
    const list = await dictionaryService.search(query, false, 8);
    searchResults.value = list || [];
  } catch (err) {
    // ignore quick search errors
  }
};

const handleSearch = async () => {
  const query = searchQuery.value.trim();
  if (!query) return;

  loading.value = true;
  errorMessage.value = '';
  selectedWord.value = null;

  try {
    // Tìm kiếm trong DB trước với auto_ai = true để tự động phân tích nếu chưa có
    const results = await dictionaryService.search(query, true, 10);
    if (results && results.length > 0) {
      searchResults.value = results;
      selectedWord.value = results[0];
      await loadHistory();
    } else {
      // Thử gọi thẳng aiLookup
      await handleAiLookup();
    }
  } catch (err) {
    errorMessage.value = getErrorMessage(err, 'Không tìm thấy từ vựng này. Bạn có thể bấm "Tra cứu bằng AI" để hệ thống tự động tìm.');
  } finally {
    loading.value = false;
  }
};

const handleAiLookup = async () => {
  const query = searchQuery.value.trim();
  if (!query) return;

  loading.value = true;
  errorMessage.value = '';
  selectedWord.value = null;

  try {
    const wordObj = await dictionaryService.aiLookup(query);
    if (wordObj) {
      selectedWord.value = wordObj;
      searchResults.value = [wordObj];
      await loadHistory();
    } else {
      errorMessage.value = 'Không thể phân tích từ vựng này qua AI. Vui lòng kiểm tra lại từ khóa.';
    }
  } catch (err) {
    errorMessage.value = getErrorMessage(err, 'Lỗi khi tra từ qua AI. Vui lòng thử lại sau giây lát.');
  } finally {
    loading.value = false;
  }
};

const selectWord = (word) => {
  selectedWord.value = word;
  searchQuery.value = word.word || '';
  searchResults.value = [];
};

const searchQuickWord = (word) => {
  searchQuery.value = word;
  handleSearch();
};

const saveToNotebook = () => {
  if (!selectedWord.value) return;
  if (openSaveWord) {
    openSaveWord(selectedWord.value.word, selectedWord.value.example_sentence || selectedWord.value.meaning_vi);
  }
};

const practiceInLab = () => {
  if (!selectedWord.value) return;
  if (isCustomSpeakingMode) isCustomSpeakingMode.value = true;
  if (targetSpeakingText) targetSpeakingText.value = selectedWord.value.word;
  if (navigateTab) navigateTab('speaking');
};

const loadHistory = async () => {
  historyLoading.value = true;
  try {
    const hist = await dictionaryService.getSearchHistory(12);
    searchHistory.value = hist || [];
  } catch (err) {
    // fallback gracefully
  } finally {
    historyLoading.value = false;
  }
};

onMounted(() => {
  loadHistory();
});
</script>
