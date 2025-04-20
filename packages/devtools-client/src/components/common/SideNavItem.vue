<script setup lang="ts">
import { computed } from "vue";
import { devtoolsClientState } from "../../composables/state";

const props = withDefaults(
  defineProps<{
    item: NavItem;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const to = computed(() => props.item.to);
const sidebarExpanded = computed(() => devtoolsClientState.value.expandSidebar);
</script>

<template>
  <RouterLink
    :to="to"
    w-full
    h-10
    flex="~ shrink-0 items-center justify-center gap-2"
    rounded-2
    op75
    px2
    border="~ transparent"
    class="hover:op-100 hover:bg-active"
    exact-active-class="bg-active border-base! op-100! group is-active"
  >
    <span
      :class="props.item.icon"
      class="w-5 h-5 group-[.is-active]:text-primary-300 dark:group-[.is-active]:text-primary-400"
    ></span>
    <template v-if="sidebarExpanded">
      {{ props.item.name }}
      <div flex-auto />
    </template>
  </RouterLink>
</template>
