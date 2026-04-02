import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { siteNav } from '../data/sitePages'

const dropdownGroups = [
  {
    label: 'Institucional',
    items: [
      { path: '/quem-somos', label: 'Quem somos' },
      { path: '/contato', label: 'Contato' },
    ],
  },
  {
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
      className="theme-toggle hidden lg:inline-flex"
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

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [theme, setTheme] = useState(getInitialTheme)
  const location = useLocation()
  const isDarkTheme = theme === 'dark'

  const isActive = (path) => location.pathname === path
  const isGroupActive = (items) => items.some((item) => isActive(item.path))

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

  return (
    <>
      <nav
        className="fixed left-0 right-0 top-0 z-40 border-b border-neutral-200 bg-white px-6 py-4"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="z-50 text-xl font-medium text-neutral-900 outline-none transition hover:text-brand-red"
                onClick={closeAll}
              >
                Otimiza
              </Link>

              <div className="hidden items-center gap-1 lg:flex">
                {dropdownGroups.map((group) => (
                  <div
                    key={group.label}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(group.label)}
                    onMouseLeave={() => setOpenDropdown((current) => (current === group.label ? null : current))}
                  >
                    <button
                      type="button"
                      className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                        isGroupActive(group.items)
                          ? 'text-neutral-900'
                          : 'text-neutral-700 hover:text-neutral-900'
                      }`}
                      aria-expanded={openDropdown === group.label}
                      aria-controls={`dropdown-${group.label}`}
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
                      id={`dropdown-${group.label}`}
                      className={`absolute left-0 top-full mt-2 w-60 rounded-2xl border border-neutral-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition-all ${
                        openDropdown === group.label
                          ? 'visible translate-y-0 opacity-100'
                          : 'invisible -translate-y-2 opacity-0'
                      }`}
                    >
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={closeAll}
                            className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                              isActive(item.path)
                                ? 'bg-neutral-900 text-white'
                                : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
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
                    className={`rounded-md px-3 py-2 text-sm font-medium no-underline transition ${
                      isActive(item.path)
                        ? 'text-neutral-900'
                        : 'text-neutral-700 hover:text-neutral-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />

              <Link
                to="/contato"
                className="hidden rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 lg:block"
              >
                Contato
              </Link>

              <Link
                to="/contato"
                className="hidden rounded-md bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 lg:block"
              >
                Fale com a Otimiza
              </Link>

              <button
                type="button"
                onClick={toggleMenu}
                className="z-50 flex h-10 w-10 items-center justify-center rounded-md bg-neutral-900 text-white lg:hidden"
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
        className={`fixed inset-0 z-30 bg-neutral-950/20 backdrop-blur-sm transition-opacity duration-200 ${
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
        className={`fixed inset-x-4 top-[4.9rem] z-40 rounded-[1.75rem] border border-neutral-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.12)] transition-all duration-200 sm:inset-x-6 sm:top-[5.5rem] lg:hidden ${
          menuOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <div className="mb-4 border-b border-neutral-200 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Navegação
          </p>
          <p className="mt-2 text-sm text-neutral-600">Acesse as principais áreas da Otimiza.</p>
        </div>

        <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
          {mobileLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeAll}
              className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive(item.path)
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 grid gap-3 border-t border-neutral-200 pt-4">
          <Link
            to="/contato"
            onClick={closeAll}
            className="rounded-md border border-neutral-300 px-4 py-3 text-center text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Contato
          </Link>
          <Link
            to="/contato"
            onClick={closeAll}
            className="rounded-md bg-neutral-900 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Fale com a Otimiza
          </Link>
        </div>
      </section>
    </>
  )
}

export default Header
