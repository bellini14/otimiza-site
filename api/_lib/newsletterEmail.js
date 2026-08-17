export class NewsletterEmailConfigurationError extends Error {
  constructor(message = 'Newsletter email service is not configured.') {
    super(message)
    this.name = 'NewsletterEmailConfigurationError'
  }
}

export class NewsletterEmailProviderError extends Error {
  constructor(message = 'Newsletter email provider rejected the request.') {
    super(message)
    this.name = 'NewsletterEmailProviderError'
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

function isNonPublicIpv4(hostname) {
  const parts = hostname.split('.').map(Number)

  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false

  const [first, second] = parts
  return first === 0 || first === 10 || first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
}

function ipv6ToBigInt(hostname) {
  const [left, right] = hostname.split('::')
  if (hostname.split('::').length > 2) return null

  const leftGroups = left ? left.split(':') : []
  const rightGroups = right ? right.split(':') : []
  const groups = hostname.includes('::')
    ? [...leftGroups, ...Array(8 - leftGroups.length - rightGroups.length).fill('0'), ...rightGroups]
    : leftGroups
  if (groups.length !== 8 || groups.some((group) => !/^[0-9a-f]{1,4}$/i.test(group))) return null

  return groups.reduce((address, group) => (address << 16n) + BigInt(`0x${group}`), 0n)
}

function isNonPublicIpv6(hostname) {
  const address = ipv6ToBigInt(hostname)
  if (address === null) return false

  const isIpv4Mapped = address >> 32n === 0xffffn
  const isIpv4Compatible = address !== 0n && address >> 32n === 0n
  if (isIpv4Mapped || isIpv4Compatible) {
    const ipv4 = Number(address & 0xffffffffn)
    const mappedHostname = [
      ipv4 >>> 24,
      (ipv4 >>> 16) & 255,
      (ipv4 >>> 8) & 255,
      ipv4 & 255,
    ].join('.')
    return mappedHostname.startsWith('127.') || isNonPublicIpv4(mappedHostname)
  }

  return address === 0n || address === 1n ||
    address >> 121n === 0x7en ||
    address >> 118n === 0x3fan ||
    address >> 118n === 0x3fbn ||
    address >> 120n === 0xffn
}

function readLogoUrl(siteUrl) {
  try {
    const url = new URL(siteUrl)
    const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
    const isLocal = hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')
    const isNonPublicIp = isNonPublicIpv4(hostname) || (hostname.includes(':') && isNonPublicIpv6(hostname))
    const isVercelPreviewAlias = /-git-[a-z0-9-]+\.vercel\.app$/i.test(hostname)
    const isVercelDeploymentPreview = /-[a-z0-9]{6,}-[a-z0-9-]+\.vercel\.app$/i.test(hostname)

    if (url.protocol !== 'https:' || isLocal || isNonPublicIp || isVercelPreviewAlias || isVercelDeploymentPreview || url.pathname !== '/' || url.search || url.hash) throw new Error()

    return new URL('/inspire-email-logo.png', url).href
  } catch {
    throw new NewsletterEmailConfigurationError()
  }
}

function readSmtpConfiguration(env) {
  const host = env.SMTP_HOST?.trim()
  const port = Number(env.SMTP_PORT?.trim())
  const user = env.SMTP_USER?.trim()
  const pass = env.SMTP_PASS?.trim()
  const sender = env.CONTACT_FROM_EMAIL?.trim()
  const recipient = env.NEWSLETTER_TO_EMAIL?.trim() || env.CONTACT_TO_EMAIL?.trim()
  const logoUrl = readLogoUrl(env.VITE_SITE_URL?.trim())

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !pass || !sender || !recipient) {
    throw new NewsletterEmailConfigurationError()
  }

  return { host, port, user, pass, sender, recipient, logoUrl }
}

async function defaultCreateTransport(options) {
  const { default: nodemailer } = await import('nodemailer')
  return nodemailer.createTransport(options)
}

export async function sendNewsletterEmail(subscriber, { createTransport, env = globalThis.process?.env || {} } = {}) {
  const { host, port, user, pass, sender, recipient, logoUrl } = readSmtpConfiguration(env)
  const name = subscriber.name
  const email = subscriber.email
  const escapedName = escapeHtml(name)
  const escapedEmail = escapeHtml(email)
  const text = ['Novo Assinante!', '', `Nome: ${name}`, `E-mail: ${email}`].join('\n')
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background:#eef0f2"><tr><td align="center" style="padding:42px 18px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;background:#ffffff"><tr><td align="center" style="padding:34px 48px 31px;border-bottom:1px solid #e6e9ed"><img src="${logoUrl}" alt="Inspire" width="184" style="display:block;border:0;max-width:100%;height:auto"></td></tr><tr><td style="padding:46px 48px 42px;font-family:Arial,Helvetica,sans-serif;color:#444b55"><p style="margin:0 0 16px;color:#6d7787;font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase">Newsletter Inspire</p><h1 style="margin:0 0 14px;color:#444b55;font-size:32px;line-height:1.14;font-weight:500">Novo Assinante!</h1><p style="margin:0 0 30px;color:#626d7b;font-size:16px;line-height:1.6">Uma nova pessoa acabou de assinar a newsletter Inspire. Confira os dados abaixo.</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid #dfe4e9"><tr><td width="36%" style="padding:14px 18px;background:#f4f6f8;border-bottom:1px solid #dfe4e9;color:#6b7583;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">Nome</td><td style="padding:14px 18px;border-bottom:1px solid #dfe4e9;color:#444b55;font-size:15px;line-height:1.4">${escapedName}</td></tr><tr><td width="36%" style="padding:14px 18px;background:#f4f6f8;color:#6b7583;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">E-mail</td><td style="padding:14px 18px;color:#444b55;font-size:15px;line-height:1.4">${escapedEmail}</td></tr></table><p style="margin:30px 0 0;color:#7b8490;font-size:13px;line-height:1.55">Este aviso é enviado automaticamente pelo site da Otimiza após uma nova inscrição consentida.</p></td></tr><tr><td align="center" style="padding:22px 48px;background:#444b55;color:#dce1e7;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5"><strong style="color:#ffffff;font-weight:600">Inspire</strong> · uma publicação da Otimiza Consultoria em Administração</td></tr></table></td></tr></table>`

  const makeTransport = createTransport || defaultCreateTransport
  try {
    const transport = await makeTransport({
      host,
      port,
      secure: port === 465 || port === 8465 || port === 443,
      auth: { user, pass },
    })
    await transport.sendMail({
      from: sender,
      to: recipient,
      replyTo: email,
      subject: `Novo assinante do Inspire — ${name}`,
      text,
      html,
    })
  } catch {
    throw new NewsletterEmailProviderError()
  }
}
