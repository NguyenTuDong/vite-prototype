export const isBrowser = typeof navigator !== "undefined";

export const target = (
  typeof window !== "undefined"
    ? window
    : typeof globalThis !== "undefined"
      ? globalThis
      : // @ts-ignore
        typeof global !== "undefined"
        ? // @ts-ignore
          global
        : {}
) as typeof globalThis;

export function setDevToolsClientUrl(url: string) {
  target.__PROTOTYPE_DEVTOOLS_CLIENT_URL__ = url;
}

export function getDevToolsClientUrl() {
  return (
    target.__PROTOTYPE_DEVTOOLS_CLIENT_URL__ ??
    (() => {
      if (isBrowser) {
        const devtoolsMeta = document.querySelector(
          "meta[name=__PROTOTYPE_DEVTOOLS_CLIENT_URL__]",
        );
        if (devtoolsMeta) return devtoolsMeta.getAttribute("content");
      }
      return "";
    })()
  );
}

export const THEME_KEY = "__prototype-devtools-theme__";
