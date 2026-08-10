import { MemorialError } from './memorialErrors.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeMemorialEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function parseMemorialInvites(environment = process.env) {
  let entries
  try {
    entries = JSON.parse(environment.SILVANA_INVITEES_JSON || '')
  } catch {
    throw new MemorialError(
      'SERVICE_UNAVAILABLE',
      'A lista de convidados ainda não foi configurada.',
      503,
    )
  }
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new MemorialError('SERVICE_UNAVAILABLE', 'A lista de convidados está vazia.', 503)
  }
  const invites = new Map()
  entries.forEach((entry) => {
    const email = normalizeMemorialEmail(entry?.email)
    const name = typeof entry?.name === 'string' ? entry.name.trim() : ''
    if (!EMAIL_PATTERN.test(email) || !name || name.length > 120 || invites.has(email)) {
      throw new MemorialError(
        'SERVICE_UNAVAILABLE',
        'A lista de convidados possui dados inválidos.',
        503,
      )
    }
    invites.set(email, { email, name })
  })
  return invites
}

export function findMemorialInvite(email, environment = process.env) {
  return parseMemorialInvites(environment).get(normalizeMemorialEmail(email)) || null
}
