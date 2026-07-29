import { MemorialError } from './memorialErrors.js'

const MAX_BODY_BYTES = 2048

export function parseMemorialBody(req) {
  const declared = Number(req.headers?.['content-length'] || 0)
  if (declared > MAX_BODY_BYTES) {
    throw new MemorialError('INVALID_REQUEST', 'Dados enviados são muito grandes.', 413)
  }
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {})
    if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
      throw new MemorialError('INVALID_REQUEST', 'Dados enviados são muito grandes.', 413)
    }
    return typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
  } catch (error) {
    if (error instanceof MemorialError) throw error
    throw new MemorialError('INVALID_REQUEST', 'Dados inválidos.', 400)
  }
}

export function createFailureLimiter({
  maxFailures = 5,
  windowMs = 60_000,
  now = Date.now,
} = {}) {
  const failures = new Map()
  function current(key) {
    const value = failures.get(key)
    if (!value || value.expiresAt <= now()) {
      failures.delete(key)
      return null
    }
    return value
  }
  return {
    assertAllowed(key) {
      if ((current(key)?.count || 0) >= maxFailures) {
        throw new MemorialError(
          'RATE_LIMITED',
          'Muitas tentativas. Aguarde um minuto e tente novamente.',
          429,
        )
      }
    },
    recordFailure(key) {
      const value = current(key)
      failures.set(key, {
        count: (value?.count || 0) + 1,
        expiresAt: value?.expiresAt || now() + windowMs,
      })
    },
    clear(key) {
      failures.delete(key)
    },
  }
}
