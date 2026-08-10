import { describe, expect, it, vi } from 'vitest'
import { createAccessHandler } from './access.js'

function response() {
  return {
    statusCode: 200,
    body: null,
    setHeader: vi.fn(),
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
  }
}

describe('memorial access handler', () => {
  it('authorizes a configured invite without exposing email', async () => {
    const handler = createAccessHandler({
      findInvite: () => ({ name: 'Ana' }),
      deriveKey: () => 'private-key',
      store: { findByInviteKey: vi.fn().mockResolvedValue(null) },
      createSession: ({ intent }) => `token-${intent}`,
    })
    const res = response()
    await handler({ method: 'POST', body: { email: 'ana@example.com', intent: 'contribute' } }, res)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      name: 'Ana',
      hasNote: false,
      sessionToken: 'token-contribute',
      note: null,
    })
    expect(JSON.stringify(res.body)).not.toContain('ana@example.com')
  })

  it('returns a generic forbidden error for an unknown email', async () => {
    const handler = createAccessHandler({
      findInvite: () => null,
      deriveKey: () => 'opaque-key',
    })
    const res = response()
    await handler({ method: 'POST', body: { email: 'no@example.com', intent: 'contribute' } }, res)
    expect(res.statusCode).toBe(403)
    expect(res.body.error.code).toBe('INVITE_NOT_FOUND')
  })

  it('throttles repeated failed access attempts', async () => {
    const handler = createAccessHandler({
      findInvite: () => null,
      deriveKey: () => 'opaque-key',
      limiterOptions: { maxFailures: 1, windowMs: 60_000, now: () => 10 },
    })
    await handler({
      method: 'POST', body: { email: 'no@example.com', intent: 'contribute' },
    }, response())
    const res = response()
    await handler({
      method: 'POST', body: { email: 'no@example.com', intent: 'contribute' },
    }, res)
    expect(res.statusCode).toBe(429)
    expect(res.body.error.code).toBe('RATE_LIMITED')
  })
})
