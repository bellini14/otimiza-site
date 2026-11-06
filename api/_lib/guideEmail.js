import { defaultCreateTransport, readSmtpConfiguration, NewsletterEmailProviderError } from './newsletterEmail.js'
import { sendMailWithDeadline } from './sendMailWithDeadline.js'

const SITE = 'https://www.otm.com.br'
export const GUIDE_PDF_URL = `${SITE}/guia-de-conduta-otimiza.pdf`
const LOGO_URL = `${SITE}/otimiza-email-logo.png`

const INK = '#2b333c'
const BODY = '#5a6572'
const MUTED = '#7b8490'
const RED = '#e02020'
const PAPER = '#f2f1ec'
const LINE = '#e3e1da'
const FONT = 'Arial,Helvetica,sans-serif'

const escape = (value) => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;')

function shell({ title, preheader, body }) {
  return `<!doctype html><html lang="pt-BR" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]--><title>${escape(title)}</title><style>html{-webkit-font-smoothing:antialiased}h1{text-wrap:balance}p{text-wrap:pretty}a:focus-visible{outline:2px solid ${INK};outline-offset:3px}@media(max-width:600px){.outer{padding:20px 12px!important}.pad{padding:30px 24px!important}.foot{padding:22px 24px!important}h1{font-size:30px!important;line-height:36px!important}.cta a{display:block!important}}</style></head><body style="margin:0;padding:0;background:${PAPER};font-family:${FONT};color:${BODY}"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escape(preheader)}</div><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background:${PAPER}"><tr><td class="outer" align="center" style="padding:36px 18px 40px"><!--[if mso]><table role="presentation" width="600"><tr><td><![endif]--><table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px"><tr><td align="center" style="padding:4px 30px 26px"><a href="${SITE}" style="display:inline-block"><img src="${LOGO_URL}" width="184" alt="Otimiza" style="display:block;width:184px;max-width:100%;height:auto;border:0"></a></td></tr><tr><td><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:14px;overflow:hidden">${body}<tr><td class="foot" style="padding:22px 40px;background:${INK};font-family:${FONT};font-size:12px;line-height:19px;color:#c9d0d8"><strong style="color:#ffffff;font-weight:600">Otimiza Consultoria</strong> · Rua Frei Pacífico, 260 — São José, Caxias do Sul — RS<br><a href="${SITE}" style="color:#c9d0d8;text-decoration:underline">otm.com.br</a> · <a href="mailto:otm@otm.com.br" style="color:#c9d0d8;text-decoration:underline">otm@otm.com.br</a></td></tr></table></td></tr></table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></body></html>`
}

const eyebrow = (label) => `<p style="margin:0 0 18px;font-family:${FONT};font-size:11px;line-height:16px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:${BODY}"><span style="display:inline-block;width:7px;height:7px;margin-right:8px;border-radius:50%;background:${RED};vertical-align:1px"></span>${escape(label)}</p>`

const SOLUCOES_URL = `${SITE}/o-que-fazemos`
const FRENTES = [
  ['Gestão estratégica', 'Alinhamento de objetivos, diretrizes e equipes.'],
  ['Gestão de processos', 'Organização, eficiência e melhoria contínua.'],
  ['Gestão de pessoas', 'Competências e alinhamento organizacional.'],
  ['Tecnologia e IA', 'Automação, análise e apoio à decisão.'],
]

export function buildGuideEmail({ name = '', newsletterConsent = false } = {}) {
  const firstName = name.trim().split(/\s+/)[0] || ''
  const greeting = firstName ? `Olá, ${firstName}!` : 'Olá!'
  const inspireLine = 'Você também passa a receber a newsletter Inspire, com conteúdos sobre gestão, processos e tecnologia.'
  const inspireHtml = newsletterConsent
    ? `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:24px"><tr><td style="padding:14px 16px;background:${PAPER};border-radius:10px;font-family:${FONT};font-size:14px;line-height:21px;color:${BODY}"><strong style="color:${INK}">Inspire:</strong> ${inspireLine.replace('Você também', 'você também')}</td></tr></table>`
    : ''
  const frentes = FRENTES.map(([title, detail], index) => `<tr><td width="38" valign="top" style="padding:16px 0;border-top:1px solid ${LINE};font-family:${FONT};font-size:11px;line-height:22px;font-weight:700;letter-spacing:1px;color:${RED}">0${index + 1}</td><td style="padding:16px 0;border-top:1px solid ${LINE};font-family:${FONT}"><p style="margin:0 0 3px;font-size:17px;line-height:22px;font-weight:600;color:${INK}">${title}</p><p style="margin:0;font-size:14px;line-height:21px;color:${BODY}">${detail}</p></td></tr>`).join('')

  const body = `<tr><td class="pad" style="padding:40px 40px 38px;font-family:${FONT};color:${BODY}">${eyebrow('Guia de Conduta')}<h1 style="margin:0 0 22px;font-size:34px;line-height:40px;font-weight:600;letter-spacing:-0.5px;color:${INK}">Seu Guia de Conduta chegou.</h1><p style="margin:0 0 10px;font-size:17px;line-height:27px;font-weight:bold;color:${INK}">${escape(greeting)}</p><p style="margin:0 0 30px;font-size:16px;line-height:26px">Esperamos que o Guia de Conduta da Otimiza contribua para ampliar suas reflexões sobre gestão, pessoas e organização.</p><table role="presentation" border="0" cellspacing="0" cellpadding="0" class="cta"><tr><td align="center" bgcolor="${RED}" style="background:${RED};border-radius:999px"><a href="${GUIDE_PDF_URL}" style="display:inline-block;padding:17px 32px;border-radius:999px;font-family:${FONT};font-size:16px;line-height:22px;font-weight:bold;text-decoration:none;color:#ffffff">Baixar o Guia de Conduta &rarr;</a></td></tr></table><p style="margin:16px 0 0;font-size:13px;line-height:20px;color:${MUTED}">PDF · 15 MB. Se o botão não funcionar, copie este endereço: <a href="${GUIDE_PDF_URL}" style="color:${BODY};text-decoration:underline;word-break:break-all">${GUIDE_PDF_URL}</a></p>${inspireHtml}</td></tr>`
    + `<tr><td class="pad" style="padding:38px 40px 6px;border-top:1px solid ${LINE};font-family:${FONT};color:${BODY}"><p style="margin:0 0 24px;padding-left:20px;border-left:2px solid ${RED};font-size:22px;line-height:31px;font-weight:600;letter-spacing:-0.2px;color:${INK}">Como transformar princípios em práticas que orientam decisões, comportamentos e resultados?</p><p style="margin:0 0 26px;font-size:16px;line-height:26px">É nesse desafio que a Otimiza atua. Integramos <strong style="color:${INK}">estratégia, processos, pessoas, tecnologia e inteligência artificial</strong> para transformar prioridades em resultados consistentes.</p><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-bottom:1px solid ${LINE}">${frentes}</table></td></tr>`
    + `<tr><td class="pad" style="padding:30px 40px 40px;font-family:${FONT}"><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background:${PAPER};border-radius:12px"><tr><td style="padding:28px 28px 30px;font-family:${FONT};color:${BODY}"><p style="margin:0 0 10px;font-size:20px;line-height:27px;font-weight:600;color:${INK}">Sua empresa está diante de um desafio de gestão ou transformação?</p><p style="margin:0 0 22px;font-size:15px;line-height:24px">Cada organização tem seus próprios desafios. Nosso trabalho começa por compreendê-los — será um prazer conhecer a sua realidade.</p><table role="presentation" border="0" cellspacing="0" cellpadding="0" class="cta"><tr><td align="center" bgcolor="${INK}" style="background:${INK};border-radius:999px"><a href="${SOLUCOES_URL}" style="display:inline-block;padding:15px 26px;border-radius:999px;font-family:${FONT};font-size:15px;line-height:20px;font-weight:bold;text-decoration:none;color:#ffffff">Conheça a Otimiza e nossas soluções &rarr;</a></td></tr></table></td></tr></table><p style="margin:30px 0 0;font-size:15px;line-height:22px;font-weight:bold;color:${INK}">Otimiza Consultoria</p><p style="margin:2px 0 0;font-size:14px;line-height:21px;color:${MUTED}">Estratégia, gestão e tecnologia a serviço da transformação organizacional.</p></td></tr>`

  const html = shell({ title: 'Seu Guia de Conduta chegou', preheader: 'Aqui está o seu Guia de Conduta — e uma pergunta: como transformar princípios em prática?', body })
  const text = [
    'Seu Guia de Conduta chegou.', '', greeting,
    'Esperamos que o Guia de Conduta da Otimiza contribua para ampliar suas reflexões sobre gestão, pessoas e organização.',
    '', `Baixe o PDF: ${GUIDE_PDF_URL}`, '',
    ...(newsletterConsent ? [inspireLine, ''] : []),
    'Como transformar princípios em práticas que orientam decisões, comportamentos e resultados?',
    'É nesse desafio que a Otimiza atua. Integramos estratégia, processos, pessoas, tecnologia e inteligência artificial para transformar prioridades em resultados consistentes.',
    '', ...FRENTES.map(([title, detail]) => `- ${title}: ${detail}`), '',
    'Sua empresa está diante de um desafio de gestão ou transformação?',
    `Conheça a Otimiza e nossas soluções: ${SOLUCOES_URL}`, '',
    'Otimiza Consultoria',
    'Estratégia, gestão e tecnologia a serviço da transformação organizacional.',
  ].join('\n')
  return { html, text }
}

export function buildGuideLeadNotification({ name, email, companyName, newsletterConsent }) {
  const rows = [
    ['Nome', name],
    ['E-mail', email],
    ['Empresa', companyName],
    ['Newsletter', newsletterConsent ? 'Aceitou receber a newsletter Inspire' : 'Não aceitou'],
  ]
  const table = rows.map(([label, value], index) => {
    const border = index < rows.length - 1 ? `border-bottom:1px solid ${LINE};` : ''
    return `<tr><td width="34%" style="padding:14px 18px;background:#f6f5f1;${border}font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6b7583">${label}</td><td style="padding:14px 18px;${border}font-family:${FONT};font-size:15px;line-height:21px;color:${INK}">${escape(value)}</td></tr>`
  }).join('')
  const body = `<tr><td class="pad" style="padding:40px 40px 38px;font-family:${FONT};color:${BODY}">${eyebrow('Guia de Conduta')}<h1 style="margin:0 0 14px;font-size:32px;line-height:38px;font-weight:600;letter-spacing:-0.5px;color:${INK}">Novo lead!</h1><p style="margin:0 0 28px;font-size:16px;line-height:26px">Uma nova pessoa baixou o Guia de Conduta pelo site. Os dados também foram enviados ao RD Station.</p><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid ${LINE}">${table}</table><p style="margin:28px 0 0;font-size:13px;line-height:20px;color:${MUTED}">Para falar com o lead, responda este e-mail. Este aviso é enviado automaticamente pelo site da Otimiza.</p></td></tr>`
  const html = shell({ title: 'Novo lead do Guia de Conduta', preheader: `${name} (${companyName}) baixou o Guia de Conduta.`, body })
  const text = ['Novo lead do Guia de Conduta', '', ...rows.map(([label, value]) => `${label}: ${value}`)].join('\n')
  return { html, text }
}

async function deliver(message, { env, createTransport }) {
  const { host, port, user, pass, sender, recipient } = readSmtpConfiguration(env)
  try {
    const transport = await createTransport({
      host, port, secure: port === 465 || port === 8465 || port === 443, auth: { user, pass },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    })
    await sendMailWithDeadline(transport, { from: sender, ...message(recipient) })
  } catch {
    throw new NewsletterEmailProviderError()
  }
}

export function sendGuideEmail(lead, { env = globalThis.process?.env || {}, createTransport = defaultCreateTransport } = {}) {
  return deliver(() => ({
    to: lead.email,
    replyTo: 'otm@otm.com.br',
    subject: 'Seu Guia de Conduta da Otimiza',
    ...buildGuideEmail({ name: lead.name, newsletterConsent: lead.newsletterConsent }),
  }), { env, createTransport })
}

export function sendGuideLeadNotification(lead, { env = globalThis.process?.env || {}, createTransport = defaultCreateTransport } = {}) {
  return deliver((recipient) => ({
    to: recipient,
    replyTo: lead.email,
    subject: `Novo lead do Guia de Conduta — ${lead.name} (${lead.companyName})`,
    ...buildGuideLeadNotification(lead),
  }), { env, createTransport })
}
