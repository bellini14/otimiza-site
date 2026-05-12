import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, BrainCircuit, GraduationCap, Network, Stethoscope, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ScrollVelocity } from '../components/ui/ScrollVelocity'
import { client } from '../lib/sanity'
import heroBwImage from '../../imagens/hero quem somos.png'

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

const strategyItems = [
  'Transformação dos modelos de negócio',
  'Aplicação de métodos que produzam melhores e maiores acertos',
  'Aproximação da gestão à tecnologia, da pessoa ao método, do negócio ao resultado',
  'Realização de eventos que entreguem eficácia',
]

const legacyClients = ['Ana Nery', 'Agrimar', 'AES Brasil', 'Agua Fast']

const storyParagraphs = [
  'Uma equipe multidisciplinar de consultores seniores, preparada para atuar em empresas de diferentes portes e segmentos.',
  'Mais do que aconselhar, conduzimos transformações práticas no negócio.',
  'Nosso crescimento vem da satisfação dos clientes.',
]

function repeatClientLogos(logos, targetCount = 12) {
  if (logos.length >= targetCount) {
    return logos
  }

  return Array.from({ length: targetCount }, (_, index) => logos[index % logos.length])
}

function buildClientLogoRow(logos) {
  return repeatClientLogos(logos).map((logo, index) => ({
    instanceKey: `${logo._id || logo.name}-${index}`,
    isDecorative: index >= logos.length,
    logo,
  }))
}

function ClientLogoPill({ logo, isDecorative = false }) {
  const logoImage = (
    <img
      src={logo.logoUrl}
      alt={isDecorative ? '' : logo.logoAlt || logo.name}
      className="max-h-11 w-auto max-w-[10rem] object-contain grayscale transition duration-300 group-hover/logo:grayscale-0"
      loading="eager"
      decoding="async"
    />
  )

  return (
    <div
      className="group/logo flex h-20 w-[16rem] shrink-0 items-center justify-center rounded-full border border-[#5a6572]/58 bg-white/34 px-10 shadow-[inset_0_0_0_1px_rgba(90,101,114,0.28)] backdrop-blur-sm"
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
  const logoRow = useMemo(() => buildClientLogoRow(logos), [logos])

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
      aria-label="Clientes"
      className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#e5e9f1] py-8 sm:py-10"
      data-testid="quem-somos-client-logo-carousel"
    >
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[18vw] bg-gradient-to-r from-[#e5e9f1] via-[#e5e9f1]/88 to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[18vw] bg-gradient-to-l from-[#e5e9f1] via-[#e5e9f1]/88 to-transparent" aria-hidden="true" />
        <ScrollVelocity
          velocity={38}
          numCopies={5}
          texts={[
            <div key="clientes" className="flex items-center gap-9 pr-9">
              {logoRow.map(({ instanceKey, isDecorative, logo }) => (
                <ClientLogoPill key={instanceKey} logo={logo} isDecorative={isDecorative} />
              ))}
            </div>,
          ]}
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
  const [progress, setProgress] = useState(0)
  const wordCounts = useMemo(() => storyParagraphs.map((paragraph) => paragraph.split(/\s+/).filter(Boolean).length), [])
  const totalWords = useMemo(() => wordCounts.reduce((total, count) => total + count, 0), [wordCounts])

  useEffect(() => {
    const updateProgress = () => {
      if (!containerRef.current) {
        return
      }

      const rect = containerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const revealStart = viewportHeight * 0.75
      const revealEnd = viewportHeight * 0.25
      const revealDistance = Math.max(revealStart - revealEnd, 1)

      setProgress(clamp((revealStart - rect.top) / revealDistance, 0, 1))
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
      className="grid w-full max-w-[1320px] gap-8 text-justify text-[clamp(1.8rem,2.8vw,3.2rem)] font-light leading-[1.26] text-[#5a6572] [text-align-last:left]"
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
  return (
    <div data-testid="quem-somos-page" className="-mt-32 sm:-mt-36">
      <section
        aria-label="Introdução sobre a Otimiza"
        className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#cad2e2]"
      >
        <div className="absolute inset-0" aria-hidden="true">
          <img
            src={heroBwImage}
            alt=""
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-y-0 left-[44%] hidden w-[24%] -skew-x-[22deg] bg-gradient-to-r from-white/22 via-[#cad2e2]/18 to-transparent blur-[1px] md:block" />
          <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-[#e5e9f1] via-[#e5e9f1]/72 to-transparent" />
        </div>

        <div className="relative mx-auto grid min-h-[100svh] w-full max-w-[1320px] items-center gap-10 px-4 py-32 sm:px-5 sm:py-36 lg:grid-cols-[1fr_0.82fr] lg:px-0">
          <div className="max-w-[48rem]">
            <h1 className="font-display text-[clamp(4.35rem,8.35vw,7.35rem)] font-light leading-[0.92] text-[#5a6572]">
              Quem somos
            </h1>
            <p className="mt-7 max-w-[45rem] text-[clamp(1.12rem,1.72vw,1.68rem)] font-light leading-[1.2] text-[#5a6572]/90 sm:mt-9">
              A Otimiza Consultoria nasceu em Caxias do Sul, em 1990. Através da competência em traduzir teorias de administração de empresas, que só faziam sentido nos livros acadêmicos, em práticas aplicáveis no ambiente empresarial, expandiu-se nacionalmente.
            </p>
          </div>

          <div className="flex justify-end">
            <div className="relative w-full max-w-[33rem] overflow-hidden rounded-[1rem] border border-white/90 bg-[#e6ebf8]/88 px-8 py-9 shadow-[0_26px_70px_rgba(90,101,114,0.05)] backdrop-blur-md sm:px-11 sm:py-11 lg:mb-0">
              <p className="relative text-[clamp(1.38rem,2.05vw,1.95rem)] font-thin leading-[1.16] text-[#5a6572]">
                Atualmente, conta com uma equipe multidisciplinar composta por consultores seniores de diversas áreas de atuação e especialidades.
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[#5a6572]/78 sm:bottom-10" aria-hidden="true">
          <ArrowDown className="h-8 w-8 animate-scroll-cue" strokeWidth={1.4} />
        </div>
      </section>

      <ClientLogoCarousel />

      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#e5e9f1] px-4 py-20 sm:px-5 sm:py-24 lg:px-0 lg:py-28">
        <div className="mx-auto flex min-h-[24rem] w-full max-w-[1320px] items-center justify-start">
          <StoryRevealCopy />
        </div>
      </section>

      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#F7F8FA] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-[1320px]">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-4 text-sm font-semibold text-brand-red">Somos sustentados por três vértices de atuação</p>
            <h2 className="font-display text-3xl font-semibold leading-tight text-[#5a6572] sm:text-5xl">
              Consultoria, tecnologia e academia trabalhando juntas.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map((pillar, index) => {
              const PillarIcon = pillar.icon

              return (
                <article
                  key={pillar.title}
                  className="group rounded-[1.25rem] border border-[#434b54]/10 bg-white p-6 shadow-[0_14px_44px_rgba(67,75,84,0.06)] transition duration-300 hover:-translate-y-1 hover:border-brand-red/25"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red transition duration-300 group-hover:bg-brand-red group-hover:text-[#fff]">
                    <PillarIcon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#5a6572]">{pillar.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#5a6572]/72">{pillar.description}</p>
                </article>
              )
            })}
          </div>

          <div className="mt-10 flex justify-center">
            <Link to="/contato" className="btn-primary rounded-[1rem]">
              Entre em contato
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid w-full max-w-[1320px] gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-brand-red/10 text-brand-red">
              <Network className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-[#5a6572]">Estratégia</h2>
            <p className="mt-4 max-w-md text-base leading-8 text-[#5a6572]/74">
              Nossa orientação estratégica está baseada em método, prática e aproximação com o resultado.
            </p>
          </div>

          <div className="grid gap-3">
            {strategyItems.map((item) => (
              <div key={item} className="flex items-start gap-4 rounded-[1rem] border border-[#434b54]/10 bg-[#F7F8FA] p-5">
                <Target className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" aria-hidden="true" />
                <p className="text-sm font-semibold leading-7 text-[#5a6572]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#2F363E] px-4 py-16 text-[#f8fafc] sm:px-6 sm:py-20 lg:px-8">
        <div className="absolute inset-0 opacity-30" aria-hidden="true">
          <img src={heroBwImage} alt="" className="h-full w-full object-cover grayscale" />
          <div className="absolute inset-0 bg-[#2F363E]/85" />
        </div>
        <div className="relative mx-auto w-full max-w-[1320px]">
          <p className="mb-5 text-sm text-[#f8fafc]/72">Nossa missão</p>
          <blockquote className="max-w-5xl font-display text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">
            “Contribuir para o crescimento e a solidez dos clientes, viabilizando mudanças, através de ações competentes e personalizadas, promovendo o êxito do negócio, com uma equipe inspirada e motivada”.
          </blockquote>
        </div>
      </section>

      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#EFEFF4] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-[1320px] grid-cols-2 gap-3 sm:grid-cols-4">
          {legacyClients.map((client) => (
            <div key={client} className="flex min-h-24 items-center justify-center rounded-[1rem] border border-[#434b54]/8 bg-white/58 px-4 text-center text-xl font-semibold text-[#5a6572]/42 grayscale">
              {client}
            </div>
          ))}
        </div>
      </section>

      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid w-full max-w-[1320px] gap-12 lg:grid-cols-[0.55fr_1.45fr]">
          <div>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-[#5a6572]">Consultores</h2>
            <a
              href="https://www.linkedin.com/company/otimiza-consultoria"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-[1rem] bg-[#434b54] px-5 py-3 text-sm font-semibold text-[#fff] transition hover:-translate-y-0.5 hover:bg-[#364048]"
            >
              Acesse nosso LinkedIn
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="grid gap-5 text-base leading-8 text-[#5a6572]/78">
            <p>
              Nossos consultores possuem elevadas qualificações acadêmicas e práticas. Diferentes perfis profissionais em sinergia, garantindo alto desempenho nos contextos de administração. Um grupo coeso e multidisciplinar, gerador de inteligência coletiva, orientado para e pelo seu negócio.
            </p>
            <p>
              Nossos profissionais possuem competências lato e stricto sensu em Administração de Empresas, Automação Industrial, Psicologia, Engenharia de Produção, Engenharia Mecânica e Processamento de Dados.
            </p>
            <p>
              Especialistas em Gestão Empresarial, Gestão de Pessoas, Gerenciamento de Projetos, Gestão de Negócios, Gestão Estratégica de Custos e Comércio Exterior.
            </p>
            <p>
              Certificações - CBPP (Gestão de Processos de Negócio), PMP - (Gerenciamento de Projetos).
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default QuemSomos
