import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDragCarousel } from './useDragCarousel'

function CarouselHarness({ touchMode, geometryKey = 'initial' }) {
  const {
    shellRef,
    trackRef,
    translateX,
    trackHandlers,
  } = useDragCarousel({ touchMode, geometryKey })

  return (
    <div ref={shellRef} data-testid="drag-shell">
      <div
        ref={trackRef}
        data-testid="drag-track"
        style={{ transform: `translateX(${translateX}px)` }}
        {...trackHandlers}
      />
    </div>
  )
}

function setCarouselDimensions(shell, track, { shellWidth, trackWidth }) {
  Object.defineProperties(shell, {
    clientWidth: { configurable: true, value: shellWidth },
  })
  Object.defineProperties(track, {
    scrollWidth: { configurable: true, value: trackWidth },
  })
}

describe('useDragCarousel', () => {
  let animationFrames
  let nextAnimationFrameId

  beforeEach(() => {
    animationFrames = new Map()
    nextAnimationFrameId = 1
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      const frameId = nextAnimationFrameId
      nextAnimationFrameId += 1
      animationFrames.set(frameId, callback)
      return frameId
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((frameId) => {
      animationFrames.delete(frameId)
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  function flushAnimationFrame() {
    const pendingFrames = Array.from(animationFrames.entries())
    animationFrames.clear()
    act(() => {
      pendingFrames.forEach(([, callback]) => callback(performance.now()))
    })
  }

  it('keeps Inspire touch movement scaled by the total carousel distance by default', () => {
    render(<CarouselHarness />)
    const shell = screen.getByTestId('drag-shell')
    const track = screen.getByTestId('drag-track')
    setCarouselDimensions(shell, track, { shellWidth: 600, trackWidth: 900 })

    fireEvent.pointerDown(track, {
      pointerId: 1,
      pointerType: 'touch',
      clientX: 300,
      clientY: 100,
    })
    fireEvent.pointerMove(track, {
      pointerId: 1,
      pointerType: 'touch',
      clientX: 200,
      clientY: 100,
    })

    expect(track).toHaveStyle({ transform: 'translateX(-12.5px)' })
  })

  it('supports the direct touch response and pointer capture used by the desktop Cases carousel', () => {
    render(<CarouselHarness touchMode="direct" />)
    const shell = screen.getByTestId('drag-shell')
    const track = screen.getByTestId('drag-track')
    const setPointerCapture = vi.fn()
    const releasePointerCapture = vi.fn()
    track.setPointerCapture = setPointerCapture
    track.releasePointerCapture = releasePointerCapture
    setCarouselDimensions(shell, track, { shellWidth: 600, trackWidth: 900 })

    fireEvent.pointerDown(track, {
      pointerId: 2,
      pointerType: 'touch',
      clientX: 300,
      clientY: 100,
    })
    fireEvent.pointerMove(track, {
      pointerId: 2,
      pointerType: 'touch',
      clientX: 200,
      clientY: 100,
    })

    expect(track).toHaveStyle({ transform: 'translateX(-96px)' })
    expect(setPointerCapture).toHaveBeenCalledWith(2)

    fireEvent.pointerUp(track, { pointerId: 2, pointerType: 'touch' })
    expect(releasePointerCapture).toHaveBeenCalledWith(2)
  })

  it('uses the legacy non-snapping release velocity for direct touch', () => {
    render(<CarouselHarness touchMode="direct" />)
    const shell = screen.getByTestId('drag-shell')
    const track = screen.getByTestId('drag-track')
    setCarouselDimensions(shell, track, { shellWidth: 600, trackWidth: 900 })
    flushAnimationFrame()

    fireEvent.pointerDown(track, {
      pointerId: 4,
      pointerType: 'touch',
      clientX: 300,
      clientY: 100,
    })
    fireEvent.pointerMove(track, {
      pointerId: 4,
      pointerType: 'touch',
      clientX: 250,
      clientY: 100,
    })
    fireEvent.pointerMove(track, {
      pointerId: 4,
      pointerType: 'touch',
      clientX: 200,
      clientY: 100,
    })
    fireEvent.pointerUp(track, { pointerId: 4, pointerType: 'touch' })
    flushAnimationFrame()

    expect(track).toHaveStyle({ transform: 'translateX(-105px)' })
  })

  it('cancels motion and clamps translation after responsive geometry changes', () => {
    const { rerender } = render(<CarouselHarness geometryKey="600" />)
    const shell = screen.getByTestId('drag-shell')
    const track = screen.getByTestId('drag-track')
    setCarouselDimensions(shell, track, { shellWidth: 600, trackWidth: 900 })
    flushAnimationFrame()

    fireEvent.pointerDown(track, { pointerId: 3, clientX: 300, clientY: 100 })
    fireEvent.pointerMove(track, { pointerId: 3, clientX: 50, clientY: 100 })
    fireEvent.pointerUp(track, { pointerId: 3 })
    expect(track.style.transform).not.toBe('translateX(-100px)')

    setCarouselDimensions(shell, track, { shellWidth: 600, trackWidth: 700 })
    rerender(<CarouselHarness geometryKey="620" />)
    flushAnimationFrame()

    expect(window.cancelAnimationFrame).toHaveBeenCalled()
    expect(track).toHaveStyle({ transform: 'translateX(-100px)' })
  })

  it('cancels a pending geometry clamp when a new drag starts', () => {
    const { rerender } = render(<CarouselHarness geometryKey="600" />)
    const shell = screen.getByTestId('drag-shell')
    const track = screen.getByTestId('drag-track')
    setCarouselDimensions(shell, track, { shellWidth: 600, trackWidth: 900 })
    flushAnimationFrame()

    fireEvent.pointerDown(track, { pointerId: 5, clientX: 300, clientY: 100 })
    fireEvent.pointerMove(track, { pointerId: 5, clientX: 50, clientY: 100 })
    fireEvent.pointerUp(track, { pointerId: 5 })

    setCarouselDimensions(shell, track, { shellWidth: 600, trackWidth: 700 })
    rerender(<CarouselHarness geometryKey="620" />)
    fireEvent.pointerDown(track, { pointerId: 6, clientX: 300, clientY: 100 })
    fireEvent.pointerMove(track, { pointerId: 6, clientX: 290, clientY: 100 })
    const activeDragTransform = track.style.transform
    flushAnimationFrame()

    expect(activeDragTransform).not.toBe('translateX(-100px)')
    expect(track.style.transform).toBe(activeDragTransform)
  })
})
