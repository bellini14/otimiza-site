import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function useScrollReveal(threshold = 0.15) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
}

const featuresData = [
  {
    id: 'diagnostico',
    title: 'Diagnóstico',
    description: 'Identifica quais processos da organização devem ser melhorados.',
    processo: 'Visualizar e definir prioridades, conhecer melhor o desempenho da empresa, identificar desvios nos processos. Indicar a necessidade de ações para a melhoria da organização.',
    resultados: 'Oferecer ao executivo a visão de onde deve alocar energias para melhorias dos processos.',
    cta: 'Quero contratar essa solução!',
    ctaLink: '/contato',
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 8a12 12 0 1 0 0 24 12 12 0 0 0 0-24z" />
        <path d="M20 14v8" />
        <path d="M16 18h8" />
        <path d="M29 29l8 8" />
        <circle cx="20" cy="20" r="5" strokeDasharray="3 2" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'gestao',
    title: 'Gestão estratégica',
    description: 'Define as diretrizes da organização.',
    processo: 'Alinhamento e estabelecimento do rumo da organização, com conformidade de pensamentos.',
    resultados: 'Equipes alinhadas, direcionadas e comprometidas no atingimento das metas, além de um rumo qualificado para a organização.',
    cta: 'Quero contratar essa solução!',
    ctaLink: '/contato',
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 6l4 8h8l-6 6 2 8-8-4-8 4 2-8-6-6h8z" />
        <path d="M24 38v4" />
        <path d="M18 42h12" />
      </svg>
    ),
  },
  {
    id: 'inteligencia',
    title: 'Inteligência de negócios',
    description: 'É a gestão das informações no processo de tomada de decisão.',
    processo: 'Definição e/ou desenvolvimento de algoritmos inteligentes tomando ou apoiando decisão.',
    resultados: 'Qualificação do trabalho com decisões mais seguras e rápidas, resultados concretos, produzindo excelência operacional.',
    cta: 'Quero contratar essa solução!',
    ctaLink: '/contato',
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="26" width="8" height="16" rx="1.5" />
        <rect x="20" y="18" width="8" height="24" rx="1.5" />
        <rect x="34" y="10" width="8" height="32" rx="1.5" />
        <path d="M10 12l14-4 14 4" strokeDasharray="3 2" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'visao-geral',
    title: 'Atuação Integrada',
    description: 'Ajudamos na identificação de problemas com relação à política, organização e procedimentos.',
    fullDescription: 'Ajudamos na identificação de problemas com relação à política, organização, procedimentos e métodos da empresa, utilizando o conhecimento, experiência e tecnologia para encontrar a ação adequada em cada caso, além de auxiliar na implementação das mudanças. Conheça os produtos e serviços disponibilizados pela Otimiza nos seus três vértices: Consultoria, Tecnologia e Academia.',
    cta: 'Conheça todas as Soluções',
    ctaLink: '/solucoes',
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 8l16 8-16 8-16-8 16-8z" />
        <path d="M8 24l16 8 16-8" />
        <path d="M8 32l16 8 16-8" />
      </svg>
    ),
  }
];

export default function FeaturesSection() {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const activeFeature = featuresData[activeFeatureIndex];
  const [sectionRef, isVisible] = useScrollReveal(0.7);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeatureIndex((prevIndex) => (prevIndex + 1) % featuresData.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeFeatureIndex]);

  return (
    <section ref={sectionRef} className="w-full py-10 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-transparent" id="nossas-solucoes">
      <div className="max-w-[1400px] mx-auto">
        <div className={`text-center mb-8 md:mb-12 ${isVisible ? 'animate-enter [animation-duration:800ms]' : 'opacity-0'}`}>
          <h2 className="mb-4 font-display text-3xl sm:text-4xl lg:text-5xl text-neutral-900 dark:text-white">
            Nossas Soluções
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Identificamos problemas na empresa com base em conhecimento, experiência e tecnologia.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 min-h-[480px] lg:min-h-[520px]">
          <div className="lg:col-span-4 grid grid-rows-4 gap-3 lg:gap-4">
            {featuresData.map((feature, index) => {
              const isActive = index === activeFeatureIndex;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeatureIndex(index)}
                  className={`group w-full h-full text-left p-3 md:p-4 rounded-2xl transition-all duration-300 flex items-center border ${
                    isActive 
                      ? 'bg-[#EFEFF4] dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 scale-[1.01] z-10' 
                      : 'bg-neutral-50/80 dark:bg-neutral-900/50 border-neutral-200/60 dark:border-neutral-800/60 hover:bg-white dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:-translate-y-0.5'
                  } ${isVisible ? 'animate-enter [animation-duration:800ms]' : 'opacity-0'}`}
                  style={{ animationDelay: isVisible ? `${300 + index * 200}ms` : '0ms' }}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white' 
                        : 'bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 group-hover:bg-neutral-100 dark:group-hover:text-white dark:group-hover:bg-neutral-800'
                    }`}>
                      <div className="w-6 h-6">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base md:text-lg font-semibold mb-0.5 transition-colors duration-300 ${
                        isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-xs md:text-sm line-clamp-2 transition-colors duration-300 ${
                        isActive ? 'text-neutral-600 dark:text-neutral-400' : 'text-neutral-500 dark:text-neutral-500'
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div 
            className={`lg:col-span-8 flex transition-all ${isVisible ? 'animate-enter [animation-duration:1000ms]' : 'opacity-0'}`} 
            style={{ animationDelay: isVisible ? '450ms' : '0ms' }}
          >
            <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/90 p-5 md:p-6 lg:p-8 flex-1 flex flex-col relative overflow-hidden h-[480px] sm:h-[500px] lg:h-[520px]">
              <div key={activeFeature.id} className="animate-enter flex-1 flex flex-col z-10 w-full h-full">
                <div className="mb-5 lg:mb-6 shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 mb-4 border border-neutral-200 dark:border-neutral-700">
                    <div className="w-6 h-6 lg:w-7 lg:h-7 text-neutral-900 dark:text-white">
                      {activeFeature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-neutral-900 dark:text-white mb-2">
                    {activeFeature.title}
                  </h3>
                  <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
                    {activeFeature.description}
                  </p>
                </div>
                
                <div className="space-y-4 lg:space-y-5 flex-1 overflow-y-auto pr-2 pb-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-200 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {activeFeature.processo && (
                    <div className="p-4 lg:p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800/60 hover:bg-white dark:hover:bg-neutral-800/60 transition-colors">
                      <h4 className="text-xs font-bold tracking-wider text-neutral-600 dark:text-neutral-400 mb-2 uppercase flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Processo
                      </h4>
                      <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base leading-relaxed">
                        {activeFeature.processo}
                      </p>
                    </div>
                  )}
                  
                  {activeFeature.resultados && (
                    <div className="p-4 lg:p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800/60 hover:bg-white dark:hover:bg-neutral-800/60 transition-colors">
                      <h4 className="text-xs font-bold tracking-wider text-neutral-600 dark:text-neutral-400 mb-2 uppercase flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Resultados
                      </h4>
                      <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base leading-relaxed">
                        {activeFeature.resultados}
                      </p>
                    </div>
                  )}
                  
                  {activeFeature.fullDescription && (
                    <div className="p-4 lg:p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800/60 hover:bg-white dark:hover:bg-neutral-800/60 transition-colors">
                       <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base leading-relaxed">
                        {activeFeature.fullDescription}
                      </p>
                    </div>
                  )}
                </div>

                {activeFeature.cta && (
                  <div className="mt-4 lg:mt-6 pt-4 lg:pt-5 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
                    <Link to={activeFeature.ctaLink} className="btn-primary inline-flex items-center group/btn">
                      {activeFeature.cta}
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2 transition-transform group-hover/btn:translate-x-1">
                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-3.72a.75.75 0 011.04-1.06l5.25 4.92a.75.75 0 010 1.06l-5.25 4.92a.75.75 0 01-1.04-1.06l3.96-3.72H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
