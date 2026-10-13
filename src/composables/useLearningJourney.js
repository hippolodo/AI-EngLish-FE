import { ref, computed, watch, onScopeDispose } from 'vue';

export const createLearningState = () => ({
  goal: 'communication', daily_minutes: 10, onboarded: false,
  resume: null, lessons: {}, writing_drafts: {}, quiz_drafts: {}
});

export function useLearningJourney(user, authenticated, service, storage = globalThis.localStorage) {
  const state = ref(createLearningState());
  const loading = ref(false);
  const error = ref('');
  const identity = computed(() => authenticated.value ? user.value?.id : null);
  let loadedId = null;
  let epoch = 0;
  let timer;
  let chain = Promise.resolve();
  let dirty = false;
  let changeCount = 0;
  let remoteLoaded = false;
  let touched = new Set();
  let removedQuizIds = new Set();
  const key = id => `lingoup:learning:${id}`;
  const mergeRemote = (remote, local) => {
    const merged = { ...createLearningState(), ...remote };
    for (const field of touched) merged[field] = local[field];
    for (const field of ['lessons', 'writing_drafts', 'quiz_drafts']) {
      if (touched.has(field)) merged[field] = { ...remote[field], ...local[field] };
    }
    for (const id of removedQuizIds) delete merged.quiz_drafts[id];
    return merged;
  };

  const cache = () => {
    if (!loadedId) return;
    try { storage?.setItem(key(loadedId), JSON.stringify({ state: state.value, dirty, touched: [...touched], removedQuizIds: [...removedQuizIds] })); }
    catch { error.value = 'Không lưu được trên thiết bị. Hãy kiểm tra kết nối để đồng bộ.'; }
  };

  const sync = () => {
    clearTimeout(timer);
    const id = loadedId;
    const version = epoch;
    const changes = changeCount;
    let snapshot = JSON.parse(JSON.stringify(state.value));
    if (!id || identity.value !== id || loading.value) return chain;
    if (!dirty && error.value) return load(true);
    if (!dirty) return chain;
    chain = chain.catch(() => {}).then(async () => {
      if (version !== epoch || identity.value !== id) return;
      try {
        // A first-load outage must not replace progress from another device with empty defaults.
        if (!remoteLoaded) {
          const remote = await service.getState();
          if (version !== epoch) return;
          snapshot = mergeRemote(remote, snapshot);
          remoteLoaded = true;
          if (changes === changeCount) state.value = snapshot;
        }
        await service.saveState(snapshot);
        if (version !== epoch) return;
        if (changes === changeCount) { dirty = false; touched.clear(); removedQuizIds.clear(); }
        error.value = '';
        cache();
      } catch {
        if (version === epoch) error.value = 'Tiến độ được giữ trên thiết bị. Chưa đồng bộ được; nhấn thử lại khi có mạng.';
      }
    });
    return chain;
  };

  const load = async (force = false) => {
    const id = identity.value;
    if (id === loadedId && !force) return;
    const version = ++epoch;
    clearTimeout(timer);
    loadedId = id;
    state.value = createLearningState();
    dirty = false;
    remoteLoaded = false;
    touched = new Set();
    removedQuizIds = new Set();
    error.value = '';
    loading.value = !!id;
    if (!id) return;
    try {
      const cached = JSON.parse(storage?.getItem(key(id)) || 'null');
      if (cached?.state) {
        state.value = { ...createLearningState(), ...cached.state };
        dirty = !!cached.dirty;
        touched = new Set(cached.touched || (dirty ? Object.keys(cached.state) : []));
        removedQuizIds = new Set(cached.removedQuizIds || []);
      }
    } catch { /* Ignore invalid local cache. */ }
    const changes = changeCount;
    try {
      const remote = await service.getState();
      if (version !== epoch) return;
      state.value = dirty || changes !== changeCount ? mergeRemote(remote, state.value) : { ...createLearningState(), ...remote };
      remoteLoaded = true;
      cache();
    } catch {
      if (version === epoch) error.value = 'Chưa tải được tiến độ đã lưu. Bạn vẫn có thể học và thử đồng bộ lại.';
    } finally {
      if (version === epoch) { loading.value = false; if (dirty) void sync(); }
    }
  };

  const update = callback => {
    if (!identity.value || identity.value !== loadedId) return;
    const before = Object.fromEntries(Object.entries(state.value).map(([field, value]) => [field, JSON.stringify(value)]));
    const quizIds = Object.keys(state.value.quiz_drafts);
    callback(state.value);
    for (const [field, value] of Object.entries(state.value)) if (before[field] !== JSON.stringify(value)) touched.add(field);
    for (const id of quizIds) if (!(id in state.value.quiz_drafts)) removedQuizIds.add(id);
    for (const id of Object.keys(state.value.quiz_drafts)) removedQuizIds.delete(id);
    changeCount += 1;
    dirty = true;
    cache();
    clearTimeout(timer);
    timer = setTimeout(sync, 600);
  };

  const lesson = id => state.value.lessons[String(id)] || {
    completed_content_ids: [], practiced: false, completed: false,
    speaking_scores: {}, writing_score: null, quiz_score: null
  };
  const updateLesson = (id, callback) => update(data => {
    const progress = JSON.parse(JSON.stringify(lesson(id)));
    callback(progress);
    data.lessons[String(id)] = progress;
  });
  const remember = (topicId, lessonId, step = 'practice', contentId = null) => update(data => {
    data.resume = { topic_id: topicId, lesson_id: lessonId, step, content_id: contentId };
  });
  const completedCount = computed(() => Object.values(state.value.lessons).filter(item => item.completed).length);
  const stop = watch(identity, () => void load(), { immediate: true, flush: 'sync' });
  onScopeDispose(() => { stop(); clearTimeout(timer); });
  return { state, loading, error, load, sync, update, lesson, updateLesson, remember, completedCount };
}
