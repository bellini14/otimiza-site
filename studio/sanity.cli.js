import * as sanityCliNamespace from 'sanity/cli'

const sanityCli = sanityCliNamespace.default ?? sanityCliNamespace
const { defineCliConfig } = sanityCli

export default defineCliConfig({
  api: {
    projectId: 'igy822g7',
    dataset: 'production'
  },
  studioHost: 'otimiza-site'
})
