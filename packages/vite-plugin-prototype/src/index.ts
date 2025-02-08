import { PluginOption } from 'vite'
import { pagePlugin } from './pages'
import { buildPlugin } from './build'
import path from 'path'
import colors from 'picocolors'
import { DATA_ID, getData, templateHook } from './utils/common'

export interface CoreOptions {
  pageDir: string
  dataDir: string
  reload: boolean | ((file: string) => boolean)
  ignoredPaths?: string[]
  build?: {
    crossorigin?: boolean
  }
}

const defaultOptions: CoreOptions = {
  pageDir: './src/pages',
  dataDir: './src/data',
  reload: true,
  build: {
    crossorigin: true,
  },
}

const prototype = (userOptions: Partial<CoreOptions> = {}): PluginOption => {
  const options = Object.assign(defaultOptions, userOptions)

  return [
    {
      name: `vite-plugin-prototype`,
      handleHotUpdate: (ctx) => {
        if (!options.reload) return
        if (typeof options.reload === 'function' && !options.reload(ctx.file))
          return

        const relativePage = path.relative(options.pageDir, ctx.file)
        const relativeData = path.relative(options.dataDir, ctx.file)
        if (relativePage.startsWith('../') && relativeData.startsWith('../'))
          return

        const { file, server } = ctx
        const { logger, root } = server.config

        server.ws.send({ type: 'full-reload' })
        logger.info(
          `${colors.green('page reload')} ${colors.dim(path.relative(root, file))}`,
          { clear: true, timestamp: true },
        )
      },
      load(id) {
        if (id !== DATA_ID) return null
        const data = getData(options.dataDir)
        return JSON.stringify(data)
      },
    },
    buildPlugin({
      pageDir: options.pageDir,
      crossorigin: options.build?.crossorigin,
    }),
    pagePlugin({
      pageDir: options.pageDir,
      ignoredPaths: options.ignoredPaths,
    }),
  ]
}

export { DATA_ID, templateHook }
export default prototype
