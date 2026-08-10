import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildCanonicalUrl, staticPageMetadata } from '../src/seo/siteMetadata.js'
import {
  generateStaticSeoPages,
  getStaticRouteWordCount,
  renderStaticRouteHtml,
} from './generate-static-seo.mjs'

const baseHtml = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta name="description" content="Descrição padrão" />
    <title>Título padrão</title>
  </head>
  <body><div id="root"></div><script src="/assets/app.js"></script></body>
</html>`

function createStaticFixture({ includeHeroImage = true, includeMemorialImage = true } = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'silvana-seo-'))
  mkdirSync(join(directory, 'assets'), { recursive: true })
  mkdirSync(join(directory, 'media'), { recursive: true })
  writeFileSync(join(directory, 'index.html'), baseHtml)
  if (includeHeroImage) {
    writeFileSync(join(directory, 'assets', 'hero-bw-test.jpg'), 'default-social-image')
  }
  if (includeMemorialImage) {
    writeFileSync(
      join(directory, 'media', 'silvana-aniversario-05-08.png'),
      'memorial-social-image',
    )
  }
  return directory
}

function readRouteHtml(directory, route) {
  const filename = route === '/' ? 'index.html' : `${route.slice(1)}.html`
  return readFileSync(join(directory, filename), 'utf8')
}

describe('static SEO route generation', () => {
  it('publishes dated Inspire post previews with their featured image after static routes', async () => {
    const directory = createStaticFixture()
    const post = {
      title: 'Post de exemplo',
      slug: 'exemplo',
      publishedAt: '2026-07-28T12:00:00Z',
      mainImageUrl: 'https://cdn.sanity.io/images/example/main.jpg',
      contentImageUrl: 'https://cdn.sanity.io/images/example/content.jpg',
    }
    try {
      await generateStaticSeoPages(directory, { VITE_SITE_URL: 'https://www.otimiza.test' }, {
        fetchPosts: async () => [post, {
          ...post,
          slug: 'sem-imagem',
          mainImageUrl: null,
          contentImageUrl: null,
        }],
      })

      const html = readFileSync(join(directory, '2026', '07', '28', 'exemplo', 'index.html'), 'utf8')
      expect(html).toContain('<meta property="og:image" content="https://cdn.sanity.io/images/example/main.jpg" />')
      const fallbackHtml = readFileSync(join(directory, '2026', '07', '28', 'sem-imagem', 'index.html'), 'utf8')
      expect(fallbackHtml).toContain('<meta property="og:image" content="https://www.otimiza.test/assets/hero-bw-test.jpg" />')
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('fails generation when the Vite hero fallback asset is missing', async () => {
    const directory = createStaticFixture({ includeHeroImage: false })
    try {
      await expect(generateStaticSeoPages(directory, {
        VITE_SITE_URL: 'https://www.otimiza.test',
      })).rejects.toThrow('Missing Vite hero social image')
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

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

  it('generates the exact non-indexed memorial social preview', async () => {
    const directory = createStaticFixture()
    try {
      await generateStaticSeoPages(directory, { VITE_SITE_URL: 'https://www.otimiza.test' }, {
        fetchPosts: async () => [],
      })
      const html = readRouteHtml(directory, '/silvana-bettiol')
      expect(html).toContain('<title>05/08 é aniversário da Silvana</title>')
      expect(html).toContain('<meta name="description" content="O que Silvana nos ensinou continua vivo em nós. Compartilhe uma lembrança." />')
      expect(html).toContain('<link rel="canonical" href="https://otimiza-site.vercel.app/silvana-bettiol" />')
      expect(html).toContain('<meta property="og:title" content="05/08 é aniversário da Silvana" />')
      expect(html).toContain('<meta property="og:description" content="O que Silvana nos ensinou continua vivo em nós. Compartilhe uma lembrança." />')
      expect(html).toContain('<meta property="og:url" content="https://otimiza-site.vercel.app/silvana-bettiol" />')
      expect(html).toContain('<meta property="og:image" content="https://otimiza-site.vercel.app/media/silvana-aniversario-05-08.png" />')
      expect(html).toContain('<meta name="twitter:title" content="05/08 é aniversário da Silvana" />')
      expect(html).toContain('<meta name="twitter:description" content="O que Silvana nos ensinou continua vivo em nós. Compartilhe uma lembrança." />')
      expect(html).toContain('<meta name="twitter:image" content="https://otimiza-site.vercel.app/media/silvana-aniversario-05-08.png" />')
      expect(html).toContain('<meta name="robots" content="noindex, nofollow" />')
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('fails generation when the memorial social image is missing', async () => {
    const directory = createStaticFixture({ includeMemorialImage: false })
    try {
      await expect(generateStaticSeoPages(directory, {
        VITE_SITE_URL: 'https://www.otimiza.test',
      }, { fetchPosts: async () => [] })).rejects.toThrow('Missing memorial social image')
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('generates an exclusive social preview for the Inspire newsletter', async () => {
    const directory = createStaticFixture()
    const origin = 'https://www.otimiza.test'
    try {
      await generateStaticSeoPages(directory, { VITE_SITE_URL: origin }, {
        fetchPosts: async () => [],
      })

      const html = readRouteHtml(directory, '/inspire/newsletter')
      const title = 'Assine o Inspire'
      const description = 'Receba novas leituras, repertorio de gestao e selecoes editoriais da Otimiza em uma curadoria direta no seu inbox.'
      const imageUrl = `${origin}/inspire-newsletter-card.png`

      expect(html).toContain('<title>Newsletter Inspire sobre gestão empresarial | Otimiza</title>')
      expect(html).toContain('<meta name="description" content="Assine a newsletter Inspire para acompanhar conteúdos da Otimiza sobre gestão empresarial, processos, tecnologia e desenvolvimento." />')
      expect(html).toContain(`<meta property="og:title" content="${title}" />`)
      expect(html).toContain(`<meta property="og:description" content="${description}" />`)
      expect(html).toContain(`<meta property="og:image" content="${imageUrl}" />`)
      expect(html).toContain(`<meta name="twitter:title" content="${title}" />`)
      expect(html).toContain(`<meta name="twitter:description" content="${description}" />`)
      expect(html).toContain(`<meta name="twitter:image" content="${imageUrl}" />`)
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('preserves complete metadata for every preexisting static route', async () => {
    const directory = createStaticFixture()
    const origin = 'https://www.otimiza.test'
    const defaultImage = `${origin}/assets/hero-bw-test.jpg`
    try {
      await generateStaticSeoPages(directory, { VITE_SITE_URL: origin }, {
        fetchPosts: async () => [],
      })
      Object.entries(staticPageMetadata).filter(([route]) => route !== '/inspire/newsletter').forEach(([route, metadata]) => {
        const html = readRouteHtml(directory, route)
        const canonical = buildCanonicalUrl(route, origin)
        expect(html).toContain(`<title>${metadata.title}</title>`)
        expect(html).toContain(`<meta name="description" content="${metadata.description}" />`)
        expect(html).toContain(`<link rel="canonical" href="${canonical}" />`)
        expect(html).toContain(`<meta property="og:title" content="${metadata.title}" />`)
        expect(html).toContain(`<meta property="og:description" content="${metadata.description}" />`)
        expect(html).toContain(`<meta property="og:url" content="${canonical}" />`)
        expect(html).toContain(`<meta property="og:image" content="${defaultImage}" />`)
        expect(html).toContain(`<meta name="twitter:title" content="${metadata.title}" />`)
        expect(html).toContain(`<meta name="twitter:description" content="${metadata.description}" />`)
        expect(html).toContain(`<meta name="twitter:image" content="${defaultImage}" />`)
        expect(html).not.toContain('<meta name="robots" content="noindex, nofollow" />')
      })
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
