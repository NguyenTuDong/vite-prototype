# vite-plugin-prototype-devtools

> `vite-plugin-prototype-devtools` is a `Vite` plugin designed to enhance the `Prototype` developer experience.

## Installation

```sh

npm add -D vite-plugin-prototype-devtools

```

## Usage

### Configuration Vite

```ts
import { defineConfig } from 'vite'
import PrototypeDevTools from 'vite-plugin-prototype-devtools'

export default defineConfig({
  plugins: [
    PrototypeDevTools(),
    vue(),
  ],
})
```

