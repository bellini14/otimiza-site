const INVALID_RESPONSE_MESSAGE = 'O mural respondeu de forma inesperada. Tente novamente.'
const DEFAULT_TIMEOUT_MS = 10_000

export class MemorialApiError extends Error {
  constructor(code, message, status) {
    super(message)
    this.name = 'MemorialApiError'
    this.code = code
    this.status = status
  }
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function hasNote(value) {
  return isRecord(value) && typeof value.id === 'string'
}

function isNotesResponse(body) {
  return isRecord(body) && Array.isArray(body.notes)
}

function isAccessResponse(body) {
  return isRecord(body)
    && typeof body.name === 'string'
    && typeof body.hasNote === 'boolean'
    && typeof body.sessionToken === 'string'
    && (body.note === null || hasNote(body.note))
}

function isPublishResponse(body) {
  return isRecord(body)
    && hasNote(body.note)
    && typeof body.ownershipReceipt === 'string'
}

function isUpdateResponse(body) {
  return isRecord(body) && hasNote(body.note)
}

function isDeleteResponse(body) {
  return isRecord(body) && body.deleted === true
}

function invalidResponse(status = 0) {
  return new MemorialApiError('INVALID_RESPONSE', INVALID_RESPONSE_MESSAGE, status)
}

async function parseBody(response) {
  let text
  try {
    text = await response.text()
  } catch {
    throw invalidResponse(response.status)
  }
  if (!text) throw invalidResponse(response.status)
  try {
    return JSON.parse(text)
  } catch {
    throw invalidResponse(response.status)
  }
}

async function request(fetchFn, url, options, validate, timeoutMs) {
  const controller = new AbortController()
  const upstreamSignal = options?.signal
  const abortFromUpstream = () => controller.abort(upstreamSignal?.reason)

  if (upstreamSignal?.aborted) abortFromUpstream()
  else upstreamSignal?.addEventListener('abort', abortFromUpstream, { once: true })

  const timer = setTimeout(() => controller.abort('timeout'), timeoutMs)
  let response
  try {
    response = await fetchFn(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      signal: controller.signal,
    })
  } catch (error) {
    if (controller.signal.aborted && !upstreamSignal?.aborted) {
      throw new MemorialApiError(
        'TIMEOUT',
        'O mural demorou para responder. Tente novamente.',
        0,
      )
    }
    if (error instanceof MemorialApiError) throw error
    throw new MemorialApiError(
      'NETWORK_ERROR',
      'Não foi possível conectar ao mural. Tente novamente.',
      0,
    )
  } finally {
    clearTimeout(timer)
    upstreamSignal?.removeEventListener('abort', abortFromUpstream)
  }

  const body = await parseBody(response)
  if (!response.ok) {
    throw new MemorialApiError(
      body?.error?.code || 'REQUEST_FAILED',
      body?.error?.message || 'Não foi possível concluir agora.',
      response.status,
    )
  }
  if (!validate(body)) throw invalidResponse(response.status)
  return body
}

export function createMemorialApi(
  fetchFn = window.fetch.bind(window),
  { timeoutMs = DEFAULT_TIMEOUT_MS } = {},
) {
  const send = (url, options, validate) => request(
    fetchFn,
    url,
    options,
    validate,
    timeoutMs,
  )

  return {
    listNotes: () => send('/api/memorial/notes', {}, isNotesResponse),
    access: (payload) => send('/api/memorial/access', {
      method: 'POST', body: JSON.stringify(payload),
    }, isAccessResponse),
    publishNote: ({ sessionToken, message, showName }) => send(
      '/api/memorial/notes',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ message, showName }),
      },
      isPublishResponse,
    ),
    updateNote: ({ id, authorization, message, showName }) => send(
      `/api/memorial/notes/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authorization}` },
        body: JSON.stringify({ message, showName }),
      },
      isUpdateResponse,
    ),
    deleteNote: ({ id, authorization, emailConfirmation }) => send(
      `/api/memorial/notes/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authorization}` },
        body: JSON.stringify({ emailConfirmation }),
      },
      isDeleteResponse,
    ),
  }
}

export const memorialApi = createMemorialApi()
