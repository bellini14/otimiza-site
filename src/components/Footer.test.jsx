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
    expect(screen.getByRole('contentinfo')).toHaveClass('site-footer', 'bg-[#F7F8FA]')
    expect(screen.getByRole('link', { name: 'Quem somos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'O que fazemos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/otm_consultoria/',
    )
    expect(screen.getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'href',
      'https://www.facebook.com/Otimizaconsultoria',
    )
    expect(screen.getByRole('link', { name: 'YouTube' })).toHaveAttribute(
      'href',
      'https://www.youtube.com/channel/UC8blc6s_gWY5tvWDhW6Y7IA',
    )
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/company/otimiza-consultoria',
    )
    expect(screen.queryByRole('link', { name: 'X' })).not.toBeInTheDocument()
    expect(screen.getByText(new RegExp(`Otimiza\\. All rights reserved\\.`, 'i'))).toBeInTheDocument()
    expect(screen.getByText(/Developed by Studiodesign/i)).toBeInTheDocument()
  })
})
