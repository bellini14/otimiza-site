import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { normalizeHomeCases } from '@/data/homeCases'

const CAROUSEL_COPIES = 3
const DESKTOP_CARD_SIZE = 365
const MOBILE_CARD_SIZE = 276
const DESKTOP_CARD_GAP = 24
const MOBILE_CARD_GAP = 12
const TOUCH_DRAG_MULTIPLIER = 1.45
const TOUCH_AXIS_LOCK_PX = 8
const TOUCH_AXIS_BIAS = 1.15
const TOUCH_SWIPE_THRESHOLD = 36
const MAX_TOUCH_SWIPE_STEPS = 2
const RELEASE_GAIN = 0.24
const RELEASE_FRICTION = 0.94
const MAX_RELEASE_SPEED = 40
const MAX_INERTIA_FRAMES = 38
const SNAP_DURATION_MS = 360

function CaseCard({ caseStudy, cardSize, isActive, isDragging, logicalIndex, copyIndex, virtualIndex }) {
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
      aria-label={copyIndex === 1 ? `Case ${caseStudy.company}` : undefined}
      className={cn(
        'relative flex-none rounded-2xl border border-slate-200/60 bg-[#EFEFF4] p-7 antialiased sm:p-8',
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
      <div className="mb-4 flex h-16 items-center sm:mb-5 sm:h-[4.5rem]">
        <img
          src={caseStudy.logoUrl}
          alt={copyIndex === 1 ? caseStudy.logoAlt || caseStudy.company : ''}
          draggable="false"
          className={cn(
            'max-h-10 w-auto max-w-[8.5rem] object-contain transition-[filter] duration-500 sm:max-h-12 sm:max-w-[10rem]',
            isActive ? 'grayscale-0' : 'grayscale',
          )}
        />
      </div>
      <p
        data-testid="home-case-summary"
        className={cn('line-clamp-2 text-[0.92rem] font-medium leading-snug sm:line-clamp-none sm:text-lg', isActive ? 'text-slate-900' : 'text-slate-700')}
      >
        {caseStudy.summary}
      </p>
      <div
        data-testid="home-case-details"
        className="absolute bottom-7 left-7 right-7 border-t border-slate-300/70 pt-3 sm:bottom-8 sm:left-8 sm:right-8"
      >
        <h3 className={cn('text-sm font-semibold sm:text-base', isActive ? 'text-brand-red' : 'text-slate-500')}>
          {caseStudy.company}
        </h3>
        <p className="mt-0.5 text-[0.68rem] font-medium uppercase tracking-[0.08em] text-slate-500 sm:text-xs">
          {caseStudy.sector}
        </p>
      </div>
    </article>
  )
}

export function StaggerTestimonials({ cases }) {
  const activeCases = useMemo(() => normalizeHomeCases(cases), [cases])
  const loopedCases = useMemo(
    () => Array.from({ length: CAROUSEL_COPIES }, (_, copyIndex) =>
      activeCases.map((caseStudy, logicalIndex) => ({
        caseStudy,
        logicalIndex,
        copyIndex,
        virtualIndex: copyIndex * activeCases.length + logicalIndex,
      }))).flat(),
    [activeCases],
  )
  const [cardSize, setCardSize] = useState(DESKTOP_CARD_SIZE)
  const [cardGap, setCardGap] = useState(DESKTOP_CARD_GAP)
  const [carouselSidePadding, setCarouselSidePadding] = useState(0)
  const [activeVirtualIndex, setActiveVirtualIndex] = useState(activeCases.length)
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
    axis: 'idle',
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    lastX: 0,
    lastMoveX: 0,
    dragMultiplier: 1,
    pointerType: 'mouse',
  })
  const cardInterval = cardSize + cardGap
  const loopWidth = activeCases.length * cardInterval

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

  const animateToScrollLeft = useCallback((target) => {
    const viewport = viewportRef.current
    if (!viewport) return
    const start = viewport.scrollLeft
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
  }, [updateScrollLeft])

  const snapToNearestCard = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    animateToScrollLeft(Math.round(viewport.scrollLeft / cardInterval) * cardInterval)
  }, [animateToScrollLeft, cardInterval])

  const snapTouchSwipe = useCallback((dragState) => {
    const totalDrag = (dragState.lastX - dragState.startX) * dragState.dragMultiplier
    const draggedDistance = Math.abs(totalDrag)

    if (draggedDistance < TOUCH_SWIPE_THRESHOLD) {
      snapToNearestCard()
      return
    }

    const direction = totalDrag < 0 ? 1 : -1
    const steps = Math.min(
      MAX_TOUCH_SWIPE_STEPS,
      Math.max(1, Math.round(draggedDistance / cardInterval)),
    )
    const startIndex = Math.round(dragState.startScrollLeft / cardInterval)
    animateToScrollLeft((startIndex + direction * steps) * cardInterval)
  }, [animateToScrollLeft, cardInterval, snapToNearestCard])

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
    const isTouch = event.pointerType === 'touch'
    if (!isTouch) event.preventDefault()
    stopAnimation()
    updateHintPosition(event)
    dragStateRef.current = {
      isDragging: !isTouch,
      pointerId: event.pointerId,
      axis: isTouch ? 'pending' : 'horizontal',
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: viewport.scrollLeft,
      lastX: event.clientX,
      lastMoveX: 0,
      dragMultiplier: event.pointerType === 'touch' ? TOUCH_DRAG_MULTIPLIER : 1,
      pointerType: event.pointerType || 'mouse',
    }
    setIsDragging(!isTouch)
    if (!isTouch) event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    updateHintPosition(event)
    const dragState = dragStateRef.current
    if (dragState.pointerId !== event.pointerId || dragState.axis === 'vertical') return

    if (dragState.axis === 'pending') {
      const totalX = event.clientX - dragState.startX
      const totalY = event.clientY - dragState.startY
      const absoluteX = Math.abs(totalX)
      const absoluteY = Math.abs(totalY)

      if (absoluteX < TOUCH_AXIS_LOCK_PX && absoluteY < TOUCH_AXIS_LOCK_PX) return

      if (absoluteY > absoluteX * TOUCH_AXIS_BIAS) {
        dragState.axis = 'vertical'
        dragState.isDragging = false
        if (viewportRef.current) viewportRef.current.scrollLeft = dragState.startScrollLeft
        setIsDragging(false)
        return
      }

      if (absoluteX <= absoluteY * TOUCH_AXIS_BIAS) return

      dragState.axis = 'horizontal'
      dragState.isDragging = true
      setIsDragging(true)
      event.currentTarget.setPointerCapture?.(event.pointerId)
    }

    if (!dragState.isDragging) return
    event.preventDefault()
    const moveDelta = event.clientX - dragState.lastX
    dragState.lastMoveX = moveDelta * dragState.dragMultiplier
    dragState.lastX = event.clientX
    if (dragState.lastMoveX > 0.5) setDragDirection('right')
    if (dragState.lastMoveX < -0.5) setDragDirection('left')
    updateScrollLeft(dragState.startScrollLeft - ((event.clientX - dragState.startX) * dragState.dragMultiplier))
  }

  const handlePointerEnd = (event) => {
    const dragState = dragStateRef.current
    if (dragState.pointerId !== event.pointerId) return
    if (!dragState.isDragging || dragState.axis !== 'horizontal') {
      dragState.isDragging = false
      dragState.pointerId = null
      dragState.axis = 'idle'
      setIsDragging(false)
      return
    }
    dragState.isDragging = false
    dragState.pointerId = null
    dragState.axis = 'idle'
    setIsDragging(false)
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    if (dragState.pointerType === 'touch') {
      snapTouchSwipe(dragState)
      return
    }
    startInertia(dragState.lastMoveX)
  }

  const handlePointerLeave = () => {
    if (!dragStateRef.current.isDragging) setIsHintVisible(false)
  }

  const handleKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    const viewport = viewportRef.current
    if (!viewport) return

    event.preventDefault()
    stopAnimation()
    const direction = event.key === 'ArrowRight' ? 1 : -1
    const currentIndex = Math.round(viewport.scrollLeft / cardInterval)
    animateToScrollLeft((currentIndex + direction) * cardInterval)
  }

  useEffect(() => {
    const updateSize = () => {
      const isDesktop = window.matchMedia('(min-width: 640px)').matches
      const nextCardSize = isDesktop ? DESKTOP_CARD_SIZE : MOBILE_CARD_SIZE
      const nextCardGap = isDesktop ? DESKTOP_CARD_GAP : MOBILE_CARD_GAP
      const carouselWidth = viewportRef.current?.clientWidth || window.innerWidth

      setCardSize(nextCardSize)
      setCardGap(nextCardGap)
      setCarouselSidePadding(Math.max(16, (carouselWidth - nextCardSize) / 2))
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return undefined

    viewport.scrollLeft = loopWidth
    const frameId = requestAnimationFrame(() => {
      setActiveVirtualIndex(activeCases.length)
    })

    return () => cancelAnimationFrame(frameId)
  }, [activeCases.length, loopWidth])

  useEffect(() => () => {
    stopAnimation()
    if (hintFrameRef.current !== null) cancelAnimationFrame(hintFrameRef.current)
  }, [stopAnimation])

  return (
    <section
      ref={sectionRef}
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-[100vw] overflow-hidden bg-[#EFEFF4] py-16 sm:py-24"
    >
      <div className="home-menu-shell mb-8" data-testid="home-menu-aligned-shell">
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
            Mais de mil clientes confiam na Otimiza para transformar seus processos e acelerar seus resultados.
          </p>
        </div>
      </div>

      <div
        ref={viewportRef}
        data-testid="home-cases-carousel"
        data-card-interval={cardInterval}
        data-loop-width={loopWidth}
        role="region"
        aria-label="Carrossel de cases de sucesso"
        tabIndex={0}
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
        onKeyDown={handleKeyDown}
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-[15%] bg-gradient-to-r from-[#EFEFF4] to-transparent sm:block" />
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-[15%] bg-gradient-to-l from-[#EFEFF4] to-transparent sm:block" />
        <div
          data-testid="home-cases-track"
          className="flex h-full w-max items-center"
          style={{ gap: cardGap, paddingInline: carouselSidePadding }}
        >
          {loopedCases.map(({ caseStudy, logicalIndex, copyIndex, virtualIndex }) => (
            <CaseCard
              key={`${copyIndex}-${caseStudy.id}`}
              caseStudy={caseStudy}
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

      <div
        className={cn(
        'home-menu-shell mt-8 flex justify-center',
        isVisible ? 'animate-enter' : 'opacity-0',
        '[animation-delay:600ms]',
      )}
        data-testid="home-menu-aligned-shell"
      >
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
