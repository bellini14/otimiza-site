import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { ArrowLeft } from 'lucide-react'
import { client, urlFor } from '../lib/sanity'
import { caseStudies } from '../data/caseStudies'
import GradualBlur from '../components/GradualBlur'

const fallbackHeroImages = {
  default: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=82',
  bancos: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1800&q=82',
  moveis: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1800&q=82',
  industria: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1800&q=82',
  saude: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1800&q=82',
  alimentos: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=1800&q=82',
}

const caseHeroImageBySlug = {
  'banco-moneo': fallbackHeroImages.bancos,
  moneo: fallbackHeroImages.bancos,
  bontempo: fallbackHeroImages.moveis,
  unicasa: fallbackHeroImages.moveis,
  sulmaq: fallbackHeroImages.industria,
  neobus: fallbackHeroImages.industria,
  zen: fallbackHeroImages.industria,
  tabone: fallbackHeroImages.industria,
  cinex: fallbackHeroImages.industria,
  'master-power': fallbackHeroImages.industria,
  'unimed-vtrp': fallbackHeroImages.saude,
  'hospital-bruno-born': fallbackHeroImages.saude,
  'santa-clara': fallbackHeroImages.alimentos,
}

function slugifyHeading(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function CaseSectionContent({ section }) {
  return (
    <>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="mb-4 leading-7 text-slate-700 last:mb-0">
          {paragraph}
        </p>
      ))}
      {section.items?.length > 0 && (
        <ul className="space-y-3 text-slate-700">
          {section.items.map((item) => (
            <li key={item} className="grid grid-cols-[0.75rem_1fr] gap-3 leading-7">
              <span className="mt-3 h-1.5 w-1.5 rounded-full bg-brand-red" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

const SIDE_NAV_PIN_TOP = 96

function CaseSideNav({ sections, activeSectionId, sideNavRef, sideNavMode, sideNavStyle }) {
  const effectiveActiveSectionId = activeSectionId || sections[0]?.id

  return (
    <aside
      ref={sideNavRef}
      data-testid="case-detail-side-nav"
      data-pin-state={sideNavMode}
      className="hidden w-64 shrink-0 self-start lg:block"
      aria-label="Subtitulos do case"
    >
      <nav
        data-testid="case-detail-side-nav-sticky"
        className={sideNavMode === 'fixed' ? 'fixed z-30' : ''}
        style={sideNavMode === 'fixed' ? sideNavStyle : undefined}
      >
        <ul className="space-y-1 border-l-2 border-slate-300">
          {sections.map((section) => {
            const isActive = section.id === effectiveActiveSectionId

            return (
              <li key={section.id}>
                <a
                  data-testid="case-detail-side-nav-item"
                  href={`#${section.id}`}
                  className={[
                    'block py-1.5 pl-4 text-sm font-semibold transition-colors',
                    isActive
                      ? '-ml-0.5 border-l-2 border-brand-red text-brand-red'
                      : 'text-slate-500 hover:text-slate-900',
                  ].join(' ')}
                >
                  {section.heading}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

function CaseContentLayout({
  sections,
  activeSectionId,
  title,
  subtitle,
  contentRef,
  sideNavRef,
  sideNavMode,
  sideNavStyle,
}) {
  return (
    <div
      ref={contentRef}
      data-testid="case-detail-content-layout"
      className="mx-auto flex w-full max-w-[1380px] flex-col gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:flex-row lg:gap-16 lg:px-8"
    >
      <div data-testid="case-detail-content-column" className="min-w-0 flex-1 space-y-16 sm:space-y-20">
        <header className="pb-10">
          <Link to="/cases" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-red">
            <ArrowLeft className="h-4 w-4" /> Voltar para Cases
          </Link>
          <h1 className="max-w-4xl font-display text-4xl leading-tight text-slate-900 sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {subtitle && <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600 sm:text-xl">{subtitle}</p>}
        </header>

        {sections.map((section) => (
          <section
            id={section.id}
            key={section.id}
            data-testid="case-detail-content-section"
            data-case-section-id={section.id}
            className="scroll-mt-28 pt-2"
          >
            <h2 className="font-display text-3xl leading-tight text-slate-900 sm:text-5xl">
              {section.heading}
            </h2>
            <div className="mt-6 max-w-3xl text-base sm:text-lg">
              {section.content || <CaseSectionContent section={section} />}
            </div>
          </section>
        ))}
      </div>

      <CaseSideNav
        sections={sections}
        activeSectionId={activeSectionId}
        sideNavRef={sideNavRef}
        sideNavMode={sideNavMode}
        sideNavStyle={sideNavStyle}
      />
    </div>
  )
}

function getStaticSections(study) {
  return study.sections.map((section, index) => ({
    ...section,
    id: `case-section-${index + 1}-${slugifyHeading(section.heading)}`,
  }))
}

function getCmsSections(cmsCase) {
  return [
    {
      id: 'case-section-1-desenvolvimento',
      heading: 'Desenvolvimento',
      content: (
        <div className="case-detail-portable leading-7 text-slate-700">
          <PortableText value={cmsCase.caseContent} />
        </div>
      ),
    },
  ]
}

function getCmsHeroImage(cmsCase) {
  if (!cmsCase?.logo) return null

  return urlFor(cmsCase.logo).ignoreImageParams().width(1800).height(1100).fit('max').url()
}

function CaseDetail() {
  const { slug } = useParams()
  const fallbackStudy = caseStudies[slug]
  const [cmsCase, setCmsCase] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSectionId, setActiveSectionId] = useState(null)
  const [sideNavPin, setSideNavPin] = useState({ mode: 'normal', left: 0, width: 0 })
  const contentRef = useRef(null)
  const sideNavRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function fetchCase() {
      try {
        const data = await client.fetch(
          `*[_type == "clientLogo" && isVisible != false && showOnCases == true && caseSlug.current == $slug][0] {
            name,
            sector,
            caseTitle,
            caseDescription,
            logo,
            caseContent
          }`,
          { slug },
        )

        if (!cancelled) {
          setCmsCase(data)
        }
      } catch (error) {
        console.error('Error fetching case from Sanity:', error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    window.scrollTo(0, 0)
    fetchCase()

    return () => {
      cancelled = true
    }
  }, [slug])

  const hasCmsContent = Array.isArray(cmsCase?.caseContent) && cmsCase.caseContent.length > 0
  const title = hasCmsContent ? cmsCase?.caseTitle || fallbackStudy?.title : fallbackStudy?.title || cmsCase?.caseTitle
  const subtitle = hasCmsContent
    ? cmsCase?.caseDescription || fallbackStudy?.subtitle
    : fallbackStudy?.subtitle || cmsCase?.caseDescription
  const clientName = (hasCmsContent ? cmsCase?.name : fallbackStudy?.client) || cmsCase?.name || title
  const heroImage = (hasCmsContent ? getCmsHeroImage(cmsCase) : null) || caseHeroImageBySlug[slug] || fallbackHeroImages.default
  const contentSections = useMemo(
    () => (hasCmsContent ? getCmsSections(cmsCase) : fallbackStudy ? getStaticSections(fallbackStudy) : []),
    [cmsCase, fallbackStudy, hasCmsContent],
  )
  const sectionIds = contentSections.map((section) => section.id).join('|')
  const currentSectionId = activeSectionId || contentSections[0]?.id

  useEffect(() => {
    if (contentSections.length === 0) return undefined

    setActiveSectionId((currentId) => currentId || contentSections[0].id)

    if (typeof IntersectionObserver === 'undefined') {
      return undefined
    }

    const observedSections = Array.from(document.querySelectorAll('[data-case-section-id]'))
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]

        if (visibleEntry?.target instanceof HTMLElement) {
          setActiveSectionId(visibleEntry.target.dataset.caseSectionId)
        }
      },
      { rootMargin: '-28% 0px -58% 0px', threshold: [0, 0.2, 0.6] },
    )

    observedSections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [contentSections, sectionIds])

  useEffect(() => {
    if (contentSections.length === 0) return undefined

    let animationFrame = null

    function updateSideNavPin() {
      animationFrame = null

      const content = contentRef.current
      const sideNav = sideNavRef.current
      if (!content || !sideNav) return

      const contentRect = content.getBoundingClientRect()
      const sideNavRect = sideNav.getBoundingClientRect()
      const shouldPin = sideNavRect.top <= SIDE_NAV_PIN_TOP && contentRect.bottom > SIDE_NAV_PIN_TOP
      const nextPin = shouldPin
        ? {
            mode: 'fixed',
            left: Math.round(sideNavRect.left),
            width: Math.round(sideNavRect.width),
          }
        : { mode: 'normal', left: 0, width: 0 }

      setSideNavPin((currentPin) => (
        currentPin.mode === nextPin.mode &&
        currentPin.left === nextPin.left &&
        currentPin.width === nextPin.width
          ? currentPin
          : nextPin
      ))
    }

    function scheduleSideNavPinUpdate() {
      if (animationFrame) return
      animationFrame = window.requestAnimationFrame(updateSideNavPin)
    }

    updateSideNavPin()
    window.addEventListener('scroll', scheduleSideNavPinUpdate, { passive: true })
    window.addEventListener('resize', scheduleSideNavPinUpdate)

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame)
      }
      window.removeEventListener('scroll', scheduleSideNavPinUpdate)
      window.removeEventListener('resize', scheduleSideNavPinUpdate)
    }
  }, [contentSections.length])

  const sideNavStyle = {
    top: `${SIDE_NAV_PIN_TOP}px`,
    left: `${sideNavPin.left}px`,
    width: `${sideNavPin.width}px`,
  }


  if (!loading && !cmsCase && !fallbackStudy) {
    return (
      <div className="mx-auto max-w-4xl py-24 text-center text-slate-600">
        <h1 className="text-3xl font-bold text-slate-900">Case não encontrado</h1>
        <p className="mt-4">O case que você está procurando não existe ou foi removido.</p>
        <Link to="/cases" className="mt-8 inline-flex items-center gap-2 font-semibold text-brand-red hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar para Cases
        </Link>
      </div>
    )
  }

  return (
    <article className="case-detail-page -mt-32 pb-0 sm:-mt-36">
      <section
        data-testid="case-detail-hero"
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[48svh] min-h-[22rem] w-screen overflow-hidden bg-slate-950"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24" aria-hidden="true">
          <div className="absolute inset-x-0 top-0 h-[4.6rem] bg-white/42" />
          <GradualBlur
            target="parent"
            position="top"
            height="6rem"
            strength={2}
            divCount={5}
            curve="bezier"
            exponential
            opacity={1}
            zIndex={0}
            className="rounded-none"
          />
        </div>
        <img
          data-testid="case-detail-hero-image"
          src={heroImage}
          alt={clientName}
          className="h-full w-full object-cover"
        />
      </section>

      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[#E5E9F1]">
        {contentSections.length > 0 && (
          <CaseContentLayout
            sections={contentSections}
            activeSectionId={currentSectionId}
            title={title}
            subtitle={subtitle}
            contentRef={contentRef}
            sideNavRef={sideNavRef}
            sideNavMode={sideNavPin.mode}
            sideNavStyle={sideNavStyle}
          />
        )}
      </div>
    </article>
  )
}

export default CaseDetail
