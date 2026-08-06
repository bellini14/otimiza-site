import { Pencil, RefreshCw } from 'lucide-react'
import { getNotePresentation } from '../../lib/memorialPresentation'

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
  const count = notes.length
  const loading = status === 'loading'
  const refreshing = status === 'refreshing'
  const failed = status === 'error'

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
              <p className="memorial-note-message">{note.message}</p>
              {note.name ? <p className="memorial-note-signature">— {note.name}</p> : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default MemorialBoard
