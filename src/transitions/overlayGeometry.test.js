import { describe, expect, it } from 'vitest'

import { getRevealMaskFrame, getSweepFrame } from './overlayGeometry'

describe('overlayGeometry', () => {
  it('positions the sweep plane so it actually crosses the viewport from the click origin', () => {
    const viewport = { width: 1440, height: 900 }
    const origin = { x: 120, y: 240 }

    const coverFrame = getSweepFrame('cover', false, origin, viewport)

    expect(coverFrame.width).toBeGreaterThan(viewport.width)
    expect(coverFrame.height).toBeGreaterThan(viewport.height / 2)
    expect(coverFrame.x).toBeLessThan(0)
    expect(coverFrame.y).toBeLessThan(origin.y)
  })

  it('centers the reveal mask on the captured origin instead of treating the origin as the icon top-left', () => {
    const viewport = { width: 1440, height: 900 }
    const origin = { x: 120, y: 240 }

    const maskFrame = getRevealMaskFrame('reveal', origin, viewport)

    expect(maskFrame.width).toBeGreaterThan(0)
    expect(maskFrame.height).toBeGreaterThan(0)
    expect(maskFrame.x).toBeLessThan(origin.x)
    expect(maskFrame.y).toBeLessThan(origin.y)
  })
})
