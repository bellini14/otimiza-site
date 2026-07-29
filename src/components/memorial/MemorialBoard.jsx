import { Pencil } from 'lucide-react'
import { getNotePresentation } from '../../lib/memorialPresentation'

function MemorialBoard({ notes = [], loading = false, ownedNoteId, onEdit }) {
  const count = notes.length
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
      <div className="memorial-board">
        {loading ? (
          <p className="memorial-empty">Carregando o mural…</p>
        ) : count === 0 ? (
          <p className="memorial-empty">
            O mural está vazio ainda — seja a primeira lembrança guardada aqui.
          </p>
        ) : notes.map((note) => {
          const presentation = getNotePresentation(note.id)
          const owned = note.id === ownedNoteId
          return (
            <article
              className="memorial-note"
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
