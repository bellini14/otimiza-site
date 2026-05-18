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
    expect(within(mainNav).queryByRole('link', { name: 'Nossa abordagem' })).not.toBeInTheDocument()
    expect(within(mainNav).queryByRole('link', { name: 'O que fazemos' })).not.toBeInTheDocument()
    expect(within(mainNav).queryByRole('link', { name: 'Cases' })).not.toBeInTheDocument()
    expect(within(mainNav).getByText('Nossa abordagem')).toHaveClass('opacity-30')
    expect(within(mainNav).getByText('O que fazemos')).toHaveClass('opacity-30')
    expect(within(mainNav).getByText('Cases')).toHaveClass('opacity-30')
    expect(screen.queryByRole('button', { name: 'Soluções' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Fale com a Otimiza' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))

    const mobileMenu = screen.getByRole('dialog', { name: 'Menu principal' })
    const menuScope = within(mobileMenu)
    const mobileNav = within(menuScope.getByRole('navigation', { name: 'Mobile navigation' }))

    expect(mobileNav.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(mobileNav.getByRole('link', { name: 'Quem somos' })).toBeInTheDocument()
    expect(mobileNav.queryByRole('link', { name: 'Nossa abordagem' })).not.toBeInTheDocument()
    expect(mobileNav.queryByRole('link', { name: 'O que fazemos' })).not.toBeInTheDocument()
    expect(mobileNav.queryByRole('link', { name: 'Cases' })).not.toBeInTheDocument()
    expect(mobileNav.getByText('Nossa abordagem')).toHaveClass('opacity-30')
    expect(mobileNav.getByText('O que fazemos')).toHaveClass('opacity-30')
    expect(mobileNav.getByText('Cases')).toHaveClass('opacity-30')
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

  it('anchors the mobile menu animation below the docked header', () => {
    renderHeader()

    setScrollY(120)
    fireEvent.scroll(window)

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))

    const mobileMenu = screen.getByRole('dialog', { name: 'Menu principal' })

    expect(mobileMenu).toHaveClass('top-[5.9rem]', 'sm:top-[6.15rem]', 'origin-top')
    expect(mobileMenu).toHaveClass('translate-y-0', 'opacity-100', 'scale-100')
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
