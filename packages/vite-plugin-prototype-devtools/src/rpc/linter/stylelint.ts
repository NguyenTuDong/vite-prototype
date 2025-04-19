import stylelint from 'stylelint'
import { parseStylelint } from '.'
import { LinterReport } from '@prototype/devtools-core'

export type StyleLintOption = Omit<stylelint.LinterOptions, 'formatter'>

export async function stylelintTool(
  options: StyleLintOption | undefined = {},
): Promise<LinterReport | null> {
  try {
    const _options = Object.assign<StyleLintOption, StyleLintOption>(
      {
        files: ['src/**/*.{vue,css,scss,sass,less,styl,svelte}'],
      },
      options,
    )

    const result = await stylelint.lint({
      ..._options,
      formatter: (results) => {
        let errorCount = 0
        let warningCount = 0

        results.forEach((result) => {
          result.warnings.forEach((warning) => {
            if (warning.severity === 'error') errorCount++
            if (warning.severity === 'warning') warningCount++
          })
        })
        return JSON.stringify({
          linter: 'stylelint',
          errorCount,
          warningCount,
          results: parseStylelint(results),
        })
      },
    })
    return JSON.parse(result.report)
  } catch (error) {
    console.log(error)
    return null
  }
}
