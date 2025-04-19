import { createHooks } from "hookable";
import { getRpcClient, getRpcServer } from "../messaging";

const hooks = createHooks();

// export enum DevToolsMessagingEvents {
//   INSPECTOR_TREE_UPDATED = "inspector-tree-updated",
//   INSPECTOR_STATE_UPDATED = "inspector-state-updated",
//   DEVTOOLS_STATE_UPDATED = "devtools-state-updated",
//   ROUTER_INFO_UPDATED = "router-info-updated",
//   TIMELINE_EVENT_UPDATED = "timeline-event-updated",
//   INSPECTOR_UPDATED = "inspector-updated",
//   ACTIVE_APP_UNMOUNTED = "active-app-updated",
//   DESTROY_DEVTOOLS_CLIENT = "destroy-devtools-client",
//   RELOAD_DEVTOOLS_CLIENT = "reload-devtools-client",
// }

// function getDevToolsState() {
//   const state = devtools.ctx.state;
//   return {
//     connected: state.connected,
//     clientConnected: true,
//     vueVersion: state?.activeAppRecord?.version || "",
//     tabs: state.tabs,
//     commands: state.commands,
//     vitePluginDetected: state.vitePluginDetected,
//     appRecords: state.appRecords.map((item) => ({
//       id: item.id,
//       name: item.name,
//       version: item.version,
//       routerId: item.routerId,
//     })),
//     activeAppRecordId: state.activeAppRecordId,
//     timelineLayersState: state.timelineLayersState,
//   };
// }

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
  // openInEditor(options: OpenInEditorOptions) {
  //   return devtools.ctx.api.openInEditor(options);
  // },
  // toggleClientConnected(state: boolean) {
  //   toggleClientConnected(state);
  // },
};

export type RPCFunctions = typeof functions;

export const rpc = new Proxy<{
  value: ReturnType<typeof getRpcClient<RPCFunctions>>;
  functions: ReturnType<typeof getRpcClient<RPCFunctions>>["$functions"];
}>(
  {
    value: {} as ReturnType<typeof getRpcClient<typeof functions>>,
    functions: {} as ReturnType<
      typeof getRpcClient<RPCFunctions>
    >["$functions"],
  },
  {
    get(_, property) {
      const _rpc = getRpcClient<RPCFunctions>();
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
