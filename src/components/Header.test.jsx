import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
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

    const mobileMenuTrigger = screen.getByRole('button', { name: /abrir menu/i })
    expect(mobileMenuTrigger).toHaveTextContent('Menu')

    fireEvent.click(mobileMenuTrigger)

    const mobileMenu = screen.getByRole('dialog', { name: 'Menu principal' })
    const menuScope = within(mobileMenu)
    const mobileNav = within(menuScope.getByRole('navigation', { name: 'Mobile navigation' }))

    expect(mobileMenu).toHaveClass('px-5')
    expect(mobileMenu).toHaveClass('bg-[#1B1B1B]')
    expect(mobileMenu).not.toHaveClass('bg-[#050505]')
    expect(mobileMenu).not.toHaveClass('px-0', 'px-6')
    expect(mobileMenu.querySelector('.mobile-menu-content')).toHaveClass('px-5', 'pb-[3.875rem]')
    expect(mobileMenu.querySelector('.mobile-menu-content')).not.toHaveClass('px-[3.875rem]')
    expect(mobileMenu.querySelector('.mobile-menu-content')).not.toHaveClass('pt-[2.25rem]')
    expect(mobileNav.getByRole('link', { name: 'Quem somos' })).toBeInTheDocument()
    expect(mobileNav.getByRole('link', { name: 'Quem somos' }).querySelectorAll('.mobile-menu-link-char')).toHaveLength(0)
    expect(mobileNav.getByRole('link', { name: 'Nossa abordagem' })).toHaveAttribute('href', '/nossa-abordagem')
    expect(mobileNav.getByRole('link', { name: 'O que fazemos' })).toHaveAttribute('href', '/o-que-fazemos')
    expect(mobileNav.getByRole('link', { name: 'Cases' })).toHaveAttribute('href', '/cases')
    expect(mobileNav.getByRole('link', { name: 'Nossa abordagem' })).not.toHaveClass('opacity-30')
    expect(mobileNav.getByRole('link', { name: 'Cases' })).not.toHaveClass('opacity-30')
    expect(mobileNav.queryByRole('link', { name: 'Tecnologia' })).not.toBeInTheDocument()
    expect(mobileNav.queryByRole('link', { name: 'Academia Otimiza' })).not.toBeInTheDocument()
    expect(mobileNav.getByRole('link', { name: 'Contato' })).toHaveAttribute('href', '/contato')
    expect(mobileNav.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    expect(menuScope.queryByText('Navegacao')).not.toBeInTheDocument()
    expect(menuScope.queryByText(/Acesse as principais/i)).not.toBeInTheDocument()
    expect(menuScope.queryByRole('link', { name: 'Fale com a Otimiza' })).not.toBeInTheDocument()
    const closeMenuButton = screen.getByRole('button', { name: /fechar menu/i })
    expect(closeMenuButton).toHaveTextContent('Fechar')
    expect(closeMenuButton).toHaveClass(
      'header-mobile-only',
      'min-w-[5.25rem]',
      'text-[19px]',
      'text-white',
    )
    expect(closeMenuButton).not.toHaveClass('uppercase')
    expect(menuScope.queryByRole('button', { name: /fechar menu/i })).not.toBeInTheDocument()
    expect(menuScope.queryByRole('link', { name: 'Otimiza menu home' })).not.toBeInTheDocument()
    expect(menuScope.getByRole('navigation', { name: 'Mobile navigation' })).toHaveClass('px-0', 'pt-20')
    expect(menuScope.getByRole('navigation', { name: 'Mobile navigation' })).not.toHaveClass('pr-16')
    expect(mobileNav.getByRole('link', { name: 'Quem somos' })).toHaveClass('w-fit')
    expect(mobileNav.getByRole('link', { name: 'Quem somos' })).toHaveClass('text-[clamp(1.9rem,9vw,3.1rem)]')
    expect(mobileNav.getByRole('link', { name: 'Quem somos' })).toHaveClass('text-white')
    expect(mobileNav.getByRole('link', { name: 'Quem somos' })).not.toHaveClass('text-[clamp(1.7rem,8.4vw,2.8rem)]')
    expect(mobileNav.getByRole('link', { name: 'Nossa abordagem' })).toHaveClass('w-fit')
    expect(mobileMenu.querySelector('.mobile-menu-content')).toHaveClass('w-full')
    expect(mobileMenu.querySelector('.mobile-menu-footer')).toHaveClass('w-full', 'text-[15px]', 'text-white')
    expect(menuScope.queryByText(/2024 All rights reserved/)).not.toBeInTheDocument()
    expect(menuScope.queryByText('Built with React & Tailwind')).not.toBeInTheDocument()
    expect(menuScope.queryByRole('link', { name: 'pt-BR' })).not.toBeInTheDocument()
    expect(menuScope.getByRole('button', { name: 'en-US' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Otimiza home' })).not.toHaveClass('header-logo-link--menu-open')
    expect(screen.getByRole('link', { name: 'Otimiza home' })).toHaveClass('z-[60]')
    expect(screen.getByAltText('Otimiza')).toHaveClass('header-logo--menu-open')
    expect(screen.getByAltText('Otimiza')).toHaveClass('header-logo--mobile-large')
    const stylesheet = readFileSync('src/index.css', 'utf8')
    expect(stylesheet).toContain('filter: brightness(0) invert(1);')
    expect(stylesheet).not.toContain(
      'filter: brightness(0) saturate(100%) invert(40%) sepia(13%) saturate(506%) hue-rotate(169deg) brightness(91%) contrast(87%);',
    )
  })

  it('keeps mobile menu words indivisible without creating per-character animation layers', () => {
    renderHeader()

    fireEvent.click(screen.getByRole('button', { name: /abrir menu/i }))

    const mobileMenu = screen.getByRole('dialog', { name: 'Menu principal' })
    const mobileNav = within(mobileMenu).getByRole('navigation', { name: 'Mobile navigation' })
    const link = within(mobileNav).getByRole('link', { name: 'Nossa abordagem' })
    const words = link.querySelectorAll('.mobile-menu-link-word')

    expect(words).toHaveLength(2)
    expect(words[0]).toHaveTextContent('Nossa')
    expect(words[1]).toHaveTextContent('abordagem')
    expect(Array.from(link.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && node.textContent === ' ')).toBe(true)
    expect(link.querySelectorAll('.mobile-menu-link-char')).toHaveLength(0)
  })

  it('disables the dark theme and removes its menu control', () => {
    window.localStorage.setItem('theme', 'dark')
    document.documentElement.classList.add('dark')

    renderHeader()

    expect(screen.queryByRole('button', { name: /ativar tema/i })).not.toBeInTheDocument()
    expect(document.documentElement).not.toHaveClass('dark')
    expect(window.localStorage.getItem('theme')).toBeNull()
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

  it('shows only the inactive language action in the mobile menu footer', () => {
    renderHeader()

    fireEvent.click(screen.getByRole('button', { name: /abrir menu/i }))
    const mobileMenu = screen.getByRole('dialog', { name: 'Menu principal' })
    const menuScope = within(mobileMenu)

    expect(menuScope.getByRole('button', { name: 'en-US' })).toBeInTheDocument()
    expect(menuScope.queryByRole('button', { name: 'pt-BR' })).not.toBeInTheDocument()

    fireEvent.click(menuScope.getByRole('button', { name: 'en-US' }))

    expect(window.localStorage.getItem('locale')).toBe('en-US')
    expect(menuScope.getByRole('button', { name: 'pt-BR' })).toBeInTheDocument()
    expect(menuScope.queryByRole('button', { name: 'en-US' })).not.toBeInTheDocument()
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

    fireEvent.click(screen.getByRole('button', { name: /abrir menu/i }))

    const mobileMenu = screen.getByRole('dialog', { name: 'Menu principal' })

    expect(mobileMenu).toHaveClass('mobile-menu-panel', 'mobile-menu-panel--open')
    expect(mobileMenu).toHaveClass('origin-top')
    expect(mobileMenu).not.toHaveClass('translate-y-0', '-translate-y-3')
  })

  it('opens the black mobile overlay as a downward veil', () => {
    const stylesheet = readFileSync('src/index.css', 'utf8')

    expect(stylesheet).toContain('.mobile-menu-panel {')
    expect(stylesheet).toContain('transform: scaleY(0);')
    expect(stylesheet).toContain('transform-origin: top;')
    expect(stylesheet).toContain('.mobile-menu-panel--open {')
    expect(stylesheet).toContain('transform: scaleY(1);')
    expect(stylesheet).toContain('transition:')
    expect(stylesheet).toContain('transform 520ms cubic-bezier(0.22, 1, 0.36, 1)')
  })

  it('animates each mobile menu link as a single compositing layer', () => {
    const stylesheet = readFileSync('src/index.css', 'utf8')

    expect(stylesheet).toContain('@keyframes mobile-menu-link-cascade')
    expect(stylesheet).toContain('.mobile-menu-panel--open .mobile-menu-link {')
    expect(stylesheet).toContain('animation: mobile-menu-link-cascade 520ms cubic-bezier(0.215, 0.61, 0.355, 1) both;')
    expect(stylesheet).toContain('calc(180ms + (var(--mobile-menu-link-index) * 95ms))')
    expect(stylesheet).toContain('transform: translateY(22px);')
    expect(stylesheet).not.toContain('@keyframes mobile-menu-title-char-reveal')
    expect(stylesheet).not.toContain('.mobile-menu-panel--open .mobile-menu-link-char')
    expect(stylesheet).not.toContain('calc(var(--mobile-menu-char-index) * 14ms)')
  })

  it('scales every desktop menu element fluidly and switches to mobile at 770px', () => {
    renderHeader()

    const menuSurface = screen.getByTestId('main-menu-surface')
    const menuCapsule = menuSurface.querySelector('.header-menu-capsule')
    const mainNav = screen.getByRole('navigation', { name: 'Main navigation' })
    const desktopLinks = within(mainNav).getByTestId('desktop-menu-links')
    const mobileToggle = screen.getByRole('button', { name: /abrir menu/i })
    const stylesheet = readFileSync('src/index.css', 'utf8')

    expect(menuSurface).toHaveClass('header-menu-surface', 'header-responsive-scale')
    expect(menuCapsule).toBeInTheDocument()
    expect(stylesheet).toContain('@media (max-width: 770px)')
    expect(stylesheet).toContain('.header-menu-capsule {')
    expect(stylesheet).toContain('display: none;')
    expect(desktopLinks).toHaveClass('header-desktop-only', 'whitespace-nowrap')
    expect(screen.getByRole('link', { name: 'Otimiza home' })).toHaveClass('header-logo-link')
    expect(screen.getByAltText('Otimiza')).toHaveClass('header-logo')
    expect(screen.getByAltText('Otimiza')).toHaveClass('header-logo--mobile-large')
    expect(screen.getByAltText('Otimiza')).not.toHaveClass('sm:h-12', 'md:h-[3.25rem]')
    expect(screen.getByRole('button', { name: 'Selecionar idioma' })).toHaveClass('header-language-trigger')
    expect(screen.getByRole('link', { name: 'Fale com a Otimiza' })).toHaveClass('header-contact-link')
    expect(screen.getByRole('button', { name: 'Selecionar idioma' }).parentElement.parentElement).toHaveClass(
      'header-secondary-actions',
    )
    expect(mobileToggle).toHaveClass('header-mobile-only')
    expect(mobileToggle).toHaveClass('h-12', 'min-w-[5.25rem]', 'px-5', 'text-[19px]')
  })

  it('interpolates the shared header unit from 770px through 1320px', () => {
    const stylesheet = readFileSync('src/index.css', 'utf8')

    expect(stylesheet).toContain(
      '--header-unit: clamp(0.72rem, calc(0.328rem + 0.81455vw), 1rem);',
    )
    expect(stylesheet).toContain(
      '@media (min-width: 771px) and (max-width: 1149px)',
    )
  })

  it('keeps the secondary actions visible in compact form until the 770px mobile boundary', () => {
    renderHeader()

    const languageTrigger = screen.getByRole('button', { name: 'Selecionar idioma' })
    const contactLink = screen.getByRole('link', { name: 'Fale com a Otimiza' })
    const stylesheet = readFileSync('src/index.css', 'utf8')

    expect(within(languageTrigger).getByText('pt-BR')).toHaveClass('header-language-label')
    expect(languageTrigger.querySelector('.header-language-chevron')).toBeInTheDocument()
    expect(contactLink).toHaveClass('header-contact-link')
    expect(within(contactLink).getByText('Fale com a Otimiza')).toHaveClass('header-contact-label')
    expect(within(contactLink).getByTestId('contact-icon')).toBeInTheDocument()
    expect(stylesheet).not.toMatch(
      /@media \(min-width: 771px\) and \(max-width: 1149px\)[\s\S]*?\.header-secondary-actions\s*\{\s*display:\s*none/,
    )
    expect(stylesheet).toContain('.header-language-label,')
    expect(stylesheet).toContain('.header-language-chevron,')
    expect(stylesheet).toContain('.header-contact-label {')
    expect(stylesheet).toContain('width: calc(2.875 * var(--header-unit));')
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
