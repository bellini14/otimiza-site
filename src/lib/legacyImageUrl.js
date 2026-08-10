import { legacyImageManifest } from '../data/legacyImageManifest'

const SANITY_IMAGE_PATH = /^\/images\/igy822g7\/production\/([^/]+)$/

function getSanityAssetId(url) {
  if (typeof url !== 'string') return undefined

  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname !== 'cdn.sanity.io') return undefined

    return parsedUrl.pathname.match(SANITY_IMAGE_PATH)?.[1]
  } catch {
    return undefined
  }
}

export function resolveLegacyImageUrl(url) {
  const assetId = getSanityAssetId(url)
  const path = legacyImageManifest[assetId]
  return path ? `https://www.otm.com.br/${path}` : url
}
