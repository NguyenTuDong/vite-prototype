<script setup lang="ts">
import {
  onViteRpcConnected,
  viteRpc,
  type LinterResult,
} from "@prototype/devtools-core";
import { onUnmounted, ref } from "vue";
import MainLayout from "../components/MainLayout.vue";
import ErrorGroup from "../components/linter/ErrorGroup.vue";

type Reports = Record<string, LinterResult>;

const reports = ref<Reports>();

function getLinter() {
  viteRpc.value.getLinter().then((results) => {
    const formated: Reports = {};

    results.forEach((res) => {
      formated[res.linter] = res.results;
    });
    reports.value = formated;
  });
}

function onLinterUpdated() {
  getLinter();
}

onViteRpcConnected(async () => {
  getLinter();
  viteRpc.functions.on("linterUpdated", onLinterUpdated);
});

onUnmounted(() => {
  viteRpc.functions.off("linterUpdated", onLinterUpdated);
});
</script>

<template>
  <MainLayout title="Lint Reports">
    <ErrorGroup
      v-for="(errors, linter) in reports"
      :key="linter"
      :title="linter"
      :errorsByFile="errors"
    />
  </MainLayout>
</template>
