import { ArrowUpRight, Pencil, RefreshCw, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getNotePresentation } from '../../lib/memorialPresentation'

const NOTE_PREVIEW_LENGTH = 140

function getNotePreview(message) {
  const normalized = String(message || '').replace(/\s+/g, ' ').trim()
  if (normalized.length <= NOTE_PREVIEW_LENGTH) return normalized
  const candidate = normalized.slice(0, NOTE_PREVIEW_LENGTH + 1)
  const lastSpace = candidate.lastIndexOf(' ')
  const cutoff = lastSpace >= NOTE_PREVIEW_LENGTH * 0.65 ? lastSpace : NOTE_PREVIEW_LENGTH
  return `${candidate.slice(0, cutoff).trimEnd()}…`
}

function MemorialNoteDialog({ note, presentation, onClose }) {
  const closeButtonRef = useRef(null)
  const label = note.name ? `Lembrança de ${note.name}` : 'Lembrança anônima'

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        event.preventDefault()
        closeButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return createPortal(
    <div
      className="memorial-note-dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <article
        className="memorial-note-expanded"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        style={{ '--note-color': presentation.color }}
      >
        <span className="memorial-note-expanded-pin" aria-hidden="true" />
        <button
          ref={closeButtonRef}
          type="button"
          className="memorial-note-expanded-close"
          aria-label="Fechar lembrança"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </button>
        <p className="memorial-note-expanded-kicker">Lembrança completa</p>
        <p className="memorial-note-expanded-message">{note.message}</p>
        {note.name ? <p className="memorial-note-expanded-signature">— {note.name}</p> : null}
      </article>
    </div>,
    document.body,
  )
}

function LoadingNotes() {
  return Array.from({ length: 3 }, (_, index) => (
    <div
      className="memorial-note memorial-note-skeleton"
      aria-hidden="true"
      key={index}
    />
  ))
}

function MemorialBoard({
  notes = [],
  status = 'ready',
  error = '',
  ownedNoteId,
  highlightedNoteId,
  onEdit,
  onRetry,
}) {
  const [selectedNote, setSelectedNote] = useState(null)
  const triggerRef = useRef(null)
  const count = notes.length
  const loading = status === 'loading'
  const refreshing = status === 'refreshing'
  const failed = status === 'error'
  const closeNote = useCallback(() => {
    triggerRef.current?.focus()
    setSelectedNote(null)
  }, [])

  return (
    <section className="memorial-board-section" aria-labelledby="memorial-board-title">
      <p
        className="memorial-counter"
        id="memorial-board-title"
        aria-live="polite"
        aria-label={count > 0
          ? `${count} ${count === 1 ? 'lembrança guardada até agora' : 'lembranças guardadas até agora'}`
          : 'Nenhuma lembrança guardada'}
      >
        {count > 0 && (
          <>
            <strong>{count}</strong>{' '}
            {count === 1
              ? 'lembrança guardada até agora'
              : 'lembranças guardadas até agora'}
          </>
        )}
      </p>

      {refreshing && (
        <p className="memorial-board-sync" role="status">
          <RefreshCw aria-hidden="true" /> Atualizando o mural…
        </p>
      )}

      <div className="memorial-board" aria-busy={loading || refreshing}>
        {loading ? (
          <LoadingNotes />
        ) : failed ? (
          <div className="memorial-board-error" role="alert">
            <p>{error || 'Não foi possível carregar o mural.'}</p>
            <button type="button" onClick={onRetry}>
              <RefreshCw aria-hidden="true" /> Tentar novamente
            </button>
          </div>
        ) : count === 0 ? (
          <p className="memorial-empty">
            O mural está vazio ainda — seja a primeira lembrança guardada aqui.
          </p>
        ) : notes.map((note) => {
          const presentation = getNotePresentation(note.id)
          const owned = note.id === ownedNoteId
          const highlighted = note.id === highlightedNoteId
          return (
            <article
              className={`memorial-note${highlighted ? ' is-highlighted' : ''}`}
              key={note.id}
              style={{
                '--note-rotation': `${presentation.rotation}deg`,
                '--note-color': presentation.color,
              }}
            >
              <span className="memorial-pin" aria-hidden="true" />
              {owned && (
                <button
                  type="button"
                  className="memorial-note-edit"
                  aria-label="Editar minha lembrança"
                  onClick={() => onEdit?.(note)}
                >
                  <Pencil aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                className="memorial-note-open"
                aria-label={note.name ? `Ler lembrança de ${note.name}` : 'Ler lembrança anônima'}
                onClick={(event) => {
                  triggerRef.current = event.currentTarget
                  setSelectedNote(note)
                }}
              >
                <p className="memorial-note-message memorial-note-preview">{getNotePreview(note.message)}</p>
                {note.name ? <p className="memorial-note-signature">— {note.name}</p> : null}
                <span className="memorial-note-read-hint" aria-hidden="true">
                  Ler lembrança <ArrowUpRight />
                </span>
              </button>
            </article>
          )
        })}
      </div>
      {selectedNote ? (
        <MemorialNoteDialog
          note={selectedNote}
          presentation={getNotePresentation(selectedNote.id)}
          onClose={closeNote}
        />
      ) : null}
    </section>
  )
}

export default MemorialBoard
