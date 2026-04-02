import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Home from './Home'

describe('Home', () => {
  it('renders the hero with the gradient blinds background', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Decidir melhor agora, porque não?' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Agendar diagnostico' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Conhecer a consultoria' })).toBeInTheDocument()
    const stage = screen.getByTestId('hero-stage')
    expect(screen.getByTestId('hero-gradient-blinds')).toBeInTheDocument()
    expect(stage.querySelector('[data-testid="hero-gradient-blinds"]')).not.toBeNull()
  })
})
