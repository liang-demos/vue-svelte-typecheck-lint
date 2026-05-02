import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import {
  createVueLanguagePlugin,
  getDefaultCompilerOptions,
} from '@vue/language-core'
import { parseForESLint } from 'vue-eslint-parser'
import { generate as astringGenerate } from 'astring'
import { stripTS } from './strip-ts.ts'

const here = dirname(fileURLToPath(import.meta.url))
const sourcePath = resolve(here, 'source.vue')
const outDir = resolve(here, 'output')
mkdirSync(outDir, { recursive: true })

const source = readFileSync(sourcePath, 'utf8')

// 1. Volar virtual TS (the one with __VLS_ctx.b)
const plugin = createVueLanguagePlugin<string>(
  ts,
  {},
  getDefaultCompilerOptions(),
  scriptId => scriptId,
)
const snapshot = ts.ScriptSnapshot.fromString(source)
const vueCode = plugin.createVirtualCode!(sourcePath, 'vue', snapshot)!

function findScriptCode(c: any): any {
  if (typeof c.id === 'string' && c.id.startsWith('script_')) return c
  for (const ec of c.embeddedCodes ?? []) {
    const r = findScriptCode(ec)
    if (r) return r
  }
}
const scriptCodeBlock = findScriptCode(vueCode)
const virtualText = scriptCodeBlock
  ? scriptCodeBlock.snapshot.getText(0, scriptCodeBlock.snapshot.getLength())
  : '// no script_* embedded code found\n'
writeFileSync(resolve(outDir, 'virtual.ts'), virtualText)

// 2. ESLint AST (script-only ESTree, regenerated via astring)
const { ast } = parseForESLint(source, {
  sourceType: 'module',
  ecmaVersion: 'latest',
  parser: '@typescript-eslint/parser',
})
const scriptProgram = stripTS({ type: 'Program', body: ast.body, sourceType: ast.sourceType ?? 'module' })
const scriptCode = astringGenerate(scriptProgram as any)
writeFileSync(resolve(outDir, 'eslint.js'), scriptCode)

console.log('Wrote', resolve(outDir, 'virtual.ts'))
console.log('Wrote', resolve(outDir, 'eslint.js'))
