import { Plugin, ResolvedConfig } from 'vite'
import { templateHook } from 'vite-plugin-prototype'
import ejs from 'ejs'

export interface EjsPluginOptions {
  options?: ejs.Options
  reload?: boolean | ((file: string) => boolean)
  data: object | ((pagePath: string, config: ResolvedConfig) => object)
}

const defaultOptions: EjsPluginOptions = {
  options: {},
  reload: true,
  data: {},
}

const plugin = (userOptions?: Partial<EjsPluginOptions>): Plugin[] => {
  const options = Object.assign(defaultOptions, userOptions)
  let userConfig: ResolvedConfig

  const { hook, filter } = templateHook({
    extension: 'ejs',
    reload: options.reload,
  })

  return [
    {
      name: `vite-plugin-prototype-ejs`,
      ...hook,

      configResolved(resolvedConfig) {
        userConfig = resolvedConfig
      },
      transformIndexHtml: {
        order: 'pre',
        handler: async (html, ctx) => {
          if (!filter(ctx)) return html

          let context = {}
          if (typeof options.data === 'function') {
            context = options.data(ctx.path, userConfig)
          } else {
            context = options.data
          }

          try {
            const render = ejs.render(html, context, options.options)
            return render
          } catch (error) {
            console.log(error)
          }

          return html
        },
      },
    },
  ]
}

export default plugin
