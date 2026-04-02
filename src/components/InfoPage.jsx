import { sitePages } from '../data/sitePages'

function InfoPage({ slug }) {
  const page = sitePages[slug]

  if (!page) {
    return (
      <section className="rounded-xl border border-red-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-red-700">Pagina nao encontrada</h1>
        <p className="text-slate-600">Nao foi possivel carregar o conteudo solicitado.</p>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-3 text-3xl font-bold text-slate-900">{page.title}</h1>
        <p className="text-slate-600">{page.intro}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {page.sections.map((section) => (
          <article
            key={section.heading}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="mb-2 text-lg font-semibold text-slate-900">{section.heading}</h2>
            <p className="text-sm leading-6 text-slate-600">{section.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default InfoPage
