import { ResolvedConfig, ViteDevServer } from 'vite'

export interface RpcFunctionCtx {
  server: ViteDevServer
  config: ResolvedConfig
}

export interface LinterResult {
  linter: string
  errorCount: number
  warningCount: number
}
