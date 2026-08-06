import { describe, expect, it, vi } from 'vitest'
import { ContactEmailConfigurationError, ContactEmailProviderError, sendContactEmail } from './smtp2go.js'

const contact = {
  firstName: 'João',
  lastName: 'Silva',
  email: 'joao@example.com',
  message: 'Gostaria de conversar sobre um projeto.',
}

const configuredEnv = {
  SMTP_HOST: 'mail.smtp2go.com',
  SMTP_PORT: '2525',
  SMTP_USER: 'mailerotm',
  SMTP_PASS: 'smtp-password',
  CONTACT_FROM_EMAIL: 'site@otm.com.br',
  CONTACT_TO_EMAIL: 'otm@otm.com.br',
}

describe('SMTP2GO contact adapter', () => {
  it('sends a contact email with the visitor as reply-to', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'smtp-message-id' })
    const createTransport = vi.fn().mockReturnValue({ sendMail })

    await sendContactEmail(contact, { createTransport, env: configuredEnv })

    expect(createTransport).toHaveBeenCalledWith({
      host: 'mail.smtp2go.com',
      port: 2525,
      secure: false,
      auth: { user: 'mailerotm', pass: 'smtp-password' },
    })
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'site@otm.com.br',
      to: 'otm@otm.com.br',
      replyTo: 'joao@example.com',
      subject: expect.stringContaining('João Silva'),
      text: expect.stringContaining('Gostaria de conversar'),
      html: expect.stringContaining('Gostaria de conversar'),
    }))
  })

  it('throws a configuration error when credentials are absent', async () => {
    await expect(sendContactEmail(contact, { env: {}, createTransport: vi.fn() }))
      .rejects.toBeInstanceOf(ContactEmailConfigurationError)
  })

  it('throws a provider error when SMTP2GO rejects the message', async () => {
    const createTransport = vi.fn().mockReturnValue({
      sendMail: vi.fn().mockRejectedValue(new Error('Authentication failed')),
    })

    await expect(sendContactEmail(contact, { createTransport, env: configuredEnv }))
      .rejects.toBeInstanceOf(ContactEmailProviderError)
  })
})
