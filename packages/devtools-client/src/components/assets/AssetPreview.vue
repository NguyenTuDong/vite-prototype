<script setup lang="ts">
import type { AssetInfo } from "prototype-devtools-core";
import AssetFontPreview from "./AssetFontPreview.vue";

defineProps<{
  asset: AssetInfo;
  textContent?: string;
  detail?: boolean;
}>();
</script>

<template>
  <div flex items-center justify-center of-hidden bg-active object-cover p1>
    <template v-if="asset.type === 'image'">
      <img :src="asset.publicPath" />
    </template>
    <AssetFontPreview
      v-else-if="asset.type === 'font'"
      :key="asset.publicPath"
      :asset="asset"
      self-stretch
      p2
      text-2xl
    />
    <div
      v-else-if="asset.type === 'text' && !textContent"
      i-ph-file
      text-3xl
      op20
    />
    <div v-else-if="asset.type === 'text' && textContent" w-full self-start p4>
      <pre max-h-10rem of-hidden text-xs font-mono v-text="textContent" />
    </div>
    <div v-else-if="asset.type === 'video'">
      <video :src="asset.publicPath" :autoplay="detail" :controls="detail" />
    </div>
    <div v-else-if="asset.type === 'audio'">
      <div v-if="!detail" i-ph-file-audio text-3xl op20 />
      <audio v-else :src="asset.publicPath" controls />
    </div>
    <div
      v-else-if="asset.type === 'wasm'"
      i-vscode-icons-file-type-wasm
      text-3xl
    />
    <div v-else i-carbon-help text-3xl op20 />
  </div>
</template>
