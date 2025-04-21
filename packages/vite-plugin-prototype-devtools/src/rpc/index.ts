import { RpcFunctionCtx } from '../type'
import { getAssetsFunctions } from './assets'
import { getLinterFunctions } from './linter'
import { getRouterFunctions } from './router'

export function getRpcFunctions(ctx: RpcFunctionCtx) {
  return {
    heartbeat() {
      return true
    },
    ...getAssetsFunctions(ctx),
    ...getLinterFunctions(ctx),
    ...getRouterFunctions(ctx),
  }
}
