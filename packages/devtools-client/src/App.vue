<script setup lang="ts">
import { viteRpc, onViteRpcConnected, rpc } from "@prototype/devtools-core";
// import AppConnecting from "./components/AppConnecting.vue";
import SideNav from "./components/common/SideNav.vue";
import { useEventListener } from "@vueuse/core";
import { useDevToolsColorMode } from "./composables/theme";

useDevToolsColorMode();

onViteRpcConnected(async () => {
  console.log(await viteRpc.value.getLinter());
});

useEventListener("keydown", async (e) => {
  if (e.code === "KeyD" && e.altKey && e.shiftKey) {
    rpc.value.emit("toggle-panel");
  }
});
</script>

<template>
  <main class="fixed h-screen w-screen glass-effect text-base p-2">
    <div class="bg-card rounded-22px h-full">
      <!-- <AppConnecting /> -->
      <div
        class="h-full of-auto transition-base"
        :class="'grid grid-cols-[250px_1fr]'"
        h-full
        of-hidden
        font-sans
      >
        <SideNav />
        <div>Home</div>
      </div>
    </div>
  </main>
</template>
