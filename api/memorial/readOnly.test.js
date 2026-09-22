import { describe, expect, it } from 'vitest'
import access from './access.js'
import notes from './notes.js'
import mutate from './notes/[id].js'

function response() {
  return { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k] = v }, status(code) { this.statusCode = code; return this }, json(body) { this.body = body; return this } }
}
describe('read-only memorial endpoints', () => {
  it.each([['access', access, 'POST'], ['notes', notes, 'POST'], ['mutation', mutate, 'PATCH'], ['mutation', mutate, 'DELETE']])('blocks %s %s', async (_name, handler, method) => {
    const res = response()
    await handler({ method, headers: { authorization: 'Bearer previously-issued-token' }, body: { email: 'known@example.com', message: 'Changed', showName: true }, query: { id: 'existing-note' } }, res)
    expect(res.statusCode).toBe(405)
    expect(res.body.error.code).toBe('MEMORIAL_READ_ONLY')
    expect(res.body.sessionToken).toBeUndefined()
  })
})
