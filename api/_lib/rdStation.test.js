import { describe, expect, it, vi } from 'vitest'
import {
  NEWSLETTER_SOURCES,
  RDStationConfigurationError,
  RDStationProviderError,
  sendNewsletterConversion,
} from './rdStation.js'

const apiKey = 'test-api-key'

describe('RD Station conversion adapter', () => {
  it('accepts only the five configured newsletter sources', () => {
    expect([...NEWSLETTER_SOURCES]).toEqual([
      'otimiza-inspire-newsletter-page',
      'otimiza-inspire-sidebar',
      'otimiza-contact-page-newsletter',
      'otimiza-inspire-article-contact-newsletter',
      'otimiza-inspire-newsroom-contact-newsletter',
    ])
  })

  it('sends a minimal consent conversion without leaking unrelated data', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 })

    await sendNewsletterConversion({
      email: 'reader@example.com',
      name: 'Maria Leitora',
      source: 'otimiza-inspire-newsletter-page',
      message: 'must not be sent',
    }, { env: { RD_STATION_API_KEY: apiKey }, fetchImpl })

    const [url, request] = fetchImpl.mock.calls[0]
    expect(url).toBe(`https://api.rd.services/platform/conversions?api_key=${apiKey}`)
    expect(request).toMatchObject({ method: 'POST', headers: { 'Content-Type': 'application/json' } })
    expect(JSON.parse(request.body)).toEqual({
      event_type: 'CONVERSION',
      event_family: 'CDP',
      payload: {
        conversion_identifier: 'otimiza-inspire-newsletter-page',
        email: 'reader@example.com',
        name: 'Maria Leitora',
        legal_bases: [{ category: 'communications', type: 'consent', status: 'granted' }],
      },
    })
  })

  it('omits an empty optional name', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    await sendNewsletterConversion({
      email: 'reader@example.com', name: '', source: 'otimiza-inspire-sidebar',
    }, { env: { RD_STATION_API_KEY: apiKey }, fetchImpl })
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).payload).not.toHaveProperty('name')
  })

  it('rejects unknown conversion sources before calling the provider', async () => {
    const fetchImpl = vi.fn()
    await expect(sendNewsletterConversion({
      email: 'reader@example.com', source: 'unknown',
    }, { env: { RD_STATION_API_KEY: apiKey }, fetchImpl })).rejects.toThrow('Invalid newsletter source')
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('throws a configuration error when the key is absent', async () => {
    await expect(sendNewsletterConversion({
      email: 'reader@example.com', source: 'otimiza-inspire-sidebar',
    }, { env: {}, fetchImpl: vi.fn() })).rejects.toBeInstanceOf(RDStationConfigurationError)
  })

  it('throws a safe provider error containing only the HTTP status', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 429 })
    let error
    try {
      await sendNewsletterConversion({
        email: 'private@example.com', source: 'otimiza-inspire-sidebar',
      }, { env: { RD_STATION_API_KEY: apiKey }, fetchImpl })
    } catch (caught) {
      error = caught
    }
    expect(error).toBeInstanceOf(RDStationProviderError)
    expect(error.status).toBe(429)
    expect(error.message).not.toContain('private@example.com')
    expect(error.message).not.toContain(apiKey)
  })
})
