import { useCallback, useEffect, useRef, useState } from 'react'
import MemorialAccessForm from '../components/memorial/MemorialAccessForm'
import MemorialBoard from '../components/memorial/MemorialBoard'
import MemorialDust from '../components/memorial/MemorialDust'
import MemorialVideo from '../components/memorial/MemorialVideo'
import { memorialApi } from '../lib/memorialApi'
import {
  clearMemorialOwnership,
  readMemorialOwnership,
  writeMemorialOwnership,
} from '../lib/memorialOwnership'
import SeoHead from '../seo/SeoHead'
import { memorialMetadata } from '../seo/memorialMetadata'
import './SilvanaMemorial.css'

function SilvanaMemorial({ api = memorialApi }) {
  const [notes, setNotes] = useState([])
  const [notesStatus, setNotesStatus] = useState('loading')
  const [notesError, setNotesError] = useState('')
  const [ownership, setOwnership] = useState(() => readMemorialOwnership())
  const [editingNote, setEditingNote] = useState(null)
  const [focusRequest, setFocusRequest] = useState(null)
  const [highlightedNoteId, setHighlightedNoteId] = useState(null)
  const focusSequence = useRef(0)
  const highlightTimer = useRef(null)

  const loadNotes = useCallback(async ({ refresh = false } = {}) => {
    setNotesStatus(refresh ? 'refreshing' : 'loading')
    setNotesError('')
    try {
      const result = await api.listNotes()
      setNotes(result.notes)
      setNotesStatus('ready')
    } catch {
      if (refresh) {
        setNotesStatus('ready')
        setNotesError('Não foi possível atualizar o mural agora.')
      } else {
        setNotesStatus('error')
        setNotesError('Não foi possível carregar o mural. Verifique sua conexão e tente novamente.')
      }
    }
  }, [api])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  useEffect(() => () => clearTimeout(highlightTimer.current), [])

  const requestFormFocus = (type) => {
    focusSequence.current += 1
    setFocusRequest({ id: focusSequence.current, type })
  }

  const handleChanged = async (change = {}) => {
    if (change.ownership) {
      writeMemorialOwnership(change.ownership)
      setOwnership(change.ownership)
    }
    if (change.deleted) {
      clearMemorialOwnership()
      setOwnership(null)
      setEditingNote(null)
    }
    if (change.noteId && change.type !== 'deleted') {
      clearTimeout(highlightTimer.current)
      setHighlightedNoteId(change.noteId)
      highlightTimer.current = setTimeout(() => setHighlightedNoteId(null), 2500)
    }
    await loadNotes({ refresh: true })
  }

  const ownedNote = notes.find((note) => note.id === ownership?.noteId)

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
        <span className="memorial-divider" aria-hidden="true" />
        <span className="memorial-scroll-cue" aria-hidden="true" />
      </header>
      <MemorialVideo />
      <section className="memorial-contribution" aria-label="Compartilhe uma lembrança">
        <MemorialAccessForm
          api={api}
          onChanged={handleChanged}
          editingNote={editingNote}
          ownership={ownership}
          focusRequest={focusRequest}
          onCancelEdit={() => setEditingNote(null)}
        />
      </section>
      <MemorialBoard
        notes={notes}
        status={notesStatus}
        error={notesError}
        onRetry={loadNotes}
        ownedNoteId={ownedNote?.id}
        highlightedNoteId={highlightedNoteId}
        onEdit={(note) => {
          setEditingNote(note)
          requestFormFocus('edit')
        }}
      />
      <footer className="memorial-footer">
        <p>em memória de Silvana Tiburi Bettiol · feito com carinho pela equipe Otimiza</p>
        <button type="button" onClick={() => {
          setEditingNote(null)
          requestFormFocus('manage')
        }}>
          Gostaria de editar ou excluir minha mensagem?
        </button>
      </footer>
    </main>
  )
}

export default SilvanaMemorial
