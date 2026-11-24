import assert from 'node:assert/strict'
import test from 'node:test'
import { once } from 'node:events'

test('HTTP smoke: health, CORS, validation and unauthenticated access without a database', async () => {
  process.env.NODE_ENV = 'production'
  process.env.FRONTEND_URL = 'https://frontend.example.com'
  process.env.ALLOWED_ORIGINS = 'https://extra.example.com/'
  process.env.JWT_SECRET = 'test-only-secret-with-at-least-32-characters'
  delete process.env.DATABASE_URL
  const { default: app } = await import('./app')
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  const base = `http://127.0.0.1:${address.port}/api/v1`
  try {
    const health = await fetch(`${base}/health`, { headers: { Origin: process.env.FRONTEND_URL } })
    assert.equal(health.status, 200)
    assert.equal(health.headers.get('access-control-allow-origin'), process.env.FRONTEND_URL)
    assert.deepEqual(await health.json(), { status: 'ok', service: 'mentor-estudantil-api' })
    const preflight = await fetch(`${base}/tasks`, { method: 'OPTIONS', headers: { Origin: 'https://extra.example.com', 'Access-Control-Request-Method': 'PATCH', 'Access-Control-Request-Headers': 'authorization,content-type' } })
    assert.equal(preflight.status, 204)
    assert.match(preflight.headers.get('access-control-allow-methods') ?? '', /PATCH/)
    assert.equal((await fetch(`${base}/tasks`, { headers: { Origin: 'https://evil.example.com' } })).status, 403)
    assert.equal((await fetch(`${base}/tasks`, { headers: { Origin: 'http://localhost:3000' } })).status, 403)
    for (const path of ['/tasks', '/auth/me']) {
      assert.equal((await fetch(`${base}${path}`)).status, 401)
      assert.equal((await fetch(`${base}${path}`, { headers: { Authorization: 'Bearer invalid' } })).status, 401)
    }
    for (const path of ['/billing/checkout', '/billing/confirm', '/billing/cancel']) {
      assert.equal((await fetch(base + path, { method: 'POST' })).status, 404)
    }
    assert.equal((await fetch(base + '/billing/subscription')).status, 404)
    const invalid = await fetch(`${base}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    assert.equal(invalid.status, 400)
    assert.equal((await fetch(`${base}/missing`)).status, 404)
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  }
})
