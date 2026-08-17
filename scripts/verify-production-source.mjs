const PRODUCTION_BRANCH = 'main'

export function assertAllowedProductionSource(environment = process.env) {
  if (environment.VERCEL_ENV !== 'production') return

  if (environment.VERCEL_GIT_COMMIT_REF !== PRODUCTION_BRANCH) {
    throw new Error(`A produção só pode ser publicada a partir da branch ${PRODUCTION_BRANCH}.`)
  }
}

assertAllowedProductionSource()
