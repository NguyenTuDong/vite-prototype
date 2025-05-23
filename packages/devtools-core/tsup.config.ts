import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/index.ts"],
  noExternal: ['superjson'],
  clean: true,
  format: ["esm", "cjs"],
  dts: true,
  shims: true,
});
