import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logoOtimiza from '../assets/logo-otimiza.svg'
import { siteNav } from '../data/sitePages'

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
  { path: '/', label: 'Home' },
  ...siteNav.map((item) => ({
    ...item,
    disabled: disabledNavLabels.has(item.label),
  })),
]

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
}

function ThemeToggle({ theme, onToggle }) {
  const isDarkTheme = theme === 'dark'
  const nextThemeLabel = isDarkTheme ? 'Ativar tema claro' : 'Ativar tema escuro'

  return (
    <button
      type="button"
      aria-label={nextThemeLabel}
      aria-pressed={isDarkTheme}
      data-theme-icon={isDarkTheme ? 'sun' : 'moon'}
      onClick={onToggle}
      className="hidden lg:inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#efeff4]/90 backdrop-blur-md dark:bg-white/10 text-[#5a6572] dark:text-white/90 transition-all hover:bg-[#e2e2e8] dark:hover:bg-white/20 dark:hover:text-white ring-1 ring-[#434b54]/5 dark:ring-white/10 drop-shadow-sm"
    >
      <span key={theme} className="theme-toggle__icon" aria-hidden="true">
        {isDarkTheme ? (
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
            className="h-4 w-4"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        ) : (
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
            className="h-4 w-4"
          >
            <path d="M12 3a6 6 0 1 0 9 9 9 9 0 1 1-9-9" />
          </svg>
        )}
      </span>
    </button>
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
    <div ref={selectorRef} className="relative hidden lg:block">
      <button
        type="button"
        className="inline-flex h-10 w-[7.5rem] items-center justify-center gap-2.5 whitespace-nowrap rounded-[1rem] bg-[#efeff4]/90 px-3.5 text-[14px] font-[400] text-[#5a6572] ring-1 ring-[#434b54]/5 drop-shadow-sm backdrop-blur-md transition-all hover:bg-[#e2e2e8] dark:bg-white/10 dark:text-white/90 dark:ring-white/10 dark:hover:bg-white/20 dark:hover:text-white"
        aria-label="Selecionar idioma"
        aria-haspopup="menu"
        aria-controls="language-options"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <SelectedFlag className="h-[18px] w-[18px] shrink-0 drop-shadow-sm" />
        <span>{selectedLanguage.locale}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3.5 w-3.5 opacity-50 transition-transform dark:opacity-70 ${isOpen ? 'rotate-180' : ''}`}
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
  const [theme, setTheme] = useState(getInitialTheme)
  const lastScrollYRef = useRef(0)
  
  // Animation states
  const [isTop, setIsTop] = useState(true)
  const [isNavHidden, setIsNavHidden] = useState(false)
  
  const location = useLocation()
  const isDarkTheme = theme === 'dark'

  const isActive = (path) => location.pathname === path
  const isGroupActive = (items) => items.some((item) => isActive(item.path))
  const mobileMenuPosition = isTop ? 'top-[4.9rem] sm:top-[5.2rem]' : 'top-[5.9rem] sm:top-[6.15rem]'

  const closeAll = () => {
    setMenuOpen(false)
    setOpenDropdown(null)
  }

  const toggleMenu = () => {
    setMenuOpen((current) => !current)
  }

  const toggleDropdown = (label) => {
    setOpenDropdown((current) => (current === label ? null : label))
  }

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkTheme)
    window.localStorage.setItem('theme', theme)
  }, [isDarkTheme, theme])

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
        className={`fixed inset-x-0 top-0 z-40 transition-[padding,transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isTop ? 'px-0 pt-0 sm:px-0 lg:px-0' : 'px-4 pt-3 sm:px-6 lg:px-8'
        } ${
          shouldHideNav ? '-translate-y-[115%] opacity-0' : 'translate-y-0 opacity-100'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div
          data-testid="main-menu-surface"
          className={`mx-auto w-full [zoom:1.1025] transition-[max-width,border-radius,padding] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] relative z-10 ${
            isTop
              ? 'max-w-full rounded-none bg-transparent px-5 py-3 sm:px-7 lg:px-10'
              : 'max-w-[1320px] rounded-[1.25rem] px-4 py-2.5 sm:px-5'
          }`}
        >
          <div
            className={`absolute inset-0 rounded-[1.25rem] border border-[#434b54]/10 bg-white/95 shadow-[0_14px_42px_rgba(67,75,84,0.08)] backdrop-blur-2xl transition-[opacity,transform,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-white/10 dark:bg-[#0f172a]/90 dark:shadow-[0_14px_42px_rgba(0,0,0,0.48)] ${
              isTop ? 'opacity-0 scale-[0.985]' : 'opacity-100 scale-100'
            }`}
            aria-hidden="true"
          />

          <div className="relative z-10 flex items-center justify-between gap-5">
            <div className="flex items-center gap-5 lg:gap-7">
              <Link to="/" aria-label="Otimiza home" className="z-50 flex items-center" onClick={closeAll}>
                <img src={logoOtimiza} alt="Otimiza" className="-mt-[2px] h-11 w-auto sm:h-12 md:h-[3.25rem] dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]" />
              </Link>

              <div className="hidden items-center gap-1 lg:flex">
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

            <div className="flex items-center gap-3">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <LanguageSelector />

              <Link
                to="/contato"
                className="hidden lg:flex h-10 items-center justify-center rounded-[1rem] bg-[#efeff4]/90 backdrop-blur-md dark:bg-white/10 px-4 text-[14.5px] font-[400] text-[#5a6572] dark:text-white/90 transition-all hover:bg-[#e2e2e8] dark:hover:bg-white/20 dark:hover:text-white ring-1 ring-[#434b54]/5 dark:ring-white/10 drop-shadow-sm"
              >
                Fale com a Otimiza
              </Link>

              <button
                type="button"
                onClick={toggleMenu}
                className="z-50 flex h-10 w-10 items-center justify-center rounded-[0.85rem] bg-[#434b54]/90 backdrop-blur-md dark:bg-white/10 text-white dark:text-white/90 lg:hidden transition-all hover:bg-[#364048] dark:hover:bg-white/20 dark:hover:text-white ring-1 ring-[#434b54]/5 dark:ring-white/10 drop-shadow-sm"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="site-mobile-menu"
              >
                {menuOpen ? (
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
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                ) : (
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
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M4 5h16" />
                    <path d="M4 12h16" />
                    <path d="M4 19h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-30 bg-[#434b54]/14 backdrop-blur-sm transition-opacity duration-200 ${
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeAll}
      />

      <section
        id="site-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        aria-hidden={!menuOpen}
        className={`fixed inset-x-4 z-40 origin-top rounded-[1.75rem] border border-[#434b54]/12 dark:border-white/10 bg-white/95 dark:bg-[#131b24]/95 p-4 shadow-[0_28px_80px_rgba(67,75,84,0.12)] dark:shadow-[0_28px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-300 sm:inset-x-6 lg:hidden ${mobileMenuPosition} ${
          menuOpen ? 'pointer-events-auto translate-y-0 opacity-100 scale-100' : 'pointer-events-none -translate-y-2 opacity-0 scale-95'
        }`}
      >
        <div className="mb-4 border-b border-[#434b54]/10 dark:border-white/10 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5a6572]/52 dark:text-white/40">Navegacao</p>
          <p className="mt-2 text-sm text-[#5a6572]/74 dark:text-white/60">Acesse as principais areas da Otimiza.</p>
        </div>

        <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
          {mobileLinks.map((item) =>
            item.disabled ? (
              <span
                key={item.path}
                aria-disabled="true"
                className="rounded-[1rem] px-4 py-3 text-[14.5px] font-[400] text-[#5a6572] opacity-30 dark:text-white/70"
              >
                {item.label}
              </span>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeAll}
                className={`rounded-[1rem] px-4 py-3 text-[14.5px] transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-[#434b54] font-[400] text-white dark:bg-white/10'
                    : 'font-[400] text-[#5a6572] dark:text-white/70 hover:bg-[#434b54]/5 hover:text-[#5a6572] dark:hover:bg-white/10 dark:hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="mt-4 grid gap-3 border-t border-[#434b54]/10 dark:border-white/10 pt-4">
          <Link
            to="/contato"
            onClick={closeAll}
            className="rounded-[0.9rem] bg-[#434b54] dark:bg-white/10 px-5 py-3 text-center text-[14.5px] font-[400] text-white dark:text-white transition hover:bg-[#364048] dark:hover:bg-white/20 ring-1 ring-transparent dark:ring-white/5"
          >
            Fale com a Otimiza
          </Link>
        </div>
      </section>
    </>
  )
}

export default Header
