import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PrivacyPolicy from './PrivacyPolicy'

describe('PrivacyPolicy', () => {
  it('explains controller, RD Station, consent, rights and revocation', () => {
    render(<PrivacyPolicy />)
    expect(screen.getByRole('heading', { level: 1, name: 'Política de Privacidade' })).toBeInTheDocument()
    expect(screen.getByText(/RD Station Marketing/i)).toBeInTheDocument()
    expect(screen.getByText(/revogar.*consentimento/i)).toBeInTheDocument()
    expect(screen.getByText(/direitos do titular/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'otm@otm.com.br' })).toHaveAttribute('href', 'mailto:otm@otm.com.br')
  })
})
