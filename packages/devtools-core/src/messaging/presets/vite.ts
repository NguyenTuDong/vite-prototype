import SuperJSON from "superjson";
import { target } from "../../core";
import { MergeableChannelOptions } from "../../types";

interface EventEmitter {
  on: (name: string, handler: (data: any) => void) => void;
  send: (name: string, ...args: any[]) => void;
}
interface PrototypeClientContext extends EventEmitter {}

interface PrototypeDevServer {
  hot?: EventEmitter;
  ws?: EventEmitter;
}

export const __DEVTOOLS_KIT_PROTOTYPE_MESSAGING_EVENT_KEY =
  "__prototype-devtools-vite-messaging-event-key__";
export const __PROTOTYPE_CLIENT_CONTEXT__ = "prototype-vite:client-context";
export const __PROTOTYPE_SERVER_CONTEXT__ = "prototype-vite:server-context";

export function getViteClientContext(): PrototypeClientContext {
  return target[__PROTOTYPE_CLIENT_CONTEXT__];
}

export function setViteClientContext(context: PrototypeClientContext) {
  target[__PROTOTYPE_CLIENT_CONTEXT__] = context;
}

export function getViteServerContext(): PrototypeDevServer {
  return target[__PROTOTYPE_SERVER_CONTEXT__];
}

export function setViteServerContext(context: PrototypeDevServer) {
  target[__PROTOTYPE_SERVER_CONTEXT__] = context;
}

export function createViteServerChannel(): MergeableChannelOptions {
  const prototypeServer = getViteServerContext();
  // `server.hot` (Vite 5.1+) > `server.ws`
  const ws = prototypeServer.hot ?? prototypeServer.ws;

  return {
    post: (data) =>
      ws?.send(
        __DEVTOOLS_KIT_PROTOTYPE_MESSAGING_EVENT_KEY,
        SuperJSON.stringify(data),
      ),
    on: (handler) =>
      ws?.on(__DEVTOOLS_KIT_PROTOTYPE_MESSAGING_EVENT_KEY, (event) => {
        handler(SuperJSON.parse(event));
      }),
  };
}

export function createViteClientChannel(): MergeableChannelOptions {
  const client = getViteClientContext();
  return {
    post: (data) => {
      client?.send(
        __DEVTOOLS_KIT_PROTOTYPE_MESSAGING_EVENT_KEY,
        SuperJSON.stringify(data),
      );
    },
    on: (handler) => {
      client?.on(__DEVTOOLS_KIT_PROTOTYPE_MESSAGING_EVENT_KEY, (event) => {
        handler(SuperJSON.parse(event));
      });
    },
  };
}
