import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, sep, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { basePath } from '../config/site.mjs'

const root = fileURLToPath(new URL('../out/', import.meta.url))
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' }
const port = Number(process.env.PORT ?? 3000)
createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    if (pathname === '/' || pathname === basePath) { res.writeHead(302, { Location: `${basePath}/` }); res.end(); return }
    if (!pathname.startsWith(`${basePath}/`)) throw new Error('Not found')
    const relative = pathname.slice(basePath.length + 1)
    if (relative.split('/').some(part => part.startsWith('.'))) throw new Error('Not found')
    let file = resolve(root, relative || 'index.html')
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) throw new Error('Not found')
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith('/')) { res.writeHead(301, { Location: `${pathname}/` }); res.end(); return }
      file = resolve(file, 'index.html')
    }
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' })
    res.end(req.method === 'HEAD' ? undefined : body)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    const body = await readFile(resolve(root, '404.html')).catch(() => 'Not found')
    res.end(req.method === 'HEAD' ? undefined : body)
  }
}).listen(port, '127.0.0.1', () => console.log(`Static preview: http://localhost:${port}${basePath}/`))
