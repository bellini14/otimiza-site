import { randomUUID } from 'node:crypto'
import {
  createOwnershipReceipt,
  deriveInviteKey,
  verifyMemorialSession,
} from '../_lib/memorialAuth.js'
import { MemorialError, sendMemorialError } from '../_lib/memorialErrors.js'
import { parseMemorialInvites } from '../_lib/memorialInvites.js'
import { parseMemorialBody } from '../_lib/memorialRequest.js'
import { getMemorialStore } from '../_lib/memorialStore.js'

function bearer(req) {
  return String(req.headers?.authorization || '').replace(/^Bearer\s+/i, '')
}

function productionInviteByKey(inviteKey) {
  const secret = process.env.SILVANA_EMAIL_KEY_SECRET
  return [...parseMemorialInvites().values()]
    .find((invite) => deriveInviteKey(invite.email, secret) === inviteKey) || null
}

export function createNotesHandler(overrides = {}) {
  const configuredStore = overrides.store
  const verifySession = overrides.verifySession || ((token) => verifyMemorialSession(token, {
    secret: process.env.SILVANA_SESSION_SECRET,
    intent: 'contribute',
  }))
  const findInviteByKey = overrides.findInviteByKey || productionInviteByKey
  const createReceipt = overrides.createReceipt || createOwnershipReceipt
  const createId = overrides.createId || randomUUID

  return async function handler(req, res) {
    try {
      const store = configuredStore || getMemorialStore()
      if (req.method === 'GET') {
        const notes = await store.listPublicNotes()
        return res.status(200).json({ notes, count: notes.length })
      }
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'GET, POST')
        throw new MemorialError('INVALID_REQUEST', 'Método não permitido.', 405)
      }
      const body = parseMemorialBody(req)
      const message = typeof body?.message === 'string' ? body.message.trim() : ''
      if (!message || message.length > 280 || typeof body?.showName !== 'boolean') {
        throw new MemorialError(
          'INVALID_REQUEST',
          'Escreva uma lembrança de até 280 caracteres.',
          400,
        )
      }
      const session = verifySession(bearer(req))
      const invite = findInviteByKey(session.inviteKey)
      if (!invite) throw new MemorialError('INVITE_NOT_FOUND', 'Convite inválido.', 403)
      const id = createId()
      const ownership = createReceipt(id)
      const note = await store.createNote({
        id,
        inviteKey: session.inviteKey,
        message,
        displayName: body.showName ? invite.name : null,
        ownershipSecretHash: ownership.secretHash,
      })
      return res.status(201).json({ note, ownershipReceipt: ownership.receipt })
    } catch (error) {
      return sendMemorialError(res, error)
    }
  }
}

export default createNotesHandler()
