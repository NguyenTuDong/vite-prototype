import { getViteClient } from "vite-hot-client";
import {
  createRpcClient,
  createRpcServer,
  getViteRpcClient,
} from "../messaging";
import type {
  AssetImporter,
  AssetInfo,
  ImageMeta,
  LinterResult,
  RouteInfo,
} from "../types";
import { createHooks } from "hookable";
import { setViteClientContext } from "../messaging/presets/vite";

const hooks = createHooks();

export const viteRpcFunctions = {
  on: (event: string, handler: Function) => {
    hooks.hook(event, handler);
  },
  off: (event: string, handler: Function) => {
    hooks.removeHook(event, handler);
  },
  once: (event: string, handler: Function) => {
    hooks.hookOnce(event, handler);
  },
  emit: (event: string, ...args: any[]) => {
    hooks.callHook(event, ...args);
  },
  heartbeat: () => {
    return true;
  },
};

export type ViteRPCFunctions = typeof viteRpcFunctions & {
  // assets
  getStaticAssets: () => Promise<AssetInfo[]>;
  getAssetImporters: (url: string) => Promise<AssetImporter[]>;
  getImageMeta: (filepath: string) => Promise<ImageMeta>;
  getTextAssetContent: (filepath: string, limit?: number) => Promise<string>;

  // linter
  getLinter: () => Promise<
    Array<{
      linter: string;
      errorCount: number;
      warningCount: number;
      results: LinterResult;
    }>
  >;

  // router
  getRoutes: () => Promise<RouteInfo[]>;
};

export const viteRpc = new Proxy<{
  value: ReturnType<
    typeof getViteRpcClient<ViteRPCFunctions, ViteRPCFunctions>
  >;
  functions: ReturnType<
    typeof getViteRpcClient<ViteRPCFunctions, ViteRPCFunctions>
  >["$functions"];
}>(
  {
    value: {} as ReturnType<
      typeof getViteRpcClient<ViteRPCFunctions, ViteRPCFunctions>
    >,
    functions: {} as ReturnType<
      typeof getViteRpcClient<ViteRPCFunctions, ViteRPCFunctions>
    >["$functions"],
  },
  {
    get(_, property) {
      const _rpc = getViteRpcClient<ViteRPCFunctions, ViteRPCFunctions>();
      if (property === "value") {
        return _rpc;
      } else if (property === "functions") {
        return _rpc?.$functions;
      }
    },
  },
);

export function onViteRpcConnected(callback: () => void) {
  let timer: number = null!;

  function heartbeat() {
    viteRpc.value
      ?.heartbeat?.()
      .then(() => {
        clearTimeout(timer);
        callback();
      })
      .catch(() => ({}));
    timer = setTimeout(() => {
      heartbeat();
    }, 80) as unknown as number;
  }

  heartbeat();
}

async function getViteHotContext() {
  const viteClient = await getViteClient(
    `${location.pathname.split("/__devtools__")[0] || ""}/`.replace(
      /\/\//g,
      "/",
    ),
    false,
  );
  return viteClient?.createHotContext("/____");
}

export async function initViteClientHotContext() {
  const context = await getViteHotContext();
  context && setViteClientContext(context);
  return context;
}

export function createViteClientRpc() {
  createRpcClient(viteRpcFunctions, {
    preset: "vite",
  });
}

export function createViteServerRpc(functions: Record<string, any>) {
  createRpcServer(functions, {
    preset: "vite",
  });
}
