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

  it('uses the Otimiza red for accents and destructive actions', () => {
    expect(ruleFor('.memorial-eyebrow')).toContain('color: #e02020')
    expect(ruleFor('.memorial-divider')).toContain('background: #e02020')
    expect(ruleFor('.memorial-danger')).toContain('background: #e02020')
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

  it('uses the larger minimal form treatment found across the Otimiza site', () => {
    expect(ruleFor('.memorial-contribution'))
      .toContain('width: min(100% - 2rem, 48rem)')
    expect(ruleFor('.memorial-form-card')).toContain('border: 0')
    expect(ruleFor('.memorial-form-card')).toContain('box-shadow: none')
    expect(ruleFor('.memorial-form-card input[type="email"],\n.memorial-form-card textarea'))
      .toContain('border-bottom: 1px solid rgb(90 101 114 / 28%)')
    expect(ruleFor('.memorial-form-card input[type="email"],\n.memorial-form-card textarea'))
      .toContain('background: transparent')
    expect(ruleFor('.memorial-form-card > button[type="submit"]'))
      .toContain('background: #5a6572')
    expect(ruleFor('.memorial-form-card > button[type="submit"]'))
      .toContain('width: auto')
  })

  it('reveals a fixed full-size video through a Motto-style animated mask', () => {
    expect(ruleFor('.memorial-video-section')).toContain('height: 300svh')
    expect(ruleFor('.memorial-video-frame')).toContain(
      'var(--memorial-video-expand-progress) * 52%',
    )
    expect(ruleFor('.memorial-video-frame')).toContain(
      'top: calc(\n    64%\n    - (var(--memorial-video-expand-progress) * 52%)\n  )',
    )
    expect(ruleFor('.memorial-video-frame')).toContain(
      'width: calc(100vw - 3rem)',
    )
    expect(ruleFor('.memorial-video-frame')).toContain(
      'height: min(62vw, 37.5rem)',
    )
    expect(ruleFor('.memorial-video-frame')).toContain(
      'clip-path: inset(',
    )
    expect(ruleFor('.memorial-video-frame')).toContain(
      'var(--memorial-video-contract-progress) * 59%',
    )
    expect(ruleFor('.memorial-video-frame video')).toContain(
      'var(--memorial-video-contract-progress) * 33%',
    )
    expect(ruleFor('.memorial-video-frame video')).toContain(
      'var(--memorial-video-contract-progress) * -30%',
    )
    expect(ruleFor('.memorial-contribution')).toContain('margin: -35svh auto 5rem')
    expect(ruleFor('.memorial-video-frame')).not.toContain(
      'var(--memorial-video-expand-progress) * (100vw - 29rem)',
    )
  })

  it('preserves the original 16:9 video format on mobile', () => {
    expect(ruleFor('.memorial-video-frame')).toContain('aspect-ratio: 16 / 9')
    expect(ruleFor('.memorial-video-frame')).not.toContain('height: 17rem')
    expect(ruleFor('.memorial-video-frame')).toContain(
      'var(--memorial-video-contract-progress) * 30%',
    )
    expect(ruleFor('.memorial-video-frame')).not.toContain(
      'var(--memorial-video-contract-progress) * 24%',
    )
  })

  it('keeps the floating dust soft and non-interactive', () => {
    expect(ruleFor('.memorial-dust-layer')).toContain('pointer-events: none')
    expect(ruleFor('.memorial-dust-layer')).toContain('opacity: 1')
    expect(ruleFor('.memorial-dust-layer')).not.toMatch(/glow|filter|drop-shadow/i)
  })
})
