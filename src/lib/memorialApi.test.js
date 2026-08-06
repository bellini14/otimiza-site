import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemorialApi, MemorialApiError } from './memorialApi.js'

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    text: async () => JSON.stringify(body),
  }
}

describe('memorial api', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('sends bearer credentials and accepts a valid update result', async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ note: { id: 'one' } }))
    const api = createMemorialApi(fetchFn)

    await expect(api.updateNote({
      id: 'one', authorization: 'receipt', message: 'Olá', showName: true,
    })).resolves.toEqual({ note: { id: 'one' } })

    expect(fetchFn).toHaveBeenCalledWith('/api/memorial/notes/one', expect.objectContaining({
      method: 'PATCH',
      headers: expect.objectContaining({ Authorization: 'Bearer receipt' }),
      signal: expect.any(AbortSignal),
    }))
  })

  it.each([
    {},
    { notes: null },
    { notes: {} },
  ])('rejects a malformed notes payload: %j', async (body) => {
    const api = createMemorialApi(vi.fn().mockResolvedValue(jsonResponse(body)))

    await expect(api.listNotes()).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
      status: 200,
    })
  })

  it('rejects an empty successful response', async () => {
    const api = createMemorialApi(vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      text: async () => '',
    }))

    await expect(api.listNotes()).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })

  it('converts invalid JSON into a safe response error', async () => {
    const api = createMemorialApi(vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '{not-json',
    }))

    await expect(api.listNotes()).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
      message: 'O mural respondeu de forma inesperada. Tente novamente.',
    })
  })

  it('preserves structured HTTP errors', async () => {
    const api = createMemorialApi(vi.fn().mockResolvedValue(jsonResponse({
      error: { code: 'INVITE_NOT_FOUND', message: 'E-mail não autorizado.' },
    }, { ok: false, status: 403 })))

    await expect(api.access({ email: 'x@example.com', intent: 'contribute' }))
      .rejects.toMatchObject({
        code: 'INVITE_NOT_FOUND',
        message: 'E-mail não autorizado.',
        status: 403,
      })
  })

  it('converts fetch failures into a safe network error', async () => {
    const api = createMemorialApi(vi.fn().mockRejectedValue(new TypeError('offline')))

    await expect(api.listNotes()).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      status: 0,
    })
  })

  it('aborts a request that exceeds the timeout', async () => {
    vi.useFakeTimers()
    const fetchFn = vi.fn((_, options) => new Promise((resolve, reject) => {
      options.signal.addEventListener('abort', () => {
        reject(new DOMException('Timed out', 'AbortError'))
      })
    }))
    const api = createMemorialApi(fetchFn, { timeoutMs: 25 })

    const result = api.listNotes()
    const rejection = expect(result).rejects.toMatchObject({
      code: 'TIMEOUT',
      status: 0,
    })
    await vi.advanceTimersByTimeAsync(25)

    await rejection
  })

  it('exports typed memorial errors', () => {
    expect(new MemorialApiError('CODE', 'message', 400)).toBeInstanceOf(Error)
  })
})
