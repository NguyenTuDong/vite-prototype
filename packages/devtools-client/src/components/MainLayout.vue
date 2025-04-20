<script setup lang="ts">
import { ref } from "vue";
import Button from "./common/Button.vue";
import { useElementSize } from "@vueuse/core";
defineProps<{
  title: string;
  hasBackButton?: boolean;
  openDrawer?: boolean;
}>();
defineEmits<{
  back: () => void;
}>();
const navbar = ref<HTMLElement>();

const { height } = useElementSize(() => navbar.value, undefined, {
  box: "border-box",
});
</script>

<template>
  <div flex="~ col" of-hidden relative>
    <div
      ref="navbar"
      border="b base"
      flex="~ items-center wrap gap-2"
      px-4
      py-2
    >
      <div h-10 flex="~ items-center gap-2">
        <Button
          v-if="hasBackButton"
          icon="i-tabler-chevron-left"
          class="-ml-2"
          @click="$emit('back')"
        ></Button>
        <h1 class="text-xl font-bold">{{ title }}</h1>
      </div>
      <div flex="~ items-center wrap justify-end gap-2" ml-auto>
        <slot name="actions" />
      </div>
    </div>

    <div of-x-hidden :class="openDrawer ? 'of-y-hidden' : 'of-y-auto'">
      <slot />
    </div>

    <div
      v-if="openDrawer"
      absolute
      z-10
      left-0
      w-full
      h-full
      of-x-hidden
      of-y-auto
      :style="{
        top: `${height}px`,
        height: `calc(100% - ${height}px)`,
      }"
    >
      <slot name="drawer" />
    </div>
  </div>
</template>
