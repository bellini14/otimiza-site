import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const POINTER_OFFSET = 14
const EXIT_DURATION_MS = 110

function hasTouchInput() {
  return typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
}

function findTooltipTarget(target) {
  return target instanceof Element
    ? target.closest('.inspire-shell [data-inspire-tooltip]')
    : null
}

function InspireCursorTooltip() {
  const [tooltip, setTooltip] = useState(null)
  const tooltipRef = useRef(null)
  const exitTimeoutRef = useRef(null)

  useEffect(() => {
    if (hasTouchInput()) return undefined

    function commitTooltip(nextTooltip) {
      tooltipRef.current = nextTooltip
      setTooltip(nextTooltip)
    }

    function cancelExit() {
      if (exitTimeoutRef.current) {
        window.clearTimeout(exitTimeoutRef.current)
        exitTimeoutRef.current = null
      }
    }

    function beginExit(source) {
      const current = tooltipRef.current
      if (current?.source !== source || current.phase === 'exit') return

      const exitingTooltip = { ...current, phase: 'exit' }
      commitTooltip(exitingTooltip)
      cancelExit()
      exitTimeoutRef.current = window.setTimeout(() => {
        if (tooltipRef.current?.phase === 'exit') commitTooltip(null)
        exitTimeoutRef.current = null
      }, EXIT_DURATION_MS)
    }

    function handleMouseMove(event) {
      const target = findTooltipTarget(event.target)

      if (!target) {
        beginExit('pointer')
        return
      }

      cancelExit()
      commitTooltip({
        label: target.dataset.inspireTooltip,
        x: event.clientX + POINTER_OFFSET,
        y: event.clientY + POINTER_OFFSET,
        source: 'pointer',
        phase: 'enter',
      })
    }

    function handleFocusIn(event) {
      const target = findTooltipTarget(event.target)
      if (!target) return

      const rect = target.getBoundingClientRect()
      cancelExit()
      commitTooltip({
        label: target.dataset.inspireTooltip,
        x: rect.left + (rect.width / 2),
        y: rect.bottom + 8,
        source: 'keyboard',
        phase: 'enter',
      })
    }

    function handleFocusOut() {
      beginExit('keyboard')
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      cancelExit()
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [])

  if (!tooltip || !document.body) return null

  return createPortal(
    <span
      className={`inspire-cursor-tooltip inspire-cursor-tooltip--${tooltip.phase}`}
      role="tooltip"
      style={{ transform: `translate3d(${tooltip.x}px, ${tooltip.y}px, 0)` }}
      onAnimationEnd={(event) => {
        if (event.currentTarget.classList.contains('inspire-cursor-tooltip--exit')) {
          if (exitTimeoutRef.current) window.clearTimeout(exitTimeoutRef.current)
          exitTimeoutRef.current = null
          tooltipRef.current = null
          setTooltip(null)
        }
      }}
    >
      {tooltip.label}
    </span>,
    document.body,
  )
}

export default InspireCursorTooltip
