import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SmoothScroll from './SmoothScroll'

const lenisMock = vi.hoisted(() => {
  const destroy = vi.fn()
  const raf = vi.fn()
  const Lenis = vi.fn(function MockLenis() {
    return {
      destroy,
      raf,
    }
  })

  return { Lenis, destroy, raf }
})

vi.mock('lenis', () => ({
  default: lenisMock.Lenis,
}))

describe('SmoothScroll', () => {
  let animationFrame = 0

  beforeEach(() => {
    lenisMock.Lenis.mockClear()
    lenisMock.destroy.mockClear()
    lenisMock.raf.mockClear()
    animationFrame = 0

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      animationFrame += 1
      if (animationFrame === 1) {
        callback(16)
      }
      return animationFrame
    })

    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts and cleans up inertial page scrolling', async () => {
    const { default: Lenis } = await import('lenis')
    const { unmount } = render(<SmoothScroll />)

    await waitFor(() => {
      expect(Lenis).toHaveBeenCalledWith(
        expect.objectContaining({
          lerp: 0.08,
          smoothWheel: true,
        }),
      )
    })

    expect(lenisMock.raf).toHaveBeenCalledWith(16)

    unmount()

    expect(window.cancelAnimationFrame).toHaveBeenCalled()
    expect(lenisMock.destroy).toHaveBeenCalled()
  })
})
