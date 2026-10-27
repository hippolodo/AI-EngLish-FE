<template>
  <AnimateButton
    :hover-scale="disabled || loading ? 1 : hoverScale"
    :tap-scale="disabled || loading ? 1 : tapScale"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-bold transition-colors select-none cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none disabled:border-slate-200',
      variantClasses[variant] || variantClasses.default,
      sizeClasses[size] || sizeClasses.md,
      className
    ]"
    v-bind="$attrs"
  >
    <slot name="prefix" />
    <span v-if="loading" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
    <slot />
    <slot name="suffix" />
  </AnimateButton>
</template>

<script setup>
import { computed } from 'vue';
import { Button as AnimateButton } from '@animate-ui/vue/primitives/buttons/button';

const props = defineProps({
  variant: {
    type: String,
    default: 'default', // 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'glass' | 'emerald' | 'gradient'
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  },
  tapScale: {
    type: Number,
    default: 0.96,
  },
  hoverScale: {
    type: Number,
    default: 1.02,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  className: {
    type: String,
    default: '',
  }
});

const variantClasses = {
  default: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:bg-blue-800',
  gradient: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md shadow-blue-500/20',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80',
  outline: 'border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 shadow-2xs',
  destructive: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20',
  ghost: 'bg-transparent hover:bg-slate-100/80 text-slate-700 hover:text-slate-900',
  glass: 'bg-white/80 backdrop-blur-md border border-slate-200/80 hover:bg-white text-slate-800 shadow-xs',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-4.5 py-2.5 text-sm rounded-2xl gap-2',
  lg: 'px-6 py-3.5 text-base rounded-2xl gap-2.5',
  xl: 'px-7 py-4 text-lg rounded-2xl gap-3',
  icon: 'w-10 h-10 p-0 rounded-2xl flex items-center justify-center',
};
</script>

