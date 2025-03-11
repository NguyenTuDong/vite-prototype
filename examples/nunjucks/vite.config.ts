import { defineConfig } from "vite";
import prototype from "vite-plugin-prototype";
import nunjucks from "vite-plugin-prototype-nunjucks";

export default defineConfig({
  root: "./src",
  plugins: [prototype(), nunjucks()],
});
