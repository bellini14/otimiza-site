import { ArrowRight, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { ProjectCard } from './project-card'
import { client } from '@/lib/sanity'
import { staticBlogPosts } from '../../data/blogPosts'
import { setCachedInspirePosts } from '../../lib/inspirePostCache'
import { useDragCarousel } from '../../hooks/useDragCarousel'



const STAGE_GAP_PX = 32

export function BlogHighlights() {
  const [sectionRef, isVisible] = useScrollReveal(0.1)
  const [blogPosts, setBlogPosts] = useState(staticBlogPosts)
  const [slidesPerView, setSlidesPerView] = useState(getSlidesPerView())
  const slideStep = getSlideStep(slidesPerView)
  const isMobileCarousel = slidesPerView === 1
  const {
    shellRef,
    trackRef,
    translateX,
    isDragging,
    dragDirection,
    hintPosition,
    updateHintPosition,
    trackHandlers,
  } = useDragCarousel({ snapStep: slideStep, snapOnRelease: isMobileCarousel })

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
          setCachedInspirePosts(dynamicPosts)
          setBlogPosts(dynamicPosts)
        }
      } catch (error) {
        console.error('Error fetching posts from Sanity:', error)
      }
    }
    fetchPosts()
  }, [])

  const maxIndex = Math.max(blogPosts.length - slidesPerView, 0)
  const currentIndex = Math.min(Math.max(Math.round(-translateX / slideStep), 0), maxIndex)

  useEffect(() => {
    function handleResize() {
      setSlidesPerView(getSlidesPerView())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-[100vw] left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#EFEFF4] pb-12 pt-16 sm:pb-16 sm:pt-24"
    >
      <div className="home-menu-shell" data-testid="home-menu-aligned-shell">
        <div className="mb-12 flex flex-col gap-8 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
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
              'flex items-center lg:justify-end',
              isVisible ? 'animate-enter' : 'opacity-0',
              '[animation-delay:300ms]',
            )}
          >
            <Link
              to="/inspire"
              data-testid="blog-header-cta"
              className="group inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-900 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
            >
              Explorar Inspire
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

      </div>

      <div
        ref={shellRef}
        data-testid="blog-slider-stage"
        data-current-index={currentIndex}
        className={cn(
          'group relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden py-2',
          isVisible ? 'animate-enter' : 'opacity-0',
          '[animation-delay:450ms]',
        )}
        onPointerMove={updateHintPosition}
      >
        <span
          data-testid="blog-carousel-fade"
          className="blog-carousel-fade pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-[#EFEFF4] via-[#EFEFF4]/85 to-transparent sm:w-36 lg:w-48"
          aria-hidden="true"
        />
        <span
          data-testid="blog-carousel-fade"
          className="blog-carousel-fade pointer-events-none absolute inset-y-0 right-0 z-20 w-24 bg-gradient-to-l from-[#EFEFF4] via-[#EFEFF4]/85 to-transparent sm:w-36 lg:w-48"
          aria-hidden="true"
        />
        <span
          data-testid="blog-drag-hint"
          className="pointer-events-none absolute left-0 top-0 z-30 hidden rounded-full bg-slate-950/80 px-4 py-2 text-xs font-semibold text-white opacity-0 shadow-xl backdrop-blur transition-opacity duration-300 ease-out group-hover:opacity-100 sm:inline-flex"
          style={{ transform: `translateX(${hintPosition.x}px) translateY(${hintPosition.y}px) scale(0.92)` }}
        >
          <span>Arrastar</span>
          <ChevronRight
            data-testid="blog-drag-arrow"
            className="ml-1.5 h-3.5 w-3.5"
            aria-hidden="true"
            style={{
              transform: `rotate(${dragDirection === 'left' ? 180 : 0}deg) scale(${isDragging ? 1.12 : 1})`,
              transition: 'transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
        </span>
        <div
          ref={trackRef}
          data-testid="blog-slider-track"
          data-mobile-snap={isMobileCarousel ? 'true' : 'false'}
          className={cn(
            'flex w-max gap-8 pb-4 pt-1 will-change-transform',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
          )}
          style={{
            transform: `translateX(${translateX}px)`,
            transition: 'none',
            touchAction: 'pan-y',
            userSelect: 'none',
          }}
          {...trackHandlers}
        >
          <div
            data-testid="blog-carousel-edge-spacer"
            className="blog-carousel-edge-spacer shrink-0"
            aria-hidden="true"
          />
          {blogPosts.map((post, index) => {
            const isSlideVisible = index >= currentIndex && index < currentIndex + slidesPerView

            return (
              <div
                key={post.title}
                data-testid="blog-slide"
                data-carousel-snap-slide="true"
                data-visible={isSlideVisible ? 'true' : 'false'}
                aria-hidden={isSlideVisible ? undefined : true}
                className="blog-slide shrink-0"
              >
                <ProjectCard
                  {...post}
                  compact
                  disableHover
                  linkState={{
                    postPreview: {
                      title: post.title,
                      description: post.description,
                      publishedAt: post.publishedAt,
                      eyebrow: post.eyebrow,
                      imgSrc: post.imgSrc,
                      slug: post.slug,
                    },
                  }}
                />
              </div>
            )
          })}
          <div
            data-testid="blog-carousel-edge-spacer"
            className="blog-carousel-edge-spacer shrink-0"
            aria-hidden="true"
          />
        </div>
      </div>

    </section>
  )
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

function getHomeInlinePx(viewportWidth) {
  if (viewportWidth >= 1024) return 40
  if (viewportWidth >= 640) return 32
  return 24
}

function getSlideStep(slidesPerView) {
  if (typeof window === 'undefined') {
    return (1380 - (slidesPerView - 1) * STAGE_GAP_PX) / slidesPerView + STAGE_GAP_PX
  }

  if (slidesPerView === 1) {
    return window.innerWidth - getHomeInlinePx(window.innerWidth) * 2 + STAGE_GAP_PX
  }

  return Math.max(
    ((Math.min(window.innerWidth, 1380) - (slidesPerView - 1) * STAGE_GAP_PX) / slidesPerView) +
      STAGE_GAP_PX,
    1,
  )
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
