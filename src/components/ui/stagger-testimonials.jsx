import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const CAROUSEL_COPIES = 3
const CARD_GAP = 24
const RELEASE_GAIN = 0.24
const RELEASE_FRICTION = 0.94
const MAX_RELEASE_SPEED = 40
const MAX_INERTIA_FRAMES = 38
const SNAP_DURATION_MS = 360

const FALLBACK_TESTIMONIALS = [
  ['A Otimiza trouxe uma clareza operacional que nunca tivemos. Nossos processos agora são 5x mais eficientes e escaláveis.', 'Ricardo Silveira, CEO na TechFlow', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces&q=80'],
  ['A segurança e confiabilidade da OTMSuite nos permitiu expandir para novos mercados com tranquilidade total.', 'Camila Arantes, CTO na SecureSystems', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces&q=80'],
  ['Implementar a metodologia Otimiza foi o melhor investimento estratégico que fizemos nos últimos anos.', 'Marcos Oliveira, Diretor de Operações na InnovaCorp', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces&q=80'],
  ['A interface é intuitiva e o suporte é excepcional. Mudou completamente a cultura de produtividade da nossa equipe.', 'Beatriz Santos, CFO na FutureLog', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces&q=80'],
  ['Uma solução atemporal que resolve problemas reais de gestão com elegância e eficiência.', 'André Mendes, Head de Design na CreativeFlow', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces&q=80'],
  ['Recuperamos centenas de horas produtivas em poucos meses de uso. O impacto no faturamento foi imediato.', 'Juliana Costa, Gerente de Produto na TimeLess', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=faces&q=80'],
  ['A robustez da plataforma Otimiza é impressionante. É o motor que impulsiona nosso crescimento diário.', 'Felipe Almeida, Diretor de Marketing na BrandScale', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=faces&q=80'],
  ['Análise de dados precisa e dashboards que realmente ajudam na tomada de decisão. Essencial para nós.', 'Carla Nunes, Cientista de Dados na DataDriven', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces&q=80'],
  ['Simplesmente a melhor solução de automação e gestão que já utilizamos. Nível global.', 'Roberto Lima, UX Designer na UserFirst', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces&q=80'],
  ['A escalabilidade é real. O sistema cresce sem fricção, acompanhando nossa demanda global.', 'Thiago Pires, Engenheiro DevOps na CloudScale', 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=faces&q=80'],
].map(([testimonial, by, imgSrc], id) => ({ id, testimonial, by, imgSrc }))

function normalizeTestimonials(testimonials) {
  if (!Array.isArray(testimonials) || testimonials.length === 0) return FALLBACK_TESTIMONIALS

  return testimonials
    .map((testimonial, index) => {
      const roleAndCompany = [testimonial.role, testimonial.company].filter(Boolean).join(' na ')
      return {
        id: testimonial.id ?? testimonial._id ?? index,
        testimonial: testimonial.testimonial ?? testimonial.shortQuote,
        by: testimonial.by ?? [testimonial.clientName, roleAndCompany].filter(Boolean).join(', '),
        imgSrc: testimonial.imgSrc ?? testimonial.avatarUrl ?? FALLBACK_TESTIMONIALS[5].imgSrc,
      }
    })
    .filter((testimonial) => testimonial.testimonial && testimonial.by)
}

function TestimonialCard({ testimonial, cardSize, isActive, isDragging, logicalIndex, copyIndex, virtualIndex }) {
  const tilt = logicalIndex % 2 === 0 ? -1.4 : 1.4
  const activeTransform = isDragging
    ? 'translateY(-10px) rotate(0deg) scale(0.985)'
    : 'translateY(-18px) rotate(0deg) scale(1)'

  return (
    <article
      data-testid="home-case-card"
      data-carousel-active={isActive ? 'true' : 'false'}
      data-copy-index={copyIndex}
      data-virtual-index={virtualIndex}
      data-dragging={isActive && isDragging ? 'true' : 'false'}
      aria-hidden={copyIndex !== 1}
      className={cn(
        'relative flex-none rounded-2xl border border-slate-200/60 bg-[#EFEFF4] p-8 antialiased',
        'transition-[transform,opacity,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        isActive ? 'z-10 opacity-100 shadow-2xl shadow-slate-900/10' : 'opacity-45 shadow-sm',
      )}
      style={{
        width: cardSize,
        height: cardSize,
        transform: isActive
          ? activeTransform
          : `translateY(${logicalIndex % 2 === 0 ? -5 : 8}px) rotate(${tilt}deg) scale(0.985)`,
      }}
    >
      {isActive && <span className="absolute right-6 top-6 h-2.5 w-2.5 rounded-full bg-brand-red/60" />}
      <img
        src={testimonial.imgSrc}
        alt={copyIndex === 1 ? testimonial.by.split(',')[0] : ''}
        draggable="false"
        className="mb-4 h-14 w-14 rounded-full bg-slate-100 object-cover object-top ring-2 ring-slate-100"
      />
      <h3 className={cn('text-base font-medium leading-snug sm:text-lg', isActive ? 'text-slate-900' : 'text-slate-700')}>
        &ldquo;{testimonial.testimonial}&rdquo;
      </h3>
      <p className={cn(
        'absolute bottom-8 left-8 right-8 mt-2 text-sm',
        isActive ? 'font-medium text-brand-red' : 'italic text-slate-400',
      )}>
        - {testimonial.by}
      </p>
    </article>
  )
}

export function StaggerTestimonials({ testimonials }) {
  const activeTestimonials = useMemo(() => normalizeTestimonials(testimonials), [testimonials])
  const loopedTestimonials = useMemo(
    () => Array.from({ length: CAROUSEL_COPIES }, (_, copyIndex) =>
      activeTestimonials.map((testimonial, logicalIndex) => ({
        testimonial,
        logicalIndex,
        copyIndex,
        virtualIndex: copyIndex * activeTestimonials.length + logicalIndex,
      }))).flat(),
    [activeTestimonials],
  )
  const [cardSize, setCardSize] = useState(365)
  const [activeVirtualIndex, setActiveVirtualIndex] = useState(activeTestimonials.length)
  const [isDragging, setIsDragging] = useState(false)
  const [isHintVisible, setIsHintVisible] = useState(false)
  const [dragDirection, setDragDirection] = useState('right')
  const [hintPosition, setHintPosition] = useState({ x: 0, y: 0 })
  const [sectionRef, isVisible] = useScrollReveal(0.1)
  const viewportRef = useRef(null)
  const animationFrameRef = useRef(null)
  const hintFrameRef = useRef(null)
  const hintHasPositionRef = useRef(false)
  const hintPositionRef = useRef({ x: 0, y: 0 })
  const hintTargetRef = useRef({ x: 0, y: 0 })
  const dragStateRef = useRef({
    isDragging: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    lastX: 0,
    lastMoveX: 0,
  })
  const cardInterval = cardSize + CARD_GAP
  const loopWidth = activeTestimonials.length * cardInterval

  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  const normalizeScrollLeft = useCallback((value) => {
    if (loopWidth === 0) return 0
    let normalized = value
    while (normalized < loopWidth * 0.5) normalized += loopWidth
    while (normalized >= loopWidth * 2.5) normalized -= loopWidth
    return normalized
  }, [loopWidth])

  const updateScrollLeft = useCallback((nextValue) => {
    const viewport = viewportRef.current
    if (!viewport) return
    const normalized = normalizeScrollLeft(nextValue)
    viewport.scrollLeft = normalized
    setActiveVirtualIndex(Math.round(normalized / cardInterval))
  }, [cardInterval, normalizeScrollLeft])

  const updateHintPosition = useCallback((event) => {
    if (event.pointerType === 'touch') {
      setIsHintVisible(false)
      return
    }

    setIsHintVisible(true)
    const target = {
      x: event.clientX + 14,
      y: event.clientY + 12,
    }
    hintTargetRef.current = target

    if (!hintHasPositionRef.current) {
      hintHasPositionRef.current = true
      hintPositionRef.current = target
      setHintPosition(target)
      return
    }

    if (hintFrameRef.current !== null) return

    const animateHint = () => {
      const current = hintPositionRef.current
      const next = {
        x: current.x + (hintTargetRef.current.x - current.x) * 0.2,
        y: current.y + (hintTargetRef.current.y - current.y) * 0.2,
      }
      hintPositionRef.current = next
      setHintPosition(next)

      if (
        Math.abs(hintTargetRef.current.x - next.x) < 0.4
        && Math.abs(hintTargetRef.current.y - next.y) < 0.4
      ) {
        hintPositionRef.current = hintTargetRef.current
        setHintPosition(hintTargetRef.current)
        hintFrameRef.current = null
        return
      }

      hintFrameRef.current = requestAnimationFrame(animateHint)
    }

    hintFrameRef.current = requestAnimationFrame(animateHint)
  }, [])

  const snapToNearestCard = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const start = viewport.scrollLeft
    const target = Math.round(start / cardInterval) * cardInterval
    const distance = target - start
    const startedAt = performance.now()

    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / SNAP_DURATION_MS)
      const eased = 1 - Math.pow(1 - progress, 3)
      updateScrollLeft(start + distance * eased)
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step)
      } else {
        updateScrollLeft(target)
        animationFrameRef.current = null
      }
    }

    animationFrameRef.current = requestAnimationFrame(step)
  }, [cardInterval, updateScrollLeft])

  const startInertia = useCallback((pointerVelocity) => {
    stopAnimation()
    let velocity = Math.max(-MAX_RELEASE_SPEED, Math.min(MAX_RELEASE_SPEED, -pointerVelocity * RELEASE_GAIN))
    let frameCount = 0

    const step = () => {
      const viewport = viewportRef.current
      if (!viewport) return
      updateScrollLeft(viewport.scrollLeft + velocity)
      velocity *= RELEASE_FRICTION
      frameCount += 1
      if (Math.abs(velocity) < 0.35 || frameCount >= MAX_INERTIA_FRAMES) {
        animationFrameRef.current = null
        snapToNearestCard()
        return
      }
      animationFrameRef.current = requestAnimationFrame(step)
    }

    if (Math.abs(velocity) < 0.35) {
      snapToNearestCard()
      return
    }
    animationFrameRef.current = requestAnimationFrame(step)
  }, [snapToNearestCard, stopAnimation, updateScrollLeft])

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return
    const viewport = viewportRef.current
    if (!viewport) return
    event.preventDefault()
    stopAnimation()
    updateHintPosition(event)
    dragStateRef.current = {
      isDragging: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: viewport.scrollLeft,
      lastX: event.clientX,
      lastMoveX: 0,
    }
    setIsDragging(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    updateHintPosition(event)
    const dragState = dragStateRef.current
    if (!dragState.isDragging || dragState.pointerId !== event.pointerId) return
    event.preventDefault()
    dragState.lastMoveX = event.clientX - dragState.lastX
    dragState.lastX = event.clientX
    if (dragState.lastMoveX > 0.5) setDragDirection('right')
    if (dragState.lastMoveX < -0.5) setDragDirection('left')
    updateScrollLeft(dragState.startScrollLeft - (event.clientX - dragState.startX))
  }

  const handlePointerEnd = (event) => {
    const dragState = dragStateRef.current
    if (!dragState.isDragging || dragState.pointerId !== event.pointerId) return
    dragState.isDragging = false
    dragState.pointerId = null
    setIsDragging(false)
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    startInertia(dragState.lastMoveX)
  }

  const handlePointerLeave = () => {
    if (!dragStateRef.current.isDragging) setIsHintVisible(false)
  }

  useEffect(() => {
    const updateSize = () => setCardSize(window.matchMedia('(min-width: 640px)').matches ? 365 : 290)
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return undefined

    viewport.scrollLeft = loopWidth
    const frameId = requestAnimationFrame(() => {
      setActiveVirtualIndex(activeTestimonials.length)
    })

    return () => cancelAnimationFrame(frameId)
  }, [activeTestimonials.length, loopWidth])

  useEffect(() => () => {
    stopAnimation()
    if (hintFrameRef.current !== null) cancelAnimationFrame(hintFrameRef.current)
  }, [stopAnimation])

  return (
    <section
      ref={sectionRef}
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-[100vw] overflow-hidden bg-[#EFEFF4] py-16 sm:py-24"
    >
      <div className="mx-auto mb-8 max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className={cn(
            'mb-6 font-display text-4xl text-slate-900 sm:text-5xl lg:text-6xl',
            isVisible ? 'animate-enter' : 'opacity-0',
            '[animation-delay:150ms]',
          )}>
            Veja nossos cases de sucesso
          </h2>
          <p className={cn(
            'mx-auto max-w-2xl text-base text-slate-600 sm:text-lg',
            isVisible ? 'animate-enter' : 'opacity-0',
            '[animation-delay:300ms]',
          )}>
            Mais de 400 empresas confiam na Otimiza para transformar seus processos e acelerar seus resultados.
          </p>
        </div>
      </div>

      <div
        ref={viewportRef}
        data-testid="home-cases-carousel"
        data-card-interval={cardInterval}
        data-loop-width={loopWidth}
        className={cn(
          'group relative w-full overflow-hidden touch-pan-y select-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
          isVisible ? 'animate-enter' : 'opacity-0',
          '[animation-delay:450ms]',
        )}
        style={{ height: cardSize + 92 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={handlePointerLeave}
      >
        <span className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[15%] bg-gradient-to-r from-[#EFEFF4] to-transparent" />
        <span className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[15%] bg-gradient-to-l from-[#EFEFF4] to-transparent" />
        <div
          data-testid="home-cases-track"
          className="flex h-full w-max items-center"
          style={{ gap: CARD_GAP, paddingInline: `calc(50vw - ${cardSize / 2}px)` }}
        >
          {loopedTestimonials.map(({ testimonial, logicalIndex, copyIndex, virtualIndex }) => (
            <TestimonialCard
              key={`${copyIndex}-${testimonial.id}`}
              testimonial={testimonial}
              cardSize={cardSize}
              logicalIndex={logicalIndex}
              copyIndex={copyIndex}
              virtualIndex={virtualIndex}
              isActive={virtualIndex === activeVirtualIndex}
              isDragging={isDragging}
            />
          ))}
        </div>
      </div>

      {createPortal(
        <span
          data-testid="home-cases-drag-hint"
          className={cn(
            'pointer-events-none fixed left-0 top-0 z-[9999] inline-flex items-center rounded-full bg-slate-950/90 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur transition-opacity duration-200 ease-out',
            isHintVisible ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            transform: `translateX(${hintPosition.x}px) translateY(${hintPosition.y}px) scale(0.92)`,
          }}
        >
          <span>Arrastar</span>
          <ChevronRight
            data-testid="home-cases-drag-arrow"
            className="ml-1.5 h-3.5 w-3.5"
            aria-hidden="true"
            style={{
              transform: `rotate(${dragDirection === 'left' ? 180 : 0}deg) scale(${isDragging ? 1.12 : 1})`,
              transition: 'transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
        </span>,
        document.body,
      )}

      <div className={cn(
        'mt-8 flex justify-center',
        isVisible ? 'animate-enter' : 'opacity-0',
        '[animation-delay:600ms]',
      )}>
        <Link to="/cases" className="solutions-section__cta" style={{ boxShadow: 'none' }}>
          Confira todos os cases
          <ArrowRight className="solutions-section__cta-arrow" />
        </Link>
      </div>
    </section>
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
      { threshold },
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, isVisible]
}
