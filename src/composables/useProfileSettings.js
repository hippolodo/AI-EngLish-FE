import { ref, computed, watch } from 'vue';

export function useProfileSettings(ctx, service) {
  const form = ref({ full_name: '', target_level: 'Beginner', goal: 'communication', daily_minutes: 10 });
  const baseline = ref({ ...form.value });
  const saving = ref(false);
  const message = ref('');
  const error = ref('');
  let version = 0;
  let owner = null;

  const dirty = computed(() => JSON.stringify(form.value) !== JSON.stringify(baseline.value));
  const valid = computed(() => !!form.value.full_name.trim() && form.value.full_name.trim().length <= 100
    && ['Beginner', 'Intermediate', 'Advanced'].includes(form.value.target_level)
    && ['communication', 'work', 'study'].includes(form.value.goal)
    && Number.isInteger(form.value.daily_minutes) && form.value.daily_minutes >= 5 && form.value.daily_minutes <= 60);

  const reset = () => {
    form.value = {
      full_name: ctx.userProfile.value?.full_name || '',
      target_level: ctx.userProfile.value?.target_level || 'Beginner',
      goal: ctx.journey.state.value.goal,
      daily_minutes: ctx.journey.state.value.daily_minutes
    };
    baseline.value = { ...form.value };
    message.value = '';
    error.value = '';
  };

  watch(() => [ctx.isAuthenticated.value, ctx.userProfile.value?.id,
    ctx.userProfile.value?.full_name, ctx.userProfile.value?.target_level,
    ctx.journey.state.value.goal, ctx.journey.state.value.daily_minutes], () => {
    const id = ctx.isAuthenticated.value ? ctx.userProfile.value?.id : null;
    if (id !== owner) { version += 1; owner = id; saving.value = false; reset(); }
    else if (!dirty.value && !saving.value) reset();
  }, { immediate: true, flush: 'sync' });

  const save = async () => {
    if (saving.value || ctx.journey.loading.value) return;
    if (!ctx.isAuthenticated.value) { ctx.requireAuthentication(); return; }
    if (!valid.value) { error.value = 'Please enter a valid display name and options before saving.'; return; }
    const requestVersion = version;
    const payload = { ...form.value, full_name: form.value.full_name.trim() };
    saving.value = true;
    message.value = ''; error.value = '';
    try {
      // Finish earlier workspace saves so they cannot overwrite the new preferences.
      await ctx.journey.sync();
      if (requestVersion !== version) return;
      const result = await service.updatePreferences(payload);
      if (requestVersion !== version) return;
      ctx.onProfileUpdated(result.user);
      ctx.journey.update(state => { state.goal = result.goal; state.daily_minutes = result.daily_minutes; state.onboarded = true; });
      await ctx.journey.sync();
      if (requestVersion !== version) return;
      form.value = { full_name: result.user.full_name, target_level: result.user.target_level, goal: result.goal, daily_minutes: result.daily_minutes };
      baseline.value = { ...form.value };
      message.value = 'Profile and study settings saved successfully.';
    } catch (err) {
      if (requestVersion !== version) return;
      const detail = err.response?.data?.detail;
      error.value = Array.isArray(detail) ? detail.map(item => item.msg).join(', ')
        : typeof detail === 'string' ? detail : 'Could not save settings. Please try again.';
    } finally { if (requestVersion === version) saving.value = false; }
  };

  return { form, saving, message, error, dirty, valid, reset, save };
}
