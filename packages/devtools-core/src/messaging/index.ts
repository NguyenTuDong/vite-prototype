import type {
  BirpcGroup,
  BirpcOptions,
  BirpcReturn,
  ChannelOptions,
} from "birpc";
import { createBirpc, createBirpcGroup } from "birpc";
import { target } from "../core";
import { MergeableChannelOptions } from "../types";
import {
  createBroadcastChannel,
  createIframeClientChannel,
  createIframeServerChannel,
  createViteClientChannel,
  createViteServerChannel,
} from "./presets";

export {
  setIframeServerContext,
  setViteClientContext,
  setViteServerContext,
} from "./presets";

export type Presets = "iframe" | "vite" | "broadcast";

export interface CreateRpcOptions<RemoteFunctions> {
  options?: BirpcOptions<RemoteFunctions>;
  preset?: Presets;
  channel?: ChannelOptions;
}

target.__PROTOTYPE_DEVTOOLS_KIT_RPC_CLIENT__ ??= null!;
target.__PROTOTYPE_DEVTOOLS_KIT_RPC_SERVER__ ??= null!;
target.__PROTOTYPE_DEVTOOLS_KIT_VITE_RPC_CLIENT__ ??= null!;
target.__PROTOTYPE_DEVTOOLS_KIT_VITE_RPC_SERVER__ ??= null!;

export function setRpcClientToGlobal<R, L>(rpc: BirpcReturn<R, L>) {
  target.__PROTOTYPE_DEVTOOLS_KIT_RPC_CLIENT__ = rpc;
}

export function setRpcServerToGlobal<R, L>(rpc: BirpcGroup<R, L>) {
  target.__PROTOTYPE_DEVTOOLS_KIT_RPC_SERVER__ = rpc;
}

export function getRpcClient<
  R,
  L extends object = Record<string, never>,
>(): BirpcReturn<R, L> {
  return target.__PROTOTYPE_DEVTOOLS_KIT_RPC_CLIENT__!;
}

export function getRpcServer<
  R,
  L extends object = Record<string, never>,
>(): BirpcGroup<R, L> {
  return target.__PROTOTYPE_DEVTOOLS_KIT_RPC_SERVER__!;
}

export function setViteRpcClientToGlobal<R, L>(rpc: BirpcReturn<R, L>) {
  target.__PROTOTYPE_DEVTOOLS_KIT_VITE_RPC_CLIENT__ = rpc;
}

export function setViteRpcServerToGlobal<R, L>(rpc: BirpcGroup<R, L>) {
  target.__PROTOTYPE_DEVTOOLS_KIT_VITE_RPC_SERVER__ = rpc;
}

export function getViteRpcClient<
  R,
  L extends object = Record<string, never>,
>(): BirpcReturn<R, L> {
  return target.__PROTOTYPE_DEVTOOLS_KIT_VITE_RPC_CLIENT__!;
}

export function getViteRpcServer<
  R,
  L extends object = Record<string, never>,
>(): BirpcGroup<R, L> {
  return target.__PROTOTYPE_DEVTOOLS_KIT_VITE_RPC_SERVER__!;
}

function getChannel(
  preset: Presets,
  host: "client" | "server" = "client",
): MergeableChannelOptions {
  const channel = {
    iframe: {
      client: createIframeClientChannel,
      server: createIframeServerChannel,
    }[host],
    vite: {
      client: createViteClientChannel,
      server: createViteServerChannel,
    }[host],
    broadcast: {
      client: createBroadcastChannel,
      server: createBroadcastChannel,
    }[host],
  }[preset];
  return channel();
}

export function createRpcClient<
  RemoteFunctions = Record<string, never>,
  LocalFunctions extends object = Record<string, never>,
>(functions: LocalFunctions, options: CreateRpcOptions<RemoteFunctions>) {
  const { channel: _channel, options: _options, preset } = options;

  const channel = preset ? getChannel(preset)! : _channel!;

  const rpc = createBirpc<RemoteFunctions, LocalFunctions>(functions, {
    ..._options,
    ...channel,
    timeout: -1,
  });

  // special case for vite
  if (preset === "vite") {
    setViteRpcClientToGlobal<RemoteFunctions, LocalFunctions>(rpc);
    return;
  }

  setRpcClientToGlobal<RemoteFunctions, LocalFunctions>(rpc);
  return rpc;
}

export function createRpcServer<
  RemoteFunctions = Record<string, never>,
  LocalFunctions extends object = Record<string, never>,
>(functions: LocalFunctions, options: CreateRpcOptions<RemoteFunctions>) {
  const { channel: _channel, options: _options, preset } = options;
  const channel = preset ? getChannel(preset, "server")! : _channel!;

  const rpcServer = getRpcServer<RemoteFunctions, LocalFunctions>();
  if (!rpcServer) {
    const group = createBirpcGroup<RemoteFunctions, LocalFunctions>(
      functions,
      [channel],
      {
        ...options,
        timeout: -1,
      },
    );
    // special case for vite
    if (preset === "vite") {
      setViteRpcServerToGlobal(group);
      return;
    }

    setRpcServerToGlobal(group);
  } else {
    rpcServer.updateChannels((channels) => {
      channels.push(channel);
    });
  }
}
