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
  isInIframe,
} from "prototype-devtools-core";
import { createMemoryHistory, createRouter } from "vue-router";
import Overview from "./pages/Overview.vue";
import Pages from "./pages/Pages.vue";
import Linter from "./pages/Linter.vue";
import Settings from "./pages/Settings.vue";
import Assets from "./pages/Assets.vue";

const routes = [
  { path: "/", redirect: "/overview" },
  { path: "/overview", component: Overview },
  { path: "/pages", component: Pages },
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

if (isInIframe) {
  createRpcClient(functions, {
    preset: "iframe",
  });
} else {
  createRpcClient(functions, {
    preset: "broadcast",
  });
}
