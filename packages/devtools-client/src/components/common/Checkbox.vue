<script setup lang="ts">
import { useVModel } from "@vueuse/core";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const value = useVModel(props, "modelValue", emit);
</script>

<template>
  <div
    class="relative base h5 w5 if-cc cursor-pointer border-0.125rem border-base rounded-1.25 transition-colors duration-200 ease-in-out"
    :class="[value ? 'bg-primary-300 dark:bg-primary-400' : 'bg-active']"
    @click="value = !value"
  >
    <div
      :class="[value ? 'opacity-100' : 'opacity-0']"
      class="h-60% w-35% transform-translate-y--0.25 transform-rotate-45 border-width-[0_0.125rem_0.125rem_0] border-white border-solid transition-opacity duration-200 ease-in-out"
    />
  </div>
</template>
