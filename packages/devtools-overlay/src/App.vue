<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import {
  useDevToolsColorMode,
  useFrameState,
  useIframe,
  usePanelVisible,
  usePosition,
} from "./composables";
import { checkIsSafari } from "./utils";
import {
  DevToolsMessagingEvents,
  getDevToolsClientUrl,
  onViteRpcConnected,
  rpcServer,
  setIframeServerContext,
  viteRpc,
} from "prototype-devtools-core";
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

const { colorMode: mode } = useDevToolsColorMode({
  selector: anchorEle,
});

const linterResult = reactive<{
  error: number;
  warning: number;
}>({
  error: 0,
  warning: 0,
});

const cssVars = computed(() => {
  const dark = mode.value === "dark";
  return {
    "--prototype-devtools-widget-bg": dark
      ? "rgba(18, 18, 18, 0.8)"
      : "rgba(255, 255, 255, 0.7)",
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

const { getIframe } = useIframe(clientUrl, async () => {
  const iframe = getIframe();
  setIframeServerContext(iframe);
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

onMounted(() => {
  rpcServer.functions.on(
    DevToolsMessagingEvents.TOGGLE_PANEL,
    togglePanelVisible,
  );
});

onUnmounted(() => {
  rpcServer.functions.off(
    DevToolsMessagingEvents.TOGGLE_PANEL,
    togglePanelVisible,
  );
});

function getLinter() {
  viteRpc.value.getLinter().then((result) => {
    let totalError = 0;
    let totalWarning = 0;

    result.forEach((linter) => {
      totalError += linter.errorCount;
      totalWarning += linter.warningCount;
    });

    linterResult.error = totalError;
    linterResult.warning = totalWarning;
  });
}

function onLinterUpdated() {
  getLinter();
}

onViteRpcConnected(async () => {
  getLinter();
  viteRpc.functions.on(
    DevToolsMessagingEvents.LINTER_INFO_UPDATED,
    onLinterUpdated,
  );
});

onUnmounted(() => {
  viteRpc.functions.off(
    DevToolsMessagingEvents.LINTER_INFO_UPDATED,
    onLinterUpdated,
  );
});
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
      @click="() => togglePanelVisible()"
    >
      <div
        class="devtools__anchor-btn panel-entry-btn"
        title="Toggle Prototype DevTools"
        aria-label="Toggle devtools panel"
        :style="panelVisible ? '' : 'filter:saturate(0)'"
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
      <template v-if="linterResult.error || linterResult.warning">
        <div class="devtools__panel-content devtools__panel-divider" />
        <div class="devtools__panel-content devtools__panel-linter">
          <span v-if="linterResult.error" class="error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m0-4q.425 0 .713-.288T13 12V8q0-.425-.288-.712T12 7t-.712.288T11 8v4q0 .425.288.713T12 13m0 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"
              />
            </svg>
            <span class="number">
              {{ linterResult.error }}
            </span>
          </span>
          <span v-if="linterResult.warning" class="warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M2.725 21q-.275 0-.5-.137t-.35-.363t-.137-.488t.137-.512l9.25-16q.15-.25.388-.375T12 3t.488.125t.387.375l9.25 16q.15.25.138.513t-.138.487t-.35.363t-.5.137zM12 18q.425 0 .713-.288T13 17t-.288-.712T12 16t-.712.288T11 17t.288.713T12 18m0-3q.425 0 .713-.288T13 14v-3q0-.425-.288-.712T12 10t-.712.288T11 11v3q0 .425.288.713T12 15"
              />
            </svg>
            <span class="number">
              {{ linterResult.warning }}
            </span>
          </span>
        </div>
      </template>
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

        &-linter {
          svg {
            transform: rotate(-90deg);
          }

          .number {
            writing-mode: sideways-lr;
          }
        }
      }
    }

    /* &--hide { */
    /*   .devtools__panel { */
    /*     max-width: 32px; */
    /*     padding: 2px 0; */
    /*   } */
    /**/
    /*   .devtools__panel-content { */
    /*     opacity: 0; */
    /*   } */
    /* } */

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
      background-image: linear-gradient(45deg, #f99c23, #f99c23, #f99c23);
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
    /* max-width: 150px; */
    transition:
      /* max-width 0.4s ease, */
      width 0.4s ease,
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

    &-linter {
      display: flex;
      gap: 8px;
      opacity: 0.8;
      transition: opacity 0.2s ease-in-out;
      padding: 0 8px;
      cursor: pointer;
      font-size: 0.8em;
      line-height: 1em;

      &:hover {
        opacity: 1;
      }

      span {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 2px;
      }

      svg {
        width: 14px;
        height: 14px;
      }

      .error {
        color: #ff3c10;
      }

      .warning {
        color: #ffdb12;
      }
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
