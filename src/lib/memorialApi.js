export class MemorialApiError extends Error {
  constructor(code, message, status) {
    super(message)
    this.code = code
    this.status = status
  }
}

async function request(fetchFn, url, options = {}) {
  let response
  try {
    response = await fetchFn(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  } catch {
    throw new MemorialApiError(
      'NETWORK_ERROR',
      'Não foi possível conectar ao mural. Tente novamente.',
      0,
    )
  }
  const body = await response.json()
  if (!response.ok) {
    throw new MemorialApiError(
      body?.error?.code || 'REQUEST_FAILED',
      body?.error?.message || 'Não foi possível concluir agora.',
      response.status,
    )
  }
  return body
}

export function createMemorialApi(fetchFn = window.fetch.bind(window)) {
  return {
    listNotes: () => request(fetchFn, '/api/memorial/notes'),
    access: (payload) => request(fetchFn, '/api/memorial/access', {
      method: 'POST', body: JSON.stringify(payload),
    }),
    publishNote: ({ sessionToken, message, showName }) => request(
      fetchFn,
      '/api/memorial/notes',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ message, showName }),
      },
    ),
    updateNote: ({ id, authorization, message, showName }) => request(
      fetchFn,
      `/api/memorial/notes/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authorization}` },
        body: JSON.stringify({ message, showName }),
      },
    ),
    deleteNote: ({ id, authorization, emailConfirmation }) => request(
      fetchFn,
      `/api/memorial/notes/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authorization}` },
        body: JSON.stringify({ emailConfirmation }),
      },
    ),
  }
}

export const memorialApi = createMemorialApi()
