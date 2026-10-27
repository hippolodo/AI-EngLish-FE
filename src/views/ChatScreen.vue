<template>
  <div v-if="activeTab === 'chat'" class="flex-1 flex flex-col justify-between h-[calc(100vh-130px)] min-h-[720px] w-full max-w-[1540px] mx-auto bg-white rounded-3xl shadow-xs overflow-hidden">
    <!-- Chat Scenario & Tutor Header (TalkPal Ultra-Modern Style - Larger Font & Clear Layout) -->
    <div class="px-5 sm:px-8 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 z-20">
      <div class="flex items-center space-x-3 sm:space-x-4 min-w-0">
        <!-- Back Button (Only visible when navigated from a lesson or another screen) -->
        <button
          v-if="hasHistory"
          @click="goBack"
          class="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-bold text-xs sm:text-sm transition shadow-2xs cursor-pointer shrink-0"
          title="Back"
        >
          <ArrowLeft class="w-4 h-4" />
          <span class="hidden md:inline">{{ ctx.currentLesson.value ? 'Back to Lesson' : 'Back' }}</span>
        </button>

        <!-- Tutor Avatar with Online Indicator -->
        <div class="relative shrink-0">
          <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-blue-600 ring-2 ring-blue-100 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="Emma Tutor"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <span class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
        </div>

        <!-- Tutor Name, Scenario & Switch Button -->
        <div class="min-w-0">
          <div class="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Emma</span>
              <span class="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 hidden sm:inline">Tutor</span>
            </h2>

            <button
              @click="openTopicModal"
              :disabled="chatLoading || isBotTyping || isChatRecording"
              class="group text-left cursor-pointer flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 transition text-sm sm:text-base font-semibold text-slate-700 hover:text-blue-700 shadow-2xs"
              title="Click to change or create scenario"
            >
              <span class="text-lg shrink-0">{{ getScenarioEmoji(currentChatScenario) }}</span>
              <span class="truncate max-w-[240px] sm:max-w-md lg:max-w-xl">{{ currentChatScenario?.title || 'Choose Scenario' }}</span>
              <ChevronRight class="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
            </button>
          </div>

          <p class="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5 truncate mt-1">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span class="truncate">{{ currentChatScenario?.bot_role ? 'Role: ' + currentChatScenario.bot_role : 'Ready • Reflex practice & real-time feedback' }}</span>
          </p>
        </div>
      </div>

      <!-- Header Action Controls -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <!-- Mobile Feedback Toggle Pill -->
        <button
          @click="isMobileFeedbackOpen = !isMobileFeedbackOpen"
          class="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-sm font-bold transition cursor-pointer shadow-2xs"
          title="View error analysis"
        >
          <Sparkles class="w-4 h-4 text-amber-600" />
          <span>Feedback</span>
        </button>

        <button
          :disabled="chatLoading || isBotTyping || isChatRecording"
          @click="toggleChatHistory"
          title="Conversation history"
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
        >
          <History class="w-4 h-4 text-slate-500" />
          <span class="hidden md:inline">History</span>
        </button>

        <button
          :disabled="chatLoading || isBotTyping || isChatRecording"
          @click="resetChatConversation"
          title="Start new conversation"
          class="p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition cursor-pointer shadow-2xs flex items-center gap-1.5"
        >
          <RotateCcw class="w-4 h-4 text-slate-500" />
          <span class="hidden md:inline">Reset</span>
        </button>
      </div>
    </div>

    <!-- Active Session Target Banner & Quick Actions -->
    <div v-if="conversationId && !isChatHistoryOpen" class="px-5 sm:px-8 py-2 bg-transparent border-b border-slate-100/60 text-xs sm:text-sm text-slate-700 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2 min-w-0">
        <span class="font-bold text-blue-700 shrink-0">Goal:</span>
        <span class="truncate text-slate-700 font-medium">{{ currentChatScenario?.description || 'Practice natural conversational reflexes for this situation.' }}</span>
      </div>
      <div class="flex items-center gap-4 font-bold text-xs sm:text-sm shrink-0">
        <button @click="ctx.openSaveWord('', chatMessages.at(-1)?.message_text || '')" class="text-blue-700 hover:text-blue-900 hover:underline cursor-pointer">
          + Save Word
        </button>
        <button @click="ctx.endChatSession" :disabled="isBotTyping || isChatRecording || chatLoading" class="text-rose-600 hover:text-rose-800 hover:underline cursor-pointer">
          End Session
        </button>
      </div>
    </div>

    <!-- Session Summary Modal / Box -->
    <div v-if="ctx.chatSummary.value" class="p-6 bg-slate-50 border-b border-slate-200 space-y-3">
      <div class="space-y-2 rounded-2xl bg-white p-6 border border-blue-100 shadow-xs max-w-2xl mx-auto">
        <div class="flex items-center gap-2 text-blue-600 font-bold">
          <Sparkles class="w-5 h-5" />
          <span class="text-base sm:text-lg">Session Summary</span>
        </div>
        <p class="font-bold text-slate-900 text-base sm:text-lg">Practiced {{ ctx.chatSummary.value.turns }} exchanges, exercised {{ ctx.chatSummary.value.words }} words.</p>
        <p class="font-normal text-slate-600 text-sm sm:text-base leading-relaxed">Review suggestions and corrections or bookmark new words to practice on flashcards.</p>
        <div class="pt-2 flex gap-4 text-sm sm:text-base font-semibold">
          <button @click="ctx.currentLesson.value ? activeTab = 'lesson' : activeTab = 'home'" class="underline text-blue-600 hover:text-blue-800">
            {{ ctx.currentLesson.value ? 'Back to Lesson' : 'Back to Home' }}
          </button>
          <button @click="ctx.chatSummary.value = null" class="underline text-slate-600 hover:text-slate-800">
            Continue Chat
          </button>
        </div>
      </div>
    </div>

    <!-- Conversation History View -->
    <div v-if="isChatHistoryOpen" class="flex-1 min-h-0 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-5 sm:p-8">
      <div class="max-w-3xl mx-auto space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Conversation History</h2>
            <p class="mt-1 text-sm text-slate-500">Select a conversation to review messages and fluency score</p>
          </div>
          <button @click="toggleChatHistory" aria-label="Close history" class="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:bg-slate-50 cursor-pointer">
            <X class="h-4 w-4" />
          </button>
        </div>

        <div v-if="chatHistoryLoading" class="py-12 text-center text-base text-slate-500">
          <Loader2 class="mx-auto mb-2 h-6 w-6 animate-spin text-blue-600" />
          Loading history...
        </div>
        <p v-else-if="chatHistoryError" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-base text-rose-700">{{ chatHistoryError }}</p>
        <div v-else-if="chatConversations.length" class="space-y-3">
          <button
            v-for="conversation in chatConversations"
            :key="conversation.id"
            type="button"
            class="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 text-left shadow-2xs transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md cursor-pointer"
            @click="openChatConversation(conversation)"
          >
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 text-xl font-bold">
              {{ conversation.scenario_title ? conversation.scenario_title.slice(0, 1) : '💬' }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-base sm:text-lg font-bold text-slate-900">{{ conversation.scenario_title }}</span>
              <span class="mt-1 block text-xs sm:text-sm text-slate-500">{{ formatConversationDate(conversation.created_at) }}</span>
            </span>
            <span class="shrink-0 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs sm:text-sm font-bold text-emerald-700">
              {{ Math.round(conversation.fluency_score || 0) }}% fluency
            </span>
          </button>
        </div>
        <div v-else class="rounded-3xl border border-dashed border-slate-200 bg-white/80 px-5 py-16 text-center">
          <History class="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p class="text-base font-bold text-slate-700">No conversations yet</p>
          <p class="mt-1 text-sm text-slate-500">Your chat sessions will be automatically saved here.</p>
        </div>
      </div>
    </div>

    <!-- MAIN TWO-COLUMN BODY (TalkPal Architecture) -->
    <div v-else class="flex-1 flex min-h-0 overflow-hidden relative">
      <!-- COLUMN 1: Chat Stream + Prompt Pills + Input Bar -->
      <section class="flex-1 flex flex-col min-w-0 bg-white relative">
        <p v-if="chatError" role="alert" class="mx-5 my-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-base text-rose-700">{{ chatError }}</p>

        <!-- Messages Scroll Container -->
        <div ref="chatScrollContainer" class="flex-1 p-5 sm:p-8 space-y-6 overflow-y-auto no-scrollbar">
          <div v-if="chatLoading" class="py-16 text-center text-base sm:text-lg text-slate-500">
            <Loader2 class="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
            Connecting conversation with Emma...
          </div>

          <template v-else>
            <!-- Starter Welcome Screen if no active conversation -->
            <div v-if="!conversationId" class="space-y-6 py-12 text-center max-w-lg mx-auto">
              <div class="w-16 h-16 mx-auto rounded-3xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                <Compass class="w-8 h-8" />
              </div>
              <div>
                <h3 class="text-xl sm:text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
                  <span class="text-2xl">{{ getScenarioEmoji(currentChatScenario) }}</span>
                  <span>{{ currentChatScenario ? currentChatScenario.title : 'Choose a conversation scenario' }}</span>
                </h3>
                <p class="text-base sm:text-lg text-slate-500 mt-2 leading-relaxed">
                  {{ currentChatScenario?.description || 'Select a real-world scenario or create your own custom topic.' }}
                </p>
              </div>
              <div class="flex items-center justify-center gap-3 pt-2">
                <button
                  @click="openTopicModal"
                  type="button"
                  class="rounded-xl border border-blue-200 bg-white hover:bg-blue-50 px-5 py-3 text-sm sm:text-base font-bold text-blue-700 transition shadow-2xs cursor-pointer flex items-center gap-2"
                >
                  <Compass class="w-4 h-4 text-blue-600" /> Explore Scenarios
                </button>
                <button
                  @click="isAuthenticated ? startChatConversation() : requireAuthentication()"
                  :disabled="!scenarios.length"
                  type="button"
                  class="rounded-xl bg-blue-600 hover:bg-indigo-700 px-6 py-3 text-sm sm:text-base font-bold text-white disabled:opacity-50 transition shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles class="w-4 h-4" />
                  <span>{{ isAuthenticated ? 'Start Conversation' : 'Sign In' }}</span>
                </button>
              </div>
            </div>

            <!-- In-Session Messages Stream -->
            <template v-else>
              <div v-for="(msg, idx) in chatMessages" :key="idx" class="flex flex-col">
                <!-- Bot Message Turn -->
                <div v-if="msg.sender === 'BOT' || msg.sender === 'bot'" class="flex items-start space-x-3.5 max-w-[90%] sm:max-w-[82%] self-start">
                  <!-- Bot Avatar -->
                  <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 mt-0.5 ring-2 ring-indigo-100 shadow-2xs">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                      alt="Emma"
                      class="w-full h-full object-cover"
                    />
                  </div>

                  <!-- Bot Speech Bubble & Action Tools -->
                  <div class="space-y-2 min-w-0">
                    <div class="reading-text bg-slate-100 text-slate-800 p-5 sm:p-6 rounded-3xl rounded-tl-sm text-lg sm:text-[19px] leading-relaxed">
                      {{ msg.message_text || msg.text }}
                    </div>

                    <!-- Under-bubble Mini Action Tools -->
                    <div class="flex items-center gap-3.5 px-2 pt-0.5 text-slate-400">
                      <!-- Replay Audio (Edge TTS) -->
                      <button
                        @click="speakBotMessage(msg)"
                        class="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-slate-500 hover:text-blue-600 transition cursor-pointer"
                        title="Listen to pronunciation"
                      >
                        <Volume2 class="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Speak</span>
                      </button>

                      <span class="text-slate-300">•</span>

                      <!-- Translate Toggle Button (文A) -->
                      <button
                        @click="toggleTranslation(msg.id || idx)"
                        class="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold transition cursor-pointer"
                        :class="showTranslationMap[msg.id || idx] ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'"
                        title="View translation"
                      >
                        <Languages class="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>{{ showTranslationMap[msg.id || idx] ? 'Hide' : 'Translate' }}</span>
                      </button>
                    </div>

                    <!-- Expandable Vietnamese Translation Box -->
                    <div
                      v-if="showTranslationMap[msg.id || idx]"
                      class="mt-2 text-base text-slate-700 bg-blue-50/70 border border-blue-100/90 rounded-2xl px-4.5 py-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-150 shadow-2xs"
                    >
                      <span class="text-xs font-bold text-blue-700 uppercase shrink-0 mt-0.5 bg-indigo-100 px-2 py-0.5 rounded-md">Translation</span>
                      <p class="leading-relaxed font-medium text-slate-800">{{ msg.translation_vi || 'Hello! Feel free to chat with me.' }}</p>
                    </div>
                  </div>
                </div>

                <!-- User Message Turn -->
                <div v-else class="flex flex-col items-end self-end max-w-[90%] sm:max-w-[82%] group">
                  <!-- Case 1: Pending Loading Bubble (Image 2 style) -->
                  <div v-if="msg.isPending" class="bg-[#2b59ff] text-white px-5 py-4 rounded-3xl rounded-br-sm shadow-2xs flex items-center gap-2 self-end animate-in fade-in duration-150">
                    <span class="w-2.5 h-2.5 rounded-full bg-white animate-bounce"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-white animate-bounce [animation-delay:0.2s]"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-white animate-bounce [animation-delay:0.4s]"></span>
                  </div>

                  <!-- Case 2: Standard User Message -->
                  <div v-else class="flex items-end justify-end space-x-3 w-full">
                    <!-- Feedback Status Badge: ONLY when sentence needs improvement (amber !) -->
                    <button
                      v-if="msg.feedback && msg.feedback.needs_improvement"
                      @click="selectFeedbackMessage(idx)"
                      title="Click to view phrase & word corrections"
                      class="shrink-0 mb-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-2xs cursor-pointer transition-transform hover:scale-115 active:scale-95 bg-amber-500 text-white ring-2 ring-amber-200"
                    >
                      <span class="font-black text-sm">!</span>
                    </button>

                    <!-- User Speech Bubble & Action Tools -->
                    <div class="space-y-1.5 flex flex-col items-end">
                      <div
                        @click="msg.feedback?.needs_improvement && selectFeedbackMessage(idx)"
                        class="reading-text bg-[#2b59ff] text-white p-5 sm:p-6 rounded-3xl rounded-br-sm shadow-2xs text-lg sm:text-[19px] leading-relaxed font-normal transition"
                        :class="[
                          msg.feedback?.needs_improvement ? 'cursor-pointer hover:brightness-105' : '',
                          selectedFeedbackIndex === idx ? 'ring-3 ring-blue-300 ring-offset-2' : ''
                        ]"
                      >
                        {{ msg.message_text || msg.text }}
                      </div>

                      <!-- Under-bubble User Mini Action Tools -->
                      <div class="flex items-center gap-3 px-2 pt-0.5 text-slate-400">
                        <!-- Replay User Audio - ONLY when message was recorded by voice -->
                        <button
                          v-if="msg.audio_url || msg.audio_blob_url"
                          @click.stop="playUserMessageAudio(msg, idx)"
                          class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition cursor-pointer"
                          :class="playingMessageId === (msg.id || idx) ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-blue-600'"
                          title="Replay your recorded audio"
                        >
                          <Volume2 class="w-3.5 h-3.5 sm:w-4 sm:h-4" :class="playingMessageId === (msg.id || idx) ? 'animate-bounce text-blue-600' : ''" />
                          <span>{{ playingMessageId === (msg.id || idx) ? 'Playing...' : 'Replay' }}</span>
                        </button>

                        <!-- Fluency Pill if Available -->
                        <span v-if="(msg.audio_url || msg.audio_blob_url) && msg.fluency_score" class="text-slate-300">•</span>
                        <div v-if="msg.fluency_score" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Sparkles class="w-3 h-3 text-emerald-500 fill-emerald-500" />
                          <span>Fluency {{ Math.round(msg.fluency_score) }}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Typing Indicator -->
              <div v-if="isBotTyping" class="flex items-start space-x-3.5 max-w-[85%] self-start">
                <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 mt-0.5 ring-2 ring-indigo-100">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="Emma"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="bg-[#f1f5f9] text-slate-600 p-4.5 sm:p-5 rounded-3xl rounded-tl-sm border border-slate-100 shadow-2xs text-base sm:text-lg flex items-center gap-2.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></span>
                  <span class="ml-2 font-medium text-slate-700">Emma is typing...</span>
                </div>
              </div>
            </template>
          </template>
        </div>

        <!-- Suggestion Pills (Another question & Suggest answer) -->
        <div v-if="conversationId && !isBotTyping && !isChatRecording" class="px-5 sm:px-8 py-2 flex flex-wrap items-center gap-2.5 bg-transparent">
          <!-- Another question button -->
          <button
            @click="askAnotherQuestion"
            :disabled="chatLoading || isBotTyping"
            class="inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm sm:text-base font-semibold transition cursor-pointer border border-slate-200/60 shadow-2xs group"
            title="Ask a topic-related question"
          >
            <HelpCircle class="w-4 h-4 text-blue-600 group-hover:rotate-12 transition-transform" />
            <span>Another question</span>
          </button>

          <!-- Suggest answer button -->
          <button
            @click="applySuggestedAnswer"
            :disabled="chatLoading || isBotTyping"
            class="inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm sm:text-base font-semibold transition cursor-pointer border border-blue-200/70 shadow-2xs group"
            title="Insert a sample response"
          >
            <Lightbulb class="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            <span>Suggest answer</span>
          </button>
        </div>

        <!-- Bottom Chat Input Bar -->
        <div v-if="!isChatHistoryOpen && !ctx.chatSummary.value" class="p-4 sm:p-6 border-t border-slate-100">
          <!-- Voice Recording Bar (Image 1 style) -->
          <div v-if="isChatRecording" class="flex items-center space-x-3 w-full animate-in fade-in duration-200">
            <!-- Trash / Cancel Button -->
            <button
              @click="cancelChatVoice"
              type="button"
              class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0 cursor-pointer shadow-2xs border border-slate-200/60 hover:border-rose-200"
              title="Cancel recording"
            >
              <Trash2 class="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <!-- Center Wide Blue Recording Pill -->
            <div class="flex-1 bg-[#2b59ff] text-white h-12 sm:h-14 rounded-full px-4 sm:px-6 flex items-center justify-between shadow-md shadow-blue-600/20">
              <!-- Pause / Resume Button -->
              <button
                @click="togglePauseRecording"
                type="button"
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-[#2b59ff] flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition shadow-2xs"
                :title="isRecordingPaused ? 'Resume recording' : 'Pause recording'"
              >
                <Play v-if="isRecordingPaused" class="w-4 h-4 fill-current ml-0.5" />
                <Pause v-else class="w-4 h-4 fill-current" />
              </button>

              <!-- Soundwave Visualizer Bars -->
              <div class="flex items-center gap-1 sm:gap-1.5 px-3">
                <span
                  v-for="bar in 12"
                  :key="bar"
                  class="w-1 sm:w-1.5 bg-white/90 rounded-full transition-all duration-150"
                  :class="isRecordingPaused ? 'h-1.5 opacity-40' : 'animate-soundwave'"
                  :style="{
                    height: isRecordingPaused ? '6px' : (8 + ((bar * 7) % 20)) + 'px',
                    animationDelay: (bar * 0.08) + 's',
                    animationDuration: '0.8s'
                  }"
                ></span>
              </div>

              <!-- Recording Timer -->
              <div class="font-mono font-bold text-sm sm:text-base tracking-wider tabular-nums text-white shrink-0">
                {{ formattedRecordingTime }}
              </div>
            </div>

            <!-- Send Recording Button (Blue circle with paper plane) -->
            <button
              @click="sendChatVoice"
              type="button"
              class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#2b59ff] hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/30 transition shrink-0 cursor-pointer hover:scale-105 active:scale-95"
              title="Send voice message"
            >
              <Send class="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </button>
          </div>

          <!-- Normal Input Bar (Text + Mic button) -->
          <div v-else class="flex items-center space-x-3">
            <!-- Voice Input Button -->
            <button
              :disabled="chatLoading || isBotTyping || !conversationId"
              @click="startChatVoice"
              title="Record voice"
              class="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition shrink-0 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Mic class="w-6 h-6" />
            </button>

            <!-- Text Input -->
            <input
              v-model="chatInput"
              @keyup.enter="sendChatText"
              :disabled="chatLoading || isBotTyping || !conversationId"
              type="text"
              placeholder="Type your message..."
              class="flex-1 bg-slate-100 text-base sm:text-lg lg:text-xl text-slate-900 placeholder-slate-400 px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
            />

            <!-- Send Button -->
            <button
              @click="sendChatText"
              :disabled="chatLoading || isBotTyping || !conversationId || !chatInput.trim()"
              class="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-blue-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white flex items-center justify-center shadow-xs shadow-indigo-600/30 transition shrink-0 cursor-pointer"
            >
              <Send class="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      <!-- COLUMN 2: Real-time Feedback Panel (Desktop TalkPal Right Side) -->
      <!-- CHỈ PHÂN TÍCH TỪ SAI - NÓI ĐÚNG CHỈ CẦN TICK -->
      <aside class="hidden lg:flex w-88 xl:w-[410px] flex-col justify-between border-l border-slate-100 p-6 overflow-y-auto shrink-0">
        <div class="space-y-6">
          <!-- Feedback Panel Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-200/80">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-2xs">
                <Sparkles class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold text-slate-900 leading-tight">Real-time Feedback</h3>
                <p class="text-xs sm:text-sm text-slate-500">Phoneme accuracy & natural phrasing</p>
              </div>
            </div>
          </div>

          <!-- Active Feedback Content (CHỈ HIỂN THỊ KHI CÂU CÓ LỖI SAI) -->
          <template v-if="activeFeedbackMsg && activeFeedbackMsg.feedback && activeFeedbackMsg.feedback.needs_improvement">
            <!-- Dotted/Dashed User Sentence Box -->
            <div class="border border-dashed border-blue-200 bg-white rounded-2xl p-4.5 shadow-2xs space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs sm:text-sm font-bold text-blue-700 flex items-center gap-1.5">
                  <MessageSquare class="w-4 h-4 text-blue-600" /> Your utterance
                </span>
                <span v-if="activeFeedbackMsg.fluency_score" class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  {{ Math.round(activeFeedbackMsg.fluency_score) }}% fluency
                </span>
              </div>
              <p class="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                "{{ activeFeedbackMsg.message_text || activeFeedbackMsg.text }}"
              </p>
            </div>

            <!-- Feedback Diagnosis Card -->
            <div class="space-y-5">
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-bold">
                <AlertCircle class="w-4 h-4 text-amber-600 shrink-0" />
                <span>Detected unnatural or inaccurate phrasing</span>
              </div>

              <!-- Phrasing comparison: Từ sai vs Gợi ý chuẩn -->
              <div class="space-y-3">
                <!-- Original phrase (red cross tag) -->
                <div v-if="activeFeedbackMsg.feedback.original_phrase" class="bg-slate-100/80 border border-slate-200 rounded-2xl p-3.5 flex items-start gap-3">
                  <span class="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold text-sm mt-0.5">✕</span>
                  <div class="min-w-0">
                    <span class="text-xs font-bold text-slate-600 uppercase tracking-wide block">Needs improvement</span>
                    <p class="text-base font-semibold text-slate-800 line-through decoration-rose-500 decoration-2">
                      {{ activeFeedbackMsg.feedback.original_phrase }}
                    </p>
                  </div>
                </div>

                <!-- Recommended phrase (TalkPal bright green #009b4d tag) -->
                <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
                  <span class="w-6 h-6 rounded-full bg-[#009b4d] text-white flex items-center justify-center shrink-0 font-bold text-sm mt-0.5">✓</span>
                  <div class="min-w-0">
                    <span class="text-xs font-bold text-emerald-800 uppercase tracking-wide block">Better natural expression</span>
                    <p class="text-base sm:text-lg font-bold text-emerald-950 leading-snug">
                      {{ activeFeedbackMsg.feedback.recommended_phrase || activeFeedbackMsg.feedback.original_phrase }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Explanation Box in Vietnamese -->
              <div class="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-2xs space-y-2">
                <span class="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Lightbulb class="w-4 h-4 text-amber-500" /> Explanation & Tip:
                </span>
                <p class="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                  {{ activeFeedbackMsg.feedback.explanation || 'To sound more natural and grammatically accurate, use the suggested phrasing above.' }}
                </p>
              </div>
            </div>
          </template>

          <!-- Empty placeholder when no errors to display -->
          <div v-else class="py-14 text-center space-y-3">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
              <Sparkles class="w-8 h-8" />
            </div>
            <div>
              <h4 class="text-base font-bold text-slate-800">Real-time Feedback Tutor</h4>
              <p class="text-sm text-slate-700 font-medium mt-1.5 max-w-[260px] mx-auto leading-relaxed">
                Whenever you say something inaccurate, actionable explanations and natural expressions will appear here!
              </p>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 text-xs font-bold text-slate-700 text-center">
          TalkPal Real-time Grammar Engine
        </div>
      </aside>

      <!-- MOBILE FEEDBACK DRAWER MODAL (lg:hidden) -->
      <div
        v-if="isMobileFeedbackOpen"
        class="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 animate-in fade-in duration-200"
        @click.self="isMobileFeedbackOpen = false"
      >
        <div class="bg-white w-full max-w-lg max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
          <div class="p-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-2">
              <Sparkles class="w-5 h-5 text-blue-600" />
              <h3 class="text-base font-bold text-slate-900">Feedback & Corrections</h3>
            </div>
            <button @click="isMobileFeedbackOpen = false" class="p-1 rounded-full text-slate-400 hover:text-slate-600">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-5 overflow-y-auto space-y-4">
            <template v-if="activeFeedbackMsg && activeFeedbackMsg.feedback && activeFeedbackMsg.feedback.needs_improvement">
              <div class="border border-dashed border-blue-200 bg-blue-50/40 rounded-2xl p-4 space-y-1.5">
                <span class="text-xs font-bold text-blue-700">Your utterance:</span>
                <p class="text-base sm:text-lg font-bold text-slate-900">"{{ activeFeedbackMsg.message_text || activeFeedbackMsg.text }}"</p>
              </div>

              <div class="space-y-3">
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  <AlertCircle class="w-4 h-4 text-amber-600" />
                  <span>Detected expression to improve</span>
                </div>

                <div v-if="activeFeedbackMsg.feedback.original_phrase" class="bg-slate-100/80 border border-slate-200 rounded-2xl p-3 flex items-start gap-2.5">
                  <span class="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">✕</span>
                  <div>
                    <span class="text-xs font-bold text-slate-600 uppercase tracking-wide block">Needs revision</span>
                    <p class="text-base font-semibold text-slate-800 line-through">{{ activeFeedbackMsg.feedback.original_phrase }}</p>
                  </div>
                </div>

                <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-2.5">
                  <span class="w-5 h-5 rounded-full bg-[#009b4d] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">✓</span>
                  <div>
                    <span class="text-xs font-bold text-emerald-800 uppercase tracking-wide block">Better phrasing</span>
                    <p class="text-base sm:text-lg font-bold text-emerald-950">{{ activeFeedbackMsg.feedback.recommended_phrase || activeFeedbackMsg.feedback.original_phrase }}</p>
                  </div>
                </div>

                <div class="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
                  <span class="text-xs font-bold text-slate-700">Explanation:</span>
                  <p class="text-sm sm:text-base text-slate-600 leading-relaxed">{{ activeFeedbackMsg.feedback.explanation }}</p>
                </div>
              </div>
            </template>
            <div v-else class="text-center py-8 text-sm text-slate-500">
              No errors detected so far. Continue chatting naturally with your tutor!
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Topic Explorer & Custom Topic Modal -->
    <div
      v-if="isTopicModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      @click.self="closeTopicModal"
    >
      <div class="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-xl flex flex-col overflow-hidden border border-slate-200/80">
        <!-- Modal Header -->
        <div class="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Compass class="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 class="text-base font-bold text-gray-900 leading-snug">Conversation Scenarios</h2>
              <p class="text-xs text-slate-600 font-medium">Choose a preset topic or create a custom situation</p>
            </div>
          </div>
          <button
            @click="closeTopicModal"
            aria-label="Close"
            class="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-4 sm:p-5 overflow-y-auto space-y-4 no-scrollbar">
          <!-- Section 1: Create Custom Topic (Compact & Sleek) -->
          <div class="p-4 rounded-2xl bg-slate-50 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles class="w-4 h-4 text-blue-600" /> Create Custom Scenario
              </span>
              <span class="text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                Custom Topic
              </span>
            </div>

            <!-- Single row Input & Action -->
            <div class="flex items-center gap-2">
              <input
                v-model="customTopicInput"
                @keyup.enter="handleCreateCustom"
                :disabled="isCreatingCustomTopic || chatLoading"
                type="text"
                placeholder="Enter scenario (e.g. Booking a hotel, Tech job interview, Coffee shop...)"
                class="flex-1 bg-white border border-blue-200/90 text-xs sm:text-sm text-gray-800 placeholder-gray-400 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs"
              />
              <button
                @click="handleCreateCustom"
                :disabled="isCreatingCustomTopic || chatLoading || !customTopicInput.trim()"
                type="button"
                class="shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition disabled:bg-slate-200 disabled:text-slate-500 disabled:opacity-100 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer transform active:scale-98"
              >
                <Loader2 v-if="isCreatingCustomTopic" class="w-4 h-4 animate-spin" />
                <Sparkles v-else class="w-4 h-4" />
                <span>{{ isCreatingCustomTopic ? 'Creating...' : 'Create Scenario' }}</span>
              </button>
            </div>

            <p v-if="customTopicError" class="text-xs text-rose-600 font-medium">
              ⚠️ {{ customTopicError }}
            </p>

            <!-- Quick Suggestions in a sleek horizontal scroll strip -->
            <div class="flex items-center gap-2 pt-0.5 overflow-hidden">
              <span class="text-[11px] font-bold text-gray-400 shrink-0">Suggestions:</span>
              <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  v-for="(sug, sIdx) in QUICK_SUGGESTIONS"
                  :key="sIdx"
                  @click="applyCustomSuggestion(sug)"
                  type="button"
                  class="text-xs font-bold bg-white hover:bg-blue-600 text-blue-950 hover:text-white border border-blue-200 hover:border-blue-600 px-3.5 py-2 rounded-xl transition shadow-2xs cursor-pointer shrink-0 whitespace-nowrap"
                >
                  {{ sug }}
                </button>
              </div>
            </div>
          </div>

          <!-- Section 2: Preset Scenarios Explorer -->
          <div class="space-y-3.5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <h3 class="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen class="w-4 h-4 text-blue-600" />
                <span>Available Scenarios ({{ filteredScenarios.length }})</span>
              </h3>

              <!-- Search Bar -->
              <div class="relative w-full sm:w-64">
                <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search scenarios..."
                  class="w-full bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-800 placeholder-gray-400 pl-9 pr-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <!-- Category Filter Tabs -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs sm:text-sm">
              <button
                v-for="cat in CATEGORIES"
                :key="cat.id"
                @click="selectedCategory = cat.id"
                type="button"
                class="px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer"
                :class="selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                {{ cat.label }}
              </button>
            </div>

            <!-- Scenarios Grid -->
            <div v-if="filteredScenarios.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div
                v-for="sc in filteredScenarios"
                :key="sc.id"
                @click="selectScenario(sc)"
                class="p-4 rounded-2xl transition text-left cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
                :class="sc.id === chatScenarioId ? 'bg-blue-100/90 text-blue-950' : 'bg-slate-100/75 hover:bg-blue-50/50'"
              >
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-2xl">{{ getScenarioEmoji(sc) }}</span>
                    <span
                      v-if="sc.id === chatScenarioId"
                      class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full"
                    >
                      <Check class="w-3.5 h-3.5" /> Current
                    </span>
                    <span
                      v-else
                      class="text-xs uppercase font-bold px-2.5 py-0.5 rounded-md"
                      :class="getCategoryBadgeClass(sc.category)"
                    >
                      {{ getCategoryLabel(sc.category) }}
                    </span>
                  </div>

                  <h4 class="text-sm sm:text-base font-bold text-gray-900 group-hover:text-blue-600 transition leading-snug line-clamp-2">
                    {{ sc.title }}
                  </h4>

                  <p class="text-xs sm:text-sm text-slate-700 font-medium line-clamp-2 leading-relaxed">
                    {{ sc.description }}
                  </p>
                </div>

                <!-- Role details -->
                <div class="pt-3 mt-2.5 border-t border-gray-100/80 flex items-center justify-between text-xs sm:text-sm">
                  <div class="text-slate-700 font-medium truncate max-w-[190px]">
                    <span class="font-bold text-blue-800">Bot:</span> {{ (sc.bot_role || '').split('(')[0] }}
                  </div>
                  <span class="font-bold text-blue-600 group-hover:translate-x-0.5 transition shrink-0 flex items-center gap-0.5">
                    Start <ChevronRight class="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            <div v-else class="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-sm text-gray-500">
              No topics matched your search for "{{ searchQuery }}". Try creating a custom scenario above!
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AnimateButton from '../components/ui/Button.vue';
import AnimateCard from '../components/ui/Card.vue';
import AnimateBadge from '../components/ui/Badge.vue';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Compass,
  HelpCircle,
  History,
  Languages,
  Lightbulb,
  Loader2,
  MessageSquare,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Square,
  Trash2,
  Volume2,
  X,
} from 'lucide-vue-next';
import { computed, inject, ref } from 'vue';
import { getFullAudioUrl } from '../services/api';

const ctx = inject('screenContext');
const goBack = ctx.goBack;
const hasHistory = ctx.hasHistory;
const { chatError, requireAuthentication } = ctx;

const activeTab = ctx.activeTab;
const chatInput = ctx.chatInput;
const chatLoading = ctx.chatLoading;
const chatMessages = ctx.chatMessages;
const chatConversations = ctx.chatConversations;
const chatHistoryError = ctx.chatHistoryError;
const chatHistoryLoading = ctx.chatHistoryLoading;
const isChatHistoryOpen = ctx.isChatHistoryOpen;
const chatScenarioId = ctx.chatScenarioId;
const chatScrollContainer = ctx.chatScrollContainer;
const conversationId = ctx.conversationId;
const currentChatScenario = ctx.currentChatScenario;
const isAuthenticated = ctx.isAuthenticated;
const isBotTyping = ctx.isBotTyping;
const isChatRecording = ctx.isChatRecording;
const resetChatConversation = ctx.resetChatConversation;
const scenarios = ctx.scenarios;
const sendChatText = ctx.sendChatText;
const speakBotMessage = ctx.speakBotMessage;
const startChatConversation = ctx.startChatConversation;
const createAndSelectCustomScenario = ctx.createAndSelectCustomScenario;
const switchChatScenario = ctx.switchChatScenario;
const toggleChatVoice = ctx.toggleChatVoice;
const startChatVoice = ctx.startChatVoice;
const cancelChatVoice = ctx.cancelChatVoice;
const togglePauseRecording = ctx.togglePauseRecording;
const sendChatVoice = ctx.sendChatVoice;
const isRecordingPaused = ctx.isRecordingPaused;
const recordingDuration = ctx.recordingDuration;
const formattedRecordingTime = ctx.formattedRecordingTime;
const toggleChatHistory = ctx.toggleChatHistory;
const openChatConversation = ctx.openChatConversation;

// Playback for user's own spoken messages
const playingMessageId = ref(null);
let activeUserAudioPlayer = null;

const playUserMessageAudio = (msg, idx) => {
  if (!msg) return;
  const msgKey = msg.id || idx;

  if (playingMessageId.value === msgKey) {
    if (activeUserAudioPlayer) {
      activeUserAudioPlayer.pause();
      activeUserAudioPlayer = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    playingMessageId.value = null;
    return;
  }

  if (activeUserAudioPlayer) {
    activeUserAudioPlayer.pause();
    activeUserAudioPlayer = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  const audioSrc = msg.audio_blob_url || (msg.audio_url ? getFullAudioUrl(msg.audio_url) : null);
  if (audioSrc) {
    playingMessageId.value = msgKey;
    activeUserAudioPlayer = new Audio(audioSrc);
    activeUserAudioPlayer.onended = () => {
      playingMessageId.value = null;
      activeUserAudioPlayer = null;
    };
    activeUserAudioPlayer.onerror = () => {
      playingMessageId.value = null;
      activeUserAudioPlayer = null;
      speakUserTTS(msg, msgKey);
    };
    activeUserAudioPlayer.play().catch(() => {
      speakUserTTS(msg, msgKey);
    });
  } else {
    speakUserTTS(msg, msgKey);
  }
};

const speakUserTTS = (msg, msgKey) => {
  const text = msg.message_text || msg.text;
  if (!text) {
    playingMessageId.value = null;
    return;
  }
  if ('speechSynthesis' in window) {
    playingMessageId.value = msgKey;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => {
      playingMessageId.value = null;
    };
    utterance.onerror = () => {
      playingMessageId.value = null;
    };
    window.speechSynthesis.speak(utterance);
  } else if (ctx.speakText) {
    ctx.speakText(text);
  }
};

// Topic Explorer & Custom Topic State
const isTopicModalOpen = ref(false);
const selectedCategory = ref('all');
const searchQuery = ref('');
const customTopicInput = ref('');
const isCreatingCustomTopic = ref(false);
const customTopicError = ref('');

// Real-time Feedback & Translation State
const showTranslationMap = ref({});
const selectedFeedbackIndex = ref(null);
const isMobileFeedbackOpen = ref(false);

const toggleTranslation = (key) => {
  showTranslationMap.value[key] = !showTranslationMap.value[key];
};

const selectFeedbackMessage = (idx) => {
  selectedFeedbackIndex.value = idx;
  isMobileFeedbackOpen.value = true;
};

// Compute the active message for the feedback panel:
// Ưu tiên tin nhắn người dùng được chọn hoặc tin nhắn có lỗi sai gần nhất!
const activeFeedbackMsg = computed(() => {
  const msgs = chatMessages.value || [];
  if (selectedFeedbackIndex.value !== null && msgs[selectedFeedbackIndex.value]) {
    const m = msgs[selectedFeedbackIndex.value];
    if ((m.sender === 'user' || m.sender === 'USER') && m.feedback?.needs_improvement) return m;
  }
  // Ưu tiên hiển thị câu có từ sai cần cải thiện gần nhất (needs_improvement: true)
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    if ((m.sender === 'user' || m.sender === 'USER') && m.feedback?.needs_improvement) return m;
  }
  return null;
});

// Latest bot message for answer suggestion
const latestBotMsg = computed(() => {
  const msgs = chatMessages.value || [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    if (m.sender === 'bot' || m.sender === 'BOT') return m;
  }
  return null;
});

const askAnotherQuestion = () => {
  if (chatLoading.value || isBotTyping.value || isChatRecording.value || !conversationId.value) return;
  sendChatText('Ask me another question');
};

const applySuggestedAnswer = () => {
  const botMsg = latestBotMsg.value;
  if (botMsg?.suggested_answer) {
    chatInput.value = botMsg.suggested_answer;
  } else {
    chatInput.value = "I agree with you! Could you share more details?";
  }
};

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'daily', label: '☕ Daily Life & Friends' },
  { id: 'travel', label: '✈️ Travel & Hotel' },
  { id: 'work', label: '💼 Career & Business' },
  { id: 'academic', label: '🎓 Academic & Health' },
  { id: 'custom', label: '✨ Custom' },
];

const QUICK_SUGGESTIONS = [
  '☕ Ordering coffee at Starbucks',
  '💻 Job interview simulation',
  '🎬 Discussing a favorite movie',
  '🛍️ Bargaining at a market',
  '✈️ Airport check-in & customs',
  '🍕 Ordering pizza delivery',
  '🚗 Renting a road trip car',
  '🩺 Visiting an eye doctor',
];

const getScenarioEmoji = (sc) => {
  if (!sc) return '💬';
  const id = (sc.id || '').toLowerCase();
  if (id.includes('coffee') || id.includes('starbucks')) return '☕';
  if (id.includes('hotel')) return '🏨';
  if (id.includes('restaurant') || id.includes('order')) return '🍽️';
  if (id.includes('airport') || id.includes('flight') || id.includes('customs')) return '✈️';
  if (id.includes('shop') || id.includes('clothes')) return '🛍️';
  if (id.includes('tech') || id.includes('developer')) return '💻';
  if (id.includes('interview')) return '👔';
  if (id.includes('business') || id.includes('meeting')) return '📊';
  if (id.includes('ielts')) return '🎓';
  if (id.includes('doctor') || id.includes('clinic')) return '🩺';
  if (id.includes('direction')) return '🗺️';
  if (id.includes('custom') || sc.category === 'custom') return '🔮';
  return '💬';
};

const getCategoryLabel = (category) => {
  switch (category) {
    case 'daily': return 'Daily Life';
    case 'travel': return 'Travel';
    case 'work': return 'Career';
    case 'academic': return 'Academic';
    case 'custom': return 'Custom';
    default: return 'Scenario';
  }
};

const getCategoryBadgeClass = (category) => {
  switch (category) {
    case 'daily': return 'bg-amber-100 text-amber-700';
    case 'travel': return 'bg-sky-100 text-sky-700';
    case 'work': return 'bg-blue-100 text-blue-700';
    case 'academic': return 'bg-blue-100 text-blue-700';
    case 'custom': return 'bg-emerald-100 text-emerald-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const filteredScenarios = computed(() => {
  let list = scenarios.value || [];
  if (selectedCategory.value !== 'all') {
    list = list.filter((s) => {
      if (selectedCategory.value === 'custom') {
        return s.category === 'custom' || (s.id && s.id.startsWith('custom_'));
      }
      return s.category === selectedCategory.value;
    });
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (s) =>
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.bot_role && s.bot_role.toLowerCase().includes(q)) ||
        (s.user_role && s.user_role.toLowerCase().includes(q))
    );
  }
  return list;
});

const openTopicModal = () => {
  isTopicModalOpen.value = true;
  customTopicError.value = '';
};

const closeTopicModal = () => {
  isTopicModalOpen.value = false;
  customTopicError.value = '';
};

const selectScenario = (sc) => {
  if (chatLoading.value || isBotTyping.value || isChatRecording.value) return;
  chatScenarioId.value = sc.id;
  isTopicModalOpen.value = false;
  switchChatScenario();
};

const applyCustomSuggestion = (sug) => {
  const cleaned = sug.replace(/^[\p{Emoji}\s]+/u, '').trim();
  customTopicInput.value = cleaned;
};

const handleCreateCustom = async () => {
  const topic = customTopicInput.value.trim();
  if (!topic) return;
  if (!requireAuthentication()) return;

  isCreatingCustomTopic.value = true;
  customTopicError.value = '';
  try {
    if (createAndSelectCustomScenario) {
      await createAndSelectCustomScenario(topic);
    } else {
      await startChatConversation(topic);
    }
    customTopicInput.value = '';
    isTopicModalOpen.value = false;
  } catch (err) {
    customTopicError.value = 'Could not create scenario at this time. Please try again.';
  } finally {
    isCreatingCustomTopic.value = false;
  }
};

const formatConversationDate = (date) => {
  if (!date) return 'Unknown date';
  return new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};
</script>

<style scoped>
@keyframes soundwave {
  0%, 100% {
    transform: scaleY(0.35);
  }
  50% {
    transform: scaleY(1.3);
  }
}
.animate-soundwave {
  animation: soundwave 0.8s ease-in-out infinite;
  transform-origin: center;
}
</style>
