import { defineConfig } from "vite";
import prototype from "vite-plugin-prototype";
import nunjucks from "vite-plugin-prototype-nunjucks";
import devtools from "vite-plugin-prototype-devtools";
import data from "./src/data";

export default defineConfig({
  root: "./src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  plugins: [
    prototype(),
    nunjucks({
      data,
    }),
    devtools({
      linter: {
        stylelint: {
          fix: true,
        },
        eslint: {
          fix: true,
        },
      },
    }),
  ],
});
