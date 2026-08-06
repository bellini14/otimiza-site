import { useEffect, useRef, useState } from 'react'

function MemorialAccessForm({
  api,
  onChanged,
  editingNote = null,
  ownership = null,
  initialIntent = 'contribute',
  focusRequest = null,
  onCancelEdit,
}) {
  const formRef = useRef(null)
  const emailRef = useRef(null)
  const messageRef = useRef(null)
  const deleteEmailRef = useRef(null)
  const [mode, setMode] = useState(editingNote ? 'edit' : 'access')
  const [intent, setIntent] = useState(initialIntent)
  const [email, setEmail] = useState('')
  const [deleteEmail, setDeleteEmail] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState(editingNote?.message || '')
  const [showName, setShowName] = useState(Boolean(editingNote?.name ?? true))
  const [sessionToken, setSessionToken] = useState('')
  const [activeNote, setActiveNote] = useState(editingNote)
  const [status, setStatus] = useState('')
  const [statusKind, setStatusKind] = useState('idle')
  const [busy, setBusy] = useState(false)
  const [preservedDraft, setPreservedDraft] = useState(null)
  const [focusTarget, setFocusTarget] = useState(null)

  const showStatus = (messageText, kind = 'status') => {
    setStatus(messageText)
    setStatusKind(kind)
  }

  useEffect(() => {
    if (!editingNote) return
    setActiveNote(editingNote)
    setMessage(editingNote.message)
    setShowName(Boolean(editingNote.name))
    setMode('edit')
    setFocusTarget('message')
  }, [editingNote])

  useEffect(() => {
    if (!focusRequest?.id) return
    if (focusRequest.type === 'manage') {
      setIntent('manage')
      setMode('access')
      setActiveNote(null)
      setEmail('')
      showStatus('', 'idle')
      setFocusTarget('email')
    } else if (focusRequest.type === 'edit') {
      setMode('edit')
      setFocusTarget('message')
    } else {
      setIntent('contribute')
      setMode('access')
      setFocusTarget('email')
    }
  }, [focusRequest])

  useEffect(() => {
    if (!focusTarget) return undefined
    const frame = requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      formRef.current?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'center',
      })
      const target = {
        email: emailRef,
        message: messageRef,
        deleteEmail: deleteEmailRef,
      }[focusTarget]
      target?.current?.focus()
      setFocusTarget(null)
    })
    return () => cancelAnimationFrame(frame)
  }, [focusTarget, mode])

  const validateEmail = async (event) => {
    event.preventDefault()
    setBusy(true)
    showStatus('Confirmando seu convite…')
    try {
      const result = await api.access({ email, intent })
      setName(result.name)
      setSessionToken(result.sessionToken)
      if (result.hasNote) {
        setActiveNote(result.note)
        setMessage(preservedDraft?.message ?? result.note.message)
        setShowName(preservedDraft?.showName ?? Boolean(result.note.name))
        setMode('edit')
      } else {
        setActiveNote(null)
        setMessage(preservedDraft?.message ?? '')
        setShowName(preservedDraft?.showName ?? true)
        setMode('contribute')
      }
      setPreservedDraft(null)
      setEmail('')
      showStatus('', 'idle')
      setFocusTarget('message')
    } catch (error) {
      showStatus(error.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const submitMemory = async (event) => {
    event.preventDefault()
    setBusy(true)
    showStatus(mode === 'edit' ? 'Atualizando sua lembrança…' : 'Colando no mural…')
    try {
      if (mode === 'edit') {
        const authorization = ownership?.noteId === activeNote.id
          ? ownership.receipt
          : sessionToken
        const result = await api.updateNote({
          id: activeNote.id, authorization, message, showName,
        })
        setActiveNote((current) => ({ ...current, ...result.note, message }))
        showStatus('Sua lembrança foi atualizada.')
        await onChanged?.({ type: 'updated', noteId: result.note.id || activeNote.id })
      } else {
        const result = await api.publishNote({ sessionToken, message, showName })
        setActiveNote(result.note)
        setMode('edit')
        showStatus('Lembrança guardada. Obrigada por manter isso com a gente.')
        await onChanged?.({
          type: 'created',
          noteId: result.note.id,
          ownership: { noteId: result.note.id, receipt: result.ownershipReceipt },
        })
      }
    } catch (error) {
      if (error.code === 'SESSION_INVALID') {
        setPreservedDraft({ message, showName })
        setIntent(activeNote ? 'manage' : 'contribute')
        setMode('access')
        showStatus(
          'Sua validação expirou. Confirme o e-mail novamente; seu texto foi preservado.',
          'error',
        )
        setFocusTarget('email')
      } else {
        showStatus(error.message, 'error')
      }
    } finally {
      setBusy(false)
    }
  }

  const deleteMemory = async (event) => {
    event.preventDefault()
    setBusy(true)
    showStatus('Retirando sua lembrança do mural…')
    try {
      const deletedNoteId = activeNote.id
      await api.deleteNote({
        id: deletedNoteId,
        authorization: ownership?.noteId === deletedNoteId
          ? ownership.receipt
          : sessionToken,
        emailConfirmation: deleteEmail,
      })
      setMode('access')
      setIntent('contribute')
      setActiveNote(null)
      setMessage('')
      setDeleteEmail('')
      showStatus('Sua lembrança foi excluída. Você pode publicar novamente quando quiser.')
      await onChanged?.({ type: 'deleted', noteId: deletedNoteId, deleted: true })
      setFocusTarget('email')
    } catch (error) {
      if (error.code === 'SESSION_INVALID') {
        setPreservedDraft({ message, showName })
        setIntent('manage')
        setMode('access')
        showStatus('Sua validação expirou. Confirme o e-mail novamente.', 'error')
        setFocusTarget('email')
      } else {
        showStatus(error.message, 'error')
      }
    } finally {
      setBusy(false)
    }
  }

  const statusMessage = status ? (
    <p
      className={`memorial-status memorial-status-${statusKind}`}
      role={statusKind === 'error' ? 'alert' : 'status'}
    >
      {status}
    </p>
  ) : null

  if (mode === 'access') {
    return (
      <form
        ref={formRef}
        className="memorial-form-card"
        data-mode="access"
        aria-busy={busy}
        onSubmit={validateEmail}
      >
        <p className="memorial-form-kicker">Um espaço reservado</p>
        <h2>{intent === 'manage' ? 'Encontre sua lembrança' : 'Escreva para ela, ou sobre ela'}</h2>
        <p className="memorial-form-hint">
          {intent === 'manage'
            ? 'Informe o mesmo e-mail usado na publicação.'
            : 'Primeiro, confirme o e-mail que recebeu este convite.'}
        </p>
        <label htmlFor="memorial-email">Seu e-mail</label>
        <input
          ref={emailRef}
          id="memorial-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@exemplo.com"
        />
        <button type="submit" disabled={busy}>
          {busy ? 'Confirmando…' : 'Confirmar meu acesso'}
        </button>
        {intent === 'contribute' && (
          <button
            className="memorial-text-button"
            type="button"
            onClick={() => {
              setIntent('manage')
              setFocusTarget('email')
            }}
          >
            Já publiquei uma lembrança
          </button>
        )}
        {statusMessage}
      </form>
    )
  }

  if (mode === 'delete') {
    return (
      <form
        ref={formRef}
        className="memorial-form-card memorial-delete-panel"
        data-mode="delete"
        aria-busy={busy}
        onSubmit={deleteMemory}
      >
        <p className="memorial-form-kicker">Uma última confirmação</p>
        <h2>Confirmar exclusão</h2>
        <p className="memorial-form-hint">
          Para retirar sua lembrança do mural, digite novamente o e-mail usado na publicação.
        </p>
        <label htmlFor="memorial-delete-email">Seu e-mail</label>
        <input
          ref={deleteEmailRef}
          id="memorial-delete-email"
          type="email"
          required
          autoComplete="email"
          value={deleteEmail}
          onChange={(event) => setDeleteEmail(event.target.value)}
        />
        <button type="submit" className="memorial-danger" disabled={busy}>
          {busy ? 'Excluindo…' : 'Confirmar exclusão'}
        </button>
        <button
          type="button"
          className="memorial-text-button"
          onClick={() => {
            setMode('edit')
            showStatus('', 'idle')
            setFocusTarget('message')
          }}
        >
          Manter minha lembrança
        </button>
        {statusMessage}
      </form>
    )
  }

  const editing = mode === 'edit'
  return (
    <form
      ref={formRef}
      className="memorial-form-card"
      data-mode={mode}
      aria-busy={busy}
      onSubmit={submitMemory}
    >
      <p className="memorial-form-kicker">{editing ? 'Sua lembrança' : `Olá, ${name}.`}</p>
      <h2>{editing ? 'Edite sua mensagem' : 'O que você guarda da Silvana?'}</h2>
      <label htmlFor="memorial-message">Sua lembrança</label>
      <textarea
        ref={messageRef}
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
        <span aria-live="polite">{message.length}/280</span>
      </div>
      <button type="submit" disabled={busy || !message.trim()}>
        {busy ? (editing ? 'Salvando…' : 'Guardando…') : (editing ? 'Salvar alterações' : 'Guardar no mural')}
      </button>
      {editing && (
        <div className="memorial-form-secondary-actions">
          <button
            className="memorial-delete-toggle"
            type="button"
            onClick={() => {
              setDeleteEmail('')
              showStatus('', 'idle')
              setMode('delete')
              setFocusTarget('deleteEmail')
            }}
          >
            Excluir minha lembrança
          </button>
          {onCancelEdit && (
            <button
              className="memorial-text-button"
              type="button"
              onClick={() => {
                setMode('access')
                setIntent('contribute')
                setActiveNote(null)
                setMessage('')
                onCancelEdit()
                setFocusTarget('email')
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      )}
      {statusMessage}
    </form>
  )
}

export default MemorialAccessForm
