import { describe, expect, it, vi } from 'vitest'
import {
  GUIDE_PDF_URL,
  buildGuideEmail,
  buildGuideLeadNotification,
  sendGuideEmail,
  sendGuideLeadNotification,
} from './guideEmail.js'

const env = {
  SMTP_HOST: 'smtp.example.test', SMTP_PORT: '587', SMTP_USER: 'user', SMTP_PASS: 'pass',
  CONTACT_FROM_EMAIL: 'site@otm.com.br', CONTACT_TO_EMAIL: 'equipe@otm.com.br', VITE_SITE_URL: 'https://www.otm.com.br',
}
const lead = { name: 'Ana Souza', email: 'ana@empresa.com.br', companyName: 'Empresa <X>', newsletterConsent: true }

function capture() {
  const sent = []
  return { sent, createTransport: vi.fn(async () => ({ sendMail: async (m) => { sent.push(m) } })) }
}

describe('guide email', () => {
  it('greets by first name and links the hosted PDF', () => {
    const { html, text } = buildGuideEmail({ name: 'Ana Souza' })
    expect(html).toContain('Olá, Ana!')
    expect(html).toContain(`href="${GUIDE_PDF_URL}"`)
    expect(text).toContain(GUIDE_PDF_URL)
    expect(GUIDE_PDF_URL).toBe('https://www.otm.com.br/guia-de-conduta-otimiza.pdf')
  })

  it('sends the guide to the lead with the team as reply-to', async () => {
    const { sent, createTransport } = capture()
    await sendGuideEmail(lead, { env, createTransport })
    expect(sent[0]).toMatchObject({ from: 'site@otm.com.br', to: 'ana@empresa.com.br', replyTo: 'otm@otm.com.br', subject: 'Seu Guia de Conduta da Otimiza' })
  })

  it('notifies the team with escaped lead data and the lead as reply-to', async () => {
    const { html } = buildGuideLeadNotification(lead)
    expect(html).toContain('Empresa &lt;X&gt;')
    expect(html).toContain('Aceitou receber a newsletter Inspire')

    const { sent, createTransport } = capture()
    await sendGuideLeadNotification(lead, { env, createTransport })
    expect(sent[0]).toMatchObject({ to: 'equipe@otm.com.br', replyTo: 'ana@empresa.com.br', subject: 'Novo lead do Guia de Conduta — Ana Souza (Empresa <X>)' })
  })

  it('wraps SMTP failures in a provider error', async () => {
    const createTransport = async () => ({ sendMail: async () => { throw new Error('down') } })
    await expect(sendGuideEmail(lead, { env, createTransport })).rejects.toMatchObject({ name: 'NewsletterEmailProviderError' })
  })
})
