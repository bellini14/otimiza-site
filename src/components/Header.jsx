import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logoOtimiza from '../assets/logo-otimiza.svg'
import { siteNav } from '../data/sitePages'
import GradualBlur from './GradualBlur'

const dropdownGroups = [
  {
    id: 'institucional',
    label: 'Institucional',
    items: [
      { path: '/quem-somos', label: 'Quem somos' },
      { path: '/contato', label: 'Contato' },
    ],
  },
  {
    id: 'solucoes',
    label: 'Soluções',
    items: [
      { path: '/o-que-fazemos', label: 'O que fazemos' },
      { path: '/tecnologia', label: 'Tecnologia' },
      { path: '/academia-otimiza', label: 'Academia Otimiza' },
    ],
  },
]

const directLinks = [
  { path: '/cases', label: 'Cases' },
  { path: '/insights-e-blog', label: 'Insights e Blog' },
]

const mobileLinks = [{ path: '/', label: 'Home' }, ...siteNav]

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
      className="hidden lg:inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#efeff4]/90 backdrop-blur-md dark:bg-white/10 text-[#5a6572] dark:text-white/90 transition-all hover:bg-[#e2e2e8] dark:hover:bg-white/20 dark:hover:text-white ring-1 ring-[#434b54]/5 dark:ring-white/10 drop-shadow-sm"
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

function LanguageSelector() {
  return (
    <button
      className="hidden lg:inline-flex h-11 items-center gap-2.5 rounded-[1.15rem] bg-[#efeff4]/90 backdrop-blur-md dark:bg-white/10 px-4 text-[14.5px] font-medium text-[#5a6572] dark:text-white/90 transition-all hover:bg-[#e2e2e8] dark:hover:bg-white/20 dark:hover:text-white ring-1 ring-[#434b54]/5 dark:ring-white/10 drop-shadow-sm"
      aria-label="Selecionar idioma"
    >
      <span className="text-base leading-none drop-shadow-sm">🇧🇷</span>
      <span>pt-BR</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5 opacity-50 dark:opacity-70"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [theme, setTheme] = useState(getInitialTheme)
  
  // Animation states
  const [isTop, setIsTop] = useState(true)
  
  const location = useLocation()
  const isDarkTheme = theme === 'dark'

  const isActive = (path) => location.pathname === path
  const isGroupActive = (items) => items.some((item) => isActive(item.path))
  const mobileMenuPosition = isTop ? 'top-[5.9rem] sm:top-[6.25rem]' : 'top-[7rem] sm:top-[7.35rem]'

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
      if (window.scrollY <= 40) {
        setIsTop(true)
      } else {
        setIsTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-in-out ${
          isTop ? 'px-0 pt-0 sm:px-0 lg:px-0' : 'px-4 pt-4 sm:px-6 lg:px-8'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${isTop ? 'opacity-100 pointer-events-none' : 'opacity-0 pointer-events-none'}`}>
          <GradualBlur
            target="parent"
            position="top"
            height="7rem"
            strength={2}
            divCount={5}
            curve="bezier"
            exponential
            opacity={1}
            zIndex={0}
          />
        </div>
        <div 
          className={`mx-auto w-full transition-all duration-500 ease-out py-5 relative z-10 ${
            isTop
              ? 'max-w-full rounded-none bg-transparent px-6 sm:px-8 lg:px-12'
              : 'max-w-[1380px] rounded-[1.65rem] bg-white/95 dark:bg-[#0f172a]/90 shadow-[0_20px_60px_rgba(67,75,84,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl dark:backdrop-blur-2xl border border-[#434b54]/10 dark:border-white/10 px-5 sm:px-6'
          }`}
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6 lg:gap-8">
              <Link to="/" aria-label="Otimiza home" className="z-50 flex items-center" onClick={closeAll}>
                <img src={logoOtimiza} alt="Otimiza" className="h-10 w-auto sm:h-11 md:h-12 dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]" />
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
                      className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[15px] transition-all duration-200 drop-shadow-sm ${
                        isGroupActive(group.items)
                          ? 'font-semibold text-[#5a6572] dark:text-white'
                          : 'font-medium text-[#5a6572] dark:text-white/90 hover:text-[#5a6572] dark:hover:text-white hover:drop-shadow-md'
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
                            className={`block rounded-[1rem] px-4 py-3 text-[14.5px] transition-all duration-200 ${
                              isActive(item.path)
                                ? 'bg-[#434b54] font-semibold text-white dark:bg-white/10 dark:text-white'
                                : 'font-medium text-[#5a6572] dark:text-white/70 hover:bg-[#434b54]/5 hover:text-[#5a6572] dark:hover:bg-white/10 dark:hover:text-white'
                            }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {directLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`rounded-full px-4 py-2.5 text-[15px] no-underline transition-all duration-200 drop-shadow-sm ${
                      isActive(item.path)
                        ? 'font-semibold text-[#5a6572] dark:text-white'
                        : 'font-medium text-[#5a6572] dark:text-white/90 hover:text-[#5a6572] dark:hover:text-white hover:drop-shadow-md'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <LanguageSelector />

              <Link
                to="/contato"
                className="hidden lg:flex h-11 items-center justify-center rounded-[1.15rem] bg-[#efeff4]/90 backdrop-blur-md dark:bg-white/10 px-5 text-[15px] font-medium text-[#5a6572] dark:text-white/90 transition-all hover:bg-[#e2e2e8] dark:hover:bg-white/20 dark:hover:text-white ring-1 ring-[#434b54]/5 dark:ring-white/10 drop-shadow-sm"
              >
                Fale com a Otimiza
              </Link>

              <button
                type="button"
                onClick={toggleMenu}
                className="z-50 flex h-11 w-11 items-center justify-center rounded-[0.9rem] bg-[#434b54]/90 backdrop-blur-md dark:bg-white/10 text-white dark:text-white/90 lg:hidden transition-all hover:bg-[#364048] dark:hover:bg-white/20 dark:hover:text-white ring-1 ring-[#434b54]/5 dark:ring-white/10 drop-shadow-sm"
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
          {mobileLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeAll}
              className={`rounded-[1rem] px-4 py-3 text-[14.5px] transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-[#434b54] font-semibold text-white dark:bg-white/10'
                  : 'font-medium text-[#5a6572] dark:text-white/70 hover:bg-[#434b54]/5 hover:text-[#5a6572] dark:hover:bg-white/10 dark:hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 grid gap-3 border-t border-[#434b54]/10 dark:border-white/10 pt-4">
          <Link
            to="/contato"
            onClick={closeAll}
            className="rounded-[0.9rem] bg-[#434b54] dark:bg-white/10 px-5 py-3 text-center text-[14.5px] font-medium text-white dark:text-white transition hover:bg-[#364048] dark:hover:bg-white/20 ring-1 ring-transparent dark:ring-white/5"
          >
            Fale com a Otimiza
          </Link>
        </div>
      </section>
    </>
  )
}

export default Header
