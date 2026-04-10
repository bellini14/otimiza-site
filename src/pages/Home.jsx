import { useEffect, useState, useRef } from 'react'
import heroBwImage from '../assets/hero-bw.jpg'
import iconeOtimizaFundo from '../assets/icone-otimiza-fundo.svg'
import FeaturesSection from '../components/FeaturesSection'
import TechnologySection from '../components/TechnologySection'
import { BlogHighlights } from '../components/ui/blog-highlights'
import { StaggerTestimonials } from '../components/ui/stagger-testimonials'
import { ScrollVelocity } from '../components/ui/ScrollVelocity'
import { client } from '../lib/sanity'


const homeClientLogoQuery = `*[_type == "clientLogo" && isVisible != false && showOnHome == true && defined(logo.asset)] | order(coalesce(sortOrder, 9999) asc, name asc) {
  _id,
  name,
  logoAlt,
  website,
  "logoUrl": logo.asset->url
}`

const HOME_CLIENT_LOGO_FALLBACKS = [
  {
    _id: 'fallback-banco-moneo',
    name: 'Banco Moneo',
    logoAlt: 'Moneo',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/14ada562c98ddb5d2c60222e9288035ac02e1a03-2270x635.png',
  },
  {
    _id: 'fallback-cinex',
    name: 'Cinex',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/8c12d0700da0b40cdf73dcea8d4f489ef3859176-1609x608.png',
  },
  {
    _id: 'fallback-fruki',
    name: 'Fruki',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/79c4f8a6b0fad8e2514ca15d4a8f2ff1d2a49345-329x315.jpg',
  },
  {
    _id: 'fallback-lojas-colombo',
    name: 'Lojas Colombo',
    logoAlt: 'Lojas Colombo',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/9f1b13dbd4e018c6e2837784b2bbfbd43aca25fc-850x261.png',
  },
  {
    _id: 'fallback-marcopolo',
    name: 'Marcopolo',
    logoAlt: 'Marcopolo',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/dd2091b629f7bbec58fff53f6ba2e2da23401338-1628x297.svg',
  },
  {
    _id: 'fallback-masterpower-turbo',
    name: 'Masterpower Turbo',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/68ee44abb22c64e0592de20a325451ba01208b1b-317x143.svg',
  },
  {
    _id: 'fallback-postos-sim',
    name: 'Postos SIM',
    logoAlt: 'Postos SIM',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/1cc404eacdd8f4ee3ab08e27d9acb3bcd612b69e-1612x1103.png',
  },
  {
    _id: 'fallback-randon',
    name: 'Randon',
    logoAlt: 'Randon',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/288a1b5f9372c157732913225bb28a38b15d278a-1471x365.jpg',
  },
  {
    _id: 'fallback-sicredi',
    name: 'Sicredi',
    logoAlt: 'Sicredi',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/d40d71f5cef53f1c4d008d82cb7d2006bcd1773a-3500x823.png',
  },
  {
    _id: 'fallback-unimed-nacional',
    name: 'Unimed Nacional',
    logoAlt: 'Unimed',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/a10f978d72a9d3b41ba68ae9f4d865921ab763ab-1184x422.png',
  },
  {
    _id: 'fallback-universidade-feevale',
    name: 'Universidade Feevale',
    logoAlt: 'Feevale',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/7a0583270438adefccdf6943e478c606855d1c87-960x240.png',
  },
  {
    _id: 'fallback-universidade-de-caxias-do-sul',
    name: 'Universidade de Caxias do Sul',
    logoAlt: 'UCS',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/1fe23ac3f948001964c133103f7470b985d0865f-2500x1264.png',
  },
]

const MIN_HOME_LOGOS_PER_ROW = 6

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

function preventHeroSubmit(event) {
  event.preventDefault()
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
      className="max-h-9 w-auto max-w-[8.5rem] object-contain grayscale transition duration-300 group-hover/logo:grayscale-0"
      loading="eager"
      decoding="async"
    />
  )

  return (
    <div
      className="home-client-logo-card group/logo flex h-16 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 transition hover:border-slate-300"
      aria-hidden={isDecorative ? 'true' : undefined}
    >
      {logo.website ? (
        <a href={logo.website} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center">
          {logoImage}
        </a>
      ) : (
        logoImage
      )}
    </div>
  )
}

function Home() {
  const [brandsRef, brandsVisible] = useScrollReveal(0.1)
  const [homeClientLogos, setHomeClientLogos] = useState([])
  const homeLogoRows = buildHomeLogoRows(homeClientLogos)

  useEffect(() => {
    let isMounted = true

    async function fetchHomeClientLogos() {
      try {
        const logos = await client.fetch(homeClientLogoQuery)
        if (isMounted && Array.isArray(logos)) {
          setHomeClientLogos(logos)
        }
      } catch (error) {
        console.error('Error fetching home client logos from Sanity:', error)
        if (isMounted) {
          setHomeClientLogos(HOME_CLIENT_LOGO_FALLBACKS)
        }
      }
    }

    fetchHomeClientLogos()

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
              <h1 className="home-hero__title" aria-label="Criar o atemporal.">
                <span className="home-hero__title-soft">Criar o </span>
                <span className="home-hero__title-strong">atemporal.</span>
              </h1>
              <p className="home-hero__copy">
                Junte-se as mais de 400 empresas que transformaram
                sua gestao em algo que permanece no tempo.
              </p>
            </div>
          </div>

          {/* Right Side — Photo + Form */}
          <div className="home-hero__right">
            <img
              src={heroBwImage}
              alt="Profissional analisando dados no laptop"
              className="home-hero__photo"
            />
            <div className="home-hero__form-overlay">
              <form className="home-hero__form" onSubmit={preventHeroSubmit}>
                <label htmlFor="hero-email" className="sr-only">
                  Seu email
                </label>
                <input id="hero-email" type="email" placeholder="Seu email" className="home-hero__input" />
                <button type="submit" className="home-hero__submit">
                  Quero fazer parte
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10" data-testid="home-content">
        <section ref={brandsRef} className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-16 sm:py-24 bg-[#EFEFF4]">
          <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <p className={`mb-4 inline-block tracking-tight rounded-full bg-brand-red/10 px-4 py-1.5 text-[11px] font-semibold uppercase text-brand-red ${brandsVisible ? 'animate-enter' : 'opacity-0'}`}>
                Empresas que confiam
              </p>
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
                  className="flex"
                  texts={homeLogoRows.map((logos) => (
                    <div className="flex gap-6 pr-6">
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

        <FeaturesSection />
        <TechnologySection />
        <StaggerTestimonials />
        <BlogHighlights />
      </div>
    </div>
  )
}

export default Home
