/**
 * Fails CI if any built JS chunk exceeds the size budget.
 */
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.resolve(__dirname, '../dist/assets')

/** Soft ceiling for any single entry/async JS asset (bytes). */
const MAX_JS_BYTES = 350_000

async function main() {
  let entries
  try {
    entries = await readdir(assetsDir)
  } catch {
    console.error('dist/assets missing — run `npm run build` first')
    process.exit(1)
  }

  const jsFiles = entries.filter((name) => name.endsWith('.js'))
  if (!jsFiles.length) {
    console.error('No JS assets found in dist/assets')
    process.exit(1)
  }

  /** @type {{ name: string, size: number }[]} */
  const oversized = []
  for (const name of jsFiles) {
    const size = (await stat(path.join(assetsDir, name))).size
    const kb = (size / 1024).toFixed(1)
    console.log(`${name.padEnd(48)} ${kb} KB`)
    if (size > MAX_JS_BYTES) {
      oversized.push({ name, size })
    }
  }

  if (oversized.length) {
    console.error(
      `\nBundle budget failed (max ${MAX_JS_BYTES} bytes per JS chunk):\n` +
        oversized.map((item) => ` - ${item.name}: ${item.size} bytes`).join('\n'),
    )
    process.exit(1)
  }

  console.log(`\nBundle budget OK (≤ ${MAX_JS_BYTES} bytes per JS chunk)`)
}

void main()
