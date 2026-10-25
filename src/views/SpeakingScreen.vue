<template>
  <div v-if="activeTab === 'speaking' && isAuthenticated" class="space-y-6 pb-28 w-full max-w-6xl mx-auto">
    <!-- Top Back Button (Only visible when navigated from a lesson or another screen) -->
    <div v-if="hasHistory">
      <button
        @click="goBack"
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs cursor-pointer group"
      >
        <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>{{ ctx.currentLesson.value ? 'Back to Lesson' : 'Back' }}</span>
      </button>
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs uppercase tracking-wide font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Speaking Lab</span>
        <h1 class="text-gray-900 mt-1.5 text-2xl sm:text-3xl font-extrabold leading-snug">Pronunciation &amp; Speech Feedback</h1>
      </div>
      <span class="text-sm font-semibold text-gray-600 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
        <Sparkles class="w-4 h-4 text-blue-500" /> Standard IPA Practice
      </span>
    </div>

    <!-- Lesson & Target Picker -->
    <div v-if="ctx.currentLesson.value?.type === 'SPEAKING'" class="space-y-2 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">
      Practiced {{ ctx.lessonProgress.value.completed_content_ids.length }}/{{ speakingLessonContents.length }} sentences in this lesson.
      <button @click="ctx.finishLesson" :disabled="!ctx.canFinishLesson.value" class="block font-semibold underline disabled:opacity-40">Complete &amp; view summary</button>
    </div>
    <div class="glass-panel rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4 transition-all duration-300">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-gray-700">Practice Sentence:</span>
        <button
          v-if="!ctx.currentLesson.value"
          :disabled="isRecording || isAnalyzingSpeaking" @click="toggleSpeakingMode"
          class="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
        >
          {{ isCustomSpeakingMode ? 'Select from Lessons' : 'Custom Sentence' }}
        </button>
      </div>

      <fieldset :disabled="isRecording || isAnalyzingSpeaking">
      <TopicLessonDropdowns
        v-if="!isCustomSpeakingMode && !ctx.currentLesson.value"
        :topics="topics"
        :lessons="speakingLessons"
        v-model:topic-id="speakingTopicId"
        v-model:lesson-id="speakingLessonId"
        :loading="speakingLessonsLoading"
        @topic-change="onSpeakingTopicChange"
        @lesson-change="onSpeakingLessonChange"
      />
      </fieldset>

      <div v-if="!isCustomSpeakingMode && speakingLessonContents.length > 0" class="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 via-white to-amber-50/60 p-3">
        <div class="mb-2 flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wide text-violet-700">Sentence Practice</span>
          <span class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-violet-600 shadow-sm">
            {{ currentSpeakingSentenceIndex + 1 }} / {{ speakingLessonContents.length }}
          </span>
        </div>
        <div class="mb-3 flex gap-1">
          <span
            v-for="(_, index) in speakingLessonContents"
            :key="index"
            class="h-1.5 flex-1 rounded-full transition-colors"
            :class="index <= currentSpeakingSentenceIndex ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-violet-100'"
          ></span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <button
            type="button"
            :disabled="isRecording || isAnalyzingSpeaking || currentSpeakingSentenceIndex === 0"
            class="inline-flex items-center gap-1 rounded-xl border border-violet-100 bg-white px-3 py-2 text-xs font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
            @click="navigateSpeakingSentence(-1)"
          >
            <ChevronLeft class="h-3.5 w-3.5" /> Prev
          </button>
          <span class="text-xs font-semibold text-slate-500">Read current sentence then proceed</span>
          <button
            type="button"
            :disabled="isRecording || isAnalyzingSpeaking || currentSpeakingSentenceIndex >= speakingLessonContents.length - 1"
            class="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-violet-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
            @click="navigateSpeakingSentence(1)"
          >
            Next <ChevronRight class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <!-- Target Sentence Display / Input -->
      <div class="space-y-3">
        <textarea
          v-model="targetSpeakingText"
          :readonly="!isCustomSpeakingMode || isRecording || isAnalyzingSpeaking"
          rows="3"
          class="w-full text-base sm:text-lg font-bold text-gray-900 rounded-2xl p-4 sm:p-5 border leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs"
          :class="isCustomSpeakingMode ? 'bg-white border-indigo-300' : 'bg-gray-50/80 border-gray-200 cursor-default'"
          placeholder="Type an English sentence you want to practice..."
        ></textarea>

        <div class="flex items-center justify-between pt-1">
          <button
            @click="playNativeAudio"
            :disabled="!targetSpeakingText"
            class="flex items-center gap-2 text-sm sm:text-base font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition cursor-pointer shadow-2xs"
          >
            <Volume2 class="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Sample Audio</span>
          </button>
          <span v-if="targetIpa" class="text-sm sm:text-base font-sans text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
            /{{ targetIpa }}/
          </span>
        </div>

        <p v-if="targetTranslation" class="text-sm sm:text-base text-amber-900 bg-amber-50/80 p-3.5 rounded-xl border border-amber-200/70 leading-relaxed">
          💡 <strong>Meaning:</strong> {{ targetTranslation }}
        </p>
      </div>
    </div>

    <!-- AI Evaluation Results (Real from API) -->
    <div v-if="speakingResult" class="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-md space-y-6">
      <!-- Header Summary with Score & Audio Comparison -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div class="flex items-center gap-3.5">
          <div
            class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-extrabold text-xl sm:text-2xl shadow-xs shrink-0"
            :class="speakingResult.overall_score >= 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : speakingResult.overall_score >= 60 ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-rose-50 text-rose-600 border border-rose-200'"
          >
            {{ Math.round(speakingResult.overall_score) }}
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-bold text-gray-900">
              {{ speakingResult.overall_score >= 80 ? '🌟 Excellent Pronunciation' : speakingResult.overall_score >= 60 ? '💡 Good, minor improvements needed' : '⚠️ Needs Practice' }}
            </h3>
            <p class="text-sm text-gray-500 mt-0.5">
              Overall Score: <span class="font-bold text-gray-800">{{ Math.round(speakingResult.overall_score) }}/100</span> · Pitch: <span class="font-bold text-gray-800">{{ speakingResult.average_pitch ? Math.round(speakingResult.average_pitch) + ' Hz' : 'N/A' }}</span>
            </p>
          </div>
        </div>

        <!-- Audio Player Toolbar (Listen to Native vs Listen to User) -->
        <div class="flex items-center gap-2.5">
          <button
            @click="playNativeAudio"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition shadow-2xs cursor-pointer"
            title="Listen to native sample"
          >
            <Volume2 class="w-4 h-4" />
            <span>Sample</span>
          </button>

          <button
            v-if="speakingResult.audio_user_url"
            @click="playUserAudio"
            :disabled="isPlayingUserAudio"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Listen to your recording"
          >
            <Headphones class="w-4 h-4" :class="{ 'animate-bounce': isPlayingUserAudio }" />
            <span>{{ isPlayingUserAudio ? 'Playing...' : 'Your Voice' }}</span>
          </button>
        </div>
      </div>

      <!-- What the system heard -->
      <div class="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span class="text-slate-500 font-medium">Transcribed text:</span>
        <span class="font-semibold text-slate-800 text-right italic" :title="speakingResult.transcribed_text">
          "{{ speakingResult.transcribed_text || 'Not recorded' }}"
        </span>
      </div>

            <!-- Interactive Sentence Matrix (Click a word to inspect) -->
            <div v-if="speakingResult.word_analysis && speakingResult.word_analysis.length > 0" class="space-y-3">
              <div class="flex items-center justify-between text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">
                <span class="flex items-center gap-1.5">
                  <Info class="w-4 h-4 text-indigo-500" />
                  Click each word to inspect phonemes &amp; corrections:
                </span>
                <span v-if="selectedWord" class="text-indigo-600 font-normal normal-case">
                  (selected: <strong class="font-bold uppercase">{{ selectedWord.word }}</strong>)
                </span>
              </div>

              <div class="p-5 bg-gray-50/90 rounded-2xl border border-gray-200/80 flex flex-wrap gap-3 items-stretch">
                <button
                  v-for="(w, idx) in speakingResult.word_analysis"
                  :key="idx"
                  @click="selectedWordIndex = idx"
                  type="button"
                  class="card-spring group relative flex flex-col items-center justify-between px-4.5 py-3 rounded-2xl border cursor-pointer text-left"
                  :class="[
                    selectedWordIndex === idx ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105 shadow-md z-10' : 'hover:scale-102 hover:shadow-xs',
                    w.status === 'CORRECT' ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900' :
                    w.status === 'WEAK' ? 'bg-amber-50/90 border-amber-300 text-amber-900' :
                    'bg-rose-50/90 border-rose-300 text-rose-900'
                  ]"
                >
                  <!-- Word Text -->
                  <span class="font-bold text-base sm:text-lg leading-tight flex items-center gap-1.5">
                    {{ w.word }}
                    <span v-if="w.status === 'CORRECT'" class="text-xs text-emerald-600">✓</span>
                    <span v-else-if="w.status === 'WEAK'" class="text-xs text-amber-600">⚠️</span>
                    <span v-else class="text-xs text-rose-600">✕</span>
                  </span>

                  <!-- Target IPA -->
                  <span v-if="w.target_ipa" class="text-xs font-sans opacity-70 mt-0.5">
                    /{{ w.target_ipa }}/
                  </span>

                  <!-- Score badge pill -->
                  <span
                    class="mt-2 px-2 py-0.5 rounded-full text-xs font-bold"
                    :class="w.status === 'CORRECT' ? 'bg-emerald-200/70 text-emerald-800' : w.status === 'WEAK' ? 'bg-amber-200/70 text-amber-800' : 'bg-rose-200/70 text-rose-800'"
                  >
                    {{ w.score !== null ? Math.round(w.score) + '%' : '0%' }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Word Diagnostic Inspector Box (Soi chi tiết từ đang chọn) -->
            <div v-if="selectedWord" class="p-5 sm:p-6 rounded-2xl border transition-all space-y-4"
              :class="selectedWord.status === 'CORRECT' ? 'bg-emerald-50/40 border-emerald-200' : selectedWord.status === 'WEAK' ? 'bg-amber-50/40 border-amber-200' : 'bg-rose-50/40 border-rose-200'"
            >
              <!-- Inspector Header -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/60">
                <div class="flex items-center gap-2.5 flex-wrap">
                  <span class="text-xl sm:text-2xl font-black text-gray-900 tracking-wide">{{ selectedWord.word }}</span>
                  <span v-if="selectedWord.target_ipa" class="text-base font-sans text-gray-700 bg-white/90 px-3 py-1 rounded-xl border border-gray-200">
                    /{{ selectedWord.target_ipa }}/
                  </span>
                  <span
                    class="text-xs sm:text-sm font-bold px-3 py-1 rounded-full"
                    :class="selectedWord.status === 'CORRECT' ? 'bg-emerald-100 text-emerald-800' : selectedWord.status === 'WEAK' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'"
                  >
                    {{ selectedWord.status === 'CORRECT' ? '✓ Standard' : selectedWord.status === 'WEAK' ? '⚠️ Needs improvement' : '✕ Inaccurate' }} ({{ selectedWord.score !== null ? Math.round(selectedWord.score) : 0 }}%)
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    @click="playWordAudio(selectedWord.word)"
                    class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-xl shadow-2xs transition cursor-pointer"
                    title="Listen to this word"
                  >
                    <Volume2 class="w-4 h-4" /> Listen
                  </button>
                  <button
                    @click="ctx.openSaveWord(selectedWord.word, targetSpeakingText)"
                    class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl shadow-2xs transition cursor-pointer"
                    title="Save to vocabulary book"
                  >
                    <BookmarkPlus class="w-4 h-4 text-amber-600" /> Save Word
                  </button>
                </div>
              </div>

              <!-- Phoneme-by-Phoneme Visualizer -->
              <div v-if="selectedWord.phonemes && selectedWord.phonemes.length > 0" class="pt-2 space-y-2">
                <span class="text-xs sm:text-sm font-bold text-gray-700 block">Phoneme breakdown:</span>
                <div class="grid grid-flow-col auto-cols-fr gap-2 sm:gap-3">
                  <div
                    v-for="(p, pIdx) in selectedWord.phonemes"
                    :key="pIdx"
                    class="p-3 sm:p-4 rounded-xl text-center border flex flex-col items-center justify-between shadow-2xs"
                    :class="p.status === 'CORRECT' ? 'bg-white border-emerald-300' : p.status === 'WEAK' ? 'bg-white border-amber-300' : 'bg-white border-rose-300'"
                  >
                    <span
                      class="text-xl sm:text-2xl font-black"
                      :class="p.status === 'CORRECT' ? 'text-emerald-600' : p.status === 'WEAK' ? 'text-amber-600' : 'text-rose-600'"
                    >
                      {{ p.char }}
                    </span>
                    <span class="text-xs font-bold mt-1 text-gray-600">
                      {{ Math.round(p.score) }}%
                    </span>
                    <!-- Status dot/indicator -->
                    <span
                      class="w-full h-1.5 rounded-full mt-2"
                      :class="p.status === 'CORRECT' ? 'bg-emerald-500' : p.status === 'WEAK' ? 'bg-amber-500' : 'bg-rose-500'"
                    ></span>
                  </div>
                </div>
              </div>

              <!-- Detailed Error Diagnosis & Articulatory Guide -->
              <div class="pt-2 space-y-3">
                <div v-if="selectedWord.error_type" class="p-3.5 rounded-xl bg-white/95 border border-amber-200 text-sm flex items-start gap-2.5 text-amber-900 shadow-2xs">
                  <AlertCircle class="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong class="font-bold">Detected issue:</strong> {{ selectedWord.error_type }}
                  </div>
                </div>

                <!-- Actionable Articulatory Guide -->
                <div class="p-4 rounded-xl bg-white/95 border border-indigo-100 text-sm sm:text-base space-y-1.5 shadow-2xs">
                  <p class="font-bold text-indigo-950 flex items-center gap-2">
                    <Lightbulb class="w-4 h-4 text-indigo-600" />
                    <span>Mouth shape &amp; tongue placement guide:</span>
                  </p>
                  <p class="text-gray-700 leading-relaxed">
                    {{ getArticulatoryGuide(selectedWord) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Actionable Summary List of Words Needing Improvement -->
            <div v-if="problemWords.length > 0" class="space-y-3 pt-2">
              <h4 class="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <AlertCircle class="w-4 h-4 text-rose-500" />
                <span>Words needing improvement ({{ problemWords.length }} words):</span>
              </h4>
              <div class="space-y-2">
                <div
                  v-for="(pw, pIdx) in problemWords"
                  :key="pIdx"
                  @click="selectWordByObject(pw)"
                  class="flex items-center justify-between p-3.5 rounded-xl border bg-white hover:bg-gray-50 transition cursor-pointer text-sm shadow-2xs"
                  :class="pw.status === 'INCORRECT' ? 'border-rose-200' : 'border-amber-200'"
                >
                  <div class="flex items-center gap-2.5">
                    <span
                      class="px-2.5 py-1 rounded-lg font-bold text-sm"
                      :class="pw.status === 'INCORRECT' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'"
                    >
                      {{ pw.word }}
                    </span>
                    <span v-if="pw.target_ipa" class="text-gray-500 font-sans">/{{ pw.target_ipa }}/</span>
                    <span class="text-gray-700 font-medium ml-1">
                      {{ pw.error_type || 'Pronunciation needs practice' }}
                    </span>
                  </div>
                  <button class="text-indigo-600 font-bold hover:underline shrink-0 cursor-pointer text-xs sm:text-sm">
                    View guide →
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm sm:text-base text-emerald-800 flex items-center gap-2.5">
              <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Great job! You pronounced all words clearly and accurately.</span>
            </div>

            <!-- Phonetic Error Tip Box -->
            <div v-if="speakingResult.ai_feedback" class="p-4 sm:p-5 bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200/80 rounded-2xl text-sm sm:text-base space-y-2">
              <p class="font-bold text-amber-900 flex items-center gap-2">
                <Sparkles class="w-4 h-4 text-amber-600" /> Summary Feedback:
              </p>
              <p class="text-amber-900 leading-relaxed whitespace-pre-line font-medium">
                {{ speakingResult.ai_feedback }}
              </p>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="speakingError" class="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm sm:text-base text-rose-700 font-medium">
            ⚠️ {{ speakingError }}
          </div>

          <!-- Interaction Area (Animate UI Spring Mic with Soundwave Equalizer) -->
          <div class="pt-6 flex flex-col items-center justify-center space-y-4">
            <!-- Floating Animated Soundwave Pill when recording -->
            <transition
              enter-active-class="transition duration-300 ease-spring"
              enter-from-class="opacity-0 -translate-y-2 scale-90"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition duration-200 ease-spring"
              leave-from-class="opacity-100 translate-y-0 scale-100"
              leave-to-class="opacity-0 -translate-y-2 scale-90"
            >
              <div v-if="isRecording" class="flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-slate-900/90 text-white shadow-xl backdrop-blur-md border border-slate-700/60 mb-1">
                <span class="sound-bar" v-for="n in 7" :key="n"></span>
                <span class="text-xs font-mono font-bold tracking-widest ml-2 text-rose-400">RECORDING</span>
              </div>
            </transition>

            <div class="relative flex items-center justify-center">
              <!-- Multi-layered expanding radar rings -->
              <div v-if="isRecording" class="radar-ring"></div>
              <div v-if="isRecording" class="radar-ring-2"></div>
              <span v-if="isRecording" class="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-rose-500/20 animate-ping"></span>
              
              <button
                @click="toggleRecording"
                :disabled="isAnalyzingSpeaking"
                :aria-label="isAnalyzingSpeaking ? 'Analyzing speech' : isRecording ? 'Stop recording & evaluate' : 'Start recording'"
                :title="isRecording ? 'Stop recording & evaluate' : 'Start recording'"
                :class="isRecording ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-rose-500/40 ring-4 ring-rose-200' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-600/30 ring-4 ring-blue-100'"
                class="btn-spring relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-xl cursor-pointer disabled:opacity-50"
              >
                <Square v-if="isRecording" class="w-9 h-9 fill-current" />
                <Mic v-else-if="!isAnalyzingSpeaking" class="w-10 h-10 transition-transform duration-200 group-hover:scale-110" />
                <Loader2 v-else class="w-10 h-10 animate-spin text-white" />
              </button>
            </div>
            <div class="text-center">
              <p class="text-base sm:text-lg font-bold text-gray-800 transition-colors">
                {{ isAnalyzingSpeaking ? 'Analyzing pronunciation...' : (isRecording ? 'Listening... Tap to submit' : 'Tap microphone to start speaking') }}
              </p>
              <p class="text-xs sm:text-sm text-gray-500 mt-0.5">
                {{ isRecording ? 'Speak clearly into the microphone' : 'Record via microphone for instant feedback' }}
              </p>
            </div>
          </div>
        </div>
</template>

<script setup>
import {
  AlertCircle,
  ArrowLeft,
  BookmarkPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Headphones,
  Info,
  Lightbulb,
  Loader2,
  Mic,
  Sparkles,
  Square,
  Volume2,
  XCircle,
} from 'lucide-vue-next';
import { computed, inject, ref, watch } from 'vue';
import TopicLessonDropdowns from '../components/TopicLessonDropdowns.vue';
import { getFullAudioUrl } from '../services/api';

const ctx = inject('screenContext');
const goBack = ctx.goBack;
const hasHistory = ctx.hasHistory;

const toggleSpeakingMode = () => {
  ctx.isCustomSpeakingMode.value = !ctx.isCustomSpeakingMode.value;
  ctx.speakingResult.value = null;
  ctx.speakingError.value = '';
  if (!ctx.isCustomSpeakingMode.value) ctx.onSpeakingLessonChange();
  else { ctx.targetIpa.value = ''; ctx.targetTranslation.value = ''; ctx.nativeAudioUrl.value = ''; }
};

// Interactive Diagnostic State
const selectedWordIndex = ref(0);
const isPlayingUserAudio = ref(false);
let userAudioPlayer = null;

const speakingResult = ctx.speakingResult;

const selectedWord = computed(() => {
  const words = speakingResult.value?.word_analysis;
  if (!words || words.length === 0) return null;
  const idx = selectedWordIndex.value;
  return words[idx] || words[0];
});

const problemWords = computed(() => {
  const words = speakingResult.value?.word_analysis;
  if (!words) return [];
  return words.filter((w) => w.status === 'INCORRECT' || w.status === 'WEAK');
});

watch(
  () => speakingResult.value,
  (newResult) => {
    if (!newResult || !newResult.word_analysis || newResult.word_analysis.length === 0) {
      selectedWordIndex.value = 0;
      return;
    }
    const firstProblemIdx = newResult.word_analysis.findIndex(
      (w) => w.status === 'INCORRECT' || w.status === 'WEAK'
    );
    selectedWordIndex.value = firstProblemIdx >= 0 ? firstProblemIdx : 0;
  },
  { immediate: true }
);

const selectWord = (index) => {
  selectedWordIndex.value = index;
};

const selectWordByObject = (pw) => {
  const words = speakingResult.value?.word_analysis;
  if (!words) return;
  const idx = words.findIndex((w) => w === pw || (w.word === pw.word && w.start_time === pw.start_time));
  if (idx >= 0) {
    selectedWordIndex.value = idx;
  }
};

const playUserAudio = () => {
  const userAudioUrl = speakingResult.value?.audio_user_url;
  if (!userAudioUrl) return;

  if (userAudioPlayer) {
    userAudioPlayer.pause();
    userAudioPlayer.currentTime = 0;
  }

  const fullUrl = getFullAudioUrl(userAudioUrl);
  userAudioPlayer = new Audio(fullUrl);
  isPlayingUserAudio.value = true;

  userAudioPlayer.onended = () => {
    isPlayingUserAudio.value = false;
  };
  userAudioPlayer.onerror = () => {
    isPlayingUserAudio.value = false;
  };

  userAudioPlayer.play().catch(() => {
    isPlayingUserAudio.value = false;
  });
};

const playWordAudio = (word) => {
  if (!word) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  } else if (ctx.speakText) {
    ctx.speakText(word);
  }
};

const ARTICULATORY_GUIDES = {
  th: "Place the tip of your tongue between your upper and lower teeth, blow gentle air outward (voiceless in 'think', voiced vibrating vocal cords in 'this/with').",
  s: "Bring teeth lightly together, place tongue tip near upper gums, blow a crisp hiss /s/ through teeth.",
  sh: "Round lips forward, curve tongue body up toward palate, blow steady air for /ʃ/ ('ship', 'should').",
  ch: "Start with /t/ tongue position, then release air sharply into /tʃ/ ('chair', 'much').",
  t: "Place tongue tip against alveolar ridge behind upper teeth, compress air and release crisply as /t/.",
  d: "Similar to /t/, but vibrate vocal cords upon release as /d/ ('and', 'backend', 'world').",
  k: "Raise the back of your tongue against the soft palate, build air pressure, and release sharply as /k/.",
  g: "Similar to /k/, but vibrate vocal cords for /g/.",
  p: "Press lips firmly together to stop airflow, then pop them open with a burst of air /p/.",
  b: "Similar to /p/, but vibrate vocal cords as lips open for /b/.",
  v: "Place upper teeth lightly against lower lip, exhale while vibrating vocal cords /v/ ('developer', 'have').",
  f: "Place upper teeth lightly against lower lip, blow air without vibrating vocal cords /f/.",
  z: "Same mouth shape as /s/, but vibrate vocal cords in throat /z/ ('is', 'as', 'MySQL').",
  l: "Touch tongue tip to upper gum ridge, letting air flow smoothly past the sides of the tongue /l/.",
  r: "Curl tongue tip back toward roof of mouth (without touching), round lips slightly /r/.",
  w: "Round lips tightly as if whistling, then widen lips into the following sound /w/ ('with', 'word').",
  m: "Close lips firmly, resonate sound through the nasal cavity /m/ ('am', 'my').",
  n: "Touch tongue tip to roof of mouth behind front teeth, let air resonate through nose /n/ ('in', 'python').",
  ng: "Raise tongue back against soft palate, let sound resonate through nose /ŋ/ ('sing', 'English').",
};

const getArticulatoryGuide = (wordObj) => {
  if (!wordObj) return '';
  if (wordObj.error_type === 'Bỏ sót hoặc chưa phát âm từ này' || wordObj.error_type === 'Missing or omitted word') {
    return 'This word was omitted or not heard in the recording. Listen to the sample audio and practice reciting the full sentence.';
  }
  const word = (wordObj.word || '').toLowerCase();
  const ipa = (wordObj.target_ipa || '').toLowerCase();

  if (word === 'with' || ipa.includes('dh') || ipa.includes('th')) {
    return "Sound /ð/ or /θ/: Place your tongue tip between teeth and release gentle air. Avoid replacing with /d/ or /t/.";
  }
  if (word === 'mysql') {
    return "Acronym 'MySQL' is pronounced /maɪ ˈɛs kjuː ˈɛl/: Enunciate each syllable: 'My' + 'S' (hiss) + 'Q' + 'L'.";
  }
  if (word.endsWith('ed') || word.endsWith('d')) {
    return "Ending sound /d/: Touch tongue tip to upper gum ridge, release gently with vocal vibration. Do not swallow the ending sound.";
  }
  if (word.endsWith('t') || word.endsWith('te')) {
    return "Ending sound /t/: Place tongue tip behind upper teeth, release crisp burst of air without vocal vibration.";
  }
  if (word.endsWith('s') || word.endsWith('ce') || word.endsWith('se')) {
    return "Ending sound /s/ or /z/: Bring teeth lightly together and blow sharp hissing air. Ensure the ending consonant is pronounced.";
  }
  if (word.includes('tion') || word.includes('sh')) {
    return "Sound /ʃ/: Round lips slightly into an oval, raise tongue body near palate, blow a smooth stream of air.";
  }
  if (word.startsWith('w') || word.includes('wh')) {
    return "Sound /w/: Round lips tightly like a small circle, then release cleanly into the vowel. Avoid biting lip like /v/.";
  }
  if (word.includes('ee') || word.includes('ea') || ipa.includes('iy')) {
    return "Long vowel /iː/: Smile with lips pulled wide, extend the duration longer than the short /ɪ/ ('ship' vs 'sheep').";
  }
  if (word.includes('oo') || ipa.includes('uw')) {
    return "Long vowel /uː/: Purse lips forward tightly, keep tongue pulled back and sustain the tone.";
  }

  const weakPhonemes = (wordObj.phonemes || []).filter((p) => p.status !== 'CORRECT');
  if (weakPhonemes.length > 0) {
    const char = weakPhonemes[0].char.toLowerCase();
    if (ARTICULATORY_GUIDES[char]) {
      return `Focus on sound '${char}': ${ARTICULATORY_GUIDES[char]}`;
    }
  }

  return "Open mouth moderately, enunciate each syllable clearly, and pay special attention to ending consonant sounds.";
};

const activeTab = ctx.activeTab;
const chatInput = ctx.chatInput;
const chatLoading = ctx.chatLoading;
const chatMessages = ctx.chatMessages;
const chatRecorder = ctx.chatRecorder;
const chatScenarioId = ctx.chatScenarioId;
const chatScrollContainer = ctx.chatScrollContainer;
const checkQuizAnswer = ctx.checkQuizAnswer;
const clockInterval = ctx.clockInterval;
const conversationId = ctx.conversationId;
const copied = ctx.copied;
const copyRewritten = ctx.copyRewritten;
const currentCard = ctx.currentCard;
const currentChatScenario = ctx.currentChatScenario;
const currentQuestion = ctx.currentQuestion;
const currentStudyIndex = ctx.currentStudyIndex;
const currentTime = ctx.currentTime;
const dashboard = ctx.dashboard;
const essayInput = ctx.essayInput;
const flashcards = ctx.flashcards;
const getActivityBadgeClass = ctx.getActivityBadgeClass;
const getQuizAnswerClass = ctx.getQuizAnswerClass;
const getTopicColor = ctx.getTopicColor;
const getTopicEmoji = ctx.getTopicEmoji;
const getWordBg = ctx.getWordBg;
const getWordTextColor = ctx.getWordTextColor;
const homeLoading = ctx.homeLoading;
const isAnalyzingSpeaking = ctx.isAnalyzingSpeaking;
const isAuthOpen = ctx.isAuthOpen;
const isAuthenticated = ctx.isAuthenticated;
const isBotTyping = ctx.isBotTyping;
const isChatRecording = ctx.isChatRecording;
const isCustomSpeakingMode = ctx.isCustomSpeakingMode;
const isEvaluating = ctx.isEvaluating;
const isFlipped = ctx.isFlipped;
const isProfileOpen = ctx.isProfileOpen;
const isRecording = ctx.isRecording;
const isSubmittingQuiz = ctx.isSubmittingQuiz;
const loadChatScenarios = ctx.loadChatScenarios;
const loadFlashcardsData = ctx.loadFlashcardsData;
const loadHomeData = ctx.loadHomeData;
const loadQuizzesData = ctx.loadQuizzesData;
const logout = ctx.logout;
const nativeAudioUrl = ctx.nativeAudioUrl;
const nextQuizQuestion = ctx.nextQuizQuestion;
const onAuthSuccess = ctx.onAuthSuccess;
const onProfileUpdated = ctx.onProfileUpdated;
const onQuizChange = ctx.onQuizChange;
const onSpeakingLessonChange = ctx.onSpeakingLessonChange;
const onSpeakingTopicChange = ctx.onSpeakingTopicChange;
const openAuthModal = ctx.openAuthModal;
const playNativeAudio = ctx.playNativeAudio;
const quizChecked = ctx.quizChecked;
const quizQuestions = ctx.quizQuestions;
const quizzesList = ctx.quizzesList;
const recorder = ctx.recorder;
const resetChatConversation = ctx.resetChatConversation;
const scenarios = ctx.scenarios;
const scrollChatToBottom = ctx.scrollChatToBottom;
const selectQuizAnswer = ctx.selectQuizAnswer;
const selectedQuizAnswer = ctx.selectedQuizAnswer;
const selectedQuizId = ctx.selectedQuizId;
const sendChatText = ctx.sendChatText;
const speakBotMessage = ctx.speakBotMessage;
const speakText = ctx.speakText;
const speakingError = ctx.speakingError;
const speakingLessonId = ctx.speakingLessonId;
const speakingLessons = ctx.speakingLessons;
const speakingLessonsLoading = ctx.speakingLessonsLoading;
const speakingLessonContents = ctx.speakingLessonContents;
const currentSpeakingSentenceIndex = ctx.currentSpeakingSentenceIndex;
const navigateSpeakingSentence = ctx.navigateSpeakingSentence;
const speakingTopicId = ctx.speakingTopicId;
const startChatConversation = ctx.startChatConversation;
const startTopic = ctx.startTopic;
const stopAndAnalyzeSpeaking = ctx.stopAndAnalyzeSpeaking;
const studyLoading = ctx.studyLoading;
const studyMode = ctx.studyMode;
const submitWritingEvaluation = ctx.submitWritingEvaluation;
const submittedQuizDetail = ctx.submittedQuizDetail;
const switchChatScenario = ctx.switchChatScenario;
const switchStudyMode = ctx.switchStudyMode;
const targetIpa = ctx.targetIpa;
const targetSpeakingText = ctx.targetSpeakingText;
const targetTranslation = ctx.targetTranslation;
const toggleChatVoice = ctx.toggleChatVoice;
const toggleRecording = ctx.toggleRecording;
const topics = ctx.topics;
const totalPracticeCount = ctx.totalPracticeCount;
const totalStudyItems = ctx.totalStudyItems;
const updateClock = ctx.updateClock;
const userAvatarUrl = ctx.userAvatarUrl;
const userProfile = ctx.userProfile;
const wordCount = ctx.wordCount;
const writingError = ctx.writingError;
const writingResult = ctx.writingResult;
const writingSubTab = ctx.writingSubTab;
</script>
