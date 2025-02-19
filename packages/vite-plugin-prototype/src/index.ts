import { PluginOption } from 'vite'
import { pagePlugin } from './pages'
import { buildPlugin } from './build'
import { DATA_ID, getData, templateHook } from './utils/common'

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

const prototype = (userOptions: Partial<CoreOptions> = {}): PluginOption => {
  const options = Object.assign(defaultOptions, userOptions)

  return [
    {
      name: `vite-plugin-prototype`,
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
