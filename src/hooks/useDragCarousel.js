import { useEffect, useRef, useState } from 'react'

const DRAG_RESPONSE = 0.96
const RELEASE_VELOCITY = 0.18
const FLOATING_FRICTION = 0.965
const EDGE_MAX_BOUNCE = 92
const EDGE_RESISTANCE = 250
const EDGE_SPRING = 0.16
const EDGE_DAMPING = 0.6

function getElasticTranslate(translateX, minTranslateX) {
  if (translateX > 0) {
    return EDGE_MAX_BOUNCE * (1 - Math.exp(-translateX / EDGE_RESISTANCE))
  }
  if (translateX < minTranslateX) {
    const overflow = minTranslateX - translateX
    return minTranslateX - EDGE_MAX_BOUNCE * (1 - Math.exp(-overflow / EDGE_RESISTANCE))
  }
  return translateX
}

export function useDragCarousel() {
  const shellRef = useRef(null)
  const trackRef = useRef(null)
  const animationRef = useRef(null)
  const hintAnimationRef = useRef(null)
  const translateRef = useRef(0)
  const hintPositionRef = useRef({ x: 0, y: 0 })
  const hintTargetRef = useRef({ x: 0, y: 0 })
  const hintReadyRef = useRef(false)
  const dragRef = useRef({ active: false, startX: 0, startTranslate: 0, lastDelta: 0, lastMove: 0 })
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragDirection, setDragDirection] = useState('right')
  const [hintPosition, setHintPosition] = useState({ x: 0, y: 0 })

  useEffect(() => () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    if (hintAnimationRef.current) cancelAnimationFrame(hintAnimationRef.current)
  }, [])

  function updateTranslate(next) {
    translateRef.current = next
    setTranslateX(next)
  }

  function getMinTranslate() {
    if (!shellRef.current || !trackRef.current) return 0
    return Math.min(0, shellRef.current.clientWidth - trackRef.current.scrollWidth)
  }

  function stopInertia() {
    if (!animationRef.current) return
    cancelAnimationFrame(animationRef.current)
    animationRef.current = null
  }

  function startInertia(initialVelocity) {
    let velocity = initialVelocity
    let springVelocity = 0

    function step() {
      const minTranslate = getMinTranslate()
      const current = translateRef.current
      const edgeTarget = current > 0 ? 0 : current < minTranslate ? minTranslate : null

      if (edgeTarget !== null) {
        const distance = edgeTarget - current
        springVelocity = (springVelocity + distance * EDGE_SPRING) * EDGE_DAMPING
        if (Math.abs(distance) < 0.8 && Math.abs(springVelocity) < 0.1) {
          updateTranslate(edgeTarget)
          animationRef.current = null
          return
        }
        updateTranslate(current + springVelocity)
        animationRef.current = requestAnimationFrame(step)
        return
      }

      const next = current + velocity
      if (next > 0 || next < minTranslate) {
        updateTranslate(getElasticTranslate(next, minTranslate))
        velocity = 0
        animationRef.current = requestAnimationFrame(step)
        return
      }

      updateTranslate(next)
      velocity *= FLOATING_FRICTION
      if (Math.abs(velocity) < 0.18) {
        animationRef.current = null
        return
      }
      animationRef.current = requestAnimationFrame(step)
    }

    stopInertia()
    animationRef.current = requestAnimationFrame(step)
  }

  function updateHintPosition(event) {
    const shellRect = shellRef.current?.getBoundingClientRect()
    const target = {
      x: shellRect ? event.clientX - shellRect.left + 14 : event.clientX + 14,
      y: shellRect ? event.clientY - shellRect.top + 12 : event.clientY + 12,
    }
    hintTargetRef.current = target
    if (!hintReadyRef.current) {
      hintReadyRef.current = true
      hintPositionRef.current = target
      setHintPosition(target)
      return
    }
    if (hintAnimationRef.current) return

    function step() {
      const current = hintPositionRef.current
      const next = {
        x: current.x + (hintTargetRef.current.x - current.x) * 0.18,
        y: current.y + (hintTargetRef.current.y - current.y) * 0.18,
      }
      hintPositionRef.current = next
      setHintPosition(next)
      if (Math.abs(hintTargetRef.current.x - next.x) < 0.4 && Math.abs(hintTargetRef.current.y - next.y) < 0.4) {
        hintPositionRef.current = hintTargetRef.current
        setHintPosition(hintTargetRef.current)
        hintAnimationRef.current = null
        return
      }
      hintAnimationRef.current = requestAnimationFrame(step)
    }
    hintAnimationRef.current = requestAnimationFrame(step)
  }

  function onPointerDown(event) {
    if (event.target instanceof Element && event.target.closest('a, button, input, textarea, select, [role="button"]')) return
    event.preventDefault()
    stopInertia()
    updateHintPosition(event)
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startTranslate: translateRef.current,
      lastDelta: 0,
      lastMove: 0,
    }
    setIsDragging(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function onPointerMove(event) {
    updateHintPosition(event)
    if (!dragRef.current.active) return
    event.preventDefault()
    const delta = event.clientX - dragRef.current.startX
    dragRef.current.lastMove = delta - dragRef.current.lastDelta
    dragRef.current.lastDelta = delta
    if (dragRef.current.lastMove > 0.5) setDragDirection('right')
    if (dragRef.current.lastMove < -0.5) setDragDirection('left')
    updateTranslate(getElasticTranslate(
      dragRef.current.startTranslate + delta * DRAG_RESPONSE,
      getMinTranslate(),
    ))
  }

  function endDrag(event) {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    setIsDragging(false)
    startInertia(dragRef.current.lastMove * RELEASE_VELOCITY)
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }

  return {
    shellRef,
    trackRef,
    translateX,
    isDragging,
    dragDirection,
    hintPosition,
    updateHintPosition,
    trackHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  }
}
