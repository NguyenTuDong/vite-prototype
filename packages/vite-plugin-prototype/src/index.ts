import { Plugin } from 'vite'
import { pagePlugin } from './pages'
import { buildPlugin } from './build'
import { handleReload, templateHook } from './utils/common'
import path from 'path'

export interface CoreOptions {
  pageDir: string
  dataDir: string
  ignoredPaths?: string[]
  build?: {
    crossorigin?: boolean
  }
}

const defaultOptions: CoreOptions = {
  pageDir: './src/pages',
  dataDir: './src/data',
  build: {
    crossorigin: true,
  },
}

const prototype = (userOptions: Partial<CoreOptions> = {}): Plugin[] => {
  const options = Object.assign(defaultOptions, userOptions)

  return [
    {
      name: `vite-plugin-prototype`,
      config(config) {
        config.define = config.define || {}
        config.define['__PROTOTYPE_PAGE_DIR__'] = JSON.stringify(
          options.pageDir,
        )
        return config
      },
      handleHotUpdate: (ctx) => {
        if (!ctx.file.endsWith(`.json`)) return

        const absoluteDataDir = path.resolve(process.cwd(), options.dataDir)
        const relativePath = path.relative(absoluteDataDir, ctx.file)
        if (relativePath.startsWith('..')) return

        handleReload(ctx)
        return []
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

export { templateHook }
export default prototype
