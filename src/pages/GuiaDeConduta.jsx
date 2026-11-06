import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, Download } from 'lucide-react'
import TurnstileChallenge from '../components/TurnstileChallenge'
import { useFormSecurity } from '../hooks/useFormSecurity'
import './GuiaDeConduta.css'

const GUIDE_PDF_URL = '/guia-de-conduta-otimiza.pdf'

const eixos = [
  { numero: '01', nome: 'Aprender', nota: 'Curiosidade como método. Cada projeto devolve algo à consultoria.' },
  { numero: '02', nome: 'Pessoas', nota: 'O resultado passa por quem faz. Escuta antes de solução.' },
  { numero: '03', nome: 'Discernir', nota: 'Ler o contexto com rigor e separar o urgente do importante.' },
  { numero: '04', nome: 'Agir', nota: 'Decisão com responsabilidade. Do diagnóstico à prática.' },
  { numero: '05', nome: 'Tecnologia', nota: 'Ferramenta a serviço da gestão, nunca o contrário.' },
]

function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const node = ref.current
    if (!node || visible) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.18 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [visible])

  return [ref, visible]
}

function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...props }) {
  const [ref, visible] = useReveal()
  return (
    <Tag
      ref={ref}
      className={`guia-reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ '--guia-delay': `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  )
}

function GuiaDeConduta() {
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const security = useFormSecurity()
  const isSubmitting = status.type === 'loading'

  async function handleSubmit(event) {
    event.preventDefault()
    if (!security.token) {
      setStatus({ type: 'error', message: 'Aguarde ou conclua a verificação de segurança antes de enviar.' })
      return
    }
    const formData = new FormData(event.currentTarget)
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      companyName: formData.get('companyName'),
      newsletterConsent: formData.get('newsletterConsent') === 'on',
      website: formData.get('website'),
      turnstileToken: security.token,
    }

    setStatus({ type: 'loading', message: '' })

    try {
      const response = await fetch('/api/guia-de-conduta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || 'Não foi possível concluir agora. Tente novamente mais tarde.')
      }
      setStatus({ type: 'success', message: '', email: payload.email, emailSent: result.emailSent === true })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível concluir agora. Tente novamente mais tarde.',
      })
    } finally {
      security.reset()
    }
  }

  function scrollToHistoria(event) {
    event.preventDefault()
    document.getElementById('guia-historia')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="guia-page -mt-32 sm:-mt-36">
      {/* 1. Hero */}
      <section className="guia-hero guia-bleed" aria-labelledby="guia-hero-title">
        <div className="guia-shell guia-hero__inner">
          <p className="guia-eyebrow guia-hero__eyebrow">
            <span className="guia-eyebrow__dot" aria-hidden="true" />
            Guia de Conduta · Otimiza Consultoria
          </p>

          <h1 id="guia-hero-title" className="guia-hero__title">
            <span className="guia-hero__line guia-hero__line--1">Que problema bom!</span>
            <span className="guia-hero__line guia-hero__line--2">Por onde a gente</span>
            <span className="guia-hero__line guia-hero__line--3">
              <em>começa?</em>
            </span>
          </h1>

          <div className="guia-hero__foot guia-rail-grid">
            <a href="#guia-historia" onClick={scrollToHistoria} className="guia-hero__scroll">
              <span className="guia-hero__scroll-icon" aria-hidden="true">
                <ArrowDown size={16} strokeWidth={1.5} />
              </span>
              <span>Comece pela história</span>
            </a>
            <p className="guia-hero__subtitle">
              Entenda a dinâmica que move a Otimiza Consultoria e faça o download do nosso Guia de Conduta.
            </p>
          </div>
        </div>
        <span className="guia-hero__mark" aria-hidden="true">“</span>
      </section>

      {/* 2. História */}
      <section id="guia-historia" className="guia-historia guia-bleed" aria-labelledby="guia-historia-title">
        <div className="guia-shell guia-rail-grid guia-historia__grid">
          <Reveal as="aside" className="guia-historia__aside">
            <p className="guia-eyebrow">A história</p>
            <p className="guia-historia__meta">
              Construção coletiva
              <br />
              a partir da operação
            </p>
          </Reveal>

          <Reveal as="article" className="guia-historia__article" delay={120}>
            <h2 id="guia-historia-title" className="guia-sr-only">A história do Guia de Conduta</h2>
            <p className="guia-historia__lead">
              Essa frase resume a energia da dinâmica que nos trouxe até aqui.
            </p>
            <p className="guia-historia__body">
              Nosso Guia de Conduta não nasceu de cima para baixo, trancado em uma sala de diretoria. Ele foi
              desenhado a partir das memórias, da prática e da verdade de cada consultor no dia a dia da operação.
            </p>
            <blockquote className="guia-historia__pull">
              Uma construção genuinamente coletiva que reflete o que está vivo na organização.
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* 3. Os 5 eixos */}
      <section className="guia-eixos guia-bleed" aria-labelledby="guia-eixos-title">
        <div className="guia-shell">
          <Reveal className="guia-eixos__head guia-rail-grid">
            <p className="guia-eyebrow">O miolo do guia</p>
            <h2 id="guia-eixos-title" className="guia-eixos__title">
              Cinco eixos.{' '}
              <span>Um mesmo jeito de trabalhar.</span>
            </h2>
          </Reveal>

          <ol className="guia-eixos__list">
            {eixos.map((eixo, index) => (
              <Reveal
                as="li"
                key={eixo.nome}
                className={`guia-eixo guia-eixo--${index + 1}`}
                delay={index * 70}
              >
                <span className="guia-eixo__num">{eixo.numero}</span>
                <span className="guia-eixo__nome">{eixo.nome}</span>
                <span className="guia-eixo__nota">{eixo.nota}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. Conversão */}
      <section className="guia-download guia-bleed" aria-labelledby="guia-download-title">
        <div className="guia-shell guia-download__grid">
          <Reveal className="guia-download__intro">
            <p className="guia-eyebrow guia-eyebrow--light">Download gratuito</p>
            <h2 id="guia-download-title" className="guia-download__title">
              Leve o guia
              <br />
              para a sua mesa.
            </h2>
            <p className="guia-download__text">
              Preencha seus dados e receba o PDF completo do Guia de Conduta da Otimiza Consultoria.
            </p>
          </Reveal>

          <Reveal className="guia-download__form-wrap" delay={140}>
            {status.type === 'success' ? (
              <div className="guia-download__success" role="status">
                <p className="guia-download__success-title">Obrigado.</p>
                <p>
                  {status.emailSent
                    ? <>Seu Guia de Conduta está pronto. Também enviamos o link para <strong>{status.email}</strong>.</>
                    : 'Seu Guia de Conduta está pronto para download.'}
                </p>
                <a className="guia-form__submit guia-download__pdf" href={GUIDE_PDF_URL} download target="_blank" rel="noopener">
                  <span>Baixar o PDF</span>
                  <Download size={18} strokeWidth={2} aria-hidden="true" />
                </a>
                <p className="guia-download__pdf-meta">PDF · 15 MB. Boa leitura — e bons problemas.</p>
              </div>
            ) : (
              <form className="guia-form" onSubmit={handleSubmit} aria-busy={isSubmitting}>
                <label className="guia-form__field">
                  <span>Nome</span>
                  <input type="text" name="name" autoComplete="name" required maxLength={80} placeholder="Como podemos te chamar" />
                </label>
                <label className="guia-form__field">
                  <span>E-mail corporativo</span>
                  <input type="email" name="email" autoComplete="email" required maxLength={254} placeholder="voce@empresa.com.br" />
                </label>
                <label className="guia-form__field">
                  <span>Empresa</span>
                  <input type="text" name="companyName" autoComplete="organization" required maxLength={120} placeholder="Onde você atua" />
                </label>

                <label className="guia-form__consent">
                  <input type="checkbox" name="newsletterConsent" />
                  <span>
                    Aceito receber a newsletter Inspire e comunicações da Otimiza. Saiba mais em{' '}
                    <a href="/politica-de-privacidade">Política de Privacidade</a>.
                  </span>
                </label>

                <label className="guia-form__honeypot" aria-hidden="true">
                  <span>Site</span>
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>

                <TurnstileChallenge action="guia-de-conduta" onToken={security.setToken} ref={security.challengeRef} />

                <button type="submit" className="guia-form__submit" disabled={isSubmitting || !security.token}>
                  <span>{isSubmitting ? 'Enviando…' : 'Baixar o Guia de Conduta'}</span>
                  <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
                </button>

                {status.type === 'error' && (
                  <p className="guia-form__error" role="alert">{status.message}</p>
                )}
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </div>
  )
}

export default GuiaDeConduta
