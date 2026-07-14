const SMTP2GO_SEND_URL = 'https://api.smtp2go.com/v3/email/send'

export class ContactEmailConfigurationError extends Error {
  constructor(message = 'Contact email service is not configured.') {
    super(message)
    this.name = 'ContactEmailConfigurationError'
  }
}

export class ContactEmailProviderError extends Error {
  constructor(message = 'Contact email provider rejected the request.') {
    super(message)
    this.name = 'ContactEmailProviderError'
  }
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function sendContactEmail(contact, { fetchImpl = fetch, env = globalThis.process?.env || {} } = {}) {
  const apiKey = env.SMTP2GO_API_KEY?.trim()
  const sender = env.CONTACT_FROM_EMAIL?.trim()
  const recipient = env.CONTACT_TO_EMAIL?.trim()

  if (!apiKey || !sender || !recipient) {
    throw new ContactEmailConfigurationError()
  }

  const fullName = `${contact.firstName} ${contact.lastName}`
  const escapedName = escapeHtml(fullName)
  const escapedEmail = escapeHtml(contact.email)
  const escapedMessage = escapeHtml(contact.message).replaceAll('\n', '<br>')
  const textBody = [
    `Nova mensagem enviada pelo site da Otimiza`,
    ``,
    `Nome: ${fullName}`,
    `E-mail: ${contact.email}`,
    ``,
    contact.message,
  ].join('\n')

  const response = await fetchImpl(SMTP2GO_SEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Smtp2go-Api-Key': apiKey,
    },
    body: JSON.stringify({
      sender,
      to: [recipient],
      subject: `Contato pelo site — ${fullName}`,
      text_body: textBody,
      html_body: `<h2>Nova mensagem enviada pelo site da Otimiza</h2><p><strong>Nome:</strong> ${escapedName}<br><strong>E-mail:</strong> ${escapedEmail}</p><p>${escapedMessage}</p>`,
      custom_headers: [{ header: 'Reply-To', value: contact.email }],
    }),
  })

  let responseBody
  try {
    responseBody = await response.json()
  } catch {
    responseBody = null
  }

  if (!response.ok || responseBody?.data?.failed > 0 || responseBody?.data?.error) {
    throw new ContactEmailProviderError()
  }
}
