<script setup lang="ts">
import { viteRpc, type AssetInfo } from "prototype-devtools-core";
import { computedAsync, useTimeAgo, useVModel } from "@vueuse/core";
import { computed, ref } from "vue";
import AssetPreview from "./AssetPreview.vue";
import Button from "../common/Button.vue";
import CopyText from "../common/CopyText.vue";
import { openInEditor } from "../../utils";

const props = defineProps<{
  modelValue: AssetInfo;
}>();
const emit = defineEmits<{ (...args: any): void }>();

const asset = useVModel(props, "modelValue", emit, { passive: true });

const supportsPreview = computed(() => {
  return ["image", "text", "video", "audio", "font"].includes(asset.value.type);
});

const newTextContent = ref();
const textContentCounter = ref(0);
const textContent = computedAsync(async () => {
  if (asset.value.type !== "text") return undefined;

  textContentCounter.value;

  const content = await viteRpc.value
    .getTextAssetContent(asset.value.filePath)
    .then((res) => res);
  newTextContent.value = content;
  return content;
});

const imageMeta = computedAsync(() => {
  if (asset.value.type !== "image") return undefined;

  return viteRpc.value.getImageMeta(asset.value.filePath).then((res) => res);
});

const timeAgo = useTimeAgo(() => asset.value.mtime);
const fileSize = computed(() => {
  const size = asset.value.size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
});

const aspectRatio = computed(() => {
  if (!imageMeta.value?.width || !imageMeta.value?.height) return "";
  const gcd = (a: number, b: number): number => {
    if (!b) return a;
    return gcd(b, a % b);
  };
  const ratio = gcd(imageMeta.value.width, imageMeta.value.height);
  if (ratio > 3)
    return `${imageMeta.value.width / ratio}:${imageMeta.value.height / ratio}`;
  return "";
});
</script>

<template>
  <div p-2>
    <template v-if="supportsPreview">
      <div flex="~" items-center justify-center>
        <AssetPreview
          detail
          max-h-80
          min-h-20
          min-w-20
          w-auto
          rounded
          border="~ base"
          :asset="asset"
          :text-content="textContent"
        />
      </div>
    </template>

    <div flex="~ items-center gap2" py-2 op50>
      <div x-divider />
      <div flex-none>Details</div>
      <div x-divider />
    </div>

    <div px-2>
      <table max-w-full w-full table-fixed>
        <tbody>
          <tr>
            <td w-30 ws-nowrap pr5 text-right align-baseline op50>Filepath</td>
            <td>
              <div flex="~ gap-1" w-full items-center>
                <span flex-auto break-all>
                  <CopyText :text="asset.filePath" />
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td w-30 ws-nowrap pr5 text-right align-baseline op50>
              Public Path
            </td>
            <td>
              <div flex="~ gap-1" w-full items-center>
                <div flex-auto break-all>
                  <CopyText :text="asset.publicPath" />
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td w-30 ws-nowrap pr5 text-right op50>Type</td>
            <td capitalize>
              {{ asset.type }}
            </td>
          </tr>
          <template v-if="imageMeta?.width">
            <tr>
              <td w-30 ws-nowrap pr5 text-right op50>Image Size</td>
              <td>{{ imageMeta.width }} x {{ imageMeta.height }}</td>
            </tr>
            <tr v-if="aspectRatio">
              <td w-30 ws-nowrap pr5 text-right op50>Aspect Ratio</td>
              <td>{{ aspectRatio }}</td>
            </tr>
          </template>
          <tr>
            <td w-30 ws-nowrap pr5 text-right op50>File size</td>
            <td>{{ fileSize }}</td>
          </tr>
          <tr>
            <td w-30 ws-nowrap pr5 text-right op50>Last modified</td>
            <td>
              {{ new Date(asset.mtime).toLocaleString() }}
              <span op70>({{ timeAgo }})</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div flex="~ items-center gap2" py-2 op50>
      <div x-divider />
      <div flex-none>Actions</div>
      <div x-divider />
    </div>

    <div flex="~ gap-2 wrap">
      <RouterLink :to="asset.publicPath" target="_blank">
        <Button icon="i-ph-arrow-square-out"> Open in Browser </Button>
      </RouterLink>
      <Button
        icon="i-ph-arrow-square-out"
        @click="() => openInEditor(asset.filePath)"
      >
        Open in Editor
      </Button>
    </div>
  </div>
</template>
