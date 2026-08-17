import { act, cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Home from './Home'
import { client } from '../lib/sanity'

vi.mock('../lib/sanity', () => ({
  client: {
    fetch: vi.fn(),
  },
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.clearAllMocks()
  vi.useRealTimers()
})

describe('Home client logos', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 0,
    })
  })

  it('renders client logos selected for the home page from Sanity', async () => {
    const homeLogos = [
      {
        _id: 'banco-azul',
        name: 'Banco Azul',
        logoAlt: 'Marca Banco Azul',
        logoUrl: 'https://cdn.sanity.io/images/prod/banco-azul.svg',
        website: 'https://banco-azul.example.com',
      },
      {
        _id: 'distribuidora-alfa',
        name: 'Distribuidora Alfa',
        logoUrl: 'https://cdn.sanity.io/images/prod/distribuidora-alfa.svg',
      },
    ]
    client.fetch.mockImplementation((query) => Promise.resolve(query.includes('clientLogo') ? homeLogos : []))

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('_type == "clientLogo"'))
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('showOnHome == true'))

    const bancoAzulLogo = await screen.findByRole('img', { name: 'Marca Banco Azul' })
    expect(bancoAzulLogo).toHaveAttribute(
      'src',
      'https://cdn.sanity.io/images/prod/banco-azul.svg',
    )
    expect(bancoAzulLogo.closest('a')).toBeNull()
    expect(screen.getByRole('img', { name: 'Distribuidora Alfa' })).toHaveAttribute(
      'src',
      'https://cdn.sanity.io/images/prod/distribuidora-alfa.svg',
    )
  })

  it('renders fallback client logos when the Sanity browser request is blocked', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    client.fetch.mockRejectedValue(new Error('CORS Origin not allowed'))

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('img', { name: 'Banco Moneo' })).toBeInTheDocument()

    const carousel = screen.getByTestId('home-client-logo-carousel')
    const fallbackLogoNames = Array.from(new Set(
      Array.from(carousel.querySelectorAll('img[alt]:not([alt=""])'))
        .map((logo) => logo.getAttribute('alt')),
    )).sort((left, right) => left.localeCompare(right, 'pt-BR'))
    const approvedLogoNames = [
      'AES',
      'Banco Moneo',
      'Bontempo',
      'Brametal',
      'Controil',
      'Dell Anno',
      'ENGIE',
      'FIERGS',
      'Fischer',
      'Fruki Bebidas',
      'Grendene',
      'Hacker',
      'Lojas Colombo',
      'Marcopolo',
      'Moinho do Nordeste',
      'Pisani',
      'Roni Chaves',
      'Roseflor',
      'Santa Clara',
      'SCA',
      'SIM Rede de Postos',
      'Skymsen',
      'Sulmaq',
      'Tesouro do Estado RS',
      'Unimed Porto Alegre',
      'Unimed VTRP',
      'ZEN',
    ].sort((left, right) => left.localeCompare(right, 'pt-BR'))

    expect(fallbackLogoNames).toEqual(approvedLogoNames)
    expect(fallbackLogoNames).not.toEqual(expect.arrayContaining(['Cinex', 'Randon', 'Sicredi']))
  })

  it('repeats a short client logo list enough to fill the home carousel', async () => {
    const homeLogos = [
      {
        _id: 'banco-azul',
        name: 'Banco Azul',
        logoAlt: 'Marca Banco Azul',
        logoUrl: 'https://cdn.sanity.io/images/prod/banco-azul.svg',
      },
    ]
    client.fetch.mockImplementation((query) => Promise.resolve(query.includes('clientLogo') ? homeLogos : []))

    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    await screen.findByRole('img', { name: 'Marca Banco Azul' })

    expect(container.querySelectorAll('img[src="https://cdn.sanity.io/images/prod/banco-azul.svg"]').length).toBeGreaterThanOrEqual(8)
  })

  it('renders two velocity rows with accessible source copies and decorative repeats', async () => {
    const homeLogos = [
      {
        _id: 'banco-azul',
        name: 'Banco Azul',
        logoAlt: 'Marca Banco Azul',
        logoUrl: 'https://cdn.sanity.io/images/prod/banco-azul.svg',
      },
    ]
    client.fetch.mockImplementation((query) => Promise.resolve(query.includes('clientLogo') ? homeLogos : []))

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    await screen.findByRole('img', { name: 'Marca Banco Azul' })

    const carousel = screen.getByTestId('home-client-logo-carousel')
    const rows = carousel.querySelectorAll('.relative.overflow-hidden')

    expect(rows).toHaveLength(2)
    rows.forEach((row) => {
      const copies = row.querySelectorAll(':scope > div > .shrink-0')
      expect(copies).toHaveLength(6)
      expect(copies[0]).not.toHaveAttribute('aria-hidden')
      Array.from(copies).slice(1).forEach((copy) => expect(copy).toHaveAttribute('aria-hidden', 'true'))
    })
  })

  it('balances CMS logo rows into stable velocity content', async () => {
    const homeLogos = Array.from({ length: 10 }, (_, index) => ({
      _id: `cliente-${index + 1}`,
      name: `Cliente ${index + 1}`,
      logoAlt: `Marca Cliente ${index + 1}`,
      logoUrl: `https://cdn.sanity.io/images/prod/cliente-${index + 1}.svg`,
    }))
    client.fetch.mockImplementation((query) => Promise.resolve(query.includes('clientLogo') ? homeLogos : []))

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    await screen.findByRole('img', { name: 'Marca Cliente 1' })

    const carousel = screen.getByTestId('home-client-logo-carousel')
    const rows = carousel.querySelectorAll('.relative.overflow-hidden')

    expect(rows).toHaveLength(2)
    rows.forEach((row) => {
      const sourceCopy = row.querySelector(':scope > div > .shrink-0')
      const cards = sourceCopy.querySelectorAll('.home-client-logo-card')

      expect(cards).toHaveLength(6)
      cards.forEach((logoCard) => {
        expect(logoCard.className).toMatch(/h-10/)
        expect(logoCard.className).toMatch(/sm:h-16/)
      })
      expect(sourceCopy.firstElementChild.className).toMatch(/gap-3/)
      expect(sourceCopy.firstElementChild.className).toMatch(/sm:gap-6/)
    })
  })

  it('keeps the reveal animation on the carousel wrapper without applying it to marquee tracks', async () => {
    const homeLogos = [
      {
        _id: 'banco-azul',
        name: 'Banco Azul',
        logoAlt: 'Marca Banco Azul',
        logoUrl: 'https://cdn.sanity.io/images/prod/banco-azul.svg',
      },
    ]
    client.fetch.mockImplementation((query) => Promise.resolve(query.includes('clientLogo') ? homeLogos : []))

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    await screen.findByRole('img', { name: 'Marca Banco Azul' })

    const carousel = screen.getByTestId('home-client-logo-carousel')
    expect(carousel.className).toMatch(/animate-enter/)
    expect(carousel.className).toMatch(/animation-delay:450ms/)
    expect(carousel.className).not.toMatch(/opacity-0/)

    carousel.querySelectorAll('.relative.overflow-hidden').forEach((row) => {
      expect(row.className).not.toMatch(/animate-enter/)
    })
  })

  it('drives logo marquee movement with scroll velocity transforms while preserving duplicated tracks', async () => {
    const homeLogos = [
      {
        _id: 'banco-azul',
        name: 'Banco Azul',
        logoAlt: 'Marca Banco Azul',
        logoUrl: 'https://cdn.sanity.io/images/prod/banco-azul.svg',
      },
    ]
    const animationFrames = []
    client.fetch.mockImplementation((query) => Promise.resolve(query.includes('clientLogo') ? homeLogos : []))
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      animationFrames.push(callback)
      return animationFrames.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(1200)

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    await screen.findByRole('img', { name: 'Marca Banco Azul' })

    const carousel = screen.getByTestId('home-client-logo-carousel')
    const rows = carousel.querySelectorAll('.relative.overflow-hidden')
    const firstScroller = rows[0].querySelector(':scope > div')
    const secondScroller = rows[1].querySelector(':scope > div')

    expect(firstScroller).toBeInTheDocument()
    expect(secondScroller).toBeInTheDocument()
    expect(rows[0].querySelectorAll(':scope > div > .shrink-0')).toHaveLength(6)
    expect(rows[1].querySelectorAll(':scope > div > .shrink-0')).toHaveLength(6)

    act(() => {
      animationFrames.shift()(1000)
    })

    expect(firstScroller.style.transform).not.toMatch(/translateX\(0px\)/)
  })

  it('eager-loads carousel logos', async () => {
    const homeLogos = [
      {
        _id: 'banco-azul',
        name: 'Banco Azul',
        logoAlt: 'Marca Banco Azul',
        logoUrl: 'https://cdn.sanity.io/images/prod/banco-azul.svg',
      },
    ]
    client.fetch.mockImplementation((query) => Promise.resolve(query.includes('clientLogo') ? homeLogos : []))

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    const logo = await screen.findByRole('img', { name: 'Marca Banco Azul' })
    expect(logo).toHaveAttribute('loading', 'eager')
  })
})
