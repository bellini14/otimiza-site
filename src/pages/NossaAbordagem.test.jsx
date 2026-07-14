import { readFileSync } from 'node:fs'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import NossaAbordagem from './NossaAbordagem'
import { client } from '../lib/sanity'

vi.mock('../lib/sanity', () => ({
  client: {
    fetch: vi.fn(),
  },
  urlFor: (source) => ({
    ignoreImageParams: () => ({
      width: () => ({
        fit: () => ({
          url: () => source?.assetUrl || source?.asset?._ref || source,
        }),
      }),
    }),
  }),
}))

const siteCss = () => readFileSync('src/index.css', 'utf8')
const cssBlock = (selector) => {
  const css = siteCss()
  const start = css.indexOf(`${selector} {`)
  if (start === -1) return ''
  const bodyStart = css.indexOf('{', start) + 1
  const bodyEnd = css.indexOf('}', bodyStart)
  return css.slice(bodyStart, bodyEnd)
}

const originalIntersectionObserver = globalThis.IntersectionObserver
const originalMatchMedia = window.matchMedia
let intersectionObservers = []

class ControlledIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback
    this.options = options
    intersectionObservers.push(this)
  }

  observe(element) {
    this.element = element
    this.elements = [...(this.elements || []), element]
  }

  unobserve(element) {
    this.elements = (this.elements || []).filter((observedElement) => observedElement !== element)
  }

  disconnect() {}
}

afterEach(() => {
  cleanup()
  document.documentElement.classList.remove('nossa-abordagem-white-background')
  globalThis.IntersectionObserver = originalIntersectionObserver
  window.matchMedia = originalMatchMedia
  intersectionObservers = []
  vi.clearAllMocks()
})

describe('NossaAbordagem', () => {
  it('renders each PDF page as one content block', () => {
    render(<NossaAbordagem />)

    expect(document.documentElement).toHaveClass('nossa-abordagem-white-background')
    expect(screen.getByRole('heading', { name: 'Nossa abordagem' })).toBeInTheDocument()
    expect(screen.getAllByTestId('nossa-abordagem-block')).toHaveLength(9)
    const editorialQuote = screen.getByTestId('nossa-abordagem-editorial-quote')
    expect(editorialQuote.tagName).toBe('SECTION')
    expect(editorialQuote).toHaveAttribute('aria-labelledby', 'nossa-abordagem-editorial-quote-title')
    expect(within(editorialQuote).getByText('A consultoria que vai lá e faz.')).toHaveAttribute(
      'id',
      'nossa-abordagem-editorial-quote-title',
    )
    expect(editorialQuote.querySelector('blockquote')).toHaveTextContent(/Atemporal é o humano/i)
    expect(editorialQuote.querySelector('blockquote')).toHaveTextContent(/Criar o Atemporal é projetar/i)
    expect(editorialQuote.querySelector('blockquote')).not.toHaveTextContent(/Há 35 anos/i)
    expect(editorialQuote.querySelector('footer')).toHaveTextContent('Silvana Tiburi Bettiol')
    expect(editorialQuote.querySelector('footer')).toHaveTextContent('Fundadora, Diretora e Consultora')
    expect(cssBlock('.nossa-abordagem-editorial-quote')).toMatch(/padding:\s*5rem 1\.5rem;/)
    expect(cssBlock('.nossa-abordagem-editorial-quote')).toMatch(/gap:\s*3\.5rem;/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__opening')).toMatch(/font-size:\s*clamp\(2\.25rem,\s*10vw,\s*3\.25rem\);/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__opening')).toMatch(/line-height:\s*0\.98;/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__opening')).toMatch(/align-content:\s*start;/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__manifesto')).toMatch(/max-width:\s*32rem;/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__manifesto')).toMatch(/border-left:\s*1px solid var\(--brand-red\);/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__manifesto')).toMatch(/font-size:\s*clamp\(1\.1rem,\s*4\.8vw,\s*1\.3rem\);/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__manifesto')).toMatch(/line-height:\s*1\.55;/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__signature')).toMatch(/gap:\s*0\.35rem;/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__name')).toMatch(/font-size:\s*1\.05rem;/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__role')).toMatch(/font-size:\s*0\.9rem;/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__name')).toMatch(/line-height:\s*1\.35;/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__role')).toMatch(/line-height:\s*1\.35;/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__group')).toMatch(/opacity:\s*0;/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__group')).toMatch(/transform:\s*translateY\(1\.25rem\);/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__group')).toMatch(/opacity 700ms cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__group')).toMatch(/transform 760ms cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)/)
    expect(cssBlock('.nossa-abordagem-editorial-quote--visible .nossa-abordagem-editorial-quote__group')).toMatch(/opacity:\s*1;/)
    expect(cssBlock('.nossa-abordagem-editorial-quote--visible .nossa-abordagem-editorial-quote__group')).toMatch(/transform:\s*translateY\(0\);/)
    expect(cssBlock('.nossa-abordagem-editorial-quote__signature')).not.toMatch(/transition-delay:/)
    expect(siteCss()).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.nossa-abordagem-editorial-quote__group\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*none;[^}]*transition:\s*none;/)
    expect(siteCss()).toMatch(/@media\s*\(min-width:\s*768px\)[\s\S]*?\.nossa-abordagem-editorial-quote\s*\{[^}]*padding:\s*clamp\(6rem,\s*9vw,\s*9rem\) 1\.5rem;/)
    expect(screen.queryByText(/Página \d+/)).not.toBeInTheDocument()
  })

  it('uses the line icon as a top-left animated hero element', () => {
    const { container } = render(<NossaAbordagem />)

    expect(container.firstChild).not.toHaveClass('overflow-hidden')
    expect(screen.getAllByTestId('nossa-abordagem-block')[0]).toHaveClass('nossa-abordagem-hero')
    expect(screen.getAllByTestId('nossa-abordagem-block')[0]).toHaveAttribute('data-hero-block', 'true')
    expect(screen.getByTestId('nossa-abordagem-hero-content')).toHaveClass('nossa-abordagem-hero__content')
    expect(screen.getByTestId('nossa-abordagem-hero-content')).toHaveClass('items-center', 'justify-center')
    expect(screen.getByRole('heading', { name: 'Nossa abordagem' })).toHaveClass('split-parent')
    expect(screen.getByRole('heading', { name: 'Nossa abordagem' })).toHaveAttribute('data-split-delay', '100')
    expect(screen.getByRole('heading', { name: 'Nossa abordagem' })).toHaveAttribute('data-split-duration', '0.6')
    expect(screen.getByTestId('nossa-abordagem-hero-icon')).toHaveClass(
      'nossa-abordagem-hero__icon',
      'nossa-abordagem-hero__icon--top-left',
      'home-hero__blob',
    )
    expect(screen.getByRole('heading', { name: 'Nossa abordagem' })).toHaveClass(
      'nossa-abordagem-hero__title',
      'internal-page-title',
    )
    expect(container.querySelector('.nossa-abordagem-hero__title-soft')).not.toBeInTheDocument()
    expect(container.querySelector('.nossa-abordagem-hero__title-strong')).not.toBeInTheDocument()
  })

  it('keeps the hero composition cropped at the top with a larger readable title', () => {
    expect(cssBlock('.nossa-abordagem-hero')).toMatch(/background:\s*#ffffff;/)
    expect(cssBlock('.nossa-abordagem-hero')).toMatch(/color:\s*var\(--brand-ink\);/)
    expect(cssBlock('.nossa-abordagem-hero__icon')).toMatch(/top:\s*0;/)
    expect(cssBlock('.nossa-abordagem-hero__icon')).toMatch(/left:\s*0;/)
    expect(cssBlock('.nossa-abordagem-hero__icon')).toMatch(/display:\s*block;/)
    expect(cssBlock('.nossa-abordagem-hero__icon')).toMatch(/width:\s*100vw;/)
    expect(cssBlock('.nossa-abordagem-hero__icon')).toMatch(/--nossa-abordagem-icon-to-transform:\s*translate\(-5%,\s*-3%\) scale\(1\) rotate\(0deg\);/)
    expect(cssBlock('.nossa-abordagem-hero__title')).toMatch(/color:\s*var\(--brand-ink\);/)
    expect(cssBlock('.nossa-abordagem-hero__title')).toMatch(/padding-bottom:\s*0\.12em;/)
    expect(cssBlock('.internal-page-title')).toMatch(/font-size:\s*clamp\(4\.35rem,\s*8\.35vw,\s*7\.35rem\);/)
    expect(cssBlock('.internal-page-title')).toMatch(/line-height:\s*0\.92;/)
    expect(cssBlock('.nossa-abordagem-hero__title > span:nth-of-type(2) .split-char')).toMatch(/font-weight:\s*500;/)
    expect(siteCss()).toMatch(/@media\s*\(max-width:\s*639px\)\s*\{[^}]*\.nossa-abordagem-hero__icon\s*\{[^}]*--nossa-abordagem-icon-to-transform:\s*translate\(-57%,\s*9%\) scale\(1\.78\) rotate\(0deg\);[^}]*width:\s*154vw;[^}]*max-width:\s*none;[\s\S]*\.nossa-abordagem-hero__title\s*\{[^}]*font-size:\s*clamp\(3\.45rem,\s*15\.8vw,\s*3\.95rem\);/s)
    expect(siteCss()).toMatch(/@keyframes\s+nossa-abordagem-blob-slide-in\s*\{[\s\S]*transform:\s*var\(--nossa-abordagem-icon-from-transform\);[\s\S]*opacity:\s*var\(--nossa-abordagem-icon-opacity\);[\s\S]*transform:\s*var\(--nossa-abordagem-icon-to-transform\);/)
  })

  it('renders the timeless statement as an image-backed composition with boxed text', () => {
    render(<NossaAbordagem />)

    const timelessBlock = screen.getAllByTestId('nossa-abordagem-block')[1]
    expect(timelessBlock).toHaveClass('nossa-abordagem-timeless')
    expect(screen.getByTestId('nossa-abordagem-timeless-image')).toHaveAttribute('src', expect.stringContaining('shutterstock_2714404709-optimized'))
    expect(screen.getByTestId('nossa-abordagem-timeless-title')).toHaveClass('nossa-abordagem-timeless__title-box')
    expect(screen.getAllByTestId('nossa-abordagem-timeless-line-group')).toHaveLength(3)
    expect(screen.getAllByTestId('nossa-abordagem-timeless-line')).toHaveLength(7)
    expect(screen.getByText('Um compromisso com o que é relevante,').closest('p')).toHaveClass('nossa-abordagem-timeless__line--desktop-only')
    expect(screen.getByText('mesmo quando tudo muda.').closest('p')).toHaveClass('nossa-abordagem-timeless__line--desktop-only')
    expect(screen.getByTestId('nossa-abordagem-timeless-title')).toHaveStyle({ '--timeless-reveal-delay': '0ms' })

    expect(cssBlock('.nossa-abordagem-timeless')).toMatch(/min-height:\s*clamp\(34rem,\s*78svh,\s*48rem\);/)
    expect(cssBlock('.nossa-abordagem-timeless__content')).toMatch(/width:\s*min\(100%,\s*1320px\);/)
    expect(cssBlock('.nossa-abordagem-timeless__content')).toMatch(/margin:\s*0 auto;/)
    expect(cssBlock('.nossa-abordagem-timeless__content')).toMatch(/align-items:\s*center;/)
    expect(cssBlock('.nossa-abordagem-timeless__content')).toMatch(/justify-content:\s*center;/)
    expect(cssBlock('.nossa-abordagem-timeless__content')).toMatch(/padding:\s*clamp\(3rem,\s*7vw,\s*5rem\) 0\.4375rem;/)
    expect(cssBlock('.nossa-abordagem-timeless__title-box')).toMatch(/background:\s*#ffffff;/)
    expect(cssBlock('.nossa-abordagem-timeless__lines')).toMatch(/gap:\s*clamp\(1rem,\s*2vw,\s*1\.55rem\);/)
    expect(cssBlock('.nossa-abordagem-timeless__line-group')).toMatch(/gap:\s*clamp\(0\.38rem,\s*0\.9vw,\s*0\.68rem\);/)
    expect(cssBlock('.nossa-abordagem-timeless__line-group--long')).toMatch(/align-items:\s*center;/)
    expect(cssBlock('.nossa-abordagem-timeless__line-group--long')).toMatch(/gap:\s*clamp\(0\.22rem,\s*0\.55vw,\s*0\.42rem\);/)
    expect(cssBlock('.nossa-abordagem-timeless__line')).toMatch(/line-height:\s*1;/)
    expect(cssBlock('.nossa-abordagem-timeless__line')).toMatch(/font-weight:\s*200;/)
    expect(cssBlock('.nossa-abordagem-timeless__line span')).toMatch(/display:\s*block;/)
    expect(cssBlock('.nossa-abordagem-timeless__line span')).toMatch(/box-decoration-break:\s*clone;/)
    expect(cssBlock('.nossa-abordagem-timeless__line--dark span')).toMatch(/background:\s*var\(--brand-ink\);/)
    expect(cssBlock('.nossa-abordagem-timeless__line--desktop-only')).toMatch(/display:\s*none;/)
    expect(siteCss()).toMatch(/@media\s*\(max-width:\s*767px\)\s*\{[\s\S]*\.nossa-abordagem-timeless__content\s*\{[^}]*align-items:\s*center;[^}]*justify-content:\s*center;[^}]*padding:\s*clamp\(3rem,\s*9vw,\s*5rem\) 1rem;[^}]*text-align:\s*center;[\s\S]*\.nossa-abordagem-timeless__lines\s*\{[^}]*align-items:\s*center;[\s\S]*\.nossa-abordagem-timeless__line-group\s*\{[^}]*align-items:\s*center;/s)
    expect(siteCss()).toMatch(/@media\s*\(min-width:\s*768px\)\s*\{[^}]*\.nossa-abordagem-timeless__line--desktop-only[^}]*\}[^}]*\.nossa-abordagem-timeless__line--mobile-only[^}]*\}[^}]*\.nossa-abordagem-timeless__line--long\s*\{[^}]*max-width:\s*none;/s)
    expect(siteCss()).toMatch(/\.nossa-abordagem-timeless--reveal-ready\s+:is\(\s*\.nossa-abordagem-timeless__title-box,\s*\.nossa-abordagem-timeless__line\s*\)\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translateX\(clamp\(2rem,\s*8vw,\s*6rem\)\);/s)
    expect(siteCss()).toMatch(/\.nossa-abordagem-timeless--revealed\s+:is\(\s*\.nossa-abordagem-timeless__title-box,\s*\.nossa-abordagem-timeless__line\s*\)\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*translateX\(0\);/s)
    expect(siteCss()).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.nossa-abordagem-timeless--reveal-ready\s+:is\(/)
  })

  it('keeps the multi-tempo list block height while reducing its text scale', () => {
    render(<NossaAbordagem />)

    const listBlock = screen.getAllByTestId('nossa-abordagem-block')[2]
    const firstLine = listBlock.querySelector('p')
    expect(listBlock).toHaveClass('nossa-abordagem-list-block')
    expect(firstLine).toHaveClass(
      'text-[clamp(1.35rem,2.05vw,2.2rem)]',
      'leading-[1.22]',
    )
    expect(cssBlock('.nossa-abordagem-list-block')).toMatch(/min-height:\s*clamp\(34rem,\s*70svh,\s*44rem\);/)
    expect(cssBlock('.nossa-abordagem-list-block')).toMatch(/align-items:\s*center;/)
    expect(cssBlock('.nossa-abordagem-list-block > .min-w-0')).toMatch(/width:\s*min\(calc\(100% - 4rem\),\s*70rem\);/)
    expect(cssBlock('.nossa-abordagem-list-block > .min-w-0')).toMatch(/margin:\s*0 auto;/)
  })

  it('uses the criar o atemporal image as the first comparison section background', () => {
    render(<NossaAbordagem />)

    const comparisonBlock = screen.getAllByTestId('nossa-abordagem-block')[3]
    expect(comparisonBlock).toHaveClass('nossa-abordagem-comparison-backdrop')
    expect(comparisonBlock.getAttribute('style')).toContain('criar%20o%20atemporal.webp')
    expect(screen.getByRole('heading', { name: 'Criar o atemporal:' }).closest('section')).toHaveClass(
      'nossa-abordagem-comparison-panel--image-backed',
    )
    expect(screen.getByRole('heading', { name: 'O atemporal não é:' }).closest('section')).toHaveClass(
      'nossa-abordagem-comparison-panel--image-backed',
    )
    expect(cssBlock('.nossa-abordagem-comparison-backdrop::before')).toMatch(/background-image:\s*var\(--comparison-background-image\);/)
    expect(cssBlock('.nossa-abordagem-comparison-backdrop::before')).toMatch(/z-index:\s*0;/)
    expect(cssBlock('.nossa-abordagem-comparison-backdrop')).toMatch(/width:\s*100vw;/)
    expect(cssBlock('.nossa-abordagem-comparison-backdrop')).toMatch(/margin-left:\s*calc\(50% - 50vw\);/)
    expect(cssBlock('.nossa-abordagem-comparison-backdrop::before')).toMatch(/width:\s*100vw;/)
    expect(cssBlock('.nossa-abordagem-comparison-backdrop > .min-w-0')).toMatch(/width:\s*min\(calc\(100% - 3rem\),\s*82rem\);/)
    expect(cssBlock('.nossa-abordagem-comparison-backdrop > .min-w-0')).toMatch(/margin:\s*0 auto;/)
    expect(cssBlock('.nossa-abordagem-comparison-backdrop::before')).toMatch(/opacity:\s*1;/)
    expect(cssBlock('.nossa-abordagem-comparison-backdrop::before')).not.toMatch(/filter:/)
    expect(cssBlock('.nossa-abordagem-comparison-backdrop::after')).toMatch(/background:\s*linear-gradient\(/)
    expect(cssBlock('.nossa-abordagem-comparison-panel--image-backed')).toMatch(/background:\s*transparent;/)
  })

  it('forces the route background surfaces to white', () => {
    const css = siteCss()

    expect(css).toMatch(/html\.nossa-abordagem-white-background,\s*html\.nossa-abordagem-white-background body\s*\{[^}]*background:\s*#ffffff/s)
    expect(css).not.toMatch(/html\.nossa-abordagem-white-background \.page-curtain[\s\S]*?background:\s*#ffffff/)
    expect(css).toMatch(/html\.nossa-abordagem-white-background \.site-footer\s*\{[^}]*background:\s*#ffffff/s)
    expect(css).not.toMatch(/html\.nossa-abordagem-white-background\s+footer\s*\{/)
    expect(css).not.toMatch(/html\.nossa-abordagem-white-background \.site-footer > div\s*\{[^}]*background:\s*#ffffff/s)
  })

  it('preserves representative text from the PDF content', () => {
    render(<NossaAbordagem />)

    expect(screen.getAllByText('Criar o Atemporal').length).toBeGreaterThan(0)
    expect(screen.getByText('A visão da Otimiza sobre valor')).toBeInTheDocument()
    expect(screen.getByText(/Mais de 1\.000 clientes atendidos/i)).toBeInTheDocument()
    expect(screen.getByText('Decidir melhor agora')).toBeInTheDocument()
    expect(screen.getByText('Por que não?')).toBeInTheDocument()
  })

  it('turns the closing statement into a responsive contact CTA', () => {
    render(<NossaAbordagem />)

    const closing = screen.getByTestId('nossa-abordagem-closing')
    const closingArticle = closing.closest('article')
    const heading = within(closing).getByRole('heading', { name: 'Decidir melhor agora' })
    const cta = within(closing).getByRole('link', { name: 'Por que não? Fale com a Otimiza' })
    const labels = cta.querySelector('.nossa-abordagem-closing__labels')
    const arrow = cta.querySelector('.nossa-abordagem-closing__arrow')
    const idleLabel = cta.querySelector('.nossa-abordagem-closing__label--idle')
    const activeLabel = cta.querySelector('.nossa-abordagem-closing__label--active')
    const idleChars = idleLabel?.querySelectorAll('.nossa-abordagem-closing__label-char')
    const activeChars = activeLabel?.querySelectorAll('.nossa-abordagem-closing__label-char')
    const css = siteCss()

    expect(closing.tagName).toBe('SECTION')
    expect(closing).toHaveAttribute('aria-labelledby', 'nossa-abordagem-closing-title')
    expect(heading).toHaveAttribute('id', 'nossa-abordagem-closing-title')
    expect(heading).toHaveClass('nossa-abordagem-closing__title', 'font-display')
    expect(cta).toHaveAttribute('href', '/contato')
    expect(cta).toHaveClass('nossa-abordagem-closing__cta')
    expect(idleLabel).toHaveTextContent('Por que não?')
    expect(activeLabel).toHaveTextContent('Fale com a Otimiza')
    expect(idleChars).toHaveLength(Array.from('Por que não?').length)
    expect(activeChars).toHaveLength(Array.from('Fale com a Otimiza').length)
    expect(idleChars?.[0]).toHaveStyle({ '--closing-char-index': '0' })
    expect(activeChars?.[1]).toHaveStyle({ '--closing-char-index': '1' })
    expect(labels).toHaveAttribute('aria-hidden', 'true')
    expect(arrow).toHaveAttribute('aria-hidden', 'true')
    expect(arrow?.querySelector('svg')).toHaveClass('lucide-arrow-right')
    expect(within(closing).getAllByRole('link')).toHaveLength(1)
    expect(within(closing).queryByRole('button')).not.toBeInTheDocument()
    expect(closing.querySelector('.nossa-abordagem-closing__prompt')).not.toBeInTheDocument()
    expect(closingArticle).toHaveClass('nossa-abordagem-closing-block', 'py-0', 'sm:py-20', 'lg:py-24')

    expect(cssBlock('.nossa-abordagem-closing')).toMatch(/min-height:\s*36rem;/)
    expect(cssBlock('.nossa-abordagem-closing')).toMatch(/padding:\s*3\.5rem 1\.75rem;/)
    expect(cssBlock('.nossa-abordagem-closing')).toMatch(/background:\s*#ffffff;/)
    expect(cssBlock('.nossa-abordagem-closing__title')).toMatch(/font-size:\s*clamp\(4rem,\s*9vw,\s*9rem\);/)
    expect(cssBlock('.nossa-abordagem-closing__title')).toMatch(/font-weight:\s*300;/)
    expect(cssBlock('.nossa-abordagem-closing__title')).toMatch(/line-height:\s*1;/)
    expect(cssBlock('.nossa-abordagem-closing__title')).toMatch(/color:\s*#39424c;/)
    expect(cssBlock('.nossa-abordagem-closing__cta')).toMatch(/display:\s*inline-flex;/)
    expect(cssBlock('.nossa-abordagem-closing__cta')).toMatch(/max-width:\s*100%;/)
    expect(cssBlock('.nossa-abordagem-closing__cta')).not.toMatch(/(?:^|\s)width:\s*100%;/)
    expect(cssBlock('.nossa-abordagem-closing__cta')).toMatch(/margin-top:\s*2\.5rem;/)
    expect(cssBlock('.nossa-abordagem-closing__cta')).toMatch(/gap:\s*0\.06em;/)
    expect(cssBlock('.nossa-abordagem-closing__cta')).toMatch(/padding:\s*0\.04em 0 0\.08em;/)
    expect(cssBlock('.nossa-abordagem-closing__cta')).toMatch(/border-bottom:\s*1px solid currentColor;/)
    expect(cssBlock('.nossa-abordagem-closing__cta')).toMatch(/background:\s*transparent;/)
    expect(cssBlock('.nossa-abordagem-closing__cta')).toMatch(/font-size:\s*clamp\(2\.2rem,\s*5vw,\s*5\.8rem\);/)
    expect(cssBlock('.nossa-abordagem-closing__labels')).toMatch(/position:\s*relative;/)
    expect(cssBlock('.nossa-abordagem-closing__labels')).toMatch(/overflow:\s*hidden;/)
    expect(cssBlock('.nossa-abordagem-closing__labels')).toMatch(/height:\s*1\.16em;/)
    expect(cssBlock('.nossa-abordagem-closing__labels')).toMatch(/padding-inline:\s*0\.12em;/)
    expect(cssBlock('.nossa-abordagem-closing__labels')).toMatch(/box-sizing:\s*content-box;/)
    expect(cssBlock('.nossa-abordagem-closing__labels')).toMatch(/width:\s*var\(--closing-label-idle-width,\s*7\.25ch\);/)
    expect(cssBlock('.nossa-abordagem-closing__labels')).toMatch(/width 360ms cubic-bezier\(0\.165,\s*0\.84,\s*0\.44,\s*1\)/)
    expect(css).toMatch(/\.nossa-abordagem-closing__cta:hover \.nossa-abordagem-closing__labels,\s*\.nossa-abordagem-closing__cta:focus-visible \.nossa-abordagem-closing__labels\s*\{[^}]*width:\s*var\(--closing-label-active-width,\s*14\.5ch\);/)
    expect(cssBlock('.nossa-abordagem-closing__label')).toMatch(/position:\s*absolute;/)
    expect(cssBlock('.nossa-abordagem-closing__label')).toMatch(/white-space:\s*nowrap;/)
    expect(cssBlock('.nossa-abordagem-closing__label--idle .nossa-abordagem-closing__label-char')).toMatch(/transform 360ms cubic-bezier\(0\.165,\s*0\.84,\s*0\.44,\s*1\)/)
    expect(cssBlock('.nossa-abordagem-closing__label--idle .nossa-abordagem-closing__label-char')).toMatch(/opacity 180ms ease-out/)
    expect(cssBlock('.nossa-abordagem-closing__label--idle .nossa-abordagem-closing__label-char')).toMatch(/transition-delay:\s*calc\(55ms \+ \(var\(--closing-char-index\) \* 7ms\)\),\s*calc\(200ms \+ \(var\(--closing-char-index\) \* 5ms\)\);/)
    expect(cssBlock('.nossa-abordagem-closing__label--active .nossa-abordagem-closing__label-char')).toMatch(/transform 280ms cubic-bezier\(0\.165,\s*0\.84,\s*0\.44,\s*1\)/)
    expect(cssBlock('.nossa-abordagem-closing__label--active .nossa-abordagem-closing__label-char')).toMatch(/opacity 110ms ease-out/)
    expect(cssBlock('.nossa-abordagem-closing__label--active .nossa-abordagem-closing__label-char')).toMatch(/calc\(var\(--closing-char-index\) \* 5ms\)/)
    expect(cssBlock('.nossa-abordagem-closing__label--active .nossa-abordagem-closing__label-char')).toMatch(/transform:\s*translateY\(40px\);/)
    expect(cssBlock('.nossa-abordagem-closing__label--active .nossa-abordagem-closing__label-char')).toMatch(/opacity:\s*0;/)
    expect(css).toMatch(/\.nossa-abordagem-closing__cta:hover \.nossa-abordagem-closing__label--idle \.nossa-abordagem-closing__label-char,[\s\S]*?\{[^}]*transform:\s*translateY\(-40px\);[^}]*opacity:\s*0;/)
    expect(css).toMatch(/\.nossa-abordagem-closing__cta:hover \.nossa-abordagem-closing__label--active \.nossa-abordagem-closing__label-char,[\s\S]*?\{[^}]*transform:\s*translateY\(0\);[^}]*opacity:\s*1;/)
    expect(css).toMatch(/\.nossa-abordagem-closing__cta:hover \.nossa-abordagem-closing__label--idle \.nossa-abordagem-closing__label-char,[\s\S]*?\{[^}]*transition:[^}]*transform 280ms[^}]*opacity 110ms ease-out;[^}]*transition-delay:\s*calc\(var\(--closing-char-index\) \* 5ms\);/)
    expect(css).toMatch(/\.nossa-abordagem-closing__cta:hover \.nossa-abordagem-closing__label--active \.nossa-abordagem-closing__label-char,[\s\S]*?\{[^}]*transition:[^}]*transform 360ms[^}]*opacity 180ms ease-out;[^}]*transition-delay:\s*calc\(55ms \+ \(var\(--closing-char-index\) \* 7ms\)\),\s*calc\(170ms \+ \(var\(--closing-char-index\) \* 5ms\)\);/)
    expect(cssBlock('.nossa-abordagem-closing__arrow svg')).toMatch(/width:\s*0\.34em;/)
    expect(cssBlock('.nossa-abordagem-closing__arrow svg')).toMatch(/stroke-width:\s*1\.7;/)
    expect(cssBlock('.nossa-abordagem-closing__cta:focus-visible')).toMatch(/outline:\s*2px solid var\(--brand-red\);/)
    expect(cssBlock('.nossa-abordagem-closing__cta:focus-visible')).toMatch(/outline-offset:\s*4px;/)
    expect(css).toMatch(/@media\s*\(min-width:\s*640px\)[\s\S]*?\.nossa-abordagem-closing\s*\{[^}]*padding-inline:\s*3rem;/)
    expect(css).toMatch(/@media\s*\(min-width:\s*1024px\)[\s\S]*?\.nossa-abordagem-closing\s*\{[^}]*padding-inline:\s*4rem;/)
    expect(css).toMatch(/@media\s*\(max-width:\s*639px\)[\s\S]*?\.nossa-abordagem-closing__cta\s*\{[^}]*margin-top:\s*1\.5rem;[^}]*font-size:\s*clamp\(1\.65rem,\s*8\.2vw,\s*2\.6rem\);/)
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.nossa-abordagem-closing__labels,\s*\.nossa-abordagem-closing__label-char\s*\{[^}]*transition:\s*none;/)
  })

  it('sets the 1990 metric text inside a gray menu-width page shell', () => {
    globalThis.IntersectionObserver = ControlledIntersectionObserver

    render(<NossaAbordagem />)

    const metricText = screen.getByTestId('nossa-abordagem-metric-text')
    const metricShell = metricText.closest('div')
    const metricBlock = metricText.closest('article')
    const jobsTerm = screen.getByTestId('jobs-to-be-done-term')
    const underlinedJobsText = screen.getByTestId('jobs-to-be-done-underlined-text')
    const jobsTooltip = screen.getByTestId('jobs-to-be-done-tooltip')
    const modalPanelCss = cssBlock('.jobs-to-be-done-modal__panel')

    expect(metricText).toHaveTextContent(/jobs to be done/i)
    expect(metricText).not.toHaveTextContent(/foco do cliente/i)
    expect(metricText).toHaveTextContent(/orientados por “jobs to be done”/i)
    expect(metricText).not.toHaveTextContent(/orientados pelo/i)
    expect(metricBlock).toHaveClass('bg-[#E5E9F1]', 'nossa-abordagem-metric-block')
    expect(metricBlock).toHaveClass('overflow-visible')
    expect(metricShell).toHaveClass('mx-auto', 'max-w-[1320px]', 'min-h-[36rem]', 'px-4', 'sm:px-5', 'lg:px-0')
    expect(metricShell).toHaveClass('py-20', 'sm:py-24', 'lg:py-28')
    expect(metricShell).toHaveClass('items-center')
    expect(metricText).toHaveClass(
      'nossa-abordagem-metric-copy',
      'w-full',
      'text-[clamp(2.8rem,5.3vw,6.1rem)]',
      'leading-[1.08]',
      'text-[#616B78]',
    )
    expect(metricText).not.toHaveClass('nossa-abordagem-metric-copy--visible')
    expect(metricText).not.toHaveClass('max-w-[58rem]', 'mx-auto')
    expect(cssBlock('.nossa-abordagem-metric-block')).toMatch(/width:\s*100vw;/)
    expect(cssBlock('.nossa-abordagem-metric-block')).toMatch(/margin-left:\s*calc\(50% - 50vw\);/)
    expect(cssBlock('.nossa-abordagem-metric-block')).toMatch(/margin-right:\s*calc\(50% - 50vw\);/)
    expect(cssBlock('.nossa-abordagem-metric-copy')).toMatch(/opacity:\s*0;/)
    expect(cssBlock('.nossa-abordagem-metric-copy')).toMatch(/transform:\s*translateY\(clamp\(1\.25rem,\s*3vw,\s*2\.4rem\)\);/)
    expect(cssBlock('.nossa-abordagem-metric-copy--visible')).toMatch(/opacity:\s*1;/)
    expect(cssBlock('.nossa-abordagem-metric-copy--visible')).toMatch(/transform:\s*translateY\(0\);/)
    expect(jobsTerm).toHaveClass('group/jobs-term', 'cursor-help')
    expect(jobsTerm).toHaveAttribute('role', 'button')
    expect(jobsTerm).toHaveAttribute('aria-expanded', 'false')
    expect(jobsTerm).not.toHaveClass('underline', 'border-b-[0.035em]', 'pb-[0.02em]')
    expect(underlinedJobsText).toHaveTextContent('jobs to be done')
    expect(underlinedJobsText).toHaveClass('underline', 'decoration-current', 'decoration-[0.035em]', 'underline-offset-[0.08em]')
    expect(jobsTooltip).toHaveClass('jobs-to-be-done-tooltip', 'pointer-events-none', 'absolute', 'hidden', 'sm:block', 'opacity-0', 'group-hover/jobs-term:opacity-100')
    expect(jobsTooltip).toHaveTextContent(/Jobs to be Done/i)
    expect(jobsTooltip).toHaveTextContent(/progresso que deseja alcan/i)
    expect(modalPanelCss).toMatch(/background:\s*transparent;/)
    expect(modalPanelCss).toMatch(/border:\s*0;/)
    expect(modalPanelCss).toMatch(/border-radius:\s*0;/)
    expect(modalPanelCss).toMatch(/box-shadow:\s*none;/)
    expect(siteCss()).toMatch(/@media\s*\(max-width:\s*767px\)[\s\S]*?\.jobs-to-be-done-modal\s*\{[^}]*place-items:\s*center;/)
    expect(cssBlock('.jobs-to-be-done-modal__title')).toMatch(/color:\s*#ffffff;/)
    expect(cssBlock('.jobs-to-be-done-modal__title')).toMatch(/font-size:\s*clamp\(1\.75rem,\s*7vw,\s*2rem\);/)
    expect(cssBlock('.jobs-to-be-done-modal__title')).toMatch(/line-height:\s*1\.1;/)
    expect(cssBlock('.jobs-to-be-done-modal__body')).toMatch(/color:\s*rgb\(255 255 255 \/ 0\.82\);/)
    expect(cssBlock('.jobs-to-be-done-modal__body')).toMatch(/font-size:\s*clamp\(1\.1rem,\s*4\.8vw,\s*1\.25rem\);/)
    expect(cssBlock('.jobs-to-be-done-modal__body')).toMatch(/line-height:\s*1\.55;/)
    expect(cssBlock('.jobs-to-be-done-modal__close')).toMatch(/position:\s*fixed;/)
    expect(cssBlock('.jobs-to-be-done-modal__close')).toMatch(/top:\s*max\(1\.25rem,\s*env\(safe-area-inset-top\)\);/)
    expect(cssBlock('.jobs-to-be-done-modal__close')).toMatch(/right:\s*1\.25rem;/)
    expect(cssBlock('.jobs-to-be-done-modal__close')).toMatch(/border:\s*0;/)
    expect(cssBlock('.jobs-to-be-done-modal__close')).toMatch(/border-radius:\s*0;/)
    expect(cssBlock('.jobs-to-be-done-modal__close')).toMatch(/background:\s*transparent;/)
    expect(cssBlock('.jobs-to-be-done-modal__close')).toMatch(/box-shadow:\s*none;/)
    expect(siteCss()).toMatch(/@media\s*\(max-width:\s*767px\)\s*and\s*\(max-height:\s*699px\)\s*\{[\s\S]*?\.jobs-to-be-done-modal\s*\{[^}]*place-items:\s*start center;[^}]*padding-top:\s*5rem;[^}]*padding-bottom:\s*2rem;[^}]*overflow-y:\s*auto;/)

    fireEvent.click(jobsTerm)

    expect(jobsTerm).toHaveAttribute('aria-expanded', 'true')
    expect(jobsTooltip).toHaveClass('jobs-to-be-done-tooltip--open', 'opacity-100')
    const jobsModal = screen.getByTestId('jobs-to-be-done-modal')
    expect(jobsModal).toHaveAttribute('role', 'dialog')
    expect(jobsModal.parentElement).toBe(document.body)
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))

    expect(jobsTerm).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByTestId('jobs-to-be-done-modal')).not.toBeInTheDocument()

    fireEvent.click(jobsTerm)
    expect(document.documentElement).toHaveClass('jobs-to-be-done-modal-open')

    fireEvent.pointerDown(screen.getByTestId('jobs-to-be-done-modal'))

    expect(jobsTerm).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByTestId('jobs-to-be-done-modal')).not.toBeInTheDocument()
    expect(document.documentElement).not.toHaveClass('jobs-to-be-done-modal-open')

    fireEvent.click(jobsTerm)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(jobsTerm).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByTestId('jobs-to-be-done-modal')).not.toBeInTheDocument()
    expect(document.documentElement).not.toHaveClass('jobs-to-be-done-modal-open')

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 400 })
    Object.defineProperty(jobsTooltip, 'offsetWidth', { configurable: true, value: 260 })
    Object.defineProperty(jobsTooltip, 'offsetHeight', { configurable: true, value: 120 })

    fireEvent.pointerMove(jobsTerm, { clientX: 480, clientY: 380 })

    expect(jobsTooltip).toHaveStyle({
      transform: 'translateX(206px) translateY(248px) scale(0.96)',
    })

    const metricObserver = intersectionObservers.find((observer) => observer.element === metricBlock)
    expect(metricObserver.options.rootMargin).toBe('0px 0px -20% 0px')
    expect(metricObserver.options.threshold).toBe(0.18)

    act(() => {
      metricObserver.callback([{ isIntersecting: true }])
    })

    expect(metricText).toHaveClass('nossa-abordagem-metric-copy--visible')
  })

  it('reveals the complete editorial quote together as it crosses the viewport center', () => {
    globalThis.IntersectionObserver = ControlledIntersectionObserver
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 767px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { container } = render(<NossaAbordagem />)
    const editorialQuote = screen.getByTestId('nossa-abordagem-editorial-quote')
    const groups = Array.from(container.querySelectorAll('.nossa-abordagem-editorial-quote__group'))
    const quoteObserver = intersectionObservers.find((observer) => (
      observer.options?.rootMargin === '-45% 0px -45% 0px'
      && observer.elements?.includes(editorialQuote)
    ))

    expect(groups).toHaveLength(3)
    expect(quoteObserver).toBeDefined()
    expect(quoteObserver.options.threshold).toBe(0)
    expect(editorialQuote).not.toHaveClass('nossa-abordagem-editorial-quote--visible')

    act(() => {
      quoteObserver.callback([{ target: editorialQuote, isIntersecting: true }])
    })

    expect(editorialQuote).toHaveClass('nossa-abordagem-editorial-quote--visible')
    groups.forEach((group) => expect(group).toBeInTheDocument())
  })

  it('fetches Nossa abordagem client logos from Sanity and renders them in the following carousel section', async () => {
    client.fetch.mockResolvedValue([
      {
        _id: 'moneo',
        name: 'Banco Moneo',
        logoAlt: 'Marca Banco Moneo',
        logo: { assetUrl: 'https://cdn.sanity.io/images/prod/moneo.svg' },
      },
      {
        _id: 'marcopolo',
        name: 'Marcopolo',
        logoAlt: 'Marca Marcopolo',
        logo: { assetUrl: 'https://cdn.sanity.io/images/prod/marcopolo.svg' },
      },
    ])

    render(<NossaAbordagem />)

    const carouselSection = await screen.findByTestId('nossa-abordagem-logo-carousel-section')
    const carousel = within(carouselSection).getByTestId('nossa-abordagem-logo-carousel')

    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('_type == "clientLogo"'))
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('showOnNossaAbordagem == true'))
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('logo'))
    expect(carouselSection.compareDocumentPosition(screen.getByTestId('nossa-abordagem-metric-text')) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
    expect(within(carouselSection).getByText(/Mais de 1\.000 clientes atendidos/i)).toHaveClass('nossa-abordagem-logo-carousel__intro')
    expect(await within(carousel).findByRole('img', { name: 'Marca Banco Moneo' })).toBeInTheDocument()
    expect(within(carousel).getAllByRole('img')).toHaveLength(2)
    expect(within(carousel).getByRole('img', { name: 'Marca Marcopolo' })).toBeInTheDocument()
    const rows = within(carousel)
      .getAllByTestId('nossa-abordagem-logo-carousel-row')
    expect(rows).toHaveLength(2)
    expect(rows[0].querySelectorAll('.nossa-abordagem-logo-carousel__track')).toHaveLength(2)
    expect(rows[1].querySelectorAll('.nossa-abordagem-logo-carousel__track')).toHaveLength(2)
    expect(rows[0].querySelector('.nossa-abordagem-logo-carousel__track').querySelectorAll('.nossa-abordagem-logo-carousel__pill')).toHaveLength(6)
    expect(rows[1].querySelector('.nossa-abordagem-logo-carousel__track').querySelectorAll('.nossa-abordagem-logo-carousel__pill')).toHaveLength(6)
    expect(rows[0].querySelectorAll('.nossa-abordagem-logo-carousel__track')[1]).toHaveAttribute('aria-hidden', 'true')
    expect(rows[1].querySelectorAll('.nossa-abordagem-logo-carousel__track')[1]).toHaveAttribute('aria-hidden', 'true')
    expect(rows[1].querySelector('.nossa-abordagem-logo-carousel__scroller')).toHaveClass('nossa-abordagem-logo-carousel__scroller--reverse')
    expect(carouselSection).toHaveClass('nossa-abordagem-logo-carousel-section')
    expect(carousel).toHaveClass('nossa-abordagem-logo-carousel')
    const carouselSectionCss = cssBlock('.nossa-abordagem-logo-carousel-section')
    expect(carouselSectionCss).toMatch(/background:\s*#ffffff;/)
    expect(carouselSectionCss).not.toMatch(/#E5E9F1/)
    expect(cssBlock('.nossa-abordagem-logo-carousel__viewport')).toMatch(/position:\s*relative;/)
    expect(cssBlock('.nossa-abordagem-logo-carousel__viewport')).toMatch(/width:\s*min\(calc\(100% - 2rem\),\s*1380px\);/)
    expect(cssBlock('.nossa-abordagem-logo-carousel__viewport')).toMatch(/margin:\s*0 auto;/)
    expect(cssBlock('.nossa-abordagem-logo-carousel__viewport')).toMatch(/overflow:\s*hidden;/)
    expect(cssBlock('.nossa-abordagem-logo-carousel__viewport')).toMatch(/--nossa-abordagem-logo-fade-width:\s*clamp\(120px,\s*12vw,\s*180px\);/)
    expect(cssBlock('.nossa-abordagem-logo-carousel__viewport')).toMatch(/-webkit-mask-image:\s*linear-gradient\(to right,\s*transparent 0,\s*#000 var\(--nossa-abordagem-logo-fade-width\),\s*#000 calc\(100% - var\(--nossa-abordagem-logo-fade-width\)\),\s*transparent 100%\);/)
    expect(cssBlock('.nossa-abordagem-logo-carousel__viewport')).toMatch(/mask-image:\s*linear-gradient\(to right,\s*transparent 0,\s*#000 var\(--nossa-abordagem-logo-fade-width\),\s*#000 calc\(100% - var\(--nossa-abordagem-logo-fade-width\)\),\s*transparent 100%\);/)
    expect(within(carouselSection).queryByTestId('nossa-abordagem-logo-carousel-fade')).not.toBeInTheDocument()
    expect(carouselSection.querySelector('.nossa-abordagem-logo-carousel__velocity')).not.toBeInTheDocument()
    expect(cssBlock('.nossa-abordagem-logo-carousel')).toMatch(/display:\s*grid;/)
    expect(cssBlock('.nossa-abordagem-logo-carousel')).toMatch(/gap:\s*clamp\(0\.85rem,\s*1\.8vw,\s*1\.25rem\);/)
    expect(cssBlock('.nossa-abordagem-logo-carousel')).toMatch(/padding-block:\s*0\.75rem;/)
    expect(cssBlock('.nossa-abordagem-logo-carousel__row')).toMatch(/overflow:\s*visible;/)
    expect(siteCss()).toMatch(/\.nossa-abordagem-logo-carousel__viewport::before,\s*\.nossa-abordagem-logo-carousel__viewport::after\s*\{[^}]*position:\s*absolute;[^}]*width:\s*var\(--nossa-abordagem-logo-fade-width\);[^}]*pointer-events:\s*none;[^}]*z-index:\s*4;/s)
    expect(siteCss()).toMatch(/\.nossa-abordagem-logo-carousel__viewport::before\s*\{[^}]*background:\s*linear-gradient\(to right,\s*#ffffff 0%,\s*rgb\(255 255 255 \/ 0\) 100%\);/s)
    expect(siteCss()).toMatch(/\.nossa-abordagem-logo-carousel__viewport::after\s*\{[^}]*background:\s*linear-gradient\(to left,\s*#ffffff 0%,\s*rgb\(255 255 255 \/ 0\) 100%\);/s)
    expect(cssBlock('.nossa-abordagem-logo-carousel__pill:hover')).toMatch(/box-shadow:\s*none;/)
    expect(cssBlock('.nossa-abordagem-logo-carousel__pill:hover .nossa-abordagem-logo-carousel__logo')).toMatch(/filter:\s*grayscale\(0\);/)
    expect(cssBlock('.nossa-abordagem-logo-carousel__pill:hover .nossa-abordagem-logo-carousel__logo')).toMatch(/opacity:\s*1;/)
    expect(cssBlock('.nossa-abordagem-logo-carousel__scroller')).toMatch(/animation:\s*nossa-abordagem-logo-marquee var\(--nossa-abordagem-logo-duration,\s*58s\) linear infinite;/)
    expect(cssBlock('.nossa-abordagem-logo-carousel__scroller--reverse')).toMatch(/animation-name:\s*nossa-abordagem-logo-marquee-reverse;/)
    expect(cssBlock('.nossa-abordagem-logo-carousel__track')).toMatch(/gap:\s*var\(--nossa-abordagem-logo-gap\);/)
    expect(siteCss()).toMatch(/@keyframes\s+nossa-abordagem-logo-marquee\s*\{[\s\S]*translate3d\(calc\(-50% - \(var\(--nossa-abordagem-logo-gap\) \/ 2\)\), 0, 0\)/)
    expect(siteCss()).toMatch(/@keyframes\s+nossa-abordagem-logo-marquee-reverse\s*\{[\s\S]*translate3d\(calc\(-50% - \(var\(--nossa-abordagem-logo-gap\) \/ 2\)\), 0, 0\)/)
  })

  it('keeps the Nossa abordagem logo carousel populated with fallbacks when Sanity returns no logos', async () => {
    client.fetch.mockResolvedValue([])

    render(<NossaAbordagem />)

    const carouselSection = await screen.findByTestId('nossa-abordagem-logo-carousel-section')

    expect(await within(carouselSection).findByRole('img', { name: 'Moneo' })).toBeInTheDocument()
    expect(within(carouselSection).getByRole('img', { name: 'Marcopolo' })).toBeInTheDocument()
    expect(within(carouselSection).queryByTestId('nossa-abordagem-logo-carousel-fade')).not.toBeInTheDocument()
    expect(within(carouselSection).getAllByTestId('nossa-abordagem-logo-carousel-row')).not.toHaveLength(0)
  })

  it('presents the following approach sections as a scroll-linked centered timeline', () => {
    render(<NossaAbordagem />)

    const valueVisionBlock = screen.getAllByTestId('nossa-abordagem-block')[4]
    const revealLine = screen.getByTestId('nossa-abordagem-value-vision-line')
    const revealFill = screen.getByTestId('nossa-abordagem-value-vision-line-fill')
    const steps = screen.getAllByTestId('nossa-abordagem-value-vision-step')
    const nodes = screen.getAllByTestId('nossa-abordagem-value-vision-node')

    expect(valueVisionBlock).toHaveClass('nossa-abordagem-value-vision')
    expect(valueVisionBlock.querySelector('h2')).toHaveTextContent(/Otimiza sobre valor/)
    expect(valueVisionBlock.querySelector('.nossa-abordagem-value-vision__intro')).toHaveTextContent(/produto final/)
    expect(valueVisionBlock.querySelector('.nossa-abordagem-value-vision__intro')).toHaveTextContent(/transformar/)
    expect(revealLine).toHaveClass('nossa-abordagem-value-vision__line')
    expect(revealFill).toHaveClass('nossa-abordagem-value-vision__line-fill')
    expect(steps).toHaveLength(6)
    expect(nodes).toHaveLength(6)
    expect(steps[0]).toHaveClass('nossa-abordagem-value-vision__step--left')
    expect(steps[1]).toHaveClass('nossa-abordagem-value-vision__step--right')
    expect(steps[2]).toHaveClass('nossa-abordagem-value-vision__step--left')
    expect(steps[3]).toHaveClass('nossa-abordagem-value-vision__step--right')
    expect(steps[4]).toHaveClass('nossa-abordagem-value-vision__step--left')
    expect(steps[5]).toHaveClass('nossa-abordagem-value-vision__step--right')
    expect(steps[0]).toHaveStyle({ '--value-step-delay': '0ms' })
    expect(steps[5]).toHaveStyle({ '--value-step-delay': '0ms' })
    expect(steps[0].querySelector('h3')).toHaveStyle({ '--value-content-delay': '0ms' })
    expect(valueVisionBlock.querySelector('.nossa-abordagem-value-vision__intro p')).toHaveStyle({ '--value-header-delay': '420ms' })
    expect(steps[0].querySelector('.nossa-abordagem-value-vision__copy p')).toHaveStyle({ '--value-content-delay': '420ms' })
    expect(steps[0].querySelector('h3')).toHaveTextContent('O papel da Otimiza')
    expect(steps[1].querySelector('h3')).toHaveTextContent(/Criar o atemporal/)
    expect(steps[2].querySelector('h3')).toHaveTextContent(/Tecnologia como/)
    expect(steps[3].querySelector('h3')).toHaveTextContent(/gera avan/)
    expect(steps[4].querySelector('h3')).toHaveTextContent(/tempo como/)
    expect(steps[5].querySelector('h3')).toHaveTextContent(/rela/)
    expect(steps[0]).toHaveTextContent(/concep/)
    expect(steps[1]).toHaveTextContent(/Processos que sobrevivem/)
    expect(steps[2]).toHaveTextContent(/Tecnologia/)
    expect(steps[3]).toHaveTextContent(/Clareza/)
    expect(steps[4]).toHaveTextContent(/35 anos/)
    expect(steps[5]).toHaveTextContent(/confian/)
    expect(cssBlock('.nossa-abordagem-value-vision__line')).toMatch(/background:\s*rgb\(90 101 114 \/ 0\.16\);/)
    expect(cssBlock('.nossa-abordagem-value-vision__line')).toMatch(/z-index:\s*1;/)
    expect(cssBlock('.nossa-abordagem-value-vision__line-fill')).toMatch(/background:\s*var\(--brand-red\);/)
    expect(cssBlock('.nossa-abordagem-value-vision__line-fill')).toMatch(/transform-origin:\s*top center;/)
    expect(cssBlock('.nossa-abordagem-value-vision__header :is(h2, .nossa-abordagem-value-vision__intro p)')).toMatch(/opacity:\s*0;/)
    expect(cssBlock('.nossa-abordagem-value-vision__header--active :is(h2, .nossa-abordagem-value-vision__intro p)')).toMatch(/opacity:\s*1;/)
    expect(cssBlock('.nossa-abordagem-value-vision__timeline')).toMatch(/display:\s*flex;/)
    expect(cssBlock('.nossa-abordagem-value-vision__timeline')).toMatch(/flex-direction:\s*column;/)
    expect(cssBlock('.nossa-abordagem-value-vision__timeline')).toMatch(/gap:\s*clamp\(7rem,\s*14vw,\s*12rem\);/)
    expect(cssBlock('.nossa-abordagem-value-vision__step')).toMatch(/width:\s*min\(calc\(50% - clamp\(2\.5rem,\s*5vw,\s*5rem\)\),\s*42rem\);/)
    expect(cssBlock('.nossa-abordagem-value-vision__step')).toMatch(/z-index:\s*2;/)
    expect(cssBlock('.nossa-abordagem-value-vision__step--left')).toMatch(/align-self:\s*flex-start;/)
    expect(cssBlock('.nossa-abordagem-value-vision__step--right')).toMatch(/align-self:\s*flex-end;/)
    expect(cssBlock('.nossa-abordagem-value-vision__step-inner')).toMatch(/opacity:\s*0;/)
    expect(cssBlock('.nossa-abordagem-value-vision__step--left .nossa-abordagem-value-vision__step-inner')).toMatch(/transform:\s*translateX\(clamp\(1\.75rem,\s*4vw,\s*3\.5rem\)\);/)
    expect(cssBlock('.nossa-abordagem-value-vision__step--right .nossa-abordagem-value-vision__step-inner')).toMatch(/transform:\s*translateX\(calc\(clamp\(1\.75rem,\s*4vw,\s*3\.5rem\) \* -1\)\);/)
    expect(cssBlock('.nossa-abordagem-value-vision__step--active .nossa-abordagem-value-vision__step-inner')).toMatch(/opacity:\s*1;/)
    expect(cssBlock('.nossa-abordagem-value-vision__step--active .nossa-abordagem-value-vision__step-inner')).toMatch(/transform:\s*translateX\(0\);/)
    expect(cssBlock('.nossa-abordagem-value-vision__step :is(h3, .nossa-abordagem-value-vision__copy p)')).toMatch(/transition-delay:\s*var\(--value-content-delay,\s*0ms\);/)
    expect(cssBlock('.nossa-abordagem-value-vision__node')).toMatch(/border-radius:\s*999px;/)
    expect(cssBlock('.nossa-abordagem-value-vision__node')).toMatch(/background:\s*rgb\(90 101 114\);/)
    expect(cssBlock('.nossa-abordagem-value-vision__node')).toMatch(/z-index:\s*5;/)
    expect(cssBlock('.nossa-abordagem-value-vision__connector')).toMatch(/display:\s*none;/)
    expect(cssBlock('.nossa-abordagem-value-vision__separator')).toMatch(/display:\s*none;/)
    expect(cssBlock('.nossa-abordagem-value-vision__copy')).toMatch(/margin-top:\s*0;/)
    expect(siteCss()).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.nossa-abordagem-value-vision__line-fill\s*\{[\s\S]*transform:\s*scaleY\(1\)/)
  })

  it('reveals the value vision title before the timeline fill reaches the cards', () => {
    globalThis.IntersectionObserver = ControlledIntersectionObserver

    render(<NossaAbordagem />)

    const valueVisionBlock = screen.getAllByTestId('nossa-abordagem-block')[4]
    const header = valueVisionBlock.querySelector('.nossa-abordagem-value-vision__header')
    const headerObserver = intersectionObservers.find((observer) => observer.element === valueVisionBlock)

    expect(header).not.toHaveClass('nossa-abordagem-value-vision__header--active')
    expect(headerObserver.options.rootMargin).toBe('0px 0px -18% 0px')

    act(() => {
      headerObserver.callback([{ isIntersecting: true }])
    })

    expect(header).toHaveClass('nossa-abordagem-value-vision__header--active')
    expect(screen.getAllByTestId('nossa-abordagem-value-vision-step')[0]).not.toHaveClass('nossa-abordagem-value-vision__step--active')
  })

})
