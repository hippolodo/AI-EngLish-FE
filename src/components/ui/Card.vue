<template>
  <component
    :is="asMotion ? motion.div : 'div'"
    v-bind="computedBindings"
    :class="[
      'rounded-3xl border transition-colors',
      glass ? 'bg-white/80 backdrop-blur-md border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]' : 'bg-white border-slate-200/80 shadow-xs',
      interactive ? 'cursor-pointer hover:shadow-lg hover:border-slate-300 select-none' : '',
      className
    ]"
  >
    <slot />
  </component>
</template>

<script setup>
import { computed, useAttrs } from 'vue';
import { motion } from 'motion-v';

const props = defineProps({
  interactive: {
    type: Boolean,
    default: false,
  },
  glass: {
    type: Boolean,
    default: false,
  },
  asMotion: {
    type: Boolean,
    default: true,
  },
  className: {
    type: String,
    default: '',
  }
});

const attrs = useAttrs();

const springTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

const computedBindings = computed(() => {
  const base = { ...attrs };
  if (props.asMotion) {
    if (props.interactive) {
      base.whileHover = { y: -4, transition: springTransition };
      base.whileTap = { scale: 0.98, transition: springTransition };
    }
  }
  return base;
});
</script>

