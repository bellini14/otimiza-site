import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { writeMemorialOwnership } from '../lib/memorialOwnership.js'
import SilvanaMemorial from './SilvanaMemorial.jsx'

beforeEach(() => {
  localStorage.clear()
  HTMLElement.prototype.scrollIntoView = vi.fn()
})

afterEach(cleanup)

describe('Silvana memorial page', () => {
  it('renders the isolated tribute, video and read-only board', async () => {
    const api = {
      listNotes: vi.fn().mockResolvedValue({ notes: [], count: 0 }),
      access: vi.fn(),
    }
    render(<SilvanaMemorial api={api} />)
    expect(screen.getByRole('heading', {
      name: 'Silvana Tiburi Bettiol. Hoje é dia dela',
    })).toBeInTheDocument()
    expect(document.querySelector('.memorial-dust-layer')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('region', { name: 'Vídeo em homenagem à Silvana' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Seu e-mail')).not.toBeInTheDocument()
    expect(await screen.findByText(/Ainda não há lembranças publicadas/i)).toBeInTheDocument()
  })

  it('shows a retry state when the first mural request fails', async () => {
    const user = userEvent.setup()
    const api = {
      listNotes: vi.fn()
        .mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValueOnce({ notes: [], count: 0 }),
      access: vi.fn(),
    }
    render(<SilvanaMemorial api={api} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível carregar o mural/i)
    expect(screen.queryByText(/Ainda não há lembranças publicadas/i)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByText(/Ainda não há lembranças publicadas/i)).toBeInTheDocument()
    expect(api.listNotes).toHaveBeenCalledTimes(2)
  })

  it('preserves published notes and reading even with an old ownership receipt', async () => {
    const user = userEvent.setup()
    writeMemorialOwnership({ noteId: 'owned', receipt: 'owned.secret' })
    const api = {
      listNotes: vi.fn().mockResolvedValue({ notes: [{ id: 'owned', message: 'Minha lembrança', name: 'Ana' }], count: 1 }),
      access: vi.fn(), updateNote: vi.fn(), deleteNote: vi.fn(),
    }
    render(<SilvanaMemorial api={api} />)
    expect(await screen.findByText('Minha lembrança')).toBeVisible()
    expect(screen.queryByRole('button', { name: /editar|excluir/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ler lembrança de Ana' }))
    expect(screen.getByRole('dialog', { name: 'Lembrança de Ana' })).toBeVisible()
    expect(api.access).not.toHaveBeenCalled()
    expect(api.updateNote).not.toHaveBeenCalled()
    expect(api.deleteNote).not.toHaveBeenCalled()
  })
})
