import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MemorialDust from './MemorialDust'

describe('MemorialDust', () => {
  it('renders particles large enough to remain visible on a light background', () => {
    const { container } = render(<MemorialDust density={1.4} />)
    const particles = Array.from(container.querySelectorAll('.memorial-dust-particle'))
    const sizes = particles.map((particle) => (
      Number.parseFloat(particle.style.getPropertyValue('--dust-size'))
    ))

    expect(particles).toHaveLength(78)
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(1.4)
    expect(Math.max(...sizes)).toBeGreaterThan(4)
  })
})
