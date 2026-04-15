import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const rendererSetSize = vi.fn()
const rendererRender = vi.fn()
const programMock = { uniforms: { iResolution: { value: { r: 0, g: 0, b: 0 } }, uMouse: { value: [0.5, 0.5] }, iTime: { value: 0 } } }
const loseContext = vi.fn()

vi.mock('ogl', () => ({
  Renderer: vi.fn(class Renderer {
    constructor(options) {
      const canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 150
      this.options = options
      this.gl = {
        canvas,
        clearColor: vi.fn(),
        enable: vi.fn(),
        blendFunc: vi.fn(),
        getExtension: vi.fn(() => ({ loseContext })),
        BLEND: 'BLEND',
        SRC_ALPHA: 'SRC_ALPHA',
        ONE_MINUS_SRC_ALPHA: 'ONE_MINUS_SRC_ALPHA',
      }
      this.setSize = rendererSetSize
      this.render = rendererRender
    }
  }),
  Program: vi.fn(class Program {
    constructor(_gl, config) {
      programMock.uniforms = config.uniforms
      return programMock
    }
  }),
  Mesh: vi.fn(class Mesh {}),
  Triangle: vi.fn(class Triangle {}),
  Color: vi.fn(class Color {
    constructor(...values) {
      this.values = values
      this.r = values[0]
      this.g = values[1]
      this.b = values[2]
    }
  }),
}))

import Threads from './Threads'

beforeEach(() => {
  Object.defineProperty(window, 'devicePixelRatio', {
    configurable: true,
    value: 2,
  })
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get() {
      return 1080
    },
  })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get() {
      return 1080
    },
  })
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe('Threads', () => {
  it('renders using device pixel ratio so the canvas stays sharp', async () => {
    const { unmount } = render(
      <div style={{ width: '1080px', height: '1080px' }}>
        <Threads color={[0, 0, 0]} amplitude={1} distance={0} enableMouseInteraction />
      </div>,
    )

    unmount()

    const { Renderer } = await import('ogl')
    expect(Renderer).toHaveBeenCalledWith(expect.objectContaining({ alpha: true, dpr: 2 }))
    expect(rendererSetSize).toHaveBeenCalledWith(1080, 1080)
  })
})
