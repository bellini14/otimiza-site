import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GradientBlinds from './GradientBlinds'

vi.mock('ogl', () => ({
  Renderer: class {
    constructor() {
      this.dpr = 1
      this.gl = {
        canvas: document.createElement('canvas'),
        drawingBufferWidth: 1080,
        drawingBufferHeight: 1080,
      }
    }

    setSize(width, height) {
      this.gl.drawingBufferWidth = width || 1080
      this.gl.drawingBufferHeight = height || 1080
    }

    render() {}

    destroy() {}
  },
  Program: class {},
  Mesh: class {},
  Triangle: class {},
}))

class ResizeObserverMock {
  observe() {}

  disconnect() {}
}

describe('GradientBlinds', () => {
  beforeEach(() => {
    globalThis.ResizeObserver = ResizeObserverMock
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1)
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('registers pointer tracking on window so overlayed hero content does not block it', () => {
    const windowAddEventListener = vi.spyOn(window, 'addEventListener')

    render(
      <div style={{ width: '1080px', height: '1080px', position: 'relative' }}>
        <GradientBlinds className="test-gradient-blinds" />
      </div>,
    )

    expect(windowAddEventListener).toHaveBeenCalledWith('pointermove', expect.any(Function))
  })
})
