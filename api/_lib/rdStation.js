export const NEWSLETTER_SOURCES = new Set([
  'otimiza-inspire-newsletter-page',
  'otimiza-inspire-sidebar',
  'otimiza-contact-page-newsletter',
  'otimiza-inspire-article-contact-newsletter',
  'otimiza-inspire-newsroom-contact-newsletter',
])

export class RDStationConfigurationError extends Error {
  constructor(message = 'RD Station is not configured.') {
    super(message)
    this.name = 'RDStationConfigurationError'
  }
}

export class RDStationProviderError extends Error {
  constructor(status) {
    super(`RD Station rejected the conversion with status ${status}.`)
    this.name = 'RDStationProviderError'
    this.status = status
  }
}

export async function sendNewsletterConversion(
  { email, name, source },
  { env = globalThis.process?.env || {}, fetchImpl = globalThis.fetch } = {},
) {
  if (!NEWSLETTER_SOURCES.has(source)) throw new Error('Invalid newsletter source.')

  const apiKey = env.RD_STATION_API_KEY?.trim()
  if (!apiKey) throw new RDStationConfigurationError()

  const payload = {
    conversion_identifier: source,
    email,
    ...(name?.trim() ? { name: name.trim() } : {}),
    legal_bases: [{ category: 'communications', type: 'consent', status: 'granted' }],
  }
  const response = await fetchImpl(
    `https://api.rd.services/platform/conversions?api_key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'CONVERSION', event_family: 'CDP', payload }),
    },
  )

  if (!response.ok) throw new RDStationProviderError(response.status)
}
