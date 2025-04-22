<script setup lang="ts">
import { ref } from "vue";
import {
  DevToolsMessagingEvents,
  onViteRpcConnected,
  viteRpc,
  isMacOS,
  rpc,
  isInIframe,
} from "prototype-devtools-core";
import { useRouter } from "vue-router";
import Button from "../components/common/Button.vue";

const router = useRouter();
const routeCount = ref(0);
const assetCount = ref(0);
const lintCount = ref(0);

function getRouteCount() {
  viteRpc.value.getRoutes().then((res) => {
    routeCount.value = res.length;
  });
}

function getAssetCount() {
  viteRpc.value.getStaticAssets().then((res) => {
    assetCount.value = res.length;
  });
}

function getLinterCount() {
  viteRpc.value.getLinter().then((res) => {
    lintCount.value = res.reduce((r, v) => {
      r += v.errorCount + v.warningCount;
      return r;
    }, 0);
  });
}

onViteRpcConnected(() => {
  getRouteCount();
  getAssetCount();
  getLinterCount();

  viteRpc.functions.on(
    DevToolsMessagingEvents.ROUTER_INFO_UPDATED,
    getRouteCount,
  );
  viteRpc.functions.on(
    DevToolsMessagingEvents.ASSETS_INFO_UPDATED,
    getAssetCount,
  );
  viteRpc.functions.on(
    DevToolsMessagingEvents.LINTER_INFO_UPDATED,
    getLinterCount,
  );
});

function openInNewWindow() {
  rpc.value.openInNewTab(undefined, "height=570,width=1200").then(() => {
    rpc.value.emit(DevToolsMessagingEvents.TOGGLE_PANEL);
  });
}
</script>
<template>
  <div flex="~ col" of-x-hidden of-y-auto>
    <div border="b base" flex="~ col items-center justify-center grow-1" p6>
      <div
        flex="~ items-center justify-center gap-2"
        relative
        h-10
        w-full
        select-none
      >
        <span class="w-10 h-10 flex-shrink-0 i-mdi-tools"></span>
        <span font-600 text-4xl> DevTools </span>
      </div>
    </div>

    <div flex border="b base">
      <div
        flex="~ col 1 items-center gap-2"
        p4
        cursor-pointer
        border="r base"
        op75
        class="hover:bg-active hover:op100"
        @click="() => router.push('/pages')"
      >
        <span class="w-10 h-10 i-ph-tree-view-duotone"></span>
        <span>{{ routeCount }} pages</span>
      </div>

      <div
        flex="~ col 1 items-center gap-2"
        p4
        cursor-pointer
        border="r base"
        op75
        class="hover:bg-active hover:op100"
        @click="() => router.push('/assets')"
      >
        <span class="w-10 h-10 i-ph-images-duotone"></span>
        <span>{{ assetCount }} assets</span>
      </div>

      <div
        flex="~ col 1 items-center gap-2"
        p4
        cursor-pointer
        op75
        class="hover:bg-active hover:op100"
        @click="() => router.push('/linter')"
      >
        <span class="w-10 h-10 i-ph-lightbulb-duotone"></span>
        <span>{{ lintCount }} issues</span>
      </div>
    </div>

    <div flex border="b base">
      <a
        href="https://github.com/NguyenTuDong/vite-prototype"
        target="_blank"
        flex="~ 1 items-center justify-center gap-2"
        p4
        cursor-pointer
        border="r base"
        op75
        class="hover:bg-active hover:op100"
      >
        <span class="w-5 h-5 i-ph-star-duotone"></span>
        <span>Star on GitHub</span>
      </a>

      <a
        href="https://github.com/NguyenTuDong/vite-prototype/issues"
        target="_blank"
        flex="~ 1 items-center justify-center gap-2"
        p4
        cursor-pointer
        op75
        class="hover:bg-active hover:op100"
      >
        <span class="w-5 h-5 i-ph-bug-beetle-duotone"></span>
        <span>Bug Reports</span>
      </a>
    </div>

    <div flex="~ col items-center justify-center gap-6" p-8>
      <div flex="~ gap-1" cursor-default text-sm op50>
        Press
        <template v-if="isMacOS()">
          <kbd> ⇧ Shift </kbd>
          <span>+</span>
          <kbd> ⌥ Option </kbd>
          <span>+</span>
          <kbd> D </kbd>
        </template>
        <template v-else>
          <kbd> Shift </kbd>
          <span>+</span>
          <kbd> Alt </kbd>
          <span>+</span>
          <kbd> D </kbd>
        </template>
        to toggle DevTools
      </div>

      <Button
        v-if="isInIframe"
        icon="i-ph-arrow-square-out"
        @click="openInNewWindow"
      >
        Open in New window
      </Button>
    </div>
  </div>
</template>
