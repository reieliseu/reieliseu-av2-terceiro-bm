import 'dotenv/config'
import assert from 'node:assert/strict'
import { readFile, readdir, access } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { basePath } from '../config/site.mjs'

const root = fileURLToPath(new URL('../out/', import.meta.url))
const resources = new Set()
for (const file of ['index.html', 'notebook/index.html', '404.html']) {
  const html = await readFile(join(root, file), 'utf8')
  for (const [, raw] of html.matchAll(/(?:src|href)="([^" ]+)"/g)) {
    if (!raw.startsWith('/')) continue
    assert.ok(raw.startsWith(`${basePath}/`), `${file}: URL fora da subpasta: ${raw}`)
    const path = new URL(raw.replaceAll('&amp;', '&'), 'https://startnet.app.br').pathname.slice(basePath.length + 1)
    const resource = path.endsWith('/') ? `${path}index.html` : path
    await access(join(root, decodeURIComponent(resource)))
    resources.add(resource)
  }
}
const htaccess = await readFile(join(root, '.htaccess'), 'utf8')
assert.ok(htaccess.includes(`ErrorDocument 404 ${basePath}/404.html`))
assert.ok(!(await readdir(root)).includes('api'), 'API dinâmica não deve existir no export')
const expectedApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '')
assert.ok(expectedApiUrl, 'Configure NEXT_PUBLIC_API_URL antes da verificação')
let hasApiUrl = false
async function inspect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name)
    if (entry.isDirectory()) await inspect(file)
    else if (file.endsWith('.js')) {
      const content = await readFile(file, 'utf8')
      if (content.includes(expectedApiUrl)) hasApiUrl = true
      assert.ok(!content.includes('https://api.example.invalid/api/v1'), 'Bundle com URL de teste')
    }
  }
}
await inspect(join(root, '_next'))
assert.ok(hasApiUrl, 'URL pública da API ausente do bundle')
console.log(`Export validado: 3 páginas, ${resources.size} recursos/links, API Render e .htaccess.`)
