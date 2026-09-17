import { defaultCreateTransport, readSmtpConfiguration, NewsletterEmailProviderError } from './newsletterEmail.js'

const SITE = 'https://www.otm.com.br'
const INTRO = 'Sua inscrição está confirmada. Enquanto a próxima edição não chega, aproveite nossas últimas publicações.'
const QUERY = '*[_type == "post" && !(_id in path("drafts.**")) && defined(slug.current) && publishedAt <= now()] | order(publishedAt desc)[0...3]{title,"slug":slug.current,publishedAt,eyebrow,"image":mainImage.asset->url}'
const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')

export async function fetchLatestWelcomePosts({ fetchImpl = globalThis.fetch } = {}) {
  try {
    const response = await fetchImpl(`https://igy822g7.api.sanity.io/v2024-03-21/data/query/production?query=${encodeURIComponent(QUERY)}`, { signal: AbortSignal.timeout(4000) })
    if (!response.ok) throw new Error('CMS unavailable')
    const { result } = await response.json()
    return Array.isArray(result) ? result.filter(post => typeof post?.title === 'string' && typeof post?.slug === 'string').slice(0, 3) : []
  } catch {
    console.warn('Welcome email content unavailable; using Inspire link.')
    return []
  }
}

function articleUrl(post) {
  const date = /^(\d{4})-(\d{2})-(\d{2})T/.exec(post.publishedAt || '')
  return `${SITE}${date ? `/${date[1]}/${date[2]}/${date[3]}` : '/inspire'}/${encodeURIComponent(post.slug)}`
}

function imageUrl(source) {
  try {
    const url = new URL(source)
    if (url.protocol !== 'https:' || url.hostname !== 'cdn.sanity.io' || !url.pathname.startsWith('/images/igy822g7/production/')) return ''
    url.search = 'w=600&h=420&fit=crop&auto=format'
    return url.href
  } catch { return '' }
}

export function buildWelcomeEmail({ name = '', posts = [] } = {}) {
  const greeting = name.trim() ? `Olá, ${name.trim()}!` : 'Olá!'
  const selected = posts.filter(post => typeof post?.title === 'string' && typeof post?.slug === 'string').slice(0, 3)
  const cards = selected.map(post => {
    const href = escape(articleUrl(post))
    const image = imageUrl(post.image)
    const title = post.title.replace(/^Dica de leitura:\s*|^Dica para assistir:\s*/i, '')
    return `<td class="stack" width="${Math.floor(100 / selected.length)}%" valign="top" style="padding:0 4px"><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:14px"><tr><td>${image ? `<a href="${href}" style="display:block"><img src="${escape(image)}" width="192" alt="${escape(post.title)}" style="display:block;width:100%;height:auto;border:0;border-radius:14px 14px 0 0"></a>` : ''}</td></tr><tr><td style="padding:16px 14px 10px;font-family:Arial,Helvetica,sans-serif;color:#434b54"><span style="display:inline-block;padding:3px 6px;background:#ffe978;font-size:11px;line-height:17px">${escape(post.eyebrow || 'Inspire')}</span><h2 class="story-title" style="margin:14px 0 4px;font-size:18px;line-height:24px;font-weight:600;min-height:96px"><a href="${href}" style="color:#434b54;text-decoration:none">${escape(title)}</a></h2><a href="${href}" style="display:inline-block;padding:13px 0;font-size:13px;line-height:18px;font-weight:bold;color:#434b54">Ler conteúdo &rarr;</a></td></tr></table></td>`
  }).join('')
  const gallery = cards ? `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout:fixed"><tr>${cards}</tr></table>` : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="background:#ffffff;border-radius:14px;padding:18px"><a href="${SITE}/inspire" style="display:inline-block;padding:12px;font-size:16px;font-weight:bold;color:#434b54">Explorar o Inspire &rarr;</a></td></tr></table>`
  const html = `<!doctype html><html lang="pt-BR" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]--><title>Bem-vindo ao Inspire!</title><style>html{-webkit-font-smoothing:antialiased}h1,h2{text-wrap:balance}p{text-wrap:pretty}a:focus-visible{outline:2px solid #434b54;outline-offset:3px}@media(max-width:600px){.outer{padding:20px 12px!important}.pad{padding:26px 24px!important}.stack{display:block!important;width:100%!important;box-sizing:border-box;padding:0 0 12px!important}.story-title{min-height:0!important}h1{font-size:30px!important;line-height:37px!important}}</style></head><body style="margin:0;padding:0;background:#e1e6ef;font-family:Arial,Helvetica,sans-serif;color:#434b54"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">Sua inscrição no Inspire está confirmada. Confira nossas últimas publicações.</div><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#e1e6ef"><tr><td class="outer" align="center" style="padding:30px 18px 34px"><!--[if mso]><table role="presentation" width="600"><tr><td><![endif]--><table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px"><tr><td align="center" style="padding:8px 30px 24px"><a href="${SITE}/inspire"><img src="${SITE}/inspire-email-logo.png" width="184" alt="Inspire" style="display:block;width:184px;max-width:100%;height:auto;border:0"></a></td></tr><tr><td style="padding-top:12px"><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:14px"><tr><td class="pad" style="padding:30px 30px 32px;font-family:Arial,Helvetica,sans-serif;color:#434b54"><h1 style="margin:0 0 23px;font-size:34px;line-height:41px;font-weight:600">Bem-vindo ao Inspire!</h1><p style="margin:0 0 10px;font-size:17px;line-height:27px;font-weight:bold">${escape(greeting)}</p><p style="margin:0;font-size:16px;line-height:26px">${INTRO}</p></td></tr></table></td></tr><tr><td style="padding:26px 4px 14px;font-family:Arial,Helvetica,sans-serif;color:#434b54"><h2 style="margin:0;font-size:20px;line-height:27px;font-weight:600">Para começar a leitura</h2></td></tr><tr><td>${gallery}</td></tr></table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></body></html>`
  const text = ['Bem-vindo ao Inspire!', '', greeting, INTRO, '', ...selected.map(post => `${post.title}\n${articleUrl(post)}`), ...(selected.length ? [] : [`Explorar o Inspire: ${SITE}/inspire`])].join('\n')
  return { html, text }
}

export async function sendWelcomeEmail(subscriber, { env = globalThis.process?.env || {}, createTransport = defaultCreateTransport, getPosts = fetchLatestWelcomePosts } = {}) {
  const { host, port, user, pass, sender } = readSmtpConfiguration(env)
  const posts = await getPosts()
  const message = buildWelcomeEmail({ name: subscriber.name, posts })
  try {
    const transport = await createTransport({ host, port, secure: port === 465 || port === 8465 || port === 443, auth: { user, pass }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000 })
    await transport.sendMail({ from: sender, to: subscriber.email, replyTo: 'otm@otm.com.br', subject: 'Bem-vindo ao Inspire!', ...message })
  } catch { throw new NewsletterEmailProviderError() }
}
