<template>
  <span
    :class="[
      'inline-flex items-center font-bold tracking-wide transition-all select-none',
      variantClasses[variant] || variantClasses.default,
      sizeClasses[size] || sizeClasses.md,
      className
    ]"
    v-bind="$attrs"
  >
    <span v-if="dot" class="mr-1.5 flex h-2 w-2 relative">
      <span v-if="pulse" class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="dotColorClasses[variant] || 'bg-blue-400'"></span>
      <span class="relative inline-flex rounded-full h-2 w-2" :class="dotColorClasses[variant] || 'bg-blue-500'"></span>
    </span>
    <slot name="icon" />
    <slot />
  </span>
</template>

<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'default', // 'default' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple' | 'slate'
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md' | 'lg'
  },
  dot: {
    type: Boolean,
    default: false,
  },
  pulse: {
    type: Boolean,
    default: false,
  },
  className: {
    type: String,
    default: '',
  }
});

const variantClasses = {
  default: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
  amber: 'bg-amber-50 text-amber-800 border border-amber-200/80',
  rose: 'bg-rose-50 text-rose-800 border border-rose-200/80',
  indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200/80',
  slate: 'bg-slate-100 text-slate-700 border border-slate-200',
};

const dotColorClasses = {
  default: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  indigo: 'bg-indigo-500',
  purple: 'bg-purple-500',
  slate: 'bg-slate-500',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs rounded-full gap-1',
  md: 'px-3 py-1 text-xs rounded-full gap-1.5',
  lg: 'px-3.5 py-1.5 text-sm rounded-full gap-2',
};
</script>

