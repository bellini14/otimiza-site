import { describe, expect, it, vi } from 'vitest'
import { ContactEmailConfigurationError, ContactEmailProviderError, sendContactEmail } from './smtp2go.js'

const contact = {
  firstName: 'João',
  lastName: 'Silva',
  email: 'joao@example.com',
  message: 'Gostaria de conversar sobre um projeto.',
}

const configuredEnv = {
  SMTP2GO_API_KEY: 'secret-api-key',
  CONTACT_FROM_EMAIL: 'site@otm.com.br',
  CONTACT_TO_EMAIL: 'otm@otm.com.br',
}

describe('SMTP2GO contact adapter', () => {
  it('sends a contact email with the visitor as reply-to', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ data: { succeeded: 1, failed: 0 } }),
    })

    await sendContactEmail(contact, { fetchImpl, env: configuredEnv })

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.smtp2go.com/v3/email/send',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Smtp2go-Api-Key': 'secret-api-key',
        },
      }),
    )

    const payload = JSON.parse(fetchImpl.mock.calls[0][1].body)
    expect(payload.sender).toBe('site@otm.com.br')
    expect(payload.to).toEqual(['otm@otm.com.br'])
    expect(payload.custom_headers).toEqual([{ header: 'Reply-To', value: 'joao@example.com' }])
    expect(payload.subject).toContain('João Silva')
    expect(payload.text_body).toContain('Gostaria de conversar')
  })

  it('throws a configuration error when credentials are absent', async () => {
    await expect(sendContactEmail(contact, { env: {}, fetchImpl: vi.fn() }))
      .rejects.toBeInstanceOf(ContactEmailConfigurationError)
  })

  it('throws a provider error when SMTP2GO rejects the request', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({ data: { error: 'Unauthorized' } }),
    })

    await expect(sendContactEmail(contact, { fetchImpl, env: configuredEnv }))
      .rejects.toBeInstanceOf(ContactEmailProviderError)
  })
})
