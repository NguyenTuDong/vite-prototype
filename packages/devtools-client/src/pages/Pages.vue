<script setup lang="ts">
import {
  DevToolsMessagingEvents,
  onRpcConnected,
  onViteRpcConnected,
  rpc,
  viteRpc,
  type RouteInfo,
} from "@prototype/devtools-core";
import MainLayout from "../components/MainLayout.vue";
import Button from "../components/common/Button.vue";
import { onUnmounted, ref } from "vue";
import { openInEditor } from "../utils";
import { vTooltip } from "floating-vue";

const routes = ref<RouteInfo[]>([]);
const currentRoute = ref("");

function fetchRoutes() {
  viteRpc.value.getRoutes().then((res) => {
    routes.value = res;
  });
}

function onRouteUpdated() {
  fetchRoutes();
}

function fetchCurrentRoute() {
  rpc.value.getCurrentRoute().then((res) => {
    currentRoute.value = res;
  });
}

function navigate(path: string) {
  rpc.value.navigate(path);
}

onRpcConnected(() => {
  fetchCurrentRoute();
  rpc.functions.on(DevToolsMessagingEvents.ON_NAVIGATE, fetchCurrentRoute);
});

onViteRpcConnected(() => {
  fetchRoutes();
  viteRpc.functions.on(
    DevToolsMessagingEvents.ROUTER_INFO_UPDATED,
    onRouteUpdated,
  );
});

onUnmounted(() => {
  viteRpc.functions.off(
    DevToolsMessagingEvents.ROUTER_INFO_UPDATED,
    onRouteUpdated,
  );
});
</script>

<template>
  <MainLayout title="Pages">
    <template #actions>
      <span class="text-gray-400 text-sm">
        {{ routes.length }} routes registered
      </span>
    </template>

    <div
      v-for="route in routes"
      flex="~ items-center gap-2 wrap"
      p-2
      border="b base"
      class="hover:bg-active"
    >
      <div px-2>
        <div
          v-tooltip="'Click to navigate'"
          class="hover:underline cursor-pointer inline-block"
          :class="currentRoute === route.routePath ? 'text-primary-400' : ''"
          @click="() => navigate(route.routePath)"
        >
          {{ route.routePath }}
        </div>
        <div class="text-xs text-gray-400">
          {{ route.relativePath }}
        </div>
      </div>
      <div ml-auto flex="~ items-center gap-2 wrap">
        <span
          v-if="currentRoute === route.routePath"
          class="bg-primary-400/10 rounded-2 text-xs text-primary-400 px-2 py-0.5 font-bold"
          >active</span
        >
        <Button
          v-tooltip="'Open in Editor'"
          icon="i-ph-arrow-square-out"
          @click="() => openInEditor(route.filePath)"
        />
      </div>
    </div>
  </MainLayout>
</template>
