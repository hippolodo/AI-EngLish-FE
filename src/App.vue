<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-0 sm:p-4 font-sans">
    <!-- Centered Mobile Container -->
    <div class="w-full max-w-md mx-auto min-h-screen sm:min-h-[880px] sm:max-h-[920px] bg-gray-50 shadow-2xl relative flex flex-col justify-between overflow-hidden sm:rounded-[36px] border sm:border-slate-800/80">
      
      <!-- Top Mobile Status Bar (Cosmetic) -->
      <div class="bg-white/80 backdrop-blur-md px-6 pt-3 pb-2 flex items-center justify-between text-xs font-semibold text-gray-500 z-30 border-b border-gray-100/80">
        <span class="tracking-tight text-gray-800 font-bold">9:41</span>
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
        <!-- SCREEN 1: HOME (DASHBOARD)                 -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'home'" class="p-5 space-y-5 pb-24">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="relative">
                <img
                  alt="Learner Avatar"
                  class="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-600 p-0.5"
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                />
                <span class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500">Welcome back 👋</p>
                <h1 class="text-lg font-bold text-gray-900 leading-tight">Hi, Learner!</h1>
              </div>
            </div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm">
              <Award class="w-3.5 h-3.5 text-indigo-600" />
              Intermediate (B1)
            </span>
          </div>

          <!-- Progress & Daily Streak Card -->
          <div class="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <div class="flex justify-between items-start mb-4">
              <div>
                <div class="flex items-center gap-1.5 text-indigo-200 text-xs font-medium">
                  <Flame class="w-4 h-4 text-orange-400 fill-orange-400" />
                  <span>Daily Streak</span>
                </div>
                <div class="text-2xl font-extrabold mt-0.5 tracking-tight flex items-baseline gap-1">
                  7 Days <span class="text-xs font-medium text-indigo-200">/ 14 Goal</span>
                </div>
              </div>
              <!-- Streak Badges -->
              <div class="flex space-x-1.5 bg-black/20 p-1.5 rounded-xl border border-white/10">
                <span
                  v-for="(day, idx) in ['M','T','W','T','F','S','S']"
                  :key="idx"
                  :class="idx < 5 ? 'bg-emerald-500 text-white font-bold' : (idx === 5 ? 'bg-white text-indigo-900 font-bold ring-2 ring-orange-400' : 'text-white/40')"
                  class="w-6 h-6 rounded-lg text-[10px] flex items-center justify-center transition-all"
                >
                  {{ day }}
                </span>
              </div>
            </div>

            <!-- Linear & Milestone Progress -->
            <div class="space-y-2">
              <div class="flex justify-between text-xs text-indigo-100 font-medium">
                <span>Daily XP Target</span>
                <span class="font-bold">420 / 600 XP (70%)</span>
              </div>
              <div class="w-full h-3 bg-white/20 rounded-full overflow-hidden p-0.5">
                <div class="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full transition-all duration-700 shadow-sm" style="width: 70%"></div>
              </div>
            </div>

            <!-- Quick Stats Row -->
            <div class="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-white/15 text-center">
              <div>
                <p class="text-[10px] text-indigo-200">Pronunciation</p>
                <p class="text-sm font-bold text-white">88%</p>
              </div>
              <div class="border-x border-white/15">
                <p class="text-[10px] text-indigo-200">Grammar Acc.</p>
                <p class="text-sm font-bold text-white">92%</p>
              </div>
              <div>
                <p class="text-[10px] text-indigo-200">Words Mastered</p>
                <p class="text-sm font-bold text-white">348</p>
              </div>
            </div>
          </div>

          <!-- Quick Action AI Banner -->
          <div class="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Bot class="w-5 h-5" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-emerald-950">Daily AI Roleplay Ready</h4>
                <p class="text-[11px] text-emerald-700">Practice "Checking into a 5-star Hotel"</p>
              </div>
            </div>
            <button @click="activeTab = 'chat'" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-sm">
              Talk
            </button>
          </div>

          <!-- Topics Section -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <div>
                <h2 class="text-base font-bold text-gray-900">Recommended Topics</h2>
                <p class="text-xs text-gray-500">Curated for CEFR B1 level progression</p>
              </div>
              <span class="text-xs text-indigo-600 font-semibold cursor-pointer hover:underline">View All</span>
            </div>

            <!-- Topic Cards -->
            <div class="space-y-3">
              <div
                v-for="topic in topics"
                :key="topic.id"
                class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div class="flex items-center space-x-3.5">
                  <div :class="topic.bg" class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner">
                    <span>{{ topic.emoji }}</span>
                  </div>
                  <div>
                    <div class="flex items-center space-x-2">
                      <h3 class="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition">{{ topic.title }}</h3>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                        {{ topic.level }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 mt-0.5">{{ topic.desc }}</p>
                    <div class="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                      <span class="flex items-center gap-1"><Clock class="w-3 h-3" /> {{ topic.duration }}</span>
                      <span class="flex items-center gap-1"><CheckCircle class="w-3 h-3 text-emerald-500" /> {{ topic.completed }}</span>
                    </div>
                  </div>
                </div>
                <button
                  @click="startTopic(topic)"
                  class="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1 shrink-0"
                >
                  <span>Start</span>
                  <ChevronRight class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- SCREEN 2: SPEAKING (PRONUNCIATION)         -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'speaking'" class="p-5 space-y-5 pb-28">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Speaking Lab</span>
              <h1 class="text-lg font-bold text-gray-900 mt-1">Pronunciation Practice</h1>
            </div>
            <span class="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles class="w-3.5 h-3.5 text-indigo-500" /> Job Interview
            </span>
          </div>

          <!-- Target Sentence Card -->
          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-md relative">
            <div class="flex justify-between items-start">
              <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">Target Sentence</span>
              <button @click="speakSentence" class="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition">
                <Volume2 class="w-4 h-4" />
                <span>Listen (TTS)</span>
              </button>
            </div>
            <!-- English Sentence -->
            <p class="text-xl font-bold text-gray-900 mt-4 leading-relaxed">
              "I have extensive experience in coordinating cross-functional teams."
            </p>
            <!-- IPA Transcription -->
            <div class="mt-2.5 p-2 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
              <p class="text-xs font-mono text-gray-500">
                /aɪ hæv ɪkˈstɛnsɪv ɪkˈspɪəriəns ɪn koʊˈɔːrdɪneɪtɪŋ krɔːs-ˈfʌŋkʃənl tiːmz/
              </p>
              <span class="text-[10px] text-gray-400 font-semibold uppercase ml-2 shrink-0">US IPA</span>
            </div>
            <!-- Vietnamese Translation -->
            <div class="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2">
              <span class="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded mt-0.5 shrink-0">Dịch</span>
              <p class="text-xs font-medium text-gray-600 leading-normal">
                Tôi có nhiều kinh nghiệm sâu rộng trong việc điều phối các nhóm liên phòng ban.
              </p>
            </div>
          </div>

          <!-- Feedback Area (AI Evaluation) -->
          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Cpu class="w-4 h-4 text-indigo-600" />
                <h3 class="text-sm font-bold text-gray-900">AI Acoustic Evaluation</h3>
              </div>
              <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-sm font-extrabold text-emerald-600">85 / 100</span>
              </div>
            </div>

            <!-- Sentence Breakdown with word highlighting -->
            <div class="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
              <p class="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wide">Pronunciation Breakdown</p>
              <div class="flex flex-wrap gap-2 text-sm leading-loose">
                <span class="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">I</span>
                <span class="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">have</span>
                <span class="text-rose-500 line-through font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200" title="Missed stress on -ten-">extensiv</span>
                <span class="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">experience</span>
                <span class="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">in</span>
                <span class="text-rose-500 line-through font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200" title="Flat vowel sound">coordinating</span>
                <span class="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">cross-functional</span>
                <span class="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">teams.</span>
              </div>
            </div>

            <!-- Phonetic Error Tip Box -->
            <div class="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-1">
              <p class="font-bold text-amber-900 flex items-center gap-1.5">
                <Lightbulb class="w-3.5 h-3.5 text-amber-600" /> Mẹo phát âm AI:
              </p>
              <p class="text-amber-800 text-[11px] leading-relaxed">
                Từ <strong>"coordinating"</strong>: chú ý nhấn trọng âm vào âm tiết thứ hai <em>/koʊˈɔːrdɪneɪtɪŋ/</em>, kéo dài nguyên âm <em>/ɔː/</em> thay vì đọc thành âm "o" ngắn.
              </p>
            </div>
          </div>

          <!-- Interaction Area (Centered Mic button with pulsating rings) -->
          <div class="pt-4 flex flex-col items-center justify-center space-y-3">
            <div class="relative flex items-center justify-center">
              <span v-if="isRecording" class="absolute w-24 h-24 rounded-full bg-rose-500/30 animate-ping"></span>
              <span v-if="isRecording" class="absolute w-20 h-20 rounded-full bg-rose-500/40 animate-pulse"></span>
              <button
                @click="toggleRecording"
                :class="isRecording ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'"
                class="relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95"
              >
                <Square v-if="isRecording" class="w-8 h-8" />
                <Mic v-else class="w-8 h-8" />
              </button>
            </div>
            <div class="text-center">
              <p class="text-xs font-bold text-gray-800">
                {{ isRecording ? 'Đang lắng nghe... Hãy nói ngay' : 'Nhấn nút để bắt đầu đọc' }}
              </p>
              <p class="text-[11px] text-gray-400 mt-0.5">
                {{ isRecording ? 'Nhấn lại để dừng & AI phân tích' : 'Hệ thống tự động chấm điểm từng âm tiết' }}
              </p>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- SCREEN 3: WRITING (AI GRAMMAR & ESSAY)     -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'writing'" class="p-5 space-y-5 pb-24">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Writing Assistant</span>
              <h1 class="text-lg font-bold text-gray-900 mt-1">AI Essay & Grammar Lab</h1>
            </div>
            <button @click="fillSampleEssay" class="text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg">
              Paste Sample
            </button>
          </div>

          <!-- Input Area -->
          <div class="space-y-3">
            <div class="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm relative focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-transparent">
              <textarea
                v-model="essayInput"
                rows="6"
                class="w-full text-sm text-gray-800 placeholder-gray-400 bg-transparent resize-none focus:outline-none leading-relaxed"
                placeholder="Write your English paragraph or IELTS essay here..."
              ></textarea>
              <div class="flex justify-between items-center pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                <span>{{ wordCount }} words • {{ essayInput.length }} chars</span>
                <span class="text-indigo-600 font-medium">IELTS Task 2 Mode</span>
              </div>
            </div>

            <!-- Evaluate Button -->
            <button
              @click="evaluateWriting"
              :disabled="isEvaluating"
              class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
            >
              <Sparkles v-if="!isEvaluating" class="w-4 h-4" />
              <Loader2 v-else class="w-4 h-4 animate-spin" />
              <span>{{ isEvaluating ? 'AI is analyzing your grammar...' : 'Evaluate with AI' }}</span>
            </button>
          </div>

          <!-- Results Dashboard -->
          <div v-if="writingEvaluated" class="space-y-4 pt-1 border-t border-gray-200/70">
            <!-- Score Card -->
            <div class="bg-gradient-to-r from-gray-900 to-indigo-950 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
              <div>
                <p class="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">AI Evaluation Score</p>
                <div class="flex items-baseline gap-2 mt-1">
                  <span class="text-3xl font-extrabold text-white">82</span>
                  <span class="text-xs text-gray-400">/ 100</span>
                </div>
              </div>
              <div class="text-right">
                <span class="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  IELTS Band 6.5
                </span>
                <p class="text-[11px] text-gray-400 mt-1">Task Achievement: Strong</p>
              </div>
            </div>

            <!-- Tabs -->
            <div class="flex bg-gray-200/70 p-1 rounded-xl text-xs font-bold text-gray-600">
              <button
                @click="writingSubTab = 'grammar'"
                :class="writingSubTab === 'grammar' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:text-gray-900'"
                class="flex-1 py-2 rounded-lg transition text-center flex items-center justify-center gap-1"
              >
                <span>Grammar Errors</span>
                <span class="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">2</span>
              </button>
              <button
                @click="writingSubTab = 'vocab'"
                :class="writingSubTab === 'vocab' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:text-gray-900'"
                class="flex-1 py-2 rounded-lg transition text-center"
              >
                Vocab Upgrades
              </button>
              <button
                @click="writingSubTab = 'rewrite'"
                :class="writingSubTab === 'rewrite' ? 'bg-white text-indigo-700 shadow-sm' : 'hover:text-gray-900'"
                class="flex-1 py-2 rounded-lg transition text-center"
              >
                Rewritten
              </button>
            </div>

            <!-- Subview 1: Grammar Errors -->
            <div v-if="writingSubTab === 'grammar'" class="space-y-3">
              <div v-for="(err, idx) in grammarErrors" :key="idx" class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-gray-500">Issue #{{ idx + 1 }} • {{ err.rule }}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600">Syntax Error</span>
                </div>
                <div class="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between text-xs gap-2">
                  <span class="text-rose-500 line-through font-medium">{{ err.wrong }}</span>
                  <ArrowRight class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span class="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{{ err.correct }}</span>
                </div>
                <div class="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900">
                  <strong class="text-amber-950">Giải thích:</strong> {{ err.explanationVi }}
                </div>
              </div>
            </div>

            <!-- Subview 2: Vocab Upgrades -->
            <div v-if="writingSubTab === 'vocab'" class="space-y-3">
              <div v-for="(vocab, idx) in vocabUpgrades" :key="idx" class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-semibold text-gray-500">Original phrase:</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">Band 7.5+ Candidate</span>
                </div>
                <div class="text-xs flex items-center gap-2 flex-wrap">
                  <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">"{{ vocab.original }}"</span>
                  <ChevronsRight class="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span class="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-bold">
                    {{ vocab.upgrade }}
                  </span>
                </div>
                <p class="text-[11px] text-gray-600 italic">"{{ vocab.example }}"</p>
              </div>
            </div>

            <!-- Subview 3: Rewritten Essay -->
            <div v-if="writingSubTab === 'rewrite'" class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Sparkles class="w-4 h-4 text-indigo-600" />
                  AI Polish & Enhancement
                </span>
                <button @click="copyRewritten" class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Check v-if="copied" class="w-3 h-3" />
                  <Copy v-else class="w-3 h-3" />
                  <span>{{ copied ? 'Copied!' : 'Copy' }}</span>
                </button>
              </div>
              <div class="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 leading-relaxed font-normal">
                {{ rewrittenEssay }}
              </div>
              <div class="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-800">
                💡 <strong>AI Note:</strong> Sentence structures have been varied using inversion and formal discourse markers.
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- SCREEN 4: CHAT (AI ROLEPLAY CONVERSATION)  -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'chat'" class="flex-1 flex flex-col justify-between h-full min-h-[580px] pb-20">
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

        <!-- ========================================== -->
        <!-- SCREEN 5: STUDY (FLASHCARD & QUIZ FLOW)    -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'study'" class="p-5 space-y-5 pb-24">
          <!-- Header & Flow Progress -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Vocabulary & Practice</span>
                <h1 class="text-lg font-bold text-gray-900 mt-1">Daily Study Flow</h1>
              </div>
              <span class="text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-full">
                Step {{ currentStudyIndex + 1 }} of {{ studyItems.length }}
              </span>
            </div>
            <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                :style="{ width: ((currentStudyIndex + 1) / studyItems.length * 100) + '%' }"
                class="h-full bg-indigo-600 rounded-full transition-all duration-300"
              ></div>
            </div>
          </div>

          <!-- Toggle: Flashcard Mode vs Quiz Mode -->
          <div class="flex bg-gray-200/70 p-1 rounded-xl text-xs font-bold text-gray-600">
            <button
              @click="studyMode = 'flashcard'"
              :class="studyMode === 'flashcard' ? 'bg-white text-indigo-600 shadow-sm' : 'hover:text-gray-900'"
              class="flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5"
            >
              <Layers class="w-3.5 h-3.5" />
              <span>Flashcard Mode</span>
            </button>
            <button
              @click="studyMode = 'quiz'"
              :class="studyMode === 'quiz' ? 'bg-white text-indigo-600 shadow-sm' : 'hover:text-gray-900'"
              class="flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5"
            >
              <HelpCircle class="w-3.5 h-3.5" />
              <span>Quiz Mode</span>
            </button>
          </div>

          <!-- STATE A: FLASHCARD MODE -->
          <div v-if="studyMode === 'flashcard'" class="space-y-4">
            <div @click="isFlipped = !isFlipped" class="perspective-1000 w-full h-72 cursor-pointer select-none">
              <div :class="isFlipped ? 'rotate-y-180' : ''" class="relative w-full h-full duration-500 transform-style-preserve-3d transition-transform">
                <!-- FRONT SIDE -->
                <div class="absolute inset-0 backface-hidden bg-white rounded-3xl p-6 border border-gray-100 shadow-lg flex flex-col justify-between items-center text-center">
                  <div class="w-full flex justify-between items-center">
                    <span class="text-[10px] font-bold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg">Oxford 3000 • B2</span>
                    <button @click.stop="speakText(currentCard.word)" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 flex items-center justify-center">
                      <Volume2 class="w-4 h-4" />
                    </button>
                  </div>
                  <div class="space-y-2">
                    <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ currentCard.word }}</h2>
                    <p class="text-sm font-mono text-gray-500">{{ currentCard.ipa }}</p>
                  </div>
                  <div class="text-[11px] text-gray-400 flex items-center gap-1">
                    <RotateCw class="w-3 h-3" />
                    <span>Chạm để lật xem nghĩa & ví dụ</span>
                  </div>
                </div>

                <!-- BACK SIDE -->
                <div class="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-50 via-white to-gray-50 rounded-3xl p-6 border border-indigo-100 shadow-lg flex flex-col justify-between text-left">
                  <div class="flex justify-between items-center">
                    <span class="text-[10px] font-extrabold px-2.5 py-1 bg-indigo-600 text-white rounded-lg uppercase">
                      {{ currentCard.type }}
                    </span>
                    <span class="text-[10px] font-semibold text-gray-400">Vietnamese Meaning</span>
                  </div>
                  <div class="space-y-2">
                    <h3 class="text-xl font-bold text-gray-900">{{ currentCard.vietnamese }}</h3>
                    <p class="text-xs text-gray-600 italic border-l-2 border-indigo-400 pl-3 py-1">
                      "{{ currentCard.example }}"
                    </p>
                  </div>
                  <p class="text-[11px] text-gray-400 text-center">
                    Chạm để quay lại mặt trước
                  </p>
                </div>
              </div>
            </div>

            <!-- Bottom Flashcard Action Buttons -->
            <div class="grid grid-cols-2 gap-3 pt-2">
              <button @click="nextCard(false)" class="py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm shadow-amber-500/20 transition flex items-center justify-center gap-1.5">
                <RotateCcw class="w-4 h-4" />
                <span>Review Again</span>
              </button>
              <button @click="nextCard(true)" class="py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm shadow-emerald-500/20 transition flex items-center justify-center gap-1.5">
                <Check class="w-4 h-4" />
                <span>Got It! (+15 XP)</span>
              </button>
            </div>
          </div>

          <!-- STATE B: QUIZ MODE -->
          <div v-if="studyMode === 'quiz'" class="space-y-4">
            <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2">
              <span class="text-[10px] font-extrabold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Question {{ currentStudyIndex + 1 }}</span>
              <p class="text-sm font-bold text-gray-900 leading-relaxed">
                {{ currentQuiz.question }}
              </p>
            </div>

            <div class="space-y-2.5">
              <button
                v-for="(opt, oIdx) in currentQuiz.options"
                :key="oIdx"
                @click="selectQuizOption(oIdx)"
                :disabled="quizChecked"
                :class="getOptionClass(oIdx)"
                class="w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center justify-between text-xs font-semibold"
              >
                <span class="flex items-center gap-2.5">
                  <span class="w-6 h-6 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-[11px]">
                    {{ ['A','B','C','D'][oIdx] }}
                  </span>
                  <span>{{ opt }}</span>
                </span>
                <CheckCircle v-if="quizChecked && oIdx === currentQuiz.correctIndex" class="w-4 h-4 text-emerald-600" />
                <XCircle v-else-if="quizChecked && selectedOption === oIdx && oIdx !== currentQuiz.correctIndex" class="w-4 h-4 text-rose-500" />
              </button>
            </div>

            <!-- Explanation Banner -->
            <div
              v-if="quizChecked"
              :class="selectedOption === currentQuiz.correctIndex ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'"
              class="p-4 rounded-xl border text-xs space-y-1"
            >
              <p class="font-bold flex items-center gap-1.5">
                <Check v-if="selectedOption === currentQuiz.correctIndex" class="w-4 h-4" />
                <AlertCircle v-else class="w-4 h-4" />
                {{ selectedOption === currentQuiz.correctIndex ? 'Chính xác! (+20 XP)' : 'Chưa đúng rồi!' }}
              </p>
              <p class="text-[11px] leading-relaxed opacity-90">
                {{ currentQuiz.explanation }}
              </p>
            </div>

            <!-- Quiz Action Bottom Button -->
            <div class="pt-2">
              <button
                v-if="!quizChecked"
                @click="checkAnswer"
                :disabled="selectedOption === null"
                class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition"
              >
                Check Answer
              </button>
              <button
                v-else
                @click="nextQuizQuestion"
                class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1"
              >
                <span>Next Question</span>
                <ArrowRight class="w-4 h-4" />
              </button>
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
            class="flex flex-col items-center py-1 px-2 transition-all relative"
          >
            <Home :class="activeTab === 'home' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform duration-200" />
            <span class="text-[10px] mt-1">Home</span>
            <span v-if="activeTab === 'home'" class="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          </button>

          <button
            @click="activeTab = 'speaking'"
            :class="activeTab === 'speaking' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'"
            class="flex flex-col items-center py-1 px-2 transition-all relative"
          >
            <Mic :class="activeTab === 'speaking' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform duration-200" />
            <span class="text-[10px] mt-1">Speaking</span>
            <span v-if="activeTab === 'speaking'" class="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          </button>

          <button
            @click="activeTab = 'writing'"
            :class="activeTab === 'writing' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'"
            class="flex flex-col items-center py-1 px-2 transition-all relative"
          >
            <PenTool :class="activeTab === 'writing' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform duration-200" />
            <span class="text-[10px] mt-1">Writing</span>
            <span v-if="activeTab === 'writing'" class="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          </button>

          <button
            @click="activeTab = 'chat'"
            :class="activeTab === 'chat' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'"
            class="flex flex-col items-center py-1 px-2 transition-all relative"
          >
            <MessageSquare :class="activeTab === 'chat' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform duration-200" />
            <span class="text-[10px] mt-1">AI Chat</span>
            <span v-if="activeTab === 'chat'" class="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          </button>

          <button
            @click="activeTab = 'study'"
            :class="activeTab === 'study' ? 'text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'"
            class="flex flex-col items-center py-1 px-2 transition-all relative"
          >
            <BookOpen :class="activeTab === 'study' ? 'scale-110 stroke-[2.5]' : ''" class="w-5 h-5 transition-transform duration-200" />
            <span class="text-[10px] mt-1">Study</span>
            <span v-if="activeTab === 'study'" class="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          </button>
        </div>
      </nav>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  Signal, Wifi, Award, Flame, Bot, Clock, CheckCircle, ChevronRight,
  Sparkles, Volume2, Cpu, Lightbulb, Mic, Square, Loader2, ArrowRight,
  ChevronsRight, Copy, Check, RotateCcw, Send, Layers, HelpCircle,
  RotateCw, XCircle, AlertCircle, Home, PenTool, MessageSquare, BookOpen
} from 'lucide-vue-next';

// Active Main Tab
const activeTab = ref('home');

// ================= SCREEN 1: HOME =================
const topics = ref([
  {
    id: 1,
    title: 'Job Interview',
    desc: 'Self introduction, behavioral Q&A & salary talk',
    emoji: '💼',
    bg: 'bg-amber-100 text-amber-700',
    level: 'B2 Upper',
    duration: '12 min',
    completed: '85%'
  },
  {
    id: 2,
    title: 'Travel & Hotel',
    desc: 'Check-in, booking inquiries & flight boarding',
    emoji: '✈️',
    bg: 'bg-sky-100 text-sky-700',
    level: 'B1 Pre-Int',
    duration: '8 min',
    completed: '100%'
  },
  {
    id: 3,
    title: 'Daily Routine',
    desc: 'Casual habits, socializing & morning rituals',
    emoji: '☕',
    bg: 'bg-emerald-100 text-emerald-700',
    level: 'A2 Basic',
    duration: '6 min',
    completed: '40%'
  },
  {
    id: 4,
    title: 'Tech & AI Discussion',
    desc: 'Debating future artificial intelligence & robotics',
    emoji: '🤖',
    bg: 'bg-purple-100 text-purple-700',
    level: 'C1 Adv',
    duration: '15 min',
    completed: '0%'
  }
]);

const startTopic = (topic) => {
  if (topic.id === 1) activeTab.value = 'speaking';
  else if (topic.id === 2) activeTab.value = 'chat';
  else activeTab.value = 'study';
};

// ================= SCREEN 2: SPEAKING =================
const isRecording = ref(false);
const toggleRecording = () => {
  isRecording.value = !isRecording.value;
};

const speakSentence = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("I have extensive experience in coordinating cross-functional teams.");
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

// ================= SCREEN 3: WRITING =================
const essayInput = ref("In recent days, many people thinks that technology have bad effect on children education.");
const writingEvaluated = ref(true);
const isEvaluating = ref(false);
const writingSubTab = ref('grammar');
const copied = ref(false);

const wordCount = computed(() => {
  if (!essayInput.value.trim()) return 0;
  return essayInput.value.trim().split(/\s+/).length;
});

const grammarErrors = ref([
  {
    rule: 'Subject-Verb Agreement',
    wrong: 'many people thinks',
    correct: 'many people think',
    explanationVi: "'People' là danh từ số nhiều đếm được, do đó động từ 'think' không thêm 's'."
  },
  {
    rule: 'Singular/Plural Auxiliary',
    wrong: 'technology have bad effect',
    correct: 'technology has a detrimental effect',
    explanationVi: "'Technology' đóng vai trò danh từ không đếm được ở ngữ cảnh này, đi với 'has'. Ngoài ra cụm 'have an effect on' cần mạo từ 'a'."
  }
]);

const vocabUpgrades = ref([
  {
    original: 'bad effect',
    upgrade: 'detrimental impact / adverse ramifications',
    example: 'Technological overuse exerts a detrimental impact on cognitive development.'
  },
  {
    original: 'In recent days',
    upgrade: 'In contemporary society / In recent decades',
    example: 'In contemporary society, digital literacy has become quintessential.'
  }
]);

const rewrittenEssay = ref(
  "In contemporary society, a growing body of opinion asserts that digital technology exerts an adverse impact on children's academic progression."
);

const fillSampleEssay = () => {
  essayInput.value = "Although some people argues that online learning is bad, I strongly believes that it offer numerous benefit for students worldwide.";
  writingEvaluated.value = false;
};

const evaluateWriting = () => {
  isEvaluating.value = true;
  setTimeout(() => {
    isEvaluating.value = false;
    writingEvaluated.value = true;
  }, 700);
};

const copyRewritten = () => {
  navigator.clipboard.writeText(rewrittenEssay.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1800);
};

// ================= SCREEN 4: CHAT =================
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

// ================= SCREEN 5: STUDY =================
const studyMode = ref('flashcard');
const currentStudyIndex = ref(0);
const isFlipped = ref(false);

const studyItems = ref([
  {
    word: 'Elaborate',
    ipa: '/ɪˈlæb.ə.rət/',
    type: 'Verb / Adjective',
    vietnamese: 'Giải thích chi tiết / Phức tạp, kỹ lưỡng',
    example: 'Could you elaborate on your previous management accomplishments?'
  },
  {
    word: 'Feasible',
    ipa: '/ˈfiː.zə.bəl/',
    type: 'Adjective',
    vietnamese: 'Khả thi, có thể thực hiện được',
    example: 'With our current budget, launching the campaign next month is entirely feasible.'
  },
  {
    word: 'Procrastinate',
    ipa: '/prəˈkræs.tə.neɪt/',
    type: 'Verb',
    vietnamese: 'Trì hoãn, chần chừ',
    example: 'Do not procrastinate when preparing for your upcoming IELTS exam.'
  }
]);

const currentCard = computed(() => studyItems.value[currentStudyIndex.value] || studyItems.value[0]);

const nextCard = () => {
  isFlipped.value = false;
  currentStudyIndex.value = (currentStudyIndex.value + 1) % studyItems.value.length;
};

// Quiz Mode
const selectedOption = ref(null);
const quizChecked = ref(false);

const quizzes = ref([
  {
    question: "Choose the word that is closest in meaning to 'FEASIBLE':",
    options: ['Impossible', 'Viable & Practical', 'Expensive', 'Doubtful'],
    correctIndex: 1,
    explanation: "'Feasible' có nghĩa là khả thi, đồng nghĩa với 'Viable & Practical' (có thể thực hành/thành công)."
  },
  {
    question: "Complete the sentence: 'She asked him to ______ on his ideas.'",
    options: ['elaborate', 'procrastinate', 'demolish', 'hesitate'],
    correctIndex: 0,
    explanation: "Cụm 'elaborate on something' nghĩa là giải thích kỹ, trình bày chi tiết về vấn đề gì đó."
  },
  {
    question: "Which word means 'to delay doing something until later'?",
    options: ['Accelerate', 'Accomplish', 'Procrastinate', 'Facilitate'],
    correctIndex: 2,
    explanation: "'Procrastinate' mang nghĩa trì hoãn hoặc chần chừ làm việc gì đó."
  }
]);

const currentQuiz = computed(() => quizzes.value[currentStudyIndex.value] || quizzes.value[0]);

const selectQuizOption = (idx) => {
  if (quizChecked.value) return;
  selectedOption.value = idx;
};

const checkAnswer = () => {
  quizChecked.value = true;
};

const nextQuizQuestion = () => {
  selectedOption.value = null;
  quizChecked.value = false;
  currentStudyIndex.value = (currentStudyIndex.value + 1) % quizzes.value.length;
};

const getOptionClass = (oIdx) => {
  if (!quizChecked.value) {
    return selectedOption.value === oIdx
      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm'
      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-800';
  }
  if (oIdx === currentQuiz.value.correctIndex) {
    return 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
  }
  if (selectedOption.value === oIdx && oIdx !== currentQuiz.value.correctIndex) {
    return 'border-rose-500 bg-rose-50 text-rose-900';
  }
  return 'border-gray-200 bg-white text-gray-400 opacity-60';
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