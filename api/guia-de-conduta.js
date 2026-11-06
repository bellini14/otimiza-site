import { parseFormBody, protectForm, sendFormProtectionError } from './_lib/formProtection.js'
import { sendGuideEmail, sendGuideLeadNotification } from './_lib/guideEmail.js'
import {
  RDStationConfigurationError,
  RDStationProviderError,
  sendGuideLeadConversion,
  sendNewsletterConversion,
} from './_lib/rdStation.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NEWSLETTER_SOURCE = 'otimiza-guia-de-conduta-newsletter'
const LIMITS = { name: 80, email: 254, companyName: 120 }

function normalize(source) {
  const text = (value) => (typeof value === 'string' ? value.trim() : '')
  return {
    name: text(source?.name),
    email: text(source?.email).toLowerCase(),
    companyName: text(source?.companyName),
    newsletterConsent: source?.newsletterConsent === true,
    website: text(source?.website),
    turnstileToken: source?.turnstileToken,
  }
}

function isValid(lead) {
  return (
    lead.name.length > 0 && lead.name.length <= LIMITS.name
    && lead.email.length <= LIMITS.email && EMAIL_PATTERN.test(lead.email)
    && lead.companyName.length > 0 && lead.companyName.length <= LIMITS.companyName
  )
}

export function createGuideLeadHandler({
  sendLead = sendGuideLeadConversion,
  sendNewsletter = sendNewsletterConversion,
  sendGuide = sendGuideEmail,
  notifyTeam = sendGuideLeadNotification,
  protect = protectForm,
} = {}) {
  return async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({ error: 'Método não permitido.' })
    }

    let lead
    try {
      lead = normalize(parseFormBody(req))
    } catch (error) {
      if (sendFormProtectionError(res, error)) return res
      return res.status(400).json({ error: 'Dados inválidos.' })
    }

    // Honeypot: bots preenchem o campo oculto; respondemos sucesso sem registrar.
    if (lead.website) return res.status(200).json({ message: 'Recebido.' })

    if (!isValid(lead)) {
      return res.status(400).json({ error: 'Revise os campos e tente novamente.' })
    }

    let protection
    try {
      protection = await protect(req, lead, 'guia-de-conduta')
      if (protection.duplicate) return res.status(200).json({ message: 'Tudo certo. Seu Guia de Conduta está liberado.' })
      await sendLead({
        name: lead.name,
        email: lead.email,
        companyName: lead.companyName,
        newsletterConsent: lead.newsletterConsent,
      })
    } catch (error) {
      await protection?.release?.()
      if (sendFormProtectionError(res, error)) return res
      if (error instanceof RDStationConfigurationError) {
        return res.status(503).json({ error: 'Serviço ainda não configurado. Tente novamente mais tarde.' })
      }
      if (error instanceof RDStationProviderError) {
        return res.status(502).json({ error: 'Não foi possível concluir agora. Tente novamente mais tarde.' })
      }
      console.error('Guide lead request failed.', { category: error?.name || 'unexpected' })
      return res.status(500).json({ error: 'Não foi possível concluir agora. Tente novamente mais tarde.' })
    }

    // O lead já está no RD. Os e-mails abaixo não bloqueiam a resposta:
    // o download também fica disponível na própria página.
    const contact = { name: lead.name, email: lead.email, companyName: lead.companyName, newsletterConsent: lead.newsletterConsent }
    let emailSent = false
    try {
      await sendGuide(contact)
      emailSent = true
    } catch (error) {
      console.error('Guide email delivery failed.', { category: error?.name || 'unexpected' })
    }
    try {
      await notifyTeam(contact)
    } catch (error) {
      console.error('Guide lead team notification failed.', { category: error?.name || 'unexpected' })
    }

    // Com aceite, a pessoa vira assinante do Inspire no RD. O e-mail de
    // boas-vindas do Inspire não é enviado aqui: o e-mail do guia já avisa
    // sobre a inscrição, para que o leitor receba uma única mensagem.
    if (lead.newsletterConsent) {
      try {
        await sendNewsletter({ name: lead.name, email: lead.email, source: NEWSLETTER_SOURCE })
      } catch (error) {
        console.error('Optional newsletter registration failed.', {
          source: NEWSLETTER_SOURCE,
          status: error?.status,
          category: error?.name || 'unexpected',
        })
      }
    }

    await protection.complete()
    return res.status(200).json({ message: 'Tudo certo. Seu Guia de Conduta está liberado.', emailSent })
  }
}

export default createGuideLeadHandler()
