import {
  deriveInviteKey,
  verifyMemorialSession,
  verifyOwnershipReceipt,
} from '../../_lib/memorialAuth.js'
import { MemorialError, sendMemorialError } from '../../_lib/memorialErrors.js'
import { findMemorialInvite, parseMemorialInvites } from '../../_lib/memorialInvites.js'
import { parseMemorialBody } from '../../_lib/memorialRequest.js'
import { getMemorialStore } from '../../_lib/memorialStore.js'

function bearer(req) {
  return String(req.headers?.authorization || '').replace(/^Bearer\s+/i, '')
}

function productionInviteByKey(inviteKey) {
  return [...parseMemorialInvites().values()].find((invite) => (
    deriveInviteKey(invite.email, process.env.SILVANA_EMAIL_KEY_SECRET) === inviteKey
  )) || null
}

function productionAuthorize(req, note) {
  const token = bearer(req)
  if (verifyOwnershipReceipt(token, note)) return { inviteKey: note.inviteKey }
  return verifyMemorialSession(token, {
    secret: process.env.SILVANA_SESSION_SECRET,
    intent: 'manage',
  })
}

export function createNoteMutationHandler(overrides = {}) {
  const configuredStore = overrides.store
  const authorize = overrides.authorize || productionAuthorize
  const deriveKey = overrides.deriveKey || ((email) => (
    deriveInviteKey(email, process.env.SILVANA_EMAIL_KEY_SECRET)
  ))
  const findInvite = overrides.findInvite || ((email) => findMemorialInvite(email))
  const findInviteByKey = overrides.findInviteByKey || productionInviteByKey

  return async function handler(req, res) {
    try {
      if (!['PATCH', 'DELETE'].includes(req.method)) {
        res.setHeader('Allow', 'PATCH, DELETE')
        throw new MemorialError('INVALID_REQUEST', 'Método não permitido.', 405)
      }
      const id = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id
      const store = configuredStore || getMemorialStore()
      const note = id ? await store.findById(id) : null
      if (!note) throw new MemorialError('NOTE_NOT_FOUND', 'Lembrança não encontrada.', 404)
      const authorization = authorize(req, note)
      if (authorization.inviteKey !== note.inviteKey) {
        throw new MemorialError('SESSION_INVALID', 'Você não pode alterar esta lembrança.', 401)
      }
      const body = parseMemorialBody(req)
      if (req.method === 'PATCH') {
        const message = typeof body?.message === 'string' ? body.message.trim() : ''
        if (!message || message.length > 280 || typeof body?.showName !== 'boolean') {
          throw new MemorialError('INVALID_REQUEST', 'Revise sua lembrança.', 400)
        }
        const invite = findInviteByKey(note.inviteKey)
        const updated = await store.updateNote(note.id, {
          message,
          displayName: body.showName ? invite?.name || null : null,
        })
        return res.status(200).json({ note: updated })
      }
      const invite = findInvite(body?.emailConfirmation)
      if (!invite || deriveKey(body.emailConfirmation) !== note.inviteKey) {
        throw new MemorialError(
          'INVITE_NOT_FOUND',
          'O e-mail não corresponde a esta lembrança.',
          403,
        )
      }
      await store.deleteNote(note.id)
      return res.status(200).json({ deleted: true })
    } catch (error) {
      return sendMemorialError(res, error)
    }
  }
}

export default createNoteMutationHandler()
