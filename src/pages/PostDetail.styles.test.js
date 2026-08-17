import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')

function ruleFor(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return Array.from(css.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`, 'g')))
    .map((match) => match[1])
    .join('\n')
}

describe('post detail mobile action styles', () => {
  it('keeps the like count inside the mobile action control bounds', () => {
    const likeGroupRule = ruleFor('.post-detail__hero-like')
    const countRule = ruleFor('.post-detail__hero-like .post-like-button__count')

    expect(likeGroupRule).toContain('position: relative')
    expect(countRule).toContain('position: absolute')
    expect(countRule).toContain('right: 0.7rem')
  })

  it('keeps each related post card on a white surface', () => {
    const postCardRule = ruleFor('.related-content-rail__post')

    expect(postCardRule).toContain('background: #fff')
  })
})
