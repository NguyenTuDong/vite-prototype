<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { VueNotificationOptions } from "../composables/notification";

type NotificationType = NonNullable<VueNotificationOptions["type"]>;

const props = withDefaults(defineProps<VueNotificationOptions>(), {
  placement: "bottom-center",
  type: "info",
  duration: 3000,
});

const icons: Record<NotificationType, string> = {
  success: "i-ph-check-circle-duotone",
  info: "i-ph-info-duotone",
  warning: "i-ph-warning-duotone",
  error: "i-ph-x-circle-duotone",
};

const typeClasses: Record<NotificationType, string> = {
  success: "text-green-500 dark:text-green-200",
  info: "text-blue-4 dark:text-blue-2",
  warning: "text-amber-4",
  error: "text-red-4",
};

const show = ref(false);

onMounted(() => {
  show.value = true;
  setTimeout(() => {
    show.value = false;
  }, props.duration);
});

const transitionClass = computed(() =>
  props.placement.startsWith("top") ? "translate-y--300%" : "translate-y-300%",
);
</script>

<template>
  <div
    class="fixed left-0 right-0 z-max-override text-center pointer-events-none"
    :class="[
      { 'top-0': placement.startsWith('top') },
      { 'bottom-0': placement.startsWith('bottom') },
    ]"
  >
    <Transition
      :enter-from-class="transitionClass"
      :leave-to-class="transitionClass"
      @after-leave="
        () => {
          if (!show) {
            onClose?.();
          }
        }
      "
    >
      <div
        v-if="show"
        class="flex transition-all duration-300"
        :style="{
          justifyContent: placement.includes('right')
            ? 'right'
            : placement.includes('left')
              ? 'left'
              : 'center',
        }"
      >
        <div
          class="m6 flex-inline items-center gap2 b-1 border-base rounded-2 px3 py1 shadow-xl transition-all duration-300 bg-base pointer-events-auto"
          :class="[classes, typeClasses[type]]"
        >
          <div :class="icons[type]" />
          <div>{{ message }}</div>
        </div>
      </div>
    </Transition>
  </div>
</template>
