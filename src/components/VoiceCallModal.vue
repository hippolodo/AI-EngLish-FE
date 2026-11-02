<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[120] flex flex-col justify-between bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 select-none overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="AI Real-time Hands-free Voice Call"
      >
        <!-- TOP BAR (Header) -->
        <header class="w-full max-w-2xl mx-auto px-6 pt-6 sm:pt-8 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-500/30 shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Emma"
                class="w-full h-full object-cover"
              />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base sm:text-lg font-bold text-slate-900">Emma</h2>
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  Hands-free AI Call
                </span>
              </div>
              <p class="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                {{ scenarioTitle || 'Casual English Practice' }}
              </p>
            </div>
          </div>

          <!-- Status & Auto-VAD Badge -->
          <div class="flex items-center gap-2">
            <div
              class="px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 border shadow-2xs"
              :class="statusBadgeClass"
            >
              <span class="w-2 h-2 rounded-full" :class="statusDotClass"></span>
              <span>{{ statusLabel }}</span>
            </div>
          </div>
        </header>

        <!-- CENTER AREA: The Animated AI Voice Orb (ChatGPT Style) -->
        <main class="flex-1 flex flex-col items-center justify-center px-6 relative max-w-xl mx-auto w-full">
          <!-- Ambient Glow Background -->
          <div
            class="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none -z-10"
            :class="glowColorClass"
          ></div>

          <!-- Central Interactive Pulsating Orb -->
          <div
            @click="handleOrbClick"
            class="relative flex items-center justify-center cursor-pointer group transition-transform duration-200 active:scale-95"
            :title="orbTooltip"
          >
            <!-- Outer Concentric Ripple Rings (Active when listening or speaking) -->
            <div
              v-if="callState === 'listening' && !isMuted"
              class="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 border-blue-400/30 animate-ping [animation-duration:2.5s] pointer-events-none"
            ></div>
            <div
              v-if="callState === 'speaking'"
              class="absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full border border-sky-400/40 animate-ping [animation-duration:1.8s] pointer-events-none"
            ></div>

            <!-- Glowing Orb Sphere with smooth gradient -->
            <div
              class="w-48 h-48 sm:w-60 sm:h-60 rounded-full shadow-2xl flex items-center justify-center transition-all duration-150 overflow-hidden relative"
              :class="orbSphereClass"
              :style="orbDynamicScaleStyle"
            >
              <!-- Internal light reflection layer (ChatGPT aesthetic) -->
              <div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/60 opacity-80 pointer-events-none"></div>

              <!-- Animated Waveform Bars inside Orb when listening to user -->
              <div v-if="callState === 'listening' && !isMuted" class="flex items-center gap-1.5 z-10">
                <span
                  v-for="b in 5"
                  :key="b"
                  class="w-1.5 bg-white/90 rounded-full transition-all duration-75"
                  :style="{
                    height: (12 + (volumeLevel * 0.4) + ((b * 7) % 18)) + 'px'
                  }"
                ></span>
              </div>

              <!-- Thinking Spinner inside Orb -->
              <div v-else-if="callState === 'thinking'" class="z-10 flex flex-col items-center gap-2 text-white">
                <Loader2 class="w-10 h-10 animate-spin text-white/90" />
              </div>

              <!-- Speaking Waves inside Orb when AI is speaking -->
              <div v-else-if="callState === 'speaking'" class="flex items-center gap-1.5 z-10">
                <span
                  v-for="b in 7"
                  :key="b"
                  class="w-1.5 bg-white rounded-full animate-soundwave"
                  :style="{
                    height: (16 + ((b * 11) % 32)) + 'px',
                    animationDelay: (b * 0.1) + 's',
                    animationDuration: '0.6s'
                  }"
                ></span>
              </div>

              <!-- Muted Icon inside Orb -->
              <div v-else-if="isMuted" class="z-10 text-white/80 flex flex-col items-center">
                <MicOff class="w-10 h-10 text-white/70" />
                <span class="text-xs font-semibold mt-1">Muted</span>
              </div>

              <!-- Idle Icon -->
              <div v-else class="z-10 text-white/90 flex flex-col items-center">
                <Mic class="w-10 h-10 text-white/80" />
              </div>
            </div>
          </div>

          <!-- Helper Status Hint -->
          <div class="mt-8 text-center space-y-1">
            <p class="text-base sm:text-lg font-bold text-slate-800">
              {{ mainStatusPrompt }}
            </p>
            <p class="text-xs sm:text-sm text-slate-500 font-medium">
              {{ subStatusPrompt }}
            </p>
          </div>

          <!-- Live Transcript / Conversation Subtitles Card -->
          <div
            v-if="lastUserText || lastBotText"
            class="mt-6 w-full max-w-lg bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 transition-all"
          >
            <!-- User speech bubble -->
            <div v-if="lastUserText" class="flex items-start gap-2 text-left">
              <span class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0 mt-0.5">
                You
              </span>
              <p class="text-sm sm:text-base font-medium text-slate-800 leading-snug">
                "{{ lastUserText }}"
              </p>
            </div>

            <!-- Emma response bubble -->
            <div v-if="lastBotText" class="flex items-start gap-2 text-left pt-2 border-t border-slate-100">
              <span class="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                AI
              </span>
              <div class="flex-1 space-y-1">
                <p class="text-sm sm:text-base font-semibold text-blue-950 leading-snug">
                  {{ lastBotText }}
                </p>
                <p v-if="lastBotTranslation" class="text-xs sm:text-sm text-slate-500 leading-normal italic">
                  💡 {{ lastBotTranslation }}
                </p>
              </div>
            </div>
          </div>
        </main>

        <!-- BOTTOM CONTROLS (Image 1 ChatGPT Style) -->
        <footer class="w-full max-w-md mx-auto px-6 pb-8 pt-4">
          <div class="flex items-center justify-between gap-4">
            <!-- Mute / Unmute Button -->
            <button
              @click="toggleMute"
              type="button"
              class="w-14 h-14 rounded-full flex items-center justify-center transition cursor-pointer shadow-2xs border"
              :class="isMuted ? 'bg-amber-50 text-amber-600 border-amber-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'"
              :title="isMuted ? 'Unmute microphone' : 'Mute microphone'"
            >
              <MicOff v-if="isMuted" class="w-6 h-6" />
              <Mic v-else class="w-6 h-6" />
            </button>

            <!-- Center Info Badge: Auto VAD Mode -->
            <div
              class="flex-1 h-14 rounded-full px-4 flex items-center justify-center gap-2 border bg-slate-50 border-slate-200/80 text-slate-600 text-xs sm:text-sm font-semibold select-none shadow-2xs"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span class="truncate">{{ autoVadModeText }}</span>
            </div>

            <!-- Close Button (X in black circle, matching Image 1) -->
            <button
              @click="handleClose"
              type="button"
              class="w-14 h-14 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center transition cursor-pointer shadow-md hover:scale-105 active:scale-95 shrink-0"
              title="End Voice Call"
            >
              <X class="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import {
  Loader2,
  Mic,
  MicOff,
  X
} from 'lucide-vue-next';
import { chatService } from '../services/chatService';
import { getFullAudioUrl } from '../services/api';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  conversationId: {
    type: [Number, String],
    default: null
  },
  scenarioTitle: {
    type: String,
    default: ''
  },
  botRole: {
    type: String,
    default: 'Native English Speaker'
  }
});

const emit = defineEmits(['close', 'message-added']);

// State: 'idle' | 'listening' | 'thinking' | 'speaking'
const callState = ref('idle');
const isMuted = ref(false);
const lastUserText = ref('');
const lastBotText = ref('');
const lastBotTranslation = ref('');
const volumeLevel = ref(0); // 0 - 100 for dynamic orb scaling

// Audio & VAD references
let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let audioContext = null;
let analyserNode = null;
let vadInterval = null;
let currentAudioPlayer = null;
let autoNextTurnTimer = null;

// VAD Constants
const VOICE_THRESHOLD = 14;      // Level to consider user is talking
const INTERRUPT_THRESHOLD = 22;  // Level to trigger barge-in while AI is speaking
const SILENCE_TIMEOUT_MS = 1300; // Continuous silence duration before auto-sending
const MIN_SPEECH_MS = 450;       // Minimum talking time to avoid sending background clicks

// VAD tracking variables
let speechStartTime = 0;
let silenceStartTime = 0;
let hasSpoken = false;
let interruptCounter = 0;

// Dynamic status strings
const statusLabel = computed(() => {
  if (isMuted.value) return 'Muted';
  if (callState.value === 'listening') return hasSpoken ? 'Hearing you...' : 'Listening...';
  if (callState.value === 'thinking') return 'Thinking...';
  if (callState.value === 'speaking') return 'Speaking...';
  return 'Ready';
});

const statusBadgeClass = computed(() => {
  if (isMuted.value) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (callState.value === 'listening') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (callState.value === 'thinking') return 'bg-violet-50 text-violet-700 border-violet-200';
  if (callState.value === 'speaking') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
});

const statusDotClass = computed(() => {
  if (isMuted.value) return 'bg-amber-500';
  if (callState.value === 'listening') return 'bg-blue-600 animate-ping';
  if (callState.value === 'thinking') return 'bg-violet-600 animate-pulse';
  if (callState.value === 'speaking') return 'bg-emerald-500 animate-bounce';
  return 'bg-slate-400';
});

const glowColorClass = computed(() => {
  if (isMuted.value) return 'bg-amber-400/10';
  if (callState.value === 'listening') return 'bg-blue-500/25 animate-pulse';
  if (callState.value === 'thinking') return 'bg-violet-500/25';
  if (callState.value === 'speaking') return 'bg-sky-400/30 animate-pulse';
  return 'bg-blue-400/15';
});

const orbSphereClass = computed(() => {
  if (isMuted.value) {
    return 'bg-gradient-to-tr from-slate-400 to-slate-500 opacity-80';
  }
  if (callState.value === 'listening') {
    return 'bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 ring-8 ring-blue-300/30';
  }
  if (callState.value === 'thinking') {
    return 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 animate-pulse';
  }
  if (callState.value === 'speaking') {
    return 'bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-500 ring-8 ring-sky-300/40';
  }
  return 'bg-gradient-to-tr from-blue-600 to-indigo-600 hover:scale-102';
});

const orbDynamicScaleStyle = computed(() => {
  if (callState.value === 'listening' && !isMuted.value) {
    const scale = 1.0 + Math.min(volumeLevel.value / 180, 0.22);
    return { transform: `scale(${scale})` };
  }
  if (callState.value === 'speaking') {
    return { transform: 'scale(1.10)' };
  }
  return { transform: 'scale(1.0)' };
});

const orbTooltip = computed(() => {
  if (callState.value === 'listening') return 'Nói tự nhiên, hệ thống sẽ tự gửi khi bạn dứt lời';
  if (callState.value === 'speaking') return 'Nói bất kỳ câu gì để ngắt lời AI (Barge-in)';
  return 'Sẵn sàng đàm thoại';
});

const mainStatusPrompt = computed(() => {
  if (isMuted.value) return 'Microphone đang tắt';
  if (callState.value === 'listening') {
    return hasSpoken ? 'Đang lắng nghe câu nói của bạn...' : 'Hãy nói câu tiếng Anh bất kỳ...';
  }
  if (callState.value === 'thinking') return 'Emma đang suy nghĩ câu trả lời...';
  if (callState.value === 'speaking') return 'Emma đang trả lời...';
  return 'Sẵn sàng hội thoại trực tiếp';
});

const subStatusPrompt = computed(() => {
  if (isMuted.value) return 'Bấm nút mic bên dưới để bật lại micro';
  if (callState.value === 'listening') return 'Hệ thống tự nhận diện dứt lời & gửi đi. Không cần bấm nút.';
  if (callState.value === 'thinking') return 'Đang xử lý Whisper ASR & Gemini AI...';
  if (callState.value === 'speaking') return 'Bạn có thể nói chen ngang bất cứ lúc nào để ngắt lời AI.';
  return 'Tự động 2 chiều hoàn toàn';
});

const autoVadModeText = computed(() => {
  if (callState.value === 'speaking') return 'Nói để ngắt lời (Barge-in)';
  return 'Tự động nghe & ngắt lời 100%';
});

// ==========================================
// AUDIO & VAD (VOICE ACTIVITY DETECTION) ENGINE
// ==========================================
const initAudioEngine = async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    console.warn('[VoiceMode] MediaDevices not supported.');
    return false;
  }

  try {
    // 1. Lấy Stream âm thanh với Echo Cancellation & Noise Suppression
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    // 2. Kết nối Web Audio API AnalyserNode để đo âm lượng thời gian thực
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
    const sourceNode = audioContext.createMediaStreamSource(mediaStream);
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.4;
    sourceNode.connect(analyserNode);

    // 3. Khởi động vòng lặp kiểm tra VAD liên tục (~50ms)
    startVadLoop();

    // 4. Bắt đầu lắng nghe
    startListeningSession();
    return true;
  } catch (err) {
    console.warn('[VoiceMode] Could not initialize audio engine:', err);
    return false;
  }
};

const startVadLoop = () => {
  clearInterval(vadInterval);
  const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

  vadInterval = setInterval(() => {
    if (!props.isOpen || isMuted.value || !analyserNode) {
      volumeLevel.value = 0;
      return;
    }

    analyserNode.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const avg = sum / dataArray.length;
    volumeLevel.value = Math.round(avg);

    // KỊCH BẢN 1: AI ĐANG NÓI (callState === 'speaking') -> BẮT CHEN LỜI (BARGE-IN)
    if (callState.value === 'speaking') {
      if (avg >= INTERRUPT_THRESHOLD) {
        interruptCounter++;
        // Nếu người dùng phát âm thanh vượt ngưỡng 3 chu kỳ liên tiếp (~150ms) -> CHEN LỜI THẬT
        if (interruptCounter >= 3) {
          console.log('[VoiceMode] Barge-in triggered! Stopping AI voice and listening to user...');
          interruptCounter = 0;
          // Ngắt ngay lập tức âm thanh AI
          stopAudioPlayer();
          // Chuyển sang lắng nghe và ghi âm câu nói mới của người dùng
          startListeningSession();
        }
      } else {
        interruptCounter = Math.max(0, interruptCounter - 1);
      }
      return;
    }

    // KỊCH BẢN 2: HỆ THỐNG ĐANG LẮNG NGHE (callState === 'listening')
    if (callState.value === 'listening') {
      const now = Date.now();

      if (avg >= VOICE_THRESHOLD) {
        // Người dùng đang phát ra tiếng nói
        if (!hasSpoken) {
          hasSpoken = true;
          speechStartTime = now;
        }
        silenceStartTime = 0; // Reset bộ đếm im lặng
      } else {
        // Không có tiếng nói (im lặng)
        if (hasSpoken) {
          if (!silenceStartTime) {
            silenceStartTime = now;
          } else if (now - silenceStartTime >= SILENCE_TIMEOUT_MS) {
            // Người dùng đã im lặng đủ 1.3s sau khi nói -> ĐÃ DỨT LỜI!
            const totalSpeechDuration = (now - SILENCE_TIMEOUT_MS) - speechStartTime;
            if (totalSpeechDuration >= MIN_SPEECH_MS) {
              console.log('[VoiceMode] Silence detected after speech -> Auto-sending turn!');
              finishSpeakingAndSend(totalSpeechDuration);
            } else {
              // Âm thanh quá ngắn (tiếng ho/click) -> Tiếp tục nghe
              hasSpoken = false;
              silenceStartTime = 0;
            }
          }
        }
      }
    }
  }, 50);
};

const startListeningSession = () => {
  if (isMuted.value || !props.isOpen || !mediaStream) return;
  stopAudioPlayer();

  hasSpoken = false;
  speechStartTime = 0;
  silenceStartTime = 0;
  interruptCounter = 0;
  recordedChunks = [];

  // Tạo MediaRecorder mới trên MediaStream hiện có
  try {
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      ''
    ];
    let selectedMime = '';
    for (const mime of mimeTypes) {
      if (!mime || MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime;
        break;
      }
    }

    const options = selectedMime ? { mimeType: selectedMime } : {};
    mediaRecorder = new MediaRecorder(mediaStream, options);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.start(200);
    callState.value = 'listening';
  } catch (err) {
    console.warn('[VoiceMode] Could not start mediaRecorder:', err);
    callState.value = 'idle';
  }
};

const finishSpeakingAndSend = async (durationMs = 2000) => {
  if (callState.value !== 'listening' || !mediaRecorder) return;
  callState.value = 'thinking';

  try {
    const blobPromise = new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(recordedChunks, { type: mimeType });
        resolve(blob);
      };
    });

    if (mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    const audioBlob = await blobPromise;
    if (!audioBlob || audioBlob.size === 0 || !props.conversationId || !props.isOpen) {
      if (props.isOpen && !isMuted.value) startListeningSession();
      return;
    }

    // Gửi âm thanh lên backend xử lý STT (Whisper) + LLM (Gemini) + TTS (Edge TTS)
    const result = await chatService.sendVoiceMessage(props.conversationId, audioBlob);
    if (!props.isOpen) return;

    if (result?.user_message) {
      result.user_message.isVoice = true;
      result.user_message.duration_seconds = Math.max(1, Math.round(durationMs / 1000));
      lastUserText.value = result.user_message.message_text;
      emit('message-added', result.user_message);
    }

    if (result?.bot_message) {
      lastBotText.value = result.bot_message.message_text;
      lastBotTranslation.value = result.bot_message.translation_vi || '';
      emit('message-added', result.bot_message);

      // Phát âm thanh giọng đọc của Bot
      playBotAudio(result.bot_message);
    } else {
      if (props.isOpen && !isMuted.value) startListeningSession();
    }
  } catch (err) {
    console.warn('[VoiceMode] Auto voice turn error:', err);
    if (props.isOpen && !isMuted.value) {
      setTimeout(() => startListeningSession(), 1000);
    }
  }
};

const playBotAudio = (botMsg) => {
  stopAudioPlayer();
  callState.value = 'speaking';
  interruptCounter = 0;

  const audioUrl = botMsg.audio_url ? getFullAudioUrl(botMsg.audio_url) : null;
  const rawText = botMsg.message_text || '';

  if (audioUrl) {
    currentAudioPlayer = new Audio(audioUrl);
    currentAudioPlayer.onended = () => {
      onBotFinishedSpeaking();
    };
    currentAudioPlayer.onerror = () => {
      fallbackBrowserTTS(rawText);
    };
    currentAudioPlayer.play().catch(() => {
      fallbackBrowserTTS(rawText);
    });
  } else {
    fallbackBrowserTTS(rawText);
  }
};

const fallbackBrowserTTS = (text) => {
  if (!text || !('speechSynthesis' in window)) {
    onBotFinishedSpeaking();
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 1.0;
  utter.onend = () => {
    onBotFinishedSpeaking();
  };
  utter.onerror = () => {
    onBotFinishedSpeaking();
  };
  window.speechSynthesis.speak(utter);
};

const onBotFinishedSpeaking = () => {
  if (!props.isOpen) return;
  // Khoảng nghỉ tự nhiên 0.5s trước khi tự động kích hoạt lượt lắng nghe tiếp theo
  clearTimeout(autoNextTurnTimer);
  autoNextTurnTimer = setTimeout(() => {
    if (props.isOpen && !isMuted.value) {
      startListeningSession();
    } else {
      callState.value = 'idle';
    }
  }, 500);
};

const stopAudioPlayer = () => {
  clearTimeout(autoNextTurnTimer);
  if (currentAudioPlayer) {
    currentAudioPlayer.pause();
    currentAudioPlayer = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

const handleOrbClick = () => {
  // Chạm thủ công dự phòng nếu người dùng muốn gửi ngay hoặc ngắt lời tức thì
  if (callState.value === 'listening' && hasSpoken) {
    finishSpeakingAndSend();
  } else if (callState.value === 'speaking') {
    stopAudioPlayer();
    startListeningSession();
  } else if (callState.value === 'idle') {
    startListeningSession();
  }
};

const toggleMute = () => {
  isMuted.value = !isMuted.value;
  if (isMuted.value) {
    stopAudioPlayer();
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try { mediaRecorder.stop(); } catch {}
    }
    callState.value = 'idle';
  } else {
    startListeningSession();
  }
};

const cleanupAllAudio = () => {
  clearInterval(vadInterval);
  clearTimeout(autoNextTurnTimer);
  stopAudioPlayer();

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    try { mediaRecorder.stop(); } catch {}
    mediaRecorder = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  if (audioContext && audioContext.state !== 'closed') {
    try { audioContext.close(); } catch {}
    audioContext = null;
  }
  analyserNode = null;
  callState.value = 'idle';
  volumeLevel.value = 0;
};

const handleClose = () => {
  cleanupAllAudio();
  emit('close');
};

// Lifecycle & Watchers
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      isMuted.value = false;
      initAudioEngine();
    } else {
      cleanupAllAudio();
    }
  }
);

onBeforeUnmount(() => {
  cleanupAllAudio();
});
</script>

<style scoped>
@keyframes soundwave {
  0%, 100% {
    transform: scaleY(0.4);
  }
  50% {
    transform: scaleY(1.3);
  }
}

.animate-soundwave {
  animation: soundwave 0.7s ease-in-out infinite;
  transform-origin: center;
}
</style>
