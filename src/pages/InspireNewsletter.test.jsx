import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import InspireLayout from '../components/InspireLayout'

vi.mock('../components/Threads', () => ({
  default: ({ color, amplitude, distance, enableMouseInteraction, ...props }) => (
    <div
      data-testid="threads-background"
      data-color={JSON.stringify(color)}
      data-amplitude={String(amplitude)}
      data-distance={String(distance)}
      data-mouse={String(enableMouseInteraction)}
      {...props}
    />
  ),
}))

function renderLayout(initialEntry = '/inspire/newsletter') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<InspireLayout />}>
          <Route path="/inspire/newsletter" element={<div>Newsletter</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  cleanup()
})

describe('Inspire newsletter CTA', () => {
  it('uses the newsletter label and icon in the topbar app pill', () => {
    renderLayout()

    const cta = screen.getByRole('link', { name: 'Assinar newsletter' })

    expect(cta).toHaveAttribute('href', '/inspire/newsletter')
    expect(cta).toHaveAttribute('data-inspire-tooltip', 'Assinar newsletter')
    expect(cta.querySelector('.lucide-mail')).not.toBeNull()
  })

  it('keeps the tooltip attached to the mouse position', async () => {
    renderLayout()

    const backButton = screen.getByRole('button', { name: /voltar para a p.+gina anterior/i })
    fireEvent.mouseMove(backButton, { clientX: 120, clientY: 80 })

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('Voltar')
    expect(tooltip).toHaveStyle({ transform: 'translate3d(134px, 94px, 0)' })
    expect(tooltip).toHaveClass('inspire-cursor-tooltip--enter')

    fireEvent.mouseMove(document.body, { clientX: 200, clientY: 160 })
    expect(tooltip).toHaveClass('inspire-cursor-tooltip--exit')
    expect(tooltip).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  it('renders the newsletter page with a name and email form on the app route', async () => {
    window.history.pushState({}, '', '/inspire/newsletter')

    render(<App />)

    const threads = await screen.findByTestId('threads-background')

    expect(threads).toBeInTheDocument()
    expect(threads).toHaveAttribute('data-color', '[0,0,0]')
    expect(threads).toHaveAttribute('data-mouse', 'true')
    expect(document.querySelector('.inspire-newsletter__threads-layer--top')).not.toBeNull()
    expect(document.querySelector('.inspire-newsletter__threads-layer--interactive')).not.toBeNull()
    expect(document.querySelector('.inspire-newsletter__threads-layer--overscan')).not.toBeNull()
    expect(document.querySelector('.inspire-newsletter__threads-stage')).not.toBeNull()
    expect(document.querySelector('.inspire-newsletter__panel')).toBeNull()
    expect(document.querySelector('.inspire-newsletter__content')).not.toBeNull()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Assinar newsletter' })).toHaveAttribute('data-inspire-tooltip', 'Assinar newsletter')
  })
})
