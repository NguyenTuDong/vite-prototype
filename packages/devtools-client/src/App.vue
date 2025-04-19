<script setup lang="ts">
import { rpc } from "@prototype/devtools-core";
import { RouterView, useRoute, useRouter } from "vue-router";
// import AppConnecting from "./components/AppConnecting.vue";
import SideNav from "./components/common/SideNav.vue";
import { useEventListener } from "@vueuse/core";
import { useDevToolsColorMode } from "./composables/theme";
import { devtoolsClientState } from "./composables/state";
import { computed } from "vue";

useDevToolsColorMode();
const clientState = devtoolsClientState;
const router = useRouter();
const route = useRoute();

const sidebarExpanded = computed(() => clientState.value.expandSidebar);

router.replace(clientState.value.route);
router.afterEach(() => {
  const path = route.path;
  if (path.includes("__")) return;
  clientState.value.route = path;
});

useEventListener("keydown", async (e) => {
  if (e.code === "KeyD" && e.altKey && e.shiftKey) {
    rpc.value.emit("toggle-panel");
  }
});
</script>

<template>
  <main
    fixed
    h-screen
    w-screen
    class="bg-[#ffffff]/90 dark:bg-[#0E0E0E]/90 backdrop-blur-20px text-base"
  >
    <!-- <AppConnecting /> -->
    <div
      class="h-full of-auto transition-base"
      :class="
        sidebarExpanded
          ? 'grid grid-cols-[250px_1fr]'
          : 'grid grid-cols-[55px_1fr]'
      "
      h-full
      of-hidden
      font-sans
    >
      <SideNav />
      <div flex="~ col" of-hidden>
        <RouterView />
      </div>
    </div>
  </main>
</template>
