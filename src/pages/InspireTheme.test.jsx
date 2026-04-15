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
})
