import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { ProjectCard } from './project-card'

const blogPosts = [
  {
    title: 'Como transformar gargalos operacionais em vantagem competitiva',
    description:
      'Um olhar pratico sobre mapeamento de processos, rituais de melhoria e decisoes que reduzem friccao sem aumentar complexidade.',
    imgSrc:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    link: '/insights-e-blog',
    linkText: 'Ler artigo',
    eyebrow: 'Processos',
  },
  {
    title: 'Governanca orientada por dados para times que precisam escalar',
    description:
      'Indicadores, cadencia e visao executiva para manter clareza operacional enquanto a empresa cresce com mais velocidade e menos retrabalho.',
    imgSrc:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    link: '/insights-e-blog',
    linkText: 'Ler artigo',
    eyebrow: 'Estrategia',
  },
  {
    title: 'Automacao com impacto real: onde investir primeiro',
    description:
      'Criterios para priorizar automacoes, capturar ganhos rapidos e estruturar uma evolucao continua que sustenta resultado no longo prazo.',
    imgSrc:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    link: '/insights-e-blog',
    linkText: 'Ler artigo',
    eyebrow: 'Tecnologia',
  },
  {
    title: 'Rituais de gestao que reduzem ruido e aceleram resposta',
    description:
      'Reunioes mais objetivas, acompanhamento mais claro e menos desgaste para liderancas que precisam decidir com frequencia.',
    imgSrc:
      'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80',
    link: '/insights-e-blog',
    linkText: 'Ler artigo',
    eyebrow: 'Gestao',
  },
  {
    title: 'O que muda quando a operacao passa a trabalhar com prioridade real',
    description:
      'Como sair do volume improdutivo e reorganizar filas, capacidade e execucao em torno do que de fato move o negocio.',
    imgSrc:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    link: '/insights-e-blog',
    linkText: 'Ler artigo',
    eyebrow: 'Performance',
  },
  {
    title: 'Estrutura enxuta para acompanhar indicadores sem burocracia',
    description:
      'Modelos simples para consolidar dados, enxergar desvios cedo e dar ritmo de acompanhamento sem inflar o processo.',
    imgSrc:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    link: '/insights-e-blog',
    linkText: 'Ler artigo',
    eyebrow: 'Dados',
  },
  {
    title: 'Onde a automacao entrega valor nas primeiras semanas',
    description:
      'Casos em que o ganho aparece rapido porque a base do processo ja esta pronta para absorver automacoes com baixo risco.',
    imgSrc:
      'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80',
    link: '/insights-e-blog',
    linkText: 'Ler artigo',
    eyebrow: 'Execucao',
  },
  {
    title: 'Como desenhar fluxos mais claros para times multifuncionais',
    description:
      'Responsabilidades visiveis, handoffs mais limpos e menos retrabalho entre comercial, operacao e tecnologia.',
    imgSrc:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    link: '/insights-e-blog',
    linkText: 'Ler artigo',
    eyebrow: 'Fluxos',
  },
  {
    title: 'Onde a automacao falha quando o processo ainda esta errado',
    description:
      'Os sinais mais comuns de que a empresa esta tentando escalar um fluxo quebrado e como corrigir isso antes do investimento.',
    imgSrc:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    link: '/insights-e-blog',
    linkText: 'Ler artigo',
    eyebrow: 'Diagnostico',
  },
  {
    title: 'Playbooks enxutos para times comerciais mais previsiveis',
    description:
      'Documentacao leve, decisao mais consistente e mais velocidade para onboardar pessoas sem travar a operacao.',
    imgSrc:
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80',
    link: '/insights-e-blog',
    linkText: 'Ler artigo',
    eyebrow: 'Comercial',
  },
]

const CAROUSEL_ANIMATION_MS = 340
const CAROUSEL_UNLOCK_FALLBACK_MS = CAROUSEL_ANIMATION_MS + 120
const STAGE_GAP_PX = 24

export function BlogHighlights() {
  const [sectionRef, isVisible] = useScrollReveal(0.1)
  const [displayIndex, setDisplayIndex] = useState(0)
  const [slidesPerView, setSlidesPerView] = useState(getSlidesPerView())
  const [isAnimating, setIsAnimating] = useState(false)
  const prefersReducedMotion = useReducedMotionPreference()
  const unlockTimeoutRef = useRef(null)
  const visiblePosts = blogPosts.slice(displayIndex, displayIndex + slidesPerView)
  const maxIndex = Math.max(blogPosts.length - slidesPerView, 0)

  useEffect(() => {
    function handleResize() {
      setSlidesPerView(getSlidesPerView())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setDisplayIndex((current) => Math.min(current, Math.max(blogPosts.length - slidesPerView, 0)))
    clearUnlockFallback(unlockTimeoutRef)
    setIsAnimating(false)
  }, [slidesPerView])

  useEffect(() => {
    if (!prefersReducedMotion) {
      return undefined
    }

    clearUnlockFallback(unlockTimeoutRef)
    setIsAnimating(false)
    return undefined
  }, [prefersReducedMotion])

  useEffect(() => {
    return () => {
      clearUnlockFallback(unlockTimeoutRef)
    }
  }, [])

  function handlePrevious() {
    moveToIndex(displayIndex - 1)
  }

  function handleNext() {
    moveToIndex(displayIndex + 1)
  }

  function moveToIndex(nextIndex) {
    if (isAnimating) {
      return
    }

    const clampedIndex = Math.min(Math.max(nextIndex, 0), maxIndex)

    if (clampedIndex === displayIndex) {
      return
    }

    setDisplayIndex(clampedIndex)

    if (prefersReducedMotion) {
      return
    }

    setIsAnimating(true)
    clearUnlockFallback(unlockTimeoutRef)
    unlockTimeoutRef.current = window.setTimeout(() => {
      setIsAnimating(false)
    }, CAROUSEL_UNLOCK_FALLBACK_MS)
  }

  function handleTrackTransitionEnd(event) {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') {
      return
    }

    clearUnlockFallback(unlockTimeoutRef)
    setIsAnimating(false)
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-[100vw] left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#EFEFF4] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-8 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p
              className={cn(
                'mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600',
                isVisible ? 'animate-enter' : 'opacity-0',
              )}
            >
              Insights e Blog
            </p>
            <h2
              className={cn(
                'max-w-2xl font-display text-4xl text-slate-900 sm:text-5xl lg:text-6xl',
                isVisible ? 'animate-enter' : 'opacity-0',
                '[animation-delay:150ms]',
              )}
            >
              Insights para quem opera no longo prazo
            </h2>
          </div>

          <div
            className={cn(
              'flex items-center justify-between gap-4 lg:min-w-[22rem] lg:justify-end',
              isVisible ? 'animate-enter' : 'opacity-0',
              '[animation-delay:300ms]',
            )}
          >
            <p className="max-w-sm text-sm leading-6 text-slate-600 sm:text-base">
              10 posts selecionados para leitura rapida, com navegacao direta por setas.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isAnimating || displayIndex === 0}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors duration-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Post anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={isAnimating || displayIndex === maxIndex}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors duration-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Proximo post"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          data-testid="blog-slider-stage"
          data-phase={isAnimating ? 'animating' : 'idle'}
          data-current-index={displayIndex}
          className={cn(
            'relative -mt-3 overflow-y-visible overflow-x-hidden pt-3',
            isVisible ? 'animate-enter' : 'opacity-0',
            '[animation-delay:450ms]',
          )}
        >
          <div
            data-testid="blog-slider-track"
            data-animating={isAnimating ? 'true' : 'false'}
            className="flex will-change-transform"
            onTransitionEnd={handleTrackTransitionEnd}
            style={{
              gap: `${STAGE_GAP_PX}px`,
              transform: `translate3d(calc(-${(displayIndex / blogPosts.length) * 100}% - ${(displayIndex * STAGE_GAP_PX) / blogPosts.length}px), 0, 0)`,
              transition: prefersReducedMotion ? 'none' : `transform ${CAROUSEL_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          >
            {blogPosts.map((post, index) => {
              const isSlideVisible = index >= displayIndex && index < displayIndex + slidesPerView

              return (
                <div
                  key={post.title}
                  data-testid="blog-slide"
                  data-visible={isSlideVisible ? 'true' : 'false'}
                  aria-hidden={isSlideVisible ? undefined : true}
                  className="shrink-0"
                  style={{ width: `calc((100% - ${(slidesPerView - 1) * STAGE_GAP_PX}px) / ${slidesPerView})` }}
                >
                  <ProjectCard {...post} />
                </div>
              )
            })}
          </div>
        </div>

        <div
          className={cn(
            'mt-10 flex items-center justify-between gap-4',
            isVisible ? 'animate-enter' : 'opacity-0',
            '[animation-delay:600ms]',
          )}
        >
          <p className="text-sm text-slate-500">
            {String(displayIndex + 1).padStart(2, '0')}-{String(displayIndex + visiblePosts.length).padStart(2, '0')} /{' '}
            {String(blogPosts.length).padStart(2, '0')}
          </p>
          <Link
            to="/insights-e-blog"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-900 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
          >
            Ver todos os artigos
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function clearUnlockFallback(timeoutRef) {
  if (timeoutRef.current) {
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }
}

function getSlidesPerView() {
  if (typeof window === 'undefined') {
    return 3
  }

  if (window.innerWidth >= 1280) {
    return 3
  }

  if (window.innerWidth >= 768) {
    return 2
  }

  return 1
}

function useReducedMotionPreference() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)

    updatePreference()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePreference)
      return () => mediaQuery.removeEventListener('change', updatePreference)
    }

    mediaQuery.addListener(updatePreference)
    return () => mediaQuery.removeListener(updatePreference)
  }, [])

  return prefersReducedMotion
}

function useScrollReveal(threshold = 0.15) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (ref.current) observer.unobserve(ref.current)
        }
      },
      { threshold },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return [ref, isVisible]
}
