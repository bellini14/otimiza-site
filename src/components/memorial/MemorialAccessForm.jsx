import { useEffect, useState } from 'react'

function MemorialAccessForm({
  api,
  onChanged,
  editingNote = null,
  ownership = null,
  initialIntent = 'contribute',
  onCancelEdit,
}) {
  const [mode, setMode] = useState(editingNote ? 'edit' : 'access')
  const [intent, setIntent] = useState(initialIntent)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState(editingNote?.message || '')
  const [showName, setShowName] = useState(Boolean(editingNote?.name ?? true))
  const [sessionToken, setSessionToken] = useState('')
  const [activeNote, setActiveNote] = useState(editingNote)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (editingNote) {
      setActiveNote(editingNote)
      setMessage(editingNote.message)
      setShowName(Boolean(editingNote.name))
      setMode('edit')
    }
  }, [editingNote])

  const validateEmail = async (event) => {
    event.preventDefault()
    setBusy(true)
    setStatus('Confirmando seu convite…')
    try {
      const result = await api.access({ email, intent })
      setName(result.name)
      setSessionToken(result.sessionToken)
      if (result.hasNote) {
        setActiveNote(result.note)
        setMessage(result.note.message)
        setShowName(Boolean(result.note.name))
        setMode('edit')
      } else {
        setMode('contribute')
      }
      setStatus('')
    } catch (error) {
      setStatus(error.message)
    } finally {
      setBusy(false)
    }
  }

  const submitMemory = async (event) => {
    event.preventDefault()
    setBusy(true)
    setStatus(mode === 'edit' ? 'Atualizando sua lembrança…' : 'Colando no mural…')
    try {
      if (mode === 'edit') {
        const authorization = ownership?.receipt || sessionToken
        await api.updateNote({
          id: activeNote.id, authorization, message, showName,
        })
        setStatus('Sua lembrança foi atualizada.')
        await onChanged?.()
      } else {
        const result = await api.publishNote({ sessionToken, message, showName })
        setActiveNote(result.note)
        setMode('edit')
        setStatus('Lembrança guardada. Obrigada por manter isso com a gente.')
        await onChanged?.({
          ownership: { noteId: result.note.id, receipt: result.ownershipReceipt },
        })
      }
    } catch (error) {
      setStatus(error.message)
    } finally {
      setBusy(false)
    }
  }

  const deleteMemory = async (event) => {
    event.preventDefault()
    setBusy(true)
    setStatus('Retirando sua lembrança do mural…')
    try {
      await api.deleteNote({
        id: activeNote.id,
        authorization: ownership?.receipt || sessionToken,
        emailConfirmation: email,
      })
      setStatus('Sua lembrança foi excluída. Você pode publicar novamente quando quiser.')
      setMode('access')
      setActiveNote(null)
      setMessage('')
      await onChanged?.({ deleted: true })
    } catch (error) {
      setStatus(error.message)
    } finally {
      setBusy(false)
    }
  }

  if (mode === 'access') {
    return (
      <form className="memorial-form-card" onSubmit={validateEmail}>
        <p className="memorial-form-kicker">Um espaço reservado</p>
        <h2>{intent === 'manage' ? 'Encontre sua lembrança' : 'Escreva para ela, ou sobre ela'}</h2>
        <p className="memorial-form-hint">
          {intent === 'manage'
            ? 'Informe o mesmo e-mail usado na publicação.'
            : 'Primeiro, confirme o e-mail que recebeu este convite.'}
        </p>
        <label htmlFor="memorial-email">Seu e-mail</label>
        <input
          id="memorial-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@exemplo.com"
        />
        <button type="submit" disabled={busy}>Confirmar meu acesso</button>
        {intent === 'contribute' && (
          <button
            className="memorial-text-button"
            type="button"
            onClick={() => setIntent('manage')}
          >
            Já publiquei uma lembrança
          </button>
        )}
        <p className="memorial-status" aria-live="polite">{status}</p>
      </form>
    )
  }

  return (
    <form className="memorial-form-card" onSubmit={submitMemory}>
      <p className="memorial-form-kicker">{mode === 'edit' ? 'Sua lembrança' : `Olá, ${name}.`}</p>
      <h2>{mode === 'edit' ? 'Edite sua mensagem' : 'O que você guarda da Silvana?'}</h2>
      <label htmlFor="memorial-message">Sua lembrança</label>
      <textarea
        id="memorial-message"
        required
        maxLength={280}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Uma frase, um gesto, uma história…"
      />
      <div className="memorial-form-meta">
        <label className="memorial-checkbox">
          <input
            type="checkbox"
            checked={showName}
            onChange={(event) => setShowName(event.target.checked)}
          />
          Quero que meu nome apareça
        </label>
        <span>{message.length}/280</span>
      </div>
      <button type="submit" disabled={busy || !message.trim()}>
        {mode === 'edit' ? 'Salvar alterações' : 'Guardar no mural'}
      </button>
      {mode === 'edit' && (
        <>
          <button
            className="memorial-delete-toggle"
            type="button"
            onClick={() => setMode('delete')}
          >
            Excluir minha lembrança
          </button>
          {onCancelEdit && (
            <button className="memorial-text-button" type="button" onClick={onCancelEdit}>
              Cancelar
            </button>
          )}
        </>
      )}
      {mode === 'delete' && (
        <div className="memorial-delete-confirm">
          <p>Para confirmar a exclusão, digite seu e-mail novamente.</p>
          <label htmlFor="memorial-delete-email">Seu e-mail</label>
          <input
            id="memorial-delete-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="button" className="memorial-danger" onClick={deleteMemory}>
            Confirmar exclusão
          </button>
          <button type="button" className="memorial-text-button" onClick={() => setMode('edit')}>
            Manter minha lembrança
          </button>
        </div>
      )}
      <p className="memorial-status" aria-live="polite">{status}</p>
    </form>
  )
}

export default MemorialAccessForm
