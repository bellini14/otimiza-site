import { getPostLikesStore, normalizePostSlug } from '../../_lib/postLikesStore.js'

export default async function handler(req, res) {
  const slug = normalizePostSlug(req.query?.slug)

  if (!slug) {
    return res.status(400).json({ error: 'Invalid post slug.' })
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const store = getPostLikesStore()

  try {
    if (req.method === 'GET') {
      const count = await store.getCount(slug)
      return res.status(200).json({ slug, count })
    }

    const count = await store.incrementCount(slug)
    return res.status(200).json({ slug, count, liked: true })
  } catch (error) {
    console.error('Failed to process post likes request.', error)
    return res.status(500).json({ error: 'Unable to process post likes.' })
  }
}
