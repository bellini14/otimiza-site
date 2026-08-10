import { describe, expect, it, vi } from 'vitest'
import { createNotesHandler } from './notes.js'

function response() {
  return {
    statusCode: 200,
    body: null,
    setHeader: vi.fn(),
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
  }
}

describe('memorial notes handler', () => {
  it('lists public notes', async () => {
    const notes = [{ id: 'one', message: 'Olá', name: null }]
    const handler = createNotesHandler({ store: { listPublicNotes: async () => notes } })
    const res = response()
    await handler({ method: 'GET' }, res)
    expect(res.body).toEqual({ notes, count: 1 })
  })

  it('publishes using the allowlisted name and returns an ownership receipt', async () => {
    const createNote = vi.fn().mockResolvedValue({
      id: 'note-1',
      message: 'Uma lembrança',
      name: 'Ana',
    })
    const handler = createNotesHandler({
      store: { createNote },
      verifySession: () => ({ inviteKey: 'private-key' }),
      findInviteByKey: () => ({ name: 'Ana' }),
      createReceipt: () => ({ receipt: 'note-1.secret', secretHash: 'hash' }),
    })
    const res = response()
    await handler({
      method: 'POST',
      headers: { authorization: 'Bearer token' },
      body: { message: ' Uma lembrança ', showName: true },
    }, res)
    expect(res.statusCode).toBe(201)
    expect(createNote).toHaveBeenCalledWith(expect.objectContaining({
      inviteKey: 'private-key',
      message: 'Uma lembrança',
      displayName: 'Ana',
      ownershipSecretHash: 'hash',
    }))
    expect(res.body.ownershipReceipt).toBe('note-1.secret')
  })
})
