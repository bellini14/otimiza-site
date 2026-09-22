import { parseFormBody, protectForm, sendFormProtectionError } from './_lib/formProtection.js'
import {
  RDStationConfigurationError,
  RDStationProviderError,
  sendNewsletterConversion,
} from './_lib/rdStation.js'
import {
  NewsletterEmailConfigurationError,
  NewsletterEmailProviderError,
  sendNewsletterEmail,
} from './_lib/newsletterEmail.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NEWSLETTER_SIGNUP_SOURCES = new Set([
  'otimiza-inspire-newsletter-page',
  'otimiza-inspire-sidebar',
  'inspire-popup',
])

function normalize(body) {
  const source = typeof body === 'string' ? JSON.parse(body) : body
  return {
    name: typeof source?.name === 'string' ? source.name.trim() : '',
    email: typeof source?.email === 'string' ? source.email.trim().toLowerCase() : '',
    consent: source?.consent,
    source: typeof source?.source === 'string' ? source.source.trim() : '',
    company: typeof source?.company === 'string' ? source.company.trim() : '',
    turnstileToken: source?.turnstileToken,
  }
}

export function createNewsletterHandler({ sendConversion = sendNewsletterConversion, sendNotification = sendNewsletterEmail } = {}) {
  return async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Método não permitido.' }) }
  let data
  try { data = normalize(parseFormBody(req)) } catch (error) { if (sendFormProtectionError(res, error)) return res; return res.status(400).json({ error: 'Dados inválidos.' }) }
  if (data.company) return res.status(200).json({ message: 'Inscrição recebida.' })
  if ((!data.name && data.source !== 'inspire-popup') || data.name.length > 80 || data.email.length > 254 || !EMAIL_PATTERN.test(data.email) || data.consent !== true || !NEWSLETTER_SIGNUP_SOURCES.has(data.source)) {
    return res.status(400).json({ error: 'Revise os campos e confirme o consentimento.' })
  }
  let protection
  try {
    protection = await protectForm(req, data, 'newsletter')
    if (protection.duplicate) return res.status(200).json({ message: 'Inscrição confirmada. Bem-vindo ao Inspire.' })
    await sendConversion({ name: data.name, email: data.email, source: data.source })
    try {
      await sendNotification({ name: data.name, email: data.email, ...(data.source === 'inspire-popup' ? { source: data.source } : {}) })
    } catch {
      console.error('Newsletter notification failed after successful registration.')
    }
    await protection.complete()
    return res.status(200).json({ message: 'Inscrição confirmada. Bem-vindo ao Inspire.' })
  } catch (error) {
    await protection?.release?.()
    if (sendFormProtectionError(res, error)) return res
    if (error instanceof RDStationConfigurationError || error instanceof NewsletterEmailConfigurationError || error?.name === 'RDStationConfigurationError' || error?.name === 'NewsletterEmailConfigurationError') return res.status(503).json({ error: 'Serviço de newsletter ainda não configurado.' })
    if (error instanceof RDStationProviderError || error instanceof NewsletterEmailProviderError || error?.name === 'RDStationProviderError' || error?.name === 'NewsletterEmailProviderError') return res.status(502).json({ error: 'Não foi possível assinar agora. Tente novamente mais tarde.' })
    console.error('Newsletter request failed.', { source: data.source, category: 'unexpected' })
    return res.status(500).json({ error: 'Não foi possível assinar agora. Tente novamente mais tarde.' })
  }
  }
}

export default createNewsletterHandler()
