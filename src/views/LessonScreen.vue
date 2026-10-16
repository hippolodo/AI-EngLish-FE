<template>
  <section v-if="activeTab === 'lesson'" class="w-full max-w-6xl mx-auto space-y-7 pb-28">
    <button @click="currentLesson ? backToTopic() : activeTab = 'home'" class="text-sm sm:text-base font-bold text-indigo-600 hover:underline cursor-pointer">← {{ currentLesson ? 'Các bài trong chủ đề' : 'Trang chủ' }}</button>
    <div>
      <p class="text-xs sm:text-sm font-bold uppercase tracking-wide text-indigo-600">{{ selectedTopic?.level }} · {{ selectedTopic?.title }}</p>
      <h1 class="text-slate-900 text-2xl sm:text-3xl font-extrabold leading-snug mt-1">{{ currentLesson?.title || 'Chọn bài học' }}</h1>
    </div>
    <p v-if="lessonError" role="alert" class="rounded-2xl bg-rose-50 p-4 text-sm sm:text-base text-rose-700">{{ lessonError }} <button @click="retry" class="font-bold underline">Thử lại</button></p>
    <div v-if="lessonLoading || journey.loading.value" class="py-12 text-center text-sm sm:text-base text-slate-500"><Loader2 class="mx-auto mb-2 h-7 w-7 animate-spin text-indigo-600" />Đang tải bài học…</div>
    <template v-else-if="!currentLesson">
      <p class="text-sm sm:text-base text-slate-500">Chọn bài nói hoặc viết. Các bài đã hoàn thành vẫn có thể luyện lại.</p>
      <div class="space-y-3">
        <button v-for="lesson in topicLessons" :key="lesson.id" @click="startLesson(lesson)" class="flex w-full items-center gap-4 rounded-2xl border border-indigo-100 bg-white p-5 text-left shadow-2xs hover:shadow-md hover:border-indigo-200 transition cursor-pointer">
          <Mic v-if="lesson.type === 'SPEAKING'" class="h-6 w-6 shrink-0 text-emerald-600" /><PenLine v-else class="h-6 w-6 shrink-0 text-indigo-600" />
          <span class="flex-1"><span class="block text-base sm:text-lg font-bold text-slate-900">{{ lesson.title }}</span><span class="text-sm text-slate-500">{{ lesson.type === 'SPEAKING' ? 'Nghe mẫu & luyện nói' : 'Viết theo đề bài' }}</span></span>
          <CheckCircle2 v-if="journey.lesson(lesson.id).completed" class="h-6 w-6 text-emerald-600" /><ChevronRight v-else class="h-5 w-5 text-slate-400" />
        </button>
      </div>
      <p v-if="!topicLessons.length" class="rounded-2xl bg-white p-6 text-base text-slate-500">Chủ đề này chưa có bài học. Hãy chọn chủ đề khác.</p>
    </template>
    <template v-else>
      <div class="flex gap-3 text-sm sm:text-base font-bold">
        <button @click="lessonStep = 'practice'" class="flex-1 rounded-2xl py-3 cursor-pointer transition shadow-2xs" :class="lessonStep === 'practice' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'">1. Luyện tập</button>
        <button @click="openLessonQuiz" :disabled="!lessonQuizzes.length" class="flex-1 rounded-2xl bg-indigo-50 py-3 text-indigo-700 disabled:opacity-40 cursor-pointer transition shadow-2xs">2. Quiz</button>
        <button @click="lessonStep = 'summary'" class="flex-1 rounded-2xl py-3 cursor-pointer transition shadow-2xs" :class="lessonStep === 'summary' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'">3. Tổng kết</button>
      </div>
      <div v-if="lessonStep === 'summary'" class="space-y-4 rounded-3xl border border-emerald-100 bg-white p-6 sm:p-7 shadow-xs">
        <h2 class="text-xl font-bold text-slate-900">{{ lessonProgress.completed ? '🎉 Bạn đã hoàn thành bài này' : 'Tiến độ bài học' }}</h2>
        <p v-if="currentLesson.type === 'SPEAKING'" class="text-base text-slate-700">Đã luyện {{ lessonProgress.completed_content_ids.length }}/{{ lessonDetail.contents.length }} câu.</p>
        <p v-if="lessonProgress.writing_score !== null" class="text-base font-semibold">Điểm viết tham khảo: {{ lessonProgress.writing_score }}/100.</p>
        <p v-if="lessonProgress.quiz_score !== null" class="text-base font-semibold">Quiz: {{ lessonProgress.quiz_score }}/100.</p>
        <p class="text-sm text-slate-500">Hoàn thành ghi nhận các hoạt động đã làm. Hãy luyện lại những điểm còn yếu để ghi nhớ tốt hơn.</p>
        <button v-if="!lessonProgress.completed" @click="finishLesson" :disabled="!canFinishLesson" class="w-full rounded-2xl bg-emerald-600 p-4 text-base font-bold text-white shadow-md shadow-emerald-600/20 disabled:opacity-40 cursor-pointer">Ghi nhận hoàn thành</button>
        <p v-if="!canFinishLesson" class="text-sm font-semibold text-amber-700">{{ currentLesson.type === 'SPEAKING' ? 'Luyện đủ các câu để hoàn thành bài.' : 'Nộp một bài viết để hoàn thành hoạt động.' }}</p>
        <button v-if="lessonProgress.completed" @click="nextLesson" class="w-full rounded-2xl bg-indigo-600 p-4 text-base font-bold text-white shadow-md shadow-indigo-600/20 cursor-pointer">Tiếp tục học</button>
        <button @click="beginLessonPractice" class="w-full text-base font-bold text-indigo-600 hover:underline cursor-pointer">Luyện lại bài này</button>
      </div>
      <template v-else>
        <div class="space-y-2.5 rounded-3xl bg-indigo-50/80 p-5 sm:p-6 border border-indigo-100">
          <h2 class="text-base sm:text-lg font-bold text-indigo-950">Mục tiêu của bài</h2>
          <p class="text-sm sm:text-base text-indigo-900 leading-relaxed">{{ currentLesson.type === 'SPEAKING' ? 'Nghe mẫu, hiểu nghĩa và luyện đọc các câu trong bài. Sau mỗi lượt, thử lại các từ cần cải thiện.' : 'Viết theo yêu cầu dưới đây, xem phản hồi, sửa bài và nộp lại nếu cần.' }}</p>
          <p class="text-xs sm:text-sm font-bold text-indigo-700">{{ currentLesson.type === 'SPEAKING' ? `${lessonDetail.contents.length} câu luyện tập` : 'Viết và sửa theo tốc độ của bạn' }}</p>
        </div>
        <div v-for="content in lessonDetail.contents" :key="content.id" class="space-y-3 rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-2xs">
          <p class="reading-text whitespace-pre-line text-base sm:text-lg font-bold text-slate-900 leading-relaxed">{{ content.target_text }}</p>
          <p v-if="content.hint_translation" class="text-sm sm:text-base text-slate-500">{{ content.hint_translation }}</p>
          <p v-if="content.task_guidance" class="whitespace-pre-line text-sm sm:text-base text-indigo-700 leading-relaxed">{{ content.task_guidance }}</p>
          <details v-if="content.sample_text" class="rounded-2xl bg-slate-50 p-4">
            <summary class="cursor-pointer text-sm sm:text-base font-bold text-indigo-700">Xem bài mẫu tham khảo</summary>
            <p class="mt-2 text-xs sm:text-sm text-slate-500">Tham khảo cách triển khai ý, sau đó viết bài bằng lời của bạn.</p>
            <p class="reading-text mt-2 whitespace-pre-line text-slate-800 text-sm sm:text-base leading-relaxed">{{ content.sample_text }}</p>
          </details>
          <audio v-if="content.audio_url && currentLesson.type === 'SPEAKING'" :src="getFullAudioUrl(content.audio_url)" controls preload="none" class="w-full" />
        </div>
        <p v-if="!lessonDetail.contents.length" class="rounded-2xl bg-amber-50 p-4 text-sm sm:text-base text-amber-800">{{ currentLesson.type === 'SPEAKING' ? 'Bài này chưa có câu luyện tập. Hãy chọn bài khác.' : 'Bài chưa có hướng dẫn chi tiết; hãy viết theo chủ đề trong tiêu đề.' }}</p>
        <button @click="beginLessonPractice" :disabled="currentLesson.type === 'SPEAKING' && !lessonDetail.contents.length" class="w-full rounded-2xl bg-indigo-600 p-4 text-base font-bold text-white shadow-md shadow-indigo-600/20 disabled:opacity-40 cursor-pointer">{{ currentLesson.type === 'SPEAKING' ? 'Nghe và luyện nói' : 'Viết theo đề bài' }}</button>
        <div class="space-y-3 rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-2xs">
          <h2 class="text-base sm:text-lg font-bold text-slate-900">Luyện tập bổ trợ</h2>
          <button v-if="lessonQuizzes.length" @click="openLessonQuiz" class="block text-sm sm:text-base font-bold text-indigo-600 hover:underline cursor-pointer">Làm quiz của bài/chủ đề ({{ lessonQuizzes.length }}) →</button>
          <p v-else class="text-xs sm:text-sm text-slate-500">Bài/chủ đề này chưa có quiz. Bạn vẫn có thể hoàn thành phần luyện tập.</p>
          <button v-for="deck in lessonDecks" :key="deck.id" @click="openLessonDeck(deck)" class="block text-sm sm:text-base font-bold text-indigo-600 hover:underline cursor-pointer">Luyện flashcard: {{ deck.title }} →</button>
          <p v-if="!lessonDecks.length" class="text-xs sm:text-sm text-slate-500">Chưa có bộ từ riêng cho bài. Bạn có thể lưu từ vào bộ cá nhân khi luyện tập.</p>
          <button @click="openLessonChat" class="block text-sm sm:text-base font-bold text-indigo-600 hover:underline cursor-pointer">Luyện thêm qua hội thoại →</button>
        </div>
      </template>
    </template>
  </section>
</template>

<script setup>
import { inject } from 'vue';
import { Loader2, Mic, PenLine, CheckCircle2, ChevronRight } from 'lucide-vue-next';
import { getFullAudioUrl } from '../services/api';
const ctx = inject('screenContext');
const { activeTab, selectedTopic, topicLessons, currentLesson, lessonDetail, lessonQuizzes, lessonDecks, lessonLoading, lessonError, lessonStep, lessonProgress, canFinishLesson, journey, startLesson, startTopic, beginLessonPractice, openLessonQuiz, openLessonDeck, finishLesson, nextLesson, openLessonChat } = ctx;
const backToTopic = () => startTopic(selectedTopic.value);
const retry = () => currentLesson.value ? startLesson(currentLesson.value) : startTopic(selectedTopic.value);
</script>
