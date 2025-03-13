import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import fse from "fs-extra";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "devtools-overlay.[ext]",
        globals: {
          vue: "Vue",
        },
      },
    },
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "devtoolsOverlay",
      fileName: () => "devtools-overlay.js",
      formats: ["iife"],
    },
  },
  plugins: [
    vue(),
    {
      name: "vite-plugin-prototype-copy-devtools-overlay",
      apply: "build",
      enforce: "post",
      async closeBundle() {
        // copy
        const overlayFile = resolve(__dirname, "./dist");

        const overlayJsFile = resolve(__dirname, "./dist/devtools-overlay.js");
        const overlayMjsFile = resolve(
          __dirname,
          "./dist/devtools-overlay.mjs",
        );

        fse.copyFileSync(overlayJsFile, overlayMjsFile);

        // Vite using mjs file to skip some commonjs -> es6 plugins
        fse.copySync(overlayFile, resolve(__dirname, "../vite-plugin-prototype-devtools/overlay"), {
          filter: (file) => {
            return !file.endsWith(".js");
          },
        });
      },
    },
  ],
});
