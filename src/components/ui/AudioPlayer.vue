<template>
  <div class="audio-player-capsule flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-slate-50/90 border border-slate-200/90 hover:border-blue-300 transition-all duration-200 shadow-2xs group">
    <!-- Hidden native audio element -->
    <audio
      ref="audioRef"
      :src="src"
      preload="metadata"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @error="onError"
    />

    <!-- Play / Pause Button -->
    <button
      type="button"
      @click.stop="togglePlay"
      :disabled="loading"
      :aria-label="isPlaying ? 'Pause audio' : 'Play native pronunciation audio'"
      class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-md shadow-blue-500/25 cursor-pointer shrink-0 transition-all"
    >
      <Loader2 v-if="loading" class="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
      <Pause v-else-if="isPlaying" class="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
      <Play v-else class="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
    </button>

    <!-- Soundwave Equalizer & Progress -->
    <div class="flex-1 min-w-0 space-y-1.5">
      <div class="flex items-center justify-between gap-2 text-xs">
        <span class="font-bold text-slate-700 flex items-center gap-1.5 truncate">
          <Volume2 class="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span class="truncate">{{ label || 'Native Audio' }}</span>
        </span>
        <span class="font-mono font-semibold text-slate-500 shrink-0 text-[11px]">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </span>
      </div>

      <!-- Scrubbable Progress Bar -->
      <div
        @click.stop="seekAudio"
        class="relative w-full h-2 bg-slate-200/80 hover:h-2.5 rounded-full overflow-hidden cursor-pointer transition-all"
      >
        <div
          class="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-100"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>
    </div>

    <!-- Right Controls: Speed Toggle & Replay -->
    <div class="flex items-center gap-1.5 shrink-0">
      <!-- Speed Toggle (1.0x / 0.8x) -->
      <button
        type="button"
        @click.stop="toggleSpeed"
        class="px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
        :class="playbackRate === 0.8 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'"
        title="Toggle audio speed (0.8x slow mode / 1.0x normal)"
      >
        {{ playbackRate }}x
      </button>

      <!-- Soundwave Dancing Indicator -->
      <div class="hidden sm:flex items-center gap-0.5 h-5 px-1.5" aria-hidden="true">
        <span
          v-for="bar in 4"
          :key="bar"
          class="w-1 bg-blue-500 rounded-full transition-all duration-200"
          :class="isPlaying ? 'animate-soundwave' : 'h-1.5 opacity-40'"
          :style="{
            animationDelay: `${bar * 120}ms`,
            height: isPlaying ? undefined : '6px'
          }"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, watch } from 'vue';
import { Play, Pause, Volume2, Loader2 } from 'lucide-vue-next';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: 'Native Audio'
  },
  fallbackText: {
    type: String,
    default: ''
  }
});

const audioRef = ref(null);
const isPlaying = ref(false);
const loading = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const playbackRate = ref(1.0);

const progressPercent = computed(() => {
  if (!duration.value || duration.value <= 0) return 0;
  return Math.min(100, Math.max(0, (currentTime.value / duration.value) * 100));
});

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const togglePlay = async () => {
  const audio = audioRef.value;
  if (!audio) return;

  if (isPlaying.value) {
    audio.pause();
    isPlaying.value = false;
  } else {
    loading.value = true;
    try {
      await audio.play();
      isPlaying.value = true;
    } catch (err) {
      console.warn('Native audio play error, trying speech synthesis fallback:', err);
      if (props.fallbackText && 'speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(props.fallbackText);
        utter.lang = 'en-US';
        utter.rate = playbackRate.value;
        utter.onstart = () => { isPlaying.value = true; };
        utter.onend = () => { isPlaying.value = false; };
        window.speechSynthesis.speak(utter);
      }
    } finally {
      loading.value = false;
    }
  }
};

const onTimeUpdate = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime;
  }
};

const onLoadedMetadata = () => {
  if (audioRef.value) {
    duration.value = audioRef.value.duration;
  }
};

const onEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0;
};

const onError = () => {
  loading.value = false;
  isPlaying.value = false;
};

const seekAudio = (e) => {
  const audio = audioRef.value;
  if (!audio || !duration.value) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
  audio.currentTime = ratio * duration.value;
  currentTime.value = audio.currentTime;
};

const toggleSpeed = () => {
  playbackRate.value = playbackRate.value === 1.0 ? 0.8 : 1.0;
  if (audioRef.value) {
    audioRef.value.playbackRate = playbackRate.value;
  }
};

watch(() => props.src, (newSrc) => {
  if (audioRef.value) {
    audioRef.value.pause();
    isPlaying.value = false;
    currentTime.value = 0;
    audioRef.value.load();
  }
});

onBeforeUnmount(() => {
  if (audioRef.value) {
    audioRef.value.pause();
    audioRef.value.src = '';
  }
});
</script>

<style scoped>
@keyframes soundwave-pulse {
  0%, 100% {
    height: 6px;
  }
  50% {
    height: 18px;
  }
}

.animate-soundwave {
  animation: soundwave-pulse 0.7s ease-in-out infinite;
}
</style>
