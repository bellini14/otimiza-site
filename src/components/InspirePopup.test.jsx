import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import InspirePopup from './InspirePopup'

const mount = (path = '/') => render(<MemoryRouter initialEntries={[path]}><InspirePopup /></MemoryRouter>)
const engage = () => {
  act(() => vi.advanceTimersByTime(20000))
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
  it('waits for both elapsed time and meaningful scrolling', () => {
    Object.defineProperty(window, 'scrollY', { value: 0 })
    mount()
    engage()
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    Object.defineProperty(window, 'scrollY', { value: 500 })
    fireEvent.scroll(window)
    expect(screen.getByRole('link', { name: /Explorar o Inspire/ })).toHaveAttribute('href', '/inspire')
  })
  it('does not open from scrolling alone', () => {
    mount()
    fireEvent.scroll(window)
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(20000))
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
  it('closes and suppresses after following the CTA', () => {
    mount(); engage()
    fireEvent.click(screen.getByRole('link', { name: /Explorar o Inspire/ }))
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(Number(localStorage.getItem('otimiza:inspire-popup:dismissed-until'))).toBeGreaterThan(Date.now())
  })
  it('remains usable when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    mount(); engage()
    fireEvent.click(screen.getByRole('button', { name: /Fechar convite/ }))
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  })
})
