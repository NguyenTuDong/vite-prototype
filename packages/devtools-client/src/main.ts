import { createApp } from "vue";
import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import "floating-vue/dist/style.css";
import "./assets/style.css";
import App from "./App.vue";
import {
  createRpcClient,
  createViteClientRpc,
  functions,
  initViteClientHotContext,
} from "@prototype/devtools-core";
import { createMemoryHistory, createRouter } from "vue-router";
import Overview from "./pages/Overview.vue";
import Router from "./pages/Router.vue";
import Linter from "./pages/Linter.vue";
import Settings from "./pages/Settings.vue";
import Assets from "./pages/Assets.vue";

const routes = [
  { path: "/", redirect: "/overview" },
  { path: "/overview", component: Overview },
  { path: "/router", component: Router },
  { path: "/linter", component: Linter },
  { path: "/assets", component: Assets },
  { path: "/settings", component: Settings },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount("#app");

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
