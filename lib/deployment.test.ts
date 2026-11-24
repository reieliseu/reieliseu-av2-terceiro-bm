import assert from 'node:assert/strict'
import test from 'node:test'
import { apiUrl, frontendOrigin } from './deployment'

test('production API requires an explicit HTTPS /api/v1 URL without credentials', () => {
  for (const value of [undefined, '', '/api/v1', 'http://api.example.com/api/v1', 'https://localhost/api/v1', 'https://api.example.com', 'https://user:secret@api.example.com/api/v1', 'https://api.example.com/api/v1?q=1']) {
    assert.throws(() => apiUrl(value, true))
  }
  assert.equal(apiUrl('https://api.example.com/api/v1/', true), 'https://api.example.com/api/v1')
  assert.equal(apiUrl(undefined, false), 'http://localhost:4000/api/v1')
})

test('CORS origin accepts only protocol and host; never a public subfolder', () => {
  assert.equal(frontendOrigin('https://institution.example.com/', true), 'https://institution.example.com')
  for (const value of [undefined, '*', 'https://institution.example.com/tecti/group', 'http://localhost:3000', 'https://example.com?x=1']) {
    assert.throws(() => frontendOrigin(value, true))
  }
})
