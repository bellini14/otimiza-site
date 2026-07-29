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

  it('keeps the page background neutral without a red radial glow', () => {
    expect(ruleFor('.silvana-memorial')).not.toContain(
      'radial-gradient(circle at 82% 10%, rgb(224 32 32 / 7%)',
    )
  })

  it('gives the hero copy comfortable vertical breathing room', () => {
    expect(ruleFor('.memorial-eyebrow')).toContain('margin: 0 0 1.8rem')
    expect(ruleFor('.memorial-hero h1')).toContain('line-height: .96')
    expect(ruleFor('.memorial-subtitle')).toContain('margin: 2rem auto 0')
  })

  it('animates the video from small to full width and back to small', () => {
    expect(ruleFor('.memorial-video-frame')).toContain(
      'top: calc(64% - (var(--memorial-video-progress) * 52%))',
    )
    expect(ruleFor('.memorial-video-frame')).toContain(
      'var(--memorial-video-expand-progress) * (100vw - 29rem)',
    )
    expect(ruleFor('.memorial-video-frame')).toContain(
      'var(--memorial-video-contract-progress) * (100vw - 29rem)',
    )
    expect(ruleFor('.memorial-video-frame')).toContain(
      'var(--memorial-video-contract-progress) * 21.25rem',
    )
    expect(css).toContain('var(--memorial-video-contract-progress) * 4rem')
  })

  it('keeps the floating dust soft and non-interactive', () => {
    expect(ruleFor('.memorial-dust-layer')).toContain('pointer-events: none')
    expect(ruleFor('.memorial-dust-layer')).toContain('opacity: 1')
    expect(ruleFor('.memorial-dust-layer')).not.toMatch(/glow|filter|drop-shadow/i)
  })
})
