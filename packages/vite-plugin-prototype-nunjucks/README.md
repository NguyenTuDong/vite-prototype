# Nunjucks

```twig
<ul id="navigation">
    {% for item in ['Home', 'About'] %}
        <li>{{ item }}</li>
    {% endfor %}
</ul>
```

See [docs](https://mozilla.github.io/nunjucks/) for more info about the syntax

## Install

**npm**

```bash
npm i vite-plugin-prototype-nunjucks -D
```

**pnpm**

```bash
pnpm i vite-plugin-prototype-nunjucks -D
```

## Config

```javascript
import prototype from 'vite-plugin-prototype'
import nunjucks from 'vite-plugin-prototype-nunjucks'

export default {
  plugins: [prototype(), nunjucks()],
}
```

## Options

### options

- **Type:** `nunjucks.ConfigureOptions`
- **Default:** `{}`

Additional Nunjucks options, see Nunjucks [docs](https://mozilla.github.io/nunjucks/api.html#environment) for more info.

### reload

- **Type:** `boolean | ((file: string) => boolean)`
- **Default:** `true`

Whenever to auto-reload browser window upon `njk` file change. You can also provide function to filter upon which file a reload should occur.

### onSetup

- **Type:** `(template: nunjucks.Environment, path: string, config: UserConfig) => void`
- **Default:** `true`

Called after the `nunjucks` environment is created. Use this hook to get to the `nunjucks` API
