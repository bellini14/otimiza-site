import { useEffect, useState, useRef } from 'react'
import heroBwImage from '../assets/hero-bw.jpg'
import iconeOtimizaFundo from '../assets/icone-otimiza-fundo.svg'
import FeaturesSection from '../components/FeaturesSection'
import TechnologySection from '../components/TechnologySection'
import { BlogHighlights } from '../components/ui/blog-highlights'
import { StaggerTestimonials } from '../components/ui/stagger-testimonials'
import { ScrollVelocity } from '../components/ui/ScrollVelocity'
import { client } from '../lib/sanity'
import { HOME_CLIENT_LOGO_FALLBACKS } from '../data/homeClientLogoFallbacks'
import { resolveLegacyImageUrl } from '../lib/legacyImageUrl'


const homeClientLogoQuery = `*[_type == "clientLogo" && isVisible != false && showOnHome == true && defined(logo.asset)] | order(coalesce(sortOrder, 9999) asc, name asc) {
  _id,
  name,
  logoAlt,
  "logoUrl": logo.asset->url
}`

const homeCasesQuery = `*[_type == "clientLogo" && isVisible != false && showOnCases == true && defined(logo.asset)] | order(coalesce(sortOrder, 9999) asc, name asc) {
  _id,
  name,
  sector,
  logoAlt,
  caseDescription,
  "caseSlug": caseSlug.current,
  "logoUrl": logo.asset->url
}`

const MIN_HOME_LOGOS_PER_ROW = 6

function resolveLogoUrls(logos) {
  return logos.map((logo) => ({ ...logo, logoUrl: resolveLegacyImageUrl(logo.logoUrl) }))
}

function useScrollReveal(threshold = 0.15) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (ref.current) observer.unobserve(ref.current)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return [ref, isVisible]
}

function buildHomeLogoRows(logos) {
  if (logos.length === 0) {
    return []
  }

  const rows = [
    logos.filter((_, index) => index % 2 === 0),
    logos.filter((_, index) => index % 2 === 1),
  ].map((row) => (row.length > 0 ? row : logos))
  const logosPerRow = Math.max(MIN_HOME_LOGOS_PER_ROW, ...rows.map((row) => row.length))

  const accessibleLogoKeys = new Set()

  return rows.map((row) =>
    repeatHomeLogosForMarquee(row, logosPerRow).map((logo, index) => {
      const logoKey = logo._id || logo.name
      const isDecorative = accessibleLogoKeys.has(logoKey)

      accessibleLogoKeys.add(logoKey)

      return {
        instanceKey: `${logoKey}-${index}`,
        isDecorative,
        logo,
      }
    }),
  )
}

function repeatHomeLogosForMarquee(logos, targetCount = MIN_HOME_LOGOS_PER_ROW) {
  if (logos.length >= targetCount) {
    return logos
  }

  return Array.from({ length: targetCount }, (_, index) => logos[index % logos.length])
}

function HomeClientLogo({ logo, isDecorative = false }) {
  const logoImage = (
    <img
      src={logo.logoUrl}
      alt={isDecorative ? '' : logo.logoAlt || logo.name}
      className="max-h-5 w-auto max-w-[4.5rem] object-contain grayscale transition duration-300 group-hover/logo:grayscale-0 sm:max-h-9 sm:max-w-[8.5rem]"
      loading="eager"
      decoding="async"
    />
  )

  return (
    <div
      className="home-client-logo-card group/logo flex h-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-3 transition hover:border-slate-300 sm:h-16 sm:px-8"
      aria-hidden={isDecorative ? 'true' : undefined}
    >
      {logoImage}
    </div>
  )
}

function Home() {
  const [brandsRef, brandsVisible] = useScrollReveal(0.1)
  const [homeClientLogos, setHomeClientLogos] = useState([])
  const [homeCases, setHomeCases] = useState([])
  const homeLogoRows = buildHomeLogoRows(homeClientLogos)
  const homeCasesKey = homeCases.map((caseStudy) => caseStudy._id).join('|')

  useEffect(() => {
    let isMounted = true

    async function fetchHomeClientLogos() {
      try {
        const logos = await client.fetch(homeClientLogoQuery)
        if (isMounted && Array.isArray(logos)) {
          setHomeClientLogos(resolveLogoUrls(logos))
        }
      } catch (error) {
        console.error('Error fetching home client logos from Sanity:', error)
        if (isMounted) {
          setHomeClientLogos(resolveLogoUrls(HOME_CLIENT_LOGO_FALLBACKS))
        }
      }
    }

    fetchHomeClientLogos()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function fetchHomeCases() {
      try {
        const cases = await client.fetch(homeCasesQuery)
        if (isMounted && Array.isArray(cases)) {
          setHomeCases(resolveLogoUrls(cases))
        }
      } catch (error) {
        console.error('Error fetching home cases from Sanity:', error)
      }
    }

    fetchHomeCases()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div data-testid="home-page">
      <section className="home-hero">
        <div className="home-hero__split" data-testid="hero-stage">
          {/* Left Side — Text Content */}
          <div className="home-hero__left">
            {/* Decorative Otimiza icon */}
            <div className="home-hero__decor" aria-hidden="true">
              <img
                src={iconeOtimizaFundo}
                alt=""
                className="home-hero__decor-svg home-hero__blob"
              />
            </div>

            <div className="home-hero__text-content">
              <h1
                className="home-hero__title"
                aria-label="Transformamos visão em método, cultura em capacidade e estratégia em operação."
              >
                <span className="home-hero__title-soft">Transformamos </span>
                <span className="home-hero__title-strong home-hero__title-strong--spaced">
                  visão em método,
                </span>
                <span className="home-hero__title-soft"> cultura em capacidade e </span>
                <span className="home-hero__title-strong">estratégia em operação.</span>
              </h1>
            </div>
          </div>

          {/* Right Side — Photo + Form */}
          <div className="home-hero__right">
            <img
              src={heroBwImage}
              alt="Profissional analisando dados no laptop"
              className="home-hero__photo"
            />
          </div>
        </div>
      </section>

      <div className="relative z-10" data-testid="home-content">
        <BlogHighlights />

        <section ref={brandsRef} className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#EFEFF4] pt-14 pb-24 sm:py-32">
          <div className="home-menu-shell" data-testid="home-menu-aligned-shell">
            <div className="mb-10 text-center sm:mb-16">
              <h2 className={`mb-6 font-display text-4xl text-slate-900 sm:text-5xl lg:text-6xl ${brandsVisible ? 'animate-enter' : 'opacity-0'} [animation-delay:150ms]`}>
                Marcas que confiam na Otimiza
              </h2>
              <p className={`mx-auto max-w-2xl text-base text-slate-600 sm:text-lg ${brandsVisible ? 'animate-enter' : 'opacity-0'} [animation-delay:300ms]`}>
                Veja como empresas líderes simplificam seus processos operacionais e alavancam resultados de ponta a ponta com nossa metodologia.
              </p>
            </div>
            
            {homeLogoRows.length > 0 && (
              <div
                className={`relative w-full overflow-hidden ${brandsVisible ? 'animate-enter' : 'opacity-0'} [animation-delay:450ms]`}
                data-testid="home-client-logo-carousel"
              >
                <ScrollVelocity
                  velocity={40}
                  texts={homeLogoRows.map((logos, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-3 pr-3 sm:gap-6 sm:pr-6">
                      {logos.map(({ instanceKey, isDecorative, logo }) => (
                        <HomeClientLogo key={instanceKey} logo={logo} isDecorative={isDecorative} />
                      ))}
                    </div>
                  ))}
                />
              </div>
            )}
          </div>
        </section>

        <StaggerTestimonials key={homeCasesKey} cases={homeCases} />
        <FeaturesSection />
        <TechnologySection />
      </div>
    </div>
  )
}

export default Home
