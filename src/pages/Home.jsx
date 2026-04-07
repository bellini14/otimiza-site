import { useEffect, useRef, useState } from 'react'
import heroBwImage from '../assets/hero-bw.jpg'
import iconeOtimizaFundo from '../assets/icone-otimiza-fundo.svg'
import FeaturesSection from '../components/FeaturesSection'
import TechnologySection from '../components/TechnologySection'
import { StaggerTestimonials } from '../components/ui/stagger-testimonials'



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

function Home() {
  const [brandsRef, brandsVisible] = useScrollReveal(0.1)
  return (
    <div className="pb-6" data-testid="home-page">
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

      <div className="relative z-10 space-y-12" data-testid="home-content">
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
            
            <div className={`relative ${brandsVisible ? 'animate-enter' : 'opacity-0'} [animation-delay:450ms]`}>
              <div className="space-y-6 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                {/* Linha 1: Move para a esquerda */}
                <div className="group flex overflow-hidden gap-6">
                  <div className="flex shrink-0 animate-marquee gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex gap-6">
                        <div className="flex h-16 min-w-44 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-display text-xl font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
                          Boltshift
                        </div>
                        <div className="flex h-16 min-w-44 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-display text-xl font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
                          Lightbox
                        </div>
                        <div className="flex h-16 min-w-44 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-display text-xl font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
                          Feather Dev
                        </div>
                        <div className="flex h-16 min-w-44 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-display text-xl font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
                          Spherule
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex shrink-0 animate-marquee gap-6" aria-hidden="true">
                    {[...Array(4)].map((_, i) => (
                      <div key={`d-${i}`} className="flex gap-6">
                        <div className="flex h-16 min-w-44 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-display text-xl font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
                          Boltshift
                        </div>
                        <div className="flex h-16 min-w-44 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-display text-xl font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
                          Lightbox
                        </div>
                        <div className="flex h-16 min-w-44 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-display text-xl font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
                          Feather Dev
                        </div>
                        <div className="flex h-16 min-w-44 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-display text-xl font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
                          Spherule
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Linha 2: Move para a direita (reverse) */}
                <div className="group flex overflow-hidden gap-6">
                  <div className="flex shrink-0 animate-marqueeReverse gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex gap-6">
                        <div className="flex h-16 min-w-44 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-display text-xl font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
                          Global Bank
                        </div>
                        <div className="flex h-16 min-w-44 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-display text-xl font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
                          Nietzsche
                        </div>
                        <div className="flex h-16 min-w-44 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-display text-xl font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
                          Hourglass
                        </div>
                        <div className="flex h-16 min-w-44 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-display text-xl font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
                          Catalog
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex shrink-0 animate-marqueeReverse gap-6" aria-hidden="true">
                    {[...Array(4)].map((_, i) => (
                      <div key={`d-${i}`} className="flex gap-6">
                        <div className="flex h-16 min-w-44 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-display text-xl font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
                          Global Bank
                        </div>
                        <div className="flex h-16 min-w-44 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-display text-xl font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
                          Nietzsche
                        </div>
                        <div className="flex h-16 min-w-44 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-display text-xl font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
                          Hourglass
                        </div>
                        <div className="flex h-16 min-w-44 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-display text-xl font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
                          Catalog
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FeaturesSection />
        <TechnologySection />
        <StaggerTestimonials />
      </div>
    </div>
  )
}

export default Home
