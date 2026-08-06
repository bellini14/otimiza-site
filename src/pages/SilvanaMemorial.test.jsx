import { cleanup, render, screen, waitFor } from '@testing-library/react'
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
  it('renders the isolated tribute, video, access and empty board', async () => {
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
    expect(screen.getByLabelText('Seu e-mail')).toBeInTheDocument()
    expect(await screen.findByText(/seja a primeira lembrança/i)).toBeInTheDocument()
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
    expect(screen.queryByText(/seja a primeira lembrança/i)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByText(/seja a primeira lembrança/i)).toBeInTheDocument()
    expect(api.listNotes).toHaveBeenCalledTimes(2)
  })

  it('keeps the last valid notes visible during a refresh', async () => {
    const user = userEvent.setup()
    let resolveRefresh
    const refresh = new Promise((resolve) => { resolveRefresh = resolve })
    const api = {
      listNotes: vi.fn()
        .mockResolvedValueOnce({
          notes: [{ id: 'old', message: 'Lembrança já guardada', name: null }],
          count: 1,
        })
        .mockReturnValueOnce(refresh),
      access: vi.fn().mockResolvedValue({
        name: 'Ana', hasNote: false, sessionToken: 'token', note: null,
      }),
      publishNote: vi.fn().mockResolvedValue({
        note: { id: 'new', message: 'Nova lembrança', name: null },
        ownershipReceipt: 'new.secret',
      }),
    }
    render(<SilvanaMemorial api={api} />)
    expect(await screen.findByText('Lembrança já guardada')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Seu e-mail'), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: 'Confirmar meu acesso' }))
    await user.type(await screen.findByLabelText('Sua lembrança'), 'Nova lembrança')
    await user.click(screen.getByRole('button', { name: 'Guardar no mural' }))

    expect(screen.getByText('Lembrança já guardada')).toBeInTheDocument()
    expect(await screen.findByText(/atualizando o mural/i)).toBeVisible()

    resolveRefresh({
      notes: [
        { id: 'old', message: 'Lembrança já guardada', name: null },
        { id: 'new', message: 'Nova lembrança', name: null },
      ],
      count: 2,
    })
    const changedMessage = await screen.findByText((content, element) => (
      content === 'Nova lembrança' && element.classList?.contains('memorial-note-message')
    ))
    expect(changedMessage.closest('article')).toHaveClass('is-highlighted')
  })

  it('moves from an owned note edit action to the focused form', async () => {
    const user = userEvent.setup()
    writeMemorialOwnership({ noteId: 'owned', receipt: 'owned.secret' })
    const api = {
      listNotes: vi.fn().mockResolvedValue({
        notes: [{ id: 'owned', message: 'Minha lembrança', name: 'Ana' }],
        count: 1,
      }),
      updateNote: vi.fn(),
    }
    render(<SilvanaMemorial api={api} />)

    await user.click(await screen.findByRole('button', { name: 'Editar minha lembrança' }))

    await waitFor(() => expect(screen.getByLabelText('Sua lembrança')).toHaveFocus())
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('opens footer management in the form and focuses email', async () => {
    const user = userEvent.setup()
    const api = {
      listNotes: vi.fn().mockResolvedValue({ notes: [], count: 0 }),
      access: vi.fn(),
    }
    render(<SilvanaMemorial api={api} />)
    await screen.findByText(/seja a primeira lembrança/i)

    await user.click(screen.getByRole('button', {
      name: 'Gostaria de editar ou excluir minha mensagem?',
    }))

    expect(screen.getByRole('heading', { name: 'Encontre sua lembrança' })).toBeVisible()
    await waitFor(() => expect(screen.getByLabelText('Seu e-mail')).toHaveFocus())
  })
})
