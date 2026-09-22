import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clientIp, parseFormBody, protectForm } from './formProtection.js'

const env = { TURNSTILE_SECRET_KEY: 'private-test-secret', VERCEL: '1' }
const req = { headers: { 'x-forwarded-for': '203.0.113.4', 'cf-connecting-ip': '1.1.1.1' } }
const data = { turnstileToken: 'token', email: 'ana@example.com', message: 'Hello' }
let store, fetchImpl
beforeEach(() => {
  store = {
    consume: vi.fn().mockResolvedValue({ allowed: true }),
    reserve: vi.fn().mockResolvedValue({ state: 'reserved', lease: 'owner' }),
    release: vi.fn().mockResolvedValue(), complete: vi.fn().mockResolvedValue(), cleanup: vi.fn().mockResolvedValue(),
  }
  fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, action: 'contact', hostname: 'www.otm.com.br' }) })
})
const run = (overrides = {}, value = data) => protectForm(req, value, 'contact', { env, store, fetchImpl, ...overrides })
describe('Turnstile and shared abuse protection', () => {
  it.each([undefined, '', 'a'.repeat(2049), 23])('rejects missing or malformed token %s', async (turnstileToken) => {
    await expect(run({}, { ...data, turnstileToken })).rejects.toMatchObject({ status: 400 })
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(store.reserve).not.toHaveBeenCalled()
  })
  it('fails closed when unconfigured', async () => {
    await expect(run({ env: {} })).rejects.toMatchObject({ status: 503 })
    expect(fetchImpl).not.toHaveBeenCalled()
  })
  it.each([
    { success: false, 'error-codes': ['timeout-or-duplicate'] },
    { success: true, action: 'newsletter', hostname: 'www.otm.com.br' },
    { success: true, action: 'contact', hostname: 'www.otm.com.br.evil.test' },
  ])('rejects replay, wrong action or hostname', async (result) => {
    fetchImpl.mockResolvedValue({ ok: true, json: async () => result })
    await expect(run()).rejects.toMatchObject({ status: 400 })
    expect(store.reserve).not.toHaveBeenCalled()
    expect(store.consume).toHaveBeenCalledTimes(1)
  })
  it('validates with fixed URL, bounded request and server secret', async () => {
    const job = await run()
    expect(job.duplicate).toBe(false)
    const [url, options] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify')
    expect(JSON.parse(options.body)).toEqual({ secret: env.TURNSTILE_SECRET_KEY, response: 'token' })
    expect(options.signal).toBeDefined()
    expect(store.consume.mock.calls[0].slice(1)).toEqual([10, 600])
    expect(store.consume.mock.calls[1].slice(1)).toEqual([3, 3600])
    expect(JSON.stringify(store.consume.mock.calls)).not.toContain('ana@example.com')
    expect(JSON.stringify(store.consume.mock.calls)).not.toContain('203.0.113.4')
    await job.complete()
    expect(store.complete).toHaveBeenCalledWith(expect.any(String), 'owner', 600)
  })
  it('blocks IP quota before Cloudflare and provides retry time', async () => {
    store.consume.mockResolvedValueOnce({ allowed: false, retryAfter: 42 })
    await expect(run()).rejects.toMatchObject({ status: 429, retryAfter: 42 })
    expect(fetchImpl).not.toHaveBeenCalled()
  })
  it('blocks email quota before providers and releases its own reservation', async () => {
    store.consume.mockResolvedValueOnce({ allowed: true }).mockResolvedValueOnce({ allowed: false, retryAfter: 300 })
    await expect(run()).rejects.toMatchObject({ status: 429 })
    expect(store.release).toHaveBeenCalledWith(expect.any(String), 'owner')
  })
  it('does not spend email quota on a completed duplicate', async () => {
    store.reserve.mockResolvedValue({ state: 'duplicate' })
    expect(await run()).toEqual({ duplicate: true })
    expect(store.consume).toHaveBeenCalledTimes(1)
  })
  it('does not report success while another request is pending', async () => {
    store.reserve.mockResolvedValue({ state: 'pending' })
    await expect(run()).rejects.toMatchObject({ status: 409 })
  })
  it('fails closed on verification timeout', async () => {
    fetchImpl.mockRejectedValue(new DOMException('timeout', 'TimeoutError'))
    await expect(run()).rejects.toMatchObject({ status: 503 })
    expect(store.reserve).not.toHaveBeenCalled()
  })
  it('fails closed on quota storage failure', async () => {
    store.consume.mockRejectedValue(new Error('offline'))
    await expect(run()).rejects.toMatchObject({ status: 503 })
    expect(fetchImpl).not.toHaveBeenCalled()
  })
  it('deduplicates newsletter across entry points', async () => {
    fetchImpl.mockResolvedValue({ ok: true, json: async () => ({ success: true, hostname: 'www.otm.com.br', action: 'newsletter' }) })
    for (const source of ['inspire-popup', 'otimiza-inspire-sidebar']) {
      await protectForm(req, { ...data, source }, 'newsletter', { env, store, fetchImpl })
    }
    expect(store.reserve.mock.calls[0][0]).toBe(store.reserve.mock.calls[1][0])
  })
  it('ignores spoofable headers outside Vercel and aggregates IPv6 /64', () => {
    expect(clientIp({ ...req, socket: { remoteAddress: '127.0.0.1' } }, {})).toBe('127.0.0.1')
    expect(clientIp({ headers: { 'x-forwarded-for': '2001:db8::1' } }, env)).toBe(clientIp({ headers: { 'x-forwarded-for': '2001:db8::beef' } }, env))
    expect(() => clientIp({ headers: { 'x-forwarded-for': 'bad,203.0.113.4' } }, env)).toThrow()
  })
  it('rejects oversized actual body even without content length', () => {
    expect(() => parseFormBody({ body: { value: 'x'.repeat(32769) } })).toThrow(expect.objectContaining({ status: 413 }))
    expect(() => parseFormBody({ body: 'null' })).toThrow()
  })
})
