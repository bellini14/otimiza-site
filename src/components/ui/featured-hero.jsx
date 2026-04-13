import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'

/**
 * Format a date string to a readable pt-BR format.
 */
function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Primary feature card – large image, prominent title.
 */
function PrimaryCard({ post }) {
  const date = formatDate(post.publishedAt)

  return (
    <Link
      to={post.link}
      className="featured-primary group"
      aria-label={`Ler artigo: ${post.title}`}
    >
      <div className="featured-primary__img-wrap">
        <img
          src={post.imgSrc}
          alt={post.title}
          className="featured-primary__img"
          loading="eager"
        />
        <div className="featured-primary__overlay" />
      </div>

      <div className="featured-primary__body">
        {post.eyebrow && (
          <span className="featured-primary__eyebrow">{post.eyebrow}</span>
        )}

        <h2 className="featured-primary__title">{post.title}</h2>

        {post.description && (
          <p className="featured-primary__desc">{post.description}</p>
        )}

        <div className="featured-primary__meta">
          {date && (
            <span className="featured-primary__date">
              <Clock size={14} />
              {date}
            </span>
          )}
          <span className="featured-primary__cta">
            Ler artigo
            <ArrowRight size={16} className="featured-primary__arrow" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/**
 * Compact secondary card for the sidebar stories.
 */
function SecondaryCard({ post }) {
  const date = formatDate(post.publishedAt)

  return (
    <Link
      to={post.link}
      className="featured-secondary group"
      aria-label={`Ler artigo: ${post.title}`}
    >
      <div className="featured-secondary__img-wrap">
        <img
          src={post.imgSrc}
          alt={post.title}
          className="featured-secondary__img"
          loading="eager"
        />
      </div>

      <div className="featured-secondary__body">
        {post.eyebrow && (
          <span className="featured-secondary__eyebrow">{post.eyebrow}</span>
        )}
        <h3 className="featured-secondary__title">{post.title}</h3>
        {date && (
          <span className="featured-secondary__date">
            <Clock size={12} />
            {date}
          </span>
        )}
      </div>
    </Link>
  )
}

/**
 * Featured editorial hero area.
 *
 * Renders 1 large primary card + up to 3 compact secondary cards
 * from the beginning of `posts`. If fewer than 4 posts are available,
 * it gracefully adapts.
 */
export function FeaturedHero({ posts }) {
  if (!posts || posts.length === 0) return null

  const [primary, ...secondaries] = posts

  return (
    <section className="featured-hero" aria-label="Destaques">
      <PrimaryCard post={primary} />

      {secondaries.length > 0 && (
        <div className="featured-hero__sidebar">
          {secondaries.map((post) => (
            <SecondaryCard key={post.slug || post.title} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}
