import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const indexCss = fs.readFileSync(path.resolve('src/index.css'), 'utf8')
const postDetailSource = fs.readFileSync(path.resolve('src/pages/PostDetail.jsx'), 'utf8')

describe('Inspire theme text color', () => {
  it('uses a single shared ink color across Inspire text rules', () => {
    const inspireSection = indexCss.match(/Inspire Editorial Shell[\s\S]*?@keyframes inspire-spin/)

    expect(inspireSection).not.toBeNull()
    expect(indexCss).toMatch(/--inspire-text:\s*#5a6572;/i)
    expect(inspireSection[0]).not.toMatch(/(?:^|\n)\s*color:\s*#(?!5a6572\b)[0-9a-f]{3,8}/im)
    expect(inspireSection[0]).not.toMatch(/(?:^|\n)\s*color:\s*rgb\(/i)
  })

  it('does not hardcode alternate text colors in the Inspire post detail view', () => {
    expect(postDetailSource).not.toMatch(/text-white|text-brand-red|text-slate-\d+/)
    expect(postDetailSource).not.toMatch(/text-\[#(?!5A6572\])/i)
  })

  it('contains the feed and article thumbnails inside the available width', () => {
    expect(indexCss).toMatch(/\.inspire-page__feed\s*\{[^}]*min-width:\s*0;[^}]*max-width:\s*100%;/s)
    expect(indexCss).toMatch(/\.inspire-story__thumb-link\s*\{[^}]*min-width:\s*0;[^}]*max-width:\s*100%;/s)
  })

  it('lays out the mobile filters in two rows without widening the page', () => {
    const inspireStart = indexCss.indexOf('Inspire Editorial Shell')
    const mobileStart = indexCss.indexOf('@media (max-width: 720px)', inspireStart)
    const mobileEnd = indexCss.indexOf('@keyframes inspire-spin', mobileStart)
    const mobileCss = indexCss.slice(mobileStart, mobileEnd)
    const compactStart = mobileCss.indexOf('@media (max-width: 380px)')
    const compactCss = mobileCss.slice(compactStart)

    expect(mobileCss).toMatch(/\.inspire-page__grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/s)
    expect(mobileCss).toMatch(/\.inspire-page__tabs\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1\.25fr\)\s+minmax\(0,\s*1fr\);[^}]*overflow-x:\s*visible;/s)
    expect(mobileCss).toMatch(/\.inspire-page__tab\s*\{[^}]*font-size:\s*0\.9rem;[^}]*white-space:\s*nowrap;/s)
    expect(compactStart).toBeGreaterThan(-1)
    expect(compactCss).toMatch(/\.inspire-page__tabs\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/s)
    expect(mobileCss).toMatch(/\.inspire-story\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+5\.75rem;[^}]*gap:\s*0\.75rem;/s)
  })

  it('highlights article category labels with a yellow strip', () => {
    expect(indexCss).toMatch(/\.inspire-category-label\s*\{[^}]*width:\s*fit-content;[^}]*padding:[^;]+;[^}]*background:\s*#fff176;[^}]*font-size:\s*0\.92rem;[^}]*font-weight:\s*400;[^}]*letter-spacing:\s*normal;[^}]*text-transform:\s*none;/s)
  })
})
