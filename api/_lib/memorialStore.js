import postgres from 'postgres'
import { MemorialError } from './memorialErrors.js'

let store
let client
let ensurePromise

function getClient() {
  if (!client) {
    const url = process.env.POSTGRES_URL || process.env.DATABASE_URL
    if (!url) throw new MemorialError('SERVICE_UNAVAILABLE', 'Mural não configurado.', 503)
    client = postgres(url, { prepare: false })
  }
  return client
}

function ensureTable(sql) {
  if (!ensurePromise) {
    ensurePromise = sql`
      CREATE TABLE IF NOT EXISTS memorial_notes (
        id UUID PRIMARY KEY,
        invite_key TEXT UNIQUE NOT NULL,
        message VARCHAR(280) NOT NULL,
        display_name TEXT,
        ownership_secret_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
  }
  return ensurePromise
}

function mapNote(row, includePrivate = false) {
  if (!row) return null
  const note = {
    id: row.id,
    message: row.message,
    name: row.display_name ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
  if (includePrivate) {
    note.inviteKey = row.invite_key
    note.ownershipSecretHash = row.ownership_secret_hash
  }
  return note
}

export function createMemorialStore(sql = getClient()) {
  return {
    async listPublicNotes() {
      await ensureTable(sql)
      const rows = await sql`
        SELECT id, message, display_name, created_at, updated_at
        FROM memorial_notes
        ORDER BY created_at ASC
      `
      return rows.map((row) => mapNote(row))
    },
    async findByInviteKey(inviteKey) {
      await ensureTable(sql)
      const rows = await sql`
        SELECT *
        FROM memorial_notes
        WHERE invite_key = ${inviteKey}
        LIMIT 1
      `
      return mapNote(rows[0], true)
    },
    async findById(id) {
      await ensureTable(sql)
      const rows = await sql`SELECT * FROM memorial_notes WHERE id = ${id} LIMIT 1`
      return mapNote(rows[0], true)
    },
    async createNote(note) {
      await ensureTable(sql)
      try {
        const rows = await sql`
          INSERT INTO memorial_notes (
            id, invite_key, message, display_name, ownership_secret_hash
          )
          VALUES (
            ${note.id}, ${note.inviteKey}, ${note.message},
            ${note.displayName}, ${note.ownershipSecretHash}
          )
          RETURNING *
        `
        return mapNote(rows[0])
      } catch (error) {
        if (error?.code === '23505') {
          throw new MemorialError('NOTE_EXISTS', 'Este convite já possui uma lembrança.', 409)
        }
        throw error
      }
    },
    async updateNote(id, { message, displayName }) {
      await ensureTable(sql)
      const rows = await sql`
        UPDATE memorial_notes
        SET message = ${message}, display_name = ${displayName}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
      return mapNote(rows[0])
    },
    async deleteNote(id) {
      await ensureTable(sql)
      const rows = await sql`DELETE FROM memorial_notes WHERE id = ${id} RETURNING id`
      return rows.length > 0
    },
  }
}

export function getMemorialStore() {
  if (!store) store = createMemorialStore()
  return store
}
