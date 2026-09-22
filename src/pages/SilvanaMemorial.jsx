import { useCallback, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import MemorialBoard from '../components/memorial/MemorialBoard'
import MemorialDust from '../components/memorial/MemorialDust'
import MemorialVideo from '../components/memorial/MemorialVideo'
import { memorialApi } from '../lib/memorialApi'
import SeoHead from '../seo/SeoHead'
import { memorialMetadata } from '../seo/memorialMetadata'
import './SilvanaMemorial.css'

function SilvanaMemorial({ api = memorialApi }) {
  const [notes, setNotes] = useState([])
  const [notesStatus, setNotesStatus] = useState('loading')
  const [notesError, setNotesError] = useState('')
  const loadNotes = useCallback(() => (
    Promise.resolve().then(() => api.listNotes()).then((result) => {
      setNotes(result.notes)
      setNotesError('')
      setNotesStatus('ready')
    }).catch(() => {
      setNotesStatus('error')
      setNotesError('Não foi possível carregar o mural. Verifique sua conexão e tente novamente.')
    })
  ), [api])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  return (
    <main className="silvana-memorial">
      <SeoHead
        title={memorialMetadata.title}
        description={memorialMetadata.description}
        canonicalUrl={memorialMetadata.canonicalUrl}
        imageUrl={memorialMetadata.imageUrl}
        robots={memorialMetadata.robots}
      />
      <MemorialDust
        starSpeed={0}
        density={0.8}
        hueShift={140}
        speed={0.4}
        glowIntensity={0.05}
        saturation={1}
        mouseRepulsion={false}
        repulsionStrength={0}
        twinkleIntensity={0.9}
        rotationSpeed={0}
        transparent
      />
      <header className="memorial-hero">
        <p className="memorial-eyebrow">05 de agosto · Um dia para lembrar dela</p>
        <h1 aria-label="Silvana Tiburi Bettiol. Hoje é dia dela">
          Silvana Tiburi Bettiol.<br />Hoje é dia dela
        </h1>
        <p className="memorial-subtitle">
          A saudade é grande, mas cada lembrança guardada aqui é um jeito de manter você por perto.
        </p>
        <span className="memorial-scroll-cue" aria-hidden="true">
          <ChevronDown size={40} strokeWidth={1.8} />
        </span>
      </header>
      <MemorialVideo />
      <MemorialBoard
        notes={notes}
        status={notesStatus}
        error={notesError}
        onRetry={() => {
          setNotesStatus('loading')
          loadNotes()
        }}
      />
      <footer className="memorial-footer">
        <p>em memória de Silvana Tiburi Bettiol · feito com carinho pela equipe Otimiza</p>
      </footer>
    </main>
  )
}

export default SilvanaMemorial
