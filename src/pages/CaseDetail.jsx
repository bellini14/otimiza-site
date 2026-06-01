import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { ArrowLeft } from 'lucide-react'
import { client } from '../lib/sanity'
import { caseStudies } from '../data/caseStudies'

function StaticCaseContent({ study }) {
  return (
    <>
      {study.intro?.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-700">
          {study.intro.map((line) => (
            <p key={line} className="mb-3 last:mb-0">
              {line}
            </p>
          ))}
        </div>
      )}

      <div className="space-y-8">
        {study.sections.map((section) => (
          <section key={section.heading} className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mb-4 leading-7 text-slate-700 last:mb-0">
                {paragraph}
              </p>
            ))}
            {section.items?.length > 0 && (
              <ul className="space-y-3 pl-5 text-slate-700">
                {section.items.map((item) => (
                  <li key={item} className="list-disc leading-7">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  )
}

function CaseDetail() {
  const { slug } = useParams()
  const fallbackStudy = caseStudies[slug]
  const [cmsCase, setCmsCase] = useState(null)
  const [loading, setLoading] = useState(true)

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
  const title = cmsCase?.caseTitle || fallbackStudy?.title
  const subtitle = cmsCase?.caseDescription || fallbackStudy?.subtitle

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
    <article className="pb-16">
      <Link to="/cases" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-red">
        <ArrowLeft className="h-4 w-4" /> Voltar para Cases
      </Link>

      <header className="mb-12 max-w-4xl">
        <p className="mb-4 inline-flex rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase text-brand-red">
          Case
        </p>
        <h1 className="mb-5 font-display text-4xl text-slate-900 sm:text-5xl lg:text-7xl">{title}</h1>
        {subtitle && <p className="max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{subtitle}</p>}
      </header>

      <div className="max-w-5xl space-y-8">
        {hasCmsContent ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 leading-7 text-slate-700">
            <PortableText value={cmsCase.caseContent} />
          </div>
        ) : fallbackStudy ? (
          <StaticCaseContent study={fallbackStudy} />
        ) : null}
      </div>
    </article>
  )
}

export default CaseDetail
