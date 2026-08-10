import {
  NEWSLETTER_SOURCES,
  RDStationConfigurationError,
  RDStationProviderError,
  sendNewsletterConversion,
} from './_lib/rdStation.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalize(body) {
  const source = typeof body === 'string' ? JSON.parse(body) : body
  return {
    name: typeof source?.name === 'string' ? source.name.trim() : '',
    email: typeof source?.email === 'string' ? source.email.trim().toLowerCase() : '',
    consent: source?.consent,
    source: typeof source?.source === 'string' ? source.source.trim() : '',
    company: typeof source?.company === 'string' ? source.company.trim() : '',
  }
}

export function createNewsletterHandler({ sendConversion = sendNewsletterConversion } = {}) {
  return async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Método não permitido.' }) }
  let data
  try { data = normalize(req.body) } catch { return res.status(400).json({ error: 'Dados inválidos.' }) }
  if (data.company) return res.status(200).json({ message: 'Inscrição recebida.' })
  if (data.name.length > 80 || data.email.length > 254 || !EMAIL_PATTERN.test(data.email) || data.consent !== true || !NEWSLETTER_SOURCES.has(data.source)) {
    return res.status(400).json({ error: 'Revise os campos e confirme o consentimento.' })
  }
  try {
    await sendConversion({ name: data.name, email: data.email, source: data.source })
    return res.status(200).json({ message: 'Inscrição confirmada. Bem-vindo ao Inspire.' })
  } catch (error) {
    if (error instanceof RDStationConfigurationError || error?.name === 'RDStationConfigurationError') return res.status(503).json({ error: 'Serviço de newsletter ainda não configurado.' })
    if (error instanceof RDStationProviderError || error?.name === 'RDStationProviderError') return res.status(502).json({ error: 'Não foi possível assinar agora. Tente novamente mais tarde.' })
    console.error('Newsletter request failed.', { source: data.source, category: 'unexpected' })
    return res.status(500).json({ error: 'Não foi possível assinar agora. Tente novamente mais tarde.' })
  }
  }
}

export default createNewsletterHandler()
