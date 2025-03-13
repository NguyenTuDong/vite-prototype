<script setup lang="ts">
import { computed, ref } from "vue";
import {
  useFrameState,
  useIframe,
  usePanelVisible,
  usePosition,
} from "./composables";
import { checkIsSafari } from "./utils";
import { getDevToolsClientUrl } from "@prototype/devtools-core";
import FrameBox from "./FrameBox.vue";

type ViewMode = "xs" | "default" | "fullscreen";
const anchorEle = ref<HTMLDivElement>();
const panelEle = ref<HTMLDivElement>();
const panelState = ref<{
  viewMode: ViewMode;
}>({
  viewMode: "default",
});
const overlayVisible = ref(true);

const cssVars = computed(() => {
  const dark = true;
  return {
    "--prototype-devtools-widget-bg": dark ? "#121212" : "#ffffff",
    "--prototype-devtools-widget-fg": dark ? "#F5F5F5" : "#111",
    "--prototype-devtools-widget-border": dark ? "#3336" : "#efefef",
    "--prototype-devtools-widget-shadow": dark
      ? "rgba(0,0,0,0.3)"
      : "rgba(128,128,128,0.1)",
  };
});

const clientUrl = getDevToolsClientUrl();

const {
  onPointerDown,
  bringUp,
  anchorStyle,
  iframeStyle,
  isDragging,
  isVertical,
  isHidden,
  panelStyle,
} = usePosition(panelEle);
const { togglePanelVisible, closePanel, panelVisible } = usePanelVisible();
const { state } = useFrameState();

const {
  // iframe,
  getIframe,
} = useIframe(clientUrl, async () => {
  const iframe = getIframe();
  // setIframeServerContext(iframe)
  await waitForClientInjection(iframe);
});

function waitForClientInjection(
  iframe: HTMLIFrameElement,
): Promise<void> | void {
  return new Promise((resolve) => {
    iframe?.contentWindow?.postMessage(
      "__PROTOTYPE_DEVTOOLS_CREATE_CLIENT__",
      "*",
    );

    window.addEventListener("message", (data) => {
      if (data.data === "__PROTOTYPE_DEVTOOLS_CLIENT_READY__") resolve();
    });
  });
}
</script>

<template>
  <div
    v-show="state.preferShowFloatingPanel ? overlayVisible : panelVisible"
    ref="anchorEle"
    class="devtools__anchor"
    :style="[anchorStyle, cssVars]"
    :class="{
      'devtools__anchor--vertical': isVertical,
      'devtools__anchor--hide': isHidden,
      fullscreen: panelState.viewMode === 'fullscreen',
      'reduce-motion': state.reduceMotion,
    }"
    @mousemove="bringUp"
  >
    <div
      v-if="!checkIsSafari()"
      class="devtools__anchor--glowing"
      :style="isDragging ? 'opacity: 0.6 !important' : ''"
    />

    <div
      ref="panelEle"
      class="devtools__panel"
      :style="panelStyle"
      @pointerdown="onPointerDown"
    >
      <div
        class="devtools__anchor-btn panel-entry-btn"
        title="Toggle Prototype DevTools"
        aria-label="Toggle devtools panel"
        :style="panelVisible ? '' : 'filter:saturate(0)'"
        @click="togglePanelVisible"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="m21.71 20.29l-1.42 1.42a1 1 0 0 1-1.41 0L7 9.85A3.8 3.8 0 0 1 6 10a4 4 0 0 1-3.78-5.3l2.54 2.54l.53-.53l1.42-1.42l.53-.53L4.7 2.22A4 4 0 0 1 10 6a3.8 3.8 0 0 1-.15 1l11.86 11.88a1 1 0 0 1 0 1.41M2.29 18.88a1 1 0 0 0 0 1.41l1.42 1.42a1 1 0 0 0 1.41 0l5.47-5.46l-2.83-2.83M20 2l-4 2v2l-2.17 2.17l2 2L18 8h2l2-4Z"
          />
        </svg>
      </div>
    </div>

    <!-- iframe -->
    <FrameBox
      :style="iframeStyle"
      :is-dragging="isDragging"
      :client="{
        close: closePanel,
        getIFrame: getIframe,
      }"
      :view-mode="panelState.viewMode"
    />
  </div>
</template>

<style scoped lang="scss">
.devtools {
  // anchor
  &__anchor {
    position: fixed;
    z-index: 2147483645;
    transform-origin: center center;
    transform: translate(-50%, -50%) rotate(0);

    &.reduce-motion {
      transition: none !important;
      animation: none !important;
      * {
        transition: none !important;
        animation: none !important;
      }
    }

    &.fullscreen {
      transform: none !important;
      left: 0 !important;
    }

    &-btn {
      border-radius: 100%;
      border-width: 0;
      width: 30px;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0.8;
      transition: opacity 0.2s ease-in-out;

      &:hover {
        opacity: 1;
      }

      svg {
        width: 14px;
        height: 14px;
      }

      &.active {
        cursor: pointer;
      }
    }

    .panel-entry-btn {
      cursor: pointer;
      flex: none;
    }

    &--vertical {
      .panel-entry-btn {
        transform: rotate(-90deg);
      }

      .devtools__panel {
        transform: translate(-50%, -50%) rotate(90deg);
        box-shadow: 2px -2px 8px var(--prototype-devtools-widget-shadow);
      }
    }

    &--hide {
      .devtools__panel {
        max-width: 32px;
        padding: 2px 0;
      }

      .devtools__panel-content {
        opacity: 0;
      }
    }

    &--glowing {
      position: absolute;
      left: 0;
      top: 0;
      transform: translate(-50%, -50%);
      width: 160px;
      height: 160px;
      opacity: 0;
      transition: all 1s ease;
      pointer-events: none;
      z-index: -1;
      border-radius: 9999px;
      background-image: linear-gradient(45deg, #00dc82, #00dc82, #00dc82);
      filter: blur(60px);
    }

    &:hover {
      .devtools__anchor--glowing {
        opacity: 0.6;
      }
    }
  }

  // panel
  &__panel {
    position: absolute;
    left: 0;
    top: 0;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: flex-start;
    overflow: hidden;
    align-items: center;
    gap: 2px;
    height: 30px;
    padding: 4px 4px 4px 5px;
    box-sizing: border-box;
    border: 1px solid var(--prototype-devtools-widget-border);
    border-radius: 20px;
    background-color: var(--prototype-devtools-widget-bg);
    backdrop-filter: blur(10px);
    color: var(--prototype-devtools-widget-fg);
    box-shadow: 2px 2px 8px var(--prototype-devtools-widget-shadow);
    user-select: none;
    max-width: 150px;
    transition:
      max-width 0.4s ease,
      padding 0.5s ease,
      transform 0.3s ease,
      all 0.4s ease;

    &-content {
      transition: opacity 0.4s ease;
    }

    &-divider {
      border-left: 1px solid #8883;
      width: 1px;
      height: 10px;
    }
  }
}

@keyframes blink {
  0% {
    opacity: 0.2;
  }

  50% {
    opacity: 0.6;
  }

  100% {
    opacity: 0.2;
  }
}
</style>
