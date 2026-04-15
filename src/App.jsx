import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import InspireLayout from './components/InspireLayout'
import Home from './pages/Home'
import AcademiaOtimiza from './pages/AcademiaOtimiza'
import Cases from './pages/Cases'
import Contato from './pages/Contato'
import Inspire from './pages/Inspire'
import InspireNewsletter from './pages/InspireNewsletter'
import OQueFazemos from './pages/OQueFazemos'
import QuemSomos from './pages/QuemSomos'
import Tecnologia from './pages/Tecnologia'
import PostDetail from './pages/PostDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route path="/o-que-fazemos" element={<OQueFazemos />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/tecnologia" element={<Tecnologia />} />
          <Route path="/academia-otimiza" element={<AcademiaOtimiza />} />
          <Route path="/contato" element={<Contato />} />
        </Route>
        <Route element={<InspireLayout />}>
          <Route path="/inspire" element={<Inspire />} />
          <Route path="/inspire/newsletter" element={<InspireNewsletter />} />
          <Route path="/inspire/:slug" element={<PostDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
