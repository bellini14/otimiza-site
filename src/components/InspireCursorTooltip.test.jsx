import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import InspireCursorTooltip from './InspireCursorTooltip'

const originalMaxTouchPointsDescriptor = Object.getOwnPropertyDescriptor(navigator, 'maxTouchPoints')

function setMaxTouchPoints(value) {
  Object.defineProperty(navigator, 'maxTouchPoints', {
    configurable: true,
    value,
  })
}

function renderTooltipTarget() {
  render(
    <div className="inspire-shell">
      <button type="button" data-inspire-tooltip="Ação Inspire">
        Ação
      </button>
      <InspireCursorTooltip />
    </div>,
  )

  return screen.getByRole('button', { name: 'Ação' })
}

afterEach(() => {
  cleanup()

  if (originalMaxTouchPointsDescriptor) {
    Object.defineProperty(navigator, 'maxTouchPoints', originalMaxTouchPointsDescriptor)
  } else {
    delete navigator.maxTouchPoints
  }
})

describe('InspireCursorTooltip', () => {
  it('does not render on touch-capable devices', () => {
    setMaxTouchPoints(1)
    const target = renderTooltipTarget()

    fireEvent.mouseMove(target, { clientX: 120, clientY: 80 })
    fireEvent.focusIn(target)

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('renders at the pointer position on non-touch devices', () => {
    setMaxTouchPoints(0)
    const target = renderTooltipTarget()

    fireEvent.mouseMove(target, { clientX: 120, clientY: 80 })

    expect(screen.getByRole('tooltip')).toHaveTextContent('Ação Inspire')
    expect(screen.getByRole('tooltip')).toHaveStyle({
      transform: 'translate3d(134px, 94px, 0)',
    })
  })

  it('renders from keyboard focus on non-touch devices', () => {
    setMaxTouchPoints(0)
    const target = renderTooltipTarget()

    fireEvent.focusIn(target)

    expect(screen.getByRole('tooltip')).toHaveTextContent('Ação Inspire')
  })
})
