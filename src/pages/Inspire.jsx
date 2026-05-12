import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, Share2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { client } from '../lib/sanity'
import { staticBlogPosts } from '../data/blogPosts'
import { deriveCategoryOptions, sortByDate } from '../lib/blogFilters'
import { getCachedInspirePosts, setCachedInspirePosts } from '../lib/inspirePostCache'
import PostLikeButton from '../components/PostLikeButton'

const INITIAL_POST_COUNT = 15
const POSTS_PER_BATCH = 5
const STATIC_FALLBACK_POSTS = sortByDate(staticBlogPosts)
const INITIAL_FALLBACK_POSTS = STATIC_FALLBACK_POSTS.slice(0, INITIAL_POST_COUNT)
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

const SEARCH_QUERY = `*[_type == "post" && (
  title match $term ||
  description match $term ||
  eyebrow match $term
)] | order(publishedAt desc) {
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
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  const [posts, setPosts] = useState(() => {
    const cachedPosts = getCachedInspirePosts()
    return cachedPosts.length > 0 ? cachedPosts : INITIAL_FALLBACK_POSTS
  })
  const [sidebarPosts, setSidebarPosts] = useState(() => {
    const cachedPosts = getCachedInspirePosts()
    return cachedPosts.length > 0 ? cachedPosts : INITIAL_FALLBACK_POSTS
  })
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(() => getCachedInspirePosts().length >= INITIAL_POST_COUNT)
  const [activeTab, setActiveTab] = useState('for-you')
  const [usingStaticFallback, setUsingStaticFallback] = useState(() => getCachedInspirePosts().length === 0)
  const [nextOffset, setNextOffset] = useState(() => {
    const cachedPosts = getCachedInspirePosts()
    return cachedPosts.length > 0 ? cachedPosts.length : INITIAL_FALLBACK_POSTS.length
  })
  const [loadMoreError, setLoadMoreError] = useState('')
  const loadMoreSentinelRef = useRef(null)
  const searchTimerRef = useRef(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const dynamicPosts = await fetchPostBatch(0, INITIAL_POST_COUNT)

        if (dynamicPosts && dynamicPosts.length > 0) {
          const sortedPosts = sortByDate(dynamicPosts)
          setCachedInspirePosts(sortedPosts)
          setUsingStaticFallback(false)
          setPosts(sortedPosts)
          setSidebarPosts(sortedPosts)
          setNextOffset(sortedPosts.length)
          setHasMore(dynamicPosts.length === INITIAL_POST_COUNT)
        } else {
          setUsingStaticFallback(true)
          setPosts(INITIAL_FALLBACK_POSTS)
          setSidebarPosts(INITIAL_FALLBACK_POSTS)
          setNextOffset(INITIAL_FALLBACK_POSTS.length)
          setHasMore(STATIC_FALLBACK_POSTS.length > INITIAL_FALLBACK_POSTS.length)
        }
      } catch (error) {
        console.error('Error fetching posts from Sanity:', error)

        setUsingStaticFallback(true)
        setPosts(INITIAL_FALLBACK_POSTS)
        setSidebarPosts(INITIAL_FALLBACK_POSTS)
        setNextOffset(INITIAL_FALLBACK_POSTS.length)
        setHasMore(STATIC_FALLBACK_POSTS.length > INITIAL_FALLBACK_POSTS.length)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  /* ── Search: query Sanity for ALL matching posts ── */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }

    setSearchLoading(true)

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }

    searchTimerRef.current = setTimeout(async () => {
      try {
        const term = `${searchQuery}*`

        if (usingStaticFallback) {
          const q = searchQuery.toLowerCase()
          const filtered = STATIC_FALLBACK_POSTS.filter((post) => {
            const title = (post.title || '').toLowerCase()
            const description = (post.description || '').toLowerCase()
            const eyebrow = (post.eyebrow || '').toLowerCase()
            return title.includes(q) || description.includes(q) || eyebrow.includes(q)
          })
          setSearchResults(filtered)
        } else {
          const results = await client.fetch(SEARCH_QUERY, { term })
          setSearchResults(sortByDate(results || []))
        }
      } catch (error) {
        console.error('Search error:', error)
        const q = searchQuery.toLowerCase()
        const localFiltered = posts.filter((post) => {
          const title = (post.title || '').toLowerCase()
          const description = (post.description || '').toLowerCase()
          const eyebrow = (post.eyebrow || '').toLowerCase()
          return title.includes(q) || description.includes(q) || eyebrow.includes(q)
        })
        setSearchResults(localFiltered)
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [searchQuery, usingStaticFallback, posts])

  const loadMorePosts = useCallback(async () => {
    if (loading || loadingMore || !hasMore) {
      return
    }

    setLoadingMore(true)
    setLoadMoreError('')

    try {
      let nextBatch = []

      if (usingStaticFallback) {
        nextBatch = STATIC_FALLBACK_POSTS.slice(nextOffset, nextOffset + POSTS_PER_BATCH)
      } else {
        nextBatch = await fetchPostBatch(nextOffset, nextOffset + POSTS_PER_BATCH)
      }

      const sortedBatch = sortByDate(nextBatch)

      setPosts((currentPosts) => {
        const mergedPosts = [...currentPosts, ...sortedBatch]

        if (!usingStaticFallback) {
          setCachedInspirePosts(mergedPosts)
        }

        return mergedPosts
      })
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
    if (searchQuery) {
      return searchResults
    }

    if (activeTab === 'featured') {
      return posts.slice(0, 6)
    }

    return posts
  }, [activeTab, posts, searchQuery, searchResults])

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

  function buildPostState(post) {
    return {
      postPreview: {
        title: post.title,
        description: post.description,
        publishedAt: post.publishedAt,
        eyebrow: post.eyebrow,
        imgSrc: post.imgSrc,
        slug: post.slug,
      },
    }
  }

  const isSearching = searchQuery.length > 0

  return (
    <div className="inspire-page">
      <div className="inspire-page__grid">
        <section className="inspire-page__feed">
          {!isSearching && (
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
          )}

          {isSearching && (
            <div className="inspire-page__search-status">
              <Search size={18} strokeWidth={1.8} />
              <p>
                {searchLoading
                  ? 'Buscando...'
                  : visiblePosts.length === 0
                    ? `Nenhum resultado encontrado para "${searchQuery}"`
                    : `${visiblePosts.length} resultado${visiblePosts.length !== 1 ? 's' : ''} para "${searchQuery}"`}
              </p>
            </div>
          )}

          {(loading || (isSearching && searchLoading)) ? (
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

                      <Link
                        to={post.link || `/inspire/${post.slug}`}
                        state={buildPostState(post)}
                        className="inspire-story__title-link"
                      >
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
                      state={buildPostState(post)}
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

              {!isSearching && activeTab === 'for-you' && (loadingMore || loadMoreError || hasMore) && (
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
                  state={buildPostState(post)}
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
