const CACHE_KEY = 'inspire-posts-cache-v1'

let memoryCache = null

function normalizePosts(posts) {
  if (!Array.isArray(posts)) {
    return []
  }

  return posts.filter((post) => post && typeof post === 'object' && typeof post.title === 'string')
}

export function getCachedInspirePosts() {
  if (memoryCache) {
    return memoryCache
  }

  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY)

    if (!raw) {
      memoryCache = []
      return memoryCache
    }

    memoryCache = normalizePosts(JSON.parse(raw))
    return memoryCache
  } catch {
    memoryCache = []
    return memoryCache
  }
}

export function setCachedInspirePosts(posts) {
  const normalizedPosts = normalizePosts(posts)
  memoryCache = normalizedPosts

  if (typeof window === 'undefined') {
    return
  }

  try {
    if (normalizedPosts.length === 0) {
      window.sessionStorage.removeItem(CACHE_KEY)
      return
    }

    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(normalizedPosts))
  } catch {
    // Ignore storage failures and keep the in-memory cache.
  }
}

export function clearCachedInspirePosts() {
  memoryCache = []

  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.removeItem(CACHE_KEY)
  } catch {
    // Ignore storage failures.
  }
}
