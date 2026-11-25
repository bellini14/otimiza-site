import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, ShieldAlert, TriangleAlert, X } from 'lucide-react'
import { NOTA_OFICIAL_PATH } from '../data/notaOficial'
import '../pages/NotaOficial.css'

export const NOTA_AVISO_DISMISSED_UNTIL = 'otimiza:nota-oficial-aviso:dismissed-until'
const DISMISS_DAYS = 30

function isDismissed() {
  try {
    return Number(localStorage.getItem(NOTA_AVISO_DISMISSED_UNTIL)) > Date.now()
  } catch {
    return false
  }
}

function rememberDismissal() {
  try {
    localStorage.setItem(NOTA_AVISO_DISMISSED_UNTIL, String(Date.now() + DISMISS_DAYS * 86400000))
  } catch { /* Storage is optional. */ }
}

export default function NotaOficialAviso() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const onNotaPage = pathname === NOTA_OFICIAL_PATH

  useEffect(() => {
    if (onNotaPage || isDismissed()) return undefined
    const timer = window.setTimeout(() => setOpen(true), 1500)
    return () => window.clearTimeout(timer)
  }, [onNotaPage])

  if (!open || onNotaPage) return null

  function dismiss() {
    setOpen(false)
    rememberDismissal()
  }

  return (
    <aside className="nota-aviso" aria-label="Aviso de segurança">
      <span className="nota-aviso__icon" aria-hidden="true"><ShieldAlert size={18} /></span>
      <div>
        <p className="nota-aviso__title">Atenção a cobranças em nosso nome</p>
        <p className="nota-aviso__text">
          Pagamentos legítimos identificam somente a Otimiza Consultoria em Administração Ltda., CNPJ 00.287.054/0001-80.
        </p>
        <Link className="nota-aviso__link" to={NOTA_OFICIAL_PATH} onClick={dismiss}>
          Leia a nota oficial <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <button className="nota-aviso__close" type="button" aria-label="Fechar aviso" onClick={dismiss}>
        <X size={17} aria-hidden="true" />
      </button>
    </aside>
  )
}

export function NotaOficialAtalho() {
  const { pathname } = useLocation()
  if (pathname === NOTA_OFICIAL_PATH) return null

  return (
    <Link className="nota-atalho" to={NOTA_OFICIAL_PATH} aria-label="Nota oficial: esclarecimento e segurança">
      <span className="nota-atalho__icon" aria-hidden="true"><TriangleAlert size={16} strokeWidth={2.4} /></span>
      <span>Nota oficial</span>
    </Link>
  )
}
