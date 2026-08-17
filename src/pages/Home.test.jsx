import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Home from './Home'

const { sanityFetchMock } = vi.hoisted(() => ({
  sanityFetchMock: vi.fn(async (query) => {
    if (query.includes('showOnCases == true')) {
      return [
        {
          _id: 'cms-sulmaq',
          name: 'Sulmaq',
          sector: 'Indústria',
          logoAlt: 'Logo Sulmaq',
          logoUrl: 'https://cdn.sanity.io/images/demo/sulmaq.png',
          caseSlug: 'sulmaq',
          caseDescription: 'Descrição longa do case Sulmaq.',
        },
      ]
    }
    return []
  }),
}))

vi.mock('../lib/sanity', () => ({
  client: { fetch: sanityFetchMock },
}))

const testDir = path.dirname(fileURLToPath(import.meta.url))
const homeCss = fs.readFileSync(path.resolve(testDir, '../index.css'), 'utf8')
const htmlEntry = fs.readFileSync(path.resolve(testDir, '../../index.html'), 'utf8')

afterEach(() => {
  cleanup()
  sanityFetchMock.mockClear()
})

describe('Home', () => {
  it('forces Elza as the only declared font family in the global stylesheet', () => {
    expect(htmlEntry).toMatch(/<link rel="stylesheet" href="https:\/\/use\.typekit\.net\/hrm4pwi\.css" \/>/)
    expect(htmlEntry).toMatch(/<body class="tk-elza">/)
    expect(homeCss).toMatch(/@import url\("https:\/\/use\.typekit\.net\/hrm4pwi\.css"\);/)
    expect(homeCss).toMatch(
      /html\s*\{[\s\S]*font-family:\s*"elza",\s*sans-serif;[\s\S]*font-weight:\s*100;[\s\S]*font-style:\s*normal;[\s\S]*\}/,
    )
    expect(homeCss).toMatch(
      /body,\s*#root,\s*button,\s*input,\s*textarea,\s*select,\s*\*,\s*\*::before,\s*\*::after\s*\{[\s\S]*font-family:\s*inherit\s*!important;[\s\S]*font-weight:\s*inherit;[\s\S]*font-style:\s*inherit;/,
    )
  })

  it('keeps the hero gradient layer interactive for mouse tracking', () => {
    expect(homeCss).not.toMatch(/\.home-hero__gradient\s*\{[^}]*pointer-events:\s*none;/s)
  })

  it('pulls the hero up enough to cover the layout top padding', () => {
    expect(homeCss).toMatch(/\.home-hero\s*\{[\s\S]*margin-top:\s*-8rem;/)
    expect(homeCss).toMatch(/@media\s*\(min-width:\s*640px\)\s*\{[\s\S]*\.home-hero\s*\{[\s\S]*margin-top:\s*-9rem;/)
  })

  it('keeps the hero at full viewport height and does not overlap the next section', () => {
    expect(homeCss).toMatch(/\.home-hero__stage\s*\{[\s\S]*min-height:\s*100svh;/)
    expect(homeCss).toMatch(/\.home-hero__content\s*\{[\s\S]*min-height:\s*100svh;/)
  })

  it('does not apply a global vertical gap below the hero wrapper', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('home-page')).not.toHaveClass('pb-6')
    expect(screen.getByTestId('home-page')).not.toHaveClass('space-y-12')
    expect(screen.getByTestId('home-content')).not.toHaveClass('space-y-12')
    expect(screen.getByTestId('home-content')).not.toHaveClass('-mt-10')
  })

  it('renders Inspire immediately after the hero and before the brands section', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    const inspireHeading = screen.getByRole('heading', {
      name: 'Inspire. Conteúdo de vanguarda para a gestão de alto impacto.',
    })
    const brandsHeading = screen.getByRole('heading', { name: 'Marcas que confiam na Otimiza' })

    expect(inspireHeading.compareDocumentPosition(brandsHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders Nossa Tecnologia as the final home content section', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    const homeContent = screen.getByTestId('home-content')
    const featuresHeading = screen.getByRole('heading', { name: 'Nossas Soluções' })
    const technologyHeading = screen.getByRole('heading', { name: 'Nossa Tecnologia' })
    const technologySection = technologyHeading.closest('section')

    expect(featuresHeading.compareDocumentPosition(technologyHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(homeContent.lastElementChild).toBe(technologySection)
  })

  it('uses a light gray background for the Nossas Soluções section', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    const featuresSection = screen.getByRole('heading', { name: 'Nossas Soluções' }).closest('section')

    expect(featuresSection).toHaveClass('bg-[#EFEFF4]')
  })

  it('does not render section eyebrow labels', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.queryByText('Empresas que confiam', { exact: true })).not.toBeInTheDocument()
    expect(screen.queryByText('OTMSuite', { exact: true })).not.toBeInTheDocument()
    expect(screen.queryByText('Cases', { exact: true })).not.toBeInTheDocument()
  })

  it('uses tighter mobile spacing for the brands section while preserving desktop spacing', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    const brandsSection = screen.getByRole('heading', { name: 'Marcas que confiam na Otimiza' }).closest('section')
    const brandsIntro = screen.getByRole('heading', { name: 'Marcas que confiam na Otimiza' }).parentElement
    expect(brandsSection).toHaveClass('pt-14', 'pb-24', 'sm:py-32')
    expect(brandsSection).not.toHaveClass('py-24', 'py-14', 'pb-14', 'sm:py-24')
    expect(brandsIntro).toHaveClass('mb-10', 'sm:mb-16')
    expect(brandsIntro).not.toHaveClass('mb-16')
  })

  it('aligns home content shells to the responsive menu width', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    const alignedShells = screen.getAllByTestId('home-menu-aligned-shell')
    expect(alignedShells).toHaveLength(6)

    alignedShells.forEach((shell) => {
      expect(shell).toHaveClass('home-menu-shell')
    })

    expect(homeCss).toMatch(/\.home-menu-shell\s*\{[\s\S]*max-width:\s*1320px;/)
    expect(homeCss).toMatch(/\.home-menu-shell\s*\{[\s\S]*padding-inline:\s*1\.5rem;/)
    expect(homeCss).toMatch(
      /@media\s*\(min-width:\s*640px\)\s*\{[\s\S]*\.home-menu-shell\s*\{[\s\S]*padding-inline:\s*2rem;/,
    )
    expect(homeCss).toMatch(
      /@media\s*\(min-width:\s*1024px\)\s*\{[\s\S]*\.home-menu-shell\s*\{[\s\S]*padding-inline:\s*2\.5rem;/,
    )
  })

  it('uses the same responsive side margin on the hero text section', () => {
    expect(homeCss).toMatch(/:root\s*\{[\s\S]*--home-menu-inline:\s*1\.5rem;/)
    expect(homeCss).toMatch(/:root\s*\{[\s\S]*--home-hero-text-inline:\s*var\(--home-menu-inline\);/)
    expect(homeCss).toMatch(/\.home-menu-shell\s*\{[\s\S]*padding-inline:\s*var\(--home-menu-inline\);/)
    expect(homeCss).toMatch(
      /@media\s*\(min-width:\s*771px\)\s*\{[\s\S]*:root\s*\{[\s\S]*--home-hero-text-inline:\s*calc\(1\.5rem\s*\+\s*\(2\.5\s*\*\s*clamp\(0\.72rem,\s*calc\(0\.328rem\s*\+\s*0\.81455vw\),\s*1rem\)\)\);/,
    )
    expect(homeCss).toMatch(
      /@media\s*\(min-width:\s*1024px\)\s*\{[\s\S]*:root\s*\{[\s\S]*--home-hero-text-inline:\s*calc\(2rem\s*\+\s*\(2\.5\s*\*\s*clamp\(0\.72rem,\s*calc\(0\.328rem\s*\+\s*0\.81455vw\),\s*1rem\)\)\);/,
    )
    expect(homeCss).toMatch(/\.home-hero__left\s*\{[\s\S]*padding:\s*6rem\s+var\(--home-hero-text-inline\)\s+4\.5rem;/)
    expect(homeCss).toMatch(
      /@media\s*\(max-width:\s*768px\)\s*\{[\s\S]*\.home-hero__left\s*\{[\s\S]*padding:\s*8rem\s+var\(--home-hero-text-inline\)\s+3rem;/,
    )
  })

  it('renders the hero copy as one light heading with two bold phrases', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    const heroHeading = screen.getByRole('heading', {
      name: 'Transformamos visão em método, cultura em capacidade e estratégia em operação.',
    })
    expect(heroHeading).toBeInTheDocument()
    expect(heroHeading.querySelectorAll('.home-hero__title-strong')).toHaveLength(2)
    expect(heroHeading.querySelectorAll('.home-hero__title-strong')[0]).toHaveTextContent('visão em método,')
    expect(heroHeading.querySelectorAll('.home-hero__title-strong')[0]).toHaveClass(
      'home-hero__title-strong--spaced',
    )
    expect(heroHeading.querySelectorAll('.home-hero__title-strong')[1]).toHaveTextContent('estratégia em operação.')
    expect(screen.queryByText(/junte-se as mais de 400 empresas/i)).not.toBeInTheDocument()
  })

  it('uses a compact responsive scale for the longer hero heading', () => {
    expect(homeCss).toMatch(
      /\.home-hero__title\s*\{[\s\S]*?font-size:\s*clamp\(2\.25rem,\s*3\.8vw,\s*3\.7rem\)/,
    )
    expect(homeCss).toMatch(
      /@media \(max-width:\s*768px\)[\s\S]*?\.home-hero__title\s*\{[\s\S]*?font-size:\s*clamp\(2rem,\s*7\.2vw,\s*2\.65rem\)/,
    )
  })

  it('does not render the email form over the hero image', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.queryByPlaceholderText('Seu email')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Quero fazer parte' })).not.toBeInTheDocument()
  })

  it('loads the same ordered case-logo records used by the Cases page', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Logo Sulmaq' })).toHaveAttribute(
        'src',
        'https://cdn.sanity.io/images/demo/sulmaq.png',
      )
    })

    const caseQuery = sanityFetchMock.mock.calls
      .map(([query]) => query)
      .find((query) => query.includes('showOnCases == true'))

    expect(caseQuery).toContain('isVisible != false')
    expect(caseQuery).toContain('defined(logo.asset)')
    expect(caseQuery).toContain('order(coalesce(sortOrder, 9999) asc, name asc)')
    expect(caseQuery).toContain('name')
    expect(caseQuery).toContain('sector')
    expect(caseQuery).toContain('caseDescription')
    expect(caseQuery).toContain('"caseSlug": caseSlug.current')
    expect(caseQuery).toContain('"logoUrl": logo.asset->url')
  })

  it('uses the published OTM URL for mapped legacy home logos', async () => {
    const defaultImplementation = sanityFetchMock.getMockImplementation()
    sanityFetchMock.mockImplementation(async (query) => (
      query.includes('showOnCases == true')
        ? []
        : [
            {
              _id: 'legacy-home-logo',
              name: 'Cliente legado',
              logoAlt: 'Logo legado',
              logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/0122eed8d7195fe28022797c883bcb730ac02641-856x314.png?w=1200&auto=format',
            },
          ]
    ))

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Logo legado' })).toHaveAttribute(
        'src',
        'https://www.otm.com.br/wp-content/uploads/2020/10/Screenshot_11.png',
      )
    })

    sanityFetchMock.mockImplementation(defaultImplementation)
  })

  it('renders the rebuilt hero with centered copy', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    const stage = screen.getByTestId('hero-stage')
    const background = screen.getByTestId('hero-gradient-blinds')

    expect(background).toBeInTheDocument()
    expect(stage.querySelector('[data-testid="hero-gradient-blinds"]')).not.toBeNull()
  })
})
