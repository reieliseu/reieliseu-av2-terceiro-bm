export function apiUrl(value: string | undefined, production: boolean): string {
  const raw = value?.trim() || (production ? "" : "http://localhost:4000/api/v1")
  const message = "Configure NEXT_PUBLIC_API_URL com a URL absoluta da API terminada em /api/v1 (HTTPS em produção)."
  let url: URL
  try { url = new URL(raw) } catch { throw new Error(message) }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash ||
    url.pathname.replace(/\/+$/, '') !== '/api/v1' ||
    (production && (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) {
    throw new Error(message)
  }
  return url.href.replace(/\/+$/, '')
}

export function frontendOrigin(value: string | undefined, production: boolean): string {
  const raw = value?.trim() || (production ? '' : 'http://localhost:3000')
  const message = 'Configure FRONTEND_URL/origens CORS com protocolo e domínio, sem subpasta (HTTPS em produção).'
  let url: URL
  try { url = new URL(raw) } catch { throw new Error(message) }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash ||
    url.pathname !== '/' || (production && (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) {
    throw new Error(message)
  }
  return url.origin
}
