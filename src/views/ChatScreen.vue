<template>
  <div class="flex-1 flex flex-col justify-between h-full min-h-[580px] pb-20">
    <!-- Chat Scenario Header -->
    <div class="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between shadow-xs">
      <div class="flex items-center space-x-3">
        <div class="relative">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
            <Bot class="w-5 h-5" />
          </div>
          <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
        </div>
        <div>
          <h3 class="text-xs font-extrabold text-gray-900 flex items-center gap-1">
            Scenario: Hotel Check-in
          </h3>
          <p class="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online • Lingo AI Concierge
          </p>
        </div>
      </div>
      <button @click="resetChat" class="text-xs text-gray-400 hover:text-gray-700 p-1.5 rounded-lg border border-gray-200">
        <RotateCcw class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Chat Scrollable Messages Area -->
    <div class="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">
      <div class="text-center my-1">
        <span class="px-3 py-1 bg-gray-200/80 text-gray-600 rounded-full text-[11px] font-semibold">
          You are checking into Grand Palace Hotel. Speak naturally!
        </span>
      </div>

      <div v-for="(msg, idx) in chatMessages" :key="idx" class="flex flex-col">
        <!-- Bot Message -->
        <div v-if="msg.sender === 'bot'" class="flex items-start space-x-2.5 max-w-[85%] self-start">
          <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles class="w-3.5 h-3.5" />
          </div>
          <div class="space-y-1">
            <div class="bg-white text-gray-800 p-3.5 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm text-xs leading-relaxed">
              {{ msg.text }}
            </div>
            <button @click="speakText(msg.text)" class="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-indigo-600 px-1 transition">
              <Volume2 class="w-3 h-3" />
              <span>Listen</span>
            </button>
          </div>
        </div>

        <!-- User Message -->
        <div v-else class="flex flex-col items-end max-w-[85%] self-end space-y-1">
          <div class="bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-none shadow-sm text-xs leading-relaxed">
            {{ msg.text }}
          </div>
          <div v-if="msg.fluency" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles class="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />
            Fluency: {{ msg.fluency }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Chat Input Bar -->
    <div class="p-3 bg-white border-t border-gray-100">
      <div class="flex items-center space-x-2">
        <button
          @click="chatMicRecord"
          :class="chatRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          class="w-10 h-10 rounded-xl flex items-center justify-center transition shrink-0"
        >
          <Mic class="w-5 h-5" />
        </button>
        <input
          v-model="chatInput"
          @keyup.enter="sendChatMessage"
          type="text"
          placeholder="Type or speak in English..."
          class="flex-1 bg-gray-100 text-xs text-gray-800 placeholder-gray-400 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
        />
        <button
          @click="sendChatMessage"
          class="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-sm shadow-indigo-600/30 transition shrink-0"
        >
          <Send class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Bot, RotateCcw, Sparkles, Volume2, Mic, Send } from 'lucide-vue-next';

const chatInput = ref('');
const chatRecording = ref(false);
const chatMessages = ref([
  {
    sender: 'bot',
    text: "Good afternoon! Welcome to Grand Palace Hotel. May I have your name and reservation details, please?"
  },
  {
    sender: 'user',
    text: "Hi, I have a reservation under the name John Doe for three nights.",
    fluency: 94
  },
  {
    sender: 'bot',
    text: "Thank you Mr. Doe! I found your booking for a Deluxe King Suite. Could I see your passport and a credit card for the deposit?"
  }
]);

const speakText = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }
};

const sendChatMessage = () => {
  if (!chatInput.value.trim()) return;
  const userMsg = chatInput.value.trim();
  chatMessages.value.push({
    sender: 'user',
    text: userMsg,
    fluency: Math.floor(Math.random() * 12) + 86
  });
  chatInput.value = '';

  setTimeout(() => {
    chatMessages.value.push({
      sender: 'bot',
      text: "Everything looks set! Here is your electronic keycard for Room 804 on the 8th floor. Complimentary breakfast is served from 6:30 AM to 10:00 AM."
    });
  }, 900);
};

const chatMicRecord = () => {
  chatRecording.value = !chatRecording.value;
  if (chatRecording.value) {
    setTimeout(() => {
      chatInput.value = "Here is my passport and credit card. What time is checkout?";
      chatRecording.value = false;
    }, 1800);
  }
};

const resetChat = () => {
  chatMessages.value = [
    {
      sender: 'bot',
      text: "Hello! Welcome to the Grand Palace Hotel. How may I assist your check-in today?"
    }
  ];
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
