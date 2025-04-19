<script setup lang="ts">
import { type LinterResult } from "@prototype/devtools-core";
import { openInEditor } from "../../utils";

defineProps<{
  title: string;
  errorsByFile: LinterResult;
}>();

function severityClass(severity: string) {
  return severity === "error"
    ? "text-red-600 i-ph-warning-circle-duotone"
    : severity === "warning"
      ? "text-yellow-600 i-ph-warning-duotone"
      : "text-green-600 i-ph-warning-octagon-duotone";
}
</script>

<template>
  <div border="b base" class="px-4 py-2">
    <h2 class="text-lg font-semibold text-primary-400">[{{ title }}]</h2>
  </div>

  <div
    v-for="(errors, relativeFilePath) in errorsByFile"
    :key="relativeFilePath"
    border="b base"
  >
    <div class="flex items-center justify-between gap-2 px-4 py-2">
      <div
        class="flex items-center gap-2 font-mono text-sm text-green-600 break-all"
      >
        {{ relativeFilePath }}
      </div>
      <span class="flex-shrink-0 text-gray-400 text-sm"
        >{{ errors.length }} issues</span
      >
    </div>

    <div
      v-for="(error, index) in errors"
      :key="index"
      class="px-4 pb-2 text-sm space-y-1"
    >
      <div class="flex items-center gap-2">
        <span :class="severityClass(error.severity)"></span>
        <div
          @click="
            () => openInEditor(`${error.file}:${error.line}:${error.column}`)
          "
          class="text-primary-400 underline cursor-pointer"
        >
          {{ error.line }}:{{ error.column }}
        </div>
        <div>{{ error.message }}</div>
        <div class="text-xs text-gray-500">{{ error.rule }}</div>
      </div>
    </div>
  </div>
</template>
