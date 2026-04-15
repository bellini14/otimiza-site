import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { client } from '../lib/sanity'
import { staticBlogPosts } from '../data/blogPosts'
import { deriveCategoryOptions, sortByDate } from '../lib/blogFilters'
import PostLikeButton from '../components/PostLikeButton'

const INITIAL_POST_COUNT = 15
const POSTS_PER_BATCH = 5
const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) [$start...$end] {
  title,
  description,
  "imgSrc": mainImage.asset->url,
  "slug": slug.current,
  "link": "/inspire/" + slug.current,
  eyebrow,
  publishedAt,
  "linkText": "Ler artigo"
}`

function formatStoryDate(value) {
  if (!value) {
    return 'Recente'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Recente'
  }

  return date.toLocaleDateString('pt-BR', {
    month: 'short',
    day: 'numeric',
  })
}

function deriveStoryStats(post, index) {
  const readTime = Math.max(3, Math.round(((post.description ?? '').length + post.title.length) / 42))

  return { readTime }
}

async function fetchPostBatch(start, end) {
  return client.fetch(POSTS_QUERY, { start, end })
}

function Inspire() {
  const [posts, setPosts] = useState([])
  const [sidebarPosts, setSidebarPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [activeTab, setActiveTab] = useState('for-you')
  const [usingStaticFallback, setUsingStaticFallback] = useState(false)
  const [nextOffset, setNextOffset] = useState(0)
  const [loadMoreError, setLoadMoreError] = useState('')
  const loadMoreSentinelRef = useRef(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const dynamicPosts = await fetchPostBatch(0, INITIAL_POST_COUNT)

        if (dynamicPosts && dynamicPosts.length > 0) {
          const sortedPosts = sortByDate(dynamicPosts)
          setPosts(sortedPosts)
          setSidebarPosts(sortedPosts)
          setNextOffset(sortedPosts.length)
          setHasMore(dynamicPosts.length === INITIAL_POST_COUNT)
        } else {
          const fallbackPosts = sortByDate(staticBlogPosts)
          const initialPosts = fallbackPosts.slice(0, INITIAL_POST_COUNT)

          setUsingStaticFallback(true)
          setPosts(initialPosts)
          setSidebarPosts(initialPosts)
          setNextOffset(initialPosts.length)
          setHasMore(fallbackPosts.length > initialPosts.length)
        }
      } catch (error) {
        console.error('Error fetching posts from Sanity:', error)
        const fallbackPosts = sortByDate(staticBlogPosts)
        const initialPosts = fallbackPosts.slice(0, INITIAL_POST_COUNT)

        setUsingStaticFallback(true)
        setPosts(initialPosts)
        setSidebarPosts(initialPosts)
        setNextOffset(initialPosts.length)
        setHasMore(fallbackPosts.length > initialPosts.length)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const loadMorePosts = useCallback(async () => {
    if (loading || loadingMore || !hasMore) {
      return
    }

    setLoadingMore(true)
    setLoadMoreError('')

    try {
      let nextBatch = []

      if (usingStaticFallback) {
        nextBatch = sortByDate(staticBlogPosts).slice(nextOffset, nextOffset + POSTS_PER_BATCH)
      } else {
        nextBatch = await fetchPostBatch(nextOffset, nextOffset + POSTS_PER_BATCH)
      }

      const sortedBatch = sortByDate(nextBatch)

      setPosts((currentPosts) => [...currentPosts, ...sortedBatch])
      setNextOffset((currentOffset) => currentOffset + sortedBatch.length)
      setHasMore(sortedBatch.length === POSTS_PER_BATCH)
    } catch (error) {
      console.error('Error fetching more posts from Sanity:', error)
      setLoadMoreError('Não foi possível carregar mais histórias agora.')
    } finally {
      setLoadingMore(false)
    }
  }, [hasMore, loading, loadingMore, nextOffset, usingStaticFallback])

  useEffect(() => {
    if (loading || loadingMore || !hasMore || activeTab !== 'for-you' || !loadMoreSentinelRef.current) {
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        loadMorePosts()
      }
    })

    observer.observe(loadMoreSentinelRef.current)

    return () => observer.disconnect()
  }, [activeTab, hasMore, loadMorePosts, loading, loadingMore])

  const visiblePosts = useMemo(() => {
    if (activeTab === 'featured') {
      return posts.slice(0, 6)
    }

    return posts
  }, [activeTab, posts])

  const staffPicks = useMemo(() => sidebarPosts.slice(0, 3), [sidebarPosts])

  const recommendedTopics = useMemo(
    () => deriveCategoryOptions(sidebarPosts).slice(0, 7).map((option) => option.label),
    [sidebarPosts],
  )

  const whoToFollow = useMemo(() => {
    const unique = new Map()

    sidebarPosts.forEach((post, index) => {
      const label = post.eyebrow || `Fonte Inspire ${index + 1}`

      if (!unique.has(label)) {
        unique.set(label, {
          name: label,
          description:
            index % 2 === 0
              ? 'Curadoria editorial sobre sistemas, crescimento e design.'
              : 'Publica notas práticas para quem constrói com consistência.',
        })
      }
    })

    return [...unique.values()].slice(0, 3)
  }, [sidebarPosts])

  return (
    <div className="inspire-page">
      <div className="inspire-page__grid">
        <section className="inspire-page__feed">
          <div className="inspire-page__tabs" role="tablist" aria-label="Seções do Inspire">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'for-you'}
              className={`inspire-page__tab ${activeTab === 'for-you' ? 'is-active' : ''}`.trim()}
              onClick={() => setActiveTab('for-you')}
            >
              Para você
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'featured'}
              className={`inspire-page__tab ${activeTab === 'featured' ? 'is-active' : ''}`.trim()}
              onClick={() => setActiveTab('featured')}
            >
              Em destaque
            </button>
          </div>

          {loading ? (
            <div className="inspire-page__loading" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="inspire-page__loading-row" />
              ))}
            </div>
          ) : (
            <div className="inspire-page__stories">
              {visiblePosts.map((post, index) => {
                const stats = deriveStoryStats(post, index)

                return (
                  <article key={post.slug || `${post.title}-${index}`} className="inspire-story">
                    <div className="inspire-story__content">
                      <p className="inspire-story__kicker">
                        {post.eyebrow || 'Otimiza Editorial'}
                      </p>

                      <Link to={post.link || `/inspire/${post.slug}`} className="inspire-story__title-link">
                        <h2 className="inspire-story__title">{post.title}</h2>
                      </Link>

                      {post.description && (
                        <p className="inspire-story__summary">{post.description}</p>
                      )}

                      <div className="inspire-story__meta-row">
                        <div className="inspire-story__stats">
                          <span className="inspire-story__date">{formatStoryDate(post.publishedAt)}</span>
                          <span>{stats.readTime} min de leitura</span>
                          <PostLikeButton slug={post.slug} variant="feed" />
                        </div>

                        <div className="inspire-story__actions">
                          <button type="button" className="inspire-story__action-button">
                            <Share2 size={16} strokeWidth={1.8} />
                            <span>Compartilhar</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={post.link || `/inspire/${post.slug}`}
                      className="inspire-story__thumb-link"
                      aria-label={`Ler ${post.title}`}
                    >
                      {post.imgSrc ? (
                        <img
                          src={post.imgSrc}
                          alt=""
                          className="inspire-story__thumb"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="inspire-story__thumb inspire-story__thumb--placeholder" />
                      )}
                    </Link>
                  </article>
                )
              })}

              {activeTab === 'for-you' && (loadingMore || loadMoreError || hasMore) && (
                <div className="inspire-page__load-more-state">
                  {loadingMore && <div className="inspire-page__load-more-indicator" aria-hidden="true" />}
                  {!loadingMore && loadMoreError && (
                    <button
                      type="button"
                      className="inspire-page__load-more-retry"
                      onClick={loadMorePosts}
                    >
                      Tentar carregar novamente
                    </button>
                  )}
                  {!loadingMore && !loadMoreError && hasMore && (
                    <div ref={loadMoreSentinelRef} className="inspire-page__sentinel" aria-hidden="true" />
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="inspire-sidebar">
          <section className="inspire-sidebar__section">
            <h2 className="inspire-sidebar__title">Seleções da redação</h2>
            <div className="inspire-sidebar__stack">
              {staffPicks.map((post, index) => (
                <Link
                  key={post.slug || `${post.title}-${index}`}
                  to={post.link || `/inspire/${post.slug}`}
                  className="inspire-sidebar__story"
                >
                  <p className="inspire-sidebar__eyebrow">{post.eyebrow || 'Inspire'}</p>
                  <h3 className="inspire-sidebar__story-title">{post.title}</h3>
                  <p className="inspire-sidebar__story-date">{formatStoryDate(post.publishedAt)}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="inspire-sidebar__section">
            <h2 className="inspire-sidebar__title">Tópicos recomendados</h2>
            <div className="inspire-sidebar__topics">
              {recommendedTopics.map((topic) => (
                <button key={topic} type="button" className="inspire-sidebar__topic">
                  {topic}
                </button>
              ))}
            </div>
          </section>

          <section className="inspire-sidebar__section">
            <h2 className="inspire-sidebar__title">Quem seguir</h2>
            <div className="inspire-sidebar__follow-list">
              {whoToFollow.map((person) => (
                <div key={person.name} className="inspire-sidebar__follow-card">
                  <div>
                    <p className="inspire-sidebar__follow-name">{person.name}</p>
                    <p className="inspire-sidebar__follow-copy">{person.description}</p>
                  </div>
                  <button type="button" className="inspire-sidebar__follow-button">
                    Seguir
                  </button>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default Inspire
