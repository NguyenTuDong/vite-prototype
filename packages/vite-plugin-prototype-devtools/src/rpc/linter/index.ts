import { debounce } from 'perfect-debounce'
import {
  getViteRpcServer,
  LinterCommonResult,
  LinterReport,
  LinterResult,
  ViteRPCFunctions,
} from '@prototype/devtools-core'
import { stylelintTool } from './stylelint'
import { LintResult } from 'stylelint'
import path from 'node:path'
import { eslintTool } from './eslint'
import { ESLint } from 'eslint'
import { RpcFunctionCtx } from '../../type'

export function getLinterFunctions(ctx: RpcFunctionCtx) {
  let result: LinterReport[] = []

  function getLinterResult() {
    Promise.all([
      stylelintTool(ctx.options?.linter?.stylelint),
      eslintTool(ctx.options?.linter?.eslint),
    ]).then((linterResult) => {
      result = linterResult.filter((value) => value !== null)
      result = result.filter((value) => {
        return Object.keys(value.results).length
      })
      getViteRpcServer<ViteRPCFunctions>?.()?.broadcast?.emit('linterUpdated')
    })
  }

  const debouncedLinterUpdated = debounce(() => {
    getLinterResult()
  }, 100)

  ctx.server.watcher.on('all', () => {
    debouncedLinterUpdated()
  })
  getLinterResult()

  return {
    getLinter() {
      return result
    },
  }
}

export function parseStylelint(data: LintResult[]): LinterResult {
  return groupByFile(
    data.flatMap((file) =>
      file.warnings.map((w) => ({
        file: file.source || 'undefined',
        relativeFilePath: path.relative('.', file.source || ''),
        line: w.line,
        column: w.column,
        message: w.text,
        rule: w.rule,
        severity: w.severity,
      })),
    ),
  )
}

// export function parseHTMLHint(data): LinterCommonReport[] {
//   return data.flatMap(file =>
//     file.messages.map(m => ({
//       file: file.file,
//       line: m.line,
//       column: m.col,
//       message: m.message,
//       rule: m.rule.id,
//       severity: m.type
//     }))
//   )
// }

export function parseESLint(data: ESLint.LintResult[]): LinterResult {
  return groupByFile(
    data.flatMap((file) =>
      file.messages.map((m) => ({
        file: file.filePath,
        relativeFilePath: path.relative('.', file.filePath || ''),
        line: m.line,
        column: m.column,
        message: m.message,
        rule: m.ruleId || 'undefined',
        severity: m.severity === 2 ? 'error' : 'warning',
      })),
    ),
  )
}

function groupByFile(errors: LinterCommonResult[]) {
  const map: LinterResult = {}

  errors.forEach((e) => {
    if (!map[e.relativeFilePath]) map[e.relativeFilePath] = []
    map[e.relativeFilePath].push(e)
  })
  return map
}
