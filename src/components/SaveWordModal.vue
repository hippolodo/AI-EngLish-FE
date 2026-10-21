<template>
  <div v-if="isOpen" class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4" @click.self="!saving && $emit('close')">
    <form @submit.prevent="save" class="w-full max-w-sm space-y-3 rounded-2xl bg-white p-5" role="dialog" aria-modal="true" aria-labelledby="save-word-title">
      <div class="flex items-center justify-between"><h2 id="save-word-title" class="font-semibold">Save Word to Review</h2><button type="button" :disabled="saving" @click="$emit('close')" aria-label="Close"><X class="h-5 w-5" /></button></div>
      <label class="block text-sm">English Word / Phrase<input v-model="word" required maxlength="100" :disabled="saving" class="mt-1 w-full rounded-xl border p-3 text-sm" /></label>
      <div v-if="ipa" class="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-mono font-semibold rounded-lg w-fit">
        <span>Phonetics: /{{ ipa.replace(/^\/+|\/+$/g, '') }}/</span>
      </div>
      <label class="block text-sm">Meaning / Definition<input v-model="meaning" required maxlength="1000" :disabled="saving" class="mt-1 w-full rounded-xl border p-3 text-sm" placeholder="Enter definition or translation…" /></label>
      <label class="block text-sm">Example Sentence<textarea v-model="sentence" maxlength="2000" :disabled="saving" class="mt-1 w-full rounded-xl border p-3 text-sm" /></label>
      <p v-if="error" role="alert" class="text-sm text-rose-600">{{ error }}</p>
      <button :disabled="saving || !word.trim() || !meaning.trim()" class="w-full rounded-xl bg-indigo-600 p-3 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer">{{ saving ? 'Saving…' : 'Save to Flashcards' }}</button>
    </form>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import { studyService } from '../services/studyService';
import { authService } from '../services/authService';
import { getErrorMessage } from '../services/api';
const props = defineProps({
  isOpen: Boolean,
  initialWord: { type: String, default: '' },
  example: { type: String, default: '' },
  initialMeaning: { type: String, default: '' },
  initialIpa: { type: String, default: '' }
});
const emit = defineEmits(['close', 'saved']);
const word = ref(''), meaning = ref(''), sentence = ref(''), ipa = ref(''), error = ref(''), saving = ref(false);
watch(() => props.isOpen, open => {
  if (open) {
    word.value = props.initialWord;
    sentence.value = props.example;
    meaning.value = props.initialMeaning || '';
    ipa.value = props.initialIpa || '';
    error.value = '';
  }
});
const save = async () => {
  if (saving.value) return;
  const token = authService.getToken();
  saving.value = true; error.value = '';
  try { await studyService.saveWord(word.value.trim(), meaning.value.trim(), sentence.value.trim(), ipa.value.trim()); if (token === authService.getToken()) emit('saved'); }
  catch (err) { if (token === authService.getToken()) error.value = getErrorMessage(err, 'Could not save word.'); }
  finally { saving.value = false; }
};
</script>
