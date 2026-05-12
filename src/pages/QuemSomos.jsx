import { ArrowRight, BrainCircuit, CalendarDays, GraduationCap, Network, Stethoscope, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import heroBwImage from '../assets/hero-bw.jpg'
import logoOtimiza from '../assets/logo-otimiza.svg'

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

function QuemSomos() {
  return (
    <div data-testid="quem-somos-page" className="-mt-32 sm:-mt-36">
      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#EFEFF4]">
        <div className="absolute inset-0" aria-hidden="true">
          <img
            src={heroBwImage}
            alt=""
            className="h-full w-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#EFEFF4] via-[#EFEFF4]/88 to-[#EFEFF4]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#EFEFF4] via-transparent to-[#EFEFF4]/30" />
        </div>

        <div className="relative mx-auto grid min-h-[88svh] w-full max-w-[1380px] items-end px-4 pb-16 pt-36 sm:px-6 sm:pb-20 sm:pt-40 lg:grid-cols-[1fr_0.72fr] lg:px-8 lg:pb-24">
          <div className="max-w-4xl">
            <p className="mb-5 inline-flex items-center rounded-full border border-[#434b54]/10 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red backdrop-blur">
              Desde 1990
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[0.98] tracking-tight text-[#5a6572] sm:text-6xl lg:text-7xl">
              Quem somos
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#5a6572]/82 sm:text-lg">
              A Otimiza Consultoria nasceu em Caxias do Sul, em 1990. Através da competência em traduzir teorias de administração de empresas, que só faziam sentido nos livros acadêmicos, em práticas aplicáveis no ambiente empresarial, expandiu-se nacionalmente.
            </p>
          </div>

          <div className="mt-10 hidden justify-end lg:flex">
            <div className="w-full max-w-sm rounded-[1.25rem] border border-white/70 bg-white/55 p-7 shadow-[0_24px_70px_rgba(67,75,84,0.14)] backdrop-blur-xl">
              <img src={logoOtimiza} alt="Otimiza" className="h-16 w-auto" />
              <p className="mt-8 text-sm leading-7 text-[#5a6572]/76">
                Atualmente, conta com uma equipe multidisciplinar composta por consultores seniores de diversas áreas de atuação e especialidades.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid w-full max-w-[1320px] gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-red/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-red">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              História
            </p>
            <h2 className="font-display text-3xl font-semibold leading-tight text-[#5a6572] sm:text-4xl">
              Uma consultoria formada pela prática.
            </h2>
          </div>

          <div className="grid gap-5 text-base leading-8 text-[#5a6572]/78">
            <p>
              Atualmente, conta com uma equipe multidisciplinar composta por consultores seniores. De diversas áreas de atuação e especialidades, completam-se atendendo empresas de todos os portes e segmentos.
            </p>
            <p>
              Cremos que o nosso grande diferencial é o fato de não sermos uma consultoria de simples aconselhamento e sim uma consultoria de transformação.
            </p>
            <p>
              Temos em nosso cliente o principal meio de prospecção: pela satisfação.
            </p>
          </div>
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
