import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('site favicon', () => {
  it('publishes the supplied Otimiza SVG and references it from the document head', () => {
    const root = process.cwd()
    const html = readFileSync(resolve(root, 'index.html'), 'utf8')
    const sourceFavicon = readFileSync(resolve(root, 'imagens/favicon otimiza.svg'))
    const publicFavicon = readFileSync(resolve(root, 'public/favicon.svg'))

    expect(html).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />')
    expect(publicFavicon.equals(sourceFavicon)).toBe(true)
  })
})
