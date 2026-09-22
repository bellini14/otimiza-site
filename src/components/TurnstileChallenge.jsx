import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { loadTurnstile } from '../lib/turnstile'

export default function TurnstileChallenge({ action, onToken, ref }) {
  const container = useRef(null)
  const widget = useRef(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim()
  useImperativeHandle(ref, () => ({
    reset() {
      onToken('')
      if (widget.current) {
        setError('')
        widget.current.api.reset(widget.current.id)
      }
    },
  }), [onToken])
  useEffect(() => {
    if (!sitekey) return undefined
    let active = true
    let current
    loadTurnstile().then((api) => {
      if (!active) return
      const id = api.render(container.current, {
        sitekey, action, theme: 'light', size: 'flexible', language: 'pt-br',
        'response-field': false,
        callback(token) { if (active) { setError(''); onToken(token) } },
        'expired-callback'() { if (active) onToken('') },
        'timeout-callback'() { if (active) { onToken(''); setError('A verificação expirou. Tente novamente.') } },
        'error-callback'() {
          if (active) { onToken(''); setError('Não foi possível verificar a segurança. Tente novamente.') }
          return true
        },
      })
      current = { api, id }
      widget.current = current
    }).catch(() => {
      if (active) { onToken(''); setError('Não foi possível carregar a verificação de segurança. Verifique sua conexão e tente novamente.') }
    })
    return () => {
      active = false
      if (current) current.api.remove(current.id)
      widget.current = null
      onToken('')
    }
  }, [sitekey, action, attempt, onToken])
  return (
    <div className="form-security" style={{ width: '100%', minWidth: 0, marginBlock: '0.75rem' }}>
      <div ref={container} />
      {!sitekey ? <p role="status">Envio temporariamente indisponível. Entre em contato pelo e-mail otm@otm.com.br.</p> : null}
      {error ? <div role="alert">
        <p>{error}</p>
        <button type="button" onClick={() => { setError(''); onToken(''); setAttempt((value) => value + 1) }}>
          Tentar verificação novamente
        </button>
      </div> : null}
    </div>
  )
}
