import postgres from 'postgres'

let store
let ensureTablePromise
let sqlClient

function getDatabaseUrl() {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
}

function getSqlClient() {
  if (!sqlClient) {
    const databaseUrl = getDatabaseUrl()

    if (!databaseUrl) {
      throw new Error('Missing POSTGRES_URL or DATABASE_URL for post likes.')
    }

    sqlClient = postgres(databaseUrl, {
      prepare: false,
    })
  }

  return sqlClient
}

function ensurePostLikesTable(sql) {
  if (!ensureTablePromise) {
    ensureTablePromise = sql`
      CREATE TABLE IF NOT EXISTS post_likes (
        slug TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
  }

  return ensureTablePromise
}

export function normalizePostSlug(value) {
  if (Array.isArray(value)) {
    return normalizePostSlug(value[0])
  }

  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

export function createPostLikesStore(sql = getSqlClient()) {
  return {
    async getCount(slug) {
      await ensurePostLikesTable(sql)

      const existingRows = await sql`
        SELECT count
        FROM post_likes
        WHERE slug = ${slug}
        LIMIT 1
      `

      if (existingRows.length > 0) {
        return existingRows[0].count
      }

      await sql`
        INSERT INTO post_likes (slug, count)
        VALUES (${slug}, 0)
        ON CONFLICT (slug) DO NOTHING
      `

      return 0
    },

    async incrementCount(slug) {
      await ensurePostLikesTable(sql)

      const rows = await sql`
        INSERT INTO post_likes (slug, count, updated_at)
        VALUES (${slug}, 1, NOW())
        ON CONFLICT (slug)
        DO UPDATE SET
          count = post_likes.count + 1,
          updated_at = NOW()
        RETURNING count
      `

      return rows[0]?.count ?? 1
    },
  }
}

export function getPostLikesStore() {
  if (!store) {
    store = createPostLikesStore()
  }

  return store
}
