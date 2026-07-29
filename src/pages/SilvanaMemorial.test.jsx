import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SilvanaMemorial from './SilvanaMemorial.jsx'

describe('Silvana memorial page', () => {
  it('renders the isolated tribute, video, access and board', async () => {
    const api = {
      listNotes: vi.fn().mockResolvedValue({ notes: [], count: 0 }),
      access: vi.fn(),
    }
    render(<SilvanaMemorial api={api} />)
    expect(screen.getByRole('heading', { name: 'Silvana, hoje é o seu dia.' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Vídeo em homenagem à Silvana' })).toBeInTheDocument()
    expect(screen.getByLabelText('Seu e-mail')).toBeInTheDocument()
    expect(await screen.findByText(/seja a primeira lembrança/i)).toBeInTheDocument()
  })
})
