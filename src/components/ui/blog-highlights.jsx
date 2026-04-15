import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { ProjectCard } from './project-card'
import { client } from '@/lib/sanity'
import { staticBlogPosts } from '../../data/blogPosts'



const CAROUSEL_ANIMATION_MS = 340
const CAROUSEL_UNLOCK_FALLBACK_MS = CAROUSEL_ANIMATION_MS + 120
const STAGE_GAP_PX = 24

export function BlogHighlights() {
  const [sectionRef, isVisible] = useScrollReveal(0.1)
  const [blogPosts, setBlogPosts] = useState(staticBlogPosts)
  const [displayIndex, setDisplayIndex] = useState(0)
  const [slidesPerView, setSlidesPerView] = useState(getSlidesPerView())
  const [isAnimating, setIsAnimating] = useState(false)
  const prefersReducedMotion = useReducedMotionPreference()
  const unlockTimeoutRef = useRef(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const query = `*[_type == "post"] | order(publishedAt desc) [0...10] {
          title,
          description,
          "imgSrc": mainImage.asset->url,
          "link": "/inspire/" + slug.current,
          eyebrow,
          "linkText": "Ler artigo"
        }`
        const dynamicPosts = await client.fetch(query)
        if (dynamicPosts && dynamicPosts.length > 0) {
          setBlogPosts(dynamicPosts)
        }
      } catch (error) {
        console.error('Error fetching posts from Sanity:', error)
      }
    }
    fetchPosts()
  }, [])

  const maxIndex = Math.max(blogPosts.length - slidesPerView, 0)
  const currentIndex = Math.min(displayIndex, maxIndex)
  const visiblePosts = blogPosts.slice(currentIndex, currentIndex + slidesPerView)

  useEffect(() => {
    function handleResize() {
      setSlidesPerView(getSlidesPerView())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    return () => {
      clearUnlockFallback(unlockTimeoutRef)
    }
  }, [])

  function handlePrevious() {
    moveToIndex(currentIndex - 1)
  }

  function handleNext() {
    moveToIndex(currentIndex + 1)
  }

  function moveToIndex(nextIndex) {
    if (isAnimating) {
      return
    }

    const clampedIndex = Math.min(Math.max(nextIndex, 0), maxIndex)

    if (clampedIndex === currentIndex) {
      return
    }

    setDisplayIndex(clampedIndex)

    if (prefersReducedMotion) {
      return
    }

    setIsAnimating(true)
    clearUnlockFallback(unlockTimeoutRef)
    unlockTimeoutRef.current = window.setTimeout(() => {
      setIsAnimating(false)
    }, CAROUSEL_UNLOCK_FALLBACK_MS)
  }

  function handleTrackTransitionEnd(event) {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') {
      return
    }

    clearUnlockFallback(unlockTimeoutRef)
    setIsAnimating(false)
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-[100vw] left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#EFEFF4] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-8 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p
              className={cn(
                'mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600',
                isVisible ? 'animate-enter' : 'opacity-0',
              )}
            >
              Inspire
            </p>
            <h2
              className={cn(
                'max-w-2xl font-display text-4xl text-slate-900 sm:text-5xl lg:text-6xl',
                isVisible ? 'animate-enter' : 'opacity-0',
                '[animation-delay:150ms]',
              )}
            >
              Inspire para quem opera no longo prazo
            </h2>
          </div>

          <div
            className={cn(
              'flex items-center justify-between gap-4 lg:min-w-[22rem] lg:justify-end',
              isVisible ? 'animate-enter' : 'opacity-0',
              '[animation-delay:300ms]',
            )}
          >
            <p className="max-w-sm text-sm leading-6 text-slate-600 sm:text-base">
              10 posts selecionados para leitura rapida, com navegacao direta por setas.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isAnimating || currentIndex === 0}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors duration-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Post anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={isAnimating || currentIndex === maxIndex}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors duration-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Proximo post"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          data-testid="blog-slider-stage"
          data-phase={isAnimating ? 'animating' : 'idle'}
          data-current-index={currentIndex}
          className={cn(
            'relative -mt-3 overflow-y-visible overflow-x-hidden pt-3',
            isVisible ? 'animate-enter' : 'opacity-0',
            '[animation-delay:450ms]',
          )}
        >
          <div
            data-testid="blog-slider-track"
            data-animating={isAnimating ? 'true' : 'false'}
            className="flex will-change-transform"
            onTransitionEnd={handleTrackTransitionEnd}
            style={{
              gap: `${STAGE_GAP_PX}px`,
              transform: `translate3d(calc(-${(currentIndex / slidesPerView) * 100}% - ${(currentIndex * STAGE_GAP_PX) / slidesPerView}px), 0, 0)`,
              transition: prefersReducedMotion ? 'none' : `transform ${CAROUSEL_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          >
            {blogPosts.map((post, index) => {
              const isSlideVisible = index >= currentIndex && index < currentIndex + slidesPerView

              return (
                <div
                  key={post.title}
                  data-testid="blog-slide"
                  data-visible={isSlideVisible ? 'true' : 'false'}
                  aria-hidden={isSlideVisible ? undefined : true}
                  className="shrink-0"
                  style={{ width: `calc((100% - ${(slidesPerView - 1) * STAGE_GAP_PX}px) / ${slidesPerView})` }}
                >
                  <ProjectCard {...post} />
                </div>
              )
            })}
          </div>
        </div>

        <div
          className={cn(
            'mt-10 flex items-center justify-between gap-4',
            isVisible ? 'animate-enter' : 'opacity-0',
            '[animation-delay:600ms]',
          )}
        >
          <p className="text-sm text-slate-500">
            {String(currentIndex + 1).padStart(2, '0')}-{String(currentIndex + visiblePosts.length).padStart(2, '0')} /{' '}
            {String(blogPosts.length).padStart(2, '0')}
          </p>
          <Link
            to="/inspire"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-900 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
          >
            Explorar Inspire
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function clearUnlockFallback(timeoutRef) {
  if (timeoutRef.current) {
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }
}

function getSlidesPerView() {
  if (typeof window === 'undefined') {
    return 3
  }

  if (window.innerWidth >= 1280) {
    return 3
  }

  if (window.innerWidth >= 768) {
    return 2
  }

  return 1
}

function useReducedMotionPreference() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)

    updatePreference()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePreference)
      return () => mediaQuery.removeEventListener('change', updatePreference)
    }

    mediaQuery.addListener(updatePreference)
    return () => mediaQuery.removeListener(updatePreference)
  }, [])

  return prefersReducedMotion
}

function useScrollReveal(threshold = 0.15) {
  const [isVisible, setIsVisible] = useState(() => typeof IntersectionObserver === 'undefined')
  const ref = useRef(null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (ref.current) observer.unobserve(ref.current)
        }
      },
      { threshold },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return [ref, isVisible]
}
