import { useEventListener } from "@vueuse/core";
import { computed, onMounted } from "vue";
import { useFrameState } from "./state";

export function usePanelVisible() {
  const { state, updateState } = useFrameState();
  const visible = computed({
    get() {
      return state.value.open;
    },
    set(value) {
      updateState({
        open: value,
      });
    },
  });

  const toggleVisible = (state?: boolean) => {
    visible.value = state ?? !visible.value;
  };

  const closePanel = () => {
    if (!visible.value) return;
    visible.value = false;
  };

  onMounted(() => {
    useEventListener(window, "keydown", (e) => {
      // cmd + shift + D in <macOS>
      // alt + shift + D in <Windows>
      if (e.code === "KeyD" && e.altKey && e.shiftKey) toggleVisible();
    });
  });

  return {
    panelVisible: visible,
    togglePanelVisible: toggleVisible,
    closePanel,
  };
}
