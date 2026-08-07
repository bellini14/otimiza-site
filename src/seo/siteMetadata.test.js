import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildCanonicalUrl, getPageDescription, getPageTitle, staticPageMetadata } from './siteMetadata'

const expectedRoutes = [
  '/',
  '/quem-somos',
  '/nossa-abordagem',
  '/o-que-fazemos',
  '/cases',
  '/tecnologia',
  '/academia-otimiza',
  '/contato',
  '/politica-de-privacidade',
  '/inspire',
  '/inspire/newsletter',
]

describe('SEO title catalog', () => {
  it('uses the strategic consulting positioning on the home page', () => {
    expect(staticPageMetadata['/']).toEqual({
      title: 'Consultoria Estratégica em Negócios e Execução | Otimiza',
      description: 'A Otimiza transforma estratégia em resultados, conectando visão de negócio, gestão e execução para impulsionar crescimento sustentável.',
    })
  })

  it('defines a unique, descriptive title for every static public route', () => {
    expect(Object.keys(staticPageMetadata).sort()).toEqual(expectedRoutes.sort())

    const titles = Object.values(staticPageMetadata).map(({ title }) => title)

    expect(new Set(titles).size).toBe(titles.length)
    titles.forEach((title) => {
      expect(title.length).toBeGreaterThanOrEqual(20)
      expect(title.length).toBeLessThanOrEqual(65)
      expect(title).toMatch(/Otimiza/)
    })
  })

  it('derives a branded title from real dynamic-page content', () => {
    expect(getPageTitle('Otimização de processos produtivos')).toBe(
      'Otimização de processos produtivos | Otimiza',
    )
  })

  it('defines a unique search description of an appropriate length for every static route', () => {
    const descriptions = Object.values(staticPageMetadata).map(({ description }) => description)

    expect(new Set(descriptions).size).toBe(expectedRoutes.length)
    descriptions.forEach((description) => {
      expect(description.length).toBeGreaterThanOrEqual(110)
      expect(description.length).toBeLessThanOrEqual(165)
    })
  })

  it('falls back to a useful branded title when dynamic content is unavailable', () => {
    expect(getPageTitle()).toBe('Conteúdo não encontrado | Otimiza')
  })

  it('normalizes a dynamic description without cutting a word', () => {
    const source = `${'Melhoria de processos e gestão empresarial. '.repeat(6)}Resultado final.`
    const description = getPageDescription(source)

    expect(description.length).toBeLessThanOrEqual(160)
    expect(description).not.toMatch(/\s…$/)
    expect(description).toMatch(/…$/)
  })

  it('provides a factual fallback for unavailable dynamic content', () => {
    expect(getPageDescription()).toBe('O conteúdo solicitado não foi encontrado no site da Otimiza.')
  })

  it('builds normalized absolute HTTPS canonical URLs', () => {
    expect(buildCanonicalUrl('/quem-somos/', 'http://www.otimiza.test/')).toBe(
      'https://www.otimiza.test/quem-somos',
    )
    expect(buildCanonicalUrl('/', 'https://www.otimiza.test')).toBe('https://www.otimiza.test/')
  })

  it('removes query strings and hashes from canonical paths', () => {
    expect(buildCanonicalUrl('/inspire?q=gestao#resultados', 'https://www.otimiza.test')).toBe(
      'https://www.otimiza.test/inspire',
    )
  })

  it('uses the home-page title in the static HTML fallback', () => {
    const html = fs.readFileSync('index.html', 'utf8')

    expect(html).toContain(`<title>${staticPageMetadata['/'].title}</title>`)
    expect(html).toContain(`<meta name="description" content="${staticPageMetadata['/'].description}" />`)
  })
})
