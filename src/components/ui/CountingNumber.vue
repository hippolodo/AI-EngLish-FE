<template>
  <CountingNumberPrimitive :number="number" :from-number="fromNumber" v-bind="$attrs" />
</template>

<script setup>
import { CountingNumber as CountingNumberPrimitive } from '@animate-ui/vue/primitives/texts/counting-number';

defineProps({
  number: {
    type: Number,
    required: true,
  },
  fromNumber: {
    type: Number,
    default: 0,
  }
});
</script>
