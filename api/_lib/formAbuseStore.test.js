import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { createFormAbuseStore } from './formAbuseStore.js'
let db, store
beforeAll(async () => {
  db = new PGlite()
  await db.waitReady
  const sql = async (parts, ...values) => {
    const query = parts.reduce((text, part, i) => text + (i ? '$' + i : '') + part, '')
    return (await db.query(query, values)).rows
  }
  store = createFormAbuseStore(sql)
}, 30000)
afterAll(async () => { await db?.close() })
describe('PostgreSQL abuse store', () => {
  it('admits only three competing requests in a quota window', async () => {
    const results = await Promise.all(Array.from({ length: 12 }, () => store.consume('email-key', 3, 3600)))
    expect(results.filter((value) => value.allowed)).toHaveLength(3)
    expect(results[3].retryAfter).toBeGreaterThan(0)
  })
  it('resets an expired quota', async () => {
    await db.query("UPDATE form_abuse_limits SET expires_at = NOW() - INTERVAL '1 second' WHERE key = 'email-key'")
    expect((await store.consume('email-key', 3, 3600)).allowed).toBe(true)
  })
  it('reserves one owner and distinguishes pending from completed', async () => {
    const results = await Promise.all(Array.from({ length: 6 }, () => store.reserve('submission')))
    expect(results.filter((value) => value.state === 'reserved')).toHaveLength(1)
    expect(results.filter((value) => value.state === 'pending')).toHaveLength(5)
    const owner = results.find((value) => value.state === 'reserved')
    await store.complete('submission', owner.lease, 86400)
    expect((await store.reserve('submission')).state).toBe('duplicate')
    await store.release('submission', owner.lease)
    expect((await store.reserve('submission')).state).toBe('duplicate')
  })
  it('does not let expired workers release or complete a replacement lease', async () => {
    const old = await store.reserve('stale')
    await db.query("UPDATE form_abuse_submissions SET expires_at = NOW() - INTERVAL '1 second' WHERE key = 'stale'")
    const current = await store.reserve('stale')
    expect(current.lease).not.toBe(old.lease)
    await store.release('stale', old.lease)
    await store.complete('stale', old.lease, 86400)
    expect((await store.reserve('stale')).state).toBe('pending')
    await store.release('stale', current.lease)
    expect((await store.reserve('stale')).state).toBe('reserved')
  })
  it('cleans expired rows without removing current reservations', async () => {
    await db.query("UPDATE form_abuse_limits SET expires_at = NOW() - INTERVAL '1 second'")
    await store.cleanup()
    expect((await db.query('SELECT * FROM form_abuse_limits')).rows).toHaveLength(0)
    expect((await store.reserve('submission')).state).toBe('duplicate')
  })
})
