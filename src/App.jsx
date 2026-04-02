import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import AcademiaOtimiza from './pages/AcademiaOtimiza'
import Cases from './pages/Cases'
import Contato from './pages/Contato'
import InsightsBlog from './pages/InsightsBlog'
import OQueFazemos from './pages/OQueFazemos'
import QuemSomos from './pages/QuemSomos'
import Tecnologia from './pages/Tecnologia'

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
          <Route path="/insights-e-blog" element={<InsightsBlog />} />
          <Route path="/contato" element={<Contato />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
