import { useLocalStorage, type RemovableRef } from "@vueuse/core";

interface DevtoolsClientState {
  route: string;
  expandSidebar: boolean;
  interactionCloseOnOutsideClick: boolean;
  reduceMotion: boolean;
}

function clientStateFactory(): DevtoolsClientState {
  return {
    route: "/",
    expandSidebar: false,
    interactionCloseOnOutsideClick: false,
    reduceMotion: false,
  };
}

export const devtoolsClientState: RemovableRef<DevtoolsClientState> =
  useLocalStorage("__PROTOTYPE_DEVTOOLS_CLIENT_STATE__", clientStateFactory(), {
    mergeDefaults: true,
  });

export function resetDevtoolsClientState() {
  devtoolsClientState.value = clientStateFactory();
}
