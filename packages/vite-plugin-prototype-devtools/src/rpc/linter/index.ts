import { debounce } from 'perfect-debounce'
import { getViteRpcServer, ViteRPCFunctions } from '@prototype/devtools-core'
import { LinterResult, RpcFunctionCtx } from '../types'
import { lintStyle } from './stylelint'

export function getLinterFunctions(ctx: RpcFunctionCtx) {
  async function getLinterResult() {
    const result: LinterResult[] = []
    const stylelintResult = await lintStyle()
    if (stylelintResult) {
      result.push(JSON.parse(stylelintResult.report))
    }
    return result
  }

  const debouncedLinterUpdated = debounce(() => {
    getViteRpcServer<ViteRPCFunctions>?.()?.broadcast?.emit('linterUpdated')
  }, 100)

  ctx.server.watcher.on('all', () => {
    debouncedLinterUpdated()
  })
  debouncedLinterUpdated()

  return {
    async getLinter() {
      return await getLinterResult()
    },
  }
}
