import { ArrowLeft, Bell, Edit3, Mail, Search } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'

function InspireLayout() {
  const location = useLocation()
  const isLandingPage = location.pathname === '/inspire'

  return (
    <div className="inspire-shell overflow-x-hidden">
      <header className="inspire-shell__topbar">
        <nav
          className="inspire-shell__topbar-inner mx-auto w-full max-w-full px-6 sm:px-8 lg:px-12"
          aria-label="Navegação do Inspire"
        >
          <div className="inspire-shell__brand-group">
            <Link
              to="/"
              className="inspire-shell__icon-button inspire-shell__back-link"
              aria-label="Voltar para o site Otimiza"
            >
              <ArrowLeft size={22} strokeWidth={1.8} />
            </Link>

            <Link to="/inspire" className="inspire-shell__wordmark">
              Inspire
            </Link>
          </div>

          <div
            className={`inspire-shell__search ${isLandingPage ? '' : 'inspire-shell__search--compact'}`.trim()}
            aria-hidden="true"
          >
            <Search size={18} strokeWidth={1.8} />
            <span>Buscar</span>
          </div>

          <div className="inspire-shell__actions">
            <Link to="/inspire/newsletter" className="inspire-shell__app-pill">
              <Mail size={16} strokeWidth={1.8} />
              <span>Assinar newsletter</span>
            </Link>

            <button type="button" className="inspire-shell__text-action" aria-label="Escrever no Inspire">
              <Edit3 size={18} strokeWidth={1.8} />
              <span>Escrever</span>
            </button>

            <button type="button" className="inspire-shell__text-action inspire-shell__text-action--icon" aria-label="Notificações">
              <Bell size={18} strokeWidth={1.8} />
            </button>

            <div className="inspire-shell__avatar" aria-hidden="true" />
          </div>
        </nav>
      </header>

      <main className="inspire-shell__main px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default InspireLayout
