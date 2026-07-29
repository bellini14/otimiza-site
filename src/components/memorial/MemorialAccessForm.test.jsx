import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MemorialAccessForm from './MemorialAccessForm.jsx'

afterEach(cleanup)

describe('MemorialAccessForm', () => {
  it('unlocks the message only after email validation', async () => {
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
    expect(screen.getByLabelText('Quero que meu nome apareça')).toBeChecked()
  })

  it('requires a freshly typed email before deletion', async () => {
    const user = userEvent.setup()
    const api = {
      updateNote: vi.fn(),
      deleteNote: vi.fn(),
    }
    render(<MemorialAccessForm
      api={api}
      editingNote={{ id: 'one', message: 'Texto', name: 'Ana' }}
      ownership={{ noteId: 'one', receipt: 'one.secret' }}
      onChanged={vi.fn()}
    />)
    await user.click(screen.getByRole('button', { name: 'Excluir minha lembrança' }))
    expect(screen.getByLabelText('Seu e-mail')).toHaveValue('')
  })

  it('uses a valid management session instead of an unrelated browser receipt', async () => {
    const user = userEvent.setup()
    const api = {
      access: vi.fn().mockResolvedValue({
        name: 'Bia',
        hasNote: true,
        sessionToken: 'manage-bia',
        note: { id: 'bia-note', message: 'Original', name: 'Bia' },
      }),
      updateNote: vi.fn().mockResolvedValue({}),
    }
    render(<MemorialAccessForm
      api={api}
      ownership={{ noteId: 'ana-note', receipt: 'ana.receipt' }}
      initialIntent="manage"
      onChanged={vi.fn()}
    />)
    await user.type(screen.getByLabelText('Seu e-mail'), 'bia@example.com')
    await user.click(screen.getByRole('button', { name: 'Confirmar meu acesso' }))
    await user.clear(await screen.findByLabelText('Sua lembrança'))
    await user.type(screen.getByLabelText('Sua lembrança'), 'Atualizada')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(api.updateNote).toHaveBeenCalledWith(expect.objectContaining({
      authorization: 'manage-bia',
    }))
  })
})
