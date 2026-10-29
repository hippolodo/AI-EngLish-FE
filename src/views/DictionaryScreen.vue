<template>
  <section v-if="activeTab === 'dictionary'" class="w-full max-w-6xl mx-auto space-y-7 pb-28">
    
    <!-- Top Back Button (Only visible when navigated from another screen) -->
    <div v-if="hasHistory">
      <AnimateButton
        variant="outline"
        size="sm"
        @click="goBack"
        class="group"
      >
        <template #prefix>
          <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </template>
        <span>Back</span>
      </AnimateButton>
    </div>

    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <AnimateBadge variant="default" size="sm">
            <template #icon><Sparkles class="w-3.5 h-3.5 text-blue-600" /></template>
            Dictionary Lookup
          </AnimateBadge>
          <AnimateBadge variant="emerald" size="sm">
            Native IPA Phonetics
          </AnimateBadge>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Dictionary
        </h1>
        <p class="text-base sm:text-lg text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Instant vocabulary lookup with native IPA pronunciation, contextual definitions, and practical examples.
        </p>
      </div>

      <!-- Quick Feature Pill -->
      <div class="hidden lg:flex items-center gap-3 p-4 bg-white border border-slate-200/90 rounded-3xl shadow-2xs">
        <div class="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl">
          📖
        </div>
        <div>
          <p class="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Vocabulary</p>
          <p class="text-sm font-bold text-slate-800">Save to Flashcards</p>
        </div>
      </div>
    </div>

    <!-- Big Search Bar & Controls -->
    <div class="glass-panel rounded-3xl p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.04)] space-y-4">
      <form @submit.prevent="onFormSubmit" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div class="relative flex-1" ref="searchContainerRef">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Enter an English word or phrase (e.g. resilient, fluency, inspire...)"
            class="w-full pl-12 pr-10 py-3.5 sm:py-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-base sm:text-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition shadow-2xs"
            @input="onSearchInput"
            @focus="onInputFocus"
            @keydown.down.prevent="onKeyDown"
            @keydown.up.prevent="onKeyUp"
            @keydown.esc="showDropdown = false"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="clearSearch"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            ✕
          </button>

          <!-- Floating Autocomplete Dropdown (Matching Image 3) -->
          <div
            v-if="showDropdown && searchResults.length > 0"
            class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-30 max-h-80 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100"
          >
            <div
              v-for="(item, idx) in searchResults"
              :key="item.id || idx"
              @mousedown.prevent="selectWord(item)"
              class="px-5 py-3 hover:bg-blue-50/70 cursor-pointer transition text-left flex flex-col justify-center group"
              :class="{ 'bg-blue-50/50': highlightedIndex === idx }"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">
                  {{ item.word }}
                </span>
                <span v-if="item.ipa" class="text-xs text-slate-400 font-mono">
                  {{ formatIpa(item.ipa) }}
                </span>
              </div>
              <p class="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {{ item.meaning_vi }}
              </p>
            </div>
          </div>
        </div>

        <AnimateButton
          type="submit"
          variant="default"
          size="lg"
          :loading="loading"
          :disabled="loading || !searchQuery.trim()"
        >
          <template #prefix><Search class="w-5 h-5" /></template>
          <span>Search</span>
        </AnimateButton>

        <AnimateButton
          type="button"
          variant="gradient"
          size="lg"
          :loading="loading"
          :disabled="loading || !searchQuery.trim()"
          @click="handleAiLookup"
          title="Deep search with contextual analysis"
        >
          <template #prefix><Sparkles class="w-5 h-5 text-white" /></template>
          <span>Deep Search</span>
        </AnimateButton>
      </form>

      <!-- Quick Word Chips for Inspiration -->
      <div class="flex items-center gap-2 pt-1 flex-wrap text-xs sm:text-sm">
        <span class="font-bold text-slate-500 flex items-center gap-1">
          <Lightbulb class="w-3.5 h-3.5 text-amber-500" /> Quick suggestions:
        </span>
        <button
          v-for="word in popularKeywords"
          :key="word"
          type="button"
          @click="searchQuickWord(word)"
          class="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 font-semibold hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50/70 shadow-2xs transition cursor-pointer"
        >
          {{ word }}
        </button>
      </div>
    </div>

    <!-- Google Translate-style Spell Correction Banner (Matching Image 2) -->
    <div
      v-if="shouldShowSpellCorrection"
      class="bg-blue-50/90 border border-blue-200 rounded-2xl p-4 sm:px-6 sm:py-3.5 shadow-2xs flex items-start sm:items-center justify-between gap-4 transition-all"
    >
      <div class="flex items-start sm:items-center gap-3">
        <Sparkles class="w-5 h-5 text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
        <div class="text-sm text-slate-700 leading-relaxed">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-slate-600">✦ Showing translation for</span>
            <button
              type="button"
              @click="searchDirect(selectedWord.suggested_correction)"
              class="font-bold italic text-blue-700 hover:underline cursor-pointer"
            >
              {{ selectedWord.suggested_correction }}
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-1 text-xs text-slate-500 mt-0.5">
            <span>Translate instead</span>
            <button
              type="button"
              @click="searchRaw(selectedWord.original_query)"
              class="text-blue-600 underline font-medium hover:text-blue-800 cursor-pointer"
            >
              {{ selectedWord.original_query }}
            </button>
          </div>
        </div>
      </div>
      <button
        type="button"
        @click="dismissSuggestion"
        class="text-xs text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
        title="Dismiss"
      >
        ✕
      </button>
    </div>

    <!-- Loading State Indicator -->
    <div v-if="loading" class="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-3">
      <Loader2 class="mx-auto h-9 w-9 animate-spin text-blue-600" />
      <p class="text-base font-bold text-slate-800">Looking up word and analyzing context...</p>
      <p class="text-sm text-slate-500">Matching phonetic data and contextual definitions...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" role="alert" class="rounded-3xl bg-rose-50 border border-rose-200 p-6 text-base text-rose-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p class="font-bold">Word not found</p>
        <p class="text-sm mt-0.5">{{ errorMessage }}</p>
      </div>
      <button
        v-if="searchQuery"
        @click="handleAiLookup"
        class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition cursor-pointer shrink-0 flex items-center gap-2"
      >
        <Sparkles class="w-4 h-4" />
        <span>Try Deep Search</span>
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
            <AnimateBadge
              v-if="selectedWord.part_of_speech"
              variant="default"
              size="sm"
            >
              {{ selectedWord.part_of_speech }}
            </AnimateBadge>

            <!-- CEFR Level Pill -->
            <AnimateBadge
              v-if="selectedWord.level"
              variant="emerald"
              size="sm"
            >
              CEFR {{ selectedWord.level }}
            </AnimateBadge>

            <span class="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" /> Verified
            </span>
          </div>

          <!-- Main Word Display -->
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-3 flex-wrap">
            <span>{{ selectedWord.word }}</span>
            
            <!-- Audio Speaker Button -->
            <AnimateButton
              variant="secondary"
              size="icon"
              @click="speak(selectedWord.word)"
              class="text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200"
              title="Listen to native pronunciation"
            >
              <Volume2 class="w-5 h-5" />
            </AnimateButton>
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
          <AnimateButton
            variant="outline"
            size="md"
            @click="saveToNotebook"
            class="hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-800"
          >
            <template #prefix><BookmarkPlus class="w-4.5 h-4.5 text-amber-500" /></template>
            <span>Save to Flashcards</span>
          </AnimateButton>

          <!-- Practice Speaking in Lab -->
          <AnimateButton
            variant="emerald"
            size="md"
            @click="practiceInLab"
          >
            <template #prefix><Mic class="w-4.5 h-4.5" /></template>
            <span>Practice Speaking</span>
          </AnimateButton>
        </div>
      </div>

      <!-- Meaning in Vietnamese -->
      <div class="space-y-2">
        <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-600">Definition:</h3>
        <p class="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
          {{ selectedWord.meaning_vi }}
        </p>
      </div>

      <!-- English Definition (if available - styled as accent panel, no nested card border) -->
      <div v-if="selectedWord.definition_en" class="space-y-2 rounded-2xl bg-slate-50/80 p-5 border-l-4 border-l-slate-400">
        <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-700">English Definition:</h3>
        <p class="text-base sm:text-lg text-slate-800 font-medium leading-relaxed">
          {{ selectedWord.definition_en }}
        </p>
      </div>

      <!-- Real-world Example Sentence (styled as accent panel, no nested card border) -->
      <div v-if="selectedWord.example_sentence" class="space-y-3 rounded-2xl bg-blue-50/70 p-5 sm:p-6 border-l-4 border-l-blue-500">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
            <span>💬</span> Real-world Example:
          </h3>
          <div class="flex items-center gap-2">
            <button
              @click="practiceExampleSentence"
              class="p-1.5 px-3 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition cursor-pointer shadow-2xs text-xs font-bold flex items-center gap-1.5"
              title="Practice speaking this example"
            >
              <Mic class="w-3.5 h-3.5 text-emerald-600" />
              <span>Practice Example</span>
            </button>
            <button
              @click="speak(selectedWord.example_sentence)"
              class="p-1.5 px-3 rounded-xl bg-white text-blue-600 hover:bg-blue-100 transition cursor-pointer shadow-2xs text-xs font-bold flex items-center gap-1"
              title="Listen to example"
            >
              <Volume2 class="w-4 h-4" />
              <span class="hidden sm:inline">Listen</span>
            </button>
          </div>
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
          <span>Recent Search History</span>
        </h3>
        <span v-if="searchHistory.length" class="text-xs font-bold text-slate-500">
          {{ searchHistory.length }} words searched
        </span>
      </div>

      <div v-if="historyLoading" class="py-8 text-center text-slate-400 text-sm">
        <Loader2 class="mx-auto w-5 h-5 animate-spin mb-2" /> Loading search history...
      </div>

      <div v-else-if="searchHistory.length === 0" class="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-2xs space-y-2">
        <BookOpen class="w-10 h-10 text-slate-300 mx-auto" />
        <p class="font-bold text-slate-700">No search history yet</p>
        <p class="text-xs sm:text-sm text-slate-500">Words you search will appear here so you can easily review them anytime.</p>
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
            title="Pronounce"
          >
            <Volume2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import {
  ArrowLeft, Search, Sparkles, Loader2, Volume2, BookmarkPlus,
  Mic, CheckCircle2, History, BookOpen, Lightbulb
} from 'lucide-vue-next';
import AnimateButton from '../components/ui/Button.vue';
import AnimateBadge from '../components/ui/Badge.vue';
import AnimateCard from '../components/ui/Card.vue';
import AnimateShimmerText from '../components/ui/ShimmerText.vue';
import { dictionaryService } from '../services/dictionaryService';
import { getErrorMessage } from '../services/api';

const ctx = inject('screenContext');
const {
  activeTab, goBack, navigateTab, speakText, openSaveWord,
  isCustomSpeakingMode, targetSpeakingText, hasHistory
} = ctx;

const searchQuery = ref('');
const loading = ref(false);
const errorMessage = ref('');
const selectedWord = ref(null);
const searchResults = ref([]);
const searchHistory = ref([]);
const historyLoading = ref(false);

const showDropdown = ref(false);
const highlightedIndex = ref(-1);
const searchContainerRef = ref(null);

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

const clientWordCache = new Map();
let quickSearchSeq = 0;

const shouldShowSpellCorrection = computed(() => {
  if (!selectedWord.value || !selectedWord.value.suggested_correction || !selectedWord.value.original_query) {
    return false;
  }
  const currentQ = searchQuery.value.trim().toLowerCase();
  const corrected = selectedWord.value.suggested_correction.trim().toLowerCase();
  const original = selectedWord.value.original_query.trim().toLowerCase();

  // If the suggestion is identical to original query, do not show
  if (corrected === original) return false;
  // If user already fixed the search box or searched for the correct word, do not show
  if (currentQ === corrected) return false;
  // Only show if user's query actually matches the misspelled query
  return currentQ === original;
});

const onSearchInput = () => {
  clearTimeout(debounceTimer);
  const q = searchQuery.value.trim();
  if (!q) {
    quickSearchSeq++;
    searchResults.value = [];
    showDropdown.value = false;
    highlightedIndex.value = -1;
    return;
  }
  showDropdown.value = true;
  highlightedIndex.value = -1;
  const seq = ++quickSearchSeq;
  debounceTimer = setTimeout(() => {
    quickSearch(q, seq);
  }, 220);
};

const onInputFocus = () => {
  if (searchQuery.value.trim() && searchResults.value.length > 0) {
    showDropdown.value = true;
  }
};

const clearSearch = () => {
  quickSearchSeq++;
  searchQuery.value = '';
  searchResults.value = [];
  showDropdown.value = false;
  highlightedIndex.value = -1;
};

const onKeyDown = () => {
  if (!showDropdown.value || searchResults.value.length === 0) {
    showDropdown.value = true;
    return;
  }
  if (highlightedIndex.value < searchResults.value.length - 1) {
    highlightedIndex.value++;
  } else {
    highlightedIndex.value = 0;
  }
};

const onKeyUp = () => {
  if (!showDropdown.value || searchResults.value.length === 0) return;
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--;
  } else {
    highlightedIndex.value = searchResults.value.length - 1;
  }
};

const handleClickOutside = (e) => {
  if (searchContainerRef.value && !searchContainerRef.value.contains(e.target)) {
    showDropdown.value = false;
  }
};

const quickSearch = async (query, seq) => {
  try {
    const trimmed = query.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (clientWordCache.has(lower)) {
      if (seq !== quickSearchSeq) return;
      searchResults.value = clientWordCache.get(lower);
      if (searchResults.value.length > 0 && searchQuery.value.trim()) {
        showDropdown.value = true;
      }
      return;
    }
    // Autocomplete: recordHistory = false (không lưu lịch sử khi người dùng đang gõ phím)
    const list = await dictionaryService.search(trimmed, false, 8, false, false);
    if (seq !== quickSearchSeq) return;
    searchResults.value = list || [];
    if (list && list.length > 0) {
      clientWordCache.set(lower, list);
      if (searchQuery.value.trim()) {
        showDropdown.value = true;
      }
    }
  } catch (err) {
    // ignore quick search errors
  }
};

const onFormSubmit = () => {
  if (showDropdown.value && highlightedIndex.value >= 0 && searchResults.value[highlightedIndex.value]) {
    selectWord(searchResults.value[highlightedIndex.value]);
  } else {
    handleSearch();
  }
};

const handleSearch = async () => {
  quickSearchSeq++;
  showDropdown.value = false;
  highlightedIndex.value = -1;
  const query = searchQuery.value.trim();
  if (!query) return;

  const lower = query.toLowerCase();

  loading.value = true;
  errorMessage.value = '';
  selectedWord.value = null;

  try {
    // Tìm kiếm chính thức: recordHistory = true (chỉ lưu lịch sử khi nhấn tìm kiếm)
    const results = await dictionaryService.search(query, true, 10, false, true);
    if (results && results.length > 0) {
      const resWord = { ...results[0] };
      // Nếu từ tìm thấy trùng khớp với từ người dùng gõ, không cần hiển thị cờ gợi ý sửa lỗi
      if (resWord.word && resWord.word.toLowerCase() === lower) {
        resWord.suggested_correction = null;
        resWord.original_query = null;
      }
      clientWordCache.set(lower, [resWord]);
      selectedWord.value = resWord;
      loadHistory();
    } else {
      errorMessage.value = 'Word not found. You can try "Deep Search" for an extended lookup.';
    }
  } catch (err) {
    errorMessage.value = getErrorMessage(err, 'Word not found. You can try "Deep Search" for an extended lookup.');
  } finally {
    loading.value = false;
  }
};

const searchDirect = (word) => {
  searchQuery.value = word;
  if (selectedWord.value) {
    selectedWord.value.suggested_correction = null;
    selectedWord.value.original_query = null;
  }
  handleSearch();
};

const searchRaw = async (originalQuery) => {
  if (!originalQuery) return;
  quickSearchSeq++;
  searchQuery.value = originalQuery;
  showDropdown.value = false;
  loading.value = true;
  errorMessage.value = '';
  selectedWord.value = null;

  try {
    const results = await dictionaryService.search(originalQuery, true, 10, true, true);
    if (results && results.length > 0) {
      selectedWord.value = { ...results[0], suggested_correction: null, original_query: null };
      loadHistory();
    } else {
      errorMessage.value = `Word "${originalQuery}" not found.`;
    }
  } catch (err) {
    errorMessage.value = getErrorMessage(err, 'Word not found.');
  } finally {
    loading.value = false;
  }
};

const dismissSuggestion = () => {
  if (selectedWord.value) {
    selectedWord.value.suggested_correction = null;
    selectedWord.value.original_query = null;
  }
};

const handleAiLookup = async () => {
  quickSearchSeq++;
  showDropdown.value = false;
  const query = searchQuery.value.trim();
  if (!query) return;

  loading.value = true;
  errorMessage.value = '';
  selectedWord.value = null;

  try {
    const wordObj = await dictionaryService.aiLookup(query, false);
    if (wordObj) {
      const cleanObj = { ...wordObj };
      if (cleanObj.word && cleanObj.word.toLowerCase() === query.toLowerCase()) {
        cleanObj.suggested_correction = null;
        cleanObj.original_query = null;
      }
      clientWordCache.set(query.toLowerCase(), [cleanObj]);
      selectedWord.value = cleanObj;
      loadHistory();
    } else {
      errorMessage.value = 'Could not find detailed information for this word. Please check the spelling.';
    }
  } catch (err) {
    errorMessage.value = getErrorMessage(err, 'Error looking up word. Please try again shortly.');
  } finally {
    loading.value = false;
  }
};

const selectWord = (word) => {
  quickSearchSeq++;
  selectedWord.value = { ...word, suggested_correction: null, original_query: null };
  searchQuery.value = word.word || '';
  showDropdown.value = false;
  highlightedIndex.value = -1;
  // Ghi nhận lịch sử khi người dùng click chọn từ từ dropdown gợi ý
  if (word.id) {
    dictionaryService.getWordDetail(word.id).catch(() => {});
  }
  loadHistory();
};

const searchQuickWord = (word) => {
  searchQuery.value = word;
  handleSearch();
};

const saveToNotebook = () => {
  if (!selectedWord.value) return;
  if (openSaveWord) {
    openSaveWord(
      selectedWord.value.word,
      selectedWord.value.example_sentence || '',
      selectedWord.value.meaning_vi || '',
      selectedWord.value.ipa || ''
    );
  }
};

const practiceInLab = () => {
  if (!selectedWord.value) return;
  if (ctx.practiceCustomWord) {
    ctx.practiceCustomWord(selectedWord.value);
  } else {
    if (isCustomSpeakingMode) isCustomSpeakingMode.value = true;
    if (targetSpeakingText) targetSpeakingText.value = selectedWord.value.word;
    if (ctx.targetIpa) ctx.targetIpa.value = (selectedWord.value.ipa || '').replace(/^\/+|\/+$/g, '').trim();
    if (ctx.targetTranslation) ctx.targetTranslation.value = selectedWord.value.meaning_vi || selectedWord.value.definition_en || '';
    if (ctx.nativeAudioUrl) ctx.nativeAudioUrl.value = selectedWord.value.audio_url || '';
    if (ctx.selectedSpeakingContentId) ctx.selectedSpeakingContentId.value = null;
    if (ctx.speakingLessonId) ctx.speakingLessonId.value = null;
    if (ctx.currentLesson) ctx.currentLesson.value = null;
    if (ctx.lessonDetail) ctx.lessonDetail.value = null;
    if (ctx.speakingResult) ctx.speakingResult.value = null;
    if (navigateTab) navigateTab('speaking');
  }
};

const practiceExampleSentence = () => {
  if (!selectedWord.value?.example_sentence) return;
  const sentenceData = {
    word: selectedWord.value.example_sentence,
    meaning_vi: selectedWord.value.example_translation || '',
    ipa: '',
    audio_url: ''
  };
  if (ctx.practiceCustomWord) {
    ctx.practiceCustomWord(sentenceData);
  } else {
    if (isCustomSpeakingMode) isCustomSpeakingMode.value = true;
    if (targetSpeakingText) targetSpeakingText.value = sentenceData.word;
    if (ctx.targetIpa) ctx.targetIpa.value = '';
    if (ctx.targetTranslation) ctx.targetTranslation.value = sentenceData.meaning_vi;
    if (ctx.nativeAudioUrl) ctx.nativeAudioUrl.value = '';
    if (ctx.selectedSpeakingContentId) ctx.selectedSpeakingContentId.value = null;
    if (ctx.speakingLessonId) ctx.speakingLessonId.value = null;
    if (ctx.currentLesson) ctx.currentLesson.value = null;
    if (ctx.lessonDetail) ctx.lessonDetail.value = null;
    if (ctx.speakingResult) ctx.speakingResult.value = null;
    if (navigateTab) navigateTab('speaking');
  }
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
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

