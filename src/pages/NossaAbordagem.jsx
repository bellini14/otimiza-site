import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import SplitText from '../components/SplitText'
import { pageTitleMotion } from '../components/pageTitleMotion'
import timelessBackground from '../../imagens/shutterstock_2714404709-optimized.jpg'
import timelessComparisonBackground from '../../imagens/criar o atemporal.webp'
import iconeLine from '../../imagens/icone line.svg'
import { client, urlFor } from '../lib/sanity'
import { resolveLegacyImageUrl } from '../lib/legacyImageUrl'

const MotionSpan = motion.span

const JOBS_TO_BE_DONE_TOOLTIP =
  'Jobs to be Done é a lógica de olhar para o cliente a partir dos resultados que ele precisa alcançar. Mais do que entregar uma solução pronta, a consultoria busca compreender o que precisa ser transformado na realidade da empresa, processos, decisões, indicadores, rotinas e formas de gestão, para que o cliente avance com mais clareza e consistência. Jobs to be Done significa compreender o que o cliente precisa realizar na prática, não apenas o serviço que ele procura, mas o progresso que deseja alcançar.'

const nossaAbordagemLogoQuery = `*[_type == "clientLogo" && isVisible != false && showOnNossaAbordagem == true && defined(logo.asset)] | order(coalesce(sortOrder, 9999) asc, name asc) {
  _id,
  name,
  logoAlt,
  website,
  logo,
  "logoUrl": logo.asset->url
}`

const MIN_NOSSA_ABORDAGEM_LOGOS_PER_ROW = 6

const NOSSA_ABORDAGEM_LOGO_FALLBACKS = [
  {
    _id: 'fallback-nossa-moneo',
    name: 'Banco Moneo',
    logoAlt: 'Moneo',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/14ada562c98ddb5d2c60222e9288035ac02e1a03-2270x635.png',
  },
  {
    _id: 'fallback-nossa-cinex',
    name: 'Cinex',
    logoAlt: 'Cinex',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/8c12d0700da0b40cdf73dcea8d4f489ef3859176-1609x608.png',
  },
  {
    _id: 'fallback-nossa-marcopolo',
    name: 'Marcopolo',
    logoAlt: 'Marcopolo',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/dd2091b629f7bbec58fff53f6ba2e2da23401338-1628x297.svg',
  },
  {
    _id: 'fallback-nossa-unimed',
    name: 'Unimed Nacional',
    logoAlt: 'Unimed',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/a10f978d72a9d3b41ba68ae9f4d865921ab763ab-1184x422.png',
  },
  {
    _id: 'fallback-nossa-ucs',
    name: 'Universidade de Caxias do Sul',
    logoAlt: 'UCS',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/1fe23ac3f948001964c133103f7470b985d0865f-2500x1264.png',
  },
  {
    _id: 'fallback-nossa-sicredi',
    name: 'Sicredi',
    logoAlt: 'Sicredi',
    logoUrl: 'https://cdn.sanity.io/images/igy822g7/production/d40d71f5cef53f1c4d008d82cb7d2006bcd1773a-3500x823.png',
  },
]

const clients = [
  'AES Brasil',
  'Alternativa Componentes',
  'Banco Moneo',
  'Bebidas Fruki',
  'Bontempo',
  'Brametal',
  'Chemtrade',
  'Cinex',
  'Cooperativa Santa Clara',
  'ENGIE Brasil Energia',
  'Feltrin Sementes',
  'FIERGS',
  'Fundação Proamb',
  'Grendene',
  'Hacker Turbinas Elétricas',
  'Hospital Ana Nery',
  'Higra',
  'Hyva do Brasil',
  'IPH Brasil',
  'Irmãos Fischer',
  'JBT Marel',
  'Macrosul',
  'Marcopolo',
  'Metalúrgica Venâncio',
  'Móveis Carraro',
  'Roni Chaves',
  'SCA Indústria de Móveis',
  'SIM Rede de Postos',
  'Skymsen',
  'SLC Máquinas',
  'Soprano',
  'Tabone',
  'Tesouro e Receita do Estado do RS',
  'Unicasa Indústria de Móveis',
  'UCS',
  'Unimed Porto Alegre',
  'Unimed VTRP',
  'Zen',
]

const blocks = [
  {
    variant: 'cover',
    content: [],
  },
  {
    variant: 'statement',
    title: 'Criar o Atemporal',
    content: [
      'Uma escolha estratégica.',
      'Um compromisso com o que é relevante, mesmo quando tudo muda.',
      'Um modo de operar.',
    ],
  },
  {
    variant: 'list',
    content: [
      'As organizações convivem com múltiplos tempos ao mesmo tempo:',
      'o tempo da estratégia, que exige visão de longo prazo;',
      'o tempo da operação, que cobra decisões imediatas;',
      'o tempo humano, feito de aprendizado, erro e maturação;',
      'o tempo tecnológico, marcado pela obsolescência acelerada.',
      'Poucas conseguem coordenar esses tempos sem perder coerência.',
    ],
  },
  {
    variant: 'comparison',
    backgroundImage: timelessComparisonBackground,
    panels: [
      {
        title: 'Criar o atemporal:',
        items: [
          'É construir organizações capazes de:',
          'Sustentar decisões ao longo do tempo;',
          'Evoluir sem romper sua identidade;',
          'Crescer sem perder clareza;',
          'Mudar sem perder direção.',
          'O atemporal não ignora o tempo, ele opera bem dentro dele.',
        ],
      },
      {
        title: 'O atemporal não é:',
        items: [
          'Apego ao passado;',
          'Resistência à mudança;',
          'Repetição de modelos que já funcionaram;',
          'Discurso desconectado da prática.',
          'O que não evolui, desaparece.',
          'O que muda sem critério, se dissolve.',
        ],
      },
    ],
  },
  {
    variant: 'statement',
    title: 'A visão da Otimiza sobre valor',
    content: [
      'Valor não está apenas no produto final.',
      'Está naquilo que continua funcionando quando o contexto muda.',
      'Criar o atemporal é transformar:',
      'Visão em método,',
      'Cultura em capacidade,',
      'Conhecimento em operação,',
      'Intenção em ação contínua.',
    ],
  },
  {
    variant: 'comparison',
    panels: [
      {
        title: 'O papel da Otimiza',
        items: [
          'A Otimiza atua desde a concepção da estratégia até sua conversão em operação, assegurando sua sustentação ao longo do tempo.',
          'Nosso papel não é apenas pensar o futuro, mas:',
          'Estruturar decisões,',
          'Desenhar modelos operacionais,',
          'Integrar estratégia, pessoas e tecnologia.',
        ],
      },
      {
        title: 'Criar o atemporal é construir:',
        items: [
          'Processos que sobrevivem à troca de lideranças;',
          'Sistemas que reduzem dependência de indivíduos;',
          'Decisões que não precisam ser refeitas a cada ciclo;',
          'Organizações menos frágeis às mudanças externas.',
          'Isso não é discurso. É engenharia organizacional.',
        ],
      },
    ],
  },
  {
    variant: 'comparison',
    panels: [
      {
        title: 'Tecnologia como meio, não como fim',
        items: [
          'Tecnologia é equipamento.',
          'Sozinha, não garante profundidade.',
          'A tecnologia certa, no contexto certo, a serviço de uma estratégia clara.',
        ],
      },
      {
        title: 'O que gera avanço real é:',
        items: ['Clareza,', 'Método,', 'Capacidade de execução,', 'Conhecimento aplicável.'],
      },
    ],
  },
  {
    variant: 'comparison',
    panels: [
      {
        title: 'O tempo como critério da verdade',
        items: [
          'Ao longo de 35 anos, aprendemos algo essencial:',
          'O tempo não premia boas intenções.',
          'O tempo valida estruturas bem construídas.',
          'Criar o atemporal é assumir responsabilidade pelo depois.',
        ],
      },
      {
        title: 'O papel das relações',
        items: [
          'Nada que atravessa décadas é construído sozinho.',
          'O atemporal nasce de:',
          'relações de confiança,',
          'decisões compartilhadas,',
          'aprendizados conjuntos,',
          'clientes que evoluem junto.',
          'A Otimiza não constrói soluções para clientes. Constrói com eles.',
        ],
      },
    ],
  },
  {
    variant: 'metric',
    content: [
      'Desde 1990, a Otimiza atua com uma equipe de 20 consultores seniores, multidisciplinares, orientados por “jobs to be done”.',
    ],
  },
  {
    variant: 'clients',
    content: [
      'Mais de 1.000 clientes atendidos, abrangendo múltiplos setores: indústria, energia, serviços, varejo, agronegócio, setor público, saúde e instituições acadêmicas.',
    ],
    clients,
  },
  {
    variant: 'quote',
    content: [
      'A consultoria que vai lá e faz.',
      'Objetivamente.',
      'Com você.',
      'Atemporal é o humano que, com personalidade e intuição, passado e futuro, cria o melhor AGORA!',
      'Criar o Atemporal é projetar organizações capazes de atravessar o tempo com clareza, coerência e capacidade de ação.',
      'Há 35 anos, é isso que fazemos.',
      'Silvana Tiburi Bettiol',
      'Fundadora, Diretora e Consultora',
    ],
  },
  {
    variant: 'closing',
    title: 'Decidir melhor agora',
    content: ['Por que não?'],
  },
]

function ClosingCtaLabel({ text, variant }) {
  return (
    <span className={`nossa-abordagem-closing__label nossa-abordagem-closing__label--${variant}`}>
      {Array.from(text).map((character, index) => (
        <span
          key={`${character}-${index}`}
          className="nossa-abordagem-closing__label-char"
          style={{ '--closing-char-index': index }}
        >
          {character}
        </span>
      ))}
    </span>
  )
}

function ClosingContactCta({ idleText }) {
  const ctaRef = useRef(null)
  const idleLabelRef = useRef(null)
  const activeLabelRef = useRef(null)

  useEffect(() => {
    let mounted = true

    function measureLabels() {
      if (!mounted || !ctaRef.current || !idleLabelRef.current || !activeLabelRef.current) return

      const idleWidth = Math.ceil(idleLabelRef.current.scrollWidth)
      const activeWidth = Math.ceil(activeLabelRef.current.scrollWidth)

      if (idleWidth > 0) {
        ctaRef.current.style.setProperty('--closing-label-idle-width', `${idleWidth}px`)
      }
      if (activeWidth > 0) {
        ctaRef.current.style.setProperty('--closing-label-active-width', `${activeWidth}px`)
      }
    }

    measureLabels()
    document.fonts?.ready.then(measureLabels)
    window.addEventListener('resize', measureLabels)

    return () => {
      mounted = false
      window.removeEventListener('resize', measureLabels)
    }
  }, [])

  return (
    <a
      ref={ctaRef}
      className="nossa-abordagem-closing__cta"
      href="/contato"
      aria-label={`${idleText} Fale com a Otimiza`}
    >
      <span className="nossa-abordagem-closing__labels" aria-hidden="true">
        <span ref={idleLabelRef} className="nossa-abordagem-closing__label-measure">{idleText}</span>
        <span ref={activeLabelRef} className="nossa-abordagem-closing__label-measure">Fale com a Otimiza</span>
        <ClosingCtaLabel text={idleText} variant="idle" />
        <ClosingCtaLabel text="Fale com a Otimiza" variant="active" />
      </span>
      <span className="nossa-abordagem-closing__arrow" aria-hidden="true">
        <ArrowRight />
      </span>
    </a>
  )
}

function TextStack({ lines, large = false }) {
  return (
    <div className={large ? 'space-y-5 text-[clamp(1.08rem,1.78vw,2rem)] leading-[1.22]' : 'space-y-4 text-lg leading-8 sm:text-xl'}>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  )
}

function JobsToBeDoneTerm() {
  const tooltipRef = useRef(null)
  const termRef = useRef(null)
  const modalPanelRef = useRef(null)
  const tooltipFrameRef = useRef(null)
  const tooltipHasPositionRef = useRef(false)
  const tooltipPositionRef = useRef({ x: 0, y: 0 })
  const tooltipTargetRef = useRef({ x: 0, y: 0 })
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [tooltipOpen, setTooltipOpen] = useState(false)

  useEffect(() => {
    return () => {
      if (tooltipFrameRef.current) {
        cancelAnimationFrame(tooltipFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!tooltipOpen) return undefined

    function closeOnOutsideInteraction(event) {
      if (
        termRef.current?.contains(event.target)
        || tooltipRef.current?.contains(event.target)
        || modalPanelRef.current?.contains(event.target)
      ) return

      setTooltipOpen(false)
    }

    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setTooltipOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideInteraction)
    document.addEventListener('keydown', closeOnEscape)
    document.documentElement.classList.add('jobs-to-be-done-modal-open')

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideInteraction)
      document.removeEventListener('keydown', closeOnEscape)
      document.documentElement.classList.remove('jobs-to-be-done-modal-open')
    }
  }, [tooltipOpen])

  function updateTooltipPosition(event) {
    const termRect = event.currentTarget.getBoundingClientRect()
    const tooltipWidth = tooltipRef.current?.offsetWidth || Math.min(544, window.innerWidth - 32)
    const tooltipHeight = tooltipRef.current?.offsetHeight || 216
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || tooltipWidth
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || tooltipHeight
    const gutter = 16
    const offsetX = 14
    const offsetY = 12
    const shouldFlipX = event.clientX + offsetX + tooltipWidth > viewportWidth - gutter
    const shouldFlipY = event.clientY + offsetY + tooltipHeight > viewportHeight - gutter
    const nextX = event.clientX - termRect.left + (shouldFlipX ? -tooltipWidth - offsetX : offsetX)
    const nextY = event.clientY - termRect.top + (shouldFlipY ? -tooltipHeight - offsetY : offsetY)
    const nextTarget = {
      x: Number.isFinite(nextX) ? nextX : tooltipTargetRef.current.x,
      y: Number.isFinite(nextY) ? nextY : tooltipTargetRef.current.y,
    }

    tooltipTargetRef.current = nextTarget

    if (!tooltipHasPositionRef.current) {
      tooltipHasPositionRef.current = true
      tooltipPositionRef.current = nextTarget
      setTooltipPosition(nextTarget)
      return
    }

    if (tooltipFrameRef.current) return

    function animateTooltip() {
      const currentPosition = tooltipPositionRef.current
      const targetPosition = tooltipTargetRef.current
      const nextPosition = {
        x: currentPosition.x + (targetPosition.x - currentPosition.x) * 0.18,
        y: currentPosition.y + (targetPosition.y - currentPosition.y) * 0.18,
      }
      const distanceX = Math.abs(targetPosition.x - nextPosition.x)
      const distanceY = Math.abs(targetPosition.y - nextPosition.y)

      tooltipPositionRef.current = nextPosition
      setTooltipPosition(nextPosition)

      if (distanceX < 0.4 && distanceY < 0.4) {
        tooltipPositionRef.current = targetPosition
        setTooltipPosition(targetPosition)
        tooltipFrameRef.current = null
        return
      }

      tooltipFrameRef.current = requestAnimationFrame(animateTooltip)
    }

    tooltipFrameRef.current = requestAnimationFrame(animateTooltip)
  }

  return (
    <span
      ref={termRef}
      data-testid="jobs-to-be-done-term"
      className="group/jobs-term relative inline whitespace-nowrap cursor-help"
      role="button"
      tabIndex={0}
      aria-expanded={tooltipOpen}
      aria-describedby="jobs-to-be-done-tooltip"
      onClick={() => setTooltipOpen((open) => !open)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setTooltipOpen((open) => !open)
        }
      }}
      onPointerMove={updateTooltipPosition}
    >
      “<span
        data-testid="jobs-to-be-done-underlined-text"
        className="underline decoration-current decoration-[0.035em] underline-offset-[0.08em]"
      >
        jobs to be done
      </span>”
      <span
        id="jobs-to-be-done-tooltip"
        ref={tooltipRef}
        data-testid="jobs-to-be-done-tooltip"
        className={[
          'jobs-to-be-done-tooltip pointer-events-none absolute left-0 top-0 z-30 hidden w-[min(34rem,calc(100vw-2rem))] whitespace-normal rounded-[0.65rem] bg-slate-950/85 px-5 py-4 text-left text-sm font-normal leading-6 text-white opacity-0 shadow-2xl backdrop-blur transition-opacity duration-300 ease-out group-hover/jobs-term:opacity-100 group-focus-visible/jobs-term:opacity-100 sm:block',
          tooltipOpen ? 'jobs-to-be-done-tooltip--open opacity-100' : '',
        ].filter(Boolean).join(' ')}
        style={{
          transform: `translateX(${tooltipPosition.x}px) translateY(${tooltipPosition.y}px) scale(0.96)`,
        }}
      >
        {JOBS_TO_BE_DONE_TOOLTIP}
      </span>
      {tooltipOpen && typeof document !== 'undefined' ? createPortal(
        <span
          className="jobs-to-be-done-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="jobs-to-be-done-modal-title"
          data-testid="jobs-to-be-done-modal"
        >
          <span ref={modalPanelRef} className="jobs-to-be-done-modal__panel">
            <button
              type="button"
              className="jobs-to-be-done-modal__close"
              aria-label="Fechar"
              onClick={(event) => {
                event.stopPropagation()
                setTooltipOpen(false)
              }}
            >
              ×
            </button>
            <span id="jobs-to-be-done-modal-title" className="jobs-to-be-done-modal__title">
              Jobs to be Done
            </span>
            <span className="jobs-to-be-done-modal__body">
              {JOBS_TO_BE_DONE_TOOLTIP}
            </span>
          </span>
        </span>,
        document.body,
      ) : null}
    </span>
  )
}

function repeatNossaAbordagemLogosForMarquee(logos, targetCount = MIN_NOSSA_ABORDAGEM_LOGOS_PER_ROW) {
  if (logos.length >= targetCount) {
    return logos
  }

  return Array.from({ length: targetCount }, (_, index) => logos[index % logos.length])
}

function buildNossaAbordagemLogoRows(logos) {
  if (logos.length === 0) {
    return []
  }

  const rows = [
    logos.filter((_, index) => index % 2 === 0),
    logos.filter((_, index) => index % 2 === 1),
  ].map((row) => (row.length > 0 ? row : logos))
  const logosPerRow = Math.max(MIN_NOSSA_ABORDAGEM_LOGOS_PER_ROW, ...rows.map((row) => row.length))
  const accessibleLogoKeys = new Set()

  return rows.map((row) =>
    repeatNossaAbordagemLogosForMarquee(row, logosPerRow).map((logo, index) => {
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

function NossaAbordagemLogoPill({ logo, isDecorative = false }) {
  const logoSrc = resolveLegacyImageUrl(
    logo.logoUrl || (logo.logo ? urlFor(logo.logo).ignoreImageParams().width(360).fit('max').url() : null),
  )

  if (!logoSrc) return null

  const logoImage = (
    <img
      src={logoSrc}
      alt={isDecorative ? '' : logo.logoAlt || logo.name}
      className="nossa-abordagem-logo-carousel__logo"
      loading="eager"
      decoding="async"
      draggable={false}
    />
  )

  return (
    <div
      className="nossa-abordagem-logo-carousel__pill"
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

function NossaAbordagemLogoCarousel({ logos = [], intro }) {
  const visibleLogos = logos.filter((logo) => logo?.logo || logo?.logoUrl)
  const logoRows = useMemo(() => buildNossaAbordagemLogoRows(visibleLogos), [visibleLogos])

  return (
    <section
      data-testid="nossa-abordagem-logo-carousel-section"
      className="nossa-abordagem-logo-carousel-section"
      aria-label="Clientes em Nossa abordagem"
    >
      {intro ? (
        <p className="nossa-abordagem-logo-carousel__intro">
          {intro}
        </p>
      ) : null}
      {visibleLogos.length > 0 ? (
        <div className="nossa-abordagem-logo-carousel__viewport">
          <div
            data-testid="nossa-abordagem-logo-carousel"
            className="nossa-abordagem-logo-carousel"
            aria-live="off"
          >
            {logoRows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                data-testid="nossa-abordagem-logo-carousel-row"
                className="nossa-abordagem-logo-carousel__row"
              >
                <div
                  className={[
                    'nossa-abordagem-logo-carousel__scroller',
                    rowIndex % 2 === 1 ? 'nossa-abordagem-logo-carousel__scroller--reverse' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {[0, 1].map((trackIndex) => (
                    <div
                      key={trackIndex}
                      className="nossa-abordagem-logo-carousel__track"
                      aria-hidden={trackIndex > 0 ? 'true' : undefined}
                    >
                      {row.map(({ instanceKey, isDecorative, logo }) => (
                        <NossaAbordagemLogoPill
                          key={`${trackIndex}-${instanceKey}`}
                          logo={logo}
                          isDecorative={trackIndex > 0 || isDecorative}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function ComparisonBlock({ block }) {
  const isImageBacked = Boolean(block.backgroundImage)
  const shouldSwapPanel = (title) => [
    'Criar o atemporal é construir:',
    'O que gera avanço real é:',
    'O papel das relações',
  ].includes(title)

  if (isImageBacked) {
    return (
      <div className="nossa-abordagem-comparison-table">
        {block.panels.map((panel, panelIndex) => (
          <section
            key={panel.title}
            className={[
              'nossa-abordagem-comparison-panel nossa-abordagem-comparison-panel--image-backed nossa-abordagem-comparison-table__cell',
              `nossa-abordagem-comparison-table__cell--${panelIndex + 1}`,
            ].join(' ')}
          >
            <h2 className="nossa-abordagem-comparison-table__title font-display font-light text-[#39424c]">
              {panel.title === 'O atemporal não é:' ? (
                <>
                  O atemporal{' '}
                  <br />
                  não é:
                </>
              ) : (
                panel.title
              )}
            </h2>
            <div className="nossa-abordagem-comparison-table__content text-[#5a6572]">
              {panel.items.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-10 lg:gap-14">
      {block.panels.map((panel) => (
        <section
          key={panel.title}
          className={[
            'nossa-abordagem-comparison-panel grid gap-7 px-6 py-7 sm:px-8 sm:py-9 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12 md:py-11 lg:gap-16',
            isImageBacked ? 'nossa-abordagem-comparison-panel--image-backed' : 'bg-white',
            !isImageBacked && shouldSwapPanel(panel.title) ? 'nossa-abordagem-comparison-panel--text-backed' : '',
          ].join(' ')}
        >
          <h2 className="max-w-2xl font-display text-[clamp(2rem,3.6vw,4.4rem)] font-light leading-[0.98] text-[#39424c]">
            {panel.title}
          </h2>
          <div className="max-w-2xl space-y-4 text-base leading-7 text-[#5a6572] sm:text-lg sm:leading-8 md:pt-2 lg:pt-3">
            {panel.items.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function ValueVisionBlock({ block, timelineBlocks = [] }) {
  const introLines = block.content.slice(0, 3)
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const stepRefs = useRef([])
  const nodeRefs = useRef([])
  const reachedNodes = useRef(new Set())
  const [activeNodes, setActiveNodes] = useState([])
  const [headerActive, setHeaderActive] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const steps = useMemo(
    () => timelineBlocks.flatMap((timelineBlock) => timelineBlock.panels).map((panel) => ({
      id: panel.title,
      title: panel.title.replace(/:$/, ''),
      items: panel.items,
    })),
    [timelineBlocks],
  )
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start 60%', 'end 60%'],
  })
  const lineScale = useTransform(scrollYProgress, (value) => (
    prefersReducedMotion ? 1 : Math.min(Math.max(value, 0), 1)
  ))

  useEffect(() => {
    if (prefersReducedMotion) {
      return undefined
    }

    const section = sectionRef.current

    if (!section) return undefined

    if (typeof IntersectionObserver === 'undefined') {
      const fallbackTimer = window.setTimeout(() => {
        setHeaderActive(true)
      }, 0)

      return () => {
        window.clearTimeout(fallbackTimer)
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return

      setHeaderActive(true)
      observer.disconnect()
    }, {
      rootMargin: '0px 0px -18% 0px',
      threshold: 0,
    })

    observer.observe(section)

    return () => {
      observer.disconnect()
    }
  }, [prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined') {
      return undefined
    }

    const mobileQuery = window.matchMedia('(max-width: 767px)')

    if (!mobileQuery.matches) {
      return undefined
    }

    if (typeof IntersectionObserver === 'undefined') {
      const fallbackTimer = window.setTimeout(() => {
        setActiveNodes(steps.map((_, index) => index))
      }, 0)

      return () => {
        window.clearTimeout(fallbackTimer)
      }
    }

    const observer = new IntersectionObserver((entries) => {
      const visibleStepIndexes = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => Number(entry.target.getAttribute('data-value-step-index')))
        .filter((stepIndex) => Number.isInteger(stepIndex))

      if (visibleStepIndexes.length === 0) return

      setActiveNodes((current) => {
        const next = new Set(current)
        visibleStepIndexes.forEach((stepIndex) => next.add(stepIndex))
        return Array.from(next).sort((a, b) => a - b)
      })
    }, {
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0,
    })

    stepRefs.current.forEach((step) => {
      if (step) observer.observe(step)
    })

    return () => {
      observer.disconnect()
    }
  }, [prefersReducedMotion, steps])

  useEffect(() => {
    const updateTitleLineWidths = () => {
      sectionRef.current?.querySelectorAll('.nossa-abordagem-value-vision__step').forEach((step) => {
        const title = step.querySelector('h3')
        const separator = step.querySelector('.nossa-abordagem-value-vision__separator')

        if (!title || !separator) return

        const range = document.createRange()
        range.selectNodeContents(title)
        const titleRects = typeof range.getClientRects === 'function' ? Array.from(range.getClientRects()) : []
        const titleLineWidth = titleRects.reduce(
          (widestLine, rect) => Math.max(widestLine, rect.width),
          title.getBoundingClientRect().width,
        )
        range.detach()

        if (titleLineWidth > 0) {
          separator.style.setProperty('--value-title-line-width', `${Math.ceil(titleLineWidth)}px`)
        }
      })
    }

    updateTitleLineWidths()
    document.fonts?.ready?.then(updateTitleLineWidths)
    window.addEventListener('resize', updateTitleLineWidths)

    return () => {
      window.removeEventListener('resize', updateTitleLineWidths)
    }
  }, [steps])

  useMotionValueEvent(lineScale, 'change', (latest) => {
    if (prefersReducedMotion || !trackRef.current) return
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) return

    const trackRect = trackRef.current.getBoundingClientRect()
    const fillBottom = trackRect.top + trackRect.height * latest
    const nextActiveNodes = []

    nodeRefs.current.forEach((node, index) => {
      if (!node || reachedNodes.current.has(index)) return

      const nodeRect = node.getBoundingClientRect()
      const nodeCenter = nodeRect.top + nodeRect.height / 2

      if (fillBottom >= nodeCenter) {
        reachedNodes.current.add(index)
        nextActiveNodes.push(index)
      }
    })

    if (nextActiveNodes.length > 0) {
      setActiveNodes((current) => [...current, ...nextActiveNodes])
    }
  })

  return (
    <article
      ref={sectionRef}
      data-testid="nossa-abordagem-block"
      className="nossa-abordagem-value-vision"
    >
      <div className={[
        'nossa-abordagem-value-vision__header',
        prefersReducedMotion || headerActive ? 'nossa-abordagem-value-vision__header--active' : '',
      ].join(' ')}>
        <h2 style={{ '--value-header-delay': '0ms' }}>{block.title}</h2>
        <div className="nossa-abordagem-value-vision__intro">
          {introLines.map((line, lineIndex) => (
            <p
              key={line}
              style={{ '--value-header-delay': `${420 + lineIndex * 70}ms` }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="nossa-abordagem-value-vision__timeline">
        <div
          ref={trackRef}
          className="nossa-abordagem-value-vision__line"
          data-testid="nossa-abordagem-value-vision-line"
          aria-hidden="true"
        >
          <MotionSpan
            className="nossa-abordagem-value-vision__line-fill"
            data-testid="nossa-abordagem-value-vision-line-fill"
            style={{ scaleY: lineScale }}
          />
        </div>
        {steps.map((step, stepIndex) => (
          <section
            key={step.id}
            className={[
              'nossa-abordagem-value-vision__step',
              stepIndex % 2 === 0
                ? 'nossa-abordagem-value-vision__step--left'
                : 'nossa-abordagem-value-vision__step--right',
              prefersReducedMotion || activeNodes.includes(stepIndex) ? 'nossa-abordagem-value-vision__step--active' : '',
            ].join(' ')}
            ref={(stepElement) => {
              stepRefs.current[stepIndex] = stepElement
            }}
            data-testid="nossa-abordagem-value-vision-step"
            data-value-step-index={stepIndex}
            style={{ '--value-step-delay': '0ms' }}
          >
            <span
              className="nossa-abordagem-value-vision__node"
              data-testid="nossa-abordagem-value-vision-node"
              ref={(node) => {
                nodeRefs.current[stepIndex] = node
              }}
              aria-hidden="true"
            />
            <span className="nossa-abordagem-value-vision__connector" aria-hidden="true" />
            <div className="nossa-abordagem-value-vision__step-inner">
              <div className="nossa-abordagem-value-vision__title-wrap">
                <h3 style={{ '--value-content-delay': '0ms' }}>{step.title}</h3>
                <span className="nossa-abordagem-value-vision__separator" aria-hidden="true" />
              </div>
              <div className="nossa-abordagem-value-vision__copy">
                {step.items.map((item, itemIndex) => (
                  <p
                    key={item}
                    style={{ '--value-content-delay': `${420 + itemIndex * 45}ms` }}
                  >
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}

function EditorialQuoteBlock({ block }) {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined') {
      setVisible(true)
      return undefined
    }

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      setVisible(true)
      observer.disconnect()
    }, {
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0,
    })

    if (sectionRef.current) observer.observe(sectionRef.current)

    return () => observer.disconnect()
  }, [prefersReducedMotion])

  return (
    <section
      ref={sectionRef}
      className={`nossa-abordagem-editorial-quote${visible ? ' nossa-abordagem-editorial-quote--visible' : ''}`}
      aria-labelledby="nossa-abordagem-editorial-quote-title"
      data-testid="nossa-abordagem-editorial-quote"
    >
      <div
        className="nossa-abordagem-editorial-quote__opening nossa-abordagem-editorial-quote__group"
      >
        <h2 id="nossa-abordagem-editorial-quote-title">{block.content[0]}</h2>
        {block.content.slice(1, 3).map((line) => <p key={line}>{line}</p>)}
      </div>

      <div className="nossa-abordagem-editorial-quote__content">
        <div
          className="nossa-abordagem-editorial-quote__manifesto nossa-abordagem-editorial-quote__group"
        >
          <blockquote className="nossa-abordagem-editorial-quote__quote">
            {block.content.slice(3, 5).map((line) => <p key={line}>{line}</p>)}
          </blockquote>
          <p className="nossa-abordagem-editorial-quote__closing">{block.content[5]}</p>
        </div>

        <footer
          className="nossa-abordagem-editorial-quote__signature nossa-abordagem-editorial-quote__group"
        >
          <p className="nossa-abordagem-editorial-quote__name">{block.content[6]}</p>
          <p className="nossa-abordagem-editorial-quote__role">{block.content[7]}</p>
        </footer>
      </div>
    </section>
  )
}

function ContentBlock({ block, index, timelineBlocks, abordagemLogos = [] }) {
  const metricBlockRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const [metricVisible, setMetricVisible] = useState(false)

  useEffect(() => {
    if (block.variant !== 'metric') return undefined

    if (prefersReducedMotion) {
      setMetricVisible(true)
      return undefined
    }

    const metricBlock = metricBlockRef.current
    if (!metricBlock) return undefined

    if (typeof IntersectionObserver === 'undefined') {
      setMetricVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMetricVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -20% 0px', threshold: 0.18 },
    )

    observer.observe(metricBlock)

    return () => observer.disconnect()
  }, [block.variant, prefersReducedMotion])

  if (block.variant === 'cover') {
    return (
      <article
        data-testid="nossa-abordagem-block"
        className="nossa-abordagem-hero"
        data-hero-block="true"
      >
        <img
          src={iconeLine}
          alt=""
          className="nossa-abordagem-hero__icon nossa-abordagem-hero__icon--top-left home-hero__blob"
          data-testid="nossa-abordagem-hero-icon"
          aria-hidden="true"
        />
        <div
          className="nossa-abordagem-hero__content items-center justify-center"
          data-testid="nossa-abordagem-hero-content"
        >
          <SplitText
            tag="h1"
            text="Nossa abordagem"
            className="internal-page-title nossa-abordagem-hero__title"
            {...pageTitleMotion}
            data-split-delay="100"
            data-split-duration="0.6"
            textAlign="center"
          />
        </div>
      </article>
    )
  }

  if (block.variant === 'statement' && index === 1) {
    const lineGroups = [
      [block.content[0]],
      [block.content[2]],
      [
        { text: 'Um compromisso com o que é', visibility: 'mobile' },
        { text: 'relevante, mesmo', visibility: 'mobile', offset: true },
        { text: 'Um compromisso com o que é relevante,', visibility: 'desktop' },
        { text: 'mesmo quando tudo muda.', visibility: 'desktop' },
        { text: 'quando tudo muda.', visibility: 'mobile' },
      ],
    ]

    return (
      <article
        data-testid="nossa-abordagem-block"
        className="nossa-abordagem-timeless"
      >
        <img
          src={timelessBackground}
          alt=""
          className="nossa-abordagem-timeless__image"
          data-testid="nossa-abordagem-timeless-image"
          aria-hidden="true"
        />
        <div className="nossa-abordagem-timeless__scrim" aria-hidden="true" />
        <div className="nossa-abordagem-timeless__content" data-testid="nossa-abordagem-timeless">
          <h2
            className="nossa-abordagem-timeless__title-box"
            data-testid="nossa-abordagem-timeless-title"
            style={{ '--timeless-reveal-delay': '0ms' }}
          >
            {block.title}
          </h2>
          <div className="nossa-abordagem-timeless__lines">
            {lineGroups.map((group, groupIndex) => (
              <div
                key={group.map((line) => (typeof line === 'string' ? line : line.text)).join('|')}
                className={[
                  'nossa-abordagem-timeless__line-group',
                  groupIndex === 2 ? 'nossa-abordagem-timeless__line-group--long' : '',
                ].filter(Boolean).join(' ')}
                data-testid="nossa-abordagem-timeless-line-group"
              >
                {group.map((line, lineIndex) => {
                  const lineText = typeof line === 'string' ? line : line.text

                  return (
                    <p
                      key={lineText}
                      className={[
                        'nossa-abordagem-timeless__line',
                        groupIndex === 0 ? 'nossa-abordagem-timeless__line--dark' : 'nossa-abordagem-timeless__line--light',
                        groupIndex === 2 ? 'nossa-abordagem-timeless__line--long' : '',
                        groupIndex === 2 && lineIndex === 1 ? 'nossa-abordagem-timeless__line--long-offset' : '',
                        typeof line === 'object' && line.offset ? 'nossa-abordagem-timeless__line--long-offset' : '',
                        typeof line === 'object' && line.visibility === 'desktop' ? 'nossa-abordagem-timeless__line--desktop-only' : '',
                        typeof line === 'object' && line.visibility === 'mobile' ? 'nossa-abordagem-timeless__line--mobile-only' : '',
                      ].filter(Boolean).join(' ')}
                      data-testid="nossa-abordagem-timeless-line"
                      style={{ '--timeless-reveal-delay': `${120 + groupIndex * 70 + lineIndex * 85}ms` }}
                    >
                      <span>{lineText}</span>
                    </p>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </article>
    )
  }

  if (block.variant === 'statement' && index === 4) {
    return <ValueVisionBlock block={block} timelineBlocks={timelineBlocks} />
  }

  return (
    <article
      ref={block.variant === 'metric' ? metricBlockRef : undefined}
      data-testid="nossa-abordagem-block"
      className={[
        'relative text-[#5a6572]',
        block.variant === 'quote'
          ? 'py-0'
          : block.variant === 'closing'
            ? 'py-0 sm:py-20 lg:py-24'
            : 'py-16 sm:py-20 lg:py-24',
        block.variant === 'metric' ? 'overflow-visible' : 'overflow-hidden',
        block.variant === 'metric' ? 'bg-[#E5E9F1]' : 'bg-white',
        block.variant === 'metric' ? 'nossa-abordagem-metric-block' : '',
        block.variant === 'statement' ? 'nossa-abordagem-statement-block' : '',
        block.variant === 'list' ? 'nossa-abordagem-list-block' : '',
        block.variant === 'quote' ? 'nossa-abordagem-quote-block' : '',
        block.variant === 'closing' ? 'nossa-abordagem-closing-block' : '',
        block.backgroundImage ? 'nossa-abordagem-comparison-backdrop' : '',
      ].filter(Boolean).join(' ')}
      style={block.backgroundImage ? { '--comparison-background-image': `url(${block.backgroundImage})` } : undefined}
    >
      <div className="min-w-0">
        {block.variant === 'statement' ? (
          <div className="nossa-abordagem-statement-block__inner min-w-0 max-w-5xl">
            <h2 className="nossa-abordagem-statement-block__title break-words font-display text-[clamp(2.65rem,7vw,8rem)] font-light leading-[0.92] text-[#39424c]">
              {block.title}
            </h2>
            {block.content?.length ? (
              <div className="nossa-abordagem-statement-block__copy mt-14 max-w-3xl sm:mt-16 lg:mt-20">
                <TextStack lines={block.content} large />
              </div>
            ) : null}
          </div>
        ) : null}

        {block.variant === 'list' ? (
          <div className="min-w-0 max-w-[82rem]">
            <div className="space-y-7 font-light text-[#39424c] sm:space-y-8">
              {block.content.map((line, lineIndex) => (
                <p
                  key={line}
                  className={[
                    'max-w-full text-[clamp(1.35rem,2.05vw,2.2rem)] leading-[1.22]',
                    lineIndex === 0 || lineIndex === block.content.length - 1 ? 'font-normal' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {block.variant === 'comparison' ? <ComparisonBlock block={block} /> : null}

        {block.variant === 'metric' ? (
          <div className="mx-auto flex min-h-[36rem] min-w-0 w-full max-w-[1180px] items-center px-6 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
            <p
              data-testid="nossa-abordagem-metric-text"
              className={[
                'nossa-abordagem-metric-copy w-full font-display text-[clamp(2.8rem,5.3vw,6.1rem)] font-light leading-[1.08] text-[#616B78]',
                metricVisible ? 'nossa-abordagem-metric-copy--visible' : '',
              ].filter(Boolean).join(' ')}
            >
              Desde 1990, a Otimiza atua com uma equipe de 20 consultores seniores, multidisciplinares, orientados por <JobsToBeDoneTerm />.
            </p>
          </div>
        ) : null}

        {block.variant === 'clients' ? <NossaAbordagemLogoCarousel logos={abordagemLogos} intro={block.content[0]} /> : null}

        {block.variant === 'quote' ? <EditorialQuoteBlock block={block} /> : null}

        {block.variant === 'closing' ? (
          <section
            className="nossa-abordagem-closing"
            aria-labelledby="nossa-abordagem-closing-title"
            data-testid="nossa-abordagem-closing"
          >
            <h2
              id="nossa-abordagem-closing-title"
              className="nossa-abordagem-closing__title font-display"
            >
              {block.title}
            </h2>
            <ClosingContactCta idleText={block.content[0]} />
          </section>
        ) : null}
      </div>
    </article>
  )
}

function NossaAbordagem() {
  const [abordagemLogos, setAbordagemLogos] = useState(() => NOSSA_ABORDAGEM_LOGO_FALLBACKS.map((logo) => ({
    ...logo,
    logoUrl: resolveLegacyImageUrl(logo.logoUrl),
  })))

  useEffect(() => {
    let isMounted = true

    async function loadAbordagemLogos() {
      try {
        const logos = await client.fetch(nossaAbordagemLogoQuery)
        if (isMounted) {
          const resolvedLogos = Array.isArray(logos) && logos.length > 0 ? logos : NOSSA_ABORDAGEM_LOGO_FALLBACKS
          setAbordagemLogos(resolvedLogos.map((logo) => ({
            ...logo,
            logoUrl: resolveLegacyImageUrl(logo.logoUrl),
          })))
        }
      } catch {
        if (isMounted) {
          setAbordagemLogos(NOSSA_ABORDAGEM_LOGO_FALLBACKS.map((logo) => ({
            ...logo,
            logoUrl: resolveLegacyImageUrl(logo.logoUrl),
          })))
        }
      }
    }

    loadAbordagemLogos()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.add('nossa-abordagem-white-background')
    const timelessBlock = document.querySelector('.nossa-abordagem-timeless')

    if (timelessBlock) {
      timelessBlock?.classList.add('nossa-abordagem-timeless--reveal-ready')

      if ('IntersectionObserver' in window) {
        const timelessObserver = timelessBlock
          ? new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              timelessBlock.classList.add('nossa-abordagem-timeless--revealed')
                  timelessObserver.unobserve(timelessBlock)
            }
          },
          { threshold: 0.32 },
        )
          : null

        if (timelessBlock) {
          timelessObserver.observe(timelessBlock)
        }

        return () => {
          timelessObserver?.disconnect()
          timelessBlock?.classList.remove(
            'nossa-abordagem-timeless--reveal-ready',
            'nossa-abordagem-timeless--revealed',
          )
          document.documentElement.classList.remove('nossa-abordagem-white-background')
        }
      }

      timelessBlock?.classList.add('nossa-abordagem-timeless--revealed')
    }

    return () => {
      timelessBlock?.classList.remove(
        'nossa-abordagem-timeless--reveal-ready',
        'nossa-abordagem-timeless--revealed',
      )
      document.documentElement.classList.remove('nossa-abordagem-white-background')
    }
  }, [])

  return (
    <div className="nossa-abordagem-page -mx-1 bg-white text-[#5a6572] sm:-mx-2">
      <section aria-label="Apresentação Otimiza">
        {blocks.map((block, index) => {
          if (index >= 5 && index <= 7) return null

          return (
            <ContentBlock
              key={`${block.variant}-${index}`}
              block={block}
              index={index}
              timelineBlocks={blocks.slice(5, 8)}
              abordagemLogos={abordagemLogos}
            />
          )
        })}
      </section>
    </div>
  )
}

export default NossaAbordagem
