import { Link } from 'react-router-dom'
import { ArrowRight, Check, Mail, Phone } from 'lucide-react'
import { NOTA_OFICIAL_DATE_LABEL, officialIdentity, paymentChecks } from '../data/notaOficial'
import './NotaOficial.css'

function NotaOficial() {
  return (
    <div className="nota-oficial">
      <article className="nota-oficial__shell" aria-labelledby="nota-oficial-title">
        <header className="nota-oficial__head">
          <p className="nota-oficial__eyebrow">
            <span className="nota-oficial__dot" aria-hidden="true" />
            Nota oficial
          </p>
          <h1 id="nota-oficial-title" className="nota-oficial__title">Esclarecimento e segurança</h1>
          <p className="nota-oficial__date">{NOTA_OFICIAL_DATE_LABEL}</p>
        </header>

        <div className="nota-oficial__body">
          <p className="nota-oficial__lead">
            A Otimiza Consultoria em Administração Ltda. esclarece que tomou conhecimento de abordagens comerciais e
            solicitações de pagamento realizadas por terceiros que utilizam o nome Otimiza ou denominações semelhantes.
          </p>
          <p>
            Não possuímos qualquer vínculo societário, comercial ou operacional com essas empresas ou terceiros.
            Nossa sede é única e exclusiva em Caxias do Sul/RS.
          </p>

          <section className="nota-oficial__card" aria-labelledby="nota-oficial-identidade">
            <h2 id="nota-oficial-identidade" className="nota-oficial__card-title">Nossa identificação oficial</h2>
            <dl className="nota-oficial__list">
              {officialIdentity.map((item) => (
                <div key={item.label} className="nota-oficial__row">
                  <dt>{item.label}</dt>
                  <dd>
                    {item.href ? <a href={item.href}>{item.value}</a> : <span translate="no">{item.value}</span>}
                    {item.note ? <small>{item.note}</small> : null}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="nota-oficial-pagamentos">
            <h2 id="nota-oficial-pagamentos">Antes de pagar, confira</h2>
            <p>
              Toda cobrança legítima deve identificar nossa razão social e nosso CNPJ como beneficiários. Não
              autorizamos pagamentos em contas de pessoas físicas ou de outras pessoas jurídicas.
            </p>
            <ul className="nota-oficial__checks">
              {paymentChecks.map((check) => (
                <li key={check}>
                  <span className="nota-oficial__check-icon" aria-hidden="true"><Check size={14} strokeWidth={2.5} /></span>
                  {check}
                </li>
              ))}
            </ul>
            <p>
              Em caso de dúvida, não efetue a operação e entre em contato diretamente conosco pelos canais oficiais.
            </p>
          </section>

          <section aria-labelledby="nota-oficial-medidas">
            <h2 id="nota-oficial-medidas">Medidas adotadas</h2>
            <p>
              Estamos adotando as medidas cabíveis junto às autoridades competentes para o registro dos fatos e a
              preservação de nossos direitos. Reforçamos nosso compromisso com a transparência, a segurança e a
              confiança nas relações que construímos há mais de 30 anos.
            </p>
          </section>

          <div className="nota-oficial__actions">
            <a className="nota-oficial__button nota-oficial__button--primary" href="tel:+555432116045">
              <Phone size={17} aria-hidden="true" /> (54) 3211-6045
            </a>
            <a className="nota-oficial__button" href="mailto:otm@otm.com.br">
              <Mail size={17} aria-hidden="true" /> otm@otm.com.br
            </a>
            <Link className="nota-oficial__button nota-oficial__button--ghost" to="/contato">
              Outros canais <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          <p className="nota-oficial__signature">Otimiza Consultoria em Administração Ltda.</p>
        </div>
      </article>
    </div>
  )
}

export default NotaOficial
