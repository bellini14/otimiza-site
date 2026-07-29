import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve(globalThis.process.cwd(), 'src/components/memorial/MemorialDust.jsx'),
  'utf8',
)
const pageSource = readFileSync(
  resolve(globalThis.process.cwd(), 'src/pages/SilvanaMemorial.jsx'),
  'utf8',
)

describe('MemorialDust shader', () => {
  it('renders soft light particles without cross-shaped rays', () => {
    expect(source).not.toContain('uv.x * uv.y')
    expect(source).not.toContain('float rays')
    expect(source).toContain('vec3 particleColor = vec3(0.78, 0.81, 0.84);')
    expect(source).toContain('gl_FragColor = vec4(particleColor, alpha * 0.5);')
  })

  it('uses a restrained density and varied opacity per particle', () => {
    expect(pageSource).toContain('density={0.8}')
    expect(source).toContain(
      'float opacityVariation = mix(0.3, 1.0, Hash21(si + 7.13));',
    )
    expect(source).toContain('col += star * size * opacityVariation * base;')
  })
})
