import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MemorialBoard from './MemorialBoard.jsx'

afterEach(cleanup)

describe('MemorialBoard', () => {
  it('renders variable notes and only the owned edit action', () => {
    const onEdit = vi.fn()
    render(<MemorialBoard
      notes={[
        { id: 'one', message: 'Curta', name: 'Ana' },
        { id: 'two', message: 'Sem assinatura', name: null },
      ]}
      status="ready"
      ownedNoteId="one"
      onEdit={onEdit}
    />)
    expect(screen.getByText((_, element) => (
      element.classList?.contains('memorial-counter')
    ))).toHaveAccessibleName('2 lembranças guardadas até agora')
    expect(screen.queryByText('Anônimo')).not.toBeInTheDocument()
    const buttons = screen.getAllByRole('button', { name: 'Editar minha lembrança' })
    expect(buttons).toHaveLength(1)
    fireEvent.click(buttons[0])
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'one' }))
  })

  it('shows an initial loading skeleton without the empty invitation', () => {
    const { container } = render(<MemorialBoard notes={[]} status="loading" />)

    expect(container.querySelectorAll('.memorial-note-skeleton')).toHaveLength(3)
    expect(screen.queryByText(/seja a primeira lembrança/i)).not.toBeInTheDocument()
  })

  it('shows a recoverable error instead of an empty mural', () => {
    const onRetry = vi.fn()
    render(<MemorialBoard
      notes={[]}
      status="error"
      error="Não foi possível carregar o mural."
      onRetry={onRetry}
    />)

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o mural.')
    expect(screen.queryByText(/seja a primeira lembrança/i)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('keeps notes visible while refreshing and highlights a changed note', () => {
    render(<MemorialBoard
      notes={[{ id: 'one', message: 'Continua visível', name: null }]}
      status="refreshing"
      highlightedNoteId="one"
    />)

    expect(screen.getByText('Continua visível').closest('article')).toHaveClass('is-highlighted')
    expect(screen.getByRole('status')).toHaveTextContent(/atualizando o mural/i)
    expect(document.querySelector('.memorial-board')).toHaveAttribute('aria-busy', 'true')
  })

  it('opens a complete memory in a focus dialog and returns focus when closed', () => {
    render(<MemorialBoard
      notes={[{ id: 'one', message: 'Uma lembrança longa e especial.', name: 'Ana' }]}
      status="ready"
    />)

    const opener = screen.getByRole('button', { name: 'Ler lembrança de Ana' })
    fireEvent.click(opener)

    expect(screen.getByRole('dialog', { name: 'Lembrança de Ana' }))
      .toHaveTextContent('Uma lembrança longa e especial.')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Lembrança de Ana' })).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })
})
