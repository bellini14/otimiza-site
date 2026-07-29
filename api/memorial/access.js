import { createMemorialSession, deriveInviteKey } from '../_lib/memorialAuth.js'
import { MemorialError, sendMemorialError } from '../_lib/memorialErrors.js'
import { findMemorialInvite } from '../_lib/memorialInvites.js'
import { createFailureLimiter, parseMemorialBody } from '../_lib/memorialRequest.js'
import { getMemorialStore } from '../_lib/memorialStore.js'

export function createAccessHandler(overrides = {}) {
  const findInvite = overrides.findInvite || ((email) => findMemorialInvite(email))
  const deriveKey = overrides.deriveKey || ((email) => (
    deriveInviteKey(email, process.env.SILVANA_EMAIL_KEY_SECRET)
  ))
  const configuredStore = overrides.store
  const createSession = overrides.createSession || ((payload) => (
    createMemorialSession(payload, process.env.SILVANA_SESSION_SECRET)
  ))
  const limiter = overrides.limiter || createFailureLimiter(overrides.limiterOptions)

  return async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({
        error: { code: 'INVALID_REQUEST', message: 'Método não permitido.' },
      })
    }
    try {
      const body = parseMemorialBody(req)
      const intent = body?.intent === 'manage' ? 'manage' : 'contribute'
      const inviteKey = deriveKey(body?.email)
      limiter.assertAllowed(inviteKey)
      const invite = findInvite(body?.email)
      if (!invite) {
        limiter.recordFailure(inviteKey)
        throw new MemorialError(
          'INVITE_NOT_FOUND',
          'Este e-mail não está na lista desta homenagem.',
          403,
        )
      }
      limiter.clear(inviteKey)
      const store = configuredStore || getMemorialStore()
      const note = await store.findByInviteKey(inviteKey)
      const effectiveIntent = note ? 'manage' : intent
      return res.status(200).json({
        name: invite.name,
        hasNote: Boolean(note),
        sessionToken: createSession({ inviteKey, intent: effectiveIntent }),
        note: note ? {
          id: note.id,
          message: note.message,
          name: note.name,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        } : null,
      })
    } catch (error) {
      return sendMemorialError(res, error)
    }
  }
}

export default createAccessHandler()
