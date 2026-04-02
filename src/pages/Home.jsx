import { Link } from 'react-router-dom'
import heroImage from '../assets/hero.png'

const partnerNames = ['Natura', 'Atlas Capital', 'Marcelli']

const solutions = [
  {
    title: 'Otimizacao Comercial',
    description: 'Estruturamos processos para aumentar previsibilidade e conversao com menos friccao.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 18l5-6 4 3 7-9" />
        <path d="M18 6h2v2" />
      </svg>
    ),
  },
  {
    title: 'Marketing de Performance',
    description: 'Conectamos dados, criativos e funil para reduzir custo por aquisicao e elevar ROI.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </svg>
    ),
  },
  {
    title: 'Business Intelligence',
    description: 'Dashboards e indicadores para tomada de decisao rapida, segura e orientada por dados.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 19V9M12 19V5M19 19v-7" />
      </svg>
    ),
  },
]

const posts = [
  {
    title: 'Como reduzir o CAC sem comprometer escala',
    excerpt: 'Taticas de funil para equilibrar crescimento e eficiencia operacional.',
  },
  {
    title: 'Indicadores que todo gestor deve acompanhar',
    excerpt: 'Uma estrutura clara para monitorar resultado comercial e de marketing.',
  },
  {
    title: 'Automacao com foco em produtividade real',
    excerpt: 'Onde automatizar primeiro para liberar tempo do time e evitar retrabalho.',
  },
]

function LiquidVeilBackground() {
  return (
    <>
      <svg
        className="home-hero__veil-svg"
        data-testid="hero-veil-svg"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="home-hero-veil-band-a" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#050505" />
            <stop offset="18%" stopColor="#fffce7" />
            <stop offset="42%" stopColor="#2a2a28" />
            <stop offset="72%" stopColor="#fff5cc" />
            <stop offset="100%" stopColor="#060606" />
          </linearGradient>
          <linearGradient id="home-hero-veil-band-b" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#080808" />
            <stop offset="16%" stopColor="#fef7d3" />
            <stop offset="38%" stopColor="#1d1d1b" />
            <stop offset="68%" stopColor="#fff8dc" />
            <stop offset="100%" stopColor="#090909" />
          </linearGradient>
          <linearGradient id="home-hero-veil-band-c" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#030303" />
            <stop offset="24%" stopColor="#fffbe1" />
            <stop offset="48%" stopColor="#353533" />
            <stop offset="74%" stopColor="#fff1bf" />
            <stop offset="100%" stopColor="#050505" />
          </linearGradient>
          <filter
            id="home-hero-veil-warp"
            x="-28%"
            y="-20%"
            width="156%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.004 0.02"
              numOctaves="2"
              seed="14"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="128"
              xChannelSelector="R"
              yChannelSelector="B"
              result="warp"
            />
            <feGaussianBlur in="warp" stdDeviation="7.5" result="blur" />
            <feComponentTransfer in="blur">
              <feFuncA type="linear" slope="1.05" />
            </feComponentTransfer>
          </filter>
          <filter
            id="home-hero-veil-soft"
            x="-28%"
            y="-20%"
            width="156%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="26" />
          </filter>
        </defs>

        <rect width="1600" height="900" fill="#020202" />

        <g className="home-hero__veil-group home-hero__veil-group--main" filter="url(#home-hero-veil-warp)">
          <rect
            className="home-hero__veil-band home-hero__veil-band--a"
            x="-86"
            y="-120"
            width="238"
            height="1140"
            rx="118"
            fill="url(#home-hero-veil-band-a)"
          />
          <rect
            className="home-hero__veil-band home-hero__veil-band--b"
            x="178"
            y="-140"
            width="214"
            height="1160"
            rx="108"
            fill="url(#home-hero-veil-band-b)"
          />
          <rect
            className="home-hero__veil-band home-hero__veil-band--c"
            x="448"
            y="-110"
            width="274"
            height="1110"
            rx="136"
            fill="url(#home-hero-veil-band-c)"
          />
          <rect
            className="home-hero__veil-band home-hero__veil-band--d"
            x="760"
            y="-135"
            width="258"
            height="1150"
            rx="124"
            fill="url(#home-hero-veil-band-b)"
          />
          <rect
            className="home-hero__veil-band home-hero__veil-band--e"
            x="1080"
            y="-105"
            width="246"
            height="1100"
            rx="118"
            fill="url(#home-hero-veil-band-a)"
          />
          <rect
            className="home-hero__veil-band home-hero__veil-band--f"
            x="1348"
            y="-145"
            width="236"
            height="1165"
            rx="114"
            fill="url(#home-hero-veil-band-c)"
          />
        </g>

        <g
          className="home-hero__veil-group home-hero__veil-group--soft"
          filter="url(#home-hero-veil-soft)"
          opacity="0.45"
        >
          <rect
            className="home-hero__veil-band home-hero__veil-band--soft-a"
            x="54"
            y="-90"
            width="320"
            height="1040"
            rx="160"
            fill="url(#home-hero-veil-band-a)"
          />
          <rect
            className="home-hero__veil-band home-hero__veil-band--soft-b"
            x="584"
            y="-80"
            width="360"
            height="1020"
            rx="180"
            fill="url(#home-hero-veil-band-c)"
          />
          <rect
            className="home-hero__veil-band home-hero__veil-band--soft-c"
            x="1138"
            y="-100"
            width="344"
            height="1050"
            rx="172"
            fill="url(#home-hero-veil-band-b)"
          />
        </g>
      </svg>

      <div className="home-hero__veil-scrim" data-testid="hero-veil-scrim" aria-hidden="true" />
    </>
  )
}

function Home() {
  return (
    <div className="space-y-12 pb-6">
      <section className="home-hero animate-enter">
        <div className="home-hero__stage" data-testid="hero-stage">
          <LiquidVeilBackground />

          <div className="home-hero__content">
            <p className="home-hero__eyebrow">Consultoria para decidir com mais clareza</p>
            <h1 className="home-hero__title" aria-label="Decidir melhor agora, porque não?">
              <span>Decidir</span>
              <span>melhor</span>
              <span>agora,</span>
              <span>porque não?</span>
            </h1>
            <p className="home-hero__copy">
              Diagnóstico, direção e execução para líderes que precisam sair da dúvida e agir com
              mais clareza agora.
            </p>
            <div className="home-hero__actions">
              <Link to="/contato" className="home-hero__primary">
                Agendar diagnostico
              </Link>
              <Link to="/o-que-fazemos" className="home-hero__secondary">
                Conhecer a consultoria
              </Link>
            </div>
            <p className="home-hero__signal">Primeira leitura, problema certo, direção objetiva.</p>
          </div>
        </div>
      </section>

      <section className="animate-enter [animation-delay:120ms]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Empresas que confiam
          </p>
          <div className="grid gap-4 text-center sm:grid-cols-3">
            {partnerNames.map((name) => (
              <div
                key={name}
                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5 font-display text-2xl text-slate-700 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="animate-enter [animation-delay:220ms]">
        <div className="mb-6 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">Expertise</p>
          <h2 className="font-display text-4xl text-slate-900">Nossas Solucoes</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {solutions.map((item) => (
            <article
              key={item.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-red/40 hover:shadow-xl"
            >
              <div className="mb-4 inline-flex rounded-lg bg-brand-red/10 p-3 text-brand-red transition group-hover:scale-110 group-hover:bg-brand-red group-hover:text-white">
                {item.icon}
              </div>
              <h3 className="mb-2 font-display text-2xl text-slate-900">{item.title}</h3>
              <p className="text-sm leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="animate-enter [animation-delay:300ms]">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white">
          <div className="grid gap-8 px-8 py-10 md:grid-cols-[1fr_1.05fr] md:px-12 md:py-12">
            <div className="order-2 md:order-1">
              <img
                src={heroImage}
                alt="Especialista analisando indicadores"
                className="h-full w-full rounded-2xl object-cover"
              />
            </div>
            <div className="order-1 space-y-4 md:order-2">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Visao orientada por dados</p>
              <h2 className="font-display text-4xl leading-tight">
                Acreditamos que os dados certos orientam as melhores decisoes
              </h2>
              <p className="max-w-lg text-sm leading-7 text-white/75">
                Unimos leitura de contexto, tecnologia e metodo para encontrar oportunidades de ganho
                com execucao consistente.
              </p>
              <Link to="/tecnologia" className="btn-primary inline-flex">
                Conheca nossa tecnologia
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(255,42,42,0.15),transparent_55%)]" />
        </div>
      </section>

      <section className="grid gap-6 animate-enter [animation-delay:380ms] lg:grid-cols-[1.05fr_1fr]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <img src={heroImage} alt="Time em reuniao de estrategia" className="h-56 w-full object-cover" />
          <div className="space-y-3 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">Vigia Noticias</p>
            <h3 className="font-display text-3xl text-slate-900">A melhor forma de acompanhar o mercado</h3>
            <p className="text-sm leading-7 text-slate-600">
              Receba analises e sinais relevantes para agir com velocidade nas prioridades da empresa.
            </p>
            <Link to="/insights-e-blog" className="btn-link">
              Ler noticias
            </Link>
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Manifesto</p>
          <h3 className="mb-4 font-display text-3xl text-slate-900">Visao focada no sucesso do negocio</h3>
          <p className="text-sm leading-7 text-slate-600">
            Crescimento sustentavel exige menos ruido, mais clareza e foco naquilo que move o
            ponteiro de resultado. Nossos projetos comecam no problema certo e terminam em mudancas
            que permanecem.
          </p>
        </article>
      </section>

      <section className="animate-enter [animation-delay:460ms]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-4xl text-slate-900">Ultimos Posts</h2>
          <Link to="/insights-e-blog" className="btn-link">
            Ver todos
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {posts.map((post, index) => (
            <article
              key={post.title}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img src={heroImage} alt={post.title} className="h-40 w-full object-cover" />
              <div className="space-y-3 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Post {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="font-display text-2xl text-slate-900">{post.title}</h3>
                <p className="text-sm leading-6 text-slate-600">{post.excerpt}</p>
                <Link to="/insights-e-blog" className="btn-link">
                  Continuar lendo
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="animate-enter [animation-delay:540ms]">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 md:px-10 md:py-10">
          <div className="grid items-center gap-6 md:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="font-display text-4xl text-slate-900">Assine nossa Newsletter</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Conteudos quinzenais com insights acionaveis para liderancas de marketing, vendas e
                operacoes.
              </p>
            </div>
            <form className="grid gap-3">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />
              <button type="button" className="btn-primary justify-center">
                Assinar agora
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
