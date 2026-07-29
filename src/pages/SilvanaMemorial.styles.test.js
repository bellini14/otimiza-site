import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  resolve(globalThis.process.cwd(), 'src/pages/SilvanaMemorial.css'),
  'utf8',
).replaceAll('\r\n', '\n')

function ruleFor(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return Array.from(css.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`, 'g')))
    .map((match) => match[1])
    .join('\n')
}

describe('Silvana memorial Otimiza identity', () => {
  it('uses Elza without importing an unrelated type system', () => {
    expect(ruleFor('.silvana-memorial')).toContain('font-family: "elza", sans-serif')
    expect(css).not.toMatch(/@import\s+url/i)
    expect(css).not.toMatch(/Fraunces|Work Sans/i)
  })

  it('maps the Otimiza slate palette to headings and body copy', () => {
    expect(ruleFor('.memorial-hero h1')).toContain('color: #39424c')
    expect(ruleFor('.memorial-subtitle')).toContain('color: #5a6572')
    expect(ruleFor('.memorial-form-card')).toContain('color: #5a6572')
  })

  it('uses the Otimiza red for accents and primary actions', () => {
    expect(ruleFor('.memorial-eyebrow')).toContain('color: #e02020')
    expect(ruleFor('.memorial-divider')).toContain('background: #e02020')
    expect(ruleFor('.memorial-form-card > button[type="submit"],\n.memorial-danger'))
      .toContain('background: #e02020')
  })

  it('uses the Otimiza light surfaces throughout the page', () => {
    expect(ruleFor('.silvana-memorial')).toContain('#EFEFF4')
    expect(ruleFor('.memorial-video-frame')).toContain('background: #E5E9F1')
    expect(ruleFor('.memorial-form-card')).toContain('background: #ffffff')
  })
})
