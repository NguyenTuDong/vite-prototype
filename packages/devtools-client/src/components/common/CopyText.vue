<script setup lang="ts">
import { useCopy } from "../../composables/copy";
import { vTooltip } from "floating-vue";

defineProps<{
  text: string;
}>();

const { copy } = useCopy();
</script>

<template>
  <span
    v-tooltip="'Click to copy'"
    class="hover:underline cursor-pointer"
    @click="copy(text)"
  >
    {{ text }}
  </span>
</template>
