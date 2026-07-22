/**
 * Fails if Vue Query nested refs are used without .value / destructure-safe patterns.
 * Catches: Boolean(x.isPending), v-if="x.isPending", :loading="x.isPending"
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = new URL('../src', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const bad = []

const patterns = [
  {
    name: 'Boolean(nestedQueryFlag)',
    re: /Boolean\(\s*[A-Za-z_][\w.]*\.(?:isPending|isError|isLoading|isFetching)\s*\)/g,
  },
  {
    name: 'nestedQueryFlagWithoutValue',
    re: /\b([A-Za-z_][\w]*)\.(isPending|isError|isLoading|isFetching)\b(?!\.value)/g,
  },
]

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      walk(full)
      continue
    }
    if (!full.endsWith('.vue') && !full.endsWith('.ts')) continue
    const text = readFileSync(full, 'utf8')
    const rel = relative(root, full)
    for (const { name, re } of patterns) {
      re.lastIndex = 0
      let match
      while ((match = re.exec(text))) {
        // Allow top-level destructured bindings used as bare isPending in templates/scripts
        // by only flagging property access form (foo.isPending) — already in regex.
        const line = text.slice(0, match.index).split('\n').length
        bad.push(`${rel}:${line} [${name}] ${match[0]}`)
      }
    }
  }
}

walk(root)

if (bad.length) {
  console.error('Vue Query ref misuse found:\n')
  for (const item of bad) console.error(`  ${item}`)
  console.error(
    '\nFix: destructure `const { isPending } = useXQuery()` or use `query.isPending.value`.',
  )
  process.exit(1)
}

console.log('Vue Query ref checks passed.')
