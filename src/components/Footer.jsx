import { Link } from 'react-router-dom'
import footerLogo from '../../imagens/logo otimiza s icone.svg'
import { siteNav } from '../data/sitePages'

const footerImage =
  'https://images.unsplash.com/photo-1616144058124-979005390426?q=80&w=1744&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

const socialLinks = [
  {
    href: 'https://instagram.com/otimiza.oficial',
    label: 'Instagram',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: 'https://x.com/otimizaoficial',
    label: 'X',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.96 3h3.07l-6.7 7.66L22.2 21h-6.16l-4.83-6.32L5.68 21H2.6l7.16-8.18L2.2 3h6.31l4.37 5.77L17.96 3Zm-1.08 16.14h1.7L7.58 4.77H5.75l11.13 14.37Z" />
      </svg>
    ),
  },
  {
    href: 'https://www.linkedin.com/company/otimiza-consultoria',
    label: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6Z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
]

function FooterCurve({ mirrored = false }) {
  return (
    <svg
      width="614"
      height="153"
      viewBox="0 0 614 153"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-auto w-[220px] sm:w-[260px] ${mirrored ? 'scale-x-[-1]' : ''}`}
      aria-hidden="true"
    >
      <path
        d="M0 0H451.601C467.78 0 483.071 7.75893 491.954 21.2815C558.518 122.612 538.359 153.074 614 153H0V0Z"
        fill="#EFEFF4"
      />
    </svg>
  )
}

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-0 overflow-hidden bg-[#EFEFF4] text-[#5a6572]">
      <div className="absolute inset-x-0 top-0 h-44 sm:h-52 md:h-64" data-testid="footer-backdrop">
        <img src={footerImage} alt="" className="h-full w-full object-cover grayscale" />
      </div>

      <div className="relative">
        <div className="h-36 sm:h-44 md:h-56" aria-hidden="true" />

        <div className="relative bg-[#EFEFF4]">
          <div className="absolute left-0 top-0 z-10 -translate-y-full">
            <FooterCurve />
          </div>

          <div className="absolute right-0 top-0 z-10 -translate-y-full">
            <FooterCurve mirrored />
          </div>

          <div className="mx-auto flex w-full max-w-[1380px] flex-col items-center px-4 py-12 text-center sm:px-6 sm:py-14 lg:px-8 lg:py-16">
            <img src={footerLogo} alt="Otimiza" className="h-24 w-auto sm:h-28 md:h-[7.5rem]" />

            <nav
              aria-label="Footer navigation"
              className="mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-x-4 gap-y-3 text-[13px] font-medium uppercase tracking-[0.16em] sm:text-sm"
            >
              {siteNav.map((item, index) => (
                <div key={item.path} className="flex items-center gap-x-4">
                  <Link to={item.path} className="transition-opacity duration-200 hover:opacity-65">
                    {item.label}
                  </Link>
                  {index < siteNav.length - 1 ? (
                    <span className="text-[#5a6572]/30" aria-hidden="true">
                      -
                    </span>
                  ) : null}
                </div>
              ))}
            </nav>

            <div className="mt-8 flex items-center justify-center gap-4 sm:gap-5">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#434b54]/12 text-[#5a6572] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#434b54]/28 hover:bg-white/55"
                >
                  <span className="h-5 w-5">{item.icon}</span>
                </a>
              ))}
            </div>

            <div className="mt-10 w-full border-t border-[#434b54]/12 pt-6">
              <div className="flex flex-col items-center justify-between gap-3 text-sm text-[#5a6572]/74 sm:flex-row sm:text-left">
                <p>&copy; {currentYear} Otimiza. All rights reserved.</p>
                <p>Developed by Studiodesign</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
