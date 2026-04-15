import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { fetchPostLikes, hasLikedPost, rememberLikedPost, submitPostLike } from '../lib/postLikes'

const LIKE_ANIMATION_MS = 220

function formatLikeCountLabel(value) {
  return `${value} curtida${value === 1 ? '' : 's'}`
}

function getButtonAriaLabel({ likeCount, liked }) {
  if (typeof likeCount === 'number') {
    const countLabel = formatLikeCountLabel(likeCount)
    return liked ? `${countLabel}, curtido` : countLabel
  }

  return liked ? 'Curtido este post' : 'Curtir este post'
}

function PostLikeButton({ slug, className = '', variant = 'detail' }) {
  const [likeCount, setLikeCount] = useState(null)
  const [liked, setLiked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    let cancelled = false

    setLiked(hasLikedPost(slug))
    setLikeCount(null)

    if (!slug) {
      return undefined
    }

    async function loadLikes() {
      try {
        const data = await fetchPostLikes(slug)

        if (!cancelled) {
          setLikeCount(data.count)
        }
      } catch (error) {
        console.error('Error fetching post likes:', error)
      }
    }

    loadLikes()

    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (!isAnimating) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setIsAnimating(false)
    }, LIKE_ANIMATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isAnimating])

  async function handleClick() {
    if (!slug || liked || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      const data = await submitPostLike(slug)
      rememberLikedPost(slug)
      setLiked(true)
      setLikeCount(data.count)
      setIsAnimating(true)
    } catch (error) {
      console.error('Error submitting post like:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const buttonClassName = [
    'post-like-button',
    `post-like-button--${variant}`,
    liked ? 'post-like-button--liked' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      aria-label={getButtonAriaLabel({ likeCount, liked })}
      aria-pressed={liked}
      disabled={liked || isSubmitting}
      onClick={handleClick}
      className={buttonClassName}
    >
      <span className="post-like-button__icon-shell" aria-hidden="true">
        <span
          className={`post-like-button__icon ${
            liked ? 'post-like-button__icon--liked' : ''
          } ${isAnimating ? 'post-like-button__icon--popping' : ''}`.trim()}
        >
          <Heart size={16} strokeWidth={1.8} fill={liked ? 'currentColor' : 'none'} />
        </span>
      </span>
      {typeof likeCount === 'number' && (
        <span className="post-like-button__count" aria-hidden="true">
          {likeCount}
        </span>
      )}
    </button>
  )
}

export default PostLikeButton
