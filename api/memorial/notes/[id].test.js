import { describe, expect, it, vi } from 'vitest'
import { createNoteMutationHandler } from './[id].js'

function response() {
  return {
    statusCode: 200, body: null, setHeader: vi.fn(),
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
  }
}

describe('memorial note mutation handler', () => {
  it('edits an owned note', async () => {
    const updateNote = vi.fn().mockResolvedValue({ id: 'one', message: 'Nova', name: null })
    const handler = createNoteMutationHandler({
      store: {
        findById: async () => ({
          id: 'one', inviteKey: 'key', ownershipSecretHash: 'hash',
        }),
        updateNote,
      },
      authorize: () => ({ inviteKey: 'key' }),
      findInviteByKey: () => ({ name: 'Ana' }),
    })
    const res = response()
    await handler({
      method: 'PATCH', query: { id: 'one' },
      body: { message: ' Nova ', showName: false },
      headers: { authorization: 'Bearer receipt' },
    }, res)
    expect(res.statusCode).toBe(200)
    expect(updateNote).toHaveBeenCalledWith('one', { message: 'Nova', displayName: null })
  })

  it('requires a matching email to delete', async () => {
    const deleteNote = vi.fn().mockResolvedValue(true)
    const handler = createNoteMutationHandler({
      store: {
        findById: async () => ({ id: 'one', inviteKey: 'key', ownershipSecretHash: 'hash' }),
        deleteNote,
      },
      authorize: () => ({ inviteKey: 'key' }),
      deriveKey: () => 'other',
      findInvite: () => ({ name: 'Ana' }),
    })
    const res = response()
    await handler({
      method: 'DELETE', query: { id: 'one' },
      body: { emailConfirmation: 'ana@example.com' },
      headers: { authorization: 'Bearer receipt' },
    }, res)
    expect(res.statusCode).toBe(403)
    expect(deleteNote).not.toHaveBeenCalled()
  })
})
