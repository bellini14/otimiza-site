import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import Header from './Header'

function renderHeader(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Header />
    </MemoryRouter>,
  )
}

function setScrollY(value) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value,
  })
}

describe('Header', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
    setScrollY(0)
  })

  it('renders the redesigned navigation structure and opens the mobile menu', () => {
    renderHeader()

    expect(screen.getByRole('link', { name: 'Otimiza home' })).toBeInTheDocument()
    expect(screen.getByAltText('Otimiza')).toBeInTheDocument()

    const mainNav = screen.getByRole('navigation', { name: 'Main navigation' })
    const desktopMenuItems = within(mainNav)
      .getAllByText(/Quem somos|Nossa abordagem|O que fazemos|Cases|Inspire/)
      .filter((item) => ['Quem somos', 'Nossa abordagem', 'O que fazemos', 'Cases', 'Inspire'].includes(item.textContent))

    expect(desktopMenuItems.map((item) => item.textContent)).toEqual([
      'Quem somos',
      'Nossa abordagem',
      'O que fazemos',
      'Cases',
      'Inspire',
    ])
    expect(within(mainNav).getByRole('link', { name: 'Nossa abordagem' })).toHaveAttribute('href', '/nossa-abordagem')
    expect(within(mainNav).getByRole('link', { name: 'O que fazemos' })).toHaveAttribute('href', '/o-que-fazemos')
    expect(within(mainNav).getByRole('link', { name: 'Cases' })).toHaveAttribute('href', '/cases')
    expect(within(mainNav).getByRole('link', { name: 'Nossa abordagem' })).not.toHaveClass('opacity-30')
    expect(within(mainNav).getByRole('link', { name: 'Cases' })).not.toHaveClass('opacity-30')
    expect(screen.queryByRole('button', { name: 'Soluções' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Fale com a Otimiza' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))

    const mobileMenu = screen.getByRole('dialog', { name: 'Menu principal' })
    const menuScope = within(mobileMenu)
    const mobileNav = within(menuScope.getByRole('navigation', { name: 'Mobile navigation' }))

    expect(mobileNav.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(mobileNav.getByRole('link', { name: 'Quem somos' })).toBeInTheDocument()
    expect(mobileNav.getByRole('link', { name: 'Nossa abordagem' })).toHaveAttribute('href', '/nossa-abordagem')
    expect(mobileNav.getByRole('link', { name: 'O que fazemos' })).toHaveAttribute('href', '/o-que-fazemos')
    expect(mobileNav.getByRole('link', { name: 'Cases' })).toHaveAttribute('href', '/cases')
    expect(mobileNav.getByRole('link', { name: 'Nossa abordagem' })).not.toHaveClass('opacity-30')
    expect(mobileNav.getByRole('link', { name: 'Cases' })).not.toHaveClass('opacity-30')
    expect(mobileNav.queryByRole('link', { name: 'Tecnologia' })).not.toBeInTheDocument()
    expect(mobileNav.queryByRole('link', { name: 'Academia Otimiza' })).not.toBeInTheDocument()
    expect(mobileNav.queryByRole('link', { name: 'Contato' })).not.toBeInTheDocument()
  })

  it('toggles the global theme manually and persists the selection', () => {
    renderHeader()

    const themeToggle = screen.getByRole('button', { name: 'Ativar tema escuro' })

    expect(themeToggle).toHaveAttribute('aria-pressed', 'false')
    expect(themeToggle).toHaveAttribute('data-theme-icon', 'moon')
    expect(document.documentElement).not.toHaveClass('dark')

    fireEvent.click(themeToggle)

    expect(screen.getByRole('button', { name: 'Ativar tema claro' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Ativar tema claro' })).toHaveAttribute('data-theme-icon', 'sun')
    expect(document.documentElement).toHaveClass('dark')
    expect(window.localStorage.getItem('theme')).toBe('dark')
  })

  it('restores the saved dark theme on initial render', () => {
    window.localStorage.setItem('theme', 'dark')

    renderHeader()

    expect(screen.getByRole('button', { name: 'Ativar tema claro' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Ativar tema claro' })).toHaveAttribute('data-theme-icon', 'sun')
    expect(document.documentElement).toHaveClass('dark')
  })

  it('opens the language menu and persists the selected locale', () => {
    renderHeader()

    const languageTrigger = screen.getByRole('button', { name: 'Selecionar idioma' })

    expect(languageTrigger).toHaveAttribute('aria-expanded', 'false')
    expect(languageTrigger).toHaveTextContent('pt-BR')
    expect(languageTrigger).toHaveClass('w-[7.5rem]', 'whitespace-nowrap')
    expect(within(languageTrigger).getByTestId('flag-pt-BR')).toBeInTheDocument()

    fireEvent.click(languageTrigger)

    const languageMenu = screen.getByRole('menu', { name: 'Opções de idioma' })
    expect(languageTrigger).toHaveAttribute('aria-expanded', 'true')
    expect(languageMenu).toHaveClass('left-1/2', '-translate-x-1/2')
    expect(within(languageMenu).queryByText('Brasil')).not.toBeInTheDocument()
    expect(within(languageMenu).queryByText('United States')).not.toBeInTheDocument()
    expect(within(languageMenu).getByText('en-US')).toHaveClass('whitespace-nowrap')
    expect(within(languageMenu).getByRole('menuitemradio', { name: 'pt-BR' })).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(within(languageMenu).getByRole('menuitemradio', { name: 'en-US' }))

    expect(languageTrigger).toHaveTextContent('en-US')
    expect(languageTrigger).toHaveAttribute('aria-expanded', 'false')
    expect(within(languageTrigger).getByTestId('flag-en-US')).toBeInTheDocument()
    expect(window.localStorage.getItem('locale')).toBe('en-US')
  })

  it('restores the locale and dismisses the language menu with Escape or an outside click', () => {
    window.localStorage.setItem('locale', 'en-US')
    renderHeader()

    const languageTrigger = screen.getByRole('button', { name: 'Selecionar idioma' })
    expect(languageTrigger).toHaveTextContent('en-US')

    fireEvent.click(languageTrigger)
    expect(screen.getByRole('menu', { name: 'Opções de idioma' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu', { name: 'Opções de idioma' })).not.toBeInTheDocument()

    fireEvent.click(languageTrigger)
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('menu', { name: 'Opções de idioma' })).not.toBeInTheDocument()
  })

  it('anchors the mobile menu animation below the docked header', () => {
    renderHeader()

    setScrollY(120)
    fireEvent.scroll(window)

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))

    const mobileMenu = screen.getByRole('dialog', { name: 'Menu principal' })

    expect(mobileMenu).toHaveClass('top-[5.9rem]', 'sm:top-[6.15rem]', 'origin-top')
    expect(mobileMenu).toHaveClass('translate-y-0', 'opacity-100', 'scale-100')
  })

  it('scales the complete menu by two successive five-percent increases without rasterizing SVGs', () => {
    renderHeader()

    const menuSurface = screen.getByTestId('main-menu-surface')

    expect(menuSurface).toHaveClass('[zoom:1.1025]')
    expect(menuSurface).toHaveClass('w-full')
    expect(menuSurface).not.toHaveClass('transform-gpu')
    expect(menuSurface).toHaveClass('px-5', 'py-3')
  })

  it('hides the nav while scrolling down and shows it when scrolling up', () => {
    renderHeader()

    const mainNav = screen.getByRole('navigation', { name: 'Main navigation' })

    setScrollY(160)
    fireEvent.scroll(window)

    expect(mainNav).toHaveClass('-translate-y-[115%]', 'opacity-0')

    setScrollY(90)
    fireEvent.scroll(window)

    expect(mainNav).toHaveClass('translate-y-0', 'opacity-100')
  })
})
