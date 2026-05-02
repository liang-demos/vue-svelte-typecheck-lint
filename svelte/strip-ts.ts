const TS_OMIT_KEYS = new Set([
  'typeAnnotation',
  'typeParameters',
  'returnType',
  'accessibility',
  'definite',
  'readonly',
  'declare',
  'override',
  'abstract',
])

export function stripTS<T>(node: T): T {
  if (Array.isArray(node)) {
    return node
      .map(stripTS)
      .filter((n: any) => !(n && typeof n.type === 'string' && n.type.startsWith('TS'))) as any
  }
  if (node && typeof node === 'object') {
    const out: any = {}
    for (const [k, v] of Object.entries(node as any)) {
      if (k === 'parent') continue
      if (TS_OMIT_KEYS.has(k)) continue
      if (v && typeof v === 'object' && (v as any).type && typeof (v as any).type === 'string' && (v as any).type.startsWith('TS')) continue
      out[k] = stripTS(v as any)
    }
    return out
  }
  return node
}
