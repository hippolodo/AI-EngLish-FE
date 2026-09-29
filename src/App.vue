<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-0 sm:p-4 font-sans">
    <!-- Centered Mobile Container -->
    <div class="w-full max-w-md mx-auto min-h-screen sm:min-h-[880px] sm:max-h-[920px] bg-gray-50 shadow-2xl relative flex flex-col justify-between overflow-hidden sm:rounded-[36px] border sm:border-slate-800/80">
      
      <!-- Top Mobile Status Bar (Cosmetic) -->
      <div class="bg-white/80 backdrop-blur-md px-6 pt-3 pb-2 flex items-center justify-between text-xs font-semibold text-gray-500 z-30 border-b border-gray-100/80">
        <span class="tracking-tight text-gray-800 font-bold">{{ currentTime }}</span>
        <div class="flex items-center space-x-1.5">
          <Signal class="w-3.5 h-3.5 text-gray-700" />
          <Wifi class="w-3.5 h-3.5 text-gray-700" />
          <div class="w-5 h-2.5 border border-gray-600 rounded-sm p-0.5 flex items-center">
            <div class="bg-gray-800 h-full w-full rounded-xs"></div>
          </div>
        </div>
      </div>

      <!-- Main Scrollable Screen Content Container -->
      <main class="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
        
        <!-- ========================================== -->
        <!-- SCREEN 1: HOME (DASHBOARD - REAL DATA)     -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'home'" class="p-5 space-y-5 pb-24">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="relative cursor-pointer" @click="openAuthModal">
                <img
                  alt="Learner Avatar"
                  class="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-600 p-0.5"
                  :src="userAvatarUrl"
                />
                <span class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500">Xin chào mừng 👋</p>
                <h1 class="text-lg font-bold text-gray-900 leading-tight">
                  {{ userProfile?.full_name || dashboard?.full_name || 'Học viên AI' }}
                </h1>
              </div>
            </div>
            <button
              @click="openAuthModal"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-xs cursor-pointer transition"
            >
              <Award class="w-3.5 h-3.5 text-indigo-600" />
              {{ userProfile?.target_level || dashboard?.target_level || 'Intermediate' }}
            </button>
          </div>

          <!-- Loading State for Dashboard -->
          <div v-if="homeLoading" class="py-10 text-center space-y-2">
            <Loader2 class="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
            <p class="text-xs text-gray-500">Đang tải tiến độ học tập từ CSDL...</p>
          </div>

          <template v-else>
            <!-- Progress & Stats Card -->
            <div class="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
              <div class="flex justify-between items-start mb-4">
                <div>
                  <div class="flex items-center gap-1.5 text-indigo-200 text-xs font-medium">
                    <Flame class="w-4 h-4 text-orange-400 fill-orange-400" />
                    <span>Tổng lượt rèn luyện</span>
                  </div>
                  <div class="text-2xl font-extrabold mt-0.5 tracking-tight flex items-baseline gap-1">
                    {{ totalPracticeCount }} <span class="text-xs font-medium text-indigo-200">Phiên hoàn thành</span>
                  </div>
                </div>
                <div class="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-xl border border-white/10 text-[11px] font-semibold">
                  <Sparkles class="w-3 h-3 text-amber-300" />
                  <span>Mục tiêu: {{ userProfile?.target_level || dashboard?.target_level || 'B1-B2' }}</span>
                </div>
              </div>

              <!-- Quick Stats Row (Real data from DB) -->
              <div class="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-white/15 text-center">
                <div>
                  <p class="text-[10px] text-indigo-200">Phát âm TB</p>
                  <p class="text-sm font-bold text-white">
                    {{ dashboard?.speaking?.average_score ? Math.round(dashboard.speaking.average_score) + 'đ' : 'Chưa có' }}
                  </p>
                  <p class="text-[9px] text-indigo-300 mt-0.5">{{ dashboard?.speaking?.total_sessions || 0 }} bài đọc</p>
                </div>
                <div class="border-x border-white/15">
                  <p class="text-[10px] text-indigo-200">Viết luận</p>
                  <p class="text-sm font-bold text-white">
                    {{ dashboard?.writing?.estimated_band ? 'Band ' + dashboard.writing.estimated_band : 'Chưa có' }}
                  </p>
                  <p class="text-[9px] text-indigo-300 mt-0.5">{{ dashboard?.writing?.total_essays || 0 }} bài chấm</p>
                </div>
                <div>
                  <p class="text-[10px] text-indigo-200">Hội thoại AI</p>
                  <p class="text-sm font-bold text-white">
                    {{ dashboard?.chat?.average_fluency ? Math.round(dashboard.chat.average_fluency) + '%' : 'Chưa có' }}
                  </p>
                  <p class="text-[9px] text-indigo-300 mt-0.5">{{ dashboard?.chat?.total_messages || 0 }} tin nhắn</p>
                </div>
              </div>
            </div>

            <!-- Quick Action AI Banner -->
            <div class="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Bot class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="text-sm font-bold text-emerald-950">AI Chatbot Đóng vai sẵn sàng</h4>
                  <p class="text-[11px] text-emerald-700">Luyện giao tiếp trực tiếp qua giọng nói 2 chiều</p>
                </div>
              </div>
              <button @click="activeTab = 'chat'" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer">
                Nói chuyện
              </button>
            </div>

            <!-- Topics Section (Real data from MySQL) -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h2 class="text-base font-bold text-gray-900">Chủ đề từ CSDL</h2>
                  <p class="text-xs text-gray-500">Giáo trình chuẩn hóa theo khung tham chiếu CEFR</p>
                </div>
                <span class="text-xs text-indigo-600 font-semibold cursor-pointer hover:underline" @click="loadHomeData">Làm mới</span>
              </div>

              <!-- Topic Cards -->
              <div class="space-y-3">
                <div
                  v-for="topic in topics"
                  :key="topic.id"
                  class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div class="flex items-center space-x-3.5">
                    <div :class="getTopicColor(topic.level)" class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner font-bold">
                      <span>{{ getTopicEmoji(topic.title) }}</span>
                    </div>
                    <div>
                      <div class="flex items-center space-x-2">
                        <h3 class="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition">{{ topic.title }}</h3>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                          {{ topic.level }}
                        </span>
                      </div>
                      <p class="text-xs text-gray-500 mt-0.5 line-clamp-1">{{ topic.description }}</p>
                      <div class="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                        <span class="flex items-center gap-1"><BookOpen class="w-3 h-3 text-indigo-400" /> Giáo trình</span>
                        <span class="flex items-center gap-1"><CheckCircle class="w-3 h-3 text-emerald-500" /> CSDL Aiven</span>
                      </div>
                    </div>
                  </div>
                  <button
                    @click="startTopic(topic)"
                    class="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>Luyện tập</span>
                    <ChevronRight class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Recent Activities (Real) -->
            <div v-if="dashboard?.recent_activities && dashboard.recent_activities.length > 0">
              <h2 class="text-base font-bold text-gray-900 mb-3">Lịch sử rèn luyện gần nhất</h2>
              <div class="space-y-2">
                <div
                  v-for="(act, idx) in dashboard.recent_activities.slice(0, 5)"
                  :key="idx"
                  class="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between text-xs"
                >
                  <div class="flex items-center space-x-2.5">
                    <span :class="getActivityBadgeClass(act.type)" class="px-2 py-0.5 rounded-md font-bold text-[10px]">
                      {{ act.type }}
                    </span>
                    <span class="font-medium text-gray-700 truncate max-w-[200px]">{{ act.title }}</span>
                  </div>
                  <span v-if="act.score !== null && act.score !== undefined" class="font-bold text-emerald-600">
                    {{ Math.round(act.score) }}đ
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- ========================================== -->
        <!-- SCREEN 2: SPEAKING (PRONUNCIATION REAL)    -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'speaking'" class="p-5 space-y-5 pb-28">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Speaking Lab</span>
              <h1 class="text-lg font-bold text-gray-900 mt-1">Chẩn đoán Phát âm AI</h1>
            </div>
            <span class="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles class="w-3.5 h-3.5 text-indigo-500" /> Whisper &amp; Librosa
            </span>
          </div>

          <!-- Lesson & Target Picker -->
          <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-gray-700">Chọn câu mẫu từ CSDL:</span>
              <button
                @click="isCustomSpeakingMode = !isCustomSpeakingMode"
                class="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
              >
                {{ isCustomSpeakingMode ? 'Chọn từ bài học' : 'Tự nhập câu tự do' }}
              </button>
            </div>

            <!-- Selectors -->
            <div v-if="!isCustomSpeakingMode" class="grid grid-cols-2 gap-2">
              <select
                v-model="speakingTopicId"
                @change="onSpeakingTopicChange"
                class="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 truncate"
              >
                <option v-for="t in topics" :key="t.id" :value="t.id">
                  {{ t.title }}
                </option>
              </select>

              <select
                v-model="speakingLessonId"
                @change="onSpeakingLessonChange"
                class="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 truncate"
              >
                <option v-for="l in speakingLessons" :key="l.id" :value="l.id">
                  {{ l.title }}
                </option>
              </select>
            </div>

            <!-- Target Sentence Display / Input -->
            <div class="space-y-2">
              <textarea
                v-model="targetSpeakingText"
                :readonly="!isCustomSpeakingMode"
                rows="2"
                class="w-full text-sm font-semibold text-gray-900 rounded-xl p-3 border leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-600"
                :class="isCustomSpeakingMode ? 'bg-white border-indigo-300' : 'bg-gray-50 border-gray-100 cursor-default'"
                placeholder="Nhập câu tiếng Anh bạn muốn luyện nói..."
              ></textarea>

              <div class="flex items-center justify-between pt-1">
                <button
                  @click="playNativeAudio"
                  :disabled="!targetSpeakingText"
                  class="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
                >
                  <Volume2 class="w-4 h-4" />
                  <span>Nghe mẫu bản ngữ</span>
                </button>
                <span v-if="targetIpa" class="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  /{{ targetIpa }}/
                </span>
              </div>

              <p v-if="targetTranslation" class="text-xs text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200/60">
                💡 <strong>Dịch:</strong> {{ targetTranslation }}
              </p>
            </div>
          </div>

          <!-- AI Evaluation Results (Real from API) -->
          <div v-if="speakingResult" class="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Cpu class="w-4 h-4 text-indigo-600" />
                <h3 class="text-sm font-bold text-gray-900">Kết quả phân tích âm vị thực tế</h3>
              </div>
              <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-sm font-extrabold text-emerald-600">{{ Math.round(speakingResult.overall_score) }} / 100</span>
              </div>
            </div>

            <!-- Pitch F0 & Recognized Text -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <span class="text-gray-500 block">Cao độ F0 (Librosa):</span>
                <span class="font-bold text-gray-800 text-sm">
                  {{ speakingResult.average_pitch ? Math.round(speakingResult.average_pitch) + ' Hz' : 'N/A' }}
                </span>
              </div>
              <div class="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <span class="text-gray-500 block">Whisper nhận diện:</span>
                <span class="font-semibold text-gray-800 text-xs truncate block" :title="speakingResult.transcribed_text">
                  "{{ speakingResult.transcribed_text || 'Chưa ghi nhận' }}"
                </span>
              </div>
            </div>

            <!-- Sentence Breakdown with word highlighting -->
            <div v-if="speakingResult.word_analysis && speakingResult.word_analysis.length > 0" class="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
              <p class="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wide">Chi tiết độ khớp từng từ:</p>
              <div class="flex flex-wrap gap-2 text-xs leading-loose">
                <span
                  v-for="(w, idx) in speakingResult.word_analysis"
                  :key="idx"
                  :style="{ backgroundColor: getWordBg(w), color: getWordTextColor(w) }"
                  class="font-semibold px-2 py-0.5 rounded border border-gray-200/60"
                  :title="`Target IPA: /${w.target_ipa}/ - User IPA: /${w.user_ipa}/`"
                >
                  {{ w.word }}
                  <span class="text-[10px] ml-0.5">{{ w.status === 'CORRECT' ? '✓' : '✕' }}</span>
                </span>
              </div>
            </div>

            <!-- Phonetic Error Tip Box -->
            <div v-if="speakingResult.ai_feedback" class="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-1">
              <p class="font-bold text-amber-900 flex items-center gap-1.5">
                <Lightbulb class="w-3.5 h-3.5 text-amber-600" /> Nhận xét từ AI:
              </p>
              <p class="text-amber-800 text-[11px] leading-relaxed whitespace-pre-line">
                {{ speakingResult.ai_feedback }}
              </p>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="speakingError" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600">
            ⚠️ {{ speakingError }}
          </div>

          <!-- Interaction Area (Centered Mic button with pulsating rings) -->
          <div class="pt-4 flex flex-col items-center justify-center space-y-3">
            <div class="relative flex items-center justify-center">
              <span v-if="isRecording" class="absolute w-24 h-24 rounded-full bg-rose-500/30 animate-ping"></span>
              <span v-if="isRecording" class="absolute w-20 h-20 rounded-full bg-rose-500/40 animate-pulse"></span>
              <button
                @click="toggleRecording"
                :disabled="isAnalyzingSpeaking"
                :class="isRecording ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'"
                class="relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Square v-if="isRecording" class="w-8 h-8" />
                <Mic v-else-if="!isAnalyzingSpeaking" class="w-8 h-8" />
                <Loader2 v-else class="w-8 h-8 animate-spin" />
              </button>
            </div>
            <div class="text-center">
              <p class="text-xs font-bold text-gray-800">
                {{ isAnalyzingSpeaking ? 'AI đang chấm điểm ngữ âm...' : (isRecording ? 'Đang lắng nghe... Bấm để gửi chấm điểm' : 'Nhấn nút để bắt đầu đọc câu mẫu') }}
              </p>
              <p class="text-[11px] text-gray-400 mt-0.5">
                {{ isRecording ? 'Nói to rõ câu tiếng Anh vào micro' : 'Micro 16kHz • Tự động gửi Whisper & Librosa' }}
              </p>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- SCREEN 3: WRITING (AI ESSAY REAL)          -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'writing'" class="p-5 space-y-5 pb-24">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Writing Assistant</span>
              <h1 class="text-lg font-bold text-gray-900 mt-1">AI Essay &amp; Grammar Lab</h1>
            </div>
          </div>

          <!-- Input Area -->
          <div class="space-y-3">
            <div class="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-xs relative focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-transparent">
              <textarea
                v-model="essayInput"
                rows="6"
                class="w-full text-xs text-gray-800 placeholder-gray-400 bg-transparent resize-none focus:outline-none leading-relaxed"
                placeholder="Nhập đoạn văn hoặc bài luận tiếng Anh bạn muốn AI sửa lỗi và chấm điểm IELTS..."
              ></textarea>
              <div class="flex justify-between items-center pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                <span>{{ wordCount }} words • {{ essayInput.length }} chars</span>
                <span class="text-indigo-600 font-medium">Hỗ trợ IELTS &amp; GEC Grammar</span>
              </div>
            </div>

            <!-- Error message if any -->
            <div v-if="writingError" class="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600">
              ⚠️ {{ writingError }}
            </div>

            <!-- Evaluate Button -->
            <button
              @click="submitWritingEvaluation"
              :disabled="isEvaluating || !essayInput.trim()"
              class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles v-if="!isEvaluating" class="w-4 h-4" />
              <Loader2 v-else class="w-4 h-4 animate-spin" />
              <span>{{ isEvaluating ? 'AI Gemini đang chấm bài luận...' : 'Chấm điểm & Sửa lỗi với AI' }}</span>
            </button>
          </div>

          <!-- Real Results Dashboard -->
          <div v-if="writingResult" class="space-y-4 pt-1 border-t border-gray-200/70">
            <!-- Score Card -->
            <div class="bg-gradient-to-r from-gray-900 to-indigo-950 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
              <div>
                <p class="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">Điểm đánh giá AI</p>
                <div class="flex items-baseline gap-2 mt-1">
                  <span class="text-3xl font-extrabold text-white">{{ writingResult.overall_score }}</span>
                  <span class="text-xs text-gray-400">/ 100</span>
                </div>
              </div>
              <div class="text-right">
                <span class="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  IELTS Band {{ writingResult.estimated_band || 'N/A' }}
                </span>
                <p class="text-[11px] text-gray-400 mt-1">
                  {{ (writingResult.errors || []).length }} lỗi cần sửa
                </p>
              </div>
            </div>

            <!-- Sub Tabs -->
            <div class="flex bg-gray-200/70 p-1 rounded-xl text-xs font-bold text-gray-600">
              <button
                @click="writingSubTab = 'grammar'"
                :class="writingSubTab === 'grammar' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-gray-900'"
                class="flex-1 py-2 rounded-lg transition text-center flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Sửa lỗi</span>
                <span class="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                  {{ (writingResult.errors || []).length }}
                </span>
              </button>
              <button
                @click="writingSubTab = 'vocab'"
                :class="writingSubTab === 'vocab' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-gray-900'"
                class="flex-1 py-2 rounded-lg transition text-center cursor-pointer"
              >
                Gợi ý từ vựng
              </button>
              <button
                @click="writingSubTab = 'rewrite'"
                :class="writingSubTab === 'rewrite' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-gray-900'"
                class="flex-1 py-2 rounded-lg transition text-center cursor-pointer"
              >
                Bản viết lại chuẩn
              </button>
            </div>

            <!-- Subview 1: Grammar Errors (Real) -->
            <div v-if="writingSubTab === 'grammar'" class="space-y-3">
              <div v-if="!writingResult.errors || writingResult.errors.length === 0" class="p-6 bg-white rounded-2xl border border-gray-100 text-center text-xs text-emerald-600 font-bold">
                🎉 Bài viết không có lỗi ngữ pháp! Rất xuất sắc.
              </div>

              <div
                v-for="(err, idx) in writingResult.errors"
                :key="idx"
                class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2"
              >
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-gray-600">Lỗi #{{ idx + 1 }} • {{ err.error_type || 'Syntax Error' }}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600">Cần sửa</span>
                </div>
                <div class="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between text-xs gap-2">
                  <span class="text-rose-500 line-through font-medium">{{ err.original_fragment }}</span>
                  <ArrowRight class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span class="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {{ err.corrected_fragment }}
                  </span>
                </div>
                <div class="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                  <strong class="text-amber-950">Giải thích:</strong> {{ err.explanation }}
                </div>
              </div>
            </div>

            <!-- Subview 2: Vocab Upgrades (Real) -->
            <div v-if="writingSubTab === 'vocab'" class="space-y-3">
              <div v-if="!writingResult.vocabulary_suggestions || writingResult.vocabulary_suggestions.length === 0" class="p-6 bg-white rounded-2xl border border-gray-100 text-center text-xs text-gray-500">
                Không có gợi ý nâng cấp từ vựng thêm.
              </div>

              <div
                v-for="(vocab, idx) in writingResult.vocabulary_suggestions"
                :key="idx"
                class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs text-xs space-y-1"
              >
                <div class="flex items-center gap-1.5 text-indigo-700 font-semibold">
                  <Sparkles class="w-3.5 h-3.5 text-indigo-500" />
                  <span>Gợi ý #{{ idx + 1 }}:</span>
                </div>
                <p class="text-gray-700 leading-relaxed">{{ vocab }}</p>
              </div>
            </div>

            <!-- Subview 3: Rewritten Essay (Real) -->
            <div v-if="writingSubTab === 'rewrite'" class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Sparkles class="w-4 h-4 text-indigo-600" />
                  Bản AI biên tập hoàn thiện
                </span>
                <button @click="copyRewritten" class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer">
                  <Check v-if="copied" class="w-3 h-3" />
                  <Copy v-else class="w-3 h-3" />
                  <span>{{ copied ? 'Đã sao chép!' : 'Sao chép' }}</span>
                </button>
              </div>
              <div class="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 leading-relaxed font-normal whitespace-pre-line">
                {{ writingResult.corrected_text }}
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- SCREEN 4: CHAT (AI ROLEPLAY REAL)          -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'chat'" class="flex-1 flex flex-col justify-between h-full min-h-[580px] pb-20">
          <!-- Chat Scenario Header (Real from Backend) -->
          <div class="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between shadow-xs">
            <div class="flex items-center space-x-3">
              <div class="relative">
                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
                  <Bot class="w-5 h-5" />
                </div>
                <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <select
                  v-model="chatScenarioId"
                  @change="switchChatScenario"
                  class="text-xs font-extrabold text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  <option v-for="sc in scenarios" :key="sc.id" :value="sc.id">
                    {{ sc.title }}
                  </option>
                </select>
                <p class="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online • Gemini AI Roleplay
                </p>
              </div>
            </div>
            <button @click="resetChatConversation" title="Khởi động lại hội thoại" class="text-xs text-gray-400 hover:text-gray-700 p-1.5 rounded-lg border border-gray-200 cursor-pointer">
              <RotateCcw class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Chat Scrollable Messages Area -->
          <div ref="chatScrollContainer" class="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">
            <div v-if="chatLoading" class="py-8 text-center text-xs text-gray-500">
              <Loader2 class="w-5 h-5 animate-spin mx-auto text-indigo-600 mb-1" />
              Đang kết nối phiên hội thoại AI...
            </div>

            <template v-else>
              <div v-if="currentChatScenario" class="text-center my-1">
                <span class="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[11px] font-semibold">
                  {{ currentChatScenario.description || 'Nói tiếng Anh tự nhiên cùng AI' }}
                </span>
              </div>

              <!-- Message bubbles -->
              <div v-for="(msg, idx) in chatMessages" :key="idx" class="flex flex-col">
                <!-- Bot Message -->
                <div v-if="msg.sender === 'BOT' || msg.sender === 'bot'" class="flex items-start space-x-2.5 max-w-[85%] self-start">
                  <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles class="w-3.5 h-3.5" />
                  </div>
                  <div class="space-y-1">
                    <div class="bg-white text-gray-800 p-3.5 rounded-2xl rounded-tl-none border border-gray-100 shadow-xs text-xs leading-relaxed">
                      {{ msg.message_text || msg.text }}
                    </div>
                    <button @click="speakBotMessage(msg)" class="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-indigo-600 px-1 transition cursor-pointer">
                      <Volume2 class="w-3 h-3" />
                      <span>Nghe phát âm</span>
                    </button>
                  </div>
                </div>

                <!-- User Message -->
                <div v-else class="flex flex-col items-end max-w-[85%] self-end space-y-1">
                  <div class="bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-none shadow-xs text-xs leading-relaxed">
                    {{ msg.message_text || msg.text }}
                  </div>
                  <div v-if="msg.fluency_score" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Sparkles class="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />
                    Lưu loát: {{ Math.round(msg.fluency_score) }}%
                  </div>
                </div>
              </div>

              <!-- Typing indicator -->
              <div v-if="isBotTyping" class="flex items-start space-x-2.5 max-w-[85%] self-start">
                <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot class="w-4 h-4" />
                </div>
                <div class="bg-white text-gray-400 p-3.5 rounded-2xl rounded-tl-none border border-gray-100 shadow-xs text-xs flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                  <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                  <span class="text-[11px] ml-1">AI đang suy nghĩ...</span>
                </div>
              </div>
            </template>
          </div>

          <!-- Bottom Chat Input Bar -->
          <div class="p-3 bg-white border-t border-gray-100">
            <div class="flex items-center space-x-2">
              <button
                @click="toggleChatVoice"
                :title="isChatRecording ? 'Dừng & gửi giọng nói' : 'Ghi âm giọng nói'"
                :class="isChatRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                class="w-10 h-10 rounded-xl flex items-center justify-center transition shrink-0 cursor-pointer"
              >
                <Square v-if="isChatRecording" class="w-5 h-5" />
                <Mic v-else class="w-5 h-5" />
              </button>
              <input
                v-model="chatInput"
                @keyup.enter="sendChatText"
                :disabled="isBotTyping || isChatRecording"
                type="text"
                placeholder="Nhập hoặc nhấn mic nói tiếng Anh..."
                class="flex-1 bg-gray-100 text-xs text-gray-800 placeholder-gray-400 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
              />
              <button
                @click="sendChatText"
                :disabled="isBotTyping || !chatInput.trim()"
                class="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white flex items-center justify-center shadow-xs shadow-indigo-600/30 transition shrink-0 cursor-pointer"
              >
                <Send class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- SCREEN 5: STUDY (FLASHCARD & QUIZ REAL)    -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'study'" class="p-5 space-y-5 pb-24">
          <!-- Header & Flow Progress -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Từ vựng &amp; Luyện tập</span>
                <h1 class="text-lg font-bold text-gray-900 mt-1">Luyện tập thông minh</h1>
              </div>
              <span v-if="totalStudyItems > 0" class="text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-full">
                Mục {{ currentStudyIndex + 1 }} / {{ totalStudyItems }}
              </span>
            </div>
            <div v-if="totalStudyItems > 0" class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                :style="{ width: ((currentStudyIndex + 1) / totalStudyItems * 100) + '%' }"
                class="h-full bg-indigo-600 rounded-full transition-all duration-300"
              ></div>
            </div>
          </div>

          <!-- Toggle: Flashcard Mode vs Quiz Mode -->
          <div class="flex bg-gray-200/70 p-1 rounded-xl text-xs font-bold text-gray-600">
            <button
              @click="switchStudyMode('flashcard')"
              :class="studyMode === 'flashcard' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-gray-900'"
              class="flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Layers class="w-3.5 h-3.5" />
              <span>Thẻ Flashcard (SRS)</span>
            </button>
            <button
              @click="switchStudyMode('quiz')"
              :class="studyMode === 'quiz' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-gray-900'"
              class="flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle class="w-3.5 h-3.5" />
              <span>Trắc nghiệm (Quiz)</span>
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="studyLoading" class="py-12 text-center space-y-2">
            <Loader2 class="w-7 h-7 animate-spin text-indigo-600 mx-auto" />
            <p class="text-xs text-gray-500">Đang tải dữ liệu từ CSDL Aiven...</p>
          </div>

          <!-- STATE A: FLASHCARD MODE (REAL SRS) -->
          <div v-else-if="studyMode === 'flashcard'" class="space-y-4">
            <div v-if="flashcards.length === 0" class="p-8 bg-white rounded-3xl border border-gray-100 text-center space-y-3">
              <Layers class="w-10 h-10 text-indigo-300 mx-auto" />
              <h3 class="text-sm font-bold text-gray-800">Chưa có thẻ cần ôn tập</h3>
              <p class="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Tất cả thẻ trong CSDL đã được hoàn thành hoặc chưa được tạo.
              </p>
              <button @click="loadFlashcardsData" class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 cursor-pointer">
                Tải lại danh sách
              </button>
            </div>

            <div v-else class="space-y-4">
              <div @click="isFlipped = !isFlipped" class="perspective-1000 w-full h-72 cursor-pointer select-none">
                <div :class="isFlipped ? 'rotate-y-180' : ''" class="relative w-full h-full duration-500 transform-style-preserve-3d transition-transform">
                  <!-- FRONT SIDE -->
                  <div class="absolute inset-0 backface-hidden bg-white rounded-3xl p-6 border border-gray-100 shadow-lg flex flex-col justify-between items-center text-center">
                    <div class="w-full flex justify-between items-center">
                      <span class="text-[10px] font-bold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg">Từ vựng CSDL</span>
                      <button @click.stop="speakText(currentCard.word)" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 flex items-center justify-center cursor-pointer">
                        <Volume2 class="w-4 h-4" />
                      </button>
                    </div>
                    <div class="space-y-2">
                      <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ currentCard.word }}</h2>
                      <p v-if="currentCard.ipa" class="text-sm font-mono text-gray-500">{{ currentCard.ipa }}</p>
                    </div>
                    <div class="text-[11px] text-gray-400 flex items-center gap-1">
                      <RotateCw class="w-3 h-3" />
                      <span>Chạm để lật xem nghĩa &amp; ví dụ</span>
                    </div>
                  </div>

                  <!-- BACK SIDE -->
                  <div class="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-50 via-white to-gray-50 rounded-3xl p-6 border border-indigo-100 shadow-lg flex flex-col justify-between text-left">
                    <div class="flex justify-between items-center">
                      <span class="text-[10px] font-extrabold px-2.5 py-1 bg-indigo-600 text-white rounded-lg uppercase">Nghĩa tiếng Việt</span>
                      <span class="text-[10px] font-semibold text-gray-400">Leitner SRS</span>
                    </div>
                    <div class="space-y-2">
                      <h3 class="text-xl font-bold text-gray-900">{{ currentCard.meaning || 'Chưa cập nhật nghĩa' }}</h3>
                      <p v-if="currentCard.hint_example" class="text-xs text-gray-600 italic border-l-2 border-indigo-400 pl-3 py-1">
                        "{{ currentCard.hint_example }}"
                      </p>
                    </div>
                    <p class="text-[11px] text-gray-400 text-center">
                      Chạm để quay lại mặt trước
                    </p>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="grid grid-cols-2 gap-3 pt-2">
                <button @click="submitCardReview(false)" class="py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer">
                  <RotateCcw class="w-4 h-4" />
                  <span>Chưa nhớ (Ôn lại)</span>
                </button>
                <button @click="submitCardReview(true)" class="py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer">
                  <Check class="w-4 h-4" />
                  <span>Đã thuộc (+15 XP)</span>
                </button>
              </div>
            </div>
          </div>

          <!-- STATE B: QUIZ MODE (REAL DB QUIZZES) -->
          <div v-else-if="studyMode === 'quiz'" class="space-y-4">
            <!-- Quiz select -->
            <div v-if="quizzesList.length > 1" class="flex items-center space-x-2">
              <label class="text-xs font-semibold text-gray-500 shrink-0">Chọn đề:</label>
              <select
                v-model="selectedQuizId"
                @change="onQuizChange"
                class="flex-1 text-xs bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-600 truncate"
              >
                <option v-for="q in quizzesList" :key="q.id" :value="q.id">
                  {{ q.title }}
                </option>
              </select>
            </div>

            <div v-if="quizQuestions.length === 0" class="p-8 bg-white rounded-3xl border border-gray-100 text-center space-y-3">
              <HelpCircle class="w-10 h-10 text-indigo-300 mx-auto" />
              <h3 class="text-sm font-bold text-gray-800">Chưa có câu hỏi trắc nghiệm</h3>
              <p class="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Đề thi này hiện chưa có câu hỏi trong CSDL.
              </p>
              <button @click="loadQuizzesData" class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 cursor-pointer">
                Tải lại danh sách
              </button>
            </div>

            <div v-else class="space-y-4">
              <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-2">
                <span class="text-[10px] font-extrabold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Câu hỏi {{ currentStudyIndex + 1 }} / {{ quizQuestions.length }}
                </span>
                <p class="text-sm font-bold text-gray-900 leading-relaxed">
                  {{ currentQuestion.question_text }}
                </p>
              </div>

              <!-- Answer options -->
              <div class="space-y-2.5">
                <button
                  v-for="(ans, aIdx) in (currentQuestion.answers || [])"
                  :key="ans.id || aIdx"
                  @click="selectQuizAnswer(ans)"
                  :disabled="quizChecked"
                  :class="getQuizAnswerClass(ans)"
                  class="w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center justify-between text-xs font-semibold cursor-pointer"
                >
                  <span class="flex items-center gap-2.5">
                    <span class="w-6 h-6 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-[11px]">
                      {{ ['A','B','C','D'][aIdx] || (aIdx + 1) }}
                    </span>
                    <span>{{ ans.answer_text }}</span>
                  </span>
                  <CheckCircle v-if="quizChecked && submittedQuizDetail?.is_correct && selectedQuizAnswer?.id === ans.id" class="w-4 h-4 text-emerald-600" />
                  <XCircle v-else-if="quizChecked && !submittedQuizDetail?.is_correct && selectedQuizAnswer?.id === ans.id" class="w-4 h-4 text-rose-500" />
                </button>
              </div>

              <!-- Explanation Banner -->
              <div
                v-if="quizChecked"
                :class="submittedQuizDetail?.is_correct ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'"
                class="p-4 rounded-xl border text-xs space-y-1"
              >
                <p class="font-bold flex items-center gap-1.5">
                  <Check v-if="submittedQuizDetail?.is_correct" class="w-4 h-4 text-emerald-600" />
                  <AlertCircle v-else class="w-4 h-4 text-rose-600" />
                  {{ submittedQuizDetail?.is_correct ? 'Chính xác! (+20 XP)' : 'Chưa chính xác rồi!' }}
                </p>
                <p v-if="submittedQuizDetail?.correct_answer_text && !submittedQuizDetail?.is_correct" class="text-[11px] font-semibold">
                  Đáp án đúng: {{ submittedQuizDetail.correct_answer_text }}
                </p>
                <p class="text-[11px] leading-relaxed opacity-90">
                  {{ submittedQuizDetail?.explanation || 'Hãy lưu ý ngữ nghĩa và ngữ pháp.' }}
                </p>
              </div>

              <!-- Submit / Next Button -->
              <div class="pt-2">
                <button
                  v-if="!quizChecked"
                  @click="checkQuizAnswer"
                  :disabled="!selectedQuizAnswer || isSubmittingQuiz"
                  class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Loader2 v-if="isSubmittingQuiz" class="w-4 h-4 animate-spin" />
                  <span>{{ isSubmittingQuiz ? 'Đang chấm bài...' : 'Kiểm tra đáp án' }}</span>
                </button>
                <button
                  v-else
                  @click="nextQuizQuestion"
                  class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{{ currentStudyIndex < quizQuestions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành' }}</span>
                  <ArrowRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>

      <!-- ========================================== -->
      <!-- STICKY BOTTOM NAVIGATION BAR (5 TABS)      -->
      <!-- ========================================== -->
      <nav class="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-3 py-2 z-40 shadow-lg">
        <div class="flex items-center justify-around">
          <button
            @click="activeTab = 'home'"
            :class="activeTab === 'home' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'"
            class="flex flex-col items-center py-1 px-2 transition-all relative cursor-pointer"
          >
            <Home :class="activeTab === 'home' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform duration-200" />
            <span class="text-[10px] mt-1">Home</span>
            <span v-if="activeTab === 'home'" class="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          </button>

          <button
            @click="activeTab = 'speaking'"
            :class="activeTab === 'speaking' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'"
            class="flex flex-col items-center py-1 px-2 transition-all relative cursor-pointer"
          >
            <Mic :class="activeTab === 'speaking' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform duration-200" />
            <span class="text-[10px] mt-1">Speaking</span>
            <span v-if="activeTab === 'speaking'" class="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          </button>

          <button
            @click="activeTab = 'writing'"
            :class="activeTab === 'writing' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'"
            class="flex flex-col items-center py-1 px-2 transition-all relative cursor-pointer"
          >
            <PenTool :class="activeTab === 'writing' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform duration-200" />
            <span class="text-[10px] mt-1">Writing</span>
            <span v-if="activeTab === 'writing'" class="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          </button>

          <button
            @click="activeTab = 'chat'"
            :class="activeTab === 'chat' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'"
            class="flex flex-col items-center py-1 px-2 transition-all relative cursor-pointer"
          >
            <MessageSquare :class="activeTab === 'chat' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform duration-200" />
            <span class="text-[10px] mt-1">AI Chat</span>
            <span v-if="activeTab === 'chat'" class="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          </button>

          <button
            @click="activeTab = 'study'"
            :class="activeTab === 'study' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'"
            class="flex flex-col items-center py-1 px-2 transition-all relative cursor-pointer"
          >
            <BookOpen :class="activeTab === 'study' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform duration-200" />
            <span class="text-[10px] mt-1">Study</span>
            <span v-if="activeTab === 'study'" class="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          </button>
        </div>
      </nav>

      <!-- Auth Modal -->
      <AuthModal
        :is-open="isAuthOpen"
        @close="isAuthOpen = false"
        @auth-success="onAuthSuccess"
      />

    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import {
  Signal, Wifi, Award, Flame, Bot, BookOpen, CheckCircle, ChevronRight,
  Sparkles, Volume2, Cpu, Lightbulb, Mic, Square, Loader2, ArrowRight,
  Copy, Check, RotateCcw, Send, Layers, HelpCircle,
  RotateCw, XCircle, AlertCircle, Home, PenTool, MessageSquare
} from 'lucide-vue-next';

// Real services
import { progressService } from './services/progressService';
import { curriculumService } from './services/curriculumService';
import { pronunciationService } from './services/pronunciationService';
import { writingService } from './services/writingService';
import { chatService } from './services/chatService';
import { studyService } from './services/studyService';
import { authService } from './services/authService';
import { AudioRecorder } from './services/audioRecorder';
import { getFullAudioUrl } from './services/api';
import AuthModal from './components/AuthModal.vue';

// Main Navigation Tab
const activeTab = ref('home');
const isAuthOpen = ref(false);
const currentTime = ref('');

// User Profile
const userProfile = ref(authService.getUser());

const userAvatarUrl = computed(() => {
  const name = userProfile.value?.full_name || dashboard.value?.full_name || 'Learner';
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
});

const openAuthModal = () => {
  isAuthOpen.value = true;
};

const onAuthSuccess = async () => {
  userProfile.value = authService.getUser();
  await loadHomeData();
};

// ==========================================
// SCREEN 1: HOME (REAL DATA)
// ==========================================
const homeLoading = ref(true);
const dashboard = ref(null);
const topics = ref([]);

const totalPracticeCount = computed(() => {
  if (!dashboard.value) return 0;
  return (
    (dashboard.value.speaking?.total_sessions || 0) +
    (dashboard.value.writing?.total_essays || 0) +
    (dashboard.value.chat?.total_conversations || 0)
  );
});

const loadHomeData = async () => {
  homeLoading.value = true;
  try {
    const [dash, top] = await Promise.all([
      progressService.getDashboard().catch(() => null),
      curriculumService.getTopics().catch(() => [])
    ]);
    dashboard.value = dash;
    topics.value = top || [];

    // Pre-populate speaking topic if available
    if (topics.value.length > 0 && !speakingTopicId.value) {
      speakingTopicId.value = topics.value[0].id;
      await onSpeakingTopicChange();
    }
  } catch (err) {
    console.warn('Load home error:', err);
  } finally {
    homeLoading.value = false;
  }
};

const startTopic = async (topic) => {
  speakingTopicId.value = topic.id;
  await onSpeakingTopicChange();
  activeTab.value = 'speaking';
};

const getTopicColor = (level) => {
  if (level === 'Beginner') return 'bg-emerald-100 text-emerald-700';
  if (level === 'Intermediate') return 'bg-sky-100 text-sky-700';
  return 'bg-purple-100 text-purple-700';
};

const getTopicEmoji = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('greet') || t.includes('intro')) return '👋';
  if (t.includes('food') || t.includes('restaurant') || t.includes('drink')) return '🍽️';
  if (t.includes('travel') || t.includes('hotel')) return '✈️';
  if (t.includes('interview') || t.includes('career') || t.includes('job')) return '💼';
  if (t.includes('tech') || t.includes('ai') || t.includes('intelligence')) return '🤖';
  if (t.includes('climate') || t.includes('environment')) return '🌱';
  return '📚';
};

const getActivityBadgeClass = (type) => {
  if (type === 'SPEAKING') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (type === 'WRITING') return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
  return 'bg-purple-50 text-purple-700 border border-purple-200';
};

// ==========================================
// SCREEN 2: SPEAKING (PRONUNCIATION REAL)
// ==========================================
const isCustomSpeakingMode = ref(false);
const speakingTopicId = ref(null);
const speakingLessonId = ref(null);
const speakingLessons = ref([]);
const targetSpeakingText = ref('Hello, welcome to AI English Learning!');
const targetIpa = ref('');
const targetTranslation = ref('');
const nativeAudioUrl = ref('');

const isRecording = ref(false);
const isAnalyzingSpeaking = ref(false);
const speakingResult = ref(null);
const speakingError = ref('');
const recorder = new AudioRecorder();

const onSpeakingTopicChange = async () => {
  if (!speakingTopicId.value) return;
  try {
    const list = await curriculumService.getLessonsByTopic(speakingTopicId.value);
    speakingLessons.value = list || [];
    if (speakingLessons.value.length > 0) {
      speakingLessonId.value = speakingLessons.value[0].id;
      await onSpeakingLessonChange();
    }
  } catch (err) {
    console.warn('Load lessons error:', err);
  }
};

const onSpeakingLessonChange = async () => {
  if (!speakingLessonId.value) return;
  try {
    const detail = await curriculumService.getLessonDetail(speakingLessonId.value);
    if (detail && detail.contents && detail.contents.length > 0) {
      const c = detail.contents[0];
      if (!isCustomSpeakingMode.value) {
        targetSpeakingText.value = c.target_text;
      }
      targetIpa.value = c.ipa_guide || '';
      targetTranslation.value = c.hint_translation || '';
      nativeAudioUrl.value = c.audio_url || '';
    } else {
      const currentL = speakingLessons.value.find(l => l.id === speakingLessonId.value);
      if (currentL && !isCustomSpeakingMode.value) {
        targetSpeakingText.value = currentL.title;
      }
      targetIpa.value = '';
      targetTranslation.value = '';
      nativeAudioUrl.value = '';
    }
  } catch (err) {
    console.warn('Lesson detail error:', err);
  }
};

const playNativeAudio = () => {
  if (nativeAudioUrl.value) {
    const url = getFullAudioUrl(nativeAudioUrl.value);
    const a = new Audio(url);
    a.play().catch(() => speakText(targetSpeakingText.value));
  } else {
    speakText(targetSpeakingText.value);
  }
};

const toggleRecording = async () => {
  speakingError.value = '';
  if (isRecording.value) {
    await stopAndAnalyzeSpeaking();
  } else {
    try {
      await recorder.start();
      isRecording.value = true;
    } catch (err) {
      speakingError.value = 'Không thể mở micro: ' + err.message;
    }
  }
};

const stopAndAnalyzeSpeaking = async () => {
  try {
    const blob = await recorder.stop();
    isRecording.value = false;
    if (!blob) return;

    isAnalyzingSpeaking.value = true;
    const lessonId = !isCustomSpeakingMode.value ? speakingLessonId.value : null;
    const res = await pronunciationService.analyzePronunciation(
      blob,
      targetSpeakingText.value.trim(),
      lessonId
    );
    speakingResult.value = res;
  } catch (err) {
    speakingError.value = 'Chấm điểm thất bại: ' + (err.response?.data?.detail || err.message);
  } finally {
    isAnalyzingSpeaking.value = false;
  }
};

const getWordBg = (w) => {
  if (w.color) return w.color + '22';
  return w.status === 'CORRECT' ? '#22c55e22' : '#ef444422';
};

const getWordTextColor = (w) => {
  if (w.color) return w.color;
  return w.status === 'CORRECT' ? '#15803d' : '#b91c1c';
};

// ==========================================
// SCREEN 3: WRITING (AI ESSAY REAL)
// ==========================================
const essayInput = ref('');
const isEvaluating = ref(false);
const writingResult = ref(null);
const writingSubTab = ref('grammar');
const copied = ref(false);
const writingError = ref('');

const wordCount = computed(() => {
  if (!essayInput.value.trim()) return 0;
  return essayInput.value.trim().split(/\s+/).length;
});

const submitWritingEvaluation = async () => {
  if (!essayInput.value.trim()) return;
  isEvaluating.value = true;
  writingError.value = '';
  try {
    const res = await writingService.evaluateEssay(essayInput.value.trim());
    writingResult.value = res;
    writingSubTab.value = 'grammar';
  } catch (err) {
    writingError.value = 'Chấm bài thất bại: ' + (err.response?.data?.detail || err.message);
  } finally {
    isEvaluating.value = false;
  }
};

const copyRewritten = () => {
  if (!writingResult.value?.corrected_text) return;
  navigator.clipboard.writeText(writingResult.value.corrected_text);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1800);
};

// ==========================================
// SCREEN 4: CHAT (AI ROLEPLAY REAL)
// ==========================================
const chatScrollContainer = ref(null);
const scenarios = ref([]);
const chatScenarioId = ref('hotel_checkin');
const conversationId = ref(null);
const chatMessages = ref([]);
const chatInput = ref('');
const chatLoading = ref(false);
const isBotTyping = ref(false);
const isChatRecording = ref(false);
const chatRecorder = new AudioRecorder();

const currentChatScenario = computed(() => {
  return scenarios.value.find(s => s.id === chatScenarioId.value);
});

const loadChatScenarios = async () => {
  chatLoading.value = true;
  try {
    const list = await chatService.getScenarios();
    scenarios.value = list || [];
    if (scenarios.value.length > 0) {
      if (!scenarios.value.some(s => s.id === chatScenarioId.value)) {
        chatScenarioId.value = scenarios.value[0].id;
      }
      await startChatConversation();
    }
  } catch (err) {
    console.warn('Chat scenarios error:', err);
  } finally {
    chatLoading.value = false;
  }
};

const startChatConversation = async () => {
  if (!chatScenarioId.value) return;
  isBotTyping.value = false;
  try {
    const conv = await chatService.startConversation(chatScenarioId.value);
    conversationId.value = conv.id;
    chatMessages.value = conv.messages || [];
    await scrollChatToBottom();
  } catch (err) {
    console.warn('Start conversation error:', err);
  }
};

const switchChatScenario = async () => {
  await startChatConversation();
};

const resetChatConversation = async () => {
  await startChatConversation();
};

const scrollChatToBottom = async () => {
  await nextTick();
  if (chatScrollContainer.value) {
    chatScrollContainer.value.scrollTop = chatScrollContainer.value.scrollHeight;
  }
};

const sendChatText = async () => {
  const text = chatInput.value.trim();
  if (!text || isBotTyping.value || !conversationId.value) return;

  chatInput.value = '';
  chatMessages.value.push({
    sender: 'user',
    message_text: text
  });
  await scrollChatToBottom();

  isBotTyping.value = true;
  try {
    const reply = await chatService.sendMessage(conversationId.value, text);
    chatMessages.value.push(reply);
    await scrollChatToBottom();
  } catch (err) {
    console.warn('Send message error:', err);
  } finally {
    isBotTyping.value = false;
  }
};

const toggleChatVoice = async () => {
  if (isChatRecording.value) {
    try {
      const blob = await chatRecorder.stop();
      isChatRecording.value = false;
      if (!blob || !conversationId.value) return;

      isBotTyping.value = true;
      const turnResult = await chatService.sendVoiceMessage(conversationId.value, blob);
      if (turnResult) {
        if (turnResult.user_message) chatMessages.value.push(turnResult.user_message);
        if (turnResult.bot_message) chatMessages.value.push(turnResult.bot_message);
        await scrollChatToBottom();
      }
    } catch (err) {
      console.warn('Voice chat error:', err);
    } finally {
      isBotTyping.value = false;
      isChatRecording.value = false;
    }
  } else {
    try {
      await chatRecorder.start();
      isChatRecording.value = true;
    } catch (err) {
      alert('Không thể truy cập microphone: ' + err.message);
    }
  }
};

const speakBotMessage = (msg) => {
  const text = msg.message_text || msg.text || '';
  if (msg.audio_url) {
    const url = getFullAudioUrl(msg.audio_url);
    const a = new Audio(url);
    a.play().catch(() => speakText(text));
  } else {
    speakText(text);
  }
};

// ==========================================
// SCREEN 5: STUDY (FLASHCARD & QUIZ REAL)
// ==========================================
const studyMode = ref('flashcard');
const studyLoading = ref(false);
const currentStudyIndex = ref(0);
const isFlipped = ref(false);

// Flashcards
const flashcards = ref([]);
const currentCard = computed(() => flashcards.value[currentStudyIndex.value] || {});

// Quizzes
const quizzesList = ref([]);
const selectedQuizId = ref(null);
const quizQuestions = ref([]);
const currentQuestion = computed(() => quizQuestions.value[currentStudyIndex.value] || {});
const selectedQuizAnswer = ref(null);
const quizChecked = ref(false);
const isSubmittingQuiz = ref(false);
const submittedQuizDetail = ref(null);

const totalStudyItems = computed(() => {
  return studyMode.value === 'flashcard' ? flashcards.value.length : quizQuestions.value.length;
});

const switchStudyMode = async (mode) => {
  studyMode.value = mode;
  currentStudyIndex.value = 0;
  isFlipped.value = false;
  selectedQuizAnswer.value = null;
  quizChecked.value = false;
  submittedQuizDetail.value = null;

  if (mode === 'flashcard' && flashcards.value.length === 0) {
    await loadFlashcardsData();
  } else if (mode === 'quiz' && quizQuestions.value.length === 0) {
    await loadQuizzesData();
  }
};

const loadFlashcardsData = async () => {
  studyLoading.value = true;
  try {
    const list = await studyService.getCardsForReview();
    flashcards.value = list || [];
    currentStudyIndex.value = 0;
  } catch (err) {
    console.warn('Load flashcards error:', err);
  } finally {
    studyLoading.value = false;
  }
};

const submitCardReview = async (isRemembered) => {
  const card = currentCard.value;
  isFlipped.value = false;
  if (card && card.id) {
    try {
      await studyService.reviewCard(card.id, isRemembered);
    } catch (err) {
      console.warn('Card review error:', err);
    }
  }

  if (currentStudyIndex.value < flashcards.value.length - 1) {
    currentStudyIndex.value++;
  } else {
    currentStudyIndex.value = 0;
  }
};

const loadQuizzesData = async () => {
  studyLoading.value = true;
  try {
    const list = await studyService.getQuizzes();
    quizzesList.value = list || [];
    if (quizzesList.value.length > 0) {
      selectedQuizId.value = quizzesList.value[0].id;
      await onQuizChange();
    }
  } catch (err) {
    console.warn('Load quizzes error:', err);
  } finally {
    studyLoading.value = false;
  }
};

const onQuizChange = async () => {
  if (!selectedQuizId.value) return;
  studyLoading.value = true;
  selectedQuizAnswer.value = null;
  quizChecked.value = false;
  submittedQuizDetail.value = null;
  currentStudyIndex.value = 0;
  try {
    const detail = await studyService.getQuizDetail(selectedQuizId.value);
    if (detail && detail.questions) {
      quizQuestions.value = detail.questions;
    }
  } catch (err) {
    console.warn('Quiz detail error:', err);
  } finally {
    studyLoading.value = false;
  }
};

const selectQuizAnswer = (ans) => {
  if (quizChecked.value) return;
  selectedQuizAnswer.value = ans;
};

const checkQuizAnswer = async () => {
  if (!selectedQuizAnswer.value || !currentQuestion.value || !selectedQuizId.value) return;
  isSubmittingQuiz.value = true;
  try {
    const payload = [
      {
        question_id: currentQuestion.value.id,
        selected_answer_id: selectedQuizAnswer.value.id
      }
    ];
    const res = await studyService.submitQuiz(selectedQuizId.value, payload);
    if (res && res.details && res.details.length > 0) {
      submittedQuizDetail.value = res.details[0];
    }
    quizChecked.value = true;
  } catch (err) {
    quizChecked.value = true;
    submittedQuizDetail.value = {
      is_correct: false,
      explanation: err.response?.data?.detail || err.message
    };
  } finally {
    isSubmittingQuiz.value = false;
  }
};

const nextQuizQuestion = () => {
  selectedQuizAnswer.value = null;
  quizChecked.value = false;
  submittedQuizDetail.value = null;
  if (currentStudyIndex.value < quizQuestions.value.length - 1) {
    currentStudyIndex.value++;
  } else {
    currentStudyIndex.value = 0;
  }
};

const getQuizAnswerClass = (ans) => {
  if (!quizChecked.value) {
    return selectedQuizAnswer.value?.id === ans.id
      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-800';
  }
  if (selectedQuizAnswer.value?.id === ans.id) {
    return submittedQuizDetail.value?.is_correct
      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
      : 'border-rose-500 bg-rose-50 text-rose-900';
  }
  return 'border-gray-200 bg-white text-gray-400 opacity-60';
};

// ==========================================
// UTILITIES
// ==========================================
const speakText = (text) => {
  if (!text) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }
};

const updateClock = () => {
  const d = new Date();
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  currentTime.value = `${h}:${m}`;
};

let clockInterval = null;

onMounted(async () => {
  updateClock();
  clockInterval = setInterval(updateClock, 30000);
  await loadHomeData();
  await loadChatScenarios();
  await loadFlashcardsData();
});

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval);
  recorder.cleanup();
  chatRecorder.cleanup();
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-preserve-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>