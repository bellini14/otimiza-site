import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, BrainCircuit, GraduationCap, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import SplitText from '../components/SplitText'
import { pageTitleMotion } from '../components/pageTitleMotion'
import { ScrollVelocity } from '../components/ui/ScrollVelocity'
import { client } from '../lib/sanity'
import heroBwImage from '../../imagens/hero quem somos-optimized.jpg'
import hairlineIcon from '../../imagens/icone hairline.svg'

const clientLogoQuery = `*[_type == "clientLogo" && isVisible != false && showOnHome == true && defined(logo.asset)] | order(coalesce(sortOrder, 9999) asc, name asc) {
  _id,
  name,
  logoAlt,
  website,
  "logoUrl": logo.asset->url
}`

const clientLogoFallbacks = [
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

const pillars = [
  {
    title: 'Consultoria',
    description: 'Leva as melhores práticas para dentro das empresas e acompanha a aplicação no contexto real.',
    icon: Stethoscope,
  },
  {
    title: 'Tecnologia',
    description: 'Amplia produtividade, controle e inteligência para sustentar decisões e execução.',
    icon: BrainCircuit,
  },
  {
    title: 'Academia',
    description: 'Transforma consultores em instrutores e compartilha a experiência absorvida nos projetos.',
    icon: GraduationCap,
  },
]

const pillarRevealDelays = ['[animation-delay:120ms]', '[animation-delay:240ms]', '[animation-delay:360ms]']
const strategyRevealDelays = ['0ms', '120ms', '240ms', '360ms']
const consultantsRevealDelays = ['100ms', '180ms', '260ms', '340ms']

const strategyItems = [
  'Transformação dos modelos de negócio',
  'Aplicação de métodos que produzam melhores e maiores acertos',
  'Aproximação da gestão à tecnologia, da pessoa ao método, do negócio ao resultado',
  'Realização de eventos que entreguem eficácia',
]

const storyParagraphs = [
  'Uma equipe multidisciplinar de consultores seniores, preparada para atuar em empresas de diferentes portes e segmentos.',
  'Mais do que aconselhar, conduzimos transformações práticas no negócio.',
  'Nosso crescimento vem da satisfação dos clientes.',
]

function useScrollReveal(threshold = 0.18, options = {}) {
  const { requireFullVisibility = false, minimumIntersectionRatio = threshold } = options
  const [hasEnteredView, setHasEnteredView] = useState(() => typeof IntersectionObserver === 'undefined')
  const ref = useRef(null)

  useEffect(() => {
    if (hasEnteredView) {
      return undefined
    }

    let animationFrameId = 0

    const checkPosition = () => {
      if (!ref.current) {
        return
      }

      const rect = ref.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const fullyVisible = rect.top >= 0 && rect.bottom <= viewportHeight
      const viewportCovered = rect.height > viewportHeight && rect.top <= viewportHeight * 0.08 && rect.bottom >= viewportHeight * 0.92
      const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0))
      const intersectionRatio = rect.height > 0 ? visibleHeight / rect.height : 0

      if (requireFullVisibility ? fullyVisible || viewportCovered : intersectionRatio >= minimumIntersectionRatio) {
        setHasEnteredView(true)
      }
    }

    const queueCheck = () => {
      window.cancelAnimationFrame(animationFrameId)
      animationFrameId = window.requestAnimationFrame(checkPosition)
    }

    const pollUntilVisible = () => {
      checkPosition()

      if (!hasEnteredView) {
        animationFrameId = window.requestAnimationFrame(pollUntilVisible)
      }
    }

    animationFrameId = window.requestAnimationFrame(pollUntilVisible)
    window.addEventListener('scroll', queueCheck, { passive: true })
    window.addEventListener('resize', queueCheck)

    let observer

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          const isVisibleEnough = requireFullVisibility
            ? entry.isIntersecting && entry.intersectionRatio >= 0.98
            : entry.isIntersecting && entry.intersectionRatio >= minimumIntersectionRatio

          if (isVisibleEnough) {
            setHasEnteredView(true)
            observer.disconnect()
          }
        },
        { threshold: requireFullVisibility ? 1 : threshold },
      )

      if (ref.current) {
        observer.observe(ref.current)
      }
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      observer?.disconnect()
      window.removeEventListener('scroll', queueCheck)
      window.removeEventListener('resize', queueCheck)
    }
  }, [hasEnteredView, minimumIntersectionRatio, requireFullVisibility, threshold])

  return [ref, hasEnteredView]
}

function revealClass(isVisible, variant, className = '') {
  return `qs-reveal qs-reveal--${variant} ${isVisible ? 'qs-reveal--visible' : ''} ${className}`.trim()
}

function repeatClientLogos(logos, targetCount = 12) {
  if (logos.length >= targetCount) {
    return logos
  }

  return Array.from({ length: targetCount }, (_, index) => logos[index % logos.length])
}

function buildClientLogoRows(logos) {
  if (logos.length === 0) {
    return []
  }

  const rows = [
    logos.filter((_, index) => index % 2 === 0),
    logos.filter((_, index) => index % 2 === 1),
  ].map((row) => (row.length > 0 ? row : logos))
  const logosPerRow = Math.max(12, ...rows.map((row) => row.length))
  const accessibleLogoKeys = new Set()

  return rows.map((row) =>
    repeatClientLogos(row, logosPerRow).map((logo, index) => {
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

function ClientLogoPill({ logo, isDecorative = false }) {
  const logoImage = (
    <img
      src={logo.logoUrl}
      alt={isDecorative ? '' : logo.logoAlt || logo.name}
      className="max-h-6 w-auto max-w-[5.75rem] object-contain grayscale transition duration-300 group-hover/logo:grayscale-0 sm:max-h-11 sm:max-w-[10rem]"
      loading="eager"
      decoding="async"
    />
  )

  return (
    <div
      className="group/logo flex h-12 w-[9rem] shrink-0 items-center justify-center rounded-full border border-[#5a6572]/58 bg-white/34 px-4 shadow-[inset_0_0_0_1px_rgba(90,101,114,0.28)] backdrop-blur-sm sm:h-20 sm:w-[16rem] sm:px-10"
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

function ClientLogoCarousel() {
  const [logos, setLogos] = useState(clientLogoFallbacks)
  const [logosRef, logosVisible] = useScrollReveal(0.1)
  const logoRows = useMemo(() => buildClientLogoRows(logos), [logos])

  useEffect(() => {
    let isMounted = true

    async function fetchLogos() {
      try {
        const fetchedLogos = await client.fetch(clientLogoQuery)
        if (isMounted && Array.isArray(fetchedLogos) && fetchedLogos.length > 0) {
          setLogos(fetchedLogos)
        }
      } catch (error) {
        console.error('Error fetching client logos from Sanity:', error)
      }
    }

    fetchLogos()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section
      ref={logosRef}
      aria-label="Clientes"
      className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#e5e9f1] pt-5 pb-12 sm:py-10"
      data-testid="quem-somos-client-logo-carousel"
    >
      <div className={revealClass(logosVisible, 'scale-soft', 'relative w-full')}>
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[18vw] bg-gradient-to-r from-[#e5e9f1] via-[#e5e9f1]/88 to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[18vw] bg-gradient-to-l from-[#e5e9f1] via-[#e5e9f1]/88 to-transparent" aria-hidden="true" />
        <ScrollVelocity
          velocity={38}
          numCopies={5}
          texts={logoRows.map((logoRow, rowIndex) => (
            <div key={`clientes-${rowIndex}`} className="flex items-center gap-4 pr-4 sm:gap-9 sm:pr-9">
              {logoRow.map(({ instanceKey, isDecorative, logo }) => (
                <ClientLogoPill key={instanceKey} logo={logo} isDecorative={isDecorative} />
              ))}
            </div>
          ))}
        />
      </div>
    </section>
  )
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function ScrollRevealText({ children, progress, startIndex, totalWords }) {
  const words = useMemo(() => children.split(/\s+/).filter(Boolean), [children])

  return (
    <p aria-label={children}>
      {words.map((word, index) => {
        const globalIndex = startIndex + index
        const wordStart = totalWords <= 1 ? 0 : globalIndex / (totalWords - 1)
        const localProgress = clamp((progress - wordStart * 0.82) / 0.18, 0, 1)
        const opacity = 0.15 + localProgress * 0.85
        const blur = (1 - localProgress) * 8

        return (
          <span
            key={`${word}-${index}`}
            className="mr-2 inline-block lg:mr-3"
            style={{
              opacity,
              filter: `blur(${blur}px)`,
              transition: 'opacity 75ms, filter 75ms',
            }}
          >
            {word}
            {index < words.length - 1 ? ' ' : ''}
          </span>
        )
      })}
    </p>
  )
}

function StoryRevealCopy() {
  const containerRef = useRef(null)
  const hasCompletedRevealRef = useRef(false)
  const [progress, setProgress] = useState(0)
  const wordCounts = useMemo(() => storyParagraphs.map((paragraph) => paragraph.split(/\s+/).filter(Boolean).length), [])
  const totalWords = useMemo(() => wordCounts.reduce((total, count) => total + count, 0), [wordCounts])

  useEffect(() => {
    const updateProgress = () => {
      if (!containerRef.current || hasCompletedRevealRef.current) {
        return
      }

      const rect = containerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const revealStart = viewportHeight * 0.75
      const revealEnd = viewportHeight * 0.25
      const revealDistance = Math.max(revealStart - revealEnd, 1)
      const nextProgress = clamp((revealStart - rect.top) / revealDistance, 0, 1)

      setProgress((currentProgress) => {
        const stableProgress = Math.max(currentProgress, nextProgress)

        if (stableProgress >= 1) {
          hasCompletedRevealRef.current = true
        }

        return stableProgress
      })
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="quem-somos-story-copy grid w-full gap-8 font-light text-[#5a6572]"
    >
      {storyParagraphs.map((paragraph, index) => {
        const startIndex = wordCounts.slice(0, index).reduce((total, count) => total + count, 0)

        return (
          <ScrollRevealText key={paragraph} progress={progress} startIndex={startIndex} totalWords={totalWords}>
            {paragraph}
          </ScrollRevealText>
        )
      })}
    </div>
  )
}

function QuemSomos() {
  const [activePillarIndex, setActivePillarIndex] = useState(0)
  const [pillarHoverState, setPillarHoverState] = useState({ visibleIndex: null, exitingIndex: null })
  const [pillarActiveExitIndex, setPillarActiveExitIndex] = useState(null)
  const [heroRef, heroVisible] = useScrollReveal(0.1)
  const [pillarsRef, pillarsVisible] = useScrollReveal(0.58, { minimumIntersectionRatio: 0.58 })
  const [storyRef, storyVisible] = useScrollReveal(0.16)
  const [strategyRef, strategyVisible] = useScrollReveal(0.18)
  const [missionRef, missionVisible] = useScrollReveal(0.52)
  const [consultantsRef, consultantsVisible] = useScrollReveal(0.18)
  const pillarHoverTimeoutRef = useRef(null)
  const pillarHoverFadeTimeoutRef = useRef(null)
  const pillarHoverStartedAtRef = useRef(null)
  const pillarActiveExitTimeoutRef = useRef(null)
  const activePillar = pillars[activePillarIndex]
  const handlePillarHoverEnter = (event, index) => {
    const rect = event.currentTarget.getBoundingClientRect()

    window.clearTimeout(pillarHoverTimeoutRef.current)
    window.clearTimeout(pillarHoverFadeTimeoutRef.current)
    pillarHoverStartedAtRef.current = window.performance.now()
    event.currentTarget.style.setProperty('--pillar-hover-x', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--pillar-hover-y', `${event.clientY - rect.top}px`)
    setPillarHoverState({ visibleIndex: index, exitingIndex: null })
  }

  const handlePillarHoverLeave = (index) => {
    window.clearTimeout(pillarHoverTimeoutRef.current)
    window.clearTimeout(pillarHoverFadeTimeoutRef.current)

    const hoverElapsed = pillarHoverStartedAtRef.current
      ? window.performance.now() - pillarHoverStartedAtRef.current
      : 1180
    const remainingHoverDuration = hoverElapsed < 220
      ? 120
      : hoverElapsed < 520
        ? 240
        : Math.max(0, 1180 - hoverElapsed)

    setPillarHoverState({ visibleIndex: index, exitingIndex: null })
    pillarHoverTimeoutRef.current = window.setTimeout(() => {
      setPillarHoverState({ visibleIndex: null, exitingIndex: index })

      pillarHoverFadeTimeoutRef.current = window.setTimeout(() => {
        setPillarHoverState((currentState) => (
          currentState.exitingIndex === index
            ? { visibleIndex: null, exitingIndex: null }
            : currentState
        ))
      }, hoverElapsed < 220 ? 360 : 900)
    }, remainingHoverDuration)
  }

  const handlePillarClick = (event, index) => {
    const rect = event.currentTarget.getBoundingClientRect()

    if (index === activePillarIndex) {
      return
    }

    window.clearTimeout(pillarHoverTimeoutRef.current)
    window.clearTimeout(pillarHoverFadeTimeoutRef.current)
    window.clearTimeout(pillarActiveExitTimeoutRef.current)
    pillarHoverStartedAtRef.current = null
    event.currentTarget.style.setProperty('--pillar-hover-x', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--pillar-hover-y', `${event.clientY - rect.top}px`)
    setPillarHoverState({ visibleIndex: null, exitingIndex: null })
    setPillarActiveExitIndex(activePillarIndex)
    setActivePillarIndex(index)

    pillarActiveExitTimeoutRef.current = window.setTimeout(() => {
      setPillarActiveExitIndex((currentIndex) => (currentIndex === activePillarIndex ? null : currentIndex))
    }, 200)
  }

  useEffect(() => () => {
    window.clearTimeout(pillarHoverTimeoutRef.current)
    window.clearTimeout(pillarHoverFadeTimeoutRef.current)
    window.clearTimeout(pillarActiveExitTimeoutRef.current)
  }, [])

  return (
    <div data-testid="quem-somos-page" className="-mt-32 sm:-mt-36">
      <section
        aria-label="Introdução sobre a Otimiza"
        ref={heroRef}
        data-testid="quem-somos-hero"
        className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#cad2e2]"
      >
        <div className="absolute inset-0" aria-hidden="true">
          <img
            src={heroBwImage}
            alt=""
            data-testid="quem-somos-hero-background"
            className="quem-somos-hero__photo h-full w-full object-cover object-center"
          />
          <div className="quem-somos-hero__wash absolute inset-0 bg-white/70 lg:hidden" />
          <div className="absolute inset-y-0 left-[44%] hidden w-[24%] -skew-x-[22deg] bg-gradient-to-r from-white/22 via-[#cad2e2]/18 to-transparent blur-[1px] md:block" />
          <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-[#e5e9f1] via-[#e5e9f1]/72 to-transparent" />
        </div>

        <div
          className="quem-somos-hero__shell home-menu-shell relative grid"
          data-testid="quem-somos-menu-aligned-shell"
        >
          <div className="quem-somos-hero__copy max-w-[48rem]">
            <SplitText
              tag="h1"
              text="Quem somos"
              className="quem-somos-hero__title internal-page-title font-display font-light text-[#5a6572]"
              {...pageTitleMotion}
              textAlign="inherit"
            />
            <p
              className={revealClass(
                heroVisible,
                'fade-up',
                'quem-somos-hero__intro text-[clamp(1.12rem,1.72vw,1.68rem)] font-light text-[#5a6572]/90',
              )}
              style={{ '--qs-reveal-delay': '220ms' }}
            >
              A Otimiza Consultoria nasceu em Caxias do Sul, em 1990. Através da competência em traduzir teorias de administração de empresas, que só faziam sentido nos livros acadêmicos, em práticas aplicáveis no ambiente empresarial, expandiu-se nacionalmente.
            </p>
          </div>

          <div className="quem-somos-hero__card-wrap">
            <div
              className={revealClass(
                heroVisible,
                'scale-soft',
                'quem-somos-hero__card relative w-full overflow-hidden rounded-[1rem] border border-white/90 bg-[#e6ebf8]/88 shadow-[0_26px_70px_rgba(90,101,114,0.05)] backdrop-blur-md',
              )}
              style={{ '--qs-reveal-delay': '320ms' }}
            >
              <p className="relative text-[clamp(1.38rem,2.05vw,1.95rem)] font-thin leading-[1.16] text-[#5a6572]">
                Atualmente, conta com uma equipe multidisciplinar composta por consultores seniores de diversas áreas de atuação e especialidades.
              </p>
            </div>
          </div>

          <div className="quem-somos-hero__scroll pointer-events-none z-10 text-[#5a6572]/78" aria-hidden="true">
            <ArrowDown className="h-8 w-8 animate-scroll-cue" strokeWidth={1.4} />
          </div>
        </div>
      </section>

      <ClientLogoCarousel />

      <section
        ref={storyRef}
        data-testid="quem-somos-story"
        className="quem-somos-story quem-somos-mobile-section relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#e5e9f1]"
      >
        <div
          className={revealClass(storyVisible, 'clip-rise', 'quem-somos-story__content home-menu-shell flex items-center')}
          data-testid="quem-somos-menu-aligned-shell"
        >
          <StoryRevealCopy />
        </div>
      </section>

      <section
        id="tres-vertices"
        data-testid="quem-somos-pillars"
        className="quem-somos-pillars quem-somos-mobile-section relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-white"
      >
        <div
          ref={pillarsRef}
          data-testid="quem-somos-pillars-reveal-target"
          className="home-menu-shell"
        >
          <div
            data-reveal="pillars-heading"
            className={`quem-somos-pillars__heading mx-auto ${
              pillarsVisible ? 'animate-enter' : 'opacity-0'
            }`}
          >
            <p className="mb-4 text-sm font-semibold text-[#5a6572]">Somos sustentados por três vértices de atuação</p>
            <h2 className="quem-somos-section-title font-display font-medium leading-tight tracking-tight text-[#5a6572]">
              Consultoria, tecnologia e academia trabalhando juntas.
            </h2>
          </div>

          <div className="quem-somos-pillars__rail flex">
            {pillars.map((pillar, index) => {
              const PillarIcon = pillar.icon
              const isActive = activePillarIndex === index
              const isHoverVisible = pillarHoverState.visibleIndex === index
              const isHoverExiting = pillarHoverState.exitingIndex === index
              const isActiveExiting = pillarActiveExitIndex === index

              return (
                <button
                  key={pillar.title}
                  type="button"
                  aria-pressed={isActive}
                  onClick={(event) => handlePillarClick(event, index)}
                  onPointerEnter={isActive ? undefined : (event) => handlePillarHoverEnter(event, index)}
                  onPointerLeave={isActive ? undefined : () => handlePillarHoverLeave(index)}
                  data-reveal={`pillars-card-${index}`}
                  style={{ '--pillar-hover-x': '50%', '--pillar-hover-y': '50%' }}
                  className={`quem-somos-pillars__card pillar-card group relative flex shrink-0 items-center justify-start gap-4 overflow-hidden rounded-xl border px-5 py-4 text-left transition-[box-shadow,opacity,transform] duration-300 sm:flex-col sm:items-center sm:justify-center sm:gap-6 sm:px-8 sm:py-12 sm:text-center lg:py-14 ${
                    isActive || isActiveExiting
                      ? `${isActive ? 'bg-white' : 'bg-[#E5E9F1]'} border-[#5a6572]/28 shadow-[0_12px_35px_rgba(90,101,114,0.08)]`
                      : 'border-transparent bg-[#E5E9F1] hover:border-[#5a6572]/28'
                  } ${pillarsVisible ? 'animate-enter' : 'opacity-0'} ${pillarRevealDelays[index]}`}
                >
                  {isActiveExiting ? (
                    <span
                      aria-hidden="true"
                      className="pillar-active-exit-fill"
                    />
                  ) : null}
                  {!isActive && isHoverVisible ? (
                    <span
                      aria-hidden="true"
                      className="pillar-hover-fill is-visible"
                    />
                  ) : null}
                  {isHoverExiting ? (
                    <span
                      aria-hidden="true"
                      className="pillar-hover-exit-fill"
                    />
                  ) : null}
                  <span
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition sm:h-16 sm:w-16 ${
                      isActive ? 'bg-[#F1F3F7] text-[#5a6572]' : 'bg-white text-[#5a6572]/58'
                    }`}
                  >
                    <PillarIcon className="h-5 w-5 sm:h-8 sm:w-8" aria-hidden="true" />
                  </span>
                  <h3 className={`relative z-10 text-sm font-semibold sm:text-lg ${isActive ? 'text-[#5a6572]' : 'text-[#5a6572]/72'}`}>
                    {pillar.title}
                  </h3>
                </button>
              )
            })}
          </div>

          <div
            data-reveal="pillars-panel"
            data-testid="quem-somos-pillars-panel"
            className={`quem-somos-pillars__panel border-t border-[#5a6572]/18 ${
              pillarsVisible ? 'animate-enter' : 'opacity-0'
            } [animation-delay:420ms]`}
          >
            <div
              key={activePillar.title}
              className="pillar-panel-copy grid gap-10"
            >
              <div className="flex flex-col gap-7">
                <h3 className="text-3xl font-semibold leading-tight tracking-tight text-[#5a6572] sm:text-4xl">
                  {activePillar.title}
                </h3>
                <Link
                  to="/contato"
                  className="quem-somos-mobile-action inline-flex self-start items-center justify-center gap-2 rounded-lg border border-[#5a6572]/24 bg-white px-5 py-2.5 text-sm font-medium text-[#5a6572] transition hover:bg-[#F7F8FA]"
                >
                  Entre em contato
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-base font-semibold text-[#5a6572] sm:text-lg">{activePillar.title}</h4>
                <p className="text-base leading-8 text-[#5a6572]/76">{activePillar.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="nossa-abordagem"
        ref={strategyRef}
        data-testid="quem-somos-strategy"
        className="quem-somos-strategy quem-somos-mobile-section relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#FFFFFF]"
      >
        <div
          className="home-menu-shell grid lg:grid-cols-[0.45fr_0.55fr]"
          data-testid="quem-somos-menu-aligned-shell"
        >
          <div className="hidden lg:block" aria-hidden="true" />

          <div className="quem-somos-strategy__content w-full justify-self-end">
            <h2
              data-reveal="strategy-heading"
              className={revealClass(strategyVisible, 'slide-left', 'quem-somos-section-title font-display font-semibold tracking-tight text-[#5A6572]')}
            >
              Estratégia
            </h2>
            <p
              className={revealClass(strategyVisible, 'fade-up', 'mt-6 max-w-2xl text-lg leading-9 text-[#5A6572]/82')}
              style={{ '--qs-reveal-delay': '80ms' }}
            >
              Nossa orientação estratégica está baseada em:
            </p>
            <div className="quem-somos-strategy__items mt-12 grid">
              {strategyItems.map((item, index) => (
                <div
                  key={item}
                  data-reveal={`strategy-item-${index}`}
                  className={revealClass(strategyVisible, 'fade-up', 'quem-somos-strategy__item flex items-start sm:items-center')}
                  style={{ '--qs-reveal-delay': strategyRevealDelays[index] }}
                >
                  <span className="quem-somos-strategy__marker mt-2 inline-flex shrink-0 rounded-full bg-[#5A6572] sm:mt-0" aria-hidden="true" />
                  <p className="text-base font-semibold leading-8 text-[#5A6572] sm:text-lg">{item}</p>
                </div>
              ))}
            </div>

            <p
              className={revealClass(strategyVisible, 'fade-up', 'mt-14 max-w-2xl text-lg leading-9 text-[#5A6572]/82')}
              style={{ '--qs-reveal-delay': '520ms' }}
            >
              Conte com a nossa equipe de consultores para potencializar seus projetos, permitindo assim alto desempenho na prática.
            </p>
            <Link
              to="/contato"
              aria-label="Entrar em contato sobre estratégia"
              className={revealClass(strategyVisible, 'scale-soft', 'quem-somos-mobile-action mt-9 inline-flex min-h-16 items-center justify-center rounded-[0.2rem] bg-[#5A6572] px-10 text-base font-semibold text-white transition hover:bg-[#4d5661] sm:min-w-[17rem]')}
              style={{ '--qs-reveal-delay': '640ms' }}
            >
              Entre em contato
            </Link>
          </div>
        </div>
      </section>

      <section
        ref={missionRef}
        data-testid="quem-somos-mission"
        className="quem-somos-mission quem-somos-mobile-section relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#cad2e2] text-[#2F363E]"
      >
        <img
          src={hairlineIcon}
          alt=""
          aria-hidden="true"
          className={revealClass(missionVisible, 'hero-photo', 'pointer-events-none absolute left-1/2 top-1/2 h-auto w-[52rem] max-w-none -translate-x-1/2 -translate-y-1/2 sm:w-[68rem] lg:w-[84rem]')}
          style={{ '--qs-reveal-delay': '120ms' }}
        />
        <div
          className="quem-somos-mission__content home-menu-shell relative flex flex-col items-center text-center"
          data-testid="quem-somos-menu-aligned-shell"
        >
          <p
            className={revealClass(missionVisible, 'fade-up', 'mb-7 text-sm font-semibold text-[#2F363E]/68')}
            style={{ '--qs-reveal-delay': '60ms' }}
          >
            Nossa missão
          </p>
          <blockquote
            className={revealClass(missionVisible, 'fade-up', 'quem-somos-mission__quote font-display font-normal tracking-normal')}
            style={{ '--qs-reveal-delay': '120ms' }}
          >
            “Contribuir para o crescimento e a solidez dos clientes, viabilizando mudanças, através de ações competentes e personalizadas, promovendo o êxito do negócio, com uma equipe inspirada e motivada”.
          </blockquote>
        </div>
      </section>

      <section
        ref={consultantsRef}
        data-testid="quem-somos-consultants"
        className="quem-somos-consultants quem-somos-mobile-section relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#FFFFFF]"
      >
        <div
          className="home-menu-shell grid lg:grid-cols-2"
          data-testid="quem-somos-menu-aligned-shell"
        >
          <div className="quem-somos-consultants__content w-full justify-self-start">
            <h2 className={revealClass(consultantsVisible, 'fade-up', 'quem-somos-section-title font-display font-semibold tracking-tight text-[#5A6572]')}>Consultores</h2>
            <div className="quem-somos-consultants__copy mt-10 grid text-base text-[#5A6572]/78">
              <p className={revealClass(consultantsVisible, 'fade-up')} style={{ '--qs-reveal-delay': consultantsRevealDelays[0] }}>
              Nossos consultores possuem elevadas qualificações acadêmicas e práticas. Diferentes perfis profissionais em sinergia, garantindo alto desempenho nos contextos de administração. Um grupo coeso e multidisciplinar, gerador de inteligência coletiva, orientado para e pelo seu negócio.
              </p>
              <p className={revealClass(consultantsVisible, 'fade-up')} style={{ '--qs-reveal-delay': consultantsRevealDelays[1] }}>
              Nossos profissionais possuem competências lato e stricto sensu em Administração de Empresas, Automação Industrial, Psicologia, Engenharia de Produção, Engenharia Mecânica e Processamento de Dados.
              </p>
              <p className={revealClass(consultantsVisible, 'fade-up')} style={{ '--qs-reveal-delay': consultantsRevealDelays[2] }}>
              Especialistas em Gestão Empresarial, Gestão de Pessoas, Gerenciamento de Projetos, Gestão de Negócios, Gestão Estratégica de Custos e Comércio Exterior.
              </p>
              <p className={revealClass(consultantsVisible, 'fade-up')} style={{ '--qs-reveal-delay': consultantsRevealDelays[3] }}>
              Certificações - CBPP (Gestão de Processos de Negócio), PMP - (Gerenciamento de Projetos).
              </p>
            </div>
            <a
              href="https://www.linkedin.com/company/otimiza-consultoria"
              target="_blank"
              rel="noreferrer"
              className={revealClass(consultantsVisible, 'scale-soft', 'quem-somos-mobile-action mt-9 inline-flex min-h-16 items-center justify-center gap-2 rounded-[0.2rem] bg-[#5A6572] px-10 text-base font-semibold text-white transition hover:bg-[#4d5661] sm:min-w-[17rem]')}
              style={{ '--qs-reveal-delay': '480ms' }}
            >
              Acesse nosso LinkedIn
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </section>
    </div>
  )
}

export default QuemSomos
