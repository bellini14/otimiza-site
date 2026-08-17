import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createNewsletterHandler } from './newsletter.js'

const conversionMock = vi.fn()
const notificationMock = vi.fn()
let handler

function response() {
  return { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; return this }, status(v) { this.statusCode = v; return this }, json(v) { this.body = v; return this } }
}

const valid = { name: ' Maria ', email: ' Reader@Example.com ', consent: true, source: 'otimiza-inspire-newsletter-page', company: '' }

beforeEach(() => {
  conversionMock.mockReset()
  notificationMock.mockReset()
  handler = createNewsletterHandler({ sendConversion: conversionMock, sendNotification: notificationMock })
})

describe('newsletter API', () => {
  it('allows only POST', async () => { const res = response(); await handler({ method: 'GET' }, res); expect(res.statusCode).toBe(405); expect(res.headers.Allow).toBe('POST') })
  it.each([
    { ...valid, email: 'bad' },
    { ...valid, consent: false },
    { ...valid, consent: 'true' },
    { ...valid, source: 'unknown' },
    { ...valid, source: 'otimiza-contact-page-newsletter' },
    { ...valid, name: '   ' },
    { ...valid, name: 'x'.repeat(81) },
  ])('rejects invalid data', async (body) => { const res = response(); await handler({ method: 'POST', body }, res); expect(res.statusCode).toBe(400); expect(conversionMock).not.toHaveBeenCalled(); expect(notificationMock).not.toHaveBeenCalled() })
  it('accepts honeypot spam without conversion', async () => { const res = response(); await handler({ method: 'POST', body: { ...valid, company: 'spam' } }, res); expect(res.statusCode).toBe(200); expect(conversionMock).not.toHaveBeenCalled() })
  it('runs the conversion before notifying with normalized subscriber data', async () => {
    const calls = []
    conversionMock.mockImplementation(async () => { calls.push('conversion') })
    notificationMock.mockImplementation(async (subscriber) => { calls.push('notification'); expect(subscriber).toEqual({ name: 'Maria', email: 'reader@example.com' }) })
    const res = response()
    await handler({ method: 'POST', body: valid }, res)
    expect(res.statusCode).toBe(200)
    expect(conversionMock).toHaveBeenCalledWith({ name: 'Maria', email: 'reader@example.com', source: valid.source })
    expect(notificationMock).toHaveBeenCalledWith({ name: 'Maria', email: 'reader@example.com' })
    expect(calls).toEqual(['conversion', 'notification'])
  })
  it('maps missing configuration safely', async () => {
    conversionMock.mockImplementation(async () => { throw { name: 'RDStationConfigurationError' } })
    const res = response()
    await handler({ method: 'POST', body: valid }, res)
    expect(res.statusCode).toBe(503)
    expect(notificationMock).not.toHaveBeenCalled()
  })
  it('maps provider rejection safely', async () => {
    conversionMock.mockImplementation(async () => { throw { name: 'RDStationProviderError', status: 429 } })
    const res = response()
    await handler({ method: 'POST', body: valid }, res)
    expect(res.statusCode).toBe(502)
    expect(notificationMock).not.toHaveBeenCalled()
  })
  it.each([
    ['NewsletterEmailConfigurationError', 503, 'Serviço de newsletter ainda não configurado.'],
    ['NewsletterEmailProviderError', 502, 'Não foi possível assinar agora. Tente novamente mais tarde.'],
  ])('maps %s safely', async (name, status, error) => {
    conversionMock.mockResolvedValue()
    notificationMock.mockImplementation(async () => { throw { name } })
    const res = response()
    await handler({ method: 'POST', body: valid }, res)
    expect(res.statusCode).toBe(status)
    expect(res.body).toEqual({ error })
  })
})
