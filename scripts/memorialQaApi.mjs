const INVITES = [
  {
    email: 'convidada@example.com',
    name: 'Convidada Exemplo',
  },
  {
    email: 'joaoabellini107@gmail.com',
    name: 'João Abellini',
  },
]

export function createMemorialQaState() {
  let note = null
  let activeInvite = null
  return {
    handle(method, path, body = {}) {
      if (path === '/api/memorial/access' && method === 'POST') {
        const normalizedEmail = String(body.email || '').trim().toLowerCase()
        activeInvite = INVITES.find((invite) => invite.email === normalizedEmail) || null
        if (!activeInvite) {
          return {
            status: 403,
            body: { error: { code: 'INVITE_NOT_FOUND', message: 'E-mail não autorizado.' } },
          }
        }
        return {
          status: 200,
          body: {
            name: activeInvite.name,
            hasNote: Boolean(note),
            sessionToken: note ? 'qa-manage-token' : 'qa-contribute-token',
            note,
          },
        }
      }
      if (path === '/api/memorial/notes' && method === 'GET') {
        return { status: 200, body: { notes: note ? [note] : [], count: note ? 1 : 0 } }
      }
      if (path === '/api/memorial/notes' && method === 'POST') {
        if (note) {
          return {
            status: 409,
            body: { error: { code: 'NOTE_EXISTS', message: 'Este convite já publicou.' } },
          }
        }
        note = {
          id: 'qa-note',
          message: String(body.message || '').trim(),
          name: body.showName ? activeInvite?.name || null : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        return {
          status: 201,
          body: { note, ownershipReceipt: 'qa-note.qa-secret' },
        }
      }
      if (path === '/api/memorial/notes/qa-note' && method === 'PATCH' && note) {
        note = {
          ...note,
          message: String(body.message || '').trim(),
          name: body.showName ? activeInvite?.name || null : null,
          updatedAt: new Date().toISOString(),
        }
        return { status: 200, body: { note } }
      }
      if (path === '/api/memorial/notes/qa-note' && method === 'DELETE' && note) {
        if (String(body.emailConfirmation || '').trim().toLowerCase() !== activeInvite?.email) {
          return {
            status: 403,
            body: { error: { code: 'INVITE_NOT_FOUND', message: 'E-mail não corresponde.' } },
          }
        }
        note = null
        return { status: 200, body: { deleted: true } }
      }
      return {
        status: 404,
        body: { error: { code: 'NOTE_NOT_FOUND', message: 'Não encontrado.' } },
      }
    },
  }
}

async function readJson(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (!chunks.length) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export function memorialQaApiPlugin() {
  const state = createMemorialQaState()
  return {
    name: 'memorial-qa-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = String(req.url || '').split('?')[0]
        if (!path.startsWith('/api/memorial')) return next()
        try {
          const body = ['POST', 'PATCH', 'DELETE'].includes(req.method)
            ? await readJson(req)
            : {}
          const result = state.handle(req.method, path, body)
          res.statusCode = result.status
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(result.body))
        } catch {
          res.statusCode = 400
          res.end(JSON.stringify({
            error: { code: 'INVALID_REQUEST', message: 'Dados inválidos.' },
          }))
        }
      })
    },
  }
}
