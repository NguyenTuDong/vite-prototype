import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";
import fse from "fs-extra";

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    {
      name: "vite-plugin-copy-devtools-client-bundle",
      apply: "build",
      enforce: "post",
      closeBundle() {
        // copy
        const clientFile = resolve(__dirname, "./dist");

        ["../vite-plugin-prototype-devtools/client"].forEach((dir) => {
          fse.copySync(clientFile, resolve(__dirname, dir));
        });
      },
    },
  ],
});
