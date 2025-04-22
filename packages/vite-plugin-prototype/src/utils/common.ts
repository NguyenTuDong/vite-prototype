import path from 'path'
import { HmrContext, IndexHtmlTransformContext, Plugin } from 'vite'
import colors from 'picocolors'

export const handleReload = (ctx: HmrContext) => {
  const { file, server } = ctx
  const { root } = server.config

  server.environments.client.logger.info(
    `${colors.green('page reload')} ${colors.dim(path.relative(root, file))}`,
    { clear: true, timestamp: true },
  )
  server.hot.send({ type: 'full-reload' })
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
} => {
  const buildList: string[] = []
  return {
    hook: {
      handleHotUpdate: (ctx) => {
        if (!reload) return
        if (typeof reload === 'function' && !reload(ctx.file)) return
        if (!ctx.file.endsWith(`.${extension}`)) return

        handleReload(ctx)
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
  }
}
