import SuperJSON from "superjson";
import { isBrowser, target } from "../../core";
import { MergeableChannelOptions } from "../../types";

export const __DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY =
  "__prototype-devtools-iframe-messaging-event-key__";

export const __IFRAME_SERVER_CONTEXT__ = "prototype-iframe:server-context";
export function getIframeServerContext(): HTMLIFrameElement {
  return target[__IFRAME_SERVER_CONTEXT__];
}

export function setIframeServerContext(context: HTMLIFrameElement) {
  target[__IFRAME_SERVER_CONTEXT__] = context;
}

export function createIframeClientChannel(): MergeableChannelOptions {
  if (!isBrowser) {
    return {
      post: () => {},
      on: () => {},
    };
  }

  return {
    post: (data) => {
      window.parent.postMessage(
        SuperJSON.stringify({
          event: __DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY,
          data,
        }),
        "*",
      );
    },
    on: (handler) => {
      window.addEventListener("message", (event) => {
        try {
          const parsed = SuperJSON.parse<{ event: string; data: unknown }>(
            event.data,
          );
          if (
            event.source === window.parent &&
            parsed.event === __DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY
          ) {
            handler(parsed.data);
          }
        } catch (e) {}
      });
    },
  };
}

export function createIframeServerChannel(): MergeableChannelOptions {
  if (!isBrowser) {
    return {
      post: () => {},
      on: () => {},
    };
  }

  return {
    post: (data) => {
      const iframe = getIframeServerContext();
      iframe?.contentWindow?.postMessage(
        SuperJSON.stringify({
          event: __DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY,
          data,
        }),
        "*",
      );
    },
    on: (handler) => {
      window.addEventListener("message", (event) => {
        const iframe = getIframeServerContext();
        try {
          const parsed = SuperJSON.parse<{ event: string; data: unknown }>(
            event.data,
          );
          // console.log(event.source, iframe?.contentWindow);
          if (
            event.source === iframe?.contentWindow &&
            parsed.event === __DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY
          ) {
            handler(parsed.data);
          }
        } catch (e) {}
      });
    },
  };
}
