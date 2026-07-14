import {
  ContactEmailConfigurationError,
  ContactEmailProviderError,
  sendContactEmail,
} from './_lib/smtp2go.js'

const FIELD_LIMITS = {
  firstName: 80,
  lastName: 80,
  email: 254,
  message: 5000,
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeBody(body) {
  const source = typeof body === 'string' ? JSON.parse(body) : body

  return {
    firstName: typeof source?.firstName === 'string' ? source.firstName.trim() : '',
    lastName: typeof source?.lastName === 'string' ? source.lastName.trim() : '',
    email: typeof source?.email === 'string' ? source.email.trim().toLowerCase() : '',
    message: typeof source?.message === 'string' ? source.message.trim() : '',
    company: typeof source?.company === 'string' ? source.company.trim() : '',
  }
}

function isValidContact(contact) {
  return (
    contact.firstName.length > 0
    && contact.firstName.length <= FIELD_LIMITS.firstName
    && contact.lastName.length > 0
    && contact.lastName.length <= FIELD_LIMITS.lastName
    && contact.email.length <= FIELD_LIMITS.email
    && EMAIL_PATTERN.test(contact.email)
    && contact.message.length > 0
    && contact.message.length <= FIELD_LIMITS.message
  )
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  let contact
  try {
    contact = normalizeBody(req.body)
  } catch {
    return res.status(400).json({ error: 'Dados inválidos.' })
  }

  if (contact.company) {
    return res.status(200).json({ message: 'Mensagem recebida.' })
  }

  if (!isValidContact(contact)) {
    return res.status(400).json({ error: 'Revise os campos e tente novamente.' })
  }

  try {
    await sendContactEmail(contact)
    return res.status(200).json({ message: 'Mensagem recebida. Em breve entraremos em contato.' })
  } catch (error) {
    if (error instanceof ContactEmailConfigurationError) {
      return res.status(503).json({ error: 'Serviço de e-mail ainda não configurado.' })
    }

    if (error instanceof ContactEmailProviderError) {
      return res.status(502).json({ error: 'Não foi possível enviar agora. Tente novamente mais tarde.' })
    }

    console.error('Failed to process contact request.', error)
    return res.status(500).json({ error: 'Não foi possível enviar agora. Tente novamente mais tarde.' })
  }
}
