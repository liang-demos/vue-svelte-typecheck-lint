import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { svelte2tsx } from 'svelte2tsx'
import { parseForESLint } from 'svelte-eslint-parser'
import { generate as astringGenerate } from 'astring'

const here = dirname(fileURLToPath(import.meta.url))
const sourcePath = resolve(here, 'source.svelte')
const outDir = resolve(here, 'output')
mkdirSync(outDir, { recursive: true })

const source = readFileSync(sourcePath, 'utf8')

// 1. svelte2tsx virtual TS — what svelte-check feeds to tsc
const { code } = svelte2tsx(source, {
  filename: sourcePath,
  isTsFile: true,
  mode: 'ts',
})
writeFileSync(resolve(outDir, 'virtual.ts'), code)

// 2. ESLint AST (script-only ESTree, regenerated via astring)
const { ast } = parseForESLint(source, {
  parser: '@typescript-eslint/parser',
  ecmaVersion: 'latest',
  sourceType: 'module',
})
const scriptBody = ast.body.flatMap((n: any) =>
  n.type === 'SvelteScriptElement' ? n.body : [],
)
const scriptProgram = {
  type: 'Program',
  sourceType: 'module',
  body: scriptBody,
}
const scriptCode = astringGenerate(scriptProgram as any)
writeFileSync(resolve(outDir, 'eslint.js'), scriptCode)

console.log('Wrote', resolve(outDir, 'virtual.ts'))
console.log('Wrote', resolve(outDir, 'eslint.js'))
