import { beforeEach, describe, expect, it, vi } from 'vitest'
import contact from './contact.js'
import newsletter from './newsletter.js'
import { sendContactEmail } from './_lib/smtp2go.js'
import { sendNewsletterConversion } from './_lib/rdStation.js'
import { sendNewsletterEmail } from './_lib/newsletterEmail.js'
vi.mock('./_lib/smtp2go.js', async (original) => ({ ...await original(), sendContactEmail: vi.fn() }))
vi.mock('./_lib/rdStation.js', async (original) => ({ ...await original(), sendNewsletterConversion: vi.fn() }))
vi.mock('./_lib/newsletterEmail.js', async (original) => ({ ...await original(), sendNewsletterEmail: vi.fn() }))
const cases = [
  ['contact', contact, { firstName: 'Ana', lastName: 'Silva', email: 'ana@example.com', message: 'Olá' }],
  ['newsletter', newsletter, { name: 'Ana', email: 'ana@example.com', consent: true, source: 'inspire-popup' }],
]
beforeEach(() => { vi.clearAllMocks() })
describe('public form protection', () => {
  it.each(cases)('rejects %s without a Turnstile token before side effects', async (_name, handler, body) => {
    const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() }
    await handler({ method: 'POST', body }, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(sendContactEmail).not.toHaveBeenCalled()
    expect(sendNewsletterConversion).not.toHaveBeenCalled()
    expect(sendNewsletterEmail).not.toHaveBeenCalled()
  })
})
