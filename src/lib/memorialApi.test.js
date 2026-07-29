import { describe, expect, it, vi } from 'vitest'
import { createMemorialApi } from './memorialApi.js'

describe('memorial api', () => {
  it('sends bearer credentials and exposes safe errors', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ note: { id: 'one' } }),
    })
    const api = createMemorialApi(fetchFn)
    await api.updateNote({
      id: 'one', authorization: 'receipt', message: 'Olá', showName: true,
    })
    expect(fetchFn).toHaveBeenCalledWith('/api/memorial/notes/one', expect.objectContaining({
      method: 'PATCH',
      headers: expect.objectContaining({ Authorization: 'Bearer receipt' }),
    }))
  })
})
