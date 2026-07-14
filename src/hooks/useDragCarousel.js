import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const DRAG_RESPONSE = 0.96
const RELEASE_VELOCITY = 0.18
const TOUCH_RELEASE_VELOCITY = 0.42
const FLOATING_FRICTION = 0.965
const TOUCH_FLOATING_FRICTION = 0.9
const SNAP_EASE = 0.22
const SNAP_SETTLE_DISTANCE = 0.45
const TOUCH_AXIS_THRESHOLD = 14
const TOUCH_HORIZONTAL_LOCK_RATIO = 1.8
const TOUCH_VERTICAL_LOCK_RATIO = 1.2
const TOUCH_DRAG_DISTANCE_DIVISOR = 4
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

function getTouchDragTranslate(startTranslate, delta, shellWidth, minTranslate) {
  if (shellWidth <= 0 || minTranslate >= 0) return startTranslate + delta
  const carouselDistance = Math.abs(minTranslate)
  const dragProgress = delta / shellWidth

  return startTranslate + (dragProgress * carouselDistance) / TOUCH_DRAG_DISTANCE_DIVISOR
}

export function useDragCarousel({
  snapStep = 0,
  snapOnRelease = false,
  touchMode = 'scaled',
  geometryKey,
} = {}) {
  const shellRef = useRef(null)
  const trackRef = useRef(null)
  const animationRef = useRef(null)
  const hintAnimationRef = useRef(null)
  const reconciliationFrameRef = useRef(null)
  const translateRef = useRef(0)
  const hintPositionRef = useRef({ x: 0, y: 0 })
  const hintTargetRef = useRef({ x: 0, y: 0 })
  const hintReadyRef = useRef(false)
  const dragRef = useRef({
    active: false,
    axis: 'pending',
    pointerType: 'mouse',
    startX: 0,
    startY: 0,
    startTranslate: 0,
    lastDelta: 0,
    lastMove: 0,
  })
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragDirection, setDragDirection] = useState('right')
  const [hintPosition, setHintPosition] = useState({ x: 0, y: 0 })

  useEffect(() => () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    if (hintAnimationRef.current) cancelAnimationFrame(hintAnimationRef.current)
    if (reconciliationFrameRef.current) cancelAnimationFrame(reconciliationFrameRef.current)
  }, [])

  useLayoutEffect(() => {
    if (geometryKey === undefined) return undefined

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (reconciliationFrameRef.current) {
      cancelAnimationFrame(reconciliationFrameRef.current)
    }

    reconciliationFrameRef.current = requestAnimationFrame(() => {
      const shell = shellRef.current
      const track = trackRef.current
      const minTranslate = shell && track
        ? Math.min(0, shell.clientWidth - track.scrollWidth)
        : 0
      const nextTranslate = Math.max(minTranslate, Math.min(0, translateRef.current))

      translateRef.current = nextTranslate
      setTranslateX(nextTranslate)
      reconciliationFrameRef.current = null
    })

    return () => {
      if (reconciliationFrameRef.current) {
        cancelAnimationFrame(reconciliationFrameRef.current)
        reconciliationFrameRef.current = null
      }
    }
  }, [geometryKey])

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

  function getStepSnapTargets(minTranslate) {
    if (snapStep <= 0) return []
    const maxIndex = Math.max(0, Math.ceil(Math.abs(minTranslate) / snapStep))
    return Array.from({ length: maxIndex + 1 }, (_, index) => -index * snapStep)
  }

  function getMeasuredSnapTargets(minTranslate) {
    if (!shellRef.current || !trackRef.current) return []
    const shellCenter = shellRef.current.clientWidth / 2
    const slides = Array.from(trackRef.current.querySelectorAll('[data-carousel-snap-slide="true"]'))

    return slides
      .filter((slide) => slide.offsetWidth > 0)
      .map((slide) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2
        return Math.min(0, Math.max(minTranslate, shellCenter - slideCenter))
      })
  }

  function getSnapTargets(minTranslate) {
    const measuredTargets = getMeasuredSnapTargets(minTranslate)
    if (measuredTargets.length > 0) return measuredTargets
    return getStepSnapTargets(minTranslate)
  }

  function getNearestSnapIndex(targets, current) {
    if (targets.length === 0) return 0
    return targets.reduce((nearestIndex, target, index) => (
      Math.abs(target - current) < Math.abs(targets[nearestIndex] - current) ? index : nearestIndex
    ), 0)
  }

  function getSnapTarget(current, minTranslate) {
    if (!snapOnRelease || snapStep <= 0) return current
    const targets = getSnapTargets(minTranslate)
    if (targets.length === 0) return current
    return targets[getNearestSnapIndex(targets, current)]
  }

  function startInertia(initialVelocity, friction = FLOATING_FRICTION) {
    let velocity = initialVelocity
    let springVelocity = 0

    function startSnapAnimation(target) {
      function snapStepFrame() {
        const current = translateRef.current
        const distance = target - current

        if (Math.abs(distance) < SNAP_SETTLE_DISTANCE) {
          updateTranslate(target)
          animationRef.current = null
          return
        }

        updateTranslate(current + distance * SNAP_EASE)
        animationRef.current = requestAnimationFrame(snapStepFrame)
      }

      animationRef.current = requestAnimationFrame(snapStepFrame)
    }

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
      velocity *= friction
      if (Math.abs(velocity) < 0.18) {
        const snapTarget = getSnapTarget(next, minTranslate)
        if (snapTarget !== next) {
          startSnapAnimation(snapTarget)
          return
        }
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
    const usesDirectTouch = event.pointerType === 'touch' && touchMode === 'direct'
    if (event.pointerType !== 'touch' || usesDirectTouch) {
      event.preventDefault()
    }
    if (reconciliationFrameRef.current) {
      cancelAnimationFrame(reconciliationFrameRef.current)
      reconciliationFrameRef.current = null
    }
    stopInertia()
    updateHintPosition(event)
    dragRef.current = {
      active: true,
      axis: event.pointerType === 'touch' && !usesDirectTouch ? 'pending' : 'horizontal',
      pointerType: event.pointerType || 'mouse',
      startX: event.clientX,
      startY: event.clientY,
      startTranslate: translateRef.current,
      lastDelta: 0,
      lastMove: 0,
    }
    setIsDragging(true)
    if (event.pointerType !== 'touch' || usesDirectTouch) {
      event.currentTarget.setPointerCapture?.(event.pointerId)
    }
  }

  function onPointerMove(event) {
    updateHintPosition(event)
    if (!dragRef.current.active) return
    const delta = event.clientX - dragRef.current.startX
    const verticalDelta = event.clientY - dragRef.current.startY
    if (dragRef.current.pointerType === 'touch' && dragRef.current.axis === 'pending') {
      const absX = Math.abs(delta)
      const absY = Math.abs(verticalDelta)

      if (Math.max(absX, absY) < TOUCH_AXIS_THRESHOLD) return

      if (absY > absX * TOUCH_VERTICAL_LOCK_RATIO) {
        dragRef.current.active = false
        dragRef.current.axis = 'vertical'
        setIsDragging(false)
        event.currentTarget.releasePointerCapture?.(event.pointerId)
        return
      }

      if (absX <= absY * TOUCH_HORIZONTAL_LOCK_RATIO) return

      dragRef.current.axis = 'horizontal'
      event.currentTarget.setPointerCapture?.(event.pointerId)
    }

    event.preventDefault()
    dragRef.current.lastMove = delta - dragRef.current.lastDelta
    dragRef.current.lastDelta = delta
    if (dragRef.current.lastMove > 0.5) setDragDirection('right')
    if (dragRef.current.lastMove < -0.5) setDragDirection('left')
    const minTranslate = getMinTranslate()
    const usesDirectTouch = dragRef.current.pointerType === 'touch' && touchMode === 'direct'
    const nextTranslate = dragRef.current.pointerType === 'touch' && !usesDirectTouch
      ? getTouchDragTranslate(
        dragRef.current.startTranslate,
        delta,
        shellRef.current?.clientWidth ?? 0,
        minTranslate,
      )
      : dragRef.current.startTranslate + delta * DRAG_RESPONSE

    updateTranslate(getElasticTranslate(
      nextTranslate,
      minTranslate,
    ))
  }

  function endDrag(event) {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    setIsDragging(false)
    const usesScaledTouch = dragRef.current.pointerType === 'touch' && touchMode !== 'direct'
    const releaseVelocity = usesScaledTouch ? TOUCH_RELEASE_VELOCITY : RELEASE_VELOCITY
    const friction = usesScaledTouch ? TOUCH_FLOATING_FRICTION : FLOATING_FRICTION
    startInertia(dragRef.current.lastMove * releaseVelocity, friction)
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
