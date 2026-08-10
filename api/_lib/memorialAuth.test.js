import { describe, expect, it } from 'vitest'
import {
  createMemorialSession,
  createOwnershipReceipt,
  deriveInviteKey,
  verifyMemorialSession,
  verifyOwnershipReceipt,
} from './memorialAuth.js'

describe('memorial auth', () => {
  it('derives a stable private invite key', () => {
    expect(deriveInviteKey(' Ana@Example.com ', 'secret')).toBe(
      deriveInviteKey('ana@example.com', 'secret'),
    )
    expect(deriveInviteKey('ana@example.com', 'other')).not.toBe(
      deriveInviteKey('ana@example.com', 'secret'),
    )
  })

  it('signs an intent-scoped expiring session', () => {
    const now = 1_000_000
    const token = createMemorialSession(
      { inviteKey: 'invite', intent: 'contribute' },
      'secret',
      now,
    )
    expect(verifyMemorialSession(token, {
      secret: 'secret',
      intent: 'contribute',
      now: now + 1000,
    }).inviteKey).toBe('invite')
    expect(() => verifyMemorialSession(token, {
      secret: 'secret',
      intent: 'manage',
      now,
    })).toThrow()
    expect(() => verifyMemorialSession(token, {
      secret: 'secret',
      intent: 'contribute',
      now: now + (16 * 60 * 1000),
    })).toThrow()
  })

  it('creates and verifies an opaque ownership receipt', () => {
    const created = createOwnershipReceipt('note-1', () => Buffer.alloc(24, 7))
    expect(created.receipt).toMatch(/^note-1\./)
    expect(created.secretHash).not.toContain(created.receipt)
    expect(verifyOwnershipReceipt(created.receipt, {
      id: 'note-1',
      ownershipSecretHash: created.secretHash,
    })).toBe(true)
    expect(verifyOwnershipReceipt(created.receipt, {
      id: 'note-2',
      ownershipSecretHash: created.secretHash,
    })).toBe(false)
  })
})
