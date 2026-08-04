import { describe, expect, it } from 'vitest'
import { getIndexableRoutes, renderRobotsTxt, renderSitemapXml } from './generate-sitemap.mjs'

describe('sitemap generation', () => {
  it('renders unique canonical HTTPS URLs as valid sitemap entries', () => {
    const xml = renderSitemapXml(
      ['/', '/quem-somos', '/cases/banco-moneo', '/quem-somos'],
      'https://www.otimiza.test',
    )

    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/)
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(xml).toContain('<loc>https://www.otimiza.test/</loc>')
    expect(xml).toContain('<loc>https://www.otimiza.test/cases/banco-moneo</loc>')
    expect(xml.match(/<loc>https:\/\/www\.otimiza\.test\/quem-somos<\/loc>/g)).toHaveLength(1)
    const locations = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])
    expect(locations.every((location) => location.startsWith('https://'))).toBe(true)
    expect(locations.some((location) => /localhost|admin/.test(location))).toBe(false)
  })

  it('declares the absolute HTTPS sitemap URL in robots.txt', () => {
    const robots = renderRobotsTxt('https://www.otimiza.test')

    expect(robots).toContain('User-agent: *')
    expect(robots).toContain('Allow: /')
    expect(robots).toContain('Sitemap: https://www.otimiza.test/sitemap.xml')
  })

  it('keeps the memorial out of the generated sitemap XML', () => {
    const routes = getIndexableRoutes()
    const xml = renderSitemapXml(routes, 'https://otimiza-site.vercel.app')
    expect(routes).not.toContain('/silvana-bettiol')
    expect(xml).not.toContain('silvana-bettiol')
  })
})
