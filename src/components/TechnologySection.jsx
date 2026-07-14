import React, { useEffect, useRef, useState } from 'react'
import technologyFactoryImage from '../../imagens/technology-otmsuite-factory.png'

const TECHNOLOGY_MARQUEE_ITEMS = 20

function TechnologyMarqueeCycle({ duplicate = false }) {
  return (
    <div
      className="flex flex-col gap-3 pb-3 sm:gap-4 sm:pb-4"
      data-testid="technology-marquee-cycle"
      aria-hidden={duplicate ? 'true' : undefined}
    >
      {[...Array(TECHNOLOGY_MARQUEE_ITEMS)].map((_, index) => (
        <div
          key={index}
          className="h-16 w-16 shrink-0 rounded-md bg-black sm:h-20 sm:w-20 sm:rounded-lg md:h-24 md:w-24"
        />
      ))}
    </div>
  )
}

function TechnologyMarqueeColumn({ reverse = false }) {
  return (
    <div className="relative h-full w-16 overflow-hidden sm:w-20 md:w-24">
      <div
        className={`technology-marquee__track${reverse ? ' technology-marquee__track--reverse' : ''}`}
        data-testid="technology-marquee-track"
      >
        <TechnologyMarqueeCycle />
        <TechnologyMarqueeCycle duplicate />
      </div>
    </div>
  )
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

export default function TechnologySection() {
  const [textRef, textVisible] = useScrollReveal(0.2)

  return (
    <section className="relative w-[100vw] left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] overflow-hidden bg-white">
      {/* Container for Text */}
      <div className="relative z-10 w-full">
        <div className="home-menu-shell" data-testid="home-menu-aligned-shell">
          <div className="flex flex-col lg:flex-row min-h-[auto] lg:min-h-[600px]">
            {/* Left Col (Text) */}
            <div ref={textRef} className="py-10 sm:py-16 md:py-20 lg:py-24 xl:py-28 flex flex-col justify-center relative w-full lg:w-1/2 lg:pr-12 xl:pr-16">
            
            {/* Header moved inside */}
            <div className="mb-6 sm:mb-10">
              <h2 className={`mb-3 font-display text-[2.5rem] leading-[1.05] text-slate-900 sm:mb-4 sm:text-5xl lg:text-6xl ${textVisible ? 'animate-enter' : 'opacity-0'} [animation-delay:120ms]`}>
                Nossa tecnologia
              </h2>
              <p className={`max-w-[18rem] text-sm leading-6 text-slate-600 sm:max-w-2xl sm:text-lg ${textVisible ? 'animate-enter' : 'opacity-0'} [animation-delay:240ms]`}>
                Acreditamos que os negócios são criados ao redor da tecnologia
              </p>
            </div>

            <div className={`w-12 h-px bg-slate-300 mb-7 sm:w-16 sm:mb-10 ${textVisible ? 'animate-enter' : 'opacity-0'} [animation-delay:340ms]`}></div>

            <h3 className={`max-w-[25rem] font-display text-[1.25rem] sm:text-3xl lg:text-2xl xl:text-3xl text-slate-900 leading-[1.45] sm:leading-relaxed mb-7 sm:mb-8 ${textVisible ? 'animate-enter' : 'opacity-0'} [animation-delay:440ms]`}>
              E assim, são todos os serviços de consultoria que a Otimiza entrega para seus clientes. Para efetivamente entregar resultados relacionados a automação em nossos clientes, desenvolvemos a OTMSuite.
            </h3>
            <div className={`${textVisible ? 'animate-enter' : 'opacity-0'} [animation-delay:560ms]`}>
              <a
                href="https://otmsuite.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex text-white bg-slate-900 hover:bg-slate-800"
              >
                Saiba mais
              </a>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Right Col (Image & Effect) */}
      <div className="relative lg:absolute lg:right-0 lg:top-0 lg:bottom-0 w-full lg:w-[50vw] h-[320px] sm:h-[460px] lg:h-auto overflow-hidden bg-black z-0" data-testid="technology-image-panel">
          {/* Overlay fade */}
          <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-white via-white/60 to-transparent via-30% z-20 pointer-events-none"></div>
          
          <div className="absolute inset-0" style={{ isolation: 'isolate' }}>
            <div className="absolute inset-0 bg-white"></div>
            <div className="absolute inset-0">
              <img 
                alt="Profissional utilizando OTMSuite em ambiente industrial" 
                className="w-full h-full object-cover lg:object-right" 
                src={technologyFactoryImage} 
              />
            </div>
            
            {/* Diagonal grid mask effect */}
            <div className="absolute inset-0 bg-[#EFEFF4]" style={{ mixBlendMode: 'lighten' }}>
              <div className="absolute inset-0" style={{ transform: 'rotate(45deg) scale(2.42)', transformOrigin: 'center center' }}>
                <div className="flex gap-2 sm:gap-3 md:gap-4 h-full items-center justify-center">
                  
                  <TechnologyMarqueeColumn />
                  <TechnologyMarqueeColumn reverse />
                  
                </div>
              </div>
            </div>
          </div>
      </div>
    </section>
  )
}
