import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from './contact.js'
import {
  ContactEmailConfigurationError,
  ContactEmailProviderError,
  sendContactEmail,
} from './_lib/smtp2go.js'

vi.mock('./_lib/smtp2go.js', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, sendContactEmail: vi.fn() }
})

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    jsonBody: undefined,
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
      return this
    },
  }
}

const validBody = {
  firstName: 'João',
  lastName: 'Silva',
  email: 'joao@example.com',
  message: 'Quero conversar sobre um projeto da Otimiza.',
  company: '',
}

beforeEach(() => {
  sendContactEmail.mockReset()
})

describe('contact API route', () => {
  it('rejects unsupported methods', async () => {
    const res = createResponse()
    await handler({ method: 'GET' }, res)
    expect(res.headers.Allow).toBe('POST')
    expect(res.statusCode).toBe(405)
  })

  it.each([
    [{ ...validBody, firstName: '' }],
    [{ ...validBody, email: 'email-invalido' }],
    [{ ...validBody, message: 'a'.repeat(5001) }],
  ])('rejects invalid contact data', async (body) => {
    const res = createResponse()
    await handler({ method: 'POST', body }, res)
    expect(res.statusCode).toBe(400)
    expect(sendContactEmail).not.toHaveBeenCalled()
  })

  it('accepts honeypot submissions without sending email', async () => {
    const res = createResponse()
    await handler({ method: 'POST', body: { ...validBody, company: 'spam' } }, res)
    expect(res.statusCode).toBe(200)
    expect(sendContactEmail).not.toHaveBeenCalled()
  })

  it('returns service unavailable when SMTP2GO is not configured', async () => {
    sendContactEmail.mockRejectedValue(new ContactEmailConfigurationError())
    const res = createResponse()
    await handler({ method: 'POST', body: validBody }, res)
    expect(res.statusCode).toBe(503)
  })

  it('returns bad gateway when SMTP2GO fails', async () => {
    sendContactEmail.mockRejectedValue(new ContactEmailProviderError())
    const res = createResponse()
    await handler({ method: 'POST', body: validBody }, res)
    expect(res.statusCode).toBe(502)
  })

  it('sends valid contact data', async () => {
    sendContactEmail.mockResolvedValue()
    const res = createResponse()
    await handler({ method: 'POST', body: validBody }, res)
    expect(sendContactEmail).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'João',
      email: 'joao@example.com',
    }))
    expect(res.statusCode).toBe(200)
    expect(res.jsonBody.message).toMatch(/recebida/i)
  })
})
