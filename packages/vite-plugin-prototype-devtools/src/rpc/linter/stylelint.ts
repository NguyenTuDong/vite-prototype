import stylelint from 'stylelint'
import path from 'path'

export async function lintStyle() {
  try {
    const result = await stylelint.lint({
      files: ['src/**/*.{vue,css,scss,sass,less,styl,svelte}'],
      cache: true,
      cacheLocation: path.join('node_modules', '.vite', 'stylelint'),
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
        })
      },
    })
    return result
  } catch (error) {
    return null
  }
}
