vi.mock('../hooks/useFormSecurity', () => ({ useFormSecurity: () => ({ token: 'test-token', setToken: vi.fn(), reset: vi.fn(), challengeRef: { current: null } }) }))
vi.mock('./TurnstileChallenge', () => ({ default: () => null }))
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import InspirePopup from './InspirePopup'

const mount = (path = '/') => render(<MemoryRouter initialEntries={[path]}><InspirePopup /></MemoryRouter>)
const engage = () => {
  act(() => vi.advanceTimersByTime(8000))
  fireEvent.scroll(window)
}
beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  sessionStorage.clear()
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 500 })
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers() })

describe('InspirePopup', () => {
  it('opens at eight seconds after reaching fifteen percent of the page', () => {
    Object.defineProperty(window, 'scrollY', { value: 180 })
    mount()
    fireEvent.scroll(window)
    act(() => vi.advanceTimersByTime(7999))
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(1))
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })
  it('waits for both elapsed time and meaningful scrolling', () => {
    Object.defineProperty(window, 'scrollY', { value: 0 })
    mount()
    engage()
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    Object.defineProperty(window, 'scrollY', { value: 500 })
    fireEvent.scroll(window)
    expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveAttribute('type', 'email')
  })
  it('does not open from scrolling alone', () => {
    mount()
    fireEvent.scroll(window)
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(8000))
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })
  it.each(['/inspire', '/inspire/artigo', '/2026/09/15/artigo', '/contato', '/politica-de-privacidade', '/silvana-bettiol', '/inexistente'])('does not interrupt %s', (path) => {
    mount(path)
    engage()
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  })
  it('closes with Escape and respects the seven-day cooldown in a new session', () => {
    mount(); engage()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    cleanup(); sessionStorage.clear(); mount(); engage()
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    cleanup(); vi.setSystemTime(Date.now() + 8 * 86400000); mount(); engage()
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })
  it('dismisses with the close button', () => {
    mount(); engage()
    fireEvent.click(screen.getByRole('button', { name: /Fechar convite/ }))
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  })
  it('suppresses repeat impressions in the same session', () => {
    mount(); engage(); cleanup(); mount(); engage()
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  })
  it('submits only email with the popup source and suppresses after success', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ message: 'Inscrição confirmada.' }) })
    mount(); engage()
    fireEvent.change(screen.getByRole('textbox', { name: 'E-mail' }), { target: { value: 'reader@example.com' } })
    await act(async () => { fireEvent.submit(screen.getByRole('button', { name: 'QUERO PARTICIPAR' }).closest('form')) })
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ turnstileToken: 'test-token', email: 'reader@example.com', consent: true, source: 'inspire-popup', company: '' })
    expect(screen.getByRole('status')).toHaveTextContent('Inscrição confirmada.')
    expect(Number(localStorage.getItem('otimiza:inspire-popup:dismissed-until'))).toBeGreaterThan(Date.now())
  })
  it('remains usable when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    mount(); engage()
    fireEvent.click(screen.getByRole('button', { name: /Fechar convite/ }))
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  })
  it('keeps the email and allows retry after a provider error', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, json: async () => ({ error: 'Tente novamente.' }) })
    mount(); engage()
    fireEvent.change(screen.getByRole('textbox', { name: 'E-mail' }), { target: { value: 'reader@example.com' } })
    await act(async () => { fireEvent.submit(screen.getByRole('form')) })
    expect(screen.getByRole('alert')).toHaveTextContent('Tente novamente.')
    expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveValue('reader@example.com')
    expect(screen.getByRole('button', { name: 'QUERO PARTICIPAR' })).toBeEnabled()
    expect(localStorage.getItem('otimiza:inspire-popup:dismissed-until')).toBeNull()
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) })
    await act(async () => { fireEvent.submit(screen.getByRole('form')) })
    expect(screen.getByRole('status')).toHaveTextContent('Inscrição confirmada')
  })
  it('blocks duplicate submissions while waiting', async () => {
    let resolve
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise((done) => { resolve = done }))
    mount(); engage()
    fireEvent.change(screen.getByRole('textbox', { name: 'E-mail' }), { target: { value: 'reader@example.com' } })
    fireEvent.submit(screen.getByRole('form'))
    fireEvent.submit(screen.getByRole('form'))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Assinando…' })).toBeDisabled()
    await act(async () => { resolve({ ok: true, json: async () => ({}) }) })
  })
})
