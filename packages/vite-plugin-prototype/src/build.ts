import FastGlob from 'fast-glob'
import { normalizePath, Plugin, UserConfig } from 'vite'
import fs from 'fs'
import js_beautify from 'js-beautify'
import path from 'path'

var beautify_html = js_beautify.html

export interface BuildOptions {
  pageDir: string
  crossorigin?: boolean
}

export const buildPlugin = ({ pageDir, crossorigin }: BuildOptions): Plugin => {
  let userConfig: UserConfig

  return {
    name: 'vite-plugin-prototype:build',
    enforce: 'pre',
    apply: 'build',
    config(config) {
      userConfig = config

      if (!userConfig.build?.rollupOptions?.input) {
        userConfig.build = userConfig.build || {}
        userConfig.build.rollupOptions = userConfig.build.rollupOptions || {}
        userConfig.build.rollupOptions.input = FastGlob.sync(
          normalizePath(pageDir + '/**/*'),
        )
      }
    },
    resolveId(source, _, options) {
      if (!options.isEntry) return null
      const relativePath = path.relative(pageDir, source)
      if (relativePath.startsWith('../')) return null

      return {
        id: path.resolve(
          userConfig.root || process.cwd(),
          relativePath.substring(0, relativePath.indexOf('.')) + '.html',
        ),
        meta: {
          type: relativePath.substring(relativePath.lastIndexOf('.') + 1),
        },
      }
    },

    load(id) {
      if (!id.endsWith('.html')) return null

      const files = FastGlob.sync(
        path.resolve(
          process.cwd(),
          pageDir,
          path.relative(
            userConfig.root || process.cwd(),
            id.replace('.html', '.*'),
          ),
        ),
      )

      if (files.length) {
        const content = fs.readFileSync(files[0], 'utf-8')
        return content
      } else {
        return null
      }
    },
    transformIndexHtml: {
      order: 'post',
      handler: (html) => {
        if (!crossorigin) {
          html = html.replace(
            /(<(?:script|link)[^>]*?)\scrossorigin(?:="[^"]*")?([^>]*?>)/g,
            '$1$2',
          )
        }

        if (!userConfig.build?.minify) {
          html = beautify_html(html, {
            indent_size: 2,
            preserve_newlines: false,
            indent_inner_html: true,
          })
        }

        return html
      },
    },
  }
}
