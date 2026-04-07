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

describe('Header', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('renders the redesigned navigation structure and opens the mobile menu', () => {
    renderHeader()

    expect(screen.getByRole('link', { name: 'Otimiza home' })).toBeInTheDocument()
    expect(screen.getByAltText('Otimiza')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Institucional' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Soluções' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cases' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Insights e Blog' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Fale com a Otimiza' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))

    const mobileMenu = screen.getByRole('dialog', { name: 'Menu principal' })
    const menuScope = within(mobileMenu)
    const mobileNav = within(menuScope.getByRole('navigation', { name: 'Mobile navigation' }))

    expect(mobileNav.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(mobileNav.getByRole('link', { name: 'Quem somos' })).toBeInTheDocument()
    expect(mobileNav.getByRole('link', { name: 'O que fazemos' })).toBeInTheDocument()
    expect(mobileNav.getByRole('link', { name: 'Tecnologia' })).toBeInTheDocument()
    expect(mobileNav.getByRole('link', { name: 'Academia Otimiza' })).toBeInTheDocument()
    expect(mobileNav.getByRole('link', { name: 'Contato' })).toBeInTheDocument()
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
})
