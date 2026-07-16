import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { client } from '../lib/sanity'
import { staticBlogPosts } from '../data/blogPosts'
import { matchesInspireCategory, sortByDate } from '../lib/blogFilters'
import { getCachedInspirePosts, setCachedInspirePosts } from '../lib/inspirePostCache'
import {
  buildInspireBroadPattern,
  buildInspireSearchPattern,
  rankInspireSearchResults,
} from '../lib/inspireSearch'
import PostLikeButton from '../components/PostLikeButton'
import InspireNewsletterSignup from '../components/InspireNewsletterSignup'
import InspireShareButton from '../components/InspireShareButton'

const INITIAL_POST_COUNT = 15
const POSTS_PER_BATCH = 5
const STATIC_FALLBACK_POSTS = sortByDate(staticBlogPosts)
const INITIAL_FALLBACK_POSTS = STATIC_FALLBACK_POSTS.slice(0, INITIAL_POST_COUNT)
const INSPIRE_FILTERS = [
  { key: 'all', label: 'Tudo', category: null },
  { key: 'articles', label: 'Artigos', category: 'Artigos' },
  { key: 'editorial', label: 'Editorial', category: 'Editorial' },
  { key: 'reading-tip', label: 'Dica de leitura', category: 'Dica de Leitura' },
  { key: 'watch-tip', label: 'Dica para assistir', category: 'Dica para assistir' },
  { key: 'analytical-lens', label: 'Lente analítica', category: 'Lente Analítica' },
]
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

const CATEGORY_POSTS_QUERY = `*[_type == "post" && eyebrow == $category] | order(publishedAt desc) [$start...$end] {
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
  title match $foldedTerm ||
  title match $broadTerm ||
  description match $term ||
  description match $foldedTerm ||
  description match $broadTerm ||
  eyebrow match $term ||
  eyebrow match $foldedTerm ||
  eyebrow match $broadTerm
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

function deriveStoryStats(post) {
  const readTime = Math.max(3, Math.round(((post.description ?? '').length + post.title.length) / 42))

  return { readTime }
}

async function fetchPostBatch(start, end, category = null) {
  if (category) {
    return client.fetch(CATEGORY_POSTS_QUERY, { category, start, end })
  }

  return client.fetch(POSTS_QUERY, { start, end })
}

function Inspire() {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''
  const cachedPosts = useMemo(() => getCachedInspirePosts(), [])

  const [allFeed, setAllFeed] = useState(() => ({
    posts: cachedPosts.length > 0 ? cachedPosts : INITIAL_FALLBACK_POSTS,
    nextOffset: cachedPosts.length > 0 ? cachedPosts.length : INITIAL_FALLBACK_POSTS.length,
    hasMore: cachedPosts.length >= INITIAL_POST_COUNT,
  }))
  const [categoryFeed, setCategoryFeed] = useState({ posts: [], nextOffset: 0, hasMore: false })
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeFilterKey, setActiveFilterKey] = useState('all')
  const [sourceStatus, setSourceStatus] = useState(cachedPosts.length > 0 ? 'sanity' : 'pending')
  const [loadMoreError, setLoadMoreError] = useState('')
  const loadMoreSentinelRef = useRef(null)
  const searchTimerRef = useRef(null)
  const activeFilterRef = useRef(INSPIRE_FILTERS[0])
  const requestVersionRef = useRef(0)

  const activeFilter = useMemo(
    () => INSPIRE_FILTERS.find((filter) => filter.key === activeFilterKey) ?? INSPIRE_FILTERS[0],
    [activeFilterKey],
  )
  const visibleFeed = activeFilter.category ? categoryFeed : allFeed

  const loadCategoryFirstBatch = useCallback(async (filter, confirmedSource) => {
    if (!filter.category || confirmedSource === 'pending') {
      return
    }

    const requestVersion = ++requestVersionRef.current
    setCategoryLoading(true)
    setLoadMoreError('')

    try {
      const nextPosts = confirmedSource === 'fallback'
        ? STATIC_FALLBACK_POSTS.filter((post) => matchesInspireCategory(post, filter.category))
        : sortByDate(await fetchPostBatch(0, INITIAL_POST_COUNT, filter.category) || [])
      const firstBatch = confirmedSource === 'fallback'
        ? nextPosts.slice(0, INITIAL_POST_COUNT)
        : nextPosts

      if (requestVersion !== requestVersionRef.current) {
        return
      }

      setCategoryFeed({
        posts: firstBatch,
        nextOffset: firstBatch.length,
        hasMore: confirmedSource === 'fallback'
          ? nextPosts.length > firstBatch.length
          : firstBatch.length === INITIAL_POST_COUNT,
      })
    } catch (error) {
      console.error('Error fetching category posts from Sanity:', error)

      if (requestVersion === requestVersionRef.current) {
        setCategoryFeed({ posts: [], nextOffset: 0, hasMore: false })
        setLoadMoreError('Não foi possível carregar esta categoria agora.')
      }
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setCategoryLoading(false)
      }
    }
  }, [])

  const selectFilter = useCallback((filter) => {
    activeFilterRef.current = filter
    setActiveFilterKey(filter.key)
    setLoadMoreError('')
    setLoadingMore(false)
    ++requestVersionRef.current

    if (!filter.category) {
      setCategoryLoading(false)
      return
    }

    if (sourceStatus === 'pending') {
      setCategoryLoading(true)
      return
    }

    loadCategoryFirstBatch(filter, sourceStatus)
  }, [loadCategoryFirstBatch, sourceStatus])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const dynamicPosts = await fetchPostBatch(0, INITIAL_POST_COUNT)

        if (dynamicPosts && dynamicPosts.length > 0) {
          const sortedPosts = sortByDate(dynamicPosts)
          setCachedInspirePosts(sortedPosts)
          setSourceStatus('sanity')
          setAllFeed({
            posts: sortedPosts,
            nextOffset: sortedPosts.length,
            hasMore: dynamicPosts.length === INITIAL_POST_COUNT,
          })
          if (activeFilterRef.current.category) {
            loadCategoryFirstBatch(activeFilterRef.current, 'sanity')
          }
        } else {
          setSourceStatus('fallback')
          setAllFeed({
            posts: INITIAL_FALLBACK_POSTS,
            nextOffset: INITIAL_FALLBACK_POSTS.length,
            hasMore: STATIC_FALLBACK_POSTS.length > INITIAL_FALLBACK_POSTS.length,
          })
          if (activeFilterRef.current.category) {
            loadCategoryFirstBatch(activeFilterRef.current, 'fallback')
          }
        }
      } catch (error) {
        console.error('Error fetching posts from Sanity:', error)

        setSourceStatus('fallback')
        setAllFeed({
          posts: INITIAL_FALLBACK_POSTS,
          nextOffset: INITIAL_FALLBACK_POSTS.length,
          hasMore: STATIC_FALLBACK_POSTS.length > INITIAL_FALLBACK_POSTS.length,
        })
        if (activeFilterRef.current.category) {
          loadCategoryFirstBatch(activeFilterRef.current, 'fallback')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [loadCategoryFirstBatch])

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

        if (sourceStatus === 'fallback') {
          setSearchResults(rankInspireSearchResults(STATIC_FALLBACK_POSTS, searchQuery))
        } else {
          const broadTerm = buildInspireBroadPattern(searchQuery)
          const foldedTerm = buildInspireSearchPattern(searchQuery)
          const results = await client.fetch(SEARCH_QUERY, { broadTerm, foldedTerm, term })
          setSearchResults(rankInspireSearchResults(sortByDate(results || []), searchQuery))
        }
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults(rankInspireSearchResults(allFeed.posts, searchQuery))
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [allFeed.posts, searchQuery, sourceStatus])

  const loadMorePosts = useCallback(async () => {
    if (loading || categoryLoading || loadingMore || !visibleFeed.hasMore || sourceStatus === 'pending') {
      return
    }

    setLoadingMore(true)
    setLoadMoreError('')
    const requestVersion = requestVersionRef.current
    const category = activeFilter.category

    try {
      let nextBatch = []
      let fallbackCollection = []

      if (sourceStatus === 'fallback') {
        fallbackCollection = category
          ? STATIC_FALLBACK_POSTS.filter((post) => matchesInspireCategory(post, category))
          : STATIC_FALLBACK_POSTS
        nextBatch = fallbackCollection.slice(
          visibleFeed.nextOffset,
          visibleFeed.nextOffset + POSTS_PER_BATCH,
        )
      } else {
        nextBatch = await fetchPostBatch(
          visibleFeed.nextOffset,
          visibleFeed.nextOffset + POSTS_PER_BATCH,
          category,
        )
      }

      const sortedBatch = sortByDate(nextBatch)

      if (requestVersion !== requestVersionRef.current) {
        return
      }

      const updateFeed = (currentFeed) => {
        const mergedPosts = [...currentFeed.posts, ...sortedBatch]
        const nextOffset = currentFeed.nextOffset + sortedBatch.length

        if (!category && sourceStatus === 'sanity') {
          setCachedInspirePosts(mergedPosts)
        }

        return {
          posts: mergedPosts,
          nextOffset,
          hasMore: sourceStatus === 'fallback'
            ? nextOffset < fallbackCollection.length
            : sortedBatch.length === POSTS_PER_BATCH,
        }
      }

      if (category) {
        setCategoryFeed(updateFeed)
      } else {
        setAllFeed(updateFeed)
      }
    } catch (error) {
      if (requestVersion === requestVersionRef.current) {
        console.error('Error fetching more posts from Sanity:', error)
        setLoadMoreError('Não foi possível carregar mais histórias agora.')
      }
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setLoadingMore(false)
      }
    }
  }, [activeFilter.category, categoryLoading, loading, loadingMore, sourceStatus, visibleFeed])

  const retryCurrentFeed = useCallback(() => {
    if (activeFilter.category && categoryFeed.posts.length === 0) {
      loadCategoryFirstBatch(activeFilter, sourceStatus)
      return
    }

    loadMorePosts()
  }, [activeFilter, categoryFeed.posts.length, loadCategoryFirstBatch, loadMorePosts, sourceStatus])

  useEffect(() => {
    if (
      loading ||
      categoryLoading ||
      loadingMore ||
      !visibleFeed.hasMore ||
      searchQuery ||
      !loadMoreSentinelRef.current
    ) {
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        loadMorePosts()
      }
    })

    observer.observe(loadMoreSentinelRef.current)

    return () => observer.disconnect()
  }, [categoryLoading, loadMorePosts, loading, loadingMore, searchQuery, visibleFeed.hasMore])

  const visiblePosts = useMemo(() => {
    if (searchQuery) {
      return searchResults
    }

    return visibleFeed.posts
  }, [searchQuery, searchResults, visibleFeed.posts])

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
      <h1 className="sr-only">Inspire: conteúdos sobre gestão e processos</h1>
      <div className="inspire-page__grid">
        <section className="inspire-page__feed" data-lenis-prevent-wheel>
          {!isSearching && (
            <div
              className="inspire-page__tabs"
              role="group"
              aria-label="Filtrar artigos por categoria"
            >
              {INSPIRE_FILTERS.map((filter) => {
                const isActive = activeFilterKey === filter.key

                return (
                  <button
                    key={filter.key}
                    type="button"
                    aria-pressed={isActive}
                    className={`inspire-page__tab ${isActive ? 'is-active' : ''}`.trim()}
                    data-inspire-tooltip={`Filtrar por ${filter.label}`}
                    onClick={() => selectFilter(filter)}
                  >
                    {filter.label}
                  </button>
                )
              })}
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

          {(loading || categoryLoading || (isSearching && searchLoading)) ? (
            <div className="inspire-page__loading" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="inspire-page__loading-row" />
              ))}
            </div>
          ) : (
            <div className="inspire-page__stories">
              {visiblePosts.map((post, index) => {
                const stats = deriveStoryStats(post)

                return (
                  <article key={post.slug || `${post.title}-${index}`} className="inspire-story">
                    <div className="inspire-story__content">
                      <p className="inspire-category-label inspire-story__kicker">
                        {post.inspireCategory || post.eyebrow || 'Otimiza Editorial'}
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
                          <InspireShareButton
                            className="inspire-story__action-button"
                            title={post.title}
                            url={post.link || `/inspire/${post.slug}`}
                          />
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

              {!isSearching && !loadMoreError && visiblePosts.length === 0 && (
                <p className="inspire-page__empty">Nenhum artigo encontrado nesta categoria.</p>
              )}

              {!isSearching && (loadingMore || loadMoreError || visibleFeed.hasMore) && (
                <div className="inspire-page__load-more-state">
                  {loadingMore && <div className="inspire-page__load-more-indicator" aria-hidden="true" />}
                  {!loadingMore && loadMoreError && (
                    <button
                      type="button"
                      className="inspire-page__load-more-retry"
                      data-inspire-tooltip="Tentar novamente"
                      onClick={retryCurrentFeed}
                    >
                      Tentar carregar novamente
                    </button>
                  )}
                  {!loadingMore && !loadMoreError && visibleFeed.hasMore && (
                    <div ref={loadMoreSentinelRef} className="inspire-page__sentinel" aria-hidden="true" />
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="inspire-sidebar">
          <InspireNewsletterSignup />
        </aside>
      </div>
    </div>
  )
}

export default Inspire
