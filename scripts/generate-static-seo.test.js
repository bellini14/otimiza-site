import { describe, expect, it } from 'vitest'
import { getStaticRouteWordCount, renderStaticRouteHtml } from './generate-static-seo.mjs'

const baseHtml = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta name="description" content="Descrição padrão" />
    <title>Título padrão</title>
  </head>
  <body><div id="root"></div><script src="/assets/app.js"></script></body>
</html>`

describe('static SEO route generation', () => {
  it('places exactly one page-specific H1 in the raw HTML response', () => {
    const html = renderStaticRouteHtml(baseHtml, {
      title: 'Quem somos | Otimiza',
      description: 'Conheça a Otimiza.',
      h1: 'Quem somos',
      canonicalUrl: 'https://www.otimiza.test/quem-somos',
      imageUrl: 'https://www.otimiza.test/assets/social.jpg',
      structuredData: { '@context': 'https://schema.org', '@graph': [] },
      links: [
        { href: '/nossa-abordagem', label: 'Conheça nossa abordagem' },
        { href: '/contato', label: 'Fale com a Otimiza' },
      ],
      sections: [
        {
          heading: 'Como atuamos',
          children: ['Consultoria', 'Tecnologia', 'Academia'],
        },
      ],
    })

    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('<h1>Quem somos</h1>')
    expect(html).not.toContain('<div id="root"></div>')
    expect(html).toContain('<main data-seo-fallback="true" style="display:none">')
    expect(html).toContain('<link rel="canonical" href="https://www.otimiza.test/quem-somos" />')
    expect(html.match(/<meta property="og:/g)).toHaveLength(6)
    expect(html).toContain('<meta property="og:title" content="Quem somos | Otimiza" />')
    expect(html).toContain('<meta property="og:url" content="https://www.otimiza.test/quem-somos" />')
    expect(html).toContain('<meta property="og:image" content="https://www.otimiza.test/assets/social.jpg" />')
    expect(html.match(/<meta name="twitter:/g)).toHaveLength(4)
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />')
    expect(html).toContain('<meta name="twitter:title" content="Quem somos | Otimiza" />')
    expect(html).toContain('<meta name="twitter:image" content="https://www.otimiza.test/assets/social.jpg" />')
    const jsonLdMatch = html.match(/<script type="application\/ld\+json" data-seo-json-ld>([\s\S]*?)<\/script>/)
    expect(jsonLdMatch).not.toBeNull()
    expect(JSON.parse(jsonLdMatch[1])['@context']).toBe('https://schema.org')
    expect(html).toContain('<a href="/nossa-abordagem">Conheça nossa abordagem</a>')
    expect(html).toContain('<a href="/contato">Fale com a Otimiza</a>')
    expect(html).not.toMatch(/href="https?:\/\/localhost/)
  })

  it('renders a logical H1, H2 and H3 hierarchy without skipped levels', () => {
    const html = renderStaticRouteHtml(baseHtml, {
      title: 'Quem somos | Otimiza',
      description: 'Conheça a Otimiza.',
      h1: 'Quem somos',
      canonicalUrl: 'https://www.otimiza.test/quem-somos',
      imageUrl: 'https://www.otimiza.test/assets/social.jpg',
      structuredData: { '@context': 'https://schema.org', '@graph': [] },
      links: [],
      sections: [
        {
          heading: 'Como atuamos',
          children: ['Consultoria', 'Tecnologia', 'Academia'],
        },
      ],
    })
    const levels = [...html.matchAll(/<h([1-6])\b/g)].map((match) => Number(match[1]))
    const hasSkippedLevel = levels.some((level, index) => index > 0 && level > levels[index - 1] + 1)

    expect(levels).toEqual([1, 2, 3, 3, 3])
    expect(hasSkippedLevel).toBe(false)
  })

  it('provides at least 300 useful words on the home page', () => {
    expect(getStaticRouteWordCount('/')).toBeGreaterThanOrEqual(300)
  })
})
