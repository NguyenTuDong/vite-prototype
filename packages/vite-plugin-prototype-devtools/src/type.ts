import { ESLint } from 'eslint'
import { ResolvedConfig, ViteDevServer } from 'vite'
import { StyleLintOption } from './rpc/linter/stylelint'

export interface RpcFunctionCtx {
  server: ViteDevServer
  config: ResolvedConfig
  options?: PluginOptions
}

export interface PluginOptions {
  launchEditor?:
    | 'appcode'
    | 'atom'
    | 'atom-beta'
    | 'brackets'
    | 'clion'
    | 'code'
    | 'code-insiders'
    | 'codium'
    | 'emacs'
    | 'idea'
    | 'notepad++'
    | 'pycharm'
    | 'phpstorm'
    | 'rubymine'
    | 'sublime'
    | 'vim'
    | 'visualstudio'
    | 'webstorm'
    | 'rider'
    | 'cursor'
    | string

  linter?: {
    stylelint?: StyleLintOption
    eslint?: ESLint.Options
  }
}
