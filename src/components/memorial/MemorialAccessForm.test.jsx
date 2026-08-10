import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MemorialAccessForm from './MemorialAccessForm.jsx'

beforeEach(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn()
})

afterEach(cleanup)

describe('MemorialAccessForm', () => {
  it('unlocks and focuses the message only after email validation', async () => {
    const user = userEvent.setup()
    const api = {
      access: vi.fn().mockResolvedValue({
        name: 'Ana', hasNote: false, sessionToken: 'token', note: null,
      }),
      publishNote: vi.fn(),
    }
    render(<MemorialAccessForm api={api} onChanged={vi.fn()} />)
    expect(screen.queryByLabelText('Sua lembrança')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('Seu e-mail'), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: 'Confirmar meu acesso' }))
    expect(await screen.findByText('Olá, Ana.')).toBeInTheDocument()
    expect(screen.getByLabelText('Sua lembrança')).toHaveAttribute('maxlength', '280')
    await waitFor(() => expect(screen.getByLabelText('Sua lembrança')).toHaveFocus())
    expect(screen.getByLabelText('Quero que meu nome apareça')).toBeChecked()
  })

  it('renders deletion as a distinct confirmation panel', async () => {
    const user = userEvent.setup()
    render(<MemorialAccessForm
      api={{ updateNote: vi.fn(), deleteNote: vi.fn() }}
      editingNote={{ id: 'one', message: 'Texto', name: 'Ana' }}
      ownership={{ noteId: 'one', receipt: 'one.secret' }}
      onChanged={vi.fn()}
    />)

    await user.click(screen.getByRole('button', { name: 'Excluir minha lembrança' }))

    expect(screen.getByRole('heading', { name: 'Confirmar exclusão' })).toBeVisible()
    expect(screen.getByLabelText('Seu e-mail')).toHaveValue('')
    await waitFor(() => expect(screen.getByLabelText('Seu e-mail')).toHaveFocus())
    expect(screen.queryByLabelText('Sua lembrança')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Guardar no mural' })).not.toBeInTheDocument()
  })

  it('cancels deletion without losing the draft', async () => {
    const user = userEvent.setup()
    render(<MemorialAccessForm
      api={{ updateNote: vi.fn(), deleteNote: vi.fn() }}
      editingNote={{ id: 'one', message: 'Texto preservado', name: 'Ana' }}
      ownership={{ noteId: 'one', receipt: 'one.secret' }}
      onChanged={vi.fn()}
    />)
    await user.click(screen.getByRole('button', { name: 'Excluir minha lembrança' }))
    await user.click(screen.getByRole('button', { name: 'Manter minha lembrança' }))

    expect(screen.getByLabelText('Sua lembrança')).toHaveValue('Texto preservado')
  })

  it('uses a valid management session instead of an unrelated browser receipt', async () => {
    const user = userEvent.setup()
    const onChanged = vi.fn()
    const api = {
      access: vi.fn().mockResolvedValue({
        name: 'Bia',
        hasNote: true,
        sessionToken: 'manage-bia',
        note: { id: 'bia-note', message: 'Original', name: 'Bia' },
      }),
      updateNote: vi.fn().mockResolvedValue({ note: { id: 'bia-note' } }),
    }
    render(<MemorialAccessForm
      api={api}
      ownership={{ noteId: 'ana-note', receipt: 'ana.receipt' }}
      initialIntent="manage"
      onChanged={onChanged}
    />)
    await user.type(screen.getByLabelText('Seu e-mail'), 'bia@example.com')
    await user.click(screen.getByRole('button', { name: 'Confirmar meu acesso' }))
    await user.clear(await screen.findByLabelText('Sua lembrança'))
    await user.type(screen.getByLabelText('Sua lembrança'), 'Atualizada')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(api.updateNote).toHaveBeenCalledWith(expect.objectContaining({
      authorization: 'manage-bia',
    }))
    expect(onChanged).toHaveBeenCalledWith({ type: 'updated', noteId: 'bia-note' })
  })

  it('publishes anonymously and returns ownership plus the changed note id', async () => {
    const user = userEvent.setup()
    const onChanged = vi.fn()
    const api = {
      access: vi.fn().mockResolvedValue({
        name: 'Ana', hasNote: false, sessionToken: 'token', note: null,
      }),
      publishNote: vi.fn().mockResolvedValue({
        note: { id: 'new-note', message: 'Com carinho', name: null },
        ownershipReceipt: 'new-note.secret',
      }),
    }
    render(<MemorialAccessForm api={api} onChanged={onChanged} />)
    await user.type(screen.getByLabelText('Seu e-mail'), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: 'Confirmar meu acesso' }))
    await user.type(await screen.findByLabelText('Sua lembrança'), 'Com carinho')
    await user.click(screen.getByLabelText('Quero que meu nome apareça'))
    await user.click(screen.getByRole('button', { name: 'Guardar no mural' }))

    expect(api.publishNote).toHaveBeenCalledWith(expect.objectContaining({ showName: false }))
    expect(onChanged).toHaveBeenCalledWith({
      type: 'created',
      noteId: 'new-note',
      ownership: { noteId: 'new-note', receipt: 'new-note.secret' },
    })
  })

  it('preserves an edit draft when SESSION_INVALID requires access again', async () => {
    const user = userEvent.setup()
    const sessionError = Object.assign(new Error('Sessão expirada'), { code: 'SESSION_INVALID' })
    const api = {
      updateNote: vi.fn().mockRejectedValueOnce(sessionError).mockResolvedValueOnce({
        note: { id: 'one' },
      }),
      access: vi.fn().mockResolvedValue({
        name: 'Ana',
        hasNote: true,
        sessionToken: 'fresh-token',
        note: { id: 'one', message: 'Original', name: 'Ana' },
      }),
    }
    render(<MemorialAccessForm
      api={api}
      editingNote={{ id: 'one', message: 'Original', name: 'Ana' }}
      ownership={null}
      onChanged={vi.fn()}
    />)
    await user.clear(screen.getByLabelText('Sua lembrança'))
    await user.type(screen.getByLabelText('Sua lembrança'), 'Meu rascunho')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/texto foi preservado/i)
    await user.type(screen.getByLabelText('Seu e-mail'), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: 'Confirmar meu acesso' }))

    expect(await screen.findByLabelText('Sua lembrança')).toHaveValue('Meu rascunho')
  })

  it('responds to a footer management focus request without global selectors', async () => {
    const { rerender } = render(<MemorialAccessForm
      api={{ access: vi.fn() }}
      onChanged={vi.fn()}
      focusRequest={null}
    />)

    rerender(<MemorialAccessForm
      api={{ access: vi.fn() }}
      onChanged={vi.fn()}
      focusRequest={{ id: 1, type: 'manage' }}
    />)

    expect(await screen.findByRole('heading', { name: 'Encontre sua lembrança' })).toBeVisible()
    await waitFor(() => expect(screen.getByLabelText('Seu e-mail')).toHaveFocus())
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    })
  })
})
