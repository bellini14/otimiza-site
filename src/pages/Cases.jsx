import { useEffect, useState } from 'react'
import { client } from '../lib/sanity'
import { groupClientsBySector } from '../data/clientSectors'
import { sitePages } from '../data/sitePages'

const clientLogoQuery = `*[_type == "clientLogo" && isVisible != false && defined(logo.asset)] | order(sector asc, coalesce(sortOrder, 9999) asc, name asc) {
  _id,
  name,
  sector,
  logoAlt,
  website,
  "logoUrl": logo.asset->url
}`

function Cases() {
  const [clientLogos, setClientLogos] = useState([])
  const page = sitePages.cases
  const clientGroups = groupClientsBySector(clientLogos)

  useEffect(() => {
    let isMounted = true

    async function fetchClientLogos() {
      try {
        const clients = await client.fetch(clientLogoQuery)
        if (isMounted && Array.isArray(clients)) {
          setClientLogos(clients)
        }
      } catch (error) {
        console.error('Error fetching client logos from Sanity:', error)
      }
    }

    fetchClientLogos()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-16 pb-16">
      <header className="max-w-4xl">
        <p className="mb-4 inline-flex rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase text-brand-red">
          Cases
        </p>
        <h1 className="mb-5 font-display text-4xl text-slate-900 sm:text-5xl lg:text-7xl">{page.title}</h1>
        <p className="max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{page.intro}</p>
      </header>

      <section aria-labelledby="case-highlights-title">
        <h2 id="case-highlights-title" className="sr-only">
          Frentes de atuação
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {page.sections.map((section) => (
            <article key={section.heading} className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{section.heading}</h3>
              <p className="text-sm leading-6 text-slate-600">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="client-logos-title" className="relative">
        <div className="mb-10 max-w-3xl">
          <p className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] font-semibold uppercase text-slate-600">
            Clientes
          </p>
          <h2 id="client-logos-title" className="font-display text-3xl text-slate-900 sm:text-5xl">
            Nossos clientes
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Empresas de diferentes segmentos que contam com a Otimiza para ganhar clareza operacional e evoluir resultados.
          </p>
        </div>

        {clientGroups.length > 0 && (
          <div className="space-y-8">
            {clientGroups.map((group) => (
              <div key={group.sector} data-testid="client-sector" className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="mb-5 text-sm font-semibold uppercase text-slate-600">{group.sector}</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {group.clients.map((logo) => {
                    const logoImage = (
                      <img
                        src={logo.logoUrl}
                        alt={logo.logoAlt || logo.name}
                        className="max-h-12 w-auto max-w-full object-contain grayscale transition duration-300 hover:grayscale-0"
                        loading="lazy"
                      />
                    )

                    return (
                      <div
                        key={logo._id || `${group.sector}-${logo.name}`}
                        className="flex min-h-28 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 px-4 py-5"
                      >
                        {logo.website ? (
                          <a href={logo.website} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center">
                            {logoImage}
                          </a>
                        ) : (
                          logoImage
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Cases
