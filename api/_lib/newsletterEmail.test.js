import { describe, expect, it, vi } from 'vitest'
import { NewsletterEmailConfigurationError, sendNewsletterEmail } from './newsletterEmail.js'

const subscriber = {
  name: '<Maria & João>',
  email: 'reader+<test>@example.com',
}

const configuredEnv = {
  SMTP_HOST: 'mail.smtp2go.com',
  SMTP_PORT: '2525',
  SMTP_USER: 'mailerotm',
  SMTP_PASS: 'smtp-password',
  CONTACT_FROM_EMAIL: 'site@otm.com.br',
  NEWSLETTER_TO_EMAIL: 'newsletter@otm.com.br',
  VITE_SITE_URL: 'https://www.otm.com.br',
}

describe('SMTP2GO newsletter adapter', () => {
  it('sends the subscriber details to the newsletter recipient', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'smtp-message-id' })
    const createTransport = vi.fn().mockReturnValue({ sendMail })

    await sendNewsletterEmail(subscriber, { createTransport, env: configuredEnv })

    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'site@otm.com.br',
      to: 'newsletter@otm.com.br',
      replyTo: 'reader+<test>@example.com',
      text: expect.stringContaining('<Maria & João>'),
      html: expect.stringContaining('<table'),
    }))

    const message = sendMail.mock.calls[0][0]
    expect(message.html).toContain('https://www.otm.com.br/inspire-email-logo.png')
    expect(message.html).toMatch(/<img[^>]+alt="Inspire"/)
    expect(message.html).toContain('Novo Assinante!')
    expect(message.html).toContain('Uma nova pessoa acabou de assinar a newsletter Inspire.')
    expect(message.html).toContain('&lt;Maria &amp; João&gt;')
    expect(message.html).toContain('reader+&lt;test&gt;@example.com')
    expect(message.html).toContain('Este aviso é enviado automaticamente pelo site da Otimiza após uma nova inscrição consentida.')
    expect(message.html).toContain('uma publicação da Otimiza Consultoria em Administração')
    expect(message.html).toContain('background:#444b55')
  })

  it.each([
    'https://localhost',
    'https://127.0.0.1',
    'https://192.168.1.10',
    'https://[::1]',
    'https://[::127.0.0.1]',
    'https://[::10.0.0.1]',
    'https://[::ffff:127.0.0.1]',
    'https://[::ffff:10.0.0.1]',
    'https://[ff02::1]',
    'https://otimiza-git-main.vercel.app',
    'https://otimiza-abc123-joao.vercel.app',
  ])('rejects non-public logo URL %s', async (siteUrl) => {
    await expect(sendNewsletterEmail(subscriber, {
      createTransport: vi.fn(),
      env: { ...configuredEnv, VITE_SITE_URL: siteUrl },
    })).rejects.toBeInstanceOf(NewsletterEmailConfigurationError)
  })

  it('allows a public production Vercel host', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'smtp-message-id' })

    await expect(sendNewsletterEmail(subscriber, {
      createTransport: vi.fn().mockReturnValue({ sendMail }),
      env: { ...configuredEnv, VITE_SITE_URL: 'https://otimiza-site.vercel.app' },
    })).resolves.toBeUndefined()

    expect(sendMail.mock.calls[0][0].html).toContain('https://otimiza-site.vercel.app/inspire-email-logo.png')
  })
})
