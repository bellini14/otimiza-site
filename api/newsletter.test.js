import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createNewsletterHandler } from './newsletter.js'

const conversionMock = vi.fn()
let handler

function response() {
  return { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; return this }, status(v) { this.statusCode = v; return this }, json(v) { this.body = v; return this } }
}

const valid = { name: ' Maria ', email: ' Reader@Example.com ', consent: true, source: 'otimiza-inspire-newsletter-page', company: '' }

beforeEach(() => {
  conversionMock.mockReset()
  handler = createNewsletterHandler({ sendConversion: conversionMock })
})

describe('newsletter API', () => {
  it('allows only POST', async () => { const res = response(); await handler({ method: 'GET' }, res); expect(res.statusCode).toBe(405); expect(res.headers.Allow).toBe('POST') })
  it.each([
    { ...valid, email: 'bad' },
    { ...valid, consent: false },
    { ...valid, consent: 'true' },
    { ...valid, source: 'unknown' },
    { ...valid, name: 'x'.repeat(81) },
  ])('rejects invalid data', async (body) => { const res = response(); await handler({ method: 'POST', body }, res); expect(res.statusCode).toBe(400); expect(conversionMock).not.toHaveBeenCalled() })
  it('accepts honeypot spam without conversion', async () => { const res = response(); await handler({ method: 'POST', body: { ...valid, company: 'spam' } }, res); expect(res.statusCode).toBe(200); expect(conversionMock).not.toHaveBeenCalled() })
  it('normalizes and sends a valid conversion', async () => { conversionMock.mockResolvedValue(); const res = response(); await handler({ method: 'POST', body: valid }, res); expect(res.statusCode).toBe(200); expect(conversionMock).toHaveBeenCalledWith({ name: 'Maria', email: 'reader@example.com', source: valid.source }) })
  it('maps missing configuration safely', async () => {
    conversionMock.mockImplementation(async () => { throw { name: 'RDStationConfigurationError' } })
    const res = response()
    await handler({ method: 'POST', body: valid }, res)
    expect(res.statusCode).toBe(503)
  })
  it('maps provider rejection safely', async () => {
    conversionMock.mockImplementation(async () => { throw { name: 'RDStationProviderError', status: 429 } })
    const res = response()
    await handler({ method: 'POST', body: valid }, res)
    expect(res.statusCode).toBe(502)
  })
})
