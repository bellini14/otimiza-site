import { describe, expect, it, vi } from 'vitest'
import {
  CASES_QUERY,
  fetchCaseStudies,
  generateCaseSocialPages,
  renderCaseSocialPage,
} from './generate-case-social-pages.mjs'

const siteOrigin = 'https://www.otimiza.test'
const baseHtml = '<!doctype html><html lang="pt-BR"><head><title>Padrão</title><meta name="description" content="Padrão" /></head><body><div id="root"></div></body></html>'

describe('case social page generation', () => {
  it('renders case-specific article metadata', () => {
    const html = renderCaseSocialPage({
      siteOrigin,
      baseHtml,
      caseStudy: {
        slug: 'banco-moneo',
        name: 'Banco Moneo',
        title: 'Transformação que dá certo',
        description: 'Automação segura de contratos.',
        imageUrl: 'https://images.example/moneo.jpg',
      },
    })

    expect(html).toContain('<title>Transformação que dá certo | Otimiza</title>')
    expect(html).toContain('<meta name="description" content="Automação segura de contratos." />')
    expect(html).toContain('<link rel="canonical" href="https://www.otimiza.test/cases/banco-moneo" />')
    expect(html).toContain('<meta property="og:type" content="article" />')
    expect(html).toContain('<meta property="og:image" content="https://images.example/moneo.jpg" />')
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />')
    expect(html).toContain('<meta name="twitter:image" content="https://images.example/moneo.jpg" />')
  })

  it('escapes metadata inserted into the document', () => {
    const html = renderCaseSocialPage({
      siteOrigin,
      baseHtml,
      caseStudy: {
        slug: 'cliente',
        name: 'Cliente',
        title: 'Resultado <seguro> & "simples"',
        description: 'Processos & contratos.',
      },
    })

    expect(html).toContain('<title>Resultado &lt;seguro&gt; &amp; &quot;simples&quot; | Otimiza</title>')
    expect(html).toContain('content="Processos &amp; contratos."')
  })

  it('omits image tags and uses a compact card when no image exists', () => {
    const html = renderCaseSocialPage({
      siteOrigin,
      baseHtml,
      caseStudy: { slug: 'cliente', name: 'Cliente', title: 'Case Cliente' },
    })

    expect(html).toContain('Case de consultoria da Otimiza para Cliente.')
    expect(html).not.toContain('<meta property="og:image"')
    expect(html).not.toContain('<meta name="twitter:image"')
    expect(html).toContain('<meta name="twitter:card" content="summary" />')
  })

  it('rejects invalid slugs and malformed image URLs', () => {
    expect(() => renderCaseSocialPage({
      siteOrigin,
      baseHtml,
      caseStudy: { slug: '../escape', name: 'Cliente', title: 'Case Cliente' },
    })).toThrow('valid case slug')

    expect(() => renderCaseSocialPage({
      siteOrigin,
      baseHtml,
      caseStudy: { slug: 'cliente', name: 'Cliente', title: 'Case Cliente', imageUrl: 'not a URL' },
    })).toThrow('Invalid URL')
  })

  it('uses Sanity values first and local values as field-level fallbacks', async () => {
    const writeFile = vi.fn()
    const localHeroImage = 'https://images.example/local-hero.jpg'
    const result = await generateCaseSocialPages({
      siteOrigin,
      baseHtml,
      fetchCases: async () => [
        {
          name: 'Banco Moneo S.A.',
          imageUrl: 'https://images.example/logo.png',
        },
        {
          name: 'Cliente prioritário',
          slug: 'cliente-prioritario',
          title: 'Título do Sanity',
          description: 'Descrição do Sanity.',
          imageUrl: 'https://images.example/sanity-logo.png',
        },
        { name: 'Cliente sem rota' },
      ],
      localCases: {
        'banco-moneo': {
          title: 'Case - Banco Moneo',
          subtitle: 'Transformação que dá certo',
        },
        'cliente-prioritario': {
          title: 'Título local',
          subtitle: 'Descrição local.',
        },
      },
      resolveLocalSlug: (name) => name === 'Banco Moneo S.A.' ? 'banco-moneo' : null,
      localHeroImages: {
        'banco-moneo': localHeroImage,
      },
      writeFile,
    })

    expect(result).toEqual({ generated: 2, skipped: 1 })
    expect(writeFile).toHaveBeenCalledWith(
      'cases/banco-moneo/index.html',
      expect.stringContaining('<title>Case - Banco Moneo | Otimiza</title>'),
    )
    const moneoHtml = writeFile.mock.calls[0][1]
    expect(moneoHtml).toContain('Transformação que dá certo')
    expect(moneoHtml).toContain(localHeroImage)
    expect(moneoHtml).not.toContain('https://images.example/logo.png')

    const priorityHtml = writeFile.mock.calls[1][1]
    expect(priorityHtml).toContain('<title>Título do Sanity | Otimiza</title>')
    expect(priorityHtml).toContain('Descrição do Sanity.')
    expect(priorityHtml).toContain('https://images.example/sanity-logo.png')
    expect(priorityHtml).not.toContain('Título local')
  })

  it('requires a write boundary and an array response', async () => {
    await expect(generateCaseSocialPages({
      siteOrigin,
      baseHtml,
      fetchCases: async () => [],
    })).rejects.toThrow('writeFile')

    await expect(generateCaseSocialPages({
      siteOrigin,
      baseHtml,
      fetchCases: async () => ({ result: [] }),
      writeFile: vi.fn(),
    })).rejects.toThrow('response was not an array')
  })

  it('fetches only visible cases enabled for the cases page', async () => {
    const fetchFn = vi.fn(async () => ({
      ok: true,
      json: async () => ({ result: [] }),
    }))

    await expect(fetchCaseStudies(fetchFn)).resolves.toEqual([])
    expect(fetchFn).toHaveBeenCalledOnce()
    expect(decodeURIComponent(fetchFn.mock.calls[0][0])).toContain(CASES_QUERY)
    expect(CASES_QUERY).toContain('_type == "clientLogo"')
    expect(CASES_QUERY).toContain('isVisible != false')
    expect(CASES_QUERY).toContain('showOnCases == true')
    expect(CASES_QUERY).not.toContain('coalesce')
  })

  it('fails when Sanity returns an HTTP error or a non-array result', async () => {
    await expect(fetchCaseStudies(async () => ({
      ok: false,
      status: 503,
    }))).rejects.toThrow('HTTP 503')

    await expect(fetchCaseStudies(async () => ({
      ok: true,
      json: async () => ({ result: {} }),
    }))).rejects.toThrow('invalid cases response')
  })
})
