import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGuideLeadHandler } from './guia-de-conduta.js'
import { RDStationConfigurationError, RDStationProviderError, sendGuideLeadConversion } from './_lib/rdStation.js'

const leadMock = vi.fn()
const newsletterMock = vi.fn()
const welcomeMock = vi.fn()
let handler

function response() {
  return { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; return this }, status(v) { this.statusCode = v; return this }, json(v) { this.body = v; return this } }
}

const valid = { name: ' Ana Souza ', email: ' Ana@Empresa.com.br ', companyName: ' Empresa X ', newsletterConsent: false, website: '' }

beforeEach(() => {
  leadMock.mockReset()
  newsletterMock.mockReset()
  welcomeMock.mockReset()
  handler = createGuideLeadHandler({
    sendLead: leadMock, sendNewsletter: newsletterMock, sendWelcome: welcomeMock,
    protect: vi.fn().mockResolvedValue({ duplicate: false, release: vi.fn(), complete: vi.fn() }),
  })
})

describe('guia de conduta lead API', () => {
  it('allows only POST', async () => {
    const res = response()
    await handler({ method: 'GET' }, res)
    expect(res.statusCode).toBe(405)
    expect(res.headers.Allow).toBe('POST')
  })

  it('sends the normalized lead to RD without newsletter when consent is not given', async () => {
    const res = response()
    await handler({ method: 'POST', body: valid }, res)
    expect(res.statusCode).toBe(200)
    expect(leadMock).toHaveBeenCalledWith({ name: 'Ana Souza', email: 'ana@empresa.com.br', companyName: 'Empresa X', newsletterConsent: false })
    expect(newsletterMock).not.toHaveBeenCalled()
    expect(welcomeMock).not.toHaveBeenCalled()
  })

  it('registers the newsletter only with an explicit boolean consent', async () => {
    const res = response()
    await handler({ method: 'POST', body: { ...valid, newsletterConsent: true } }, res)
    expect(res.statusCode).toBe(200)
    expect(leadMock).toHaveBeenCalledWith(expect.objectContaining({ newsletterConsent: true }))
    expect(newsletterMock).toHaveBeenCalledWith({ name: 'Ana Souza', email: 'ana@empresa.com.br', source: 'otimiza-guia-de-conduta-newsletter' })
    expect(welcomeMock).toHaveBeenCalled()

    leadMock.mockReset()
    newsletterMock.mockReset()
    await handler({ method: 'POST', body: { ...valid, newsletterConsent: 'true' } }, response())
    expect(leadMock).toHaveBeenCalledWith(expect.objectContaining({ newsletterConsent: false }))
    expect(newsletterMock).not.toHaveBeenCalled()
  })

  it('still succeeds when the optional newsletter step fails', async () => {
    newsletterMock.mockRejectedValue(new Error('down'))
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = response()
    await handler({ method: 'POST', body: { ...valid, newsletterConsent: true } }, res)
    expect(res.statusCode).toBe(200)
    spy.mockRestore()
  })

  it.each([
    { ...valid, email: 'bad' },
    { ...valid, name: '  ' },
    { ...valid, companyName: '' },
    { ...valid, name: 'x'.repeat(81) },
  ])('rejects invalid data', async (body) => {
    const res = response()
    await handler({ method: 'POST', body }, res)
    expect(res.statusCode).toBe(400)
    expect(leadMock).not.toHaveBeenCalled()
  })

  it('rejects submissions that fail the security check', async () => {
    const { FormProtectionError } = await import('./_lib/formProtection.js')
    const blocked = createGuideLeadHandler({ sendLead: leadMock, protect: vi.fn().mockRejectedValue(new FormProtectionError(400, 'Confirme a verificação de segurança e tente novamente.')) })
    const res = response()
    await blocked({ method: 'POST', body: valid }, res)
    expect(res.statusCode).toBe(400)
    expect(leadMock).not.toHaveBeenCalled()
  })

  it('accepts honeypot spam without sending to RD', async () => {
    const res = response()
    await handler({ method: 'POST', body: { ...valid, website: 'spam' } }, res)
    expect(res.statusCode).toBe(200)
    expect(leadMock).not.toHaveBeenCalled()
  })

  it('maps RD configuration and provider errors', async () => {
    leadMock.mockRejectedValueOnce(new RDStationConfigurationError())
    const a = response()
    await handler({ method: 'POST', body: valid }, a)
    expect(a.statusCode).toBe(503)

    leadMock.mockRejectedValueOnce(new RDStationProviderError(500))
    const b = response()
    await handler({ method: 'POST', body: valid }, b)
    expect(b.statusCode).toBe(502)
  })
})

describe('sendGuideLeadConversion', () => {
  const env = { RD_STATION_API_KEY: 'test-api-key' }

  it('sends name, company and tag, with consent legal basis only when granted', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true })
    await sendGuideLeadConversion({ email: 'ana@empresa.com.br', name: 'Ana', companyName: 'Empresa X' }, { env, fetchImpl })
    const first = JSON.parse(fetchImpl.mock.calls[0][1].body).payload
    expect(first).toEqual({ conversion_identifier: 'otimiza-guia-de-conduta', email: 'ana@empresa.com.br', tags: ['guia-de-conduta'], name: 'Ana', company_name: 'Empresa X' })

    await sendGuideLeadConversion({ email: 'ana@empresa.com.br', name: 'Ana', companyName: 'Empresa X', newsletterConsent: true }, { env, fetchImpl })
    const second = JSON.parse(fetchImpl.mock.calls[1][1].body).payload
    expect(second.legal_bases).toEqual([{ category: 'communications', type: 'consent', status: 'granted' }])
  })

  it('throws a configuration error without an API key', async () => {
    await expect(sendGuideLeadConversion({ email: 'a@b.co' }, { env: {}, fetchImpl: vi.fn() })).rejects.toBeInstanceOf(RDStationConfigurationError)
  })
})
