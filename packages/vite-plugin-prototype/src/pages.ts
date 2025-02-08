import path from 'path'
import { normalizePath, Plugin } from 'vite'
import FastGlob from 'fast-glob'
import fs from 'fs'

export interface PageOptions {
  pageDir: string
  ignoredPaths?: string[]
}

export const pagePlugin = (options: PageOptions): Plugin => {
  return {
    name: 'vite-plugin-prototype:pages',
    apply: 'serve',
    configureServer(viteDevServer) {
      const pagesRoot = path.relative(viteDevServer.config.root, process.cwd())
      const pagesPath = path.relative(
        viteDevServer.config.root,
        path.resolve(process.cwd(), normalizePath(options.pageDir)),
      )
      const pagesIgnoredPath = options.ignoredPaths

      return () => {
        viteDevServer.middlewares.use(async (req, res, next) => {
          const url = new URL(req.originalUrl || '', 'http://localhost')

          if (url.pathname.endsWith('/')) {
            url.pathname = url.pathname + 'index.html'
          }

          if (
            !url.pathname.startsWith('/' + pagesPath) &&
            !pagesIgnoredPath?.find((path) =>
              url.pathname.startsWith(`/${path}`),
            )
          ) {
            req.url = '/' + pagesPath + url.pathname + url.search
          } else if (!url.pathname.startsWith('/' + pagesRoot)) {
            req.url = '/' + pagesRoot + url.pathname + url.search
          }

          req.originalUrl = req.url

          const originalFilename = req.originalUrl?.replace('.html', '.*') || ''

          const files = FastGlob.sync(
            path.join(viteDevServer.config.root, originalFilename),
          )

          if (files.length) {
            let output = await viteDevServer.transformIndexHtml(
              path.relative(viteDevServer.config.root, files[0]),
              fs.readFileSync(files[0]).toString(),
            )

            res.setHeader('Content-Type', 'text/html')
            res.statusCode = 200
            res.end(output)
          } else {
            next()
          }
        })
      }
    },
  }
}
