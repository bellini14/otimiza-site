import { describe, expect, it } from 'vitest'
import { createMemorialQaState } from './memorialQaApi.mjs'

describe('memorial QA API', () => {
  it('supports publish, edit, delete and republish with fake data', () => {
    const state = createMemorialQaState()
    const access = state.handle('POST', '/api/memorial/access', {
      email: 'convidada@example.com', intent: 'contribute',
    })
    expect(access.status).toBe(200)
    const published = state.handle('POST', '/api/memorial/notes', {
      message: 'Primeira', showName: true,
    })
    expect(published.body.note.name).toBe('Convidada Exemplo')
    expect(state.handle('GET', '/api/memorial/notes').body.count).toBe(1)
    expect(state.handle('DELETE', '/api/memorial/notes/qa-note', {
      emailConfirmation: 'convidada@example.com',
    }).status).toBe(200)
    expect(state.handle('GET', '/api/memorial/notes').body.count).toBe(0)
  })

  it('authorizes João Abellini and associates his name with the post-it', () => {
    const state = createMemorialQaState()
    const access = state.handle('POST', '/api/memorial/access', {
      email: 'joaoabellini107@gmail.com',
      intent: 'contribute',
    })

    expect(access.status).toBe(200)
    expect(access.body.name).toBe('João Abellini')

    const published = state.handle('POST', '/api/memorial/notes', {
      message: 'Uma lembrança',
      showName: true,
    })
    expect(published.body.note.name).toBe('João Abellini')
  })
})
