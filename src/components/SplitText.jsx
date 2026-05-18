import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText as GSAPSplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP)

function getScrollStart(threshold, rootMargin) {
  const startPct = (1 - threshold) * 100
  const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin)
  const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0
  const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px'
  const sign = marginValue === 0
    ? ''
    : marginValue < 0
      ? `-=${Math.abs(marginValue)}${marginUnit}`
      : `+=${marginValue}${marginUnit}`

  return `top ${startPct}%${sign}`
}

function SplitText({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  tag = 'p',
  textAlign = 'center',
  onLetterAnimationComplete,
}) {
  const ref = useRef(null)
  const animationCompletedRef = useRef(false)
  const onCompleteRef = useRef(onLetterAnimationComplete)
  const [fontsLoaded, setFontsLoaded] = useState(() => (
    typeof document === 'undefined' || !document.fonts || document.fonts.status === 'loaded'
  ))

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete
  }, [onLetterAnimationComplete])

  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts || fontsLoaded) {
      return undefined
    }

    let isMounted = true
    document.fonts.ready.then(() => {
      if (isMounted) {
        setFontsLoaded(true)
      }
    })

    return () => {
      isMounted = false
    }
  }, [fontsLoaded])

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded || animationCompletedRef.current) {
        return undefined
      }

      const el = ref.current

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert()
        } catch {
          // GSAP may already have reverted during rapid route transitions.
        }
        el._rbsplitInstance = undefined
      }

      let targets = []
      const assignTargets = (self) => {
        if (splitType.includes('chars') && self.chars?.length) {
          targets = self.chars
        }
        if (!targets.length && splitType.includes('words') && self.words?.length) {
          targets = self.words
        }
        if (!targets.length && splitType.includes('lines') && self.lines?.length) {
          targets = self.lines
        }
        if (!targets.length) {
          targets = self.chars || self.words || self.lines || []
        }
      }

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: (self) => {
          assignTargets(self)

          return gsap.fromTo(
            targets,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              scrollTrigger: {
                trigger: el,
                start: getScrollStart(threshold, rootMargin),
                once: true,
                fastScrollEnd: true,
                anticipatePin: 0.4,
              },
              onComplete: () => {
                animationCompletedRef.current = true
                onCompleteRef.current?.()
              },
              willChange: 'transform, opacity',
              force3D: true,
            },
          )
        },
      })

      el._rbsplitInstance = splitInstance

      return () => {
        ScrollTrigger.getAll().forEach((scrollTrigger) => {
          if (scrollTrigger.trigger === el) {
            scrollTrigger.kill()
          }
        })
        try {
          splitInstance.revert()
        } catch {
          // SplitText can be reverted by GSAP before React unmount cleanup.
        }
        el._rbsplitInstance = undefined
      }
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
      ],
      scope: ref,
    },
  )

  const Tag = tag || 'p'

  return (
    <Tag
      ref={ref}
      style={{
        textAlign,
        wordWrap: 'break-word',
        willChange: 'transform, opacity',
      }}
      className={`split-parent overflow-hidden inline-block whitespace-normal ${className}`.trim()}
    >
      {text}
    </Tag>
  )
}

export default SplitText
