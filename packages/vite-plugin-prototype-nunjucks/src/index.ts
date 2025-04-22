import { Plugin, UserConfig } from 'vite'
import nunjucks from 'nunjucks'
import { templateHook } from 'vite-plugin-prototype'

export interface NunjucksPluginOptions {
  options?: nunjucks.ConfigureOptions
  reload?: boolean | ((file: string) => boolean)
  onSetup?: (
    template: nunjucks.Environment,
    path: string,
    config: UserConfig,
  ) => void
  data: object
}

const defaultOptions: NunjucksPluginOptions = {
  options: {},
  reload: true,
  data: {},
}

const plugin = (userOptions?: Partial<NunjucksPluginOptions>): Plugin[] => {
  const options = Object.assign(defaultOptions, userOptions)
  let userConfig: UserConfig

  const { hook, filter } = templateHook({
    extension: 'njk',
    reload: options.reload,
  })

  return [
    {
      name: `vite-plugin-prototype-nunjucks`,
      ...hook,

      config: (config) => {
        userConfig = config
      },
      transformIndexHtml: {
        order: 'pre',
        handler: async (html, ctx) => {
          if (!filter(ctx)) return html

          const nunjucksEnvironment = nunjucks.configure(
            userConfig.root || '',
            Object.assign(
              {
                noCache: true,
              },
              options.options,
            ),
          )

          if (typeof options.onSetup === 'function') {
            options.onSetup(nunjucksEnvironment, ctx.path, userConfig)
          }

          try {
            const render = nunjucksEnvironment.renderString(html, options.data)
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
