<template>
  <div v-if="activeTab === 'flashcard'" class="space-y-6 pb-28 w-full max-w-6xl mx-auto">
    <!-- Top Back Button (Only visible when navigated from a lesson or another screen) -->
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
        <span>{{ ctx.currentLesson?.value ? 'Back to Lesson' : 'Back' }}</span>
      </AnimateButton>
    </div>

    <!-- Header & Flow Progress -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs uppercase tracking-wide font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">Vocabulary Deck</span>
          <h1 class="text-gray-900 mt-1.5 text-2xl sm:text-3xl font-extrabold leading-snug">Vocabulary Flashcards</h1>
        </div>
        <span v-if="flashcards?.length > 0" class="text-sm sm:text-base font-bold text-gray-700 bg-white border border-gray-200 px-4 py-1.5 rounded-full shadow-2xs">
          Card {{ currentStudyIndex + 1 }} / {{ flashcards.length }}
        </span>
      </div>
      <p class="text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed">
        {{ ctx.currentLesson?.value ? 'Review and memorize vocabulary for this lesson.' : 'Memorize vocabulary with interactive 3D flashcards, IPA phonetics, and real-world examples.' }}
      </p>
      <div v-if="flashcards?.length > 0" class="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          :style="{ width: ((currentStudyIndex + 1) / flashcards.length * 100) + '%' }"
          class="h-full bg-blue-600 rounded-full transition-all duration-300"
        ></div>
      </div>
    </div>

    <!-- Deck Picker by Lesson -->
    <div v-if="isAuthenticated && ctx.flashcardMode?.value === 'all'" class="space-y-3 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-sky-50/60 p-5 sm:p-6 shadow-2xs">
      <label for="flashcard-deck" class="flex items-center gap-2 text-base font-bold text-blue-950">
        <Layers class="h-5 w-5 text-blue-600" aria-hidden="true" />
        <span>Select Deck by Lesson</span>
      </label>
      <select
        id="flashcard-deck"
        v-model="ctx.studyDeckId.value"
        @change="ctx.onStudyDeckChange"
        :disabled="studyLoading || isSavingCardNote || ctx.flashcardDecksLoading?.value"
        class="w-full rounded-2xl border border-blue-200 bg-white p-3.5 text-base text-slate-800 disabled:opacity-60 shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <option v-if="!ctx.currentLesson?.value" :value="null">All Lessons &amp; Personal Decks</option>
        <optgroup v-if="ctx.availableFlashcardDecks?.value?.some(deck => deck.lesson_id)" label="By Lesson">
          <option v-for="deck in ctx.availableFlashcardDecks.value.filter(deck => deck.lesson_id)" :key="deck.id" :value="deck.id">
            {{ deck.title.replace(/^Vocabulary:\s*/i, '') }} · {{ deck.total_cards }} cards
          </option>
        </optgroup>
        <optgroup v-if="ctx.availableFlashcardDecks?.value?.some(deck => !deck.lesson_id)" label="Other &amp; Personal Decks">
          <option v-for="deck in ctx.availableFlashcardDecks.value.filter(deck => !deck.lesson_id)" :key="deck.id" :value="deck.id">
            {{ deck.title }} · {{ deck.total_cards }} cards
          </option>
        </optgroup>
      </select>
      <p v-if="ctx.flashcardDecksLoading?.value" role="status" class="text-xs sm:text-sm text-blue-700">Loading decks…</p>
      <p v-else-if="ctx.flashcardDecksError?.value && !ctx.currentLesson?.value" role="alert" class="text-xs sm:text-sm text-rose-700">
        {{ ctx.flashcardDecksError.value }} <button @click="ctx.loadFlashcardDecks" class="font-semibold underline">Retry</button>
      </p>
      <p class="text-xs sm:text-sm text-slate-600">
        {{ ctx.currentLesson?.value ? 'Vocabulary decks for the current lesson.' : 'Choose vocabulary by lesson or study your custom personal decks.' }}
      </p>
    </div>

    <!-- Mode Selector: All cards vs Noted cards -->
    <div v-if="isAuthenticated" class="space-y-3">
      <div class="grid grid-cols-2 gap-3" aria-label="Flashcard list">
        <button
          v-for="mode in [{ id: 'all', title: ALL_CARDS }, { id: 'noted', title: NOTED_WORDS }]"
          :key="mode.id"
          @click="ctx.setFlashcardMode(mode.id)"
          :disabled="studyLoading || isSavingCardNote"
          :aria-pressed="ctx.flashcardMode?.value === mode.id"
          class="rounded-2xl border px-4 py-3 font-bold transition disabled:opacity-50 cursor-pointer text-sm sm:text-base"
          :class="ctx.flashcardMode?.value === mode.id ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
        >
          {{ mode.title }}
        </button>
      </div>
      <p class="text-sm text-slate-600 max-w-xl leading-relaxed">{{ ctx.flashcardMode?.value === 'noted' ? NOTED_HELP : ALL_HELP }}</p>
    </div>

    <!-- Flashcard Toast Notification -->
    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
      <div v-if="ctx.flashcardToast?.value" class="rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm font-semibold shadow-md flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <Check class="w-4 h-4 text-amber-300 shrink-0" />
          <span>{{ ctx.flashcardToast.value }}</span>
        </div>
        <button @click="ctx.flashcardToast.value = ''" class="text-slate-400 hover:text-white cursor-pointer"><X class="w-4 h-4" /></button>
      </div>
    </transition>

    <p v-if="studyError" role="alert" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm sm:text-base text-rose-700">{{ studyError }}</p>
    
    <div v-if="!isAuthenticated" class="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm sm:text-base text-blue-700">
      Sign in to save your learning progress and review personal cards.
      <button @click="requireAuthentication" class="ml-1 font-bold underline cursor-pointer">Sign In</button>
    </div>

    <!-- Loading State -->
    <div v-if="studyLoading" class="py-16 text-center space-y-3">
      <Loader2 class="w-8 h-8 animate-spin text-blue-600 mx-auto" />
      <p class="text-base text-gray-500">Loading vocabulary cards...</p>
    </div>

    <!-- Empty Cards State -->
    <div v-else-if="!flashcards || flashcards.length === 0" class="p-12 bg-white rounded-3xl border border-gray-100 text-center space-y-4 shadow-xs">
      <Layers class="w-12 h-12 text-blue-300 mx-auto" />
      <h3 class="text-lg font-bold text-gray-800">{{ ctx.flashcardMode?.value === 'noted' ? NO_NOTES : NO_CARDS }}</h3>
      <p class="text-sm sm:text-base text-gray-500 max-w-sm mx-auto leading-relaxed">{{ ctx.flashcardMode?.value === 'noted' ? EMPTY_NOTES_HELP : EMPTY_CARDS_HELP }}</p>
      <button v-if="ctx.flashcardMode?.value === 'noted'" @click="ctx.setFlashcardMode('all')" class="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold">View all cards</button>
      <button @click="loadFlashcardsData" class="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm sm:text-base font-bold hover:bg-blue-100 cursor-pointer">
        Reload Deck
      </button>
    </div>

    <!-- 3D Flashcard Stage -->
    <div v-else class="space-y-5">
      <div
        @click="isFlipped = !isFlipped"
        @keydown.enter.self.prevent="isFlipped = !isFlipped"
        @keydown.space.self.prevent="isFlipped = !isFlipped"
        @keydown.left.self.prevent="ctx.prevFlashcard"
        @keydown.right.self.prevent="ctx.nextFlashcard"
        tabindex="0"
        role="group"
        :aria-label="isFlipped ? 'Flip back to card front' : 'Flip card to view definition and examples'"
        class="flashcard-stage w-full h-84 sm:h-96 md:h-[400px] cursor-pointer select-none outline-none"
      >
        <div :class="{ 'is-flipped': isFlipped }" class="flashcard-inner relative w-full h-full">
          <!-- FRONT SIDE -->
          <div v-show="!isFlipped" :aria-hidden="isFlipped" :inert="isFlipped" class="flashcard-face flashcard-front absolute inset-0 bg-white rounded-3xl p-8 border border-blue-100 shadow-xl flex flex-col justify-between items-center text-center">
            <div class="w-full flex justify-between items-center">
              <div class="flex items-center gap-2">
                <span class="text-xs sm:text-sm font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-lg">Vocabulary</span>
                <span v-if="currentCard?.is_noted" class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                  <Check class="w-3 h-3 text-amber-600" />
                  <span>Bookmarked</span>
                </span>
              </div>
              <AnimateButton
                variant="secondary"
                size="icon"
                @click.stop="speakText(currentCard?.word)"
                aria-label="Listen to pronunciation"
                class="rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/60"
              >
                <Volume2 class="w-5 h-5" />
              </AnimateButton>
            </div>
            <div class="space-y-3">
              <h2 class="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">{{ currentCard?.word }}</h2>
              <div v-if="formatIpa(currentCard?.ipa)" class="inline-flex items-center gap-1.5 px-6 py-2 rounded-2xl bg-blue-50 font-mono font-bold text-base sm:text-lg text-blue-700 tracking-wide">
                <span>{{ formatIpa(currentCard?.ipa) }}</span>
              </div>
            </div>
            <div class="text-xs sm:text-sm text-gray-400 flex items-center gap-1.5">
              <RotateCw class="w-3.5 h-3.5" />
              <span>Tap or press Enter / Space to view definition and examples</span>
            </div>
          </div>

          <!-- BACK SIDE -->
          <div v-show="isFlipped" :aria-hidden="!isFlipped" :inert="!isFlipped" class="flashcard-face flashcard-back absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white to-amber-50/30 rounded-3xl p-8 border border-blue-200 shadow-xl flex flex-col justify-between text-left">
            <div class="flex justify-between items-center">
              <span class="text-xs sm:text-sm font-bold px-3 py-1 bg-blue-600 text-white rounded-lg uppercase">Definition</span>
              <span v-if="currentCard?.is_noted" class="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                <Check class="w-3.5 h-3.5" /> Bookmarked
              </span>
              <span v-else class="text-xs sm:text-sm font-bold text-gray-500">Flexible Review</span>
            </div>
            <div class="space-y-3">
              <div class="flex items-center gap-2 flex-wrap pb-2 border-b border-blue-100/60">
                <span class="font-bold text-gray-900 text-lg sm:text-xl">{{ currentCard?.word }}</span>
                <span v-if="formatIpa(currentCard?.ipa)" class="font-mono text-xs sm:text-sm font-semibold text-blue-600 bg-white px-2.5 py-0.5 rounded-full border border-blue-100">{{ formatIpa(currentCard?.ipa) }}</span>
              </div>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">{{ currentCard?.meaning || 'No definition available' }}</h3>
              <p v-if="currentCard?.hint_example" class="text-base sm:text-lg text-gray-700 italic border-l-4 border-blue-400 pl-4 py-1 leading-relaxed">
                "{{ currentCard.hint_example }}"
              </p>
            </div>
            <p class="text-xs sm:text-sm text-gray-500 text-center">
              Tap to flip back
            </p>
          </div>
        </div>
      </div>

      <!-- Controls under Card -->
      <div class="space-y-3 pt-1">
        <div class="grid grid-cols-3 gap-3">
          <!-- Prev Button -->
          <AnimateButton
            variant="outline"
            size="lg"
            :disabled="isSavingCardNote || currentStudyIndex <= 0"
            @click="ctx.prevFlashcard"
          >
            <template #prefix><ChevronLeft class="w-5 h-5" /></template>
            <span>Previous</span>
          </AnimateButton>

          <!-- Note/Tick Button -->
          <AnimateButton
            v-if="currentCard"
            :variant="currentCard.is_noted ? 'secondary' : 'outline'"
            size="lg"
            :disabled="isSavingCardNote"
            @click="ctx.toggleCardNote(currentCard)"
            :class="currentCard.is_noted ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 shadow-amber-500/10' : ''"
          >
            <template #prefix>
              <Check v-if="currentCard.is_noted" class="w-5 h-5 text-amber-600" />
              <Bookmark v-else class="w-4.5 h-4.5 text-slate-400" />
            </template>
            <span>{{ isSavingCardNote ? SAVING_NOTE : currentCard.is_noted ? 'Bookmarked' : 'Bookmark Card' }}</span>
          </AnimateButton>
          <div v-else></div>

          <!-- Next Button -->
          <AnimateButton
            variant="gradient"
            size="lg"
            :disabled="isSavingCardNote || currentStudyIndex >= (flashcards?.length || 0) - 1"
            @click="ctx.nextFlashcard"
          >
            <span>Next</span>
            <template #suffix><ChevronRight class="w-5 h-5" /></template>
          </AnimateButton>
        </div>

        <p class="text-sm text-slate-600">Bookmark cards to review them anytime in Bookmarked Cards. Unbookmark to remove.</p>

        <!-- Word Quick-Jump List (All flashcards visible) -->
        <div class="mt-3 rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-2xs">
          <div class="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700">
            <span>All cards in this deck ({{ flashcards?.length || 0 }} cards):</span>
            <span class="text-xs text-slate-400">Click a card to jump</span>
          </div>
          <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
            <button
              v-for="(card, idx) in flashcards"
              :key="card.id"
              @click="ctx.jumpToFlashcard(idx)"
              class="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition flex items-center gap-1.5 cursor-pointer border"
              :class="idx === currentStudyIndex
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : card.is_noted
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
            >
              <span>{{ card.word }}</span>
              <Check v-if="card.is_noted" class="h-3.5 w-3.5" aria-label="Bookmarked" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Layers, Loader2, RotateCw, Volume2, X, Bookmark, Sparkles } from 'lucide-vue-next';
import AnimateButton from '../components/ui/Button.vue';
import AnimateCard from '../components/ui/Card.vue';
import AnimateBadge from '../components/ui/Badge.vue';
import AnimateCountingNumber from '../components/ui/CountingNumber.vue';
import { inject } from 'vue';

const ctx = inject('screenContext');
const ALL_CARDS = 'All Cards';
const NOTED_WORDS = 'Bookmarked Cards';
const NOTED_HELP = 'Cards you have bookmarked across all decks. Unbookmark to remove from this list.';
const ALL_HELP = 'Flip cards to see definitions and examples. Bookmark cards you want to revisit later.';
const NO_NOTES = 'No bookmarked cards yet';
const NO_CARDS = 'No flashcards available';
const EMPTY_NOTES_HELP = 'Switch to All Cards and bookmark words you want to save. Bookmarked words will appear here.';
const EMPTY_CARDS_HELP = 'This deck has no cards yet. Choose another lesson or save new words from the Dictionary.';
const SAVING_NOTE = 'Saving…';

const goBack = ctx.goBack;
const hasHistory = ctx.hasHistory;

const formatIpa = (ipa) => {
  if (!ipa) return '';
  const clean = String(ipa).replace(/^\/+|\/+$/g, '').trim();
  return clean ? `/${clean}/` : '';
};

const {
  isAuthenticated,
  studyError, isSavingCardNote, requireAuthentication, activeTab,
  currentCard, currentStudyIndex, flashcards, isFlipped,
  loadFlashcardsData, speakText, studyLoading
} = ctx;
</script>

<style scoped>
.flashcard-stage {
  perspective: 1000px;
  perspective-origin: center;
}

.flashcard-inner {
  transform-style: preserve-3d;
  transform-origin: center;
  transition: transform 560ms ease-in-out;
  will-change: transform;
}

.flashcard-inner.is-flipped {
  transform: rotateY(180deg);
}

.flashcard-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flashcard-back {
  transform: rotateY(180deg);
}

.flashcard-stage:focus-visible .flashcard-front,
.flashcard-stage:focus-visible .flashcard-back {
  outline: 3px solid rgba(59, 130, 246, 0.45);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .flashcard-inner {
    transition-duration: 1ms;
  }
}
</style>

