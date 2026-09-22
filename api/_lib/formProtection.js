import { createHmac } from 'node:crypto'
import { isIP } from 'node:net'
import { getFormAbuseStore } from './formAbuseStore.js'

export class FormProtectionError extends Error {
  constructor(status, message, retryAfter) {
    super(message)
    this.status = status
    this.retryAfter = retryAfter
  }
}
const unavailable = () => new FormProtectionError(503, 'Não foi possível verificar a segurança agora. Tente novamente mais tarde.')

export function parseFormBody(req) {
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {})
    if (Number(req.headers?.['content-length']) > 32768 || Buffer.byteLength(raw, 'utf8') > 32768) {
      throw new FormProtectionError(413, 'Os dados enviados são muito grandes.')
    }
    const body = typeof req.body === 'string' ? JSON.parse(raw) : req.body
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error()
    return body
  } catch (error) {
    if (error instanceof FormProtectionError) throw error
    throw new FormProtectionError(400, 'Dados inválidos.')
  }
}

export function sendFormProtectionError(res, error) {
  if (!(error instanceof FormProtectionError)) return false
  res.setHeader('Cache-Control', 'no-store')
  if (error.retryAfter) res.setHeader('Retry-After', String(error.retryAfter))
  res.status(error.status).json({ error: error.message })
  return true
}

export function clientIp(req, env = process.env) {
  // Vercel overwrites x-forwarded-for. Do not trust arbitrary proxy headers locally.
  const raw = env.VERCEL === '1'
    ? req.headers?.['x-forwarded-for']
    : req.socket?.remoteAddress
  const ip = typeof raw === 'string' ? raw.trim() : ''
  if (!isIP(ip)) throw unavailable()
  // Collapse IPv4-mapped addresses; use a /64 key for IPv6 privacy addresses.
  if (ip.startsWith('::ffff:') && isIP(ip.slice(7)) === 4) return ip.slice(7)
  if (isIP(ip) === 6) {
    const normalized = new URL('http://[' + ip + ']').hostname.slice(1, -1)
    const [left, right = ''] = normalized.split('::')
    const start = left ? left.split(':') : []
    const end = right ? right.split(':') : []
    const groups = normalized.includes('::') ? [...start, ...Array(8 - start.length - end.length).fill('0'), ...end] : start
    return groups.slice(0, 4).map((part) => parseInt(part, 16).toString(16)).join(':') + '::/64'
  }
  return ip
}

export async function protectForm(req, data, action, {
  env = process.env, fetchImpl = globalThis.fetch, store: suppliedStore,
} = {}) {
  const token = data.turnstileToken
  if (typeof token !== 'string' || !token.trim() || token.length > 2048) {
    throw new FormProtectionError(400, 'Confirme a verificação de segurança e tente novamente.')
  }
  const secret = env.TURNSTILE_SECRET_KEY?.trim()
  const hosts = (env.TURNSTILE_ALLOWED_HOSTNAMES || 'otm.com.br,www.otm.com.br').split(',').map((host) => host.trim()).filter(Boolean)
  if (!secret || !hosts.length || (env.VERCEL_ENV === 'production' && /^[123]x0{10,}/.test(secret))) throw unavailable()
  let store
  try { store = suppliedStore || getFormAbuseStore() } catch { throw unavailable() }
  const hash = (kind, value) => createHmac('sha256', secret).update(kind + ':' + value).digest('hex')
  try {
    await store.cleanup()
    const ipLimit = await store.consume(hash('ip', clientIp(req, env)), 10, 600)
    if (!ipLimit.allowed) throw new FormProtectionError(429, 'Muitas tentativas. Aguarde alguns minutos e tente novamente.', ipLimit.retryAfter)
    let result
    try {
      const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, response: token }),
        signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) throw new Error()
      result = await response.json()
    } catch { throw unavailable() }
    if (result?.success !== true || result.action !== action || !hosts.includes(result.hostname)) {
      throw new FormProtectionError(400, 'A verificação de segurança expirou ou não foi aceita. Tente novamente.')
    }
    const fingerprint = action === 'newsletter'
      ? data.email
      : JSON.stringify([data.email, data.firstName, data.lastName, data.message, data.newsletterConsent, data.newsletterSource])
    const key = hash('submission:' + action, fingerprint)
    const reservation = await store.reserve(key)
    if (reservation.state === 'duplicate') return { duplicate: true }
    if (reservation.state !== 'reserved') throw new FormProtectionError(409, 'Este envio já está sendo processado. Aguarde antes de tentar novamente.', 120)
    const release = async () => { try { await store.release(key, reservation.lease) } catch { /* Reservation expires automatically. */ } }
    try {
      const emailLimit = await store.consume(hash('email', data.email), 3, 3600)
      if (!emailLimit.allowed) throw new FormProtectionError(429, 'Aguarde antes de enviar novamente para este e-mail.', emailLimit.retryAfter)
    } catch (error) { await release(); throw error }
    return {
      duplicate: false,
      release,
      async complete() {
        // Do not turn a delivered message into a retry if the bookkeeping fails.
        try { await store.complete(key, reservation.lease, action === 'newsletter' ? 86400 : 600) } catch { console.error('Form deduplication completion failed.') }
        try { await store.cleanup() } catch { console.error('Form protection cleanup failed.') }
      },
    }
  } catch (error) {
    if (error instanceof FormProtectionError) throw error
    throw unavailable()
  }
}
