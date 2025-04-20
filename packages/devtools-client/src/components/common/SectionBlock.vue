<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import IconTitle from "./IconTitle.vue";

const props = withDefaults(
  defineProps<{
    icon?: string;
    text: string;
    description?: string;
    containerClass?: string;
    collapse?: boolean;
    open?: boolean;
    padding?: boolean | string;
  }>(),
  {
    containerClass: "",
    open: true,
    padding: true,
    collapse: true,
  },
);

const open = useVModel(props, "open", undefined, { passive: true });
function onToggle(e: any) {
  open.value = e.target?.open;
}
</script>

<template>
  <details :open="open" @toggle="onToggle">
    <summary
      class="cursor-pointer select-none hover:bg-active px-4 py-2 border-b border-base"
      :class="collapse ? '' : 'pointer-events-none'"
    >
      <IconTitle
        :icon="icon"
        :text="text"
        transition
        :class="open ? 'op100' : 'op60'"
      >
        <div text-base text-lg>
          <slot name="text">
            {{ text }}
          </slot>
        </div>
        <div class="flex-auto" />
        <div v-if="description || $slots.description" text-sm op50>
          <slot name="description">
            {{ description }}
          </slot>
        </div>
        <slot name="actions" />
        <span
          v-if="collapse"
          class="i-tabler-chevron-down chevron"
          op75
          transition
          duration-500
        />
      </IconTitle>
    </summary>
    <div
      v-lazy-show="open"
      class="flex flex-col flex-gap2 p-4"
      :class="typeof padding === 'string' ? padding : padding ? 'px4' : ''"
    >
      <slot name="details" />
      <div :class="containerClass" class="mt1">
        <slot />
      </div>
      <slot name="footer" />
    </div>
  </details>
  <div class="x-divider" />
</template>

<style scoped>
summary {
  list-style: none;
}

details:not([open]) summary {
  --at-apply: border-none;
}

details summary::-webkit-details-marker {
  display: none;
}

details[open] .chevron {
  transform: rotate(180deg);
  opacity: 0.75;
}
</style>
