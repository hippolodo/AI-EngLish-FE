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
        aria-label="LiveKit Real-time Voice Call"
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
                  LiveKit • Gemini Live
                </span>
              </div>
              <p class="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                {{ scenarioTitle || 'Trò chuyện tự do' }}
              </p>
            </div>
          </div>

          <!-- Status Badge -->
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
            class="relative flex items-center justify-center transition-transform duration-200"
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

              <!-- Animated Waveform Bars inside Orb when user is speaking -->
              <div v-if="callState === 'listening' && !isMuted" class="flex items-center gap-1.5 z-10">
                <span
                  v-for="b in 5"
                  :key="b"
                  class="w-1.5 bg-white/90 rounded-full transition-all duration-75"
                  :style="{
                    height: (12 + (volumeLevel * 0.45) + ((b * 7) % 18)) + 'px'
                  }"
                ></span>
              </div>

              <!-- Connecting Spinner inside Orb -->
              <div v-else-if="callState === 'connecting'" class="z-10 flex flex-col items-center gap-2 text-white">
                <Loader2 class="w-10 h-10 animate-spin text-white/90" />
              </div>

              <!-- Speaking Waves inside Orb when Emma is speaking -->
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
          <div class="mt-8 text-center space-y-1.5">
            <p class="text-base sm:text-lg font-bold text-slate-800">
              {{ mainStatusPrompt }}
            </p>
            <p v-if="callState === 'listening' && !lastUserText && !lastBotText" class="text-xs sm:text-sm text-slate-500 font-medium">
              💡 Gợi ý: Hãy nói <span class="text-blue-600 font-semibold">"Hi Emma, how are you today?"</span> hoặc bất kỳ câu nào
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
              </div>
            </div>
          </div>
        </main>

        <!-- BOTTOM CONTROLS (Clean ChatGPT Style) -->
        <footer class="w-full max-w-sm mx-auto px-6 pb-8 pt-4">
          <div class="flex items-center justify-center gap-8">
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

            <!-- Close Button (X in black circle, matching ChatGPT) -->
            <button
              @click="handleClose"
              type="button"
              class="w-14 h-14 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center transition cursor-pointer shadow-md hover:scale-105 active:scale-95 shrink-0"
              title="Kết thúc đàm thoại"
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
import { Room, RoomEvent, Track } from 'livekit-client';
import { chatService } from '../services/chatService';

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

// State: 'idle' | 'connecting' | 'listening' | 'speaking'
const callState = ref('idle');
const isMuted = ref(false);
const lastUserText = ref('');
const lastBotText = ref('');
const volumeLevel = ref(0);
const callHistory = ref([]);
const activeConversationId = ref(null);

// LiveKit Room instance and Web Audio Analyzer
let currentRoom = null;
let audioContext = null;
let analyserNode = null;
let volumeInterval = null;
let attachedAudioElements = [];

// Dynamic labels
const statusLabel = computed(() => {
  if (isMuted.value) return 'Muted';
  if (callState.value === 'connecting') return 'Connecting...';
  if (callState.value === 'listening') return 'Listening...';
  if (callState.value === 'speaking') return 'Emma Speaking...';
  return 'Ready';
});

const statusBadgeClass = computed(() => {
  if (isMuted.value) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (callState.value === 'connecting') return 'bg-violet-50 text-violet-700 border-violet-200';
  if (callState.value === 'listening') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (callState.value === 'speaking') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
});

const statusDotClass = computed(() => {
  if (isMuted.value) return 'bg-amber-500';
  if (callState.value === 'connecting') return 'bg-violet-600 animate-spin';
  if (callState.value === 'listening') return 'bg-blue-600 animate-ping';
  if (callState.value === 'speaking') return 'bg-emerald-500 animate-pulse';
  return 'bg-slate-400';
});

const glowColorClass = computed(() => {
  if (isMuted.value) return 'bg-amber-400/10';
  if (callState.value === 'connecting') return 'bg-violet-500/25 animate-pulse';
  if (callState.value === 'listening') return 'bg-blue-500/25 animate-pulse';
  if (callState.value === 'speaking') return 'bg-sky-400/30 animate-pulse';
  return 'bg-blue-400/15';
});

const orbSphereClass = computed(() => {
  if (isMuted.value) {
    return 'bg-gradient-to-tr from-slate-400 to-slate-500 opacity-80';
  }
  if (callState.value === 'connecting') {
    return 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 animate-pulse';
  }
  if (callState.value === 'listening') {
    return 'bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 ring-8 ring-blue-300/30';
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

const mainStatusPrompt = computed(() => {
  if (isMuted.value) return 'Microphone đang tắt';
  if (callState.value === 'connecting') return 'Đang kết nối...';
  if (callState.value === 'listening') return 'Emma đang lắng nghe... Bạn có thể nói ngay!';
  if (callState.value === 'speaking') return 'Emma đang trả lời... (Nói để ngắt lời bất cứ lúc nào)';
  return 'Sẵn sàng đàm thoại';
});

// Setup volume level tracking from the published local audio track
const setupVolumeAnalysis = (track) => {
  try {
    const mediaStreamTrack = track?.mediaStreamTrack;
    if (!mediaStreamTrack) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioContext = new AudioCtx();
    const source = audioContext.createMediaStreamSource(new MediaStream([mediaStreamTrack]));
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.4;
    source.connect(analyserNode);

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    clearInterval(volumeInterval);
    volumeInterval = setInterval(() => {
      if (isMuted.value || !analyserNode) {
        volumeLevel.value = 0;
        return;
      }
      analyserNode.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const avg = sum / dataArray.length;
      volumeLevel.value = Math.round(avg);
    }, 50);
  } catch (err) {
    console.warn('[LiveKit] Volume analyzer setup warning:', err);
  }
};

// Start LiveKit Room session
const startLiveKitSession = async () => {
  cleanup();
  callState.value = 'connecting';
  isMuted.value = false;
  lastUserText.value = '';
  lastBotText.value = '';
  callHistory.value = [];

  try {
    // 1. Lấy Token kết nối WebRTC từ Backend
    const tokenRes = await chatService.getLiveKitToken(
      props.conversationId,
      'custom',
      props.scenarioTitle
    );

    if (!tokenRes?.token || !tokenRes?.server_url) {
      throw new Error('Không nhận được token kết nối LiveKit.');
    }

    activeConversationId.value = tokenRes.conversation_id;

    // 2. Khởi tạo đối tượng Room LiveKit
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });
    currentRoom = room;

    // Lắng nghe khi có Track âm thanh từ Agent (Emma) gửi về
    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === Track.Kind.Audio) {
        console.log('[LiveKit] Subscribed to Emma audio track');
        const element = track.attach();
        element.autoplay = true;
        attachedAudioElements.push(element);
        element.play().catch(e => console.warn('[LiveKit] Audio auto-play error:', e));
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, (track) => {
      track.detach();
    });

    // Lắng nghe trạng thái ai đang nói (Active Speakers)
    room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      const isAgentSpeaking = speakers.some(
        s => s.identity !== room.localParticipant.identity
      );
      if (isAgentSpeaking) {
        callState.value = 'speaking';
      } else if (callState.value === 'speaking') {
        callState.value = 'listening';
      }
    });

    // Lắng nghe Subtitles / Transcript thời gian thực từ Agent qua WebRTC Data Packet
    room.on(RoomEvent.DataReceived, (payload) => {
      try {
        const decoded = new TextDecoder().decode(payload);
        const data = JSON.parse(decoded);
        if (data.type === 'transcript') {
          if (data.sender === 'user') {
            lastUserText.value = data.text;
            if (data.is_final) {
              const prev = callHistory.value[callHistory.value.length - 1];
              if (prev && prev.sender === 'user') {
                prev.text = data.text;
              } else {
                callHistory.value.push({ sender: 'user', text: data.text });
              }
              emit('message-added', {
                sender: 'user',
                message_text: data.text,
                isVoice: true
              });
            }
          } else if (data.sender === 'bot') {
            lastBotText.value = data.text;
            callState.value = 'speaking';
            if (data.is_final) {
              const prev = callHistory.value[callHistory.value.length - 1];
              if (prev && prev.sender === 'bot') {
                // Cập nhật câu hoàn chỉnh thay vì tạo bong bóng rời rạc thứ 2
                prev.text = data.text;
              } else {
                callHistory.value.push({ sender: 'bot', text: data.text });
              }
              emit('message-added', {
                sender: 'bot',
                message_text: data.text,
                isVoice: true
              });
            }
          }
        }
      } catch (e) {
        console.warn('[LiveKit] Data packet decode error:', e);
      }
    });

    room.on(RoomEvent.Disconnected, () => {
      console.log('[LiveKit] Disconnected from room');
      callState.value = 'idle';
    });

    // 3. Kết nối vào LiveKit Cloud Room
    await room.connect(tokenRes.server_url, tokenRes.token);
    console.log('[LiveKit] Successfully connected to room:', tokenRes.room_name);

    // 4. Bật microphone người dùng và phát qua WebRTC
    await room.localParticipant.setMicrophoneEnabled(true);
    callState.value = 'listening';

    // 5. Kết nối track microphone để phân tích volume level cho Orb
    const micPub = room.localParticipant.getTrackPublication(Track.Source.Microphone);
    if (micPub?.track) {
      setupVolumeAnalysis(micPub.track);
    }
  } catch (err) {
    console.error('[LiveKit] Error connecting to voice session:', err);
    callState.value = 'idle';
  }
};

const toggleMute = async () => {
  if (!currentRoom?.localParticipant) return;
  isMuted.value = !isMuted.value;
  await currentRoom.localParticipant.setMicrophoneEnabled(!isMuted.value);
};

const cleanup = () => {
  clearInterval(volumeInterval);
  volumeInterval = null;

  if (analyserNode) {
    try { analyserNode.disconnect(); } catch {}
    analyserNode = null;
  }
  if (audioContext) {
    try { audioContext.close(); } catch {}
    audioContext = null;
  }
  for (const el of attachedAudioElements) {
    try {
      el.pause();
      el.remove();
    } catch {}
  }
  attachedAudioElements = [];

  if (currentRoom) {
    try {
      currentRoom.disconnect();
    } catch {}
    currentRoom = null;
  }
  volumeLevel.value = 0;
};

// Xử lý khi người dùng nhấn nút X đóng cuộc gọi
const handleClose = () => {
  const messagesToSave = [...callHistory.value];
  const convId = activeConversationId.value || props.conversationId;

  // 1. Đóng Modal ngay lập tức trên UI (0ms delay - Optimistic Dismiss)
  emit('close', {
    conversationId: convId,
    messages: messagesToSave
  });

  // 2. Dọn dẹp âm thanh & ngắt kết nối WebRTC
  cleanup();
  callState.value = 'idle';

  // 3. Lưu lịch sử các câu hội thoại vào database chạy ngầm (không block UI)
  if (messagesToSave.length > 0 && convId) {
    chatService.saveBatchMessages(convId, messagesToSave).catch((e) => {
      console.warn('[LiveKit] Failed to save batch messages on call close:', e);
    });
  }
};

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      startLiveKitSession();
    } else {
      cleanup();
    }
  }
);

onBeforeUnmount(() => {
  cleanup();
});
</script>

<style scoped>
@keyframes soundwave {
  0%, 100% {
    transform: scaleY(0.3);
  }
  50% {
    transform: scaleY(1);
  }
}

.animate-soundwave {
  animation: soundwave 0.8s ease-in-out infinite;
  transform-origin: center;
}
</style>
