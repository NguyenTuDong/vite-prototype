import fg from 'fast-glob'
import { debounce } from 'perfect-debounce'
import { RpcFunctionCtx } from '../type'
import {
  DevToolsMessagingEvents,
  getViteRpcServer,
  RouteInfo,
  ViteRPCFunctions,
} from '@prototype/devtools-core'
import { join, relative, resolve } from 'pathe'

export function getRouterFunctions(ctx: RpcFunctionCtx) {
  const { server, config } = ctx
  const _pageDir = JSON.parse(config.define?.['__PROTOTYPE_PAGE_DIR__'])

  async function scan() {
    const dir = resolve(config.root)
    const pageDir = relative(dir, _pageDir)

    const files = await fg([join(pageDir, '**/*')], {
      cwd: dir,
      onlyFiles: true,
      caseSensitiveMatch: false,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/package-lock.*',
        '**/pnpm-lock.*',
        '**/pnpm-workspace.*',
      ],
    })

    return files
      .map<RouteInfo>((relativePath) => {
        const filePath = resolve(dir, relativePath)
        const routePath = relative(pageDir, relativePath)
          .replace(/\.[^/.]+$/, '.html')
          .replace(/index.html$/, '')
        const url = new URL(routePath || '', 'http://localhost')

        return {
          filePath,
          relativePath,
          routePath: url.pathname,
        }
      })
      .sort((a, b) => (a.routePath < b.routePath ? -1 : 1))
  }
  const debouncedRouteUpdated = debounce(() => {
    getViteRpcServer<ViteRPCFunctions>?.()?.broadcast?.emit(
      DevToolsMessagingEvents.ROUTER_INFO_UPDATED,
    )
  }, 100)

  server.watcher.on('all', (event) => {
    if (event !== 'change') debouncedRouteUpdated()
  })

  return {
    async getRoutes() {
      return await scan()
    },
  }
}
