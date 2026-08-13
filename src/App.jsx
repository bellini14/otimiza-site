import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import InspireLayout from './components/InspireLayout'
import SmoothScroll from './components/SmoothScroll'
import WhatsAppSupportWidget from './components/WhatsAppSupportWidget'
import Home from './pages/Home'
import AcademiaOtimiza from './pages/AcademiaOtimiza'
import Cases from './pages/Cases'
import Contato from './pages/Contato'
import Inspire from './pages/Inspire'
import InspireNewsletter from './pages/InspireNewsletter'
import OQueFazemos from './pages/OQueFazemos'
import NossaAbordagem from './pages/NossaAbordagem'
import QuemSomos from './pages/QuemSomos'
import Tecnologia from './pages/Tecnologia'
import CaseDetail from './pages/CaseDetail'
import PostDetail from './pages/PostDetail'
import SilvanaMemorial from './pages/SilvanaMemorial'
import PrivacyPolicy from './pages/PrivacyPolicy'
import PageTransition from './transitions/PageTransition'
import { useTransitionLocation } from './transitions/transitionLocationContext'
import SeoHead from './seo/SeoHead'
import { buildCanonicalUrl, staticPageMetadata } from './seo/siteMetadata'
import defaultSocialImage from './assets/hero-bw.jpg'
import { buildStructuredData } from './seo/structuredData'
import { isWordPressPostPath } from './lib/postUrl'

function AppRoutes() {
  const displayedLocation = useTransitionLocation()
  const isInspireRoute = displayedLocation.pathname === '/inspire'
    || displayedLocation.pathname.startsWith('/inspire/')
    || isWordPressPostPath(displayedLocation.pathname)
  const routeMetadata = staticPageMetadata[displayedLocation.pathname]
  const fallbackTitle = displayedLocation.pathname.startsWith('/cases/')
    ? 'Case de consultoria e melhoria de processos | Otimiza'
    : displayedLocation.pathname.startsWith('/inspire/') || isWordPressPostPath(displayedLocation.pathname)
      ? 'Conteúdo sobre gestão e processos | Otimiza'
      : 'Página não encontrada | Otimiza'
  const configuredSiteOrigin = import.meta.env.VITE_SITE_URL || window.location.origin
  const canonicalUrl = buildCanonicalUrl(displayedLocation.pathname, configuredSiteOrigin)
  const defaultSocialImageUrl = new URL(defaultSocialImage, canonicalUrl).toString()
  const structuredData = buildStructuredData(displayedLocation.pathname, {
    canonicalUrl,
    title: routeMetadata?.title || fallbackTitle,
    description: routeMetadata?.description || 'Conteúdo da Otimiza.',
  })

  return (
    <div
      className={isInspireRoute ? 'inspire-transition-route' : 'page-transition-route'}
      key={isInspireRoute ? 'inspire' : displayedLocation.pathname}
    >
      <SeoHead
        title={routeMetadata?.title || fallbackTitle}
        description={routeMetadata?.description}
        canonicalUrl={canonicalUrl}
        imageUrl={defaultSocialImageUrl}
        structuredData={structuredData}
      />
      <Routes location={displayedLocation}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route path="/nossa-abordagem" element={<NossaAbordagem />} />
          <Route path="/o-que-fazemos" element={<OQueFazemos />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/:slug" element={<CaseDetail />} />
          <Route path="/tecnologia" element={<Tecnologia />} />
          <Route path="/academia-otimiza" element={<AcademiaOtimiza />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
        </Route>
        <Route element={<InspireLayout />}>
          <Route path="/inspire" element={<Inspire />} />
          <Route path="/inspire/newsletter" element={<InspireNewsletter />} />
          <Route path="/inspire/:slug" element={<PostDetail />} />
          <Route path="/:year/:month/:day/:slug" element={<PostDetail />} />
        </Route>
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

function AppShell() {
  const location = useLocation()
  if (location.pathname === '/silvana-bettiol') {
    return <SilvanaMemorial />
  }
  return (
    <>
      <SmoothScroll />
      <PageTransition>
        <AppRoutes />
      </PageTransition>
      <WhatsAppSupportWidget />
    </>
  )
}

export default App
