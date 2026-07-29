import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MemorialDust from './MemorialDust'

vi.mock('ogl', () => {
  class Renderer {
    constructor() {
      this.gl = {
        canvas: document.createElement('canvas'),
        enable: vi.fn(),
        blendFunc: vi.fn(),
        clearColor: vi.fn(),
        getExtension: vi.fn(),
        SRC_ALPHA: 1,
        ONE_MINUS_SRC_ALPHA: 2,
        canvasWidth: 0,
      }
    }

    setSize(width, height) {
      this.gl.canvas.width = width
      this.gl.canvas.height = height
    }

    render() {}
  }

  class Program {
    constructor(_gl, options) {
      this.uniforms = options.uniforms
    }
  }

  return {
    Renderer,
    Program,
    Mesh: class Mesh {},
    Color: class Color {
      constructor(...values) {
        this.values = values
      }
    },
    Triangle: class Triangle {},
  }
})

describe('MemorialDust', () => {
  beforeEach(() => {
    vi.stubGlobal('WebGLRenderingContext', class WebGLRenderingContext {})
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders the Galaxy canvas and listens for mouse parallax', () => {
    const mouseListener = vi.spyOn(window, 'addEventListener')
    const { container } = render(
      <MemorialDust
        starSpeed={0}
        density={1.4}
        hueShift={140}
        speed={0.4}
        glowIntensity={0.05}
        saturation={1}
        mouseRepulsion={false}
        repulsionStrength={0}
        twinkleIntensity={0.9}
        rotationSpeed={0}
        transparent
      />,
    )

    expect(container.querySelector('.galaxy-container canvas')).toBeInTheDocument()
    expect(mouseListener).toHaveBeenCalledWith('mousemove', expect.any(Function))
  })
})
