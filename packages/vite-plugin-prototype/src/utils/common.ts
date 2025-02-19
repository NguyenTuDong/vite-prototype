import FastGlob from 'fast-glob'
import path from 'path'
import { IndexHtmlTransformContext, normalizePath, Plugin } from 'vite'
import fs from 'fs'
import lodash from 'lodash'
import colors from 'picocolors'

export const DATA_ID = '___DATA_CONTEXT___'

export const getData = (dataDir: string = '') => {
  let context = {}
  const paths = ['**/*.json']

  const normalizePaths = paths.map((path) => normalizePath(path))

  FastGlob.sync(normalizePaths, {
    cwd: path.join(process.cwd(), dataDir),
  }).forEach((entry) => {
    const dataPath = path.resolve(process.cwd(), path.join(dataDir, entry))
    const keys = entry.replace('.json', '').split('/')
    let tempData: Record<string, any> = {}
    let data = tempData

    while (keys.length) {
      const key = keys.shift()
      if (key) {
        let current = tempData

        if (key !== 'index') {
          if (!tempData[key]) tempData[key] = {}
          current = tempData[key]
        }

        if (!keys.length) {
          try {
            current = lodash.merge(
              current,
              JSON.parse(fs.readFileSync(dataPath).toString()),
            )
          } catch (error) {
            console.log(colors.red(`Error in: ${path.join(dataDir, entry)}`))
            console.log(error)
          }
        }

        tempData = current
      }
    }

    context = lodash.merge(context, data)
  })

  return context
}

export const templateHook = ({
  extension,
  reload,
}: {
  extension: string
  reload?: boolean | ((file: string) => boolean)
}): {
  hook: Partial<Plugin>
  filter: (ctx: IndexHtmlTransformContext) => boolean
  getData: (ctx: IndexHtmlTransformContext) => Promise<object>
} => {
  const buildList: string[] = []
  return {
    hook: {
      handleHotUpdate: (ctx) => {
        if (!reload) return
        if (typeof reload === 'function' && !reload(ctx.file)) return
        if (!ctx.file.endsWith(`.${extension}`)) return

        const { file, server } = ctx
        const { root } = server.config

        server.environments.client.logger.info(
          `${colors.green('page reload')} ${colors.dim(path.relative(root, file))}`,
          { clear: true, timestamp: true },
        )
        server.hot.send({ type: 'full-reload' })
        return []
      },
      transform(_, id) {
        const meta = this.getModuleInfo(id)?.meta
        if (meta?.type === extension) {
          buildList.push(id)
        }
      },
    },
    filter: (ctx) => {
      if (ctx.server) {
        if (ctx.path.endsWith(`.${extension}`)) return true
      } else {
        if (buildList.includes(ctx.filename)) return true
      }
      return false
    },
    getData: async (ctx) => {
      try {
        const data = await ctx.server?.pluginContainer.load(DATA_ID)
        if (typeof data === 'string') {
          return JSON.parse(data)
        }
      } catch (error) {
        console.log(error)
      }
      return {}
    },
  }
}
