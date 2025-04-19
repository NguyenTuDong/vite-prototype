import { createApp } from "vue";
import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import "./assets/style.css";
import App from "./App.vue";
import {
  createRpcClient,
  createViteClientRpc,
  functions,
  initViteClientHotContext,
} from "@prototype/devtools-core";

createApp(App).mount("#app");

initViteClientHotContext().then((ctx) => {
  if (ctx) {
    createViteClientRpc();
  }
});

// if (isInSeparateWindow) {
//   createRpcClient(functions, {
//     preset: 'broadcast',
//   })
// }
// else {
//   createRpcClient(functions, {
//     preset: 'iframe',
//   })
// }

createRpcClient(functions, {
  preset: "iframe",
});
