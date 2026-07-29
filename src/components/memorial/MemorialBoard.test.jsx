import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MemorialBoard from './MemorialBoard.jsx'

describe('MemorialBoard', () => {
  it('renders variable notes and only the owned edit action', () => {
    const onEdit = vi.fn()
    render(<MemorialBoard
      notes={[
        { id: 'one', message: 'Curta', name: 'Ana' },
        { id: 'two', message: 'Sem assinatura', name: null },
      ]}
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
})
