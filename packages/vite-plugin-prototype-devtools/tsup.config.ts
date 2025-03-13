import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  skipNodeModulesBundle: true,
  // platform: "node",
  splitting: false,
  // minify: false,
  // sourcemap: true,
  clean: true,
  dts: true,
})
