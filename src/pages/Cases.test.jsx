import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Cases, { CaseTestimonialsSection } from './Cases'
import { client } from '../lib/sanity'

const styles = readFileSync(resolve('src/index.css'), 'utf8')
const originalWindowInnerWidth = window.innerWidth

const splitTextMock = vi.hoisted(() => vi.fn(({ tag, text, className }) => {
  const SplitTag = tag || 'div'

  return <SplitTag className={className} data-testid="mock-split-text">{text}</SplitTag>
}))

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

vi.mock('../components/Silk', () => ({
  default: ({ speed, scale, color, noiseIntensity, rotation }) => (
    <div
      data-testid="mock-silk"
      data-speed={speed}
      data-scale={scale}
      data-color={color}
      data-noise-intensity={noiseIntensity}
      data-rotation={rotation}
    />
  ),
}))

vi.mock('../components/SplitText', () => ({
  default: splitTextMock,
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.restoreAllMocks()
  vi.useRealTimers()
  document.documentElement.classList.remove('cases-white-background')
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: originalWindowInnerWidth,
  })
})

describe('Cases', () => {
  it('defines the same responsive mobile carousel geometry used by Home Inspire', () => {
    expect(styles).toMatch(/\.cases-carousel-fade\s*{[^}]*display:\s*none;/)
    expect(styles).toMatch(/\.cases-carousel-edge-spacer\s*{[^}]*width:\s*var\(--home-menu-inline\);/)
    expect(styles).toMatch(/\.cases-carousel-item\s*{[^}]*width:\s*calc\(100vw - \(2 \* var\(--home-menu-inline\)\)\);/)
    expect(styles).toMatch(/@media \(min-width:\s*640px\)[\s\S]*?\.cases-carousel-fade\s*{[^}]*display:\s*block;/)
    expect(styles).toMatch(/@media \(min-width:\s*640px\)[\s\S]*?\.cases-carousel-edge-spacer\s*{[^}]*width:\s*12rem;/)
    expect(styles).toMatch(/@media \(min-width:\s*640px\)[\s\S]*?\.cases-carousel-item\s*{[^}]*width:\s*calc\(\(min\(100vw, 1380px\) - 3rem - 32px\) \/ 2\);/)
    expect(styles).toMatch(/@media \(min-width:\s*768px\)[\s\S]*?\.cases-carousel-item\s*{[^}]*width:\s*20rem;/)
    expect(styles).toMatch(/@media \(min-width:\s*1024px\)[\s\S]*?\.cases-carousel-edge-spacer\s*{[^}]*width:\s*13rem;/)
    expect(styles).toMatch(/@media \(min-width:\s*1024px\)[\s\S]*?\.cases-carousel-item\s*{[^}]*width:\s*22rem;/)
  })

  it('preserves every selected case field and order in the mobile carousel', async () => {
    window.innerWidth = 390
    const caseLogos = [
      {
        _id: 'primeiro',
        name: 'Cliente primeiro',
        sector: 'Bancos',
        logo: { assetUrl: 'https://cdn.sanity.io/images/prod/primeiro.svg' },
        logoAlt: 'Logo primeiro',
        caseTitle: 'Primeiro case',
        caseDescription: 'Descricao primeiro',
        caseSlug: 'primeiro',
      },
      {
        _id: 'segundo',
        name: 'Cliente segundo',
        sector: 'Industria',
        logo: { assetUrl: 'https://cdn.sanity.io/images/prod/segundo.svg' },
        logoAlt: 'Logo segundo',
        caseTitle: 'Segundo case',
        caseDescription: 'Descricao segundo',
        caseSlug: 'segundo',
      },
    ]
    client.fetch.mockResolvedValue({ caseLogos, caseTestimonials: [], clientLogos: [] })

    render(
      <MemoryRouter>
        <Cases />
      </MemoryRouter>,
    )

    const carousel = await screen.findByTestId('cases-carousel')
    const items = screen.getAllByTestId('case-carousel-item')
    const cards = caseLogos.map((logo) => screen.getByTestId(`case-client-card-${logo._id}`))

    expect(carousel).toHaveAttribute('data-mobile-snap', 'true')
    expect(carousel).toHaveStyle({ touchAction: 'pan-y' })
    expect(screen.getByTestId('cases-carousel-shell')).toHaveClass('overflow-hidden', 'md:overflow-visible')
    expect(items.map((item) => within(item).getByRole('heading').textContent)).toEqual(['Primeiro case', 'Segundo case'])
    items.forEach((item) => {
      expect(item).toHaveClass('cases-carousel-item')
      expect(item).toHaveAttribute('data-carousel-snap-slide', 'true')
    })
    screen.getAllByTestId('case-carousel-edge-spacer').forEach((spacer) => {
      expect(spacer).toHaveClass('cases-carousel-edge-spacer')
    })
    screen.getAllByTestId('cases-carousel-fade').forEach((fade) => {
      expect(fade).toHaveClass('cases-carousel-fade')
    })
    caseLogos.forEach((logo, index) => {
      expect(within(items[index]).getByRole('img', { name: logo.logoAlt })).toHaveAttribute('src', logo.logo.assetUrl)
      expect(within(items[index]).getByText(logo.caseDescription)).toBeInTheDocument()
      expect(within(items[index]).getByRole('link', { name: 'Ler mais' })).toHaveAttribute('href', `/cases/${logo.caseSlug}`)
      expect(cards[index]).toHaveClass('w-full')
      expect(cards[index]).not.toHaveClass('w-72', 'sm:w-80', 'lg:w-[22rem]')
    })
  })

  it.each([639, 640, 767])('keeps mobile snap enabled at %ipx', async (viewportWidth) => {
    window.innerWidth = viewportWidth
    client.fetch.mockResolvedValue({
      caseLogos: [{ _id: 'case-mobile', name: 'Case mobile', logo: { assetUrl: 'case-mobile.svg' } }],
      caseTestimonials: [],
      clientLogos: [],
    })

    render(<MemoryRouter><Cases /></MemoryRouter>)

    expect(await screen.findByTestId('cases-carousel')).toHaveAttribute('data-mobile-snap', 'true')
  })

  it('keeps the existing non-snapping carousel mode from 768px upward', async () => {
    window.innerWidth = 768
    client.fetch.mockResolvedValue({
      caseLogos: [{ _id: 'case-desktop', name: 'Case desktop', logo: { assetUrl: 'case-desktop.svg' } }],
      caseTestimonials: [],
      clientLogos: [],
    })

    render(<MemoryRouter><Cases /></MemoryRouter>)

    expect(await screen.findByTestId('cases-carousel')).toHaveAttribute('data-mobile-snap', 'false')
  })

  it('snaps mobile Cases to the nearest measured card like Home Inspire', async () => {
    window.innerWidth = 390
    client.fetch.mockResolvedValue({
      caseLogos: [
        { _id: 'case-1', name: 'Case 1', logo: { assetUrl: 'case-1.svg' } },
        { _id: 'case-2', name: 'Case 2', logo: { assetUrl: 'case-2.svg' } },
      ],
      caseTestimonials: [],
      clientLogos: [],
    })

    render(<MemoryRouter><Cases /></MemoryRouter>)
    const track = await screen.findByTestId('cases-carousel')
    vi.useFakeTimers()
    const shell = screen.getByTestId('cases-carousel-shell')
    const slides = screen.getAllByTestId('case-carousel-item')
    Object.defineProperties(shell, {
      clientWidth: { configurable: true, value: 390 },
    })
    Object.defineProperties(track, {
      scrollWidth: { configurable: true, value: 1600 },
    })
    Object.defineProperties(slides[0], {
      offsetLeft: { configurable: true, value: 24 },
      offsetWidth: { configurable: true, value: 342 },
    })
    Object.defineProperties(slides[1], {
      offsetLeft: { configurable: true, value: 398 },
      offsetWidth: { configurable: true, value: 342 },
    })

    fireEvent.pointerDown(track, { pointerId: 21, pointerType: 'touch', clientX: 310, clientY: 220 })
    fireEvent.pointerMove(track, { pointerId: 21, pointerType: 'touch', clientX: 190, clientY: 220 })
    fireEvent.pointerUp(track, { pointerId: 21, pointerType: 'touch' })
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(track).toHaveStyle({ transform: 'translateX(-374px)' })
  })

  it('cancels mobile inertia and resets position when resizing across 768px', async () => {
    window.innerWidth = 767
    client.fetch.mockResolvedValue({
      caseLogos: [
        { _id: 'case-1', name: 'Case 1', logo: { assetUrl: 'case-1.svg' } },
        { _id: 'case-2', name: 'Case 2', logo: { assetUrl: 'case-2.svg' } },
      ],
      caseTestimonials: [],
      clientLogos: [],
    })

    render(<MemoryRouter><Cases /></MemoryRouter>)
    const mobileTrack = await screen.findByTestId('cases-carousel')
    vi.useFakeTimers()
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame')
    const shell = screen.getByTestId('cases-carousel-shell')
    Object.defineProperties(shell, {
      clientWidth: { configurable: true, value: 600 },
    })
    Object.defineProperties(mobileTrack, {
      scrollWidth: { configurable: true, value: 900 },
    })

    fireEvent.pointerDown(mobileTrack, { pointerId: 22, pointerType: 'touch', clientX: 500, clientY: 220 })
    fireEvent.pointerMove(mobileTrack, { pointerId: 22, pointerType: 'touch', clientX: 300, clientY: 220 })
    fireEvent.pointerUp(mobileTrack, { pointerId: 22, pointerType: 'touch' })

    window.innerWidth = 768
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    const desktopTrack = screen.getByTestId('cases-carousel')

    expect(desktopTrack).not.toBe(mobileTrack)
    expect(desktopTrack).toHaveAttribute('data-mobile-snap', 'false')
    expect(desktopTrack).toHaveStyle({ transform: 'translateX(0px)' })
    expect(cancelAnimationFrameSpy).toHaveBeenCalled()
  })

  it('animates client filter logos with slide-up fade only', () => {
    const cascadeAnimation = styles.match(/\.client-logo-reveal[\s\S]*?@media/)?.[0] || ''

    expect(cascadeAnimation).toContain('client-logo-cascade')
    expect(cascadeAnimation).toContain('translateY(18px)')
    expect(cascadeAnimation).toContain('translateY(0)')
    expect(cascadeAnimation).not.toContain('blur(')
    expect(cascadeAnimation).not.toContain('filter:')
    expect(cascadeAnimation).not.toContain('scale(')
    expect(cascadeAnimation).not.toContain('58%')
  })

  it('animates selected case carousel cards with staggered fade', () => {
    const carouselAnimation = styles.match(/\.case-carousel-reveal[\s\S]*?@media/)?.[0] || ''

    expect(carouselAnimation).toContain('case-carousel-card-cascade')
    expect(carouselAnimation).toContain('animation-delay: 120ms')
    expect(carouselAnimation).toContain('translateY(22px)')
    expect(carouselAnimation).toContain('translateY(0)')
    expect(carouselAnimation).not.toContain('blur(')
    expect(carouselAnimation).not.toContain('scale(')
  })

  it('defines a restrained scroll reveal sequence for testimonial components without blur', () => {
    const testimonialAnimation = styles.match(/\.testimonial-scroll-reveal[\s\S]*?@media/)?.[0] || ''

    expect(testimonialAnimation).toContain('testimonial-fade-up')
    expect(testimonialAnimation).toContain('testimonial-fade-right')
    expect(testimonialAnimation).toContain('translateY(18px)')
    expect(testimonialAnimation).toContain('translateX(22px)')
    expect(testimonialAnimation).not.toContain('testimonial-fade-left')
    expect(testimonialAnimation).not.toContain('testimonial-fade-down')
    expect(testimonialAnimation).not.toContain('translateX(-22px)')
    expect(testimonialAnimation).not.toContain('translateY(-20px)')
    expect(testimonialAnimation).not.toContain('blur(')
    expect(testimonialAnimation).not.toContain('filter:')
  })

  it('shows every client category as a paginated two-column grid on mobile', async () => {
    window.innerWidth = 390
    const bankLogos = Array.from({ length: 10 }, (_, index) => ({
      _id: `banco-${index + 1}`,
      name: `Banco ${index + 1}`,
      sector: 'Bancos',
      logo: { assetUrl: `banco-${index + 1}.svg` },
    }))
    const distributorLogos = Array.from({ length: 9 }, (_, index) => ({
      _id: `distribuidora-${index + 1}`,
      name: `Distribuidora ${index + 1}`,
      sector: 'Comércio e Distribuidoras',
      logo: { assetUrl: `distribuidora-${index + 1}.svg` },
    }))

    client.fetch.mockResolvedValue({
      caseLogos: [],
      caseTestimonials: [],
      clientLogos: [...bankLogos, ...distributorLogos],
    })

    render(
      <MemoryRouter>
        <Cases />
      </MemoryRouter>,
    )

    const mobileGroups = await screen.findByTestId('mobile-client-groups')
    const sectors = within(mobileGroups).getAllByTestId('client-sector')

    expect(within(mobileGroups).queryByRole('button', { name: 'Todos' })).not.toBeInTheDocument()
    expect(sectors).toHaveLength(2)
    expect(within(sectors[0]).getByRole('heading', { name: 'Bancos' })).toHaveClass('text-slate-600')
    expect(within(sectors[0]).getByRole('heading', { name: 'Bancos' })).not.toHaveClass('text-slate-950')
    expect(within(sectors[1]).getByRole('heading', { name: 'Comércio e Distribuidoras' })).toHaveClass('text-slate-600')

    const bankGrid = within(sectors[0]).getByTestId('mobile-client-logo-grid')
    const distributorGrid = within(sectors[1]).getByTestId('mobile-client-logo-grid')

    expect(bankGrid).toHaveClass('grid-cols-2')
    expect(distributorGrid).toHaveClass('grid-cols-2')
    expect(within(bankGrid).getAllByRole('img')).toHaveLength(8)
    expect(within(distributorGrid).getAllByRole('img')).toHaveLength(8)

    fireEvent.click(within(sectors[0]).getByRole('button', { name: 'Ver mais clientes de Bancos' }))

    expect(within(bankGrid).getAllByRole('img')).toHaveLength(10)
    expect(within(distributorGrid).getAllByRole('img')).toHaveLength(8)
    expect(within(sectors[0]).queryByRole('button', { name: 'Ver mais clientes de Bancos' })).not.toBeInTheDocument()

    fireEvent.click(within(sectors[1]).getByRole('button', { name: 'Ver mais clientes de Comércio e Distribuidoras' }))

    expect(within(distributorGrid).getAllByRole('img')).toHaveLength(9)
  })

  it('renders selected case logos first and all client logos grouped by sector after', async () => {
    client.fetch.mockResolvedValue({
      caseLogos: [
        {
          _id: 'banco-azul',
          name: 'Banco Azul',
          sector: 'Bancos',
          logo: { assetUrl: 'https://cdn.sanity.io/images/prod/banco-azul.svg' },
          logoAlt: 'Marca Banco Azul',
          caseTitle: 'Redesenho da rotina comercial',
          caseDescription: 'Organizacao dos processos para acelerar decisoes da equipe.',
          caseSlug: 'banco-moneo',
        },
      ],
      caseTestimonials: [
        {
          _id: 'depoimento-banco-azul',
          clientName: 'Ana Costa',
          role: 'Diretora de Operacoes',
          company: 'Banco Azul',
          category: 'Servicos financeiros',
          shortQuote: 'Texto curto para a home.',
          detailedQuote: 'A parceria com a Otimiza reduziu o retrabalho da operacao e trouxe previsibilidade para a rotina comercial.',
          avatarUrl: 'https://cdn.sanity.io/images/prod/ana-costa.jpg',
          metrics: [
            { label: 'Horas recuperadas', value: '320h' },
            { label: 'Retrabalho', value: '-45%' },
          ],
        },
      ],
      clientLogos: [
        {
          _id: 'distribuidora-alfa',
          name: 'Distribuidora Alfa',
          sector: 'Comércio e Distribuidoras',
          logo: { assetUrl: 'https://cdn.sanity.io/images/prod/distribuidora-alfa.svg' },
        },
        {
          _id: 'banco-azul',
          name: 'Banco Azul',
          sector: 'Bancos',
          logo: { assetUrl: 'https://cdn.sanity.io/images/prod/banco-azul.svg' },
          logoAlt: 'Marca Banco Azul',
          caseTitle: 'Redesenho da rotina comercial',
          caseDescription: 'Organizacao dos processos para acelerar decisoes da equipe.',
          caseSlug: 'banco-moneo',
        },
      ],
    })

    render(
      <MemoryRouter>
        <Cases />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Cases' })).toBeInTheDocument()
    expect(document.documentElement).toHaveClass('cases-white-background')
    expect(screen.getByTestId('cases-page-shell')).toHaveClass('space-y-20', 'sm:space-y-24', 'lg:space-y-24', 'pb-0')
    expect(screen.getByTestId('cases-hero')).toHaveClass('bg-[#E5E9F1]', 'overflow-hidden')
    expect(screen.getByTestId('cases-hero')).toHaveClass('min-h-screen', 'pb-20', 'pt-32', 'sm:pt-36')
    expect(screen.getByTestId('cases-hero-silk')).toHaveClass('h-[26rem]', 'w-full', 'opacity-20', 'pointer-events-none')
    expect(screen.getByTestId('cases-hero-silk')).toHaveClass('[mask-image:linear-gradient(to_bottom,black_0%,black_58%,transparent_100%)]')
    const heroSilk = within(screen.getByTestId('cases-hero-silk')).getByTestId('mock-silk')
    expect(heroSilk).toHaveAttribute('data-speed', '5.1')
    expect(heroSilk).toHaveAttribute('data-scale', '1')
    expect(heroSilk).toHaveAttribute('data-color', '#EDF0F5')
    expect(heroSilk).toHaveAttribute('data-noise-intensity', '1.5')
    expect(heroSilk).toHaveAttribute('data-rotation', '0.2')
    expect(screen.getByTestId('cases-hero-veil')).toHaveClass('top-0', 'h-[26rem]', 'from-[#E5E9F1]/95', 'to-[#E5E9F1]')
    expect(screen.queryByTestId('cases-hero-bottom-fade')).not.toBeInTheDocument()
    expect(screen.queryByText('Cases', { selector: 'p' })).not.toBeInTheDocument()
    expect(screen.getByTestId('cases-hero-header')).toHaveClass('mx-auto', 'max-w-4xl', 'text-center')
    expect(screen.getByTestId('mock-split-text')).toHaveClass('text-[clamp(4.25rem,7vw,6.25rem)]', 'leading-[0.92]')
    expect(screen.getByTestId('cases-hero-intro')).toHaveClass('mx-auto', 'max-w-[52rem]', 'text-lg', 'sm:text-xl')
    expect(splitTextMock).toHaveBeenCalledWith(expect.objectContaining({
      tag: 'h1',
      text: 'Cases',
      delay: 100,
      duration: 0.6,
      ease: 'power3.out',
      splitType: 'chars',
      from: { opacity: 0, y: 40 },
      to: { opacity: 1, y: 0 },
      threshold: 0.1,
      rootMargin: '-100px',
      textAlign: 'center',
    }), undefined)
    expect(screen.getByRole('heading', { name: 'Nossos clientes' })).toBeInTheDocument()
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('caseLogos'))
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('caseTestimonials'))
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('_type == "customerTestimonial"'))
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('showOnCases == true'))
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('clientLogos'))
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('logo'))
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('caseTitle'))
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('caseDescription'))

    const casesSection = screen.getByTestId('cases-logo-section')
    expect(within(casesSection).getByRole('img', { name: 'Marca Banco Azul' })).toHaveAttribute(
      'src',
      'https://cdn.sanity.io/images/prod/banco-azul.svg',
    )
    expect(within(casesSection).getByRole('heading', { name: 'Redesenho da rotina comercial' })).toBeInTheDocument()
    expect(within(casesSection).getByText('Organizacao dos processos para acelerar decisoes da equipe.')).toBeInTheDocument()
    expect(within(casesSection).getByRole('link', { name: 'Ler mais' })).toHaveAttribute('href', '/cases/banco-moneo')
    expect(within(casesSection).getByTestId('case-client-card-banco-azul').tagName).toBe('ARTICLE')
    expect(casesSection).toHaveClass('mt-12')
    expect(within(casesSection).getByTestId('case-client-card-banco-azul')).toHaveClass('min-h-[25rem]', 'px-6', 'py-6', 'bg-[#DDE4EF]')
    expect(within(casesSection).getByTestId('case-client-card-banco-azul')).not.toHaveClass('border', 'border-slate-200')
    expect(within(casesSection).getByTestId('case-client-card-banco-azul')).not.toHaveClass('shadow-sm', 'hover:shadow-md', 'transition-colors')
    expect(within(casesSection).getByTestId('case-client-card-banco-azul')).not.toHaveClass('hover:bg-[#DDE4EF]', 'bg-[#E5E9F1]/70')
    expect(within(casesSection).getByTestId('case-client-card-banco-azul')).not.toHaveClass('hover:-translate-y-0.5')
    expect(within(casesSection).getByTestId('case-client-card-banco-azul').querySelector('[data-testid="case-client-logo-box"]')).toHaveClass('min-h-40', 'border-0', 'bg-white')
    expect(within(casesSection).getByTestId('case-client-card-banco-azul').querySelector('[data-testid="case-client-logo-box"]')).not.toHaveClass('min-h-64', 'min-h-48', 'border')
    expect(within(casesSection).getByTestId('cases-carousel')).toHaveClass('cursor-grab')
    expect(within(casesSection).getByTestId('cases-drag-hint')).toHaveClass('opacity-0')
    expect(within(casesSection).getByTestId('case-client-card-banco-azul')).not.toHaveClass('snap-center')
    expect(within(casesSection).getByRole('img', { name: 'Marca Banco Azul' })).toHaveClass('max-h-16', 'max-w-[78%]', 'object-contain')
    expect(within(casesSection).getByRole('img', { name: 'Marca Banco Azul' })).not.toHaveClass('grayscale')
    expect(within(casesSection).getByRole('img', { name: 'Marca Banco Azul' })).not.toHaveClass('w-full')
    expect(within(casesSection).queryByRole('img', { name: 'Distribuidora Alfa' })).not.toBeInTheDocument()

    expect(screen.queryByTestId('cases-testimonials-section')).not.toBeInTheDocument()

    const clientsSection = screen.getByTestId('all-client-logos-section')
    expect(clientsSection).toHaveClass('mx-auto', 'max-w-[1320px]')
    expect(within(clientsSection).queryByRole('textbox')).not.toBeInTheDocument()
    expect(within(clientsSection).queryByRole('searchbox')).not.toBeInTheDocument()
    expect(within(clientsSection).queryAllByTestId('client-sector')).toHaveLength(0)

    const allFilter = within(clientsSection).getByRole('button', { name: 'Todos' })
    const bankFilter = within(clientsSection).getByRole('button', { name: 'Bancos' })
    const distributorFilter = within(clientsSection).getByRole('button', { name: /Distribuidoras/ })

    expect(allFilter).toHaveAttribute('aria-pressed', 'true')
    expect(bankFilter).toHaveAttribute('aria-pressed', 'false')
    expect(allFilter).toHaveClass('border-black', 'bg-slate-200', 'text-slate-950')
    expect(allFilter).not.toHaveClass('bg-slate-900', 'text-white')
    expect(within(clientsSection).queryByText('2 clientes exibidos em todos os setores')).not.toBeInTheDocument()
    expect(within(clientsSection).queryByText(/clientes exibidos/i)).not.toBeInTheDocument()
    expect(within(clientsSection).getByTestId('client-logo-carousel-shell')).not.toHaveClass('border', 'border-slate-200', 'rounded-lg')
    expect(within(clientsSection).getByTestId('client-logo-carousel-shell')).toHaveClass('w-full', 'overflow-visible')
    expect(within(clientsSection).getByTestId('client-logo-carousel-shell')).not.toHaveClass('w-screen', '-ml-[50vw]', '-mr-[50vw]')
    expect(within(clientsSection).getByTestId('client-logo-carousel-viewport')).toHaveClass('overflow-hidden')
    expect(within(clientsSection).getByTestId('client-logo-carousel')).toHaveClass('flex', 'w-max', 'gap-6', 'sm:gap-7', 'lg:gap-9')
    expect(within(clientsSection).queryByTestId('client-logo-grid')).not.toBeInTheDocument()
    expect(within(clientsSection).queryByRole('button', { name: 'Clientes anteriores' })).not.toBeInTheDocument()
    expect(within(clientsSection).queryByRole('button', { name: 'Proximos clientes' })).not.toBeInTheDocument()
    expect(within(clientsSection).queryByTestId('client-logo-arrow-previous')).not.toBeInTheDocument()
    expect(within(clientsSection).queryByTestId('client-logo-arrow-next')).not.toBeInTheDocument()
    expect(within(clientsSection).getAllByTestId('client-logo-carousel-fade')).toHaveLength(2)
    expect(within(clientsSection).getAllByTestId('client-logo-carousel-fade')[0]).toHaveClass('left-0', 'w-8', 'opacity-0')
    expect(within(clientsSection).getAllByTestId('client-logo-carousel-fade')[1]).toHaveClass('right-0', 'w-8', 'opacity-100')
    expect(within(clientsSection).getByTestId('client-logo-drag-hint')).toHaveTextContent('Arrastar')
    expect(within(clientsSection).getByTestId('client-logo-drag-arrow')).toHaveStyle({
      transform: 'rotate(0deg) scale(1)',
    })
    expect(within(clientsSection).queryByTestId('client-logo-carousel-edge-spacer')).not.toBeInTheDocument()
    const clientLogoCarouselShell = within(clientsSection).getByTestId('client-logo-carousel-shell')
    const clientLogoCarousel = within(clientsSection).getByTestId('client-logo-carousel')
    vi.useFakeTimers()
    Object.defineProperties(clientLogoCarouselShell, {
      clientWidth: { configurable: true, value: 320 },
    })
    Object.defineProperties(clientLogoCarousel, {
      scrollWidth: { configurable: true, value: 600 },
    })
    fireEvent.pointerDown(clientLogoCarousel, { pointerId: 11, clientX: 240, clientY: 120 })
    fireEvent.pointerMove(clientLogoCarousel, { pointerId: 11, clientX: 120, clientY: 120 })
    expect(clientLogoCarousel).toHaveClass('cursor-grabbing')
    expect(clientLogoCarousel).toHaveStyle({ transform: 'translateX(-115.19999999999999px)' })
    expect(within(clientsSection).getByTestId('client-logo-drag-arrow')).toHaveStyle({
      transform: 'rotate(180deg) scale(1.12)',
    })
    fireEvent.pointerUp(clientLogoCarousel, { pointerId: 11 })
    expect(clientLogoCarousel).toHaveClass('cursor-grab')
    act(() => {
      vi.advanceTimersByTime(96)
    })
    const clientTranslateAfterInertia = Number(clientLogoCarousel.style.transform.match(/-?\d+(\.\d+)?/)?.[0])
    expect(clientTranslateAfterInertia).toBeLessThan(-170)
    expect(within(clientsSection).getAllByTestId('client-logo-carousel-fade')[0]).toHaveClass('opacity-100')
    expect(clientLogoCarousel.style.transform).not.toContain('translateY')

    fireEvent.pointerDown(clientLogoCarousel, { pointerId: 12, clientX: 120, clientY: 120 })
    fireEvent.pointerMove(clientLogoCarousel, { pointerId: 12, clientX: 220, clientY: 120 })
    expect(within(clientsSection).getByTestId('client-logo-drag-arrow')).toHaveStyle({
      transform: 'rotate(0deg) scale(1.12)',
    })
    fireEvent.pointerUp(clientLogoCarousel, { pointerId: 12 })
    act(() => {
      vi.advanceTimersByTime(520)
    })
    vi.useRealTimers()
    const initialAnimatedLogos = within(clientsSection).getAllByTestId('client-logo-reveal')
    expect(initialAnimatedLogos).toHaveLength(2)
    expect(initialAnimatedLogos[0]).toHaveStyle({ animationDelay: '0ms' })
    expect(initialAnimatedLogos[1]).toHaveStyle({ animationDelay: '70ms' })
    expect(initialAnimatedLogos[0]).toHaveAttribute('data-animation-run', '0-all')

    expect(within(clientsSection).getByRole('img', { name: 'Marca Banco Azul' })).toHaveAttribute(
      'src',
      'https://cdn.sanity.io/images/prod/banco-azul.svg',
    )
    const highlightedCard = within(clientsSection).getByTestId('case-client-card-banco-azul')
    expect(highlightedCard).toHaveClass('p-4')
    expect(within(highlightedCard).getByTestId('case-client-logo-box')).toHaveClass('min-h-36', 'px-6', 'py-8')
    expect(within(highlightedCard).getByTestId('case-client-logo-box')).toContainElement(
      within(clientsSection).getByRole('img', { name: 'Marca Banco Azul' }),
    )
    expect(within(highlightedCard).queryByRole('heading', { name: 'Banco Azul' })).not.toBeInTheDocument()
    expect(within(highlightedCard).queryByText('Organizacao dos processos para acelerar decisoes da equipe.')).not.toBeInTheDocument()
    expect(within(clientsSection).getByRole('img', { name: 'Distribuidora Alfa' })).toHaveAttribute(
      'src',
      'https://cdn.sanity.io/images/prod/distribuidora-alfa.svg',
    )

    fireEvent.click(bankFilter)

    expect(allFilter).toHaveAttribute('aria-pressed', 'false')
    expect(bankFilter).toHaveAttribute('aria-pressed', 'true')
    expect(bankFilter).toHaveClass('border-black', 'bg-slate-200', 'text-slate-950')
    expect(bankFilter).not.toHaveClass('bg-slate-900', 'text-white')
    expect(within(clientsSection).queryByText('1 cliente exibido em Bancos')).not.toBeInTheDocument()
    expect(within(clientsSection).getByTestId('client-logo-reveal')).toHaveAttribute('data-animation-run', '1-Bancos')
    expect(within(clientsSection).getByTestId('client-logo-reveal')).toHaveClass('client-logo-reveal')
    expect(within(clientsSection).queryByTestId('client-logo-spacer')).not.toBeInTheDocument()
    expect(within(clientsSection).getByRole('img', { name: 'Marca Banco Azul' })).toBeInTheDocument()
    expect(within(clientsSection).queryByRole('img', { name: 'Distribuidora Alfa' })).not.toBeInTheDocument()

    fireEvent.click(distributorFilter)

    expect(bankFilter).toHaveAttribute('aria-pressed', 'false')
    expect(distributorFilter).toHaveAttribute('aria-pressed', 'true')
    expect(within(clientsSection).queryByText(/1 cliente exibido em .*Distribuidoras/)).not.toBeInTheDocument()
    expect(within(clientsSection).getByTestId('client-logo-reveal')).toHaveAttribute('data-animation-run', expect.stringContaining('2-'))
    expect(within(clientsSection).queryByRole('img', { name: 'Marca Banco Azul' })).not.toBeInTheDocument()
    expect(within(clientsSection).getByRole('img', { name: 'Distribuidora Alfa' })).toBeInTheDocument()

    const ctaSection = screen.getByTestId('cases-cta-section')
    expect(ctaSection).toHaveClass('bg-[#E5E9F1]', 'overflow-hidden', 'py-28', 'sm:py-32', 'lg:py-36')
    expect(within(ctaSection).queryByText('Próximo passo')).not.toBeInTheDocument()
    expect(within(ctaSection).getByRole('heading', { name: 'Quer construir o próximo case de sucesso?' })).toHaveClass('text-slate-950')
    expect(within(ctaSection).getByText(/Leve a metodologia da Otimiza/)).toBeInTheDocument()
    expect(within(ctaSection).getByRole('link', { name: 'Fale com a Otimiza' })).toHaveAttribute('href', '/contato')
    const ctaSilk = within(screen.getByTestId('cases-cta-silk')).getByTestId('mock-silk')
    expect(ctaSilk).toHaveAttribute('data-speed', '5.1')
    expect(ctaSilk).toHaveAttribute('data-scale', '1')
    expect(ctaSilk).toHaveAttribute('data-color', '#EDF0F5')
    expect(ctaSilk).toHaveAttribute('data-noise-intensity', '1.5')
    expect(ctaSilk).toHaveAttribute('data-rotation', '0.2')
  })

  it('shows testimonial cards as a full-width continuous carousel with the active card highlighted', async () => {
    const testimonialResponse = {
      caseLogos: [],
      caseTestimonials: [
        {
          _id: 'testimonial-1',
          clientName: 'Cliente Um',
          role: 'Diretora',
          company: 'Empresa Um',
          category: 'Industria',
          detailedQuote: 'Primeiro depoimento completo.',
          avatarUrl: 'https://cdn.sanity.io/images/prod/cliente-um.jpg',
          metrics: [{ label: 'Lead time', value: '-32%' }],
        },
        {
          _id: 'testimonial-2',
          clientName: 'Cliente Dois',
          role: 'Gerente',
          company: 'Empresa Dois',
          category: 'Servicos',
          detailedQuote: 'Segundo depoimento completo.',
          avatarUrl: 'https://cdn.sanity.io/images/prod/cliente-dois.jpg',
          metrics: [{ label: 'Produtividade', value: '+41%' }],
        },
        {
          _id: 'testimonial-3',
          clientName: 'Cliente Tres',
          role: 'Coordenadora',
          company: 'Empresa Tres',
          category: 'Varejo',
          detailedQuote: 'Terceiro depoimento completo.',
          avatarUrl: 'https://cdn.sanity.io/images/prod/cliente-tres.jpg',
          metrics: [{ label: 'Rotinas mapeadas', value: '18' }],
        },
      ],
      clientLogos: [],
    }

    render(<CaseTestimonialsSection testimonials={testimonialResponse.caseTestimonials} />)

    const shell = screen.getByTestId('cases-testimonials-carousel-shell')
    const carousel = screen.getByTestId('cases-testimonials-carousel')
    const cards = screen.getAllByTestId('cases-testimonial-card')

    const section = screen.getByTestId('cases-testimonials-section')
    expect(section).toHaveClass('w-screen', 'overflow-hidden', '-ml-[50vw]', '-mr-[50vw]')
    expect(shell).toHaveClass('mx-auto', 'w-[var(--testimonial-card-width)]', 'overflow-visible')
    expect(section).toHaveStyle({
      '--testimonial-card-width': 'min(82.5rem, calc(100vw - 1rem))',
      '--testimonial-card-gap': '1.5rem',
    })
    expect(carousel).toHaveClass('flex', 'transition-transform')
    expect(carousel).toHaveStyle({
      gap: 'var(--testimonial-card-gap)',
      transform: 'translateX(calc(-0 * (var(--testimonial-card-width) + var(--testimonial-card-gap))))',
    })
    expect(cards).toHaveLength(3)
    expect(cards[0]).toHaveAttribute('data-carousel-active', 'true')
    expect(cards[0]).toHaveClass('bg-slate-200', 'border-slate-300', 'opacity-100')
    expect(cards[1]).toHaveAttribute('data-carousel-active', 'false')
    expect(cards[1]).toHaveClass('w-[var(--testimonial-card-width)]', 'shrink-0', 'bg-slate-50', 'opacity-100')

    const previousButton = screen.getByRole('button', { name: 'Testemunhal anterior' })
    const nextButton = screen.getByRole('button', { name: 'Proximo testemunhal' })
    expect(previousButton).toBeDisabled()
    expect(nextButton).not.toBeDisabled()

    fireEvent.click(nextButton)

    expect(cards[0]).toHaveAttribute('data-carousel-active', 'false')
    expect(cards[1]).toHaveAttribute('data-carousel-active', 'true')
    expect(cards[1]).toHaveClass('bg-slate-200')
    expect(carousel).toHaveStyle({
      transform: 'translateX(calc(-1 * (var(--testimonial-card-width) + var(--testimonial-card-gap))))',
    })
  })

  it('reveals testimonial block pieces on scroll with staggered directions', async () => {
    const originalIntersectionObserver = globalThis.IntersectionObserver
    const observers = []

    class ControlledIntersectionObserver {
      constructor(callback, options) {
        this.callback = callback
        this.options = options
        observers.push(this)
      }

      observe(element) {
        this.element = element
      }

      unobserve() {}

      disconnect() {}
    }

    globalThis.IntersectionObserver = ControlledIntersectionObserver
    const testimonialResponse = {
      caseLogos: [],
      caseTestimonials: [
        {
          _id: 'testimonial-1',
          clientName: 'Cliente Um',
          role: 'Diretora',
          company: 'Empresa Um',
          category: 'Industria',
          detailedQuote: 'Primeiro depoimento completo.',
          avatarUrl: 'https://cdn.sanity.io/images/prod/cliente-um.jpg',
          metrics: [{ label: 'Lead time', value: '-32%' }],
        },
      ],
      clientLogos: [],
    }

    render(<CaseTestimonialsSection testimonials={testimonialResponse.caseTestimonials} />)

    const section = screen.getByTestId('cases-testimonials-section')
    const revealTarget = screen.getByTestId('cases-testimonials-reveal-target')
    const observer = observers.find((candidate) => candidate.element === revealTarget)

    expect(observer.options).toMatchObject({ threshold: 0.24 })
    expect(section.querySelector('[data-reveal="testimonials-heading"]')).toHaveClass('testimonial-scroll-reveal', 'testimonial-scroll-reveal--up')
    expect(section.querySelector('[data-reveal="testimonials-heading"]')).toHaveStyle({ '--testimonial-reveal-delay': '0ms' })
    expect(section.querySelector('[data-reveal="testimonials-card"]')).toHaveClass('testimonial-scroll-reveal', 'testimonial-scroll-reveal--right')
    expect(section.querySelector('[data-reveal="testimonials-card"]')).toHaveStyle({ '--testimonial-reveal-delay': '160ms' })
    expect(section.querySelector('[data-reveal="testimonials-category"]')).toHaveClass('testimonial-scroll-reveal', 'testimonial-scroll-reveal--up')
    expect(section.querySelector('[data-reveal="testimonials-category"]')).toHaveStyle({ '--testimonial-reveal-delay': '320ms' })
    expect(section.querySelector('[data-reveal="testimonials-quote"]')).toHaveClass('testimonial-scroll-reveal', 'testimonial-scroll-reveal--up')
    expect(section.querySelector('[data-reveal="testimonials-controls"]')).toHaveStyle({ '--testimonial-reveal-delay': '700ms' })
    expect(section.querySelector('[data-reveal="testimonials-heading"]')).not.toHaveClass('testimonial-scroll-reveal--visible')

    act(() => {
      observer.callback([{ isIntersecting: true, target: revealTarget }])
    })

    expect(section.querySelector('[data-reveal="testimonials-heading"]')).toHaveClass('testimonial-scroll-reveal--visible')
    expect(section.querySelector('[data-reveal="testimonials-card"]')).toHaveClass('testimonial-scroll-reveal--visible')
    expect(section.querySelector('[data-reveal="testimonials-quote"]')).toHaveStyle({ '--testimonial-reveal-delay': '440ms' })
    expect(section.querySelector('[data-reveal="testimonials-aside"]')).toHaveStyle({ '--testimonial-reveal-delay': '560ms' })
    expect(section.querySelector('[data-reveal="testimonials-aside"]')).toHaveClass('testimonial-scroll-reveal--up')

    globalThis.IntersectionObserver = originalIntersectionObserver
  })

  it('lets visitors drag the selected cases carousel with elastic feedback', async () => {
    client.fetch.mockResolvedValue({
      caseLogos: [
        {
          _id: 'case-1',
          name: 'Case 1',
          sector: 'Bancos',
          logo: { assetUrl: 'https://cdn.sanity.io/images/prod/case-1.svg' },
          caseSlug: 'case-1',
        },
        {
          _id: 'case-2',
          name: 'Case 2',
          sector: 'Varejo',
          logo: { assetUrl: 'https://cdn.sanity.io/images/prod/case-2.svg' },
          caseSlug: 'case-2',
        },
      ],
      caseTestimonials: [],
      clientLogos: [],
    })

    render(
      <MemoryRouter>
        <Cases />
      </MemoryRouter>,
    )

    const carousel = await screen.findByTestId('cases-carousel')
    vi.useFakeTimers()
    const fullBleedShell = screen.getByTestId('cases-carousel-shell')
    const dragHint = screen.getByTestId('cases-drag-hint')
    const caseCard = screen.getByTestId('case-client-card-case-1')

    vi.spyOn(fullBleedShell, 'getBoundingClientRect').mockReturnValue({
      x: 20,
      y: 100,
      left: 20,
      top: 100,
      right: 1220,
      bottom: 620,
      width: 1200,
      height: 520,
      toJSON: () => {},
    })

    expect(fullBleedShell).toHaveClass('w-screen')
    expect(fullBleedShell).toHaveClass('overflow-visible')
    expect(fullBleedShell).not.toHaveClass('overflow-hidden')
    Object.defineProperties(fullBleedShell, {
      clientWidth: { configurable: true, value: 600 },
    })
    Object.defineProperties(carousel, {
      scrollWidth: { configurable: true, value: 900 },
    })

    expect(screen.getAllByTestId('case-carousel-item')).toHaveLength(2)
    expect(screen.getAllByTestId('case-carousel-item')[0]).toHaveClass('case-carousel-reveal')
    expect(screen.getAllByTestId('case-carousel-item')[0]).toHaveStyle({ '--case-carousel-reveal-index': '0' })
    expect(screen.getAllByTestId('case-carousel-item')[0]).toHaveStyle({ animationDelay: '120ms' })
    expect(screen.getAllByTestId('case-carousel-item')[1]).toHaveClass('case-carousel-reveal')
    expect(screen.getAllByTestId('case-carousel-item')[1]).toHaveStyle({ '--case-carousel-reveal-index': '1' })
    expect(screen.getAllByTestId('case-carousel-item')[1]).toHaveStyle({ animationDelay: '210ms' })
    expect(screen.getAllByTestId('case-carousel-edge-spacer')).toHaveLength(2)
    expect(screen.getAllByTestId('case-carousel-edge-spacer')[0]).toHaveClass('w-40', 'sm:w-48', 'lg:w-[13rem]')
    expect(caseCard).toHaveClass('min-h-[25rem]', 'w-72', 'sm:w-80', 'lg:w-[22rem]', 'rounded-xl', 'px-6', 'py-6')
    expect(caseCard).toHaveClass('bg-[#DDE4EF]')
    expect(caseCard).not.toHaveClass('border', 'border-slate-200')
    expect(caseCard).not.toHaveClass('shadow-sm', 'hover:shadow-md', 'transition-colors')
    expect(caseCard).not.toHaveClass('hover:bg-[#DDE4EF]', 'bg-[#E5E9F1]/70')
    expect(caseCard).not.toHaveClass('hover:bg-slate-950', 'hover:border-slate-950')
    expect(caseCard).not.toHaveClass('hover:-translate-y-0.5')
    expect(caseCard).not.toHaveClass('w-[14rem]', 'min-h-[22rem]', 'min-h-[28rem]', 'min-h-[29rem]', 'lg:min-h-[31rem]', 'lg:w-[26rem]')
    expect(carousel).not.toHaveClass('snap-x')
    expect(carousel).not.toHaveClass('overflow-x-auto')
    expect(carousel).toHaveClass('w-max', 'gap-8')

    const caseCta = screen.getAllByRole('link', { name: 'Ler mais' })[0]
    expect(caseCta).toHaveClass('border-b', 'border-current', 'text-slate-900')
    expect(caseCta).not.toHaveClass('bg-slate-950')
    expect(caseCta).not.toHaveClass('hover:text-brand-red')
    expect(caseCta).not.toHaveClass('text-slate-950', 'hover:text-slate-700')
    expect(caseCta).not.toHaveClass('group-hover:text-white', 'group-hover:border-white')
    expect(caseCard.tagName).toBe('ARTICLE')
    expect(screen.getAllByTestId('cases-carousel-fade')).toHaveLength(2)
    expect(screen.getAllByTestId('cases-carousel-fade')[0]).toHaveClass('pointer-events-none', 'left-0', 'bg-gradient-to-r', 'from-[#E5E9F1]')
    expect(screen.getAllByTestId('cases-carousel-fade')[1]).toHaveClass('pointer-events-none', 'right-0', 'bg-gradient-to-l', 'from-[#E5E9F1]')
    expect(dragHint).toHaveTextContent('Arrastar')
    expect(screen.getByTestId('cases-drag-arrow')).toHaveStyle({
      transform: 'rotate(0deg) scale(1)',
    })

    const linkPointerDown = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 3, clientX: 260, clientY: 180 })
    fireEvent(caseCta, linkPointerDown)
    expect(linkPointerDown.defaultPrevented).toBe(false)
    expect(carousel).toHaveClass('cursor-grab')

    fireEvent.pointerMove(fullBleedShell, { clientX: 320, clientY: 180 })
    expect(dragHint).toHaveStyle({
      transform: 'translateX(314px) translateY(92px) scale(0.92)',
    })

    const pointerDown = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1, clientX: 260, clientY: 180 })
    fireEvent(carousel, pointerDown)
    const pointerMove = new PointerEvent('pointermove', { bubbles: true, cancelable: true, pointerId: 1, clientX: 120, clientY: 180 })
    fireEvent(carousel, pointerMove)

    expect(carousel).toHaveClass('cursor-grabbing')
    expect(carousel).toHaveStyle({ transform: 'translateX(-134.4px)' })
    expect(carousel).toHaveStyle({ userSelect: 'none' })
    expect(screen.getByTestId('cases-drag-arrow')).toHaveStyle({
      transform: 'rotate(180deg) scale(1.12)',
    })
    expect(pointerDown.defaultPrevented).toBe(true)
    expect(pointerMove.defaultPrevented).toBe(true)
    act(() => {
      vi.advanceTimersByTime(16)
    })
    expect(dragHint).toHaveStyle({
      transform: 'translateX(278px) translateY(92px) scale(0.92)',
    })

    fireEvent.pointerUp(carousel, { pointerId: 1 })

    expect(carousel).toHaveClass('cursor-grab')
    expect(carousel).toHaveStyle({ transform: 'translateX(-134.4px)' })
    expect(carousel).toHaveStyle({ transition: 'none' })
    expect(Number(dragHint.style.transform.match(/translateX\((-?\d+(\.\d+)?)px\)/)?.[1])).toBeGreaterThan(114)
    act(() => {
      vi.advanceTimersByTime(96)
    })
    const translateAfterInertia = Number(carousel.style.transform.match(/-?\d+(\.\d+)?/)?.[0])
    expect(translateAfterInertia).toBeLessThan(-255)
    expect(translateAfterInertia).toBeGreaterThan(-330)

    fireEvent.pointerDown(carousel, { pointerId: 2, clientX: 260, clientY: 180 })
    fireEvent.pointerMove(carousel, { pointerId: 2, clientX: 960, clientY: 180 })
    expect(screen.getByTestId('cases-drag-arrow')).toHaveStyle({
      transform: 'rotate(0deg) scale(1.12)',
    })
    const startBounceTranslate = Number(carousel.style.transform.match(/-?\d+(\.\d+)?/)?.[0])
    expect(startBounceTranslate).toBeGreaterThan(46)
    expect(startBounceTranslate).toBeLessThan(92)
    fireEvent.pointerUp(carousel, { pointerId: 2 })
    act(() => {
      vi.advanceTimersByTime(420)
    })
    const settledStartTranslate = Number(carousel.style.transform.match(/-?\d+(\.\d+)?/)?.[0])
    expect(Math.abs(settledStartTranslate)).toBeLessThan(1.2)

    fireEvent.pointerDown(carousel, { pointerId: 4, clientX: 260, clientY: 180 })
    fireEvent.pointerMove(carousel, { pointerId: 4, clientX: -260, clientY: 180 })
    const endBounceTranslate = Number(carousel.style.transform.match(/-?\d+(\.\d+)?/)?.[0])
    expect(endBounceTranslate).toBeLessThan(-346)
    expect(endBounceTranslate).toBeGreaterThan(-392)
    fireEvent.pointerUp(carousel, { pointerId: 4 })
    act(() => {
      vi.advanceTimersByTime(520)
    })
    const settledEndTranslate = Number(carousel.style.transform.match(/-?\d+(\.\d+)?/)?.[0])
    expect(settledEndTranslate).toBeLessThan(-298.8)
    expect(settledEndTranslate).toBeGreaterThan(-301.2)

    expect(screen.getAllByRole('link', { name: 'Ler mais' })[1]).toHaveAttribute('href', '/cases/case-2')
    expect(screen.queryByTestId('cases-testimonials-section')).not.toBeInTheDocument()
  })
})

