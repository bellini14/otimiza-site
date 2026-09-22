import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TurnstileChallenge from './TurnstileChallenge'
import { useFormSecurity } from '../hooks/useFormSecurity'
import { loadTurnstile } from '../lib/turnstile'
vi.mock('../lib/turnstile', () => ({ loadTurnstile: vi.fn() }))
let api, callbacks
function Form() {
  const security = useFormSecurity()
  return <><TurnstileChallenge action="contact" onToken={security.setToken} ref={security.challengeRef} /><button disabled={!security.token} onClick={security.reset}>Enviar teste</button></>
}
beforeEach(() => {
  vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'public-site-key')
  api = { render: vi.fn((_container, options) => { callbacks = options; return 'widget-1' }), reset: vi.fn(), remove: vi.fn() }
  loadTurnstile.mockResolvedValue(api)
})
afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.clearAllMocks() })
describe('Turnstile lifecycle', () => {
  it('enables only after verification and resets single-use token after submission', async () => {
    render(<Form />)
    expect(screen.getByRole('button', { name: 'Enviar teste' })).toBeDisabled()
    await waitFor(() => expect(api.render).toHaveBeenCalledTimes(1))
    expect(callbacks).toMatchObject({ action: 'contact', sitekey: 'public-site-key', 'response-field': false })
    act(() => callbacks.callback('verified'))
    expect(screen.getByRole('button', { name: 'Enviar teste' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Enviar teste' }))
    expect(api.reset).toHaveBeenCalledWith('widget-1')
    expect(screen.getByRole('button', { name: 'Enviar teste' })).toBeDisabled()
    act(() => callbacks.callback('fresh'))
    act(() => callbacks['expired-callback']())
    expect(screen.getByRole('button', { name: 'Enviar teste' })).toBeDisabled()
  })
  it('allows retry after script failure and removes widget on unmount', async () => {
    loadTurnstile.mockRejectedValueOnce(new Error('blocked'))
    const view = render(<Form />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar')
    fireEvent.click(screen.getByRole('button', { name: 'Tentar verificação novamente' }))
    await waitFor(() => expect(api.render).toHaveBeenCalledTimes(1))
    view.unmount()
    expect(api.remove).toHaveBeenCalledWith('widget-1')
  })
  it('displays unavailable state without falling back to test keys', () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '')
    render(<Form />)
    expect(screen.getByRole('status')).toHaveTextContent('Envio temporariamente indisponível')
    expect(screen.getByRole('button', { name: 'Enviar teste' })).toBeDisabled()
    expect(loadTurnstile).not.toHaveBeenCalled()
  })
})
