# Prototype

Fast Prototyping with Template Engines in Vite

- Vite Plugins
- Fast prototyping
- Multi-page support
- Template Engines

## Get started

```sh
npm create vite@latest
npm i vite-plugin-prototype --save-dev
```

## Config

```js
import prototype from 'vite-plugin-prototype'

export default {
  plugins: [prototype()],
}
```

## Using

You can use this to prototype fast without the need to change much in the config.
By default, Prototype routes from `src/pages` directory.
You can add files and directories inside `src/pages` and every request should route there with this plugin.

Example of the structure:

- 📁 src
  - 📁 pages
    - 📁 nested
      - 📄 index.html
    - 📄 index.html
    - 📄 about.html

## Options

### pagesDir

- **Type:** `string`
- **Default:** `'./src/pages'`

Directory where your `.html` or template engine page files are located. Requests are auto-redirected to this directory

### dataDir

- **Type:** `string`
- **Default:** `'./src/data'`

Directory to additional data provided with json file

### build.crossorigin

- **Type:** `boolean`
- **Default:** `true`

Whenever to add crossorigin attribute to a `script` tag and a `link` tag

## Licence

MIT
