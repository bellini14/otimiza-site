import { describe, expect, it, vi } from 'vitest'
import { buildWelcomeEmail, fetchLatestWelcomePosts, sendWelcomeEmail } from './welcomeEmail.js'

const env = { SMTP_HOST: 'smtp.example.com', SMTP_PORT: '587', SMTP_USER: 'user', SMTP_PASS: 'test', CONTACT_FROM_EMAIL: 'site@example.com', CONTACT_TO_EMAIL: 'team@example.com', VITE_SITE_URL: 'https://www.otm.com.br' }
const post = { title: 'Gestão & pessoas', slug: 'gestao', publishedAt: '2026-09-10T12:00:00Z', eyebrow: 'Estratégia', image: 'https://cdn.sanity.io/images/igy822g7/production/test-800x600.png' }

describe('welcome email', () => {
  it('renders the supplied identity, safe personalization and dated article links', () => {
    const message = buildWelcomeEmail({ name: '<Rafael>', posts: [post] })
    expect(message.html).toContain('#e1e6ef')
    expect(message.html).toContain('#ffe978')
    expect(message.html).toContain('border-radius:14px')
    expect(message.html).toContain('inspire-logo.png')
    expect(message.html).toContain('Olá, &lt;Rafael&gt;!')
    expect(message.html).toContain('/2026/09/10/gestao')
    expect(message.html).toContain('Gestão &amp; pessoas')
    expect(message.text).toContain('Gestão & pessoas')
  })
  it('uses a generic greeting and useful fallback when content is unavailable', () => {
    const message = buildWelcomeEmail({ posts: [] })
    expect(message.html).toContain('Olá!')
    expect(message.html).toContain('Explorar o Inspire')
    expect(message.html).not.toContain('undefined')
  })
  it('rejects untrusted image protocols and escapes CMS content', () => {
    const { html } = buildWelcomeEmail({ posts: [{ ...post, image: 'javascript:alert(1)', title: '<script>bad</script>', slug: 'x" onclick="bad' }] })
    expect(html).not.toContain('src="javascript:')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain(' onclick="')
  })
  it('fetches the three latest published posts with a bounded request', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: [post] }) })
    expect(await fetchLatestWelcomePosts({ fetchImpl })).toEqual([post])
    const [url, options] = fetchImpl.mock.calls[0]
    expect(decodeURIComponent(url)).toContain('publishedAt <= now()')
    expect(decodeURIComponent(url)).toContain('order(publishedAt desc)')
    expect(decodeURIComponent(url)).toContain('[0...3]')
    expect(options.signal).toBeDefined()
  })
  it('falls back when the CMS fails', async () => {
    expect(await fetchLatestWelcomePosts({ fetchImpl: vi.fn().mockRejectedValue(new Error('offline')) })).toEqual([])
  })
  it('sends the welcome only to the subscriber, including current posts', async () => {
    const sendMail = vi.fn().mockResolvedValue({})
    const getPosts = vi.fn().mockResolvedValue([post])
    await sendWelcomeEmail({ name: 'Rafael', email: 'reader@example.com' }, { env, getPosts, createTransport: async () => ({ sendMail }) })
    expect(getPosts).toHaveBeenCalledOnce()
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'reader@example.com', from: 'site@example.com', subject: 'Bem-vindo ao Inspire!', html: expect.stringContaining('/2026/09/10/gestao') }))
    expect(sendMail.mock.calls[0][0]).not.toHaveProperty('bcc')
  })
})
