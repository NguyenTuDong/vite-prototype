import { LinterReport } from '@prototype/devtools-core'
import { parseESLint } from '.'
import { ESLint } from 'eslint'

export async function eslintTool(
  options: ESLint.Options | undefined = {},
): Promise<LinterReport | null> {
  try {
    const _options = Object.assign<ESLint.Options, ESLint.Options>({}, options)

    const eslint = new ESLint(_options)
    const results = await eslint.lintFiles([])

    if (options.fix) {
      ESLint.outputFixes(results)
    }

    let errorCount = 0
    let warningCount = 0

    results.forEach((result) => {
      result.messages.forEach((warning) => {
        if (warning.severity === 2) errorCount++
        else warningCount++
      })
    })
    return {
      linter: 'eslint',
      errorCount,
      warningCount,
      results: parseESLint(results),
    }
  } catch (error) {
    console.log(error)
    return null
  }
}
