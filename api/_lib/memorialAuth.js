import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto'
import { MemorialError } from './memorialErrors.js'
import { normalizeMemorialEmail } from './memorialInvites.js'

const SESSION_LIFETIME_MS = 15 * 60 * 1000

function encode(value) {
  return Buffer.from(value).toString('base64url')
}

function sign(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

function safeEqual(left, right) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function deriveInviteKey(email, secret) {
  if (!secret) throw new MemorialError('SERVICE_UNAVAILABLE', 'Serviço não configurado.', 503)
  return createHmac('sha256', secret)
    .update(normalizeMemorialEmail(email))
    .digest('hex')
}

export function createMemorialSession(payload, secret, now = Date.now()) {
  if (!secret) throw new MemorialError('SERVICE_UNAVAILABLE', 'Serviço não configurado.', 503)
  const encoded = encode(JSON.stringify({ ...payload, exp: now + SESSION_LIFETIME_MS }))
  return `${encoded}.${sign(encoded, secret)}`
}

export function verifyMemorialSession(token, { secret, intent, now = Date.now() }) {
  try {
    const [encoded, signature] = String(token || '').split('.')
    if (!encoded || !signature || !safeEqual(signature, sign(encoded, secret))) throw new Error()
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString())
    if (payload.intent !== intent || payload.exp <= now || !payload.inviteKey) throw new Error()
    return payload
  } catch {
    throw new MemorialError(
      'SESSION_INVALID',
      'Sua validação expirou. Confirme o e-mail novamente.',
      401,
    )
  }
}

export function hashOwnershipSecret(secret) {
  return createHash('sha256').update(secret).digest('hex')
}

export function createOwnershipReceipt(noteId, randomBytesFn = randomBytes) {
  const secret = randomBytesFn(24).toString('base64url')
  return {
    receipt: `${noteId}.${secret}`,
    secretHash: hashOwnershipSecret(secret),
  }
}

export function verifyOwnershipReceipt(receipt, note) {
  const separator = String(receipt || '').indexOf('.')
  if (separator < 1) return false
  const noteId = receipt.slice(0, separator)
  const secret = receipt.slice(separator + 1)
  return noteId === note.id && safeEqual(
    hashOwnershipSecret(secret),
    note.ownershipSecretHash || '',
  )
}
