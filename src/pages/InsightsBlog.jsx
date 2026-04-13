import { useEffect, useState, useMemo, useCallback } from 'react'
import { client } from '../lib/sanity'
import { staticBlogPosts } from '../data/blogPosts'
import { ProjectCard } from '../components/ui/project-card'
import { FeaturedHero } from '../components/ui/featured-hero'
import { FilterBar } from '../components/ui/filter-bar'
import { sitePages } from '../data/sitePages'
import {
  sortByDate,
  deriveMonthOptions,
  deriveCategoryOptions,
  filterPosts,
  splitFeaturedAndGrid,
} from '../lib/blogFilters'
import { SearchX } from 'lucide-react'

const GRID_PAGE_SIZE = 10

function InsightsBlog() {
  const [allPosts, setAllPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeMonth, setActiveMonth] = useState(null)
  const [activeCategories, setActiveCategories] = useState(new Set())
  const [visibleCount, setVisibleCount] = useState(GRID_PAGE_SIZE)

  const pageData = sitePages['insights-e-blog']

  // ── Fetch ──
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const query = `*[_type == "post"] | order(publishedAt desc) {
          title,
          description,
          "imgSrc": mainImage.asset->url,
          "slug": slug.current,
          "link": "/insights-e-blog/" + slug.current,
          eyebrow,
          publishedAt,
          "linkText": "Ler artigo"
        }`
        const dynamicPosts = await client.fetch(query)
        if (dynamicPosts && dynamicPosts.length > 0) {
          setAllPosts(sortByDate(dynamicPosts))
        } else {
          setAllPosts(sortByDate(staticBlogPosts))
        }
      } catch (error) {
        console.error('Error fetching posts from Sanity:', error)
        setAllPosts(sortByDate(staticBlogPosts))
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  // ── Derived filter options ──
  const monthOptions = useMemo(() => deriveMonthOptions(allPosts), [allPosts])
  const categoryOptions = useMemo(() => deriveCategoryOptions(allPosts), [allPosts])

  // ── Filtered list ──
  const filtered = useMemo(
    () => filterPosts(allPosts, activeMonth, activeCategories),
    [allPosts, activeMonth, activeCategories],
  )

  // ── Featured / Grid split ──
  const { featured, grid } = useMemo(
    () => splitFeaturedAndGrid(filtered),
    [filtered],
  )

  const visibleGrid = grid.slice(0, visibleCount)
  const hasMore = visibleCount < grid.length

  // ── Filter callbacks ──
  const handleMonthChange = useCallback((key) => {
    setActiveMonth(key)
    setVisibleCount(GRID_PAGE_SIZE)
  }, [])

  const handleCategoryToggle = useCallback((normalized) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(normalized)) {
        next.delete(normalized)
      } else {
        next.add(normalized)
      }
      return next
    })
    setVisibleCount(GRID_PAGE_SIZE)
  }, [])

  const handleClearFilters = useCallback(() => {
    setActiveMonth(null)
    setActiveCategories(new Set())
    setVisibleCount(GRID_PAGE_SIZE)
  }, [])

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + GRID_PAGE_SIZE)
  }, [])

  // ── Active filter summary (for empty state) ──
  const filterSummary = useMemo(() => {
    const parts = []
    if (activeMonth) {
      const opt = monthOptions.find((o) => o.key === activeMonth)
      parts.push(opt?.label ?? activeMonth)
    }
    if (activeCategories.size > 0) {
      const labels = categoryOptions
        .filter((o) => activeCategories.has(o.normalized))
        .map((o) => o.label)
      parts.push(labels.join(', '))
    }
    return parts.join(' · ')
  }, [activeMonth, activeCategories, monthOptions, categoryOptions])

  const hasFilters = activeMonth !== null || activeCategories.size > 0

  // ── Render ──
  return (
    <div className="insights-page">
      {/* ── Header ── */}
      <header className="insights-page__header">
        <p className="insights-page__badge animate-enter">
          {pageData.title}
        </p>
        <h1 className="insights-page__title animate-enter [animation-delay:150ms]">
          Insights e Artigos
        </h1>
        <p className="insights-page__intro animate-enter [animation-delay:300ms]">
          {pageData.intro}
        </p>
      </header>

      {/* ── Loading ── */}
      {loading && (
        <div className="insights-page__loading">
          <div className="insights-page__skeleton-hero">
            <div className="insights-page__skeleton-primary" />
            <div className="insights-page__skeleton-sidebar">
              <div className="insights-page__skeleton-secondary" />
              <div className="insights-page__skeleton-secondary" />
              <div className="insights-page__skeleton-secondary" />
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {!loading && (
        <>
          {/* Featured Area */}
          {filtered.length > 0 && (
            <div className="animate-enter [animation-delay:400ms]">
              <FeaturedHero posts={featured} />
            </div>
          )}

          {/* Filter Bar */}
          <div className="animate-enter [animation-delay:500ms]">
            <FilterBar
              monthOptions={monthOptions}
              categoryOptions={categoryOptions}
              activeMonth={activeMonth}
              activeCategories={activeCategories}
              onMonthChange={handleMonthChange}
              onCategoryToggle={handleCategoryToggle}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Empty State */}
          {filtered.length === 0 && hasFilters && (
            <div className="insights-page__empty">
              <div className="insights-page__empty-icon">
                <SearchX size={48} strokeWidth={1.5} />
              </div>
              <h2 className="insights-page__empty-title">
                Nenhum resultado encontrado
              </h2>
              <p className="insights-page__empty-desc">
                Nenhum artigo corresponde aos filtros selecionados
                {filterSummary && (
                  <>: <strong>{filterSummary}</strong></>
                )}
              </p>
              <button
                type="button"
                className="insights-page__empty-clear"
                onClick={handleClearFilters}
              >
                Limpar filtros
              </button>
            </div>
          )}

          {/* Grid Feed */}
          {visibleGrid.length > 0 && (
            <div className="animate-enter [animation-delay:600ms]">
              <div className="insights-page__grid">
                {visibleGrid.map((post) => {
                  const { publishedAt, slug, ...cardProps } = post
                  return (
                    <div key={slug || post.title} className="flex flex-col h-full">
                      <ProjectCard {...cardProps} />
                    </div>
                  )
                })}
              </div>

              {hasMore && (
                <div className="insights-page__load-more-wrap">
                  <button
                    type="button"
                    className="insights-page__load-more"
                    onClick={handleLoadMore}
                  >
                    Carregar mais
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default InsightsBlog