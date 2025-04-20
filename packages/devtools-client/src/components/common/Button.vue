<script setup lang="ts">
defineProps<{
  icon?: string;
}>();
</script>

<template>
  <div
    flex="inline items-center gap-2"
    rounded-2
    select-none
    h-10
    px-2
    border
    border-transparent
    op-75
    cursor-pointer
    class="hover:op-100 hover:bg-active"
  >
    <span class="w-5 h-5" :class="icon"></span>
    <slot />
  </div>
</template>
