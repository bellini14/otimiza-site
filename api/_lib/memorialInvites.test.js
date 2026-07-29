import { describe, expect, it } from 'vitest'
import { parseMemorialInvites } from './memorialInvites.js'

describe('memorial invites', () => {
  it('normalizes email and associates the configured name', () => {
    const invites = parseMemorialInvites({
      SILVANA_INVITEES_JSON: JSON.stringify([
        { email: ' Ana@Example.com ', name: ' Ana Souza ' },
      ]),
    })
    expect(invites.get('ana@example.com')).toEqual({
      email: 'ana@example.com',
      name: 'Ana Souza',
    })
  })

  it.each([
    [''],
    ['not-json'],
    ['[]'],
    ['[{"email":"invalid","name":"Ana"}]'],
    ['[{"email":"ana@example.com","name":""}]'],
    ['[{"email":"ana@example.com","name":"Ana"},{"email":" ANA@example.com ","name":"Outra"}]'],
  ])('rejects invalid configuration: %s', (value) => {
    expect(() => parseMemorialInvites({ SILVANA_INVITEES_JSON: value })).toThrow()
  })
})
