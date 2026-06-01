import { useEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { motion, useScroll, useTransform } from 'motion/react'
import { Link } from 'react-router-dom'

const solutions = [
  {
    title: 'Diagnóstico',
    intro: 'Identifica quais processos da organização devem ser melhorados.',
    processo:
      'Visualizar e definir prioridades, conhecer melhor o desempenho da empresa, identificar desvios nos processos. Indicar a necessidade de ações para a melhoria da organização.',
    resultado:
      'Oferecer ao executivo a visão de onde deve alocar energias para melhorias dos processos.',
  },
  {
    title: 'Gestão estratégica',
    intro: 'Define as diretrizes da organização.',
    processo:
      'Alinhamento e estabelecimento do rumo da organização, com conformidade de pensamentos.',
    resultado:
      'Equipes alinhadas, direcionadas e comprometidas no atingimento das metas, além de um rumo qualificado para a organização.',
  },
  {
    title: 'Inteligência de negócios',
    intro: 'É a gestão das informações no processo de tomada de decisão.',
    processo:
      'Definição e/ou desenvolvimento de algoritmos inteligentes tomando ou apoiando decisão.',
    resultado:
      'Qualificação do trabalho com decisões mais seguras e rápidas, resultados concretos, produzindo excelência operacional.',
  },
  {
    title: 'Gestão de Pessoas',
    intro:
      'Desenvolvimento da excelência na gestão de pessoas, alinhando competências individuais às da organização.',
    processo:
      'Implementação da gestão por competências e a prática do feedback. Definição das políticas de RH que atendam às necessidades dos funcionários e disponibilidades da empresa. Elaboração do plano de capacitação das equipes.',
    resultado: 'Sincronismo da equipe com o ritmo da organização.',
  },
  {
    title: 'Gestão de Processos de Negócio',
    intro: 'Melhoria incremental, redesenho e inovação dos processos.',
    processo:
      'Readequação das atividades para um modelo de cadeia de agregação de valor, com consequente redução de custos e do ciclo operacional. Interação eficiente entre métodos, pessoas e tecnologia da informação.',
    resultado: 'Geração de valor para o cliente competir com competência.',
  },
  {
    title: 'Gestão integrada da manufatura',
    intro: 'Estratégia gerencial que planeja e controla os recursos da manufatura.',
    processo:
      'Encadeamento, através de um processo lógico, da tomada da decisões sobre o melhor aproveitamento dos recursos da manufatura. Formalização dos processos e sistemas.',
    resultado:
      'Eliminação de processos informais, onde o paroquialismo dá lugar ao trabalho em equipe e a lei do mais forte é substituída pela lei do melhor negócio. Todos sabem o que devem fazer, quando devem fazer e com a mesma informação traduzida para sua necessidade.',
  },
  {
    title: 'Gestão estratégica de custos',
    intro:
      'Apuração dos custos gerenciais e contábeis e geração da análise econômico-financeira.',
    processo:
      'Alinhamento financeiro e de resultados. Possibilidade de diferencial competitivo para garantir espaço no mercado.',
    resultado: 'Maximização de resultados.',
  },
  {
    title: 'Programa de otimização de desempenho (POD)',
    intro:
      'Estabelece iniciativas para reduzir fragilidades e excessos da operação.',
    processo:
      'Estabelecer iniciativas que reduzem as fragilidades da organização e que resultam em redução dos excessos da operação (esforço, custos, despesas e inventário).',
    resultado:
      'Organizações antifrágeis, mais aptas, flexíveis, racionais e ajustadas aos desafios da competição.',
  },
  {
    title: 'Tecnologia de negócios',
    intro: 'Otimizar os processos de negócio usando sistemas informatizados.',
    processo:
      'Através de tecnologia própria, OTMSuite, desenvolve-se aplicativos para agilizar os negócios e efetivamente entregar resultados por meio da automatização de tarefas e criação de regras de negócio inteligentes.',
    resultado:
      'Processos com melhor fluidez e que garantem controle e integridade. Redução de tempo e recursos na execução de tarefas que não precisam de decisões humanas.',
  },
  {
    title: 'Academia Otimiza de inteligência empresarial',
    intro: 'Formação e desenvolvimento de profissionais em gestão empresarial.',
    processo:
      'Desenvolver treinamentos customizados de acordo com a necessidade e cultura de cada organização.',
    resultado:
      'Gestores preparados, capazes de aplicar na empresa os conhecimentos adquiridos em sala de aula.',
  },
  {
    title: 'Consultoria on-line (ECN)',
    intro: 'Gestão empresarial para pequenos negócios.',
    processo:
      'Através do atendimento on-line, ajudar na gestão total da empresa. Indicar alternativas de ações para a sobrevivência ou expansão do pequeno negócio.',
    resultado: 'Definição de prioridades e acompanhamento da execução das ações.',
  },
]

const MotionDiv = motion.div

function formatNumber(index) {
  return String(index + 1).padStart(2, '0')
}

function ServiceChapter({ solution, index, isLast }) {
  const chapterRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ['start end', 'end start'],
  })
  const depthOpacity = useTransform(scrollYProgress, [0, 0.42, 0.72, 1], [0, 0.06, 0.24, 0.36])

  return (
    <section
      className={`oquefazemos-service-chapter${isLast ? ' oquefazemos-service-chapter--last' : ''}`}
      ref={chapterRef}
      style={{ '--chapter-index': String(index), zIndex: 10 + index }}
    >
      <article
        className="oquefazemos-service-chapter__panel oquefazemos-sticky-card"
        data-testid="solution-sticky-section"
      >
        <div className="oquefazemos-service-chapter__stack">
          <div className="oquefazemos-service-chapter__heading">
            <span>{formatNumber(index)}</span>
            <h2>{solution.title}</h2>
          </div>

          <div className="oquefazemos-service-chapter__content">
            <p className="oquefazemos-service-chapter__intro">{solution.intro}</p>

            <div className="oquefazemos-service-chapter__capabilities">
              <div className="oquefazemos-service-chapter__detail">
                <h3>Processo</h3>
                <p>{solution.processo}</p>
              </div>

              <div className="oquefazemos-service-chapter__detail">
                <h3>{solution.title.includes('POD') ? 'Resultado' : 'Resultados'}</h3>
                <p>{solution.resultado}</p>
              </div>
            </div>

            <Link className="oquefazemos-service-chapter__cta" to="/contato">
              Quero contratar essa solução!
              <ArrowUpRight aria-hidden="true" size={18} strokeWidth={2} />
            </Link>
          </div>

          <div
            className="oquefazemos-service-chapter__visual"
            data-number={formatNumber(index)}
            aria-hidden="true"
          />
        </div>

        <MotionDiv
          className="oquefazemos-service-chapter__depth-overlay"
          style={{ opacity: depthOpacity }}
        />
      </article>
    </section>
  )
}

function OQueFazemos() {
  useEffect(() => {
    document.documentElement.classList.add('oquefazemos-sticky-scroll')

    return () => {
      document.documentElement.classList.remove('oquefazemos-sticky-scroll')
    }
  }, [])

  return (
    <section className="oquefazemos-page" aria-labelledby="oquefazemos-title">
      <header className="oquefazemos-hero">
        <h1 id="oquefazemos-title" className="oquefazemos-hero__title">
          O Que Fazemos
        </h1>
        <p className="oquefazemos-hero__copy">
          Unimos consultoria, tecnologia e desenvolvimento de pessoas para transformar
          prioridades empresariais em processos melhores, decisões mais rápidas e resultados
          sustentáveis.
        </p>
      </header>

      <div className="oquefazemos-stack" aria-label="Soluções">
        {solutions.map((solution, index) => (
          <ServiceChapter
            key={solution.title}
            solution={solution}
            index={index}
            isLast={index === solutions.length - 1}
          />
        ))}
      </div>
    </section>
  )
}

export default OQueFazemos
