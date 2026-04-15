const POST_LIKE_STORAGE_PREFIX = 'post-like:'

function getLikesEndpoint(slug) {
  return `/api/posts/${encodeURIComponent(slug)}/likes`
}

async function readJson(response) {
  const payload = await response.json()

  if (!response.ok) {
    const message =
      typeof payload?.error === 'string' && payload.error.length > 0
        ? payload.error
        : 'Unable to process post likes.'

    throw new Error(message)
  }

  return payload
}

export function getPostLikeStorageKey(slug) {
  return `${POST_LIKE_STORAGE_PREFIX}${slug}`
}

export function hasLikedPost(slug) {
  if (typeof window === 'undefined' || !slug) {
    return false
  }

  return window.localStorage.getItem(getPostLikeStorageKey(slug)) === 'true'
}

export function rememberLikedPost(slug) {
  if (typeof window === 'undefined' || !slug) {
    return
  }

  window.localStorage.setItem(getPostLikeStorageKey(slug), 'true')
}

export async function fetchPostLikes(slug) {
  const response = await fetch(getLikesEndpoint(slug), {
    method: 'GET',
  })

  return readJson(response)
}

export async function submitPostLike(slug) {
  const response = await fetch(getLikesEndpoint(slug), {
    method: 'POST',
  })

  return readJson(response)
}
