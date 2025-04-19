import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";
import { theme } from "./src/theme";

export default defineConfig({
  presets: [
    presetWind3(),
    presetIcons({
      prefix: ["i-"],
      scale: 1.2,
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
    presetAttributify(),
    presetWebFonts({
      fonts: {
        sans: "DM Sans:400,500",
        mono: "DM Mono",
        stylish: "Caveat",
      },
    }),
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
  theme,
  shortcuts: {
    // utilities
    fcc: "flex justify-center items-center",
    fbc: "flex justify-between items-center",
    fsc: "flex justify-start items-center",
    "if-sc": "inline-flex justify-start items-center",
    fec: "flex justify-end items-center",
    "if-cc": "inline-flex justify-center items-center",
    "z-max": "z-2147483646",
    "z-max-override": "z-2147483647",

    // general
    "bg-base": "bg-white dark:bg-#121212",
    "text-base": "text-black dark:text-#dfe0e2",
    base: "box-border font-inherit",
    transition: "transition-all duration-300 ease-in-out",
    borderless: "!border-transparent !shadow-none",
    "br-base": "rounded-3px",
    "border-base": "border-gray/20",
    "bg-active": "bg-gray:5",
    "navbar-base": "border-b border-base h-50px",
    "x-divider": "h-1px w-full bg-gray/15",
    "bg-card": "bg-#121212/80",

    // glass
    "glass-effect": "backdrop-blur-20px bg-white/80 dark:bg-#1a1a1a/50",

    // code
    "code-block": "dark:bg-#121212 bg-white",
  },
});
