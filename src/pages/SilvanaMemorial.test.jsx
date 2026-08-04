import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SilvanaMemorial from './SilvanaMemorial.jsx'

describe('Silvana memorial page', () => {
  it('renders the isolated tribute, video, access and board', async () => {
    const api = {
      listNotes: vi.fn().mockResolvedValue({ notes: [], count: 0 }),
      access: vi.fn(),
    }
    render(<SilvanaMemorial api={api} />)
    expect(screen.getByRole('heading', {
      name: 'Silvana Tiburi Bettiol. Hoje é dia dela',
    })).toBeInTheDocument()
    expect(document.querySelector('.memorial-dust-layer')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('region', { name: 'Vídeo em homenagem à Silvana' })).toBeInTheDocument()
    expect(screen.getByLabelText('Seu e-mail')).toBeInTheDocument()
    expect(await screen.findByText(/seja a primeira lembrança/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(document.title).toBe('05/08 é aniversário da Silvana')
    })
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'O que Silvana nos ensinou continua vivo em nós. Compartilhe uma lembrança.',
    )
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://otimiza-site.vercel.app/silvana-bettiol',
    )
    expect(document.head.querySelector('meta[property="og:title"]')).toHaveAttribute(
      'content',
      '05/08 é aniversário da Silvana',
    )
    expect(document.head.querySelector('meta[property="og:description"]')).toHaveAttribute(
      'content',
      'O que Silvana nos ensinou continua vivo em nós. Compartilhe uma lembrança.',
    )
    expect(document.head.querySelector('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://otimiza-site.vercel.app/silvana-bettiol',
    )
    expect(document.head.querySelector('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://otimiza-site.vercel.app/media/silvana-aniversario-05-08.png',
    )
    expect(document.head.querySelector('meta[name="twitter:title"]')).toHaveAttribute(
      'content',
      '05/08 é aniversário da Silvana',
    )
    expect(document.head.querySelector('meta[name="twitter:description"]')).toHaveAttribute(
      'content',
      'O que Silvana nos ensinou continua vivo em nós. Compartilhe uma lembrança.',
    )
    expect(document.head.querySelector('meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      'https://otimiza-site.vercel.app/media/silvana-aniversario-05-08.png',
    )
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    )
  })
})
