import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MemorialDust from './MemorialDust'

const oglState = vi.hoisted(() => ({
  rendererCount: 0,
  rendererOptions: [],
  render: vi.fn(),
  setSize: vi.fn(),
  loseContext: vi.fn(),
  throwRenderer: false,
}))

vi.mock('ogl', () => {
  class Renderer {
    constructor(options) {
      if (oglState.throwRenderer) throw new Error('WebGL unavailable')
      oglState.rendererCount += 1
      oglState.rendererOptions.push(options)
      this.gl = {
        canvas: document.createElement('canvas'),
        enable: vi.fn(),
        blendFunc: vi.fn(),
        clearColor: vi.fn(),
        getExtension: vi.fn(() => ({ loseContext: oglState.loseContext })),
        SRC_ALPHA: 1,
        ONE_MINUS_SRC_ALPHA: 2,
      }
    }

    setSize(width, height) {
      oglState.setSize(width, height)
      this.gl.canvas.width = width
      this.gl.canvas.height = height
    }

    render(payload) { oglState.render(payload) }
  }

  class Program {
    constructor(_gl, options) { this.uniforms = options.uniforms }
  }

  return {
    Renderer,
    Program,
    Mesh: class Mesh {},
    Color: class Color {
      constructor(...values) { this.values = values }
    },
    Triangle: class Triangle {},
  }
})

let resizeCallback
let resizeDisconnect
let frameCallback

describe('MemorialDust', () => {
  beforeEach(() => {
    oglState.rendererCount = 0
    oglState.rendererOptions = []
    oglState.render.mockClear()
    oglState.setSize.mockClear()
    oglState.loseContext.mockClear()
    oglState.throwRenderer = false
    resizeDisconnect = vi.fn()
    globalThis.ResizeObserver = class {
      constructor(callback) { resizeCallback = callback }
      observe() {}
      disconnect() { resizeDisconnect() }
    }
    window.matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    vi.stubGlobal('WebGLRenderingContext', class WebGLRenderingContext {})
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback) => {
      frameCallback = callback
      return 7
    }))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders the Galaxy canvas and listens for mouse parallax', () => {
    const mouseListener = vi.spyOn(window, 'addEventListener')
    const { container } = render(<MemorialDust transparent />)

    expect(container.querySelector('.galaxy-container canvas')).toBeInTheDocument()
    expect(mouseListener).toHaveBeenCalledWith('mousemove', expect.any(Function))
  })

  it('keeps default vectors stable across unrelated rerenders', () => {
    const { rerender } = render(<MemorialDust density={0.8} transparent />)
    rerender(<MemorialDust density={0.8} transparent />)

    expect(oglState.rendererCount).toBe(1)
  })

  it('caps device pixel ratio and responds to observed size changes', () => {
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 3 })
    render(<MemorialDust transparent />)

    expect(oglState.rendererOptions[0]).toEqual(expect.objectContaining({ dpr: 1.75 }))
    oglState.setSize.mockClear()
    resizeCallback()
    expect(oglState.setSize).toHaveBeenCalledTimes(1)
  })

  it('pauses while hidden and resumes with only one frame loop', () => {
    render(<MemorialDust transparent />)
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1)

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    })
    fireEvent(document, new Event('visibilitychange'))
    expect(cancelAnimationFrame).toHaveBeenCalledWith(7)

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })
    fireEvent(document, new Event('visibilitychange'))
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2)

    frameCallback(100)
    expect(requestAnimationFrame).toHaveBeenCalledTimes(3)
  })

  it('renders one static frame without a loop for reduced motion', () => {
    window.matchMedia = vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    render(<MemorialDust transparent />)

    expect(oglState.render).toHaveBeenCalledTimes(1)
    expect(requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('removes the canvas after WebGL context loss', () => {
    const { container } = render(<MemorialDust transparent />)
    const canvas = container.querySelector('canvas')
    fireEvent(canvas, new Event('webglcontextlost', { cancelable: true }))

    expect(container.querySelector('canvas')).toBeNull()
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })

  it('falls back cleanly when renderer creation fails', () => {
    oglState.throwRenderer = true
    const { container } = render(<MemorialDust transparent />)

    expect(container.querySelector('.galaxy-container')).toBeInTheDocument()
    expect(container.querySelector('canvas')).toBeNull()
    expect(requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('cleans observers, frames and the WebGL context on unmount', () => {
    const { unmount } = render(<MemorialDust transparent />)
    unmount()

    expect(resizeDisconnect).toHaveBeenCalled()
    expect(cancelAnimationFrame).toHaveBeenCalled()
    expect(oglState.loseContext).toHaveBeenCalled()
  })
})
