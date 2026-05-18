import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import Footer from './Footer'

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  )
}

describe('Footer', () => {
  beforeEach(() => {
    cleanup()
  })

  it('renders the simplified footer with centered brand, menu, social links and credits', () => {
    renderFooter()

    expect(screen.getByRole('img', { name: 'Otimiza' })).toBeInTheDocument()
    expect(screen.getByTestId('footer-backdrop')).toBeInTheDocument()
    expect(screen.getByTestId('footer-backdrop').querySelector('img')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toHaveClass('bg-[#F7F8FA]')
    expect(screen.getByRole('link', { name: 'Quem somos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'O que fazemos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Instagram' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'X' })).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`Otimiza\\. All rights reserved\\.`, 'i'))).toBeInTheDocument()
    expect(screen.getByText(/Developed by Studiodesign/i)).toBeInTheDocument()
  })
})
