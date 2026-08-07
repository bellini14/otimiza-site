import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logoOtimiza from '../assets/logo-otimiza.svg'

const dropdownGroups = []

const directLinks = [
  { path: '/quem-somos', label: 'Quem somos' },
  { path: '/nossa-abordagem', label: 'Nossa abordagem' },
  { path: '/o-que-fazemos', label: 'O que fazemos' },
  { path: '/cases', label: 'Cases' },
  { path: '/inspire', label: 'Inspire' },
]

const disabledNavLabels = new Set()

const mobileLinks = [
  ...directLinks.map((item) => ({
    ...item,
    disabled: disabledNavLabels.has(item.label),
  })),
  { path: '/contato', label: 'Contato', disabled: disabledNavLabels.has('Contato') },
]

function AnimatedMobileMenuLabel({ label }) {
  const tokens = Array.from(label.matchAll(/\S+|\s+/g))

  return (
    <>
      {tokens.map((tokenMatch) => {
        const token = tokenMatch[0]
        const tokenStart = tokenMatch.index

        if (/^\s+$/.test(token)) return token

        return (
          <span key={`${token}-${tokenStart}`} className="mobile-menu-link-word" aria-hidden="true">
            {token}
          </span>
        )
      })}
      <span className="sr-only">{label}</span>
    </>
  )
}

function BrazilFlag({ className = '' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} data-testid="flag-pt-BR" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#6DA544" />
      <path d="M16 6.25 29.1 16 16 25.75 2.9 16 16 6.25Z" fill="#FFDA44" />
      <circle cx="16" cy="16" r="5.55" fill="#0052B4" />
      <defs>
        <clipPath id="language-brazil-globe">
          <circle cx="16" cy="16" r="5.55" />
        </clipPath>
      </defs>
      <path d="M9.9 14.35c4.3-.95 9.05.18 12.45 3.25l-1.4 2.05c-2.95-2.75-7.1-3.72-10.85-2.85Z" fill="#F0F0F0" clipPath="url(#language-brazil-globe)" />
    </svg>
  )
}

function UnitedStatesFlag({ className = '' }) {
  const stars = [
    [5, 3], [11, 3],
    [1, 7], [7, 7], [13, 7],
    [3, 11], [9, 11], [15, 11],
    [1, 15], [7, 15], [13, 15],
  ]

  return (
    <svg viewBox="0 0 32 32" className={className} data-testid="flag-en-US" aria-hidden="true">
      <defs>
        <clipPath id="language-us-flag-circle">
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath="url(#language-us-flag-circle)">
        <rect width="32" height="32" fill="#F0F0F0" />
        <path d="M0 3.5h32v4H0zm0 8h32v4H0zm0 8h32v4H0zm0 8h32v4H0z" fill="#E4002B" />
        <path d="M0 0h16v16H0z" fill="#0052B4" />
        {stars.map(([x, y]) => (
          <path
            key={`${x}-${y}`}
            d="M0-2.15.64-.7 2.05-.66.95.27 1.27 1.7 0 .9-1.27 1.7-.95.27-2.05-.66-.64-.7Z"
            transform={`translate(${x} ${y})`}
            fill="#F0F0F0"
          />
        ))}
      </g>
    </svg>
  )
}

const languages = [
  { locale: 'pt-BR', Flag: BrazilFlag },
  { locale: 'en-US', Flag: UnitedStatesFlag },
]

// Keep the selector implementation ready for the next multilingual release.
const SHOW_LANGUAGE_SELECTOR = false

function getInitialLocale() {
  if (typeof window === 'undefined') return 'pt-BR'

  const savedLocale = window.localStorage.getItem('locale')
  return languages.some(({ locale }) => locale === savedLocale) ? savedLocale : 'pt-BR'
}

function LanguageSelector() {
  const [locale, setLocale] = useState(getInitialLocale)
  const [isOpen, setIsOpen] = useState(false)
  const selectorRef = useRef(null)
  const selectedLanguage = languages.find((language) => language.locale === locale) ?? languages[0]
  const SelectedFlag = selectedLanguage.Flag

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    const closeOnOutsideClick = (event) => {
      if (!selectorRef.current?.contains(event.target)) setIsOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('mousedown', closeOnOutsideClick)
    }
  }, [])

  const selectLanguage = (nextLocale) => {
    setLocale(nextLocale)
    window.localStorage.setItem('locale', nextLocale)
    setIsOpen(false)
  }

  return (
    <div ref={selectorRef} className="header-desktop-only header-language-selector relative">
      <button
        type="button"
        className="header-language-trigger inline-flex h-10 w-[7.5rem] items-center justify-center gap-2.5 whitespace-nowrap rounded-[1rem] bg-[#efeff4]/90 px-3.5 text-[14px] font-[400] text-[#5a6572] ring-1 ring-[#434b54]/5 drop-shadow-sm backdrop-blur-md transition-all hover:bg-[#e2e2e8] dark:bg-white/10 dark:text-white/90 dark:ring-white/10 dark:hover:bg-white/20 dark:hover:text-white"
        aria-label="Selecionar idioma"
        aria-haspopup="menu"
        aria-controls="language-options"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <SelectedFlag className="h-[18px] w-[18px] shrink-0 drop-shadow-sm" />
        <span className="header-language-label">{selectedLanguage.locale}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`header-language-chevron h-3.5 w-3.5 opacity-50 transition-transform dark:opacity-70 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          id="language-options"
          role="menu"
          aria-label="Opções de idioma"
          className="absolute left-1/2 top-full mt-2.5 w-[9.5rem] -translate-x-1/2 rounded-[1.2rem] border border-[#434b54]/10 bg-white/95 p-2 shadow-[0_20px_50px_rgba(67,75,84,0.14)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#131b24]/95 dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {languages.map(({ locale: optionLocale, Flag }) => {
            const isSelected = optionLocale === locale
            const OptionFlag = Flag
            return (
              <button
                key={optionLocale}
                type="button"
                role="menuitemradio"
                aria-label={optionLocale}
                aria-checked={isSelected}
                onClick={() => selectLanguage(optionLocale)}
                className={`flex w-full items-center gap-2.5 rounded-[0.9rem] px-3 py-2.5 text-left transition-colors ${
                  isSelected
                    ? 'bg-[#434b54]/[0.08] text-[#434b54] dark:bg-white/10 dark:text-white'
                    : 'text-[#5a6572] hover:bg-[#434b54]/5 dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                <OptionFlag className="h-6 w-6 shrink-0 drop-shadow-sm" />
                <span className="min-w-0 flex-1 whitespace-nowrap text-[13.5px] font-[500] leading-tight">{optionLocale}</span>
                {isSelected && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 shrink-0 opacity-70"
                    aria-hidden="true"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [mobileLocale, setMobileLocale] = useState(getInitialLocale)
  const lastScrollYRef = useRef(0)
  
  // Animation states
  const [isTop, setIsTop] = useState(true)
  const [isNavHidden, setIsNavHidden] = useState(false)
  
  const location = useLocation()

  const isActive = (path) => location.pathname === path
  const isGroupActive = (items) => items.some((item) => isActive(item.path))

  const closeAll = useCallback(() => {
    setMenuOpen(false)
    setOpenDropdown(null)
  }, [])

  const toggleMenu = () => {
    setMenuOpen((current) => !current)
  }

  const toggleDropdown = (label) => {
    setOpenDropdown((current) => (current === label ? null : label))
  }

  const inactiveMobileLocale = mobileLocale === 'pt-BR' ? 'en-US' : 'pt-BR'

  const selectInactiveMobileLocale = () => {
    setMobileLocale(inactiveMobileLocale)
    window.localStorage.setItem('locale', inactiveMobileLocale)
  }

  useEffect(() => {
    document.documentElement.classList.remove('dark')
    window.localStorage.removeItem('theme')
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    document.documentElement.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closeAll()
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [closeAll])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = Math.max(window.scrollY, 0)
      const scrollDelta = currentScrollY - lastScrollYRef.current

      setIsTop((current) => {
        const next = current ? currentScrollY < 48 : currentScrollY < 20
        return next === current ? current : next
      })

      if (currentScrollY < 64) {
        setIsNavHidden(false)
      } else if (scrollDelta > 6) {
        setIsNavHidden(true)
      } else if (scrollDelta < -6) {
        setIsNavHidden(false)
      }

      lastScrollYRef.current = currentScrollY
    }

    lastScrollYRef.current = Math.max(window.scrollY, 0)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const shouldHideNav = isNavHidden && !menuOpen && !openDropdown

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 transition-[padding,transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          menuOpen ? 'z-[60]' : 'z-40'
        } ${
          isTop ? 'px-0 pt-0 sm:px-0 lg:px-0' : 'px-4 pt-3 sm:px-6 lg:px-8'
        } ${
          shouldHideNav ? '-translate-y-[115%] opacity-0' : 'translate-y-0 opacity-100'
        } header-main-nav`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div
          data-testid="main-menu-surface"
          className={`header-menu-surface header-responsive-scale mx-auto w-full transition-[max-width,border-radius,padding] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] relative z-10 ${
            isTop
              ? 'max-w-full rounded-none bg-transparent px-5 py-3 sm:px-7 lg:px-10'
              : 'max-w-[1320px] rounded-[1.25rem] px-4 py-2.5 sm:px-5'
          }`}
        >
          <div
            className={`header-menu-capsule absolute inset-0 rounded-[1.25rem] border border-[#434b54]/10 bg-white/95 shadow-[0_14px_42px_rgba(67,75,84,0.08)] backdrop-blur-2xl transition-[opacity,transform,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-white/10 dark:bg-[#0f172a]/90 dark:shadow-[0_14px_42px_rgba(0,0,0,0.48)] ${
              isTop ? 'opacity-0 scale-[0.985]' : 'opacity-100 scale-100'
            }`}
            aria-hidden="true"
          />

          <div className="header-menu-row relative z-10 flex items-center justify-between gap-5">
            <div className="header-menu-primary flex items-center gap-5 lg:gap-7">
              <Link
                to="/"
                aria-label="Otimiza home"
                className={`header-logo-link flex items-center ${menuOpen ? 'z-[60]' : 'z-50'}`}
                onClick={closeAll}
              >
                <img
                  src={logoOtimiza}
                  alt="Otimiza"
                  className={`header-logo header-logo--mobile-large -mt-[2px] w-auto dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.15)] ${
                    menuOpen ? 'header-logo--menu-open' : ''
                  }`}
                />
              </Link>

              <div data-testid="desktop-menu-links" className="header-desktop-only header-desktop-links items-center gap-1 whitespace-nowrap">
                {dropdownGroups.map((group) => (
                  <div
                    key={group.id}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(group.label)}
                    onMouseLeave={() => setOpenDropdown((current) => (current === group.label ? null : current))}
                  >
                    <button
                      type="button"
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[16px] transition-all duration-200 ${
                        isGroupActive(group.items)
                          ? 'font-[400] text-[#5a6572] dark:text-white'
                          : 'font-[400] text-[#5a6572] dark:text-white/90 hover:text-[#5a6572] dark:hover:text-white'
                      }`}
                      aria-expanded={openDropdown === group.label}
                      aria-controls={`dropdown-${group.id}`}
                      onClick={() => toggleDropdown(group.label)}
                    >
                      {group.label}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-4 w-4 transition-transform ${
                          openDropdown === group.label ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>

                    <div
                      id={`dropdown-${group.id}`}
                      className={`absolute left-0 top-full mt-2.5 w-[16rem] origin-top-left rounded-[1.35rem] border border-[#434b54]/10 dark:border-white/5 bg-white/95 dark:bg-[#131b24]/90 p-2.5 shadow-[0_24px_60px_rgba(67,75,84,0.12)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-300 ${
                        openDropdown === group.label
                          ? 'visible translate-y-0 opacity-100 scale-100'
                          : 'invisible -translate-y-2 opacity-0 scale-95'
                      }`}
                    >
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={closeAll}
                            className={`block rounded-[1rem] px-4 py-3 text-[16px] transition-all duration-200 ${
                              isActive(item.path)
                                ? 'bg-[#434b54] font-[400] text-white dark:bg-white/10 dark:text-white'
                                : 'font-[400] text-[#5a6572] dark:text-white/70 hover:bg-[#434b54]/5 hover:text-[#5a6572] dark:hover:bg-white/10 dark:hover:text-white'
                            }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {directLinks.map((item) =>
                  item.disabled ? (
                    <span
                      key={item.path}
                      aria-disabled="true"
                      className="flex cursor-default items-center rounded-full px-3.5 py-2 text-[16px] font-[400] text-[#5a6572] opacity-30 dark:text-white/90"
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center rounded-full px-3.5 py-2 text-[16px] no-underline transition-all duration-200 ${
                        isActive(item.path)
                          ? 'font-[400] text-[#5a6572] dark:text-white'
                          : 'font-[400] text-[#5a6572] dark:text-white/90 hover:text-[#5a6572] dark:hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </div>
            </div>

            <div className="header-secondary-actions flex items-center gap-3">
              {SHOW_LANGUAGE_SELECTOR ? <LanguageSelector /> : null}

              <Link
                to="/contato"
                aria-label="Fale com a Otimiza"
                className="header-desktop-only header-contact-link h-10 items-center justify-center whitespace-nowrap rounded-[1rem] bg-[#efeff4]/90 backdrop-blur-md dark:bg-white/10 px-4 text-[14.5px] font-[400] text-[#5a6572] dark:text-white/90 transition-all hover:bg-[#e2e2e8] dark:hover:bg-white/20 dark:hover:text-white ring-1 ring-[#434b54]/5 dark:ring-white/10 drop-shadow-sm"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="header-contact-icon h-[1.125rem] w-[1.125rem]"
                  data-testid="contact-icon"
                  aria-hidden="true"
                >
                  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                  <path d="M8 9h8M8 13h5" />
                </svg>
                <span className="header-contact-label">Fale com a Otimiza</span>
              </Link>

              <button
                type="button"
                onClick={toggleMenu}
                className={`header-mobile-only z-50 h-12 min-w-[5.25rem] items-center justify-center rounded-full px-5 text-[19px] font-[500] tracking-[0.08em] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${
                  menuOpen
                    ? 'text-white hover:text-white focus-visible:outline-white/50'
                    : 'text-[#5a6572] hover:text-[#5a6572] focus-visible:outline-[#5a6572]/35'
                }`}
                aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={menuOpen}
                aria-controls="site-mobile-menu"
              >
                {menuOpen ? 'Fechar' : 'Menu'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section
        id="site-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        aria-hidden={!menuOpen}
        className={`header-mobile-only mobile-menu-panel fixed inset-0 z-50 min-h-svh origin-top bg-[#1B1B1B] px-5 pb-8 pt-5 ${
          menuOpen ? 'mobile-menu-panel--open pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div className="mobile-menu-content flex min-h-svh w-full flex-col justify-between gap-8 px-5 pb-[3.875rem]">
          <nav className="flex flex-col px-0 pt-20" aria-label="Mobile navigation">
            {mobileLinks.map((item, index) =>
              item.disabled ? (
                <span
                  key={item.path}
                  aria-disabled="true"
                  className="mobile-menu-link block w-fit max-w-full py-1 text-[clamp(1.9rem,9vw,3.1rem)] font-[300] leading-[1.18] text-white"
                  style={{ '--mobile-menu-link-index': String(index) }}
                >
                  <AnimatedMobileMenuLabel label={item.label} />
                </span>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeAll}
                  style={{ '--mobile-menu-link-index': String(index) }}
                  className={`mobile-menu-link block w-fit max-w-full py-1 text-[clamp(1.9rem,9vw,3.1rem)] font-[300] leading-[1.18] tracking-[0] no-underline transition-colors duration-200 hover:text-white ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-white'
                  }`}
                >
                  <AnimatedMobileMenuLabel label={item.label} />
                </Link>
              ),
            )}
          </nav>

          {SHOW_LANGUAGE_SELECTOR ? (
            <footer className="mobile-menu-footer flex w-full items-center text-[15px] font-[300] leading-relaxed text-white">
              <button
              type="button"
              onClick={selectInactiveMobileLocale}
              className="text-left text-white transition-colors hover:text-white"
            >
              {inactiveMobileLocale}
              </button>
            </footer>
          ) : null}
        </div>
      </section>
    </>
  )
}

export default Header
