import postgres from 'postgres'
import { randomUUID } from 'node:crypto'

let productionStore

export function createFormAbuseStore(sql) {
  let ready
  async function prepare() {
    if (!ready) {
      ready = (async () => {
        await sql`CREATE TABLE IF NOT EXISTS form_abuse_limits (
          key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at TIMESTAMPTZ NOT NULL
        )`
        await sql`CREATE TABLE IF NOT EXISTS form_abuse_submissions (
          key TEXT PRIMARY KEY, lease TEXT NOT NULL, completed BOOLEAN NOT NULL DEFAULT FALSE,
          expires_at TIMESTAMPTZ NOT NULL
        )`
        await sql`CREATE INDEX IF NOT EXISTS form_abuse_limits_expiry ON form_abuse_limits (expires_at)`
        await sql`CREATE INDEX IF NOT EXISTS form_abuse_submissions_expiry ON form_abuse_submissions (expires_at)`
      })().catch((error) => { ready = undefined; throw error })
    }
    await ready
  }
  return {
    async consume(key, limit, seconds) {
      await prepare()
      const rows = await sql`
        INSERT INTO form_abuse_limits (key, count, expires_at)
        VALUES (${key}, 1, NOW() + ${seconds} * INTERVAL '1 second')
        ON CONFLICT (key) DO UPDATE SET
          count = CASE WHEN form_abuse_limits.expires_at <= NOW() THEN 1 ELSE LEAST(form_abuse_limits.count + 1, ${limit + 1}) END,
          expires_at = CASE WHEN form_abuse_limits.expires_at <= NOW() THEN NOW() + ${seconds} * INTERVAL '1 second' ELSE form_abuse_limits.expires_at END
        RETURNING count, CEIL(EXTRACT(EPOCH FROM (expires_at - NOW())))::int AS retry_after
      `
      return { allowed: rows[0].count <= limit, retryAfter: Math.max(1, rows[0].retry_after) }
    },
    async reserve(key) {
      await prepare()
      const lease = randomUUID()
      const rows = await sql`
        INSERT INTO form_abuse_submissions (key, lease, completed, expires_at)
        VALUES (${key}, ${lease}, FALSE, NOW() + INTERVAL '2 minutes')
        ON CONFLICT (key) DO UPDATE SET
          lease = EXCLUDED.lease, completed = FALSE, expires_at = EXCLUDED.expires_at
        WHERE form_abuse_submissions.expires_at <= NOW()
        RETURNING lease
      `
      if (rows.length) return { state: 'reserved', lease }
      const existing = await sql`SELECT completed FROM form_abuse_submissions WHERE key = ${key}`
      return { state: existing[0]?.completed ? 'duplicate' : 'pending' }
    },
    async complete(key, lease, seconds) {
      await sql`UPDATE form_abuse_submissions SET completed = TRUE, expires_at = NOW() + ${seconds} * INTERVAL '1 second'
        WHERE key = ${key} AND lease = ${lease}`
    },
    async release(key, lease) {
      await sql`DELETE FROM form_abuse_submissions WHERE key = ${key} AND lease = ${lease} AND completed = FALSE`
    },
    async cleanup() {
      await prepare()
      await sql`DELETE FROM form_abuse_limits WHERE key IN (
        SELECT key FROM form_abuse_limits WHERE expires_at < NOW() ORDER BY expires_at LIMIT 100
      ) AND expires_at < NOW()`
      await sql`DELETE FROM form_abuse_submissions WHERE key IN (
        SELECT key FROM form_abuse_submissions WHERE expires_at < NOW() ORDER BY expires_at LIMIT 100
      ) AND expires_at < NOW()`
    },
  }
}

export function getFormAbuseStore() {
  if (!productionStore) {
    const url = process.env.POSTGRES_URL || process.env.DATABASE_URL
    if (!url) throw new Error('Form protection storage unavailable')
    productionStore = createFormAbuseStore(postgres(url, {
      prepare: false, max: 2, connect_timeout: 5,
      connection: { statement_timeout: 5000 },
    }))
  }
  return productionStore
}
