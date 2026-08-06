import sanityCli from 'sanity/cli'

export const wordpressSlugUpdates = [
  { documentId: 'wordpress-post-217', slug: '25-anos-da-otimiza-consultoria-homenagem-michael-porter__trashed' },
  { documentId: 'wordpress-post-236', slug: '25-anos-da-otimiza-consultoria-homenagem-ao-peter-drucker__trashed' },
  { documentId: 'wordpress-post-241', slug: 'bpm-day-em-sp-090616__trashed' },
  { documentId: 'wordpress-post-243', slug: '25-anos-da-otimiza-consultoria-homenagem-ao-peter-drucker-parte-4__trashed' },
  { documentId: 'wordpress-post-1133', slug: 'aprendizado-em-acao__trashed' },
  { documentId: 'wordpress-post-1134', slug: 'abpmp-brasil-mudancas-em-2016__trashed' },
  { documentId: 'wordpress-post-1135', slug: '25-anos-da-otimiza-consultoria-homenagem-michael-porter-parte-2__trashed' },
  { documentId: 'wordpress-post-1136', slug: '25-anos-da-otimiza-consultoria-homenagem-michael-porter-parte-3__trashed' },
  { documentId: 'wordpress-post-1137', slug: '25-anos-da-otimiza-consultoria-homenagem-michael-porter-parte-4__trashed' },
  { documentId: 'wordpress-post-2057', slug: '25-anos-da-otimiza-consultoria-homenagem-a-oliver-wight-parte-5-2__trashed' },
  { documentId: 'wordpress-post-2173', slug: 'conselhos-de-um-gestor-de-processos-de-negocio__trashed' },
  { documentId: 'wordpress-post-2259', slug: 'universidade-mackenzie-recebe-bpm-day-sp__trashed' },
  { documentId: 'wordpress-post-2425', slug: 'venha-ser-um-gestor-de-processo-de-negocio-habilitado__trashed' },
  { documentId: 'wordpress-post-5266', slug: '25-anos-da-otimiza-consultoria-homenagem-michael-porter-parte-5__trashed' },
  { documentId: 'wordpress-post-5267', slug: '25-anos-da-otimiza-consultoria-homenagem-ao-peter-drucker-parte-2__trashed' },
  { documentId: 'wordpress-post-5268', slug: '25-anos-da-otimiza-consultoria-homenagem-ao-peter-drucker-parte-5__trashed' },
  { documentId: 'wordpress-post-5269', slug: '25-anos-da-otimiza-consultoria-homenagem-a-oliver-wight__trashed' },
  { documentId: 'wordpress-post-5270', slug: '25-anos-da-otimiza-consultoria-homenagem-a-oliver-wight-parte-2__trashed' },
  { documentId: 'wordpress-post-5271', slug: '25-anos-da-otimiza-consultoria-homenagem-a-oliver-wight-parte-4__trashed' },
  { documentId: 'wordpress-post-2479', slug: '__trashed-3' },
  { documentId: 'wordpress-post-2487', slug: 'novas-turmas-joinville-e-jaragua-do-sul__trashed' },
  { documentId: 'wordpress-post-2593', slug: 'bem-vindo-a-epoca-das-mudancas-exponenciais-o-melhor-momento-para-se-viver-_peter-h-diamandis2016' },
  { documentId: 'wordpress-post-7425', slug: 'dica-para-assistir%ef%bf%bc' },
  { documentId: 'wordpress-post-7755', slug: 'essencialmente-do-que-e-feita-uma-organizacao-%ef%bf%bc' },
  { documentId: 'wordpress-post-8140', slug: 'ritos-e-rituais-quando-a-rotina-vira-obstaculo%ef%bf%bc' },
]

export function buildSlugMutations() {
  return wordpressSlugUpdates.map(({ documentId, slug }) => ({
    patch: {
      id: documentId,
      set: { slug: { _type: 'slug', current: slug } },
    },
  }))
}

async function run() {
  const { getCliClient } = sanityCli
  const client = getCliClient({ apiVersion: '2025-03-01' })
  await client.mutate(buildSlugMutations())
  console.log(`${wordpressSlugUpdates.length} post slugs aligned with WordPress.`)
}

if (process.argv[1]?.endsWith('align-wordpress-post-slugs.mjs')) {
  run().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
