# vite-plugin-prototype-devtools

> `vite-plugin-prototype-devtools` is a `Vite` plugin designed to enhance the `Prototype` developer experience.

## Install

**npm**

```bash
npm i vite-plugin-prototype-devtools -D
```

**pnpm**

```bash
pnpm i vite-plugin-prototype-devtools -D
```

## Config

```ts
import { defineConfig } from 'vite'
import prototype from 'vite-plugin-prototype'
import devtools from 'vite-plugin-prototype-devtools'

export default defineConfig({
  plugins: [prototype(), devtools()],
})
```

## Options

### linter.stylelint

- **Type:** `stylelint.LinterOptions`
- **Default:** `undefined`

Stylelint options

### linter.eslint

- **Type:** `ESLint.Options`
- **Default:** `undefined`

ESLint options

### launchEditor

- **Type:** `'appcode' | 'atom' | 'atom-beta' | 'brackets' | 'clion' | 'code' | 'code-insiders' | 'codium' | 'emacs' | 'idea' | 'notepad++' | 'pycharm' | 'phpstorm' | 'rubymine' | 'sublime' | 'vim' | 'visualstudio' | 'webstorm' | 'cursor'`
- **Default:** `code`

Target editor when open in editor
