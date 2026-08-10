import { describe, expect, it } from 'vitest'

import { pageTitleMotion } from './pageTitleMotion'

describe('pageTitleMotion', () => {
  it('matches the canonical Quem Somos title animation', () => {
    expect(pageTitleMotion).toEqual({
      delay: 100,
      duration: 0.6,
      ease: 'power3.out',
      splitType: 'chars',
      from: { opacity: 0, y: 40 },
      to: { opacity: 1, y: 0 },
      threshold: 0.1,
      rootMargin: '-100px',
    })
  })
})
