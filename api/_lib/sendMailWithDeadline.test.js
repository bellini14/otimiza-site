import { afterEach, expect, it, vi } from 'vitest'
import { sendMailWithDeadline } from './sendMailWithDeadline.js'
afterEach(() => vi.useRealTimers())
it('closes a stalled SMTP connection before the reservation expires', async () => {
  vi.useFakeTimers()
  const transport = { sendMail: vi.fn(() => new Promise(() => {})), close: vi.fn() }
  const result = expect(sendMailWithDeadline(transport, {})).rejects.toThrow('deadline')
  await vi.advanceTimersByTimeAsync(20000)
  await result
  expect(transport.close).toHaveBeenCalled()
})
it('cleans up after successful mail', async () => {
  const transport = { sendMail: vi.fn().mockResolvedValue('delivered'), close: vi.fn() }
  expect(await sendMailWithDeadline(transport, {})).toBe('delivered')
  expect(transport.close).toHaveBeenCalled()
})
