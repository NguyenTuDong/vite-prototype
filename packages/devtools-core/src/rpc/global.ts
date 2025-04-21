import { createHooks } from "hookable";
import { getRpcClient, getRpcServer } from "../messaging";
import { getDevToolsClientUrl, target } from "../core";

const hooks = createHooks();

export enum DevToolsMessagingEvents {
  TOGGLE_PANEL = "toggle-panel",
  ROUTER_INFO_UPDATED = "router-info-updated",
  ASSETS_INFO_UPDATED = "assets-info-updated",
  LINTER_INFO_UPDATED = "linter-info-updated",
  ON_NAVIGATE = "on-navigate",
}

export const functions = {
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

  // router
  getCurrentRoute: () => {
    return target.location.pathname;
  },
  navigate: (path: string) => {
    target.location.href = path;
  },
  openInNewTab: (url?: string, feature?: string) => {
    const _url = url ?? getDevToolsClientUrl();
    target.open(_url, "_blank", feature);
  },
};

export type RPCFunctions = typeof functions;

export const rpc = new Proxy<{
  value: ReturnType<typeof getRpcClient<RPCFunctions, RPCFunctions>>;
  functions: ReturnType<
    typeof getRpcClient<RPCFunctions, RPCFunctions>
  >["$functions"];
}>(
  {
    value: {} as ReturnType<typeof getRpcClient<RPCFunctions, RPCFunctions>>,
    functions: {} as ReturnType<
      typeof getRpcClient<RPCFunctions, RPCFunctions>
    >["$functions"],
  },
  {
    get(_, property) {
      const _rpc = getRpcClient<RPCFunctions, RPCFunctions>();
      if (property === "value") {
        return _rpc;
      } else if (property === "functions") {
        return _rpc.$functions;
      }
    },
  },
);

export const rpcServer = new Proxy<{
  value: ReturnType<typeof getRpcServer<RPCFunctions, RPCFunctions>>;
  functions: ReturnType<
    typeof getRpcServer<RPCFunctions, RPCFunctions>
  >["functions"];
}>(
  {
    value: {} as ReturnType<
      typeof getRpcServer<typeof functions, typeof functions>
    >,
    functions: {} as ReturnType<
      typeof getRpcServer<RPCFunctions, RPCFunctions>
    >["functions"],
  },
  {
    get(_, property) {
      const _rpc = getRpcServer<RPCFunctions, RPCFunctions>();
      if (property === "value") {
        return _rpc;
      } else if (property === "functions") {
        return _rpc.functions;
      }
    },
  },
);

export function onRpcConnected(callback: () => void) {
  let timer: number = null!;
  let retryCount = 0;

  function heartbeat() {
    rpc.value
      ?.heartbeat?.()
      .then(() => {
        callback();
        clearTimeout(timer);
      })
      .catch(() => {});
  }

  timer = setInterval(
    () => {
      if (retryCount >= 30) {
        clearTimeout(timer);
      }
      retryCount++;
      heartbeat();
    },
    retryCount * 200 + 200,
  ) as unknown as number;
  heartbeat();
}

export function onRpcSeverReady(callback: () => void) {
  let timer: number = null!;
  const timeout = 120;

  function heartbeat() {
    if (rpcServer.value.clients.length > 0) {
      callback();
      clearTimeout(timer);
    }
  }

  timer = setInterval(() => {
    heartbeat();
  }, timeout) as unknown as number;
}
