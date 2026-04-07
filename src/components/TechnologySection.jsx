import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

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
    <section className="relative w-[100vw] left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#EFEFF4]">
      <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10 w-full min-h-[600px]">
        {/* Left Col (Text) */}
        <div ref={textRef} className="p-8 sm:p-12 md:p-16 lg:p-20 xl:p-24 flex flex-col justify-center relative max-w-[700px] lg:ml-auto">
          
          {/* Header moved inside */}
          <div className="mb-8 sm:mb-10">
            <p className={`mb-4 inline-block tracking-tight rounded-full bg-brand-red/10 px-4 py-1.5 text-[11px] font-semibold uppercase text-brand-red border border-brand-red/20 ${textVisible ? 'animate-enter' : 'opacity-0'}`}>
              OTMSuite
            </p>
            <h2 className={`mb-4 font-display text-4xl text-slate-900 sm:text-5xl lg:text-6xl ${textVisible ? 'animate-enter' : 'opacity-0'} [animation-delay:120ms]`}>
              Nossa tecnologia
            </h2>
            <p className={`max-w-2xl text-base text-slate-600 sm:text-lg ${textVisible ? 'animate-enter' : 'opacity-0'} [animation-delay:240ms]`}>
              Acreditamos que os negócios são criados ao redor da tecnologia
            </p>
          </div>

          <div className={`w-16 h-px bg-slate-300 mb-8 sm:mb-10 ${textVisible ? 'animate-enter' : 'opacity-0'} [animation-delay:340ms]`}></div>

          <h3 className={`font-display text-2xl sm:text-3xl lg:text-2xl xl:text-3xl text-slate-900 leading-relaxed mb-8 ${textVisible ? 'animate-enter' : 'opacity-0'} [animation-delay:440ms]`}>
            E assim, são todos os serviços de consultoria que a Otimiza entrega para seus clientes. Para efetivamente entregar resultados relacionados a automação em nossos clientes, desenvolvemos a OTMSuite.
          </h3>
          <div className={`${textVisible ? 'animate-enter' : 'opacity-0'} [animation-delay:560ms]`}>
            <Link to="/tecnologia" className="btn-primary inline-flex text-white bg-slate-900 hover:bg-slate-800">
              Saiba mais
            </Link>
          </div>
        </div>

        {/* Right Col (Image & Effect) */}
        <div className="relative h-[400px] sm:h-[500px] lg:h-auto overflow-hidden bg-black">
          {/* Overlay fade */}
          <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-[#EFEFF4] via-[#EFEFF4]/60 to-transparent via-30% z-20 pointer-events-none"></div>
          
          <div className="absolute inset-0" style={{ isolation: 'isolate' }}>
            <div className="absolute inset-0 bg-white"></div>
            <div className="absolute inset-0">
              <img 
                alt="Profissional utilizando tecnologia" 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=1200&fit=crop&q=80" 
              />
            </div>
            
            {/* Diagonal grid mask effect */}
            <div className="absolute inset-0 bg-[#EFEFF4]" style={{ mixBlendMode: 'lighten' }}>
              <div className="absolute inset-0" style={{ transform: 'rotate(45deg) scale(2.42)', transformOrigin: 'center center' }}>
                <div className="flex gap-2 sm:gap-3 md:gap-4 h-full items-center justify-center">
                  
                  {/* Column 1 */}
                  <div className="relative overflow-hidden w-16 sm:w-20 md:w-24">
                    <div className="flex flex-col gap-3 sm:gap-4 animate-marqueeVertical">
                      {[...Array(20)].map((_, i) => (
                        <div key={`col1-a-${i}`} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md sm:rounded-lg bg-black shrink-0"></div>
                      ))}
                      {[...Array(20)].map((_, i) => (
                        <div key={`col1-b-${i}`} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md sm:rounded-lg bg-black shrink-0" aria-hidden="true"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Column 2 */}
                  <div className="relative overflow-hidden w-16 sm:w-20 md:w-24">
                    <div className="flex flex-col gap-3 sm:gap-4 animate-marqueeVerticalReverse">
                      {[...Array(20)].map((_, i) => (
                        <div key={`col2-a-${i}`} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md sm:rounded-lg bg-black shrink-0"></div>
                      ))}
                      {[...Array(20)].map((_, i) => (
                        <div key={`col2-b-${i}`} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md sm:rounded-lg bg-black shrink-0" aria-hidden="true"></div>
                      ))}
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
