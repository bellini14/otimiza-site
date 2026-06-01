import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function useScrollReveal(threshold = 0.15) {
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting) setHasEnteredView(true);
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, hasEnteredView, isInView];
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
  const [featureActiveExitIndex, setFeatureActiveExitIndex] = useState(null);
  const activeFeature = featuresData[activeFeatureIndex];
  const [sectionRef, isVisible] = useScrollReveal(0.35);
  const featureActiveExitTimeoutRef = useRef(null);

  const handleFeatureClick = (index) => {
    if (index === activeFeatureIndex) {
      return;
    }

    window.clearTimeout(featureActiveExitTimeoutRef.current);
    setFeatureActiveExitIndex(activeFeatureIndex);
    setActiveFeatureIndex(index);

    featureActiveExitTimeoutRef.current = window.setTimeout(() => {
      setFeatureActiveExitIndex((currentIndex) => (currentIndex === activeFeatureIndex ? null : currentIndex));
    }, 200);
  };

  useEffect(() => () => {
    window.clearTimeout(featureActiveExitTimeoutRef.current);
  }, []);

  return (
    <section ref={sectionRef} className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-10 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-neutral-950 px-4 sm:px-6 lg:px-8" id="nossas-solucoes">
      <div className="max-w-[1320px] mx-auto w-full">
        <div className={`text-center mb-10 md:mb-14 ${isVisible ? 'animate-enter [animation-duration:800ms]' : 'opacity-0'}`}>
          <h2 className="mb-3 font-display text-3xl sm:text-4xl lg:text-5xl text-neutral-900 dark:text-white tracking-tight">
            Nossas Soluções
          </h2>
          <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Identificamos problemas na empresa com base em conhecimento, experiência e tecnologia.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 lg:min-h-[540px]">
          {/* ── Left Sidebar ── */}
          <div className="lg:col-span-4 flex flex-col gap-3 lg:h-[540px]">
            {featuresData.map((feature, index) => {
              const isActive = index === activeFeatureIndex;
              const isActiveExiting = featureActiveExitIndex === index;

              return (
                <button
                  key={feature.id}
                  onClick={() => handleFeatureClick(index)}
                  className={`pillar-card group relative w-full overflow-hidden text-left px-5 py-5 md:px-6 md:py-6 rounded-2xl transition-[box-shadow,opacity,border-color] duration-300 ease-out flex items-center flex-1 border ${
                    isActive || isActiveExiting
                      ? 'bg-white border-[#5a6572]/28 shadow-[0_12px_35px_rgba(90,101,114,0.08)] dark:bg-neutral-900 dark:border-neutral-700'
                      : 'bg-white dark:bg-neutral-900/35 border-transparent dark:border-neutral-800/60'
                  } ${isVisible ? 'animate-enter [animation-duration:800ms]' : 'opacity-0'}`}
                  style={{
                    animationDelay: isVisible ? `${300 + index * 200}ms` : '0ms',
                  }}
                >
                  {isActiveExiting ? (
                    <span aria-hidden="true" className="pillar-active-exit-fill" />
                  ) : null}
                  <div className="relative z-10 flex items-center gap-4 md:gap-5 w-full">
                    <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-red-50 dark:bg-neutral-700 text-brand-red dark:text-brand-red' 
                        : 'bg-neutral-100 dark:bg-neutral-800/70 text-neutral-400 dark:text-neutral-500'
                    }`}>
                      <div className="w-[22px] h-[22px] stroke-[2.4]">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center">
                      <h3 className={`text-[15px] md:text-base leading-snug transition-colors duration-300 ${
                        isActive ? 'font-bold text-neutral-900 dark:text-white' : 'font-semibold text-neutral-500 dark:text-neutral-400'
                      }`}>
                        {feature.title}
                      </h3>
                    </div>
                    {/* Active indicator arrow */}
                    <svg className={`w-5 h-5 shrink-0 transition-all duration-300 ${isActive ? 'opacity-100 text-brand-red translate-x-0' : 'opacity-0 text-neutral-300 -translate-x-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* ── Right Detail Panel ── */}
          <div 
            className={`lg:col-span-8 flex transition-all ${isVisible ? 'animate-enter [animation-duration:1000ms]' : 'opacity-0'}`} 
            style={{ animationDelay: isVisible ? '450ms' : '0ms' }}
          >
            <div key={activeFeature.id} className="feature-detail-panel-transition rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-6 md:p-7 lg:p-8 flex-1 flex flex-col relative z-0 overflow-hidden lg:min-h-[540px] lg:max-h-[540px]">
              <div className="feature-detail-transition flex-1 flex flex-col z-10 w-full">
                {/* Header */}
                <div className="feature-detail-transition__header mb-6 lg:mb-8 shrink-0">
                  <div className="inline-flex items-center justify-center w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-red-50 dark:bg-neutral-800 mb-5 border border-red-100 dark:border-neutral-700">
                    <div className="w-[22px] h-[22px] lg:w-6 lg:h-6 text-brand-red">
                      {activeFeature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl lg:text-[28px] font-display font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
                    {activeFeature.title}
                  </h3>
                  <p className="text-sm md:text-[15px] text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-3xl">
                    {activeFeature.description}
                  </p>
                </div>
                
                {/* Content Cards */}
                <div className="space-y-3 lg:space-y-4">
                  {activeFeature.processo && (
                    <div className="feature-detail-transition__item p-4 lg:p-5 rounded-xl bg-[#F9FAFB] dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                      <h4 className="text-[11px] font-bold tracking-[0.12em] text-neutral-500 dark:text-neutral-400 mb-2.5 uppercase flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Processo
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-300 text-sm md:text-[15px] leading-relaxed">
                        {activeFeature.processo}
                      </p>
                    </div>
                  )}
                  
                  {activeFeature.resultados && (
                    <div className="feature-detail-transition__item p-4 lg:p-5 rounded-xl bg-[#F9FAFB] dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                      <h4 className="text-[11px] font-bold tracking-[0.12em] text-neutral-500 dark:text-neutral-400 mb-2.5 uppercase flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Resultados
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-300 text-sm md:text-[15px] leading-relaxed">
                        {activeFeature.resultados}
                      </p>
                    </div>
                  )}
                  
                  {activeFeature.fullDescription && (
                    <div className="feature-detail-transition__item p-4 lg:p-5 rounded-xl bg-[#F9FAFB] dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                       <p className="text-neutral-600 dark:text-neutral-300 text-sm md:text-[15px] leading-relaxed">
                        {activeFeature.fullDescription}
                      </p>
                    </div>
                  )}
                </div>

                {/* CTA — always pinned to bottom */}
                {activeFeature.cta && (
                  <div className="feature-detail-transition__item mt-auto pt-5 lg:pt-6 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
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
