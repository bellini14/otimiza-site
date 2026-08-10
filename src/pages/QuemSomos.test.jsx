import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { cwd } from 'node:process'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import QuemSomos from './QuemSomos'

const originalIntersectionObserver = globalThis.IntersectionObserver
const indexCss = readFileSync(path.join(cwd(), 'src', 'index.css'), 'utf8')
let intersectionObservers = []

function readMediaBlock(css, query) {
  const marker = `@media ${query}`
  const blocks = []
  let searchFrom = 0

  while (searchFrom < css.length) {
    const start = css.indexOf(marker, searchFrom)
    if (start < 0) break

    const open = css.indexOf('{', start)
    let depth = 0

    for (let index = open; index < css.length; index += 1) {
      if (css[index] === '{') depth += 1
      if (css[index] === '}') depth -= 1
      if (depth === 0) {
        blocks.push(css.slice(open + 1, index))
        searchFrom = index + 1
        break
      }
    }
  }

  return blocks.join('\n')
}

class ControlledIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback
    this.options = options
    intersectionObservers.push(this)
  }

  observe(element) {
    this.element = element
  }

  disconnect() {}
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  globalThis.IntersectionObserver = originalIntersectionObserver
  intersectionObservers = []
})

describe('QuemSomos', () => {
  it('uses a lightweight hero background asset', () => {
    const heroAssetPath = path.join(cwd(), 'imagens', 'hero quem somos-optimized.jpg')

    expect(statSync(heroAssetPath).size).toBeLessThan(600 * 1024)
  })

  it('reveals the three-pillars block when most of its animation target is visible', () => {
    globalThis.IntersectionObserver = ControlledIntersectionObserver

    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    const pillarsSection = screen.getByTestId('quem-somos-pillars')
    const revealTarget = screen.getByTestId('quem-somos-pillars-reveal-target')
    expect(pillarsSection.querySelector('[data-reveal="pillars-heading"]')).toHaveClass('opacity-0')
    expect(pillarsSection.querySelector('[data-reveal="pillars-card-0"]')).toHaveClass('opacity-0')
    expect(pillarsSection.querySelector('[data-reveal="pillars-panel"]')).toHaveClass('opacity-0')

    const pillarsObserver = intersectionObservers.find((observer) => observer.element === revealTarget)
    expect(pillarsObserver.options.threshold).toBe(0.58)

    act(() => {
      pillarsObserver.callback([{ isIntersecting: true, intersectionRatio: 0.42 }])
    })

    expect(pillarsSection.querySelector('[data-reveal="pillars-heading"]')).toHaveClass('opacity-0')

    act(() => {
      pillarsObserver.callback([{ isIntersecting: true, intersectionRatio: 0.58 }])
    })

    expect(pillarsSection.querySelector('[data-reveal="pillars-heading"]')).toHaveClass('animate-enter')
    expect(pillarsSection.querySelector('[data-reveal="pillars-card-0"]')).toHaveClass('animate-enter')
    expect(pillarsSection.querySelector('[data-reveal="pillars-card-1"]')).toHaveClass('[animation-delay:240ms]')
    expect(pillarsSection.querySelector('[data-reveal="pillars-panel"]')).toHaveClass('[animation-delay:420ms]')
  })

  it('adds distinct scroll reveal variants to page content without animating section shells', () => {
    globalThis.IntersectionObserver = ControlledIntersectionObserver

    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('quem-somos-hero')).not.toHaveClass('qs-reveal')
    expect(screen.getByTestId('quem-somos-client-logo-carousel')).not.toHaveClass('qs-reveal')
    expect(screen.getByTestId('quem-somos-story')).not.toHaveClass('qs-reveal')
    expect(screen.getByTestId('quem-somos-strategy')).not.toHaveClass('qs-reveal')
    expect(screen.getByTestId('quem-somos-mission')).not.toHaveClass('qs-reveal')
    expect(screen.getByTestId('quem-somos-consultants')).not.toHaveClass('qs-reveal')
    expect(screen.getByTestId('quem-somos-strategy')).toHaveClass('bg-[#FFFFFF]')
    expect(screen.getByTestId('quem-somos-consultants')).toHaveClass('bg-[#FFFFFF]')

    const missionBackgroundIcon = screen.getByTestId('quem-somos-mission').querySelector('img[aria-hidden="true"]')
    expect(missionBackgroundIcon).toHaveClass('qs-reveal--hero-photo')
    expect(missionBackgroundIcon).not.toHaveClass('opacity-45')
    expect(missionBackgroundIcon).not.toHaveClass('qs-reveal--grow-out')
    expect(missionBackgroundIcon).not.toHaveClass('qs-reveal--rotate-soft')

    const missionQuote = screen.getByText(/Contribuir para o crescimento e a solidez dos clientes/i)
    expect(missionQuote).toHaveClass('qs-reveal--fade-up')
    expect(missionQuote).not.toHaveClass('qs-reveal--clip-rise')

    const strategySection = screen.getByTestId('quem-somos-strategy')
    const strategyHeading = strategySection.querySelector('[data-reveal="strategy-heading"]')
    expect(strategyHeading).not.toHaveClass('qs-reveal--visible')

    act(() => {
      intersectionObservers.forEach((observer) => {
        if (observer.element === strategySection) {
          observer.callback([{ isIntersecting: true, intersectionRatio: 0.18 }])
        }
      })
    })

    expect(strategyHeading).toHaveClass('qs-reveal--visible')
    expect(strategySection.querySelector('[data-reveal="strategy-item-0"]')).toHaveClass('qs-reveal--fade-up')
    expect(strategySection.querySelector('[data-reveal="strategy-item-1"]')).toHaveStyle({ '--qs-reveal-delay': '120ms' })
  })

  it('waits until the mission section is meaningfully visible before revealing its quote', () => {
    globalThis.IntersectionObserver = ControlledIntersectionObserver
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })

    const animationFrameCallbacks = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      animationFrameCallbacks.push(callback)
      return animationFrameCallbacks.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function getBoundingClientRect() {
      const testId = this.getAttribute?.('data-testid')
      const top = testId === 'quem-somos-mission' ? 760 : 1600
      const height = 600

      return {
        top,
        bottom: top + height,
        left: 0,
        right: 1200,
        width: 1200,
        height,
        x: 0,
        y: top,
        toJSON: () => {},
      }
    })

    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    act(() => {
      const callbacks = animationFrameCallbacks.splice(0)
      callbacks.forEach((callback) => callback())
    })

    expect(screen.getByText(/Contribuir para o crescimento e a solidez dos clientes/i)).not.toHaveClass('qs-reveal--visible')
  })

  it('keeps the story copy static after the first full reveal pass', () => {
    let storyTop = 100
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function getBoundingClientRect() {
      if (typeof this.className === 'string' && this.className.includes('[text-align-last:left]')) {
        return {
          top: storyTop,
          bottom: storyTop + 420,
          left: 0,
          right: 900,
          width: 900,
          height: 420,
          x: 0,
          y: storyTop,
          toJSON: () => {},
        }
      }

      return {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      }
    })

    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    const storyParagraph = screen.getByLabelText(/Uma equipe multidisciplinar de consultores seniores/i)
    const firstWord = storyParagraph.querySelector('span')
    expect(firstWord).toHaveStyle({ opacity: '1', filter: 'blur(0px)' })

    storyTop = 900
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    expect(firstWord).toHaveStyle({ opacity: '1', filter: 'blur(0px)' })
  })

  it('renders the hero title with the SplitText animation wrapper', () => {
    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    const heading = screen.getByRole('heading', { name: 'Quem somos' })
    expect(heading.tagName).toBe('H1')
    expect(heading).toHaveClass('split-parent')
    expect(heading).not.toHaveClass('qs-reveal')
  })

  it('keeps the about hero title on a single line on desktop', () => {
    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    const heading = screen.getByRole('heading', { name: 'Quem somos' })
    expect(heading).toHaveClass('quem-somos-hero__title')
    expect(heading.style.textAlign).toBe('inherit')
    const desktopCss = readMediaBlock(indexCss, '(min-width: 1024px)')
    expect(desktopCss).toMatch(/\.quem-somos-hero__title\s*\{[\s\S]*white-space:\s*nowrap\s*!important;/)
    expect(indexCss).toMatch(
      /\.quem-somos-hero__title\s*\{[\s\S]*font-size:\s*clamp\(2\.75rem,\s*13vw,\s*4\.5rem\)/,
    )
  })

  it('centers the about hero below 1024px while preserving its desktop composition', () => {
    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    const hero = screen.getByTestId('quem-somos-hero')
    expect(hero.querySelector('.quem-somos-hero__shell')).toBeInTheDocument()
    expect(hero.querySelector('.quem-somos-hero__copy')).toBeInTheDocument()
    expect(hero.querySelector('.quem-somos-hero__intro')).toBeInTheDocument()
    expect(hero.querySelector('.quem-somos-hero__card')).toBeInTheDocument()
    expect(hero.querySelector('.quem-somos-hero__scroll')).toBeInTheDocument()
    expect(screen.getByTestId('quem-somos-hero-background')).toHaveClass('quem-somos-hero__photo')

    expect(indexCss).toMatch(/\.quem-somos-hero__shell\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\);[\s\S]*min-height:\s*100svh;[\s\S]*gap:\s*clamp\(1\.5rem,\s*6vw,\s*2\.5rem\);/)
    expect(indexCss).toMatch(/\.quem-somos-hero__title\s*\{[\s\S]*font-size:\s*clamp\(2\.75rem,\s*13vw,\s*4\.5rem\);[\s\S]*text-align:\s*center;[\s\S]*white-space:\s*normal/)
    expect(indexCss).toMatch(/\.quem-somos-hero__intro\s*\{[\s\S]*max-width:\s*36rem;[\s\S]*line-height:\s*1\.35;[\s\S]*text-align:\s*center/)
    expect(indexCss).toMatch(/\.quem-somos-hero__card\s*\{[\s\S]*max-width:\s*33rem;[\s\S]*padding:\s*1\.5rem;[\s\S]*text-align:\s*center/)
    expect(indexCss).toMatch(/\.quem-somos-hero__photo\s*\{[\s\S]*object-position:\s*60%\s+center/)
    expect(indexCss).toMatch(/\.quem-somos-hero__scroll\s*\{[\s\S]*position:\s*static;[\s\S]*margin-top:\s*1\.5rem;[\s\S]*transform:\s*none/)
    expect(indexCss).toMatch(/:root\s*\{[\s\S]*--home-menu-inline:\s*1\.5rem/)
    expect(readMediaBlock(indexCss, '(min-width: 640px)')).toMatch(/--home-menu-inline:\s*2rem/)

    const desktopCss = readMediaBlock(indexCss, '(min-width: 1024px)')
    expect(desktopCss).toMatch(/\.quem-somos-hero__shell\s*\{[\s\S]*grid-template-columns:\s*1fr\s+0\.82fr/)
    expect(desktopCss).toMatch(/\.quem-somos-hero__copy\s*\{[\s\S]*text-align:\s*left/)
    expect(desktopCss).toMatch(/\.quem-somos-hero__photo\s*\{[\s\S]*object-position:\s*center/)
    expect(desktopCss).toMatch(/\.quem-somos-hero__scroll\s*\{[\s\S]*position:\s*absolute;[\s\S]*bottom:\s*2\.5rem/)
  })

  it('uses the shared responsive side margin shell across about page content', () => {
    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    const alignedShells = screen.getByTestId('quem-somos-page').querySelectorAll('.home-menu-shell')
    expect(alignedShells).toHaveLength(6)

    alignedShells.forEach((shell) => {
      expect(shell).toHaveClass('home-menu-shell')
    })

    expect(indexCss).toMatch(/:root\s*\{[\s\S]*--home-menu-inline:\s*1\.5rem;/)
    expect(indexCss).toMatch(/@media\s*\(min-width:\s*640px\)\s*\{[\s\S]*--home-menu-inline:\s*2rem;/)
    expect(indexCss).toMatch(/@media\s*\(min-width:\s*1024px\)\s*\{[\s\S]*--home-menu-inline:\s*2\.5rem;/)
  })

  it('centers the story copy with a readable mobile measure', () => {
    render(<MemoryRouter><QuemSomos /></MemoryRouter>)

    expect(screen.getByTestId('quem-somos-story').querySelector('.quem-somos-story__content')).toBeInTheDocument()
    expect(indexCss).toMatch(/\.quem-somos-story__content\s*\{[\s\S]*max-width:\s*36rem;[\s\S]*margin-inline:\s*auto;[\s\S]*text-align:\s*left/)
    expect(indexCss).toMatch(/\.quem-somos-story-copy\s*\{[\s\S]*font-size:\s*clamp\(1\.5rem,\s*7vw,\s*2\.35rem\);[\s\S]*line-height:\s*1\.3/)

    const desktopCss = readMediaBlock(indexCss, '(min-width: 1024px)')
    expect(desktopCss).toMatch(/\.quem-somos-story__content\s*\{[\s\S]*max-width:\s*1320px/)
    expect(desktopCss).toMatch(/\.quem-somos-story-copy\s*\{[\s\S]*font-size:\s*clamp\(1\.8rem,\s*2\.8vw,\s*3\.2rem\);[\s\S]*line-height:\s*1\.26;[\s\S]*text-align:\s*justify/)
  })

  it('keeps the pillars rail accessible and updates its panel from the keyboard', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><QuemSomos /></MemoryRouter>)

    const tecnologia = screen.getByRole('button', { name: 'Tecnologia' })
    expect(tecnologia).toHaveAttribute('type', 'button')
    expect(tecnologia).toHaveAttribute('aria-pressed', 'false')
    tecnologia.focus()
    await user.keyboard('{Enter}')
    expect(tecnologia).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('quem-somos-pillars-panel')).toHaveTextContent('Amplia produtividade, controle e inteligência')

    const academia = screen.getByRole('button', { name: 'Academia' })
    academia.focus()
    await user.keyboard(' ')
    expect(academia).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('quem-somos-pillars-panel')).toHaveTextContent('Transforma consultores em instrutores')

    expect(indexCss).toMatch(/\.quem-somos-pillars__heading\s*\{[\s\S]*max-width:\s*36rem;[\s\S]*text-align:\s*left/)
    expect(indexCss).toMatch(/\.quem-somos-pillars__rail\s*\{[\s\S]*gap:\s*0\.75rem;[\s\S]*overflow-x:\s*auto;[\s\S]*scroll-snap-type:\s*x\s+mandatory/)
    expect(indexCss).toMatch(/\.quem-somos-pillars__card\s*\{[\s\S]*min-width:\s*14rem;[\s\S]*scroll-snap-align:\s*start/)
    expect(indexCss).toMatch(/\.quem-somos-pillars__card:focus-visible\s*\{[\s\S]*box-shadow:\s*inset\s+0\s+0\s+0\s+2px\s+#5a6572/)
    expect(indexCss).toMatch(/\.quem-somos-pillars__panel\s*\{[\s\S]*max-width:\s*36rem;[\s\S]*margin:\s*3rem\s+auto\s+0;[\s\S]*padding-top:\s*2\.5rem/)
  })

  it('centers the strategy column and preserves left-aligned mobile actions', () => {
    render(<MemoryRouter><QuemSomos /></MemoryRouter>)

    expect(screen.getByTestId('quem-somos-strategy').querySelector('.quem-somos-strategy__content')).toBeInTheDocument()
    expect(indexCss).toMatch(/\.quem-somos-strategy__content\s*\{[\s\S]*max-width:\s*36rem;[\s\S]*margin-inline:\s*auto;[\s\S]*text-align:\s*left/)
    expect(indexCss).toMatch(/\.quem-somos-section-title\s*\{[\s\S]*font-size:\s*clamp\(2\.25rem,\s*10vw,\s*3\.35rem\)/)
    expect(indexCss).toMatch(/\.quem-somos-strategy__items\s*\{[\s\S]*gap:\s*1\.5rem/)
    expect(indexCss).toMatch(/\.quem-somos-strategy__item\s*\{[\s\S]*gap:\s*1\.25rem/)
    expect(indexCss).toMatch(/\.quem-somos-strategy__marker\s*\{[\s\S]*width:\s*0\.65rem;[\s\S]*height:\s*0\.65rem/)
    expect(indexCss).toMatch(/\.quem-somos-mobile-action\s*\{[\s\S]*width:\s*100%/)
    expect(readMediaBlock(indexCss, '(min-width: 640px)')).toMatch(/\.quem-somos-mobile-action\s*\{[\s\S]*width:\s*auto/)
  })

  it('refines the mobile mission and consultant reading columns', () => {
    render(<MemoryRouter><QuemSomos /></MemoryRouter>)

    expect(screen.getByTestId('quem-somos-mission').querySelector('.quem-somos-mission__content')).toBeInTheDocument()
    expect(screen.getByTestId('quem-somos-consultants').querySelector('.quem-somos-consultants__content')).toBeInTheDocument()
    expect(indexCss).toMatch(/\.quem-somos-mission__content\s*\{[\s\S]*max-width:\s*36rem;[\s\S]*margin-inline:\s*auto;[\s\S]*text-align:\s*center/)
    expect(indexCss).toMatch(/\.quem-somos-mission__quote\s*\{[\s\S]*font-size:\s*clamp\(1\.75rem,\s*7vw,\s*2\.35rem\);[\s\S]*line-height:\s*1\.32/)
    expect(indexCss).toMatch(/\.quem-somos-consultants__content\s*\{[\s\S]*max-width:\s*36rem;[\s\S]*margin-inline:\s*auto;[\s\S]*text-align:\s*left/)
    expect(indexCss).toMatch(/\.quem-somos-consultants__copy\s*\{[\s\S]*gap:\s*1\.25rem;[\s\S]*line-height:\s*1\.65/)
  })

  it('uses the home hero image reveal animation on the about hero background', () => {
    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('quem-somos-hero-background')).toHaveClass('quem-somos-hero__photo')
  })

  it('preserves the legacy about-page content in the refreshed layout', () => {
    render(
      <MemoryRouter>
        <QuemSomos />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Quem somos' })).toBeInTheDocument()
    expect(screen.queryByText('Desde 1990')).not.toBeInTheDocument()
    expect(screen.queryByAltText('Otimiza')).not.toBeInTheDocument()
    expect(screen.getByText(/A Otimiza Consultoria nasceu em Caxias do Sul, em 1990/i)).toBeInTheDocument()
    expect(screen.getByTestId('quem-somos-client-logo-carousel')).toBeInTheDocument()
    expect(screen.getAllByAltText('Moneo').length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/Uma equipe multidisciplinar de consultores seniores/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/conduzimos transformações práticas no negócio/i)).toBeInTheDocument()
    expect(screen.queryByText('História')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Uma consultoria formada pela prática.' })).not.toBeInTheDocument()
    expect(screen.getByText(/Somos sustentados por três vértices de atuação/i)).toBeInTheDocument()

    expect(screen.getAllByRole('heading', { name: 'Consultoria' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Tecnologia' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Academia' })).toBeInTheDocument()
    expect(screen.getByText(/Leva as melhores/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Tecnologia/i }))
    expect(screen.getByText(/Amplia produtividade/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Academia/i }))
    expect(screen.getByText(/Transforma consultores/i)).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Estratégia' })).toBeInTheDocument()
    expect(screen.getByText(/Transformação dos modelos de negócio/i)).toBeInTheDocument()
    expect(screen.getByText(/Realização de eventos que entreguem eficácia/i)).toBeInTheDocument()

    expect(screen.getByText(/Contribuir para o crescimento e a solidez dos clientes/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Consultores' })).toBeInTheDocument()
    expect(screen.getByText(/Certificações - CBPP/i)).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Entre em contato' })).toHaveAttribute('href', '/contato')
    expect(screen.getByRole('link', { name: 'Acesse nosso LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/company/otimiza-consultoria',
    )
  })
})
