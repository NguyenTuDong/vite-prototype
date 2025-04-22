# EJS

```html
<% if (user) { %>
  <h2><%= user.name %></h2>
<% } %>
```

See [docs](https://ejs.co/) for more info about the syntax

## Install

**npm**

```bash
npm i vite-plugin-prototype-ejs -D
```

**pnpm**

```bash
pnpm i vite-plugin-prototype-ejs -D
```

## Config

```javascript
import prototype from 'vite-plugin-prototype'
import nunjucks from 'vite-plugin-prototype-ejs'

export default {
  plugins: [prototype(), ejs()],
}
```

## Options

### options

- **Type:** `ejs.Options`
- **Default:** `{}`

Additional EJS options, see EJS [docs](https://ejs.co/#docs) for more info.

### reload

- **Type:** `boolean | ((file: string) => boolean)`
- **Default:** `true`

Whenever to auto-reload browser window upon `ejs` file change. You can also provide function to filter upon which file a reload should occur.

### data

- **Type:** `object`
- **Default:** `{}`

Additional data provide to template

