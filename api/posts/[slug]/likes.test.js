import { beforeEach, describe, expect, it, vi } from 'vitest'

const getCount = vi.fn()
const incrementCount = vi.fn()

vi.mock('../../_lib/postLikesStore.js', () => ({
  getPostLikesStore: () => ({
    getCount,
    incrementCount,
  }),
  normalizePostSlug: (value) => (typeof value === 'string' ? value.trim() : ''),
}))

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    jsonBody: undefined,
    ended: false,
    setHeader(name, value) {
      this.headers[name] = value
      return this
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.jsonBody = payload
      this.ended = true
      return this
    },
    end(payload = '') {
      this.textBody = payload
      this.ended = true
      return this
    },
  }
}

beforeEach(() => {
  getCount.mockReset()
  incrementCount.mockReset()
})

describe('post likes api route', () => {
  it('returns the current like count for a valid post slug', async () => {
    const { default: handler } = await import('./likes.js')
    const req = {
      method: 'GET',
      query: { slug: 'meu-post' },
    }
    const res = createResponse()

    getCount.mockResolvedValue(7)

    await handler(req, res)

    expect(getCount).toHaveBeenCalledWith('meu-post')
    expect(res.statusCode).toBe(200)
    expect(res.jsonBody).toEqual({ slug: 'meu-post', count: 7 })
  })

  it('increments likes on post requests and returns the updated count', async () => {
    const { default: handler } = await import('./likes.js')
    const req = {
      method: 'POST',
      query: { slug: 'meu-post' },
    }
    const res = createResponse()

    incrementCount.mockResolvedValue(8)

    await handler(req, res)

    expect(incrementCount).toHaveBeenCalledWith('meu-post')
    expect(res.statusCode).toBe(200)
    expect(res.jsonBody).toEqual({ slug: 'meu-post', count: 8, liked: true })
  })

  it('rejects invalid slugs before touching the store', async () => {
    const { default: handler } = await import('./likes.js')
    const req = {
      method: 'GET',
      query: { slug: '' },
    }
    const res = createResponse()

    await handler(req, res)

    expect(getCount).not.toHaveBeenCalled()
    expect(incrementCount).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(400)
    expect(res.jsonBody).toEqual({ error: 'Invalid post slug.' })
  })

  it('returns method not allowed for unsupported verbs', async () => {
    const { default: handler } = await import('./likes.js')
    const req = {
      method: 'DELETE',
      query: { slug: 'meu-post' },
    }
    const res = createResponse()

    await handler(req, res)

    expect(res.headers.Allow).toEqual(['GET', 'POST'])
    expect(res.statusCode).toBe(405)
    expect(res.jsonBody).toEqual({ error: 'Method not allowed.' })
  })
})
