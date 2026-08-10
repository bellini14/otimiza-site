import { Link } from 'react-router-dom'
import footerLogo from '../../imagens/logo otimiza s icone.svg'
import { siteNav } from '../data/sitePages'

const footerImage =
  'https://images.unsplash.com/photo-1616144058124-979005390426?q=80&w=1744&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

const socialLinks = [
  {
    href: 'https://www.facebook.com/Otimizaconsultoria',
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M14.2 8.4V6.7c0-.8.5-1 1-1h2.6V2.1L14.7 2C11.4 2 10 4 10 6.4v2H7v4h3V22h4.2v-9.6h3.2l.5-4h-3.7Z" />
      </svg>
    ),
  },
  {
    href: 'https://www.youtube.com/channel/UC8blc6s_gWY5tvWDhW6Y7IA',
    label: 'YouTube',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M21.2 7.1a2.7 2.7 0 0 0-1.9-1.9C17.6 4.7 12 4.7 12 4.7s-5.6 0-7.3.5a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 2.3 12a28 28 0 0 0 .5 4.9 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.3.5 7.3.5s5.6 0 7.3-.5a2.7 2.7 0 0 0 1.9-1.9 28 28 0 0 0 .5-4.9 28 28 0 0 0-.5-4.9Z" />
        <path d="m10 15.2 5-3.2-5-3.2v6.4Z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: 'https://www.instagram.com/otm_consultoria/',
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
        fill="#F7F8FA"
      />
    </svg>
  )
}

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer relative mt-0 overflow-hidden bg-[#F7F8FA] text-[#5a6572]">
      <div className="absolute inset-x-0 top-0 h-44 sm:h-52 md:h-64" data-testid="footer-backdrop">
        <img src={footerImage} alt="" className="h-full w-full object-cover grayscale" />
      </div>

      <div className="relative">
        <div className="h-36 sm:h-44 md:h-56" aria-hidden="true" />

        <div className="relative bg-[#F7F8FA]">
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
                <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start">
                  <span>&copy; {currentYear} Otimiza. All rights reserved.</span>
                  <Link to="/politica-de-privacidade" className="underline underline-offset-4 transition-opacity hover:opacity-65">Política de Privacidade</Link>
                </p>
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
