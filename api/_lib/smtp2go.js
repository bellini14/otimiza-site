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

function readSmtpConfiguration(env) {
  const host = env.SMTP_HOST?.trim()
  const port = Number(env.SMTP_PORT?.trim())
  const user = env.SMTP_USER?.trim()
  const pass = env.SMTP_PASS?.trim()
  const sender = env.CONTACT_FROM_EMAIL?.trim()
  const recipient = env.CONTACT_TO_EMAIL?.trim()

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !pass || !sender || !recipient) {
    throw new ContactEmailConfigurationError()
  }

  return { host, port, user, pass, sender, recipient }
}

async function defaultCreateTransport(options) {
  const { default: nodemailer } = await import('nodemailer')
  return nodemailer.createTransport(options)
}

export async function sendContactEmail(contact, { createTransport, env = globalThis.process?.env || {} } = {}) {
  const { host, port, user, pass, sender, recipient } = readSmtpConfiguration(env)
  const fullName = `${contact.firstName} ${contact.lastName}`
  const escapedName = escapeHtml(fullName)
  const escapedEmail = escapeHtml(contact.email)
  const escapedMessage = escapeHtml(contact.message).replaceAll('\n', '<br>')
  const textBody = [
    'Nova mensagem enviada pelo site da Otimiza',
    '',
    `Nome: ${fullName}`,
    `E-mail: ${contact.email}`,
    '',
    contact.message,
  ].join('\n')

  const makeTransport = createTransport || defaultCreateTransport
  let transport
  try {
    transport = await makeTransport({
      host,
      port,
      secure: port === 465 || port === 8465 || port === 443,
      auth: { user, pass },
    })
    await transport.sendMail({
      from: sender,
      to: recipient,
      replyTo: contact.email,
      subject: `Contato pelo site — ${fullName}`,
      text: textBody,
      html: `<h2>Nova mensagem enviada pelo site da Otimiza</h2><p><strong>Nome:</strong> ${escapedName}<br><strong>E-mail:</strong> ${escapedEmail}</p><p>${escapedMessage}</p>`,
    })
  } catch {
    throw new ContactEmailProviderError()
  }
}
