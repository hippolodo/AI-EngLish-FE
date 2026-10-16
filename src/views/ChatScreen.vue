<template>
  <div v-if="activeTab === 'chat'" class="flex-1 flex flex-col justify-between h-[calc(100vh-130px)] min-h-[700px] w-full max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <!-- Chat Scenario Header (Real from Backend with Topic Explorer) -->
          <div class="px-5 sm:px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-xs">
            <div class="flex items-center space-x-3.5 min-w-0">
              <div class="relative shrink-0">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-semibold shadow-md shadow-indigo-500/20">
                  <Bot class="w-6 h-6" />
                </div>
                <span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2.5">
                  <button
                    @click="openTopicModal"
                    :disabled="chatLoading || isBotTyping || isChatRecording"
                    class="group text-left cursor-pointer flex items-center gap-2 transition max-w-[220px] sm:max-w-[400px]"
                    title="Nhấn để đổi hoặc tự tạo chủ đề mới"
                  >
                    <span class="text-xl shrink-0">{{ getScenarioEmoji(currentChatScenario) }}</span>
                    <span class="text-base sm:text-lg font-bold text-gray-900 group-hover:text-indigo-600 truncate block">
                      {{ currentChatScenario?.title || 'Chọn chủ đề hội thoại' }}
                    </span>
                  </button>
                  <button
                    @click="openTopicModal"
                    :disabled="chatLoading || isBotTyping || isChatRecording"
                    class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-bold transition cursor-pointer border border-indigo-200 shadow-2xs"
                    title="Xem tất cả chủ đề hoặc tự nhập tình huống mới"
                  >
                    <Compass class="w-4 h-4 text-indigo-600" />
                    <span>Đổi chủ đề</span>
                  </button>
                </div>
                <p class="text-xs sm:text-sm text-emerald-600 font-medium flex items-center gap-1.5 truncate mt-0.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span class="truncate">{{ currentChatScenario?.bot_role ? 'Đóng vai: ' + currentChatScenario.bot_role : 'Sẵn sàng • Luyện hội thoại cùng AI' }}</span>
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button :disabled="chatLoading || isBotTyping || isChatRecording" @click="toggleChatHistory" title="Lịch sử trò chuyện" class="inline-flex items-center gap-1.5 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-xs sm:text-sm font-semibold text-violet-700 transition hover:bg-violet-100 cursor-pointer shadow-2xs">
                <History class="w-4 h-4" />
                <span class="hidden sm:inline">Lịch sử</span>
              </button>
              <button :disabled="chatLoading || isBotTyping || isChatRecording" @click="resetChatConversation" title="Bắt đầu cuộc trò chuyện mới" class="text-sm text-gray-500 hover:text-gray-800 p-2.5 rounded-xl border border-gray-200 cursor-pointer shadow-2xs">
                <RotateCcw class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div v-if="conversationId" class="space-y-2.5 border-b bg-indigo-50/80 p-4 text-sm sm:text-base text-indigo-950">
            <p class="font-medium">Mục tiêu: {{ currentChatScenario?.description || 'Trả lời thành câu và luyện dùng từ trong tình huống.' }}</p>
            <div class="flex gap-4 font-bold text-sm">
              <button @click="ctx.openSaveWord('', chatMessages.at(-1)?.message_text || '')" class="text-indigo-700 hover:underline cursor-pointer">Lưu từ cần ôn</button>
              <button @click="ctx.endChatSession" :disabled="isBotTyping || isChatRecording || chatLoading" class="text-rose-600 hover:underline cursor-pointer">Kết thúc & tổng kết</button>
            </div>
            <div v-if="ctx.chatSummary.value" class="space-y-2 rounded-2xl bg-white p-4 border border-indigo-100 shadow-xs">
              <p class="font-bold text-gray-900">Đã thực hành {{ ctx.chatSummary.value.turns }} lượt trả lời, {{ ctx.chatSummary.value.words }} từ.</p>
              <p class="font-normal text-slate-600 text-sm">Xem lại hội thoại và lưu những từ bạn muốn ôn. Đây là thống kê luyện tập, không phải điểm năng lực.</p>
              <div class="pt-1 flex gap-3 text-sm font-semibold">
                <button @click="ctx.currentLesson.value ? activeTab = 'lesson' : activeTab = 'home'" class="underline text-indigo-600">{{ ctx.currentLesson.value ? 'Trở về bài học' : 'Trở về trang chủ' }}</button>
                <button @click="ctx.chatSummary.value = null" class="underline text-slate-600">Tiếp tục trò chuyện</button>
              </div>
            </div>
          </div>
          <div v-if="isChatHistoryOpen" class="flex-1 min-h-0 overflow-y-auto bg-gradient-to-b from-violet-50/70 to-white p-5">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h2 class="text-base font-bold text-slate-900">Các cuộc trò chuyện</h2>
                <p class="mt-0.5 text-xs sm:text-sm text-slate-500">Chọn một cuộc trò chuyện để xem lại tin nhắn</p>
              </div>
              <button @click="toggleChatHistory" aria-label="Đóng lịch sử" class="rounded-xl border border-violet-100 bg-white p-2.5 text-slate-500 transition hover:bg-violet-50 cursor-pointer">
                <X class="h-4 w-4" />
              </button>
            </div>

            <div v-if="chatHistoryLoading" class="py-12 text-center text-sm sm:text-base text-slate-500">
              <Loader2 class="mx-auto mb-2 h-6 w-6 animate-spin text-violet-600" />
              Đang tải lịch sử...
            </div>
            <p v-else-if="chatHistoryError" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm sm:text-base text-rose-700">{{ chatHistoryError }}</p>
            <div v-else-if="chatConversations.length" class="space-y-2.5">
              <button
                v-for="conversation in chatConversations"
                :key="conversation.id"
                type="button"
                class="flex w-full items-center gap-3.5 rounded-2xl border border-violet-100 bg-white p-4 text-left shadow-2xs transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md cursor-pointer"
                @click="openChatConversation(conversation)"
              >
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600">
                  <MessageSquare class="h-5 w-5" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm sm:text-base font-bold text-slate-800">{{ conversation.scenario_title }}</span>
                  <span class="mt-1 block text-xs sm:text-sm text-slate-500">{{ formatConversationDate(conversation.created_at) }}</span>
                </span>
                <span class="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs sm:text-sm font-bold text-emerald-700">{{ Math.round(conversation.fluency_score || 0) }}%</span>
              </button>
            </div>
            <div v-else class="rounded-2xl border border-dashed border-violet-200 bg-white/80 px-5 py-12 text-center">
              <History class="mx-auto mb-2 h-8 w-8 text-violet-300" />
              <p class="text-base font-bold text-slate-700">Chưa có cuộc trò chuyện nào</p>
              <p class="mt-1 text-sm text-slate-500">Các phiên chat của bạn sẽ xuất hiện ở đây.</p>
            </div>
          </div>

          <p v-if="chatError" role="alert" class="mx-4 my-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm sm:text-base text-rose-700">{{ chatError }}</p>
          <!-- Chat Scrollable Messages Area -->
          <div v-else ref="chatScrollContainer" class="flex-1 p-5 sm:p-6 space-y-5 overflow-y-auto no-scrollbar">
            <div v-if="chatLoading" class="py-12 text-center text-sm sm:text-base text-gray-500">
              <Loader2 class="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
              Đang kết nối phiên hội thoại AI...
            </div>

            <template v-else>
              <div v-if="!conversationId" class="space-y-4 py-12 text-center max-w-lg mx-auto">
                <div class="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                  <Compass class="w-8 h-8" />
                </div>
                <div>
                  <h3 class="text-lg sm:text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    <span class="text-2xl">{{ getScenarioEmoji(currentChatScenario) }}</span>
                    <span>{{ currentChatScenario ? currentChatScenario.title : 'Chọn chủ đề hội thoại' }}</span>
                  </h3>
                  <p class="text-sm sm:text-base text-gray-500 mt-2 leading-relaxed">
                    {{ currentChatScenario?.description || 'Chọn kịch bản thực tế hoặc để AI tự tạo tình huống theo ý muốn của bạn.' }}
                  </p>
                </div>
                <div class="flex items-center justify-center gap-3 pt-2">
                  <button
                    @click="openTopicModal"
                    type="button"
                    class="rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition shadow-2xs cursor-pointer flex items-center gap-2"
                  >
                    <Compass class="w-4 h-4 text-indigo-600" /> Khám phá các chủ đề
                  </button>
                  <button
                    @click="isAuthenticated ? startChatConversation() : requireAuthentication()"
                    :disabled="!scenarios.length"
                    type="button"
                    class="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 transition shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles class="w-4 h-4" />
                    <span>{{ isAuthenticated ? 'Bắt đầu hội thoại' : 'Đăng nhập' }}</span>
                  </button>
                </div>
              </div>
              <div v-else-if="currentChatScenario" class="text-center my-2">
                <span class="px-4 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs sm:text-sm font-bold inline-flex items-center gap-2">
                  <span>{{ getScenarioEmoji(currentChatScenario) }}</span>
                  <span>{{ currentChatScenario.description || 'Nói tiếng Anh tự nhiên cùng AI' }}</span>
                </span>
              </div>

              <!-- Message bubbles -->
              <div v-for="(msg, idx) in chatMessages" :key="idx" class="flex flex-col">
                <!-- Bot Message -->
                <div v-if="msg.sender === 'BOT' || msg.sender === 'bot'" class="flex items-start space-x-3 max-w-[85%] sm:max-w-[78%] self-start">
                  <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles class="w-4 h-4" />
                  </div>
                  <div class="space-y-1.5">
                    <div class="reading-text bg-white text-gray-800 p-4 sm:p-5 rounded-3xl rounded-tl-sm border border-gray-100 shadow-xs text-base sm:text-[17px] leading-relaxed">
                      {{ msg.message_text || msg.text }}
                    </div>
                    <button @click="speakBotMessage(msg)" class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-400 hover:text-indigo-600 px-2 transition cursor-pointer">
                      <Volume2 class="w-3.5 h-3.5" />
                      <span>Nghe phát âm</span>
                    </button>
                  </div>
                </div>

                <!-- User Message -->
                <div v-else class="flex flex-col items-end max-w-[85%] sm:max-w-[78%] self-end space-y-1.5">
                  <div class="reading-text bg-indigo-600 text-white p-4 sm:p-5 rounded-3xl rounded-tr-sm shadow-xs text-base sm:text-[17px] leading-relaxed font-normal">
                    {{ msg.message_text || msg.text }}
                  </div>
                  <div v-if="msg.fluency_score" class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Sparkles class="w-3 h-3 text-emerald-500 fill-emerald-500" />
                    Lưu loát: {{ Math.round(msg.fluency_score) }}%
                  </div>
                </div>
              </div>

              <!-- Typing indicator -->
              <div v-if="isBotTyping" class="flex items-start space-x-3 max-w-[85%] self-start">
                <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot class="w-4 h-4" />
                </div>
                <div class="bg-white text-gray-500 p-4 rounded-3xl rounded-tl-sm border border-gray-100 shadow-xs text-sm sm:text-base flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                  <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                  <span class="ml-1 font-medium">AI đang suy nghĩ...</span>
                </div>
              </div>
            </template>
          </div>

          <!-- Bottom Chat Input Bar -->
          <div v-if="!isChatHistoryOpen && !ctx.chatSummary.value" class="p-3.5 sm:p-4 bg-white border-t border-gray-100">
            <div class="flex items-center space-x-2.5">
              <button
                :disabled="chatLoading || isBotTyping || !conversationId" @click="toggleChatVoice"
                :title="isChatRecording ? 'Dừng & gửi giọng nói' : 'Ghi âm giọng nói'"
                :class="isChatRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                class="w-12 h-12 rounded-2xl flex items-center justify-center transition shrink-0 cursor-pointer"
              >
                <Square v-if="isChatRecording" class="w-6 h-6" />
                <Mic v-else class="w-6 h-6" />
              </button>
              <input
                v-model="chatInput"
                @keyup.enter="sendChatText"
                :disabled="chatLoading || isBotTyping || isChatRecording || !conversationId"
                type="text"
                placeholder="Nhập hoặc nhấn mic nói tiếng Anh..."
                class="flex-1 bg-gray-100 text-base sm:text-lg text-gray-900 placeholder-gray-400 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
              />
              <button
                @click="sendChatText"
                :disabled="chatLoading || isBotTyping || isChatRecording || !conversationId || !chatInput.trim()"
                class="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white flex items-center justify-center shadow-xs shadow-indigo-600/30 transition shrink-0 cursor-pointer"
              >
                <Send class="w-5 h-5" />
              </button>
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
              <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/60 via-white to-violet-50/60">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Compass class="w-5 h-5" />
                  </div>
                  <div>
                    <h2 class="text-base font-bold text-gray-900">Khám phá & Tùy chọn chủ đề hội thoại</h2>
                    <p class="text-xs text-gray-500">Chọn kịch bản thực tế hoặc để AI tự tạo tình huống theo ý bạn</p>
                  </div>
                </div>
                <button
                  @click="closeTopicModal"
                  aria-label="Đóng"
                  class="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition cursor-pointer"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>

              <!-- Modal Body (Scrollable) -->
              <div class="p-5 overflow-y-auto space-y-5 no-scrollbar">
                <!-- Section 1: Create Custom Topic (AI Generator) -->
                <div class="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border border-indigo-200/80 shadow-xs space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wide text-indigo-700 flex items-center gap-1.5">
                      <Sparkles class="w-3.5 h-3.5 text-indigo-600" /> Tự tạo chủ đề theo ý bạn (AI Scenario Generator)
                    </span>
                    <span class="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Tự do sáng tạo
                    </span>
                  </div>

                  <p class="text-xs text-gray-600 leading-relaxed">
                    Nhập bất kỳ tình huống nào bạn muốn thực hành (tiếng Việt hoặc tiếng Anh), AI sẽ tự động phân vai và soạn kịch bản hội thoại:
                  </p>

                  <div class="flex items-center gap-2">
                    <input
                      v-model="customTopicInput"
                      @keyup.enter="handleCreateCustom"
                      :disabled="isCreatingCustomTopic || chatLoading"
                      type="text"
                      placeholder="Ví dụ: Gọi trà sữa ở Gong Cha, Hỏi đường ở London, Mặc cả mua áo khoác..."
                      class="flex-1 bg-white border border-indigo-200 text-xs sm:text-sm text-gray-800 placeholder-gray-400 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs"
                    />
                    <button
                      @click="handleCreateCustom"
                      :disabled="isCreatingCustomTopic || chatLoading || !customTopicInput.trim()"
                      type="button"
                      class="shrink-0 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Loader2 v-if="isCreatingCustomTopic" class="w-3.5 h-3.5 animate-spin" />
                      <Sparkles v-else class="w-3.5 h-3.5" />
                      <span>{{ isCreatingCustomTopic ? 'AI đang tạo...' : 'Tạo & Bắt đầu' }}</span>
                    </button>
                  </div>

                  <p v-if="customTopicError" class="text-xs text-rose-600 font-medium">
                    ⚠️ {{ customTopicError }}
                  </p>

                  <!-- Quick Suggestions Chips -->
                  <div class="pt-1">
                    <span class="text-[11px] font-bold text-gray-500 block mb-1.5">Gợi ý chủ đề nhanh:</span>
                    <div class="flex flex-wrap gap-1.5">
                      <button
                        v-for="(sug, sIdx) in QUICK_SUGGESTIONS"
                        :key="sIdx"
                        @click="applyCustomSuggestion(sug)"
                        type="button"
                        class="text-[11px] font-medium bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-100 px-2.5 py-1 rounded-lg transition shadow-2xs cursor-pointer hover:border-indigo-300"
                      >
                        {{ sug }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Section 2: Preset Scenarios Explorer -->
                <div class="space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 class="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                      <BookOpen class="w-3.5 h-3.5 text-indigo-600" />
                      <span>Danh sách các tình huống có sẵn ({{ filteredScenarios.length }})</span>
                    </h3>

                    <!-- Search Bar -->
                    <div class="relative w-full sm:w-56">
                      <Search class="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Tìm kiếm kịch bản..."
                        class="w-full bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>

                  <!-- Category Filter Tabs -->
                  <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                    <button
                      v-for="cat in CATEGORIES"
                      :key="cat.id"
                      @click="selectedCategory = cat.id"
                      type="button"
                      class="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer"
                      :class="selectedCategory === cat.id ? 'bg-indigo-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                    >
                      {{ cat.label }}
                    </button>
                  </div>

                  <!-- Scenarios Grid -->
                  <div v-if="filteredScenarios.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div
                      v-for="sc in filteredScenarios"
                      :key="sc.id"
                      @click="selectScenario(sc)"
                      class="p-3.5 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between group hover:shadow-md hover:-translate-y-0.5"
                      :class="sc.id === chatScenarioId ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs' : 'bg-white border-gray-200 hover:border-indigo-200'"
                    >
                      <div class="space-y-1.5">
                        <div class="flex items-center justify-between">
                          <span class="text-xl">{{ getScenarioEmoji(sc) }}</span>
                          <span
                            v-if="sc.id === chatScenarioId"
                            class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full"
                          >
                            <Check class="w-3 h-3" /> Đang luyện tập
                          </span>
                          <span
                            v-else
                            class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md"
                            :class="getCategoryBadgeClass(sc.category)"
                          >
                            {{ getCategoryLabel(sc.category) }}
                          </span>
                        </div>

                        <h4 class="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition leading-snug line-clamp-2">
                          {{ sc.title }}
                        </h4>

                        <p class="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                          {{ sc.description }}
                        </p>
                      </div>

                      <!-- Role details -->
                      <div class="pt-2.5 mt-2 border-t border-gray-100/80 flex items-center justify-between text-[11px]">
                        <div class="text-gray-500 truncate max-w-[170px]">
                          <span class="font-semibold text-indigo-700">AI:</span> {{ (sc.bot_role || '').split('(')[0] }}
                        </div>
                        <span class="font-bold text-indigo-600 group-hover:translate-x-0.5 transition shrink-0 flex items-center gap-0.5">
                          Bắt đầu <ChevronRight class="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div v-else class="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-500">
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
  BookOpen,
  Bot,
  Check,
  ChevronRight,
  Compass,
  History,
  Loader2,
  MessageSquare,
  Mic,
  Plus,
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
const speakingResult = ctx.speakingResult;
const speakingTopicId = ctx.speakingTopicId;
const startChatConversation = ctx.startChatConversation;
const createAndSelectCustomScenario = ctx.createAndSelectCustomScenario;
const startTopic = ctx.startTopic;
const stopAndAnalyzeSpeaking = ctx.stopAndAnalyzeSpeaking;
const studyLoading = ctx.studyLoading;
const studyMode = ctx.studyMode;
const submitCardReview = ctx.submitCardReview;
const submitWritingEvaluation = ctx.submitWritingEvaluation;
const submittedQuizDetail = ctx.submittedQuizDetail;
const switchChatScenario = ctx.switchChatScenario;
const switchStudyMode = ctx.switchStudyMode;
const targetIpa = ctx.targetIpa;
const targetSpeakingText = ctx.targetSpeakingText;
const targetTranslation = ctx.targetTranslation;
const toggleChatVoice = ctx.toggleChatVoice;
const toggleChatHistory = ctx.toggleChatHistory;
const openChatConversation = ctx.openChatConversation;
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

// Topic Explorer & Custom Topic State
const isTopicModalOpen = ref(false);
const selectedCategory = ref('all');
const searchQuery = ref('');
const customTopicInput = ref('');
const isCreatingCustomTopic = ref(false);
const customTopicError = ref('');

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
