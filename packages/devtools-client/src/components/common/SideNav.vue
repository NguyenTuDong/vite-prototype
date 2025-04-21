<script setup lang="ts">
import { computed } from "vue";
import SideNavItem from "./SideNavItem.vue";
import Button from "./Button.vue";
import { devtoolsClientState } from "../../composables/state";
import { useDevToolsColorMode } from "../../composables/theme";

const { colorMode } = useDevToolsColorMode();

const isDark = computed({
  get: () => colorMode.value === "dark",
  set: (v) => (colorMode.value = v ? "dark" : "light"),
});

const expandSidebar = computed({
  get: () => devtoolsClientState.value.expandSidebar,
  set: (v) => (devtoolsClientState.value.expandSidebar = v),
});

const navItems: NavItem[] = [
  {
    to: "/overview",
    icon: "i-ph-info-duotone",
    name: "Overview",
  },
  {
    to: "/pages",
    icon: "i-ph-tree-view-duotone",
    name: "Pages",
  },
  {
    to: "/assets",
    icon: "i-ph-images-duotone",
    name: "Assets",
  },
  {
    to: "/linter",
    icon: "i-ph-lightbulb-duotone",
    name: "Linter",
  },
];
</script>

<template>
  <div border="r base" flex="~ col items-start" of-hidden>
    <div
      sticky
      top-0
      z-1
      flex="~ items-center justify-center gap-2"
      w-full
      p2
      border="b base"
    >
      <div
        ref="buttonDocking"
        flex="~ items-center gap-2"
        relative
        h-10
        w-full
        select-none
        p2
        rounded
        v-if="expandSidebar"
      >
        <span class="w-5 h-5 i-mdi-tools"></span>
        <span font-600> DevTools </span>
      </div>
      <div v-if="expandSidebar" flex-auto />
      <Button
        :icon="
          expandSidebar ? 'i-tabler-arrow-bar-left' : 'i-tabler-arrow-bar-right'
        "
        @click="expandSidebar = !expandSidebar"
      >
      </Button>
    </div>

    <div flex="~ auto col gap-0.5 items-center" w-full of-x-hidden of-y-auto p2>
      <SideNavItem v-for="(item, key) in navItems" :key="key" :item="item" />
      <div flex-auto />
    </div>

    <div sticky bottom-0 z-1 w-full p2>
      <Button
        class="w-full"
        :icon="isDark ? 'i-ph-moon-duotone' : 'i-ph-sun-duotone'"
        @click="isDark = !isDark"
      >
        <template v-if="expandSidebar">
          {{ isDark ? "Dark" : "Light" }}
        </template>
      </Button>
    </div>
  </div>
</template>
