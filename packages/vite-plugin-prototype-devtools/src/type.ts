import { ESLint } from 'eslint'
import { ResolvedConfig, ViteDevServer } from 'vite'
import { StyleLintOption } from './rpc/linter/stylelint'

export interface RpcFunctionCtx {
  server: ViteDevServer
  config: ResolvedConfig
  options?: PluginOptions
}

export interface PluginOptions {
  linter?: {
    stylelint?: StyleLintOption
    eslint?: ESLint.Options
  }
}
