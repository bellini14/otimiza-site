import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import InspireShareButton from './InspireShareButton'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function setNavigatorProperty(name, value) {
  Object.defineProperty(window.navigator, name, {
    configurable: true,
    value,
  })
}

describe('InspireShareButton', () => {
  it('opens an internal share screen without invoking the device share sheet', () => {
    const share = vi.fn()
    setNavigatorProperty('share', share)

    render(<InspireShareButton title="Gestão sem ruído" url="/inspire/gestao-sem-ruido" />)
    fireEvent.click(screen.getByRole('button', { name: 'Compartilhar' }))

    const dialog = screen.getByRole('dialog', { name: 'Compartilhar artigo' })
    expect(dialog).toBeInTheDocument()
    const whatsappOption = screen.getByRole('link', { name: 'WhatsApp' })
    const linkedinOption = screen.getByRole('link', { name: 'LinkedIn' })
    expect(whatsappOption).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/'),
    )
    expect(whatsappOption.querySelector('[data-brand-icon="whatsapp"]')).not.toBeNull()
    expect(linkedinOption).toHaveAttribute(
      'href',
      expect.stringContaining('linkedin.com/sharing/share-offsite'),
    )
    expect(linkedinOption.querySelector('[data-brand-icon="linkedin"]')).not.toBeNull()
    expect(screen.getByRole('link', { name: 'E-mail' })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:'),
    )
    expect(screen.getByRole('button', { name: 'Copiar link' })).toBeInTheDocument()
    expect(share).not.toHaveBeenCalled()
  })

  it('copies the link from inside the share screen and confirms it visually', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setNavigatorProperty('clipboard', { writeText })

    render(<InspireShareButton title="Gestão sem ruído" url="/inspire/gestao-sem-ruido" />)
    fireEvent.click(screen.getByRole('button', { name: 'Compartilhar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copiar link' }))

    expect(await screen.findByRole('button', { name: 'Link copiado' })).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/inspire/gestao-sem-ruido`,
    )
  })

  it('closes the internal share screen with Escape and restores focus', async () => {
    render(<InspireShareButton title="Gestão sem ruído" url="/inspire/gestao-sem-ruido" />)
    const trigger = screen.getByRole('button', { name: 'Compartilhar' })
    fireEvent.click(trigger)

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Compartilhar artigo' })).not.toBeInTheDocument()
    })
    expect(trigger).toHaveFocus()
  })
})
