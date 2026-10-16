<template>
  <div v-if="activeTab === 'chat'" class="flex-1 flex flex-col justify-between h-[calc(100vh-130px)] min-h-[720px] w-full max-w-[1540px] mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
    <!-- Chat Scenario & Tutor Header (TalkPal Ultra-Modern Style - Larger Font & Clear Layout) -->
    <div class="px-5 sm:px-8 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-20">
      <div class="flex items-center space-x-4 min-w-0">
        <!-- Tutor Avatar with Online Indicator -->
        <div class="relative shrink-0">
          <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-indigo-600 to-violet-500 ring-2 ring-indigo-100 shadow-sm">
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
              <span class="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 hidden sm:inline">AI Tutor</span>
            </h2>

            <button
              @click="openTopicModal"
              :disabled="chatLoading || isBotTyping || isChatRecording"
              class="group text-left cursor-pointer flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-300 transition text-sm sm:text-base font-semibold text-slate-700 hover:text-indigo-700 shadow-2xs"
              title="Nhấn để đổi hoặc tự tạo chủ đề mới"
            >
              <span class="text-lg shrink-0">{{ getScenarioEmoji(currentChatScenario) }}</span>
              <span class="truncate max-w-[150px] sm:max-w-[280px]">{{ currentChatScenario?.title || 'Chọn chủ đề' }}</span>
              <ChevronRight class="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
            </button>
          </div>

          <p class="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5 truncate mt-1">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span class="truncate">{{ currentChatScenario?.bot_role ? 'Vai trò: ' + currentChatScenario.bot_role : 'Sẵn sàng • Luyện phản xạ & sửa lỗi từ sai cùng AI' }}</span>
          </p>
        </div>
      </div>

      <!-- Header Action Controls -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <!-- Mobile Feedback Toggle Pill -->
        <button
          @click="isMobileFeedbackOpen = !isMobileFeedbackOpen"
          class="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-sm font-bold transition cursor-pointer shadow-2xs"
          title="Xem phân tích lỗi sai"
        >
          <Sparkles class="w-4 h-4 text-amber-600" />
          <span>Góp ý</span>
        </button>

        <button
          :disabled="chatLoading || isBotTyping || isChatRecording"
          @click="toggleChatHistory"
          title="Lịch sử các cuộc trò chuyện"
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
        >
          <History class="w-4 h-4 text-slate-500" />
          <span class="hidden md:inline">Lịch sử</span>
        </button>

        <button
          :disabled="chatLoading || isBotTyping || isChatRecording"
          @click="resetChatConversation"
          title="Bắt đầu hội thoại mới"
          class="p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition cursor-pointer shadow-2xs flex items-center gap-1.5"
        >
          <RotateCcw class="w-4 h-4 text-slate-500" />
          <span class="hidden md:inline">Làm mới</span>
        </button>
      </div>
    </div>

    <!-- Active Session Target Banner & Quick Actions -->
    <div v-if="conversationId && !isChatHistoryOpen" class="px-5 sm:px-8 py-3 bg-indigo-50/60 border-b border-indigo-100/70 text-sm text-indigo-950 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2 min-w-0">
        <span class="font-bold text-indigo-700 shrink-0">Mục tiêu:</span>
        <span class="truncate text-slate-700 font-medium">{{ currentChatScenario?.description || 'Luyện phản xạ thành câu tự nhiên theo tình huống.' }}</span>
      </div>
      <div class="flex items-center gap-4 font-bold text-xs sm:text-sm shrink-0">
        <button @click="ctx.openSaveWord('', chatMessages.at(-1)?.message_text || '')" class="text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer">
          + Lưu từ vựng
        </button>
        <button @click="ctx.endChatSession" :disabled="isBotTyping || isChatRecording || chatLoading" class="text-rose-600 hover:text-rose-800 hover:underline cursor-pointer">
          Kết thúc phiên
        </button>
      </div>
    </div>

    <!-- Session Summary Modal / Box -->
    <div v-if="ctx.chatSummary.value" class="p-6 bg-slate-50 border-b border-slate-200 space-y-3">
      <div class="space-y-2 rounded-2xl bg-white p-6 border border-indigo-100 shadow-xs max-w-2xl mx-auto">
        <div class="flex items-center gap-2 text-indigo-600 font-bold">
          <Sparkles class="w-5 h-5" />
          <span class="text-base sm:text-lg">Tổng kết phiên luyện tập</span>
        </div>
        <p class="font-bold text-slate-900 text-base sm:text-lg">Đã thực hành {{ ctx.chatSummary.value.turns }} lượt trao đổi, luyện {{ ctx.chatSummary.value.words }} từ vựng.</p>
        <p class="font-normal text-slate-600 text-sm sm:text-base leading-relaxed">Bạn có thể xem lại các góp ý từ sai hoặc lưu các từ vựng mới để tiếp tục ôn tập bằng thẻ ghi nhớ.</p>
        <div class="pt-2 flex gap-4 text-sm sm:text-base font-semibold">
          <button @click="ctx.currentLesson.value ? activeTab = 'lesson' : activeTab = 'home'" class="underline text-indigo-600 hover:text-indigo-800">
            {{ ctx.currentLesson.value ? 'Trở về bài học' : 'Trở về trang chủ' }}
          </button>
          <button @click="ctx.chatSummary.value = null" class="underline text-slate-600 hover:text-slate-800">
            Tiếp tục trò chuyện
          </button>
        </div>
      </div>
    </div>

    <!-- Conversation History View -->
    <div v-if="isChatHistoryOpen" class="flex-1 min-h-0 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-5 sm:p-8">
      <div class="max-w-3xl mx-auto space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Lịch sử các cuộc trò chuyện</h2>
            <p class="mt-1 text-sm text-slate-500">Chọn cuộc trò chuyện để xem lại nội dung và điểm lưu loát</p>
          </div>
          <button @click="toggleChatHistory" aria-label="Đóng lịch sử" class="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:bg-slate-50 cursor-pointer">
            <X class="h-4 w-4" />
          </button>
        </div>

        <div v-if="chatHistoryLoading" class="py-12 text-center text-base text-slate-500">
          <Loader2 class="mx-auto mb-2 h-6 w-6 animate-spin text-indigo-600" />
          Đang tải lịch sử...
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
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-xl font-bold">
              {{ conversation.scenario_title ? conversation.scenario_title.slice(0, 1) : '💬' }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-base sm:text-lg font-bold text-slate-900">{{ conversation.scenario_title }}</span>
              <span class="mt-1 block text-xs sm:text-sm text-slate-500">{{ formatConversationDate(conversation.created_at) }}</span>
            </span>
            <span class="shrink-0 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs sm:text-sm font-bold text-emerald-700">
              {{ Math.round(conversation.fluency_score || 0) }}% lưu loát
            </span>
          </button>
        </div>
        <div v-else class="rounded-3xl border border-dashed border-slate-200 bg-white/80 px-5 py-16 text-center">
          <History class="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p class="text-base font-bold text-slate-700">Chưa có cuộc trò chuyện nào</p>
          <p class="mt-1 text-sm text-slate-500">Các phiên chat của bạn sẽ được lưu tự động tại đây.</p>
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
            <Loader2 class="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
            Đang kết nối phiên hội thoại cùng Emma...
          </div>

          <template v-else>
            <!-- Starter Welcome Screen if no active conversation -->
            <div v-if="!conversationId" class="space-y-6 py-12 text-center max-w-lg mx-auto">
              <div class="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                <Compass class="w-8 h-8" />
              </div>
              <div>
                <h3 class="text-xl sm:text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
                  <span class="text-2xl">{{ getScenarioEmoji(currentChatScenario) }}</span>
                  <span>{{ currentChatScenario ? currentChatScenario.title : 'Chọn chủ đề hội thoại' }}</span>
                </h3>
                <p class="text-base sm:text-lg text-slate-500 mt-2 leading-relaxed">
                  {{ currentChatScenario?.description || 'Chọn kịch bản thực tế hoặc để AI tự tạo tình huống theo ý muốn của bạn.' }}
                </p>
              </div>
              <div class="flex items-center justify-center gap-3 pt-2">
                <button
                  @click="openTopicModal"
                  type="button"
                  class="rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 px-5 py-3 text-sm sm:text-base font-bold text-indigo-700 transition shadow-2xs cursor-pointer flex items-center gap-2"
                >
                  <Compass class="w-4 h-4 text-indigo-600" /> Khám phá các chủ đề
                </button>
                <button
                  @click="isAuthenticated ? startChatConversation() : requireAuthentication()"
                  :disabled="!scenarios.length"
                  type="button"
                  class="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm sm:text-base font-bold text-white disabled:opacity-50 transition shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles class="w-4 h-4" />
                  <span>{{ isAuthenticated ? 'Bắt đầu hội thoại' : 'Đăng nhập' }}</span>
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
                    <div class="reading-text bg-[#f1f5f9] text-slate-800 p-5 sm:p-6 rounded-3xl rounded-tl-sm border border-slate-100 shadow-2xs text-lg sm:text-[19px] leading-relaxed">
                      {{ msg.message_text || msg.text }}
                    </div>

                    <!-- Under-bubble Mini Action Tools -->
                    <div class="flex items-center gap-3.5 px-2 pt-0.5 text-slate-400">
                      <!-- Replay Audio (Edge TTS) -->
                      <button
                        @click="speakBotMessage(msg)"
                        class="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                        title="Nghe phát âm chuẩn"
                      >
                        <Volume2 class="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Phát âm</span>
                      </button>

                      <span class="text-slate-300">•</span>

                      <!-- Translate Toggle Button (文A) -->
                      <button
                        @click="toggleTranslation(msg.id || idx)"
                        class="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold transition cursor-pointer"
                        :class="showTranslationMap[msg.id || idx] ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'"
                        title="Xem dịch nghĩa tiếng Việt"
                      >
                        <Languages class="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>{{ showTranslationMap[msg.id || idx] ? 'Ẩn dịch' : 'Dịch câu' }}</span>
                      </button>
                    </div>

                    <!-- Expandable Vietnamese Translation Box -->
                    <div
                      v-if="showTranslationMap[msg.id || idx]"
                      class="mt-2 text-base text-slate-700 bg-indigo-50/70 border border-indigo-100/90 rounded-2xl px-4.5 py-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-150 shadow-2xs"
                    >
                      <span class="text-xs font-bold text-indigo-700 uppercase shrink-0 mt-0.5 bg-indigo-100 px-2 py-0.5 rounded-md">Bản dịch</span>
                      <p class="leading-relaxed font-medium text-slate-800">{{ msg.translation_vi || 'Xin chào! Hãy trò chuyện tự nhiên cùng tôi nhé.' }}</p>
                    </div>
                  </div>
                </div>

                <!-- User Message Turn -->
                <div v-else class="flex items-end justify-end space-x-3 max-w-[90%] sm:max-w-[82%] self-end group">
                  <!-- Feedback Status Badge (Left of User Bubble) -->
                  <!-- If needs improvement: amber exclamation '!' -->
                  <!-- If correct: green tick '✓' (chỉ cần tick là được) -->
                  <button
                    v-if="msg.feedback"
                    @click="selectFeedbackMessage(idx)"
                    :title="msg.feedback.needs_improvement ? 'Bấm để xem phân tích từ/câu sai' : 'Câu nói chuẩn xác & tự nhiên'"
                    class="shrink-0 mb-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-2xs cursor-pointer transition-transform hover:scale-115 active:scale-95"
                    :class="msg.feedback.needs_improvement ? 'bg-amber-500 text-white ring-2 ring-amber-200' : 'bg-emerald-500 text-white ring-2 ring-emerald-200'"
                  >
                    <span v-if="msg.feedback.needs_improvement" class="font-black text-sm">!</span>
                    <Check v-else class="w-4 h-4 stroke-[3]" />
                  </button>

                  <!-- User Speech Bubble -->
                  <div class="space-y-1.5 flex flex-col items-end">
                    <div
                      @click="selectFeedbackMessage(idx)"
                      class="reading-text bg-[#2b59ff] text-white p-5 sm:p-6 rounded-3xl rounded-br-sm shadow-2xs text-lg sm:text-[19px] leading-relaxed font-normal cursor-pointer hover:brightness-105 transition"
                      :class="selectedFeedbackIndex === idx ? 'ring-3 ring-indigo-300 ring-offset-2' : ''"
                    >
                      {{ msg.message_text || msg.text }}
                    </div>

                    <!-- Fluency Pill if Available -->
                    <div v-if="msg.fluency_score" class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Sparkles class="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                      Lưu loát: {{ Math.round(msg.fluency_score) }}%
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
                  <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                  <span class="ml-2 font-medium text-slate-700">Emma đang soạn câu trả lời...</span>
                </div>
              </div>
            </template>
          </template>
        </div>

        <!-- Suggestion Pills (Another question & Suggest answer) -->
        <div v-if="conversationId && !isBotTyping && !isChatRecording" class="px-5 sm:px-8 pt-2.5 pb-3 flex flex-wrap items-center gap-2.5 border-t border-slate-100 bg-white">
          <!-- Another question button -->
          <button
            @click="askAnotherQuestion"
            :disabled="chatLoading || isBotTyping"
            class="inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm sm:text-base font-semibold transition cursor-pointer border border-slate-200/60 shadow-2xs group"
            title="Nhờ AI hỏi một câu hỏi mới theo chủ đề"
          >
            <HelpCircle class="w-4 h-4 text-indigo-600 group-hover:rotate-12 transition-transform" />
            <span>Another question</span>
          </button>

          <!-- Suggest answer button -->
          <button
            @click="applySuggestedAnswer"
            :disabled="chatLoading || isBotTyping"
            class="inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm sm:text-base font-semibold transition cursor-pointer border border-indigo-200/70 shadow-2xs group"
            title="Điền sẵn câu trả lời mẫu gợi ý vào ô nhập"
          >
            <Lightbulb class="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            <span>Suggest answer</span>
          </button>
        </div>

        <!-- Bottom Chat Input Bar -->
        <div v-if="!isChatHistoryOpen && !ctx.chatSummary.value" class="p-4 sm:p-6 bg-white border-t border-slate-100">
          <div class="flex items-center space-x-3">
            <!-- Voice Input Button -->
            <button
              :disabled="chatLoading || isBotTyping || !conversationId"
              @click="toggleChatVoice"
              :title="isChatRecording ? 'Dừng & gửi giọng nói' : 'Ghi âm giọng nói'"
              :class="isChatRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
              class="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition shrink-0 cursor-pointer shadow-2xs"
            >
              <Square v-if="isChatRecording" class="w-6 h-6" />
              <Mic v-else class="w-6 h-6" />
            </button>

            <!-- Text Input -->
            <input
              v-model="chatInput"
              @keyup.enter="sendChatText"
              :disabled="chatLoading || isBotTyping || isChatRecording || !conversationId"
              type="text"
              placeholder="Nhập hoặc nhấn mic nói tiếng Anh..."
              class="flex-1 bg-slate-100 text-base sm:text-lg lg:text-xl text-slate-900 placeholder-slate-400 px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
            />

            <!-- Send Button -->
            <button
              @click="sendChatText"
              :disabled="chatLoading || isBotTyping || isChatRecording || !conversationId || !chatInput.trim()"
              class="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white flex items-center justify-center shadow-xs shadow-indigo-600/30 transition shrink-0 cursor-pointer"
            >
              <Send class="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      <!-- COLUMN 2: Real-time Feedback Panel (Desktop TalkPal Right Side) -->
      <!-- CHỈ PHÂN TÍCH TỪ SAI - NÓI ĐÚNG CHỈ CẦN TICK -->
      <aside class="hidden lg:flex w-88 xl:w-[410px] flex-col justify-between bg-slate-50/70 border-l border-slate-200/80 p-6 overflow-y-auto shrink-0">
        <div class="space-y-6">
          <!-- Feedback Panel Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-200/80">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-2xs">
                <Sparkles class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold text-slate-900 leading-tight">Phản hồi thời gian thực</h3>
                <p class="text-xs sm:text-sm text-slate-500">Phân tích từ sai & cách nói tự nhiên</p>
              </div>
            </div>
          </div>

          <!-- Active Feedback Content -->
          <template v-if="activeFeedbackMsg">
            <!-- Dotted/Dashed User Sentence Box -->
            <div class="border border-dashed border-indigo-200 bg-white rounded-2xl p-4.5 shadow-2xs space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs sm:text-sm font-bold text-indigo-700 flex items-center gap-1.5">
                  <MessageSquare class="w-4 h-4 text-indigo-600" /> Câu bạn đã nói
                </span>
                <span v-if="activeFeedbackMsg.fluency_score" class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  {{ Math.round(activeFeedbackMsg.fluency_score) }}% lưu loát
                </span>
              </div>
              <p class="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                "{{ activeFeedbackMsg.message_text || activeFeedbackMsg.text }}"
              </p>
            </div>

            <!-- Feedback Diagnosis Card -->
            <div v-if="activeFeedbackMsg.feedback" class="space-y-5">
              <!-- Case 1: Có từ sai / cần cải thiện -> PHÂN TÍCH CHI TIẾT TỪ SAI -->
              <template v-if="activeFeedbackMsg.feedback.needs_improvement">
                <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-bold">
                  <AlertCircle class="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Phát hiện từ sai hoặc diễn đạt chưa chuẩn</span>
                </div>

                <!-- Phrasing comparison: Từ sai vs Gợi ý chuẩn -->
                <div class="space-y-3">
                  <!-- Original phrase (red cross tag) -->
                  <div v-if="activeFeedbackMsg.feedback.original_phrase" class="bg-slate-100/80 border border-slate-200 rounded-2xl p-3.5 flex items-start gap-3">
                    <span class="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold text-sm mt-0.5">✕</span>
                    <div class="min-w-0">
                      <span class="text-xs font-bold text-slate-400 uppercase tracking-wide block">Từ / Cụm từ cần sửa</span>
                      <p class="text-base font-semibold text-slate-800 line-through decoration-rose-500 decoration-2">
                        {{ activeFeedbackMsg.feedback.original_phrase }}
                      </p>
                    </div>
                  </div>

                  <!-- Recommended phrase (TalkPal bright green #009b4d tag) -->
                  <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
                    <span class="w-6 h-6 rounded-full bg-[#009b4d] text-white flex items-center justify-center shrink-0 font-bold text-sm mt-0.5">✓</span>
                    <div class="min-w-0">
                      <span class="text-xs font-bold text-emerald-800 uppercase tracking-wide block">Nên nói tự nhiên như sau</span>
                      <p class="text-base sm:text-lg font-bold text-emerald-950 leading-snug">
                        {{ activeFeedbackMsg.feedback.recommended_phrase || activeFeedbackMsg.feedback.original_phrase }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Explanation Box in Vietnamese -->
                <div class="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-2xs space-y-2">
                  <span class="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Lightbulb class="w-4 h-4 text-amber-500" /> Giải thích vì sao sai:
                  </span>
                  <p class="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                    {{ activeFeedbackMsg.feedback.explanation || 'Để câu nói tự nhiên và đúng ngữ pháp hơn, hãy sử dụng cách diễn đạt gợi ý phía trên.' }}
                  </p>
                </div>
              </template>

              <!-- Case 2: Nói đúng -> CHỈ CẦN TICK, KHÔNG PHÂN TÍCH RƯỜM RÀ -->
              <template v-else>
                <div class="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-6 text-center space-y-3">
                  <div class="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
                    <Check class="w-8 h-8 stroke-[3]" />
                  </div>
                  <h4 class="text-lg sm:text-xl font-bold text-emerald-950">Câu nói hoàn toàn chính xác!</h4>
                  <p class="text-sm sm:text-base text-emerald-800 font-medium leading-relaxed">
                    Bạn đã diễn đạt đúng ngữ pháp và tự nhiên. Không có từ sai nào cần phân tích.
                  </p>
                </div>
              </template>
            </div>

            <!-- Analyzing pending state -->
            <div v-else class="p-6 text-center bg-white rounded-2xl border border-slate-200/80 space-y-2">
              <Loader2 class="w-6 h-6 animate-spin mx-auto text-indigo-600" />
              <p class="text-sm font-semibold text-slate-600">AI đang phân tích câu...</p>
            </div>
          </template>

          <!-- Empty placeholder when no user messages yet -->
          <div v-else class="py-14 text-center space-y-3">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs">
              <Sparkles class="w-8 h-8" />
            </div>
            <div>
              <h4 class="text-base font-bold text-slate-800">Trợ lý phân tích từ sai</h4>
              <p class="text-sm text-slate-500 mt-1.5 max-w-[260px] mx-auto leading-relaxed">
                Khi bạn nói có từ chưa chuẩn, AI sẽ hiển thị chi tiết từ sai và cách sửa đúng ngay tại đây!
              </p>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-200/70 text-xs text-slate-400 text-center">
          TalkPal Real-time AI Grammar Engine
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
              <Sparkles class="w-5 h-5 text-indigo-600" />
              <h3 class="text-base font-bold text-slate-900">Phản hồi & Sửa từ sai</h3>
            </div>
            <button @click="isMobileFeedbackOpen = false" class="p-1 rounded-full text-slate-400 hover:text-slate-600">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-5 overflow-y-auto space-y-4">
            <template v-if="activeFeedbackMsg">
              <div class="border border-dashed border-indigo-200 bg-indigo-50/40 rounded-2xl p-4 space-y-1.5">
                <span class="text-xs font-bold text-indigo-700">Câu bạn đã nói:</span>
                <p class="text-base sm:text-lg font-bold text-slate-900">"{{ activeFeedbackMsg.message_text || activeFeedbackMsg.text }}"</p>
              </div>

              <div v-if="activeFeedbackMsg.feedback" class="space-y-3">
                <!-- Từ sai cần sửa -->
                <div v-if="activeFeedbackMsg.feedback.needs_improvement" class="space-y-3">
                  <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <AlertCircle class="w-4 h-4 text-amber-600" />
                    <span>Phát hiện từ sai / cần cải thiện</span>
                  </div>

                  <div v-if="activeFeedbackMsg.feedback.original_phrase" class="bg-slate-100/80 border border-slate-200 rounded-2xl p-3 flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">✕</span>
                    <div>
                      <span class="text-xs font-bold text-slate-400 uppercase tracking-wide block">Từ / cụm từ cần sửa</span>
                      <p class="text-base font-semibold text-slate-800 line-through">{{ activeFeedbackMsg.feedback.original_phrase }}</p>
                    </div>
                  </div>

                  <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-2.5">
                    <span class="w-5 h-5 rounded-full bg-[#009b4d] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">✓</span>
                    <div>
                      <span class="text-xs font-bold text-emerald-800 uppercase tracking-wide block">Nên nói như sau</span>
                      <p class="text-base sm:text-lg font-bold text-emerald-950">{{ activeFeedbackMsg.feedback.recommended_phrase || activeFeedbackMsg.feedback.original_phrase }}</p>
                    </div>
                  </div>

                  <div class="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
                    <span class="text-xs font-bold text-slate-700">Giải thích:</span>
                    <p class="text-sm sm:text-base text-slate-600 leading-relaxed">{{ activeFeedbackMsg.feedback.explanation }}</p>
                  </div>
                </div>

                <!-- Nói đúng: chỉ tick -->
                <div v-else class="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-2">
                  <div class="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                    <Check class="w-6 h-6 stroke-[3]" />
                  </div>
                  <h4 class="text-base font-bold text-emerald-950">Câu nói chuẩn xác!</h4>
                  <p class="text-sm text-emerald-800">Không có từ sai cần phân tích.</p>
                </div>
              </div>
            </template>
            <div v-else class="text-center py-8 text-sm text-slate-500">
              Chưa có tin nhắn nào để hiển thị phản hồi.
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
      <div class="bg-white w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        <!-- Modal Header -->
        <div class="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/60 via-white to-violet-50/60">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Compass class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-bold text-gray-900">Khám phá & Tùy chọn chủ đề hội thoại</h2>
              <p class="text-xs sm:text-sm text-gray-500">Chọn kịch bản thực tế hoặc để AI tự tạo tình huống theo ý bạn</p>
            </div>
          </div>
          <button
            @click="closeTopicModal"
            aria-label="Đóng"
            class="w-9 h-9 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-6 overflow-y-auto space-y-5 no-scrollbar">
          <!-- Section 1: Create Custom Topic (AI Generator) -->
          <div class="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border border-indigo-200/80 shadow-xs space-y-3.5">
            <div class="flex items-center justify-between">
              <span class="text-xs sm:text-sm font-bold uppercase tracking-wide text-indigo-700 flex items-center gap-1.5">
                <Sparkles class="w-4 h-4 text-indigo-600" /> Tự tạo chủ đề theo ý bạn (AI Scenario Generator)
              </span>
              <span class="text-xs font-semibold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                Tự do sáng tạo
              </span>
            </div>

            <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Nhập bất kỳ tình huống nào bạn muốn thực hành (tiếng Việt hoặc tiếng Anh), AI sẽ tự động phân vai và soạn kịch bản hội thoại:
            </p>

            <div class="flex items-center gap-2.5">
              <input
                v-model="customTopicInput"
                @keyup.enter="handleCreateCustom"
                :disabled="isCreatingCustomTopic || chatLoading"
                type="text"
                placeholder="Ví dụ: Gọi trà sữa ở Gong Cha, Hỏi đường ở London, Mặc cả mua áo khoác..."
                class="flex-1 bg-white border border-indigo-200 text-sm sm:text-base text-gray-800 placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs"
              />
              <button
                @click="handleCreateCustom"
                :disabled="isCreatingCustomTopic || chatLoading || !customTopicInput.trim()"
                type="button"
                class="shrink-0 px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <Loader2 v-if="isCreatingCustomTopic" class="w-4 h-4 animate-spin" />
                <Sparkles v-else class="w-4 h-4" />
                <span>{{ isCreatingCustomTopic ? 'AI đang tạo...' : 'Tạo & Bắt đầu' }}</span>
              </button>
            </div>

            <p v-if="customTopicError" class="text-xs sm:text-sm text-rose-600 font-medium">
              ⚠️ {{ customTopicError }}
            </p>

            <!-- Quick Suggestions Chips -->
            <div class="pt-1">
              <span class="text-xs font-bold text-gray-500 block mb-2">Gợi ý chủ đề nhanh:</span>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(sug, sIdx) in QUICK_SUGGESTIONS"
                  :key="sIdx"
                  @click="applyCustomSuggestion(sug)"
                  type="button"
                  class="text-xs sm:text-sm font-medium bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-100 px-3 py-1.5 rounded-xl transition shadow-2xs cursor-pointer hover:border-indigo-300"
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
                <BookOpen class="w-4 h-4 text-indigo-600" />
                <span>Danh sách các tình huống có sẵn ({{ filteredScenarios.length }})</span>
              </h3>

              <!-- Search Bar -->
              <div class="relative w-full sm:w-64">
                <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Tìm kiếm kịch bản..."
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
                :class="selectedCategory === cat.id ? 'bg-indigo-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
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
                class="p-4 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between group hover:shadow-md hover:-translate-y-0.5"
                :class="sc.id === chatScenarioId ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs' : 'bg-white border-gray-200 hover:border-indigo-200'"
              >
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-2xl">{{ getScenarioEmoji(sc) }}</span>
                    <span
                      v-if="sc.id === chatScenarioId"
                      class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full"
                    >
                      <Check class="w-3.5 h-3.5" /> Đang luyện tập
                    </span>
                    <span
                      v-else
                      class="text-xs uppercase font-bold px-2.5 py-0.5 rounded-md"
                      :class="getCategoryBadgeClass(sc.category)"
                    >
                      {{ getCategoryLabel(sc.category) }}
                    </span>
                  </div>

                  <h4 class="text-sm sm:text-base font-bold text-gray-900 group-hover:text-indigo-600 transition leading-snug line-clamp-2">
                    {{ sc.title }}
                  </h4>

                  <p class="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {{ sc.description }}
                  </p>
                </div>

                <!-- Role details -->
                <div class="pt-3 mt-2.5 border-t border-gray-100/80 flex items-center justify-between text-xs sm:text-sm">
                  <div class="text-gray-500 truncate max-w-[190px]">
                    <span class="font-semibold text-indigo-700">AI:</span> {{ (sc.bot_role || '').split('(')[0] }}
                  </div>
                  <span class="font-bold text-indigo-600 group-hover:translate-x-0.5 transition shrink-0 flex items-center gap-0.5">
                    Bắt đầu <ChevronRight class="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            <div v-else class="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-sm text-gray-500">
              Không tìm thấy chủ đề nào phù hợp với từ khóa "{{ searchQuery }}". Hãy thử tự tạo bằng ô bên trên!
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  AlertCircle,
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
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Square,
  Volume2,
  X,
} from 'lucide-vue-next';
import { computed, inject, ref } from 'vue';

const ctx = inject('screenContext');
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
const toggleChatHistory = ctx.toggleChatHistory;
const openChatConversation = ctx.openChatConversation;

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
    if (m.sender === 'user' || m.sender === 'USER') return m;
  }
  // Ưu tiên hiển thị câu có từ sai cần cải thiện (needs_improvement: true)
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    if ((m.sender === 'user' || m.sender === 'USER') && m.feedback?.needs_improvement) return m;
  }
  // Nếu không có câu nào sai, lấy câu gần nhất của người dùng
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    if (m.sender === 'user' || m.sender === 'USER') return m;
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
  { id: 'all', label: 'Tất cả' },
  { id: 'daily', label: '☕ Đời sống & Bạn bè' },
  { id: 'travel', label: '✈️ Du lịch & Khách sạn' },
  { id: 'work', label: '💼 Công việc & IT' },
  { id: 'academic', label: '🎓 Học thuật & Y tế' },
  { id: 'custom', label: '✨ Tự tạo' },
];

const QUICK_SUGGESTIONS = [
  '☕ Gọi đồ uống tại Starbucks',
  '💻 Phỏng vấn kỹ thuật Backend / Python',
  '🎬 Bàn luận về bộ phim yêu thích',
  '🛍️ Mặc cả mua quà lưu niệm ở chợ đêm',
  '✈️ Đổi vé máy bay & Thủ tục quá cảnh',
  '🍕 Gọi điện thoại đặt pizza giao tận nơi',
  '🚗 Thuê xe tự lái khi đi du lịch',
  '🩺 Đi khám mắt và lấy đơn thuốc',
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
    case 'daily': return 'Đời sống';
    case 'travel': return 'Du lịch';
    case 'work': return 'Công việc';
    case 'academic': return 'Học thuật';
    case 'custom': return 'Tự tạo';
    default: return 'Tình huống';
  }
};

const getCategoryBadgeClass = (category) => {
  switch (category) {
    case 'daily': return 'bg-amber-100 text-amber-700';
    case 'travel': return 'bg-sky-100 text-sky-700';
    case 'work': return 'bg-indigo-100 text-indigo-700';
    case 'academic': return 'bg-purple-100 text-purple-700';
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
    customTopicError.value = 'Không thể tạo kịch bản lúc này. Vui lòng thử lại.';
  } finally {
    isCreatingCustomTopic.value = false;
  }
};

const formatConversationDate = (date) => {
  if (!date) return 'Ngày chưa xác định';
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};
</script>
