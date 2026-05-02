import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { svelte2tsx } from 'svelte2tsx'
import { parseForESLint } from 'svelte-eslint-parser'
import { generate as astringGenerate } from 'astring'
import { stripTS } from './strip-ts.ts'

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
function normalizeSvelte(node: any): any {
  if (Array.isArray(node)) return node.map(normalizeSvelte)
  if (node && typeof node === 'object') {
    const out: any = {}
    for (const [k, v] of Object.entries(node)) {
      if (k === 'parent') continue
      out[k] = normalizeSvelte(v)
    }
    if (out.type === 'SvelteReactiveStatement') out.type = 'LabeledStatement'
    return out
  }
  return node
}
const scriptBody = normalizeSvelte(
  ast.body.flatMap((n: any) =>
    n.type === 'SvelteScriptElement' ? n.body : [],
  ),
)
const scriptProgram = stripTS({
  type: 'Program',
  sourceType: 'module',
  body: scriptBody,
})
const scriptCode = astringGenerate(scriptProgram as any)
writeFileSync(resolve(outDir, 'eslint.js'), scriptCode)

console.log('Wrote', resolve(outDir, 'virtual.ts'))
console.log('Wrote', resolve(outDir, 'eslint.js'))
