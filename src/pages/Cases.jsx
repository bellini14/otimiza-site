import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { client, urlFor } from '../lib/sanity'
import { resolveCaseStudySlug } from '../data/caseStudies'
import { groupClientsBySector } from '../data/clientSectors'
import { sitePages } from '../data/sitePages'
import Silk from '../components/Silk'
import SplitText from '../components/SplitText'
import { useDragCarousel } from '../hooks/useDragCarousel'
import { resolveLegacyImageUrl } from '../lib/legacyImageUrl'

const CAROUSEL_DRAG_RESPONSE = 0.96
const CAROUSEL_RELEASE_VELOCITY = 0.18
const CAROUSEL_FLOATING_FRICTION = 0.965
const CAROUSEL_EDGE_MAX_BOUNCE = 92
const CAROUSEL_EDGE_RESISTANCE = 250
const CAROUSEL_EDGE_SPRING = 0.16
const CAROUSEL_EDGE_DAMPING = 0.6
const SHOW_CASE_TESTIMONIALS = false
const CASES_CAROUSEL_GAP = 32
const MOBILE_CLIENT_INITIAL_LOGOS = 8
const MOBILE_CLIENT_LOAD_MORE_LOGOS = 6

const clientLogoFields = `{
  _id,
  name,
  sector,
  logoAlt,
  website,
  caseTitle,
  caseDescription,
  "caseSlug": caseSlug.current,
  logo
}`

const clientLogoQuery = `{
  "caseLogos": *[_type == "clientLogo" && isVisible != false && showOnCases == true && defined(logo.asset)] | order(coalesce(sortOrder, 9999) asc, name asc) ${clientLogoFields},
  "caseTestimonials": *[_type == "customerTestimonial" && isVisible != false && showOnCases == true] | order(coalesce(sortOrder, 9999) asc, company asc) {
    _id,
    clientName,
    company,
    role,
    category,
    shortQuote,
    detailedQuote,
    metrics,
    "avatarUrl": avatar.asset->url
  },
  "clientLogos": *[_type == "clientLogo" && isVisible != false && defined(logo.asset)] | order(sector asc, coalesce(sortOrder, 9999) asc, name asc) ${clientLogoFields}
}`

const MOCK_CASE_TESTIMONIALS = [
  {
    _id: 'mock-testemunhal-sulmaq',
    clientName: 'Mariana Fritsch',
    company: 'Sulmaq Casting',
    role: 'Gerente Industrial',
    category: 'Industria',
    detailedQuote:
      'A Otimiza nos ajudou a enxergar gargalos que estavam escondidos na rotina. Em poucos ciclos, passamos a tomar decisoes com dados mais claros e uma cadencia de execucao muito mais previsivel.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=320&h=420&fit=crop&crop=faces&q=80',
    metrics: [
      { label: 'Lead time', value: '-32%' },
      { label: 'Produtividade', value: '+41%' },
      { label: 'Rotinas mapeadas', value: '18' },
    ],
  },
  {
    _id: 'mock-testemunhal-sicredi',
    clientName: 'Rafael Machado',
    company: 'Sicredi Serra',
    role: 'Coordenador de Processos',
    category: 'Servicos financeiros',
    detailedQuote:
      'O trabalho trouxe uma camada de governanca que faltava para escalar nossas melhorias. Hoje as equipes sabem onde atuar, como medir avancos e como sustentar os resultados depois da implantacao.',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=320&h=420&fit=crop&crop=faces&q=80',
    metrics: [
      { label: 'Horas recuperadas', value: '460h' },
      { label: 'Retrabalho', value: '-58%' },
      { label: 'Areas envolvidas', value: '7' },
    ],
  },
  {
    _id: 'mock-testemunhal-miolo',
    clientName: 'Claudia Becker',
    company: 'Miolo Wine Group',
    role: 'Diretora de Operacoes',
    category: 'Alimentos e Bebidas',
    detailedQuote:
      'A metodologia deu ritmo para projetos que antes dependiam de esforcos isolados. O resultado foi uma operacao mais integrada, com indicadores acessiveis e times mais seguros para priorizar.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=320&h=420&fit=crop&crop=faces&q=80',
    metrics: [
      { label: 'Projetos entregues', value: '12' },
      { label: 'Ciclo de decisao', value: '-44%' },
      { label: 'Aderencia', value: '96%' },
    ],
  },
]

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getElasticTranslateX(translateX, minTranslateX) {
  if (translateX > 0) {
    return CAROUSEL_EDGE_MAX_BOUNCE * (1 - Math.exp(-translateX / CAROUSEL_EDGE_RESISTANCE))
  }

  if (translateX < minTranslateX) {
    const overflow = minTranslateX - translateX
    return minTranslateX - CAROUSEL_EDGE_MAX_BOUNCE * (1 - Math.exp(-overflow / CAROUSEL_EDGE_RESISTANCE))
  }

  return translateX
}

function getViewportWidth() {
  return typeof window === 'undefined' ? 1024 : window.innerWidth
}

function getHomeInlinePx(viewportWidth) {
  if (viewportWidth >= 1024) return 40
  if (viewportWidth >= 640) return 32
  return 24
}

function getCasesSlideStep(viewportWidth) {
  if (viewportWidth < 640) {
    return viewportWidth - getHomeInlinePx(viewportWidth) * 2 + CASES_CAROUSEL_GAP
  }

  return ((Math.min(viewportWidth, 1380) - 48 - CASES_CAROUSEL_GAP) / 2) + CASES_CAROUSEL_GAP
}

function testimonialRevealClass(isVisible, direction, className = '') {
  return [
    'testimonial-scroll-reveal',
    `testimonial-scroll-reveal--${direction}`,
    isVisible ? 'testimonial-scroll-reveal--visible' : '',
    className,
  ].filter(Boolean).join(' ')
}

function ClientLogoCard({ logo, variant = 'client', className = '', testId, fluid = false }) {
  const logoSrc = resolveLegacyImageUrl(
    logo.logo ? urlFor(logo.logo).ignoreImageParams().width(420).fit('max').url() : logo.logoUrl,
  )
  const logoImage = (
    <img
      src={logoSrc}
      alt={logo.logoAlt || logo.name}
      className="max-h-16 max-w-[78%] object-contain transition duration-300"
      loading="lazy"
      draggable={false}
    />
  )
  const title = variant === 'case' ? logo.caseTitle || logo.name : logo.name
  const description = variant === 'case' ? logo.caseDescription : ''
  const caseSlug = logo.caseSlug || resolveCaseStudySlug(logo.name)
  const caseHref = caseSlug ? `/cases/${caseSlug}` : null
  const CardTag = variant === 'case' ? 'article' : 'div'
  const isCaseCard = variant === 'case'

  return (
    <CardTag
      data-testid={testId || `case-client-card-${logo._id || logo.name}`}
      className={[
        'flex h-full flex-col rounded-lg bg-white p-4 text-center',
        isCaseCard
          ? `min-h-[25rem] select-none rounded-xl bg-[#DDE4EF] px-6 py-6 ${fluid ? 'w-full' : 'w-72 sm:w-80 lg:w-[22rem]'}`
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        data-testid="case-client-logo-box"
        className={[
          'flex min-h-36 items-center justify-center rounded-md bg-slate-50 px-6 py-8',
          isCaseCard ? 'min-h-40 border-0 bg-white px-5 py-6' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {logo.website && !isCaseCard ? (
          <a href={logo.website} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center">
            {logoImage}
          </a>
        ) : (
          logoImage
        )}
      </div>
      {isCaseCard && (
        <div className="flex flex-1 flex-col px-3 pb-1 pt-6">
          <h3 className="text-lg font-semibold leading-tight text-slate-900">
            {title}
          </h3>
          {description && <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>}
          {caseHref && (
            <Link
              to={caseHref}
              className="mt-auto inline-flex w-fit self-center border-b border-current pb-0.5 text-sm font-semibold text-slate-900"
            >
              Ler mais
            </Link>
          )}
        </div>
      )}
    </CardTag>
  )
}

function DesktopCasesCarousel({ caseLogos }) {
  const shellRef = useRef(null)
  const carouselRef = useRef(null)
  const animationFrameRef = useRef(null)
  const hintFrameRef = useRef(null)
  const hintHasPositionRef = useRef(false)
  const hintPositionRef = useRef({ x: 0, y: 0 })
  const hintTargetRef = useRef({ x: 0, y: 0 })
  const translateXRef = useRef(0)
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startTranslateX: 0,
    lastDeltaX: 0,
    lastMoveX: 0,
    hasDragged: false,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [translateX, setTranslateX] = useState(0)
  const [hintPosition, setHintPosition] = useState({ x: 0, y: 0 })
  const [dragDirection, setDragDirection] = useState('right')

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (hintFrameRef.current) {
        cancelAnimationFrame(hintFrameRef.current)
      }
    }
  }, [])

  function updateTranslateX(nextTranslateX) {
    translateXRef.current = nextTranslateX
    setTranslateX(nextTranslateX)
  }

  function stopInertia() {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }

  function startInertia(initialVelocity) {
    let velocity = initialVelocity
    let springVelocity = 0

    function step() {
      const minTranslateX = getMinTranslateX()
      const currentTranslateX = translateXRef.current
      const edgeTarget = currentTranslateX > 0 ? 0 : currentTranslateX < minTranslateX ? minTranslateX : null

      if (edgeTarget !== null) {
        const distanceToEdge = edgeTarget - currentTranslateX
        springVelocity = (springVelocity + distanceToEdge * CAROUSEL_EDGE_SPRING) * CAROUSEL_EDGE_DAMPING
        const nextTranslateX = currentTranslateX + springVelocity

        if (Math.abs(distanceToEdge) < 0.8 && Math.abs(springVelocity) < 0.1) {
          updateTranslateX(edgeTarget)
          animationFrameRef.current = null
          return
        }

        updateTranslateX(nextTranslateX)
        animationFrameRef.current = requestAnimationFrame(step)
        return
      }

      const nextTranslateX = currentTranslateX + velocity

      if (nextTranslateX > 0) {
        updateTranslateX(getElasticTranslateX(nextTranslateX, minTranslateX))
        velocity = 0
        animationFrameRef.current = requestAnimationFrame(step)
        return
      }

      if (nextTranslateX < minTranslateX) {
        updateTranslateX(getElasticTranslateX(nextTranslateX, minTranslateX))
        velocity = 0
        animationFrameRef.current = requestAnimationFrame(step)
        return
      }

      updateTranslateX(nextTranslateX)
      velocity *= CAROUSEL_FLOATING_FRICTION

      if (Math.abs(velocity) < 0.18) {
        animationFrameRef.current = null
        return
      }

      animationFrameRef.current = requestAnimationFrame(step)
    }

    stopInertia()
    animationFrameRef.current = requestAnimationFrame(step)
  }

  function getMinTranslateX() {
    const shell = shellRef.current
    const carousel = carouselRef.current
    if (!shell || !carousel) return 0

    return Math.min(0, shell.clientWidth - carousel.scrollWidth)
  }

  function updateHintPosition(event) {
    const shellRect = shellRef.current?.getBoundingClientRect()
    const nextX = shellRect ? event.clientX - shellRect.left + 14 : event.clientX + 14
    const nextY = shellRect ? event.clientY - shellRect.top + 12 : event.clientY + 12
    const nextTarget = {
      x: Number.isFinite(nextX) ? nextX : hintTargetRef.current.x,
      y: Number.isFinite(nextY) ? nextY : hintTargetRef.current.y,
    }

    hintTargetRef.current = nextTarget

    if (!hintHasPositionRef.current) {
      hintHasPositionRef.current = true
      hintPositionRef.current = nextTarget
      setHintPosition(nextTarget)
      return
    }

    if (hintFrameRef.current) return

    function animateHint() {
      const currentPosition = hintPositionRef.current
      const targetPosition = hintTargetRef.current
      const nextPosition = {
        x: currentPosition.x + (targetPosition.x - currentPosition.x) * 0.18,
        y: currentPosition.y + (targetPosition.y - currentPosition.y) * 0.18,
      }
      const distanceX = Math.abs(targetPosition.x - nextPosition.x)
      const distanceY = Math.abs(targetPosition.y - nextPosition.y)

      hintPositionRef.current = nextPosition
      setHintPosition(nextPosition)

      if (distanceX < 0.4 && distanceY < 0.4) {
        hintPositionRef.current = targetPosition
        setHintPosition(targetPosition)
        hintFrameRef.current = null
        return
      }

      hintFrameRef.current = requestAnimationFrame(animateHint)
    }

    hintFrameRef.current = requestAnimationFrame(animateHint)
  }

  function handlePointerDown(event) {
    if (!carouselRef.current) return
    if (event.target instanceof Element && event.target.closest('a, button, input, textarea, select, [role="button"]')) return

    event.preventDefault()
    stopInertia()
    updateHintPosition(event)
    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      startTranslateX: translateXRef.current,
      lastDeltaX: 0,
      lastMoveX: 0,
      hasDragged: false,
    }
    setIsDragging(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function handlePointerMove(event) {
    const dragState = dragStateRef.current

    updateHintPosition(event)

    if (!carouselRef.current || !dragState.isDragging) return

    event.preventDefault()
    const deltaX = event.clientX - dragState.startX
    dragState.lastMoveX = deltaX - dragState.lastDeltaX
    dragState.lastDeltaX = deltaX
    if (Math.abs(deltaX) > 4) {
      dragState.hasDragged = true
    }
    if (dragState.lastMoveX > 0.5) {
      setDragDirection('right')
    } else if (dragState.lastMoveX < -0.5) {
      setDragDirection('left')
    }

    const minTranslateX = getMinTranslateX()
    const nextTranslateX = dragState.startTranslateX + deltaX * CAROUSEL_DRAG_RESPONSE

    updateTranslateX(getElasticTranslateX(nextTranslateX, minTranslateX))
  }

  function endDrag(event) {
    if (!dragStateRef.current.isDragging) return

    dragStateRef.current.isDragging = false
    setIsDragging(false)
    startInertia(dragStateRef.current.lastMoveX * CAROUSEL_RELEASE_VELOCITY)
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }

  return (
    <div
      ref={shellRef}
      data-testid="cases-carousel-shell"
      className="group relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-visible py-2"
      onPointerMove={updateHintPosition}
    >
      <span
        data-testid="cases-carousel-fade"
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-[#E5E9F1] via-[#E5E9F1]/85 to-transparent sm:w-36 lg:w-48"
        aria-hidden="true"
      />
      <span
        data-testid="cases-carousel-fade"
        className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 bg-gradient-to-l from-[#E5E9F1] via-[#E5E9F1]/85 to-transparent sm:w-36 lg:w-48"
        aria-hidden="true"
      />
      <span
        data-testid="cases-drag-hint"
        className="pointer-events-none absolute left-0 top-0 z-30 hidden rounded-full bg-slate-950/80 px-4 py-2 text-xs font-semibold text-white opacity-0 shadow-xl backdrop-blur transition-opacity duration-300 ease-out group-hover:opacity-100 sm:inline-flex"
        style={{
          transform: `translateX(${hintPosition.x}px) translateY(${hintPosition.y}px) scale(0.92)`,
        }}
      >
        <span>Arrastar</span>
        <ChevronRight
          data-testid="cases-drag-arrow"
          className="ml-1.5 h-3.5 w-3.5"
          aria-hidden="true"
          style={{
            transform: `rotate(${dragDirection === 'left' ? 180 : 0}deg) scale(${isDragging ? 1.12 : 1})`,
            transition: 'transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </span>
      <div
        ref={carouselRef}
        data-testid="cases-carousel"
        data-mobile-snap="false"
        className={[
          'flex w-max gap-8 pb-4 pt-1',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        ].join(' ')}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: 'none',
          touchAction: 'pan-y',
          userSelect: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          data-testid="case-carousel-edge-spacer"
          className="shrink-0 w-40 sm:w-48 lg:w-[13rem]"
          aria-hidden="true"
        />
        {caseLogos.map((logo, index) => (
          <div
            key={logo._id || logo.name}
            data-testid="case-carousel-item"
            className="case-carousel-reveal shrink-0"
            style={{
              '--case-carousel-reveal-index': String(index),
              animationDelay: `${120 + index * 90}ms`,
            }}
          >
            <ClientLogoCard logo={logo} variant="case" testId={`case-client-card-${logo._id || logo.name}`} />
          </div>
        ))}
        <div
          data-testid="case-carousel-edge-spacer"
          className="shrink-0 w-40 sm:w-48 lg:w-[13rem]"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

function MobileCasesCarousel({ caseLogos, viewportWidth }) {
  const {
    shellRef,
    trackRef,
    translateX,
    isDragging,
    dragDirection,
    hintPosition,
    updateHintPosition,
    trackHandlers,
  } = useDragCarousel({
    snapStep: getCasesSlideStep(viewportWidth),
    snapOnRelease: true,
    geometryKey: viewportWidth,
  })

  return (
    <div
      ref={shellRef}
      data-testid="cases-carousel-shell"
      className="group relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden py-2 md:overflow-visible"
      onPointerMove={updateHintPosition}
    >
      <span
        data-testid="cases-carousel-fade"
        className="cases-carousel-fade pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-[#E5E9F1] via-[#E5E9F1]/85 to-transparent sm:w-36"
        aria-hidden="true"
      />
      <span
        data-testid="cases-carousel-fade"
        className="cases-carousel-fade pointer-events-none absolute inset-y-0 right-0 z-20 w-24 bg-gradient-to-l from-[#E5E9F1] via-[#E5E9F1]/85 to-transparent sm:w-36"
        aria-hidden="true"
      />
      <span
        data-testid="cases-drag-hint"
        className="pointer-events-none absolute left-0 top-0 z-30 hidden rounded-full bg-slate-950/80 px-4 py-2 text-xs font-semibold text-white opacity-0 shadow-xl backdrop-blur transition-opacity duration-300 ease-out group-hover:opacity-100 sm:inline-flex"
        style={{
          transform: `translateX(${hintPosition.x}px) translateY(${hintPosition.y}px) scale(0.92)`,
        }}
      >
        <span>Arrastar</span>
        <ChevronRight
          data-testid="cases-drag-arrow"
          className="ml-1.5 h-3.5 w-3.5"
          aria-hidden="true"
          style={{
            transform: `rotate(${dragDirection === 'left' ? 180 : 0}deg) scale(${isDragging ? 1.12 : 1})`,
            transition: 'transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </span>
      <div
        ref={trackRef}
        data-testid="cases-carousel"
        data-mobile-snap="true"
        className={[
          'flex w-max gap-8 pb-4 pt-1 will-change-transform',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        ].join(' ')}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: 'none',
          touchAction: 'pan-y',
          userSelect: 'none',
        }}
        {...trackHandlers}
      >
        <div
          data-testid="case-carousel-edge-spacer"
          className="cases-carousel-edge-spacer shrink-0"
          aria-hidden="true"
        />
        {caseLogos.map((logo, index) => (
          <div
            key={logo._id || logo.name}
            data-testid="case-carousel-item"
            data-carousel-snap-slide="true"
            className="cases-carousel-item case-carousel-reveal shrink-0"
            style={{
              '--case-carousel-reveal-index': String(index),
              animationDelay: `${120 + index * 90}ms`,
            }}
          >
            <ClientLogoCard
              logo={logo}
              variant="case"
              fluid
              testId={`case-client-card-${logo._id || logo.name}`}
            />
          </div>
        ))}
        <div
          data-testid="case-carousel-edge-spacer"
          className="cases-carousel-edge-spacer shrink-0"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

function CasesCarousel({ caseLogos }) {
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth)

  useEffect(() => {
    function handleResize() {
      setViewportWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobileCarousel = viewportWidth < 768

  return isMobileCarousel ? (
    <MobileCasesCarousel
      key="mobile"
      caseLogos={caseLogos}
      viewportWidth={viewportWidth}
    />
  ) : (
    <DesktopCasesCarousel key="desktop" caseLogos={caseLogos} />
  )
}

function MobileClientLogoGroups({ groups }) {
  const [visibleCounts, setVisibleCounts] = useState({})

  function showMore(sector) {
    setVisibleCounts((currentCounts) => ({
      ...currentCounts,
      [sector]: (currentCounts[sector] || MOBILE_CLIENT_INITIAL_LOGOS) + MOBILE_CLIENT_LOAD_MORE_LOGOS,
    }))
  }

  return (
    <div data-testid="mobile-client-groups" className="space-y-14">
      {groups.map((group) => {
        const visibleCount = visibleCounts[group.sector] || MOBILE_CLIENT_INITIAL_LOGOS
        const visibleLogos = group.clients.slice(0, visibleCount)
        const hasMore = visibleCount < group.clients.length

        return (
          <section key={group.sector} data-testid="client-sector" className="border-t border-slate-200 pt-5">
            <div className="mb-5 flex items-center gap-4">
              <h3 className="max-w-[85%] text-lg font-semibold leading-snug text-slate-600">
                {group.sector}
              </h3>
              <span className="h-px flex-1 bg-brand-red/60" aria-hidden="true" />
            </div>

            <div data-testid="mobile-client-logo-grid" className="grid grid-cols-2 gap-3">
              {visibleLogos.map((logo, index) => (
                <div
                  key={logo._id || `${group.sector}-${logo.name}`}
                  className="client-logo-reveal min-w-0"
                  style={{ animationDelay: `${Math.min(index * 45, 315)}ms` }}
                >
                  <ClientLogoCard logo={logo} className="min-w-0 p-2" />
                </div>
              ))}
            </div>

            {hasMore && (
              <button
                type="button"
                aria-label={`Ver mais clientes de ${group.sector}`}
                onClick={() => showMore(group.sector)}
                className="mt-6 inline-flex items-center border-b border-slate-950 pb-1 text-sm font-semibold text-slate-950 transition-colors hover:border-brand-red hover:text-brand-red"
              >
                Ver mais
              </button>
            )}
          </section>
        )
      })}
    </div>
  )
}

function ClientLogosCarousel({ logos, animationKey }) {
  const shellRef = useRef(null)
  const carouselRef = useRef(null)
  const animationFrameRef = useRef(null)
  const hintFrameRef = useRef(null)
  const hintHasPositionRef = useRef(false)
  const hintPositionRef = useRef({ x: 0, y: 0 })
  const hintTargetRef = useRef({ x: 0, y: 0 })
  const translateXRef = useRef(0)
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startTranslateX: 0,
    lastDeltaX: 0,
    lastMoveX: 0,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [translateX, setTranslateX] = useState(0)
  const [hintPosition, setHintPosition] = useState({ x: 0, y: 0 })
  const [fadeVisibility, setFadeVisibility] = useState({ previous: false, next: true })
  const [dragDirection, setDragDirection] = useState('right')

  useEffect(() => {
    stopInertia()
    translateXRef.current = 0
    setTranslateX(0)
    setFadeVisibility({ previous: false, next: logos.length > 1 })
    setDragDirection('right')
  }, [animationKey])

  useEffect(() => {
    return () => {
      stopInertia()
      if (hintFrameRef.current) {
        cancelAnimationFrame(hintFrameRef.current)
      }
    }
  }, [])

  function updateTranslateX(nextTranslateX) {
    translateXRef.current = nextTranslateX
    setTranslateX(nextTranslateX)
    updateFadeVisibility(nextTranslateX)
  }

  function stopInertia() {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }

  function startInertia(initialVelocity) {
    let velocity = initialVelocity
    let springVelocity = 0

    function step() {
      const minTranslateX = getMinTranslateX()
      const currentTranslateX = translateXRef.current
      const edgeTarget = currentTranslateX > 0 ? 0 : currentTranslateX < minTranslateX ? minTranslateX : null

      if (edgeTarget !== null) {
        const distanceToEdge = edgeTarget - currentTranslateX
        springVelocity = (springVelocity + distanceToEdge * CAROUSEL_EDGE_SPRING) * CAROUSEL_EDGE_DAMPING
        const nextTranslateX = currentTranslateX + springVelocity

        if (Math.abs(distanceToEdge) < 0.8 && Math.abs(springVelocity) < 0.1) {
          updateTranslateX(edgeTarget)
          animationFrameRef.current = null
          return
        }

        updateTranslateX(nextTranslateX)
        animationFrameRef.current = requestAnimationFrame(step)
        return
      }

      const nextTranslateX = currentTranslateX + velocity

      if (nextTranslateX > 0) {
        updateTranslateX(getElasticTranslateX(nextTranslateX, minTranslateX))
        velocity = 0
        animationFrameRef.current = requestAnimationFrame(step)
        return
      }

      if (nextTranslateX < minTranslateX) {
        updateTranslateX(getElasticTranslateX(nextTranslateX, minTranslateX))
        velocity = 0
        animationFrameRef.current = requestAnimationFrame(step)
        return
      }

      updateTranslateX(nextTranslateX)
      velocity *= CAROUSEL_FLOATING_FRICTION

      if (Math.abs(velocity) < 0.18) {
        animationFrameRef.current = null
        return
      }

      animationFrameRef.current = requestAnimationFrame(step)
    }

    stopInertia()
    animationFrameRef.current = requestAnimationFrame(step)
  }

  function getMinTranslateX() {
    const shell = shellRef.current
    const carousel = carouselRef.current
    if (!shell || !carousel) return 0

    return Math.min(0, shell.clientWidth - carousel.scrollWidth)
  }

  function updateFadeVisibility(currentTranslateX = translateXRef.current) {
    const minTranslateX = getMinTranslateX()
    setFadeVisibility({
      previous: currentTranslateX < -1,
      next: currentTranslateX > minTranslateX + 1,
    })
  }

  function updateHintPosition(event) {
    const shellRect = shellRef.current?.getBoundingClientRect()
    const nextX = shellRect ? event.clientX - shellRect.left + 14 : event.clientX + 14
    const nextY = shellRect ? event.clientY - shellRect.top + 12 : event.clientY + 12
    const nextTarget = {
      x: Number.isFinite(nextX) ? nextX : hintTargetRef.current.x,
      y: Number.isFinite(nextY) ? nextY : hintTargetRef.current.y,
    }

    hintTargetRef.current = nextTarget

    if (!hintHasPositionRef.current) {
      hintHasPositionRef.current = true
      hintPositionRef.current = nextTarget
      setHintPosition(nextTarget)
      return
    }

    if (hintFrameRef.current) return

    function animateHint() {
      const currentPosition = hintPositionRef.current
      const targetPosition = hintTargetRef.current
      const nextPosition = {
        x: currentPosition.x + (targetPosition.x - currentPosition.x) * 0.18,
        y: currentPosition.y + (targetPosition.y - currentPosition.y) * 0.18,
      }
      const distanceX = Math.abs(targetPosition.x - nextPosition.x)
      const distanceY = Math.abs(targetPosition.y - nextPosition.y)

      hintPositionRef.current = nextPosition
      setHintPosition(nextPosition)

      if (distanceX < 0.4 && distanceY < 0.4) {
        hintPositionRef.current = targetPosition
        setHintPosition(targetPosition)
        hintFrameRef.current = null
        return
      }

      hintFrameRef.current = requestAnimationFrame(animateHint)
    }

    hintFrameRef.current = requestAnimationFrame(animateHint)
  }

  function handlePointerDown(event) {
    if (!carouselRef.current) return
    if (event.target instanceof Element && event.target.closest('a, button, input, textarea, select, [role="button"]')) return

    event.preventDefault()
    stopInertia()
    updateHintPosition(event)
    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      startTranslateX: translateXRef.current,
      lastDeltaX: 0,
      lastMoveX: 0,
    }
    setIsDragging(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function handlePointerMove(event) {
    const dragState = dragStateRef.current

    updateHintPosition(event)

    if (!carouselRef.current || !dragState.isDragging) return

    event.preventDefault()
    const deltaX = event.clientX - dragState.startX
    dragState.lastMoveX = deltaX - dragState.lastDeltaX
    dragState.lastDeltaX = deltaX
    if (dragState.lastMoveX > 0.5) {
      setDragDirection('right')
    } else if (dragState.lastMoveX < -0.5) {
      setDragDirection('left')
    }
    const nextTranslateX = dragState.startTranslateX + deltaX * CAROUSEL_DRAG_RESPONSE
    updateTranslateX(getElasticTranslateX(nextTranslateX, getMinTranslateX()))
  }

  function endDrag(event) {
    if (!dragStateRef.current.isDragging) return

    dragStateRef.current.isDragging = false
    setIsDragging(false)
    startInertia(dragStateRef.current.lastMoveX * CAROUSEL_RELEASE_VELOCITY)
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }

  return (
    <div
      ref={shellRef}
      data-testid="client-logo-carousel-shell"
      className="group relative w-full overflow-visible py-2"
      onPointerMove={updateHintPosition}
    >
      <span
        data-testid="client-logo-drag-hint"
        className="pointer-events-none absolute left-0 top-0 z-30 hidden rounded-full bg-slate-950/80 px-4 py-2 text-xs font-semibold text-white opacity-0 shadow-xl backdrop-blur transition-opacity duration-300 ease-out group-hover:opacity-100 sm:inline-flex"
        style={{
          transform: `translateX(${hintPosition.x}px) translateY(${hintPosition.y}px) scale(0.92)`,
        }}
      >
        <span>Arrastar</span>
        <ChevronRight
          data-testid="client-logo-drag-arrow"
          className="ml-1.5 h-3.5 w-3.5"
          aria-hidden="true"
          style={{
            transform: `rotate(${dragDirection === 'left' ? 180 : 0}deg) scale(${isDragging ? 1.12 : 1})`,
            transition: 'transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </span>
      <div
        data-testid="client-logo-carousel-viewport"
        className="relative overflow-hidden"
      >
        <span
          data-testid="client-logo-carousel-fade"
          className={[
            'pointer-events-none absolute inset-y-0 left-0 z-20 w-8 bg-gradient-to-r from-white via-white/75 to-transparent transition-opacity duration-300 sm:w-10 lg:w-12',
            fadeVisibility.previous ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          aria-hidden="true"
        />
        <span
          data-testid="client-logo-carousel-fade"
          className={[
            'pointer-events-none absolute inset-y-0 right-0 z-20 w-8 bg-gradient-to-l from-white via-white/75 to-transparent transition-opacity duration-300 sm:w-10 lg:w-12',
            fadeVisibility.next ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          aria-hidden="true"
        />
        <div
          ref={carouselRef}
          data-testid="client-logo-carousel"
          className={[
            'flex w-max gap-6 pb-4 pt-1 sm:gap-7 lg:gap-9',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
          ].join(' ')}
          style={{
            transform: `translateX(${translateX}px)`,
            transition: 'none',
            touchAction: 'pan-y',
            userSelect: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {logos.map((logo, index) => (
            <div
              key={`${animationKey}-${logo._id || `${logo.sector}-${logo.name}`}`}
              data-testid="client-logo-reveal"
              data-animation-run={animationKey}
              className="client-logo-reveal w-[13.5rem] shrink-0 sm:w-[15rem]"
              style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
            >
              <ClientLogoCard logo={logo} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CaseTestimonialsSection({ testimonials }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(() => typeof IntersectionObserver === 'undefined')
  const revealTargetRef = useRef(null)

  if (testimonials.length === 0) {
    return null
  }

  const totalTestimonials = testimonials.length

  function moveTo(index) {
    setActiveIndex(clamp(index, 0, totalTestimonials - 1))
  }

  useEffect(() => {
    const target = revealTargetRef.current

    if (!target || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.24 },
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      data-testid="cases-testimonials-section"
      aria-label="Depoimentos de clientes"
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden py-4"
      style={{
        '--testimonial-card-width': 'min(82.5rem, calc(100vw - 1rem))',
        '--testimonial-card-gap': '1.5rem',
      }}
    >
      <div
        ref={revealTargetRef}
        data-testid="cases-testimonials-reveal-target"
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <div className="mx-auto mb-8 w-[var(--testimonial-card-width)]">
        <p
          data-reveal="testimonials-heading"
          className={testimonialRevealClass(isVisible, 'up', 'max-w-5xl font-display text-2xl leading-tight text-slate-700 sm:text-4xl')}
          style={{ '--testimonial-reveal-delay': '0ms' }}
        >
          Depoimentos completos de clientes que transformaram processos, indicadores e rotinas com a Otimiza.
        </p>
      </div>

      <div
        data-testid="cases-testimonials-carousel-shell"
        className="mx-auto w-[var(--testimonial-card-width)] overflow-visible py-2"
      >
        <div
          data-testid="cases-testimonials-carousel"
          className="flex transition-transform duration-500 ease-out"
          style={{
            gap: 'var(--testimonial-card-gap)',
            transform: `translateX(calc(-${activeIndex} * (var(--testimonial-card-width) + var(--testimonial-card-gap))))`,
          }}
        >
        {testimonials.map((testimonial, index) => {
          const isActive = index === activeIndex

          return (
            <article
              key={testimonial._id || `${testimonial.company}-${testimonial.clientName}`}
              data-testid="cases-testimonial-card"
              data-reveal="testimonials-card"
              data-carousel-active={isActive ? 'true' : 'false'}
              className={[
                testimonialRevealClass(isVisible, 'right', 'flex min-h-[37rem] w-[var(--testimonial-card-width)] shrink-0 flex-col rounded-3xl border p-6 transition-colors duration-300 sm:min-h-[35rem] sm:p-8 lg:min-h-[36rem] lg:flex-row lg:gap-12 lg:p-12'),
                isActive
                  ? 'z-20 border-slate-300 bg-slate-200 opacity-100'
                  : 'z-10 border-slate-200/70 bg-slate-50 opacity-100',
              ].join(' ')}
              style={{ '--testimonial-reveal-delay': '160ms' }}
            >
              <div className="flex min-w-0 flex-1 flex-col">
                {testimonial.category && (
                  <span
                    data-reveal="testimonials-category"
                    className={testimonialRevealClass(isVisible, 'up', 'w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm sm:px-4 sm:py-1.5 sm:text-sm')}
                    style={{ '--testimonial-reveal-delay': '320ms' }}
                  >
                    {testimonial.category}
                  </span>
                )}
                <h3
                  data-reveal="testimonials-company"
                  className={testimonialRevealClass(isVisible, 'up', 'mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:mt-6 sm:text-4xl lg:text-5xl')}
                  style={{ '--testimonial-reveal-delay': '380ms' }}
                >
                  {testimonial.company}
                </h3>
                <p
                  data-reveal="testimonials-quote"
                  className={testimonialRevealClass(isVisible, 'up', 'mt-4 max-w-3xl flex-1 whitespace-normal break-words text-base leading-relaxed text-slate-700 sm:mt-6 sm:text-lg lg:mt-8 lg:text-xl')}
                  style={{ '--testimonial-reveal-delay': '440ms' }}
                >
                  &ldquo;{testimonial.detailedQuote || testimonial.shortQuote}&rdquo;
                </p>
                <div
                  data-reveal="testimonials-mobile-author"
                  className={testimonialRevealClass(isVisible, 'up', 'mt-6 flex items-center gap-3 sm:mt-8 lg:hidden')}
                  style={{ '--testimonial-reveal-delay': '560ms' }}
                >
                  {testimonial.avatarUrl && (
                    <img
                      src={testimonial.avatarUrl}
                      alt={testimonial.clientName}
                      className="h-10 w-10 rounded-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-950 sm:text-base">{testimonial.clientName}</p>
                    <p className="text-xs leading-snug text-slate-600 sm:text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p
                  data-reveal="testimonials-card-label"
                  className={testimonialRevealClass(isVisible, 'up', 'mt-4 text-xs font-semibold uppercase text-slate-500 lg:mt-6')}
                  style={{ '--testimonial-reveal-delay': '620ms' }}
                >
                  {testimonial.company}
                </p>
              </div>

              <aside
                data-reveal="testimonials-aside"
                className={testimonialRevealClass(isVisible, 'up', 'hidden shrink-0 flex-col lg:flex lg:w-72')}
                style={{ '--testimonial-reveal-delay': '560ms' }}
              >
                {testimonial.avatarUrl && (
                  <div className="relative h-60 w-40 overflow-hidden rounded-full">
                    <img
                      src={testimonial.avatarUrl}
                      alt={testimonial.clientName}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="mt-2 pt-6">
                  <p className="text-xs font-semibold uppercase text-slate-600">{testimonial.role}</p>
                  <p className="mt-1 text-lg font-semibold leading-snug text-slate-950">{testimonial.clientName}</p>
                </div>
                {Array.isArray(testimonial.metrics) && testimonial.metrics.length > 0 && (
                  <div className="mt-6 border-t border-slate-900/10 pt-8">
                    <p className="text-xs font-semibold uppercase text-slate-600">Como usam a Otimiza</p>
                    <div className="mt-4 space-y-2">
                      {testimonial.metrics.map((metric) => (
                        <div key={`${metric.label}-${metric.value}`} className="flex justify-between gap-4">
                          <span className="text-sm text-slate-600">{metric.label}</span>
                          <span className="text-sm font-semibold text-slate-950">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </article>
          )
        })}
        </div>
      </div>

      <div
        data-reveal="testimonials-controls"
        className={testimonialRevealClass(isVisible, 'up', 'mx-auto mt-8 flex w-[var(--testimonial-card-width)] items-center justify-between')}
        style={{ '--testimonial-reveal-delay': '700ms' }}
      >
        <div className="flex gap-2">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial._id || index}
              type="button"
              className={[
                'h-2 cursor-pointer rounded-full transition-all duration-300',
                index === activeIndex ? 'w-8 bg-slate-900' : 'w-2 bg-slate-900/30 hover:bg-slate-900/50',
              ].join(' ')}
              aria-label={`Ir para testemunhal ${index + 1}`}
              onClick={() => moveTo(index)}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-900 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Testemunhal anterior"
            disabled={activeIndex === 0}
            onClick={() => moveTo(activeIndex - 1)}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-900 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Proximo testemunhal"
            disabled={activeIndex === testimonials.length - 1}
            onClick={() => moveTo(activeIndex + 1)}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}

function CasesCtaSection() {
  return (
    <section
      data-testid="cases-cta-section"
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden bg-[#E5E9F1] py-28 sm:py-32 lg:py-36"
      style={{ backgroundColor: '#E5E9F1' }}
      aria-labelledby="cases-cta-title"
    >
      <div
        data-testid="cases-cta-silk"
        className="pointer-events-none absolute inset-0 opacity-25 [mask-image:radial-gradient(circle_at_center,black_0%,black_48%,transparent_76%)]"
        aria-hidden="true"
      >
        <Silk
          speed={5.1}
          scale={1}
          color="#EDF0F5"
          noiseIntensity={1.5}
          rotation={0.2}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),rgba(229,233,241,0.72)_54%,rgba(229,233,241,0.98)_100%)]"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto flex max-w-[1320px] flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <h2 id="cases-cta-title" className="font-display text-4xl leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
          Quer construir o próximo case de sucesso?
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Leve a metodologia da Otimiza para transformar processos, indicadores e rotinas em avanços mensuráveis para a sua operação.
        </p>
        <Link
          to="/contato"
          className="mt-10 inline-flex items-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)] transition-colors hover:bg-brand-red"
        >
          Fale com a Otimiza
          <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}

function Cases() {
  const [caseLogos, setCaseLogos] = useState([])
  const [caseTestimonials, setCaseTestimonials] = useState([])
  const [clientLogos, setClientLogos] = useState([])
  const [activeClientSector, setActiveClientSector] = useState('all')
  const [clientFilterAnimationRun, setClientFilterAnimationRun] = useState(0)
  const [clientViewportWidth, setClientViewportWidth] = useState(getViewportWidth)
  const page = sitePages.cases
  const clientGroups = groupClientsBySector(clientLogos)
  const clientSectorFilters = clientGroups.map((group) => group.sector)
  const selectedClientSector = activeClientSector === 'all' || clientSectorFilters.includes(activeClientSector)
    ? activeClientSector
    : 'all'
  const visibleClientLogos = selectedClientSector === 'all'
    ? clientGroups.flatMap((group) => group.clients)
    : clientGroups.find((group) => group.sector === selectedClientSector)?.clients || []
  const visibleCaseTestimonials = caseTestimonials.length > 0 ? caseTestimonials : MOCK_CASE_TESTIMONIALS
  const clientFilterAnimationKey = `${clientFilterAnimationRun}-${selectedClientSector}`
  const isMobileClientLayout = clientViewportWidth < 768

  function selectClientSector(sector) {
    setActiveClientSector(sector)
    setClientFilterAnimationRun((currentRun) => currentRun + 1)
  }

  useEffect(() => {
    document.documentElement.classList.add('cases-white-background')

    return () => {
      document.documentElement.classList.remove('cases-white-background')
    }
  }, [])

  useEffect(() => {
    function handleResize() {
      setClientViewportWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function fetchClientLogos() {
      try {
        const data = await client.fetch(clientLogoQuery)
        if (isMounted) {
          setCaseLogos(Array.isArray(data?.caseLogos) ? data.caseLogos : [])
          setCaseTestimonials((Array.isArray(data?.caseTestimonials) ? data.caseTestimonials : []).map((testimonial) => ({
            ...testimonial,
            avatarUrl: resolveLegacyImageUrl(testimonial.avatarUrl),
          })))
          setClientLogos(Array.isArray(data?.clientLogos) ? data.clientLogos : [])
        }
      } catch (error) {
        console.error('Error fetching client logos from Sanity:', error)
      }
    }

    fetchClientLogos()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div data-testid="cases-page-shell" className="space-y-20 pb-0 sm:space-y-24 lg:space-y-24">
      <section
        data-testid="cases-hero"
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-32 min-h-screen w-screen overflow-hidden bg-[#E5E9F1] pb-20 pt-32 sm:-mt-36 sm:pt-36"
      >
        <div
          data-testid="cases-hero-silk"
          className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] w-full opacity-20 [mask-image:linear-gradient(to_bottom,black_0%,black_58%,transparent_100%)]"
          aria-hidden="true"
        >
          <Silk
            speed={5.1}
            scale={1}
            color="#EDF0F5"
            noiseIntensity={1.5}
            rotation={0.2}
          />
        </div>
        <div
          data-testid="cases-hero-veil"
          className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-gradient-to-b from-[#E5E9F1]/95 via-[#E5E9F1]/60 to-[#E5E9F1]"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto w-full max-w-[1380px] px-4 sm:px-6 lg:px-8">
          <header data-testid="cases-hero-header" className="mx-auto max-w-4xl text-center">
            <SplitText
              tag="h1"
              text={page.title}
              className="mb-5 font-display text-[clamp(4.25rem,7vw,6.25rem)] leading-[0.92] text-slate-900"
              delay={100}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
            <p data-testid="cases-hero-intro" className="mx-auto max-w-[52rem] text-lg leading-8 text-slate-600 sm:text-xl">{page.intro}</p>
          </header>

          <section aria-labelledby="cases-logos-title" data-testid="cases-logo-section" className="mt-12">
            <h2 id="cases-logos-title" className="sr-only">
              Cases selecionados
            </h2>
            {caseLogos.length > 0 && (
              <CasesCarousel caseLogos={caseLogos} />
            )}
          </section>
        </div>
      </section>

      {SHOW_CASE_TESTIMONIALS && (
        <CaseTestimonialsSection testimonials={visibleCaseTestimonials} />
      )}

      <section aria-labelledby="client-logos-title" data-testid="all-client-logos-section" className="relative mx-auto max-w-[1320px]">
        <div className="mb-10 max-w-3xl">
          <p className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] font-semibold uppercase text-slate-600">
            Clientes
          </p>
          <h2 id="client-logos-title" className="font-display text-3xl text-slate-900 sm:text-5xl">
            Nossos clientes
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Empresas de diferentes segmentos que contam com a Otimiza para ganhar clareza operacional e evoluir resultados.
          </p>
        </div>

        {clientGroups.length > 0 && (
          isMobileClientLayout ? (
            <MobileClientLogoGroups groups={clientGroups} />
          ) : (
          <div className="space-y-7" data-testid="desktop-client-logos">
            <div className="flex flex-wrap gap-2" aria-label="Filtrar clientes por setor">
              <button
                type="button"
                aria-pressed={selectedClientSector === 'all'}
                onClick={() => selectClientSector('all')}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedClientSector === 'all'
                    ? 'border-black bg-slate-200 text-slate-950'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              {clientSectorFilters.map((sector) => (
                <button
                  key={sector}
                  type="button"
                  aria-pressed={selectedClientSector === sector}
                  onClick={() => selectClientSector(sector)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    selectedClientSector === sector
                      ? 'border-black bg-slate-200 text-slate-950'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>

            <ClientLogosCarousel logos={visibleClientLogos} animationKey={clientFilterAnimationKey} />
          </div>
          )
        )}
      </section>

      <CasesCtaSection />
    </div>
  )
}

export default Cases
