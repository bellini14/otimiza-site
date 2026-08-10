import { describe, expect, it } from 'vitest'
import { createFailureLimiter, parseMemorialBody } from './memorialRequest.js'

describe('memorial request safety', () => {
  it('rejects malformed and oversized JSON safely', () => {
    expect(() => parseMemorialBody({ body: '{bad' })).toThrowError(
      expect.objectContaining({ status: 400 }),
    )
    expect(() => parseMemorialBody({
      body: { message: 'x'.repeat(3000) },
    })).toThrowError(expect.objectContaining({ status: 413 }))
  })

  it('limits repeated failures without retaining the supplied identity', () => {
    const limiter = createFailureLimiter({ maxFailures: 2, windowMs: 1000, now: () => 10 })
    limiter.recordFailure('opaque-key')
    limiter.recordFailure('opaque-key')
    expect(() => limiter.assertAllowed('opaque-key')).toThrowError(
      expect.objectContaining({ status: 429 }),
    )
  })
})
