import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { act, cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Home from './Home'
import { client } from '../lib/sanity'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const tailwindConfig = fs.readFileSync(path.resolve(testDir, '../../tailwind.config.js'), 'utf8')
const indexCss = fs.readFileSync(path.resolve(testDir, '../index.css'), 'utf8')

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

    expect(await screen.findByRole('img', { name: 'Marca Banco Azul' })).toHaveAttribute(
      'src',
      'https://cdn.sanity.io/images/prod/banco-azul.svg',
    )
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

    expect(await screen.findByRole('img', { name: 'Moneo' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Lojas Colombo' })).toBeInTheDocument()
    expect(screen.getByTestId('home-client-logo-carousel')).toBeInTheDocument()
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

  it('keeps two visible logo rows and uses a smooth home marquee pace', async () => {
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

    const rows = screen.getAllByTestId('home-client-logo-row')
    expect(rows).toHaveLength(2)
    expect(rows[0].querySelectorAll('.home-client-logo-marquee__track')).toHaveLength(2)
    expect(rows[1].querySelectorAll('.home-client-logo-marquee__track--reverse')).toHaveLength(2)
    expect(tailwindConfig).not.toMatch(/marquee:\s*'marquee 60s linear -20s infinite'/)
    expect(tailwindConfig).not.toMatch(/marqueeReverse:\s*'marqueeReverse 60s linear -20s infinite'/)
  })

  it('balances CMS logo rows into full-width stable tracks', async () => {
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

    const rows = screen.getAllByTestId('home-client-logo-row')
    const firstRowTrack = rows[0].querySelector('.home-client-logo-marquee__track')
    const secondRowTrack = rows[1].querySelector('.home-client-logo-marquee__track')

    expect(firstRowTrack.children).toHaveLength(6)
    expect(secondRowTrack.children).toHaveLength(6)
    expect(firstRowTrack.children.length).toBe(secondRowTrack.children.length)

    rows.forEach((row) => {
      row.querySelectorAll('.home-client-logo-marquee__track').forEach((track) => {
        expect(track.children).toHaveLength(6)

        Array.from(track.children).forEach((logoCard) => {
          expect(logoCard.className).toMatch(/home-client-logo-card/)
        })
      })
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

    screen.getAllByTestId('home-client-logo-row').forEach((row) => {
      row.querySelectorAll('.home-client-logo-marquee__track').forEach((track) => {
        expect(track.className).not.toMatch(/animate-enter/)
      })
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
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(1200)

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    await screen.findByRole('img', { name: 'Marca Banco Azul' })

    const rows = screen.getAllByTestId('home-client-logo-row')
    const firstScroller = rows[0].querySelector('.home-client-logo-marquee__scroller')
    const secondScroller = rows[1].querySelector('.home-client-logo-marquee__scroller')

    expect(firstScroller).toBeInTheDocument()
    expect(secondScroller).toBeInTheDocument()
    expect(rows[0].querySelectorAll('.home-client-logo-marquee__track')).toHaveLength(2)
    expect(rows[1].querySelectorAll('.home-client-logo-marquee__track--reverse')).toHaveLength(2)
    expect(firstScroller).toHaveAttribute('data-scroll-velocity-enhanced', 'true')
    expect(firstScroller).toHaveAttribute('data-scroll-velocity-direction', 'forward')

    act(() => {
      animationFrames.shift()(1000)
    })

    expect(firstScroller.style.transform).toMatch(/^translate3d\(-/)

    act(() => {
      window.scrollY = 240
      window.dispatchEvent(new Event('scroll'))
    })

    expect(firstScroller).toHaveAttribute('data-scroll-velocity-direction', 'forward')

    act(() => {
      window.scrollY = 0
      window.dispatchEvent(new Event('scroll'))
    })

    expect(firstScroller).toHaveAttribute('data-scroll-velocity-direction', 'reverse')
  })

  it('eager-loads carousel logos and starts marquee animations mid-cycle', async () => {
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
    expect(tailwindConfig).not.toMatch(/-20s/)
  })

  it('keeps the duplicated marquee tracks separated by the same gap used in the keyframes', () => {
    expect(indexCss).toMatch(/\.home-client-logo-marquee__scroller\s*\{[^}]*gap:\s*1\.5rem;/s)
    expect(indexCss).toMatch(/animation:\s*home-client-logo-scroll\s+var\(--home-client-logo-duration,\s*54s\)\s+linear\s+infinite;/)
    expect(indexCss).toMatch(/\.home-client-logo-marquee__scroller\[data-scroll-velocity-enhanced="true"\]\s*\{[^}]*animation:\s*none;/s)
    expect(indexCss).toMatch(/translate3d\(calc\(-50% - 0\.75rem\), 0, 0\)/)
  })

  it('keeps the base logo marquee pace until scroll velocity accelerates it', async () => {
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

    vi.useFakeTimers()

    const carousel = screen.getByTestId('home-client-logo-carousel')
    expect(carousel).toHaveStyle({ '--home-client-logo-duration': '54s' })

    act(() => {
      window.scrollY = 240
      window.dispatchEvent(new Event('scroll'))
    })

    expect(carousel.style.getPropertyValue('--home-client-logo-duration')).toBe('18s')

    act(() => {
      vi.advanceTimersByTime(260)
    })

    expect(carousel).toHaveStyle({ '--home-client-logo-duration': '54s' })
  })
})
