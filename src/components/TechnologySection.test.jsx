import { readFileSync } from 'node:fs'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import TechnologySection from './TechnologySection'

afterEach(() => {
  cleanup()
})

describe('TechnologySection', () => {
  it('uses a white section background', () => {
    const { container } = render(
      <MemoryRouter>
        <TechnologySection />
      </MemoryRouter>,
    )

    expect(container.firstElementChild).toHaveClass('bg-white')
  })

  it('renders two identical cycles in every infinite image-mask track', () => {
    render(
      <MemoryRouter>
        <TechnologySection />
      </MemoryRouter>,
    )

    const tracks = screen.getAllByTestId('technology-marquee-track')
    expect(tracks).toHaveLength(2)

    tracks.forEach((track) => {
      const cycles = within(track).getAllByTestId('technology-marquee-cycle')

      expect(cycles).toHaveLength(2)
      expect(cycles[0].children).toHaveLength(20)
      expect(cycles[1].children).toHaveLength(20)
    })
  })

  it('keeps the mobile text hierarchy compact and readable', () => {
    render(
      <MemoryRouter>
        <TechnologySection />
      </MemoryRouter>,
    )

    const title = screen.getByRole('heading', { name: 'Nossa Tecnologia' })
    const body = screen.getByRole('heading', {
      name: /E assim, são todos os serviços de consultoria/i,
    })
    const imagePanel = screen.getByTestId('technology-image-panel')

    expect(title).toHaveClass('text-[2.5rem]', 'leading-[1.05]', 'sm:text-5xl')
    expect(body).toHaveClass('max-w-[25rem]', 'text-[1.25rem]', 'leading-[1.45]', 'sm:text-3xl')
    expect(imagePanel).toHaveClass('h-[320px]', 'sm:h-[460px]')
    expect(imagePanel).not.toHaveClass('h-[400px]', 'sm:h-[500px]')
  })

  it('uses the local OTMSuite factory image in the technology panel', () => {
    render(
      <MemoryRouter>
        <TechnologySection />
      </MemoryRouter>,
    )

    const image = screen.getByAltText('Profissional utilizando OTMSuite em ambiente industrial')

    expect(image).toHaveAttribute('src', expect.stringContaining('technology-otmsuite-factory.png'))
    expect(image).not.toHaveAttribute('src', expect.stringContaining('images.unsplash.com'))
  })

  it('opens the OTMSuite website safely in a new tab', () => {
    render(
      <MemoryRouter>
        <TechnologySection />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: 'Saiba mais' })

    expect(link).toHaveAttribute('href', 'https://otmsuite.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('prioritizes the right side of the technology image only on desktop', () => {
    render(
      <MemoryRouter>
        <TechnologySection />
      </MemoryRouter>,
    )

    const image = screen.getByAltText('Profissional utilizando OTMSuite em ambiente industrial')

    expect(image).toHaveClass('lg:object-right')
    expect(image).not.toHaveClass('object-right')
  })

  it('loops both image-mask tracks continuously over one exact duplicated cycle', () => {
    const css = readFileSync('src/index.css', 'utf8')

    expect(css).toMatch(
      /\.technology-marquee__track\s*\{[^}]*animation:\s*technology-marquee-vertical\s+80s\s+linear\s+infinite;/s,
    )
    expect(css).toMatch(
      /\.technology-marquee__track--reverse\s*\{[^}]*animation-direction:\s*reverse;/s,
    )
    expect(css).toMatch(
      /@keyframes\s+technology-marquee-vertical\s*\{[\s\S]*to\s*\{[^}]*transform:\s*translate3d\(0,\s*-50%,\s*0\);/s,
    )
  })
})
