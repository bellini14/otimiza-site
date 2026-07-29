import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MemorialAccessForm from './MemorialAccessForm.jsx'

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
})
