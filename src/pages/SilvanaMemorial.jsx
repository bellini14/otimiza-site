import { useCallback, useEffect, useState } from 'react'
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
import './SilvanaMemorial.css'

function SilvanaMemorial({ api = memorialApi }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [ownership, setOwnership] = useState(() => readMemorialOwnership())
  const [editingNote, setEditingNote] = useState(null)
  const [manageOpen, setManageOpen] = useState(false)

  const loadNotes = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.listNotes()
      setNotes(result.notes || [])
    } catch {
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

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
    await loadNotes()
  }

  const ownedNote = notes.find((note) => note.id === ownership?.noteId)

  return (
    <main className="silvana-memorial">
      <SeoHead
        title="Em memória de Silvana Tiburi Bettiol"
        description="Um mural de lembranças dedicado à Silvana Tiburi Bettiol."
        canonicalUrl={`${window.location.origin}/silvana-bettiol`}
        robots="noindex, nofollow"
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
        <h1 aria-label="silvana tiburi bettiol. Hoje é dia dela">
          silvana tiburi bettiol.<br />Hoje é dia dela
        </h1>
        <p className="memorial-subtitle">
          A saudade é grande, mas cada lembrança guardada aqui é um jeito de manter você por perto.
        </p>
        <span className="memorial-divider" aria-hidden="true" />
      </header>
      <MemorialVideo />
      <section className="memorial-contribution" aria-label="Compartilhe uma lembrança">
        <MemorialAccessForm
          key={`${editingNote?.id || 'new'}-${manageOpen}`}
          api={api}
          onChanged={handleChanged}
          editingNote={editingNote}
          ownership={ownership}
          initialIntent={manageOpen ? 'manage' : 'contribute'}
          onCancelEdit={() => setEditingNote(null)}
        />
      </section>
      <MemorialBoard
        notes={notes}
        loading={loading}
        ownedNoteId={ownedNote?.id}
        onEdit={setEditingNote}
      />
      <footer className="memorial-footer">
        <p>em memória de Silvana Tiburi Bettiol · feito com carinho pela equipe Otimiza</p>
        <button type="button" onClick={() => {
          setEditingNote(null)
          setManageOpen((value) => !value)
          document.querySelector('.memorial-contribution')?.scrollIntoView({ behavior: 'smooth' })
        }}>
          Gostaria de editar ou excluir minha mensagem?
        </button>
      </footer>
    </main>
  )
}

export default SilvanaMemorial
