<script setup lang="ts">
import type { AssetInfo } from "@prototype/devtools-core";
import { useVModel } from "@vueuse/core";
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    item: any;
    index?: number;
    modelValue: AssetInfo | undefined;
  }>(),
  {
    index: 0,
  },
);

const emit = defineEmits<{ (...args: any): void }>();
const model = useVModel(props, "modelValue", emit, { passive: true });

const isCollection = computed(() => props.item?.children?.length);

const open = ref(true);

const icon = computed(() => {
  if (isCollection.value) return open.value ? "i-ph-folder-open" : "i-ph-folder";
  if (props.item.type === "image") return "i-ph-file-image";
  if (props.item.type === "video") return "i-ph-file-video";
  if (props.item.type === "audio") return "i-ph-file-audio";
  if (props.item.type === "font") return "i-ph-text-aa";
  if (props.item.type === "text") return "i-ph-file-text";
  if (props.item.type === "wasm") return "i-vscode-icons-file-type-wasm";
  return "i-ph-file";
});
</script>

<template>
  <div>
    <button
      flex="~ gap-2"
      w-full
      items-center
      hover="bg-active"
      px4
      py1
      :style="{ paddingLeft: `calc(1rem + ${index * 1.5}em)` }"
      :class="{
        'bg-active': !isCollection && model?.filePath === item?.filePath,
      }"
      border="b base"
      @click="isCollection ? (open = !open) : (model = item)"
    >
      <div :class="icon" />
      <span
        :class="{ 'flex items-center': isCollection }"
        flex-auto
        text-start
        text-sm
      >
        {{ item.path }}
      </span>
    </button>
    <slot v-if="open">
      <AssetListItem
        v-for="subItem in item?.children"
        :key="subItem.filepath"
        v-model="model"
        :item="subItem"
        :index="index + 1"
      />
    </slot>
  </div>
</template>
