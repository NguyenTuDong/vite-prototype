import { normalizePath, Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import sirv from 'sirv'
import { DIR_CLIENT } from './dir'
import colors from 'picocolors'
import {
    CLIENT_URL,
  createViteServerRpc,
  setViteServerContext,
} from '@prototype/devtools-core'
import { getRpcFunctions } from './rpc'
import { PluginOptions } from './type'

export * from './type'

function getDevtoolsPath() {
  return normalizePath(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../'),
  )
}

function removeUrlQuery(url: string): string {
  return url.replace(/\?.*$/, '')
}

const toggleComboKeysMap: Record<string, string> = {
  option: process.platform === 'darwin' ? 'Option(⌥)' : 'Alt(⌥)',
  meta: 'Command(⌘)',
  shift: 'Shift(⇧)',
}

function normalizeComboKeyPrint(toggleComboKey: string) {
  return toggleComboKey
    .split('-')
    .map(
      (key) => toggleComboKeysMap[key] || key[0].toUpperCase() + key.slice(1),
    )
    .join(colors.dim('+'))
}

const devtoolsNextResourceSymbol = '?__prototype-devtools-next-resource'

const plugin = (options?: PluginOptions): Plugin[] => {
  const devtoolsPath = getDevtoolsPath()

  let config: ResolvedConfig

  const devtoolsOptionsImportee = 'virtual:prototype-devtools-options'
  const resolvedDevtoolsOptions = `\0${devtoolsOptionsImportee}`

  function configureServer(server: ViteDevServer) {
    const base = server.config.base || '/'
    server.middlewares.use(
      `${base}${CLIENT_URL}`,
      sirv(DIR_CLIENT, {
        single: true,
        dev: true,
        setHeaders(response) {
          if (config.server.headers == null) return
          Object.entries(config.server.headers).forEach(([key, value]) => {
            if (value == null) return
            response.setHeader(key, value)
          })
        },
      }),
    )

    // vite client <-> server messaging
    setViteServerContext(server)

    const rpcFunctions = getRpcFunctions({
      server,
      config,
      options,
    })
    createViteServerRpc(rpcFunctions)

    const { cyan, bold, green, yellow } = colors

    const _printUrls = server.printUrls
    const colorUrl = (url: string) =>
      cyan(url.replace(/:(\d+)\//, (_, port) => `:${bold(port)}/`))

    server.printUrls = () => {
      const urls = server.resolvedUrls!
      const keys = normalizeComboKeyPrint('option-shift-d')
      _printUrls()
      for (const url of urls.local) {
        const devtoolsUrl = url.endsWith('/')
          ? `${url}${CLIENT_URL}/`
          : `${url}/${CLIENT_URL}/`
        console.log(
          `  ${green('➜')}  ${bold('Prototype DevTools')}: ${green(`Open ${colorUrl(`${devtoolsUrl}`)} as a separate window`)}`,
        )
      }
      console.log(
        `  ${green('➜')}  ${bold('Prototype DevTools')}: ${green(`Press ${yellow(keys)} in App to toggle the Prototype DevTools`)}`,
      )
    }
  }

  return [
    vue(),
    {
      name: `vite-plugin-prototype-devtools`,
      enforce: 'pre',
      apply: 'serve',
      configResolved(resolvedConfig) {
        config = resolvedConfig
      },
      configureServer(server) {
        configureServer(server)
      },
      async resolveId(importee: string) {
        if (importee === devtoolsOptionsImportee) {
          return resolvedDevtoolsOptions
        } else if (importee.startsWith('virtual:prototype-devtools-path:')) {
          const resolved = importee.replace(
            'virtual:prototype-devtools-path:',
            `${devtoolsPath}/`,
          )
          return `${resolved}${devtoolsNextResourceSymbol}`
        }
      },
      async load(id) {
        if (id === resolvedDevtoolsOptions) {
          return `export default ${JSON.stringify({ base: config.base })}`
        } else if (id.endsWith(devtoolsNextResourceSymbol)) {
          const filename = removeUrlQuery(id)
          // read file ourselves to avoid getting shut out by vite's fs.allow check
          return await fs.promises.readFile(filename, 'utf-8')
        }
      },
      transformIndexHtml(html) {
        return {
          html,
          tags: [
            {
              tag: 'script',
              injectTo: 'head-prepend',
              attrs: {
                type: 'module',
                src: `${config.base || '/'}@id/virtual:prototype-devtools-path:src/overlay.ts`,
              },
            },
          ],
        }
      },
    },
  ]
}

export default plugin
