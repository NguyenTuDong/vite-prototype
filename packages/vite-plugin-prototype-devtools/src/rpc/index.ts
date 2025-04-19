import { getAssetsFunctions } from './assets'
import { getLinterFunctions } from './linter'
import { RpcFunctionCtx } from './types'

export function getRpcFunctions(ctx: RpcFunctionCtx) {
  return {
    heartbeat() {
      return true
    },
    ...getAssetsFunctions(ctx),
    ...getLinterFunctions(ctx),
  }
}
