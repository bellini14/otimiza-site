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

  it('blocks publishing without writing to the database', async () => {
    const createNote = vi.fn()
    const handler = createNotesHandler({ store: { createNote } })
    const res = response()
    await handler({ method: 'POST', body: { message: 'Nova lembrança', showName: true } }, res)
    expect(res.statusCode).toBe(405)
    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET')
    expect(createNote).not.toHaveBeenCalled()
  })
})
