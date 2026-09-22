import { describe, expect, it, vi } from 'vitest'
import { createNoteMutationHandler } from './[id].js'
describe('disabled memorial endpoint', () => {
  it.each(['GET', 'POST', 'PATCH', 'DELETE'])('rejects %s without touching stored notes', async (method) => {
    const store = { deleteNote: vi.fn(), updateNote: vi.fn(), findById: vi.fn() }
    const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() }
    await createNoteMutationHandler({ store })({ method }, res)
    expect(res.status).toHaveBeenCalledWith(405)
    for (const operation of Object.values(store)) expect(operation).not.toHaveBeenCalled()
  })
})
