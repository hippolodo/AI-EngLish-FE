<template>
  <ShimmeringTextPrimitive :text="text" v-bind="$attrs" />
</template>

<script setup>
import { ShimmeringText as ShimmeringTextPrimitive } from '@animate-ui/vue/primitives/texts/shimmering';

defineProps({
  text: {
    type: String,
    required: true,
  }
});
</script>
