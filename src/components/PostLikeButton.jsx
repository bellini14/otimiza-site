import { useEffect, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import {
  cachePostLikeCount,
  fetchPostLikes,
  forgetLikedPost,
  getCachedPostLikeCount,
  hasLikedPost,
  rememberLikedPost,
  removePostLike,
  submitPostLike,
} from '../lib/postLikes'

const LIKE_ANIMATION_MS = 360

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

function PostLikeButton({
  slug,
  className = '',
  buttonClassName: customButtonClassName = '',
  variant = 'detail',
  showLabel = false,
}) {
  const [likeCount, setLikeCount] = useState(() => getCachedPostLikeCount(slug))
  const [liked, setLiked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const interactionVersionRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    interactionVersionRef.current = 0
    setLiked(hasLikedPost(slug))
    setLikeCount(getCachedPostLikeCount(slug))

    if (!slug) {
      return undefined
    }

    const loadVersion = interactionVersionRef.current

    async function loadLikes() {
      try {
        const data = await fetchPostLikes(slug)

        if (!cancelled && interactionVersionRef.current === loadVersion) {
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
    if (!slug || isSubmitting) {
      return
    }

    const previousLiked = liked
    const previousLikeCount = likeCount
    const nextLiked = !liked
    const nextLikeCount =
      typeof likeCount === 'number' ? Math.max(likeCount + (liked ? -1 : 1), 0) : null

    interactionVersionRef.current += 1
    setIsSubmitting(true)
    setLiked(nextLiked)
    setFeedbackMessage(nextLiked ? 'Artigo curtido' : 'Curtida removida')

    if (typeof nextLikeCount === 'number') {
      cachePostLikeCount(slug, nextLikeCount)
      setLikeCount(nextLikeCount)
    }

    setIsAnimating(true)

    try {
      const data = liked ? await removePostLike(slug) : await submitPostLike(slug)

      if (data.liked) {
        rememberLikedPost(slug)
      } else {
        forgetLikedPost(slug)
      }

      setLiked(Boolean(data.liked))
      setLikeCount(data.count)
    } catch (error) {
      console.error('Error submitting post like:', error)
      setLiked(previousLiked)
      setLikeCount(previousLikeCount)
      setFeedbackMessage(
        previousLiked
          ? 'Não foi possível remover a curtida. Tente novamente.'
          : 'Não foi possível curtir. Tente novamente.'
      )
      if (typeof previousLikeCount === 'number') {
        cachePostLikeCount(slug, previousLikeCount)
      }
      setIsAnimating(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const groupClassName = [
    'post-like-button-group',
    `post-like-button-group--${variant}`,
    liked ? 'post-like-button-group--liked' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const buttonClassName = [
    'post-like-button',
    `post-like-button--${variant}`,
    showLabel ? 'post-like-button--labeled' : '',
    liked ? 'post-like-button--liked' : '',
    isAnimating ? 'post-like-button--feedback' : '',
    customButtonClassName,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={groupClassName}>
      <button
        type="button"
        aria-label={getButtonAriaLabel({ likeCount, liked })}
        aria-pressed={liked}
        aria-disabled={isSubmitting}
        data-inspire-tooltip={liked ? 'Remover curtida' : 'Curtir artigo'}
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
        {showLabel && (
          <span className="post-like-button__label">{liked ? 'Curtido' : 'Curtir'}</span>
        )}
      </button>
      {typeof likeCount === 'number' && (
        <span className="post-like-button__count" aria-hidden="true">
          {likeCount}
        </span>
      )}
      <span className="post-like-button__status" role="status" aria-live="polite">
        {feedbackMessage}
      </span>
    </span>
  )
}

export default PostLikeButton
