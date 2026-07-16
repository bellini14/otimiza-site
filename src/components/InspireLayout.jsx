import { ArrowLeft, Mail, Search, X } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import InspireAnimatedLogo from './InspireAnimatedLogo'
import InspireCursorTooltip from './InspireCursorTooltip'
import {
  buildInspireBroadPattern,
  buildInspireSearchPattern,
  rankInspireSearchResults,
} from '../lib/inspireSearch'
import { client } from '../lib/sanity'
import usePageTransitionNavigate from '../transitions/usePageTransitionNavigate'

const INTERNAL_SEARCH_UPDATE_STATE_KEY = '__otimizaInspireSearchUpdateId'
const SEARCH_SUGGESTIONS_DELAY_MS = 180
const SEARCH_SUGGESTIONS_QUERY = `*[_type == "post" && (
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
  eyebrow,
  publishedAt
}`

function InspireLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const navigateWithTransition = usePageTransitionNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const isLandingPage = location.pathname === '/inspire'

  const [searchValue, setSearchValue] = useState(() => searchParams.get('q') || '')
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const searchComponentInstanceId = useId()
  const searchShellRef = useRef(null)
  const searchUpdateCounterRef = useRef(0)
  const pendingInternalSearchUpdatesRef = useRef(new Map())
  const suggestionRequestVersionRef = useRef(0)

  const handleBackClick = (event) => {
    if (isLandingPage) {
      navigateWithTransition('/', { sourceEvent: event })
      return
    }

    navigateWithTransition(-1, { sourceEvent: event })
  }

  const writeSearchParams = useCallback(
    (update, options = {}) => {
      searchUpdateCounterRef.current += 1
      const updateId = `inspire-search-${searchComponentInstanceId}-${searchUpdateCounterRef.current}`
      pendingInternalSearchUpdatesRef.current.set(updateId, searchUpdateCounterRef.current)
      const navigationState = {
        ...(location.state ?? {}),
        [INTERNAL_SEARCH_UPDATE_STATE_KEY]: updateId,
      }

      if (!isLandingPage) {
        const currentParams = new URLSearchParams(searchParams)
        const nextParams = typeof update === 'function' ? update(currentParams) : update
        const serializedParams = new URLSearchParams(nextParams).toString()

        navigate(
          {
            pathname: '/inspire',
            search: serializedParams ? `?${serializedParams}` : '',
          },
          {
            ...options,
            replace: false,
            state: navigationState,
          },
        )
        return
      }

      setSearchParams(update, {
        ...options,
        state: navigationState,
      })
    },
    [isLandingPage, location.state, navigate, searchComponentInstanceId, searchParams, setSearchParams],
  )

  const clearSearch = useCallback(() => {
    setSearchValue('')
    setSuggestions([])
    setSuggestionsOpen(false)
    setActiveSuggestionIndex(-1)
    writeSearchParams((prev) => {
      prev.delete('q')
      return prev
    })
  }, [writeSearchParams])

  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value
      const normalizedValue = value.trim()
      setSearchValue(value)
      setSuggestionsOpen(Boolean(normalizedValue))
      setActiveSuggestionIndex(-1)

      writeSearchParams(
        (prev) => {
          if (normalizedValue) {
            prev.set('q', normalizedValue)
          } else {
            prev.delete('q')
          }

          return prev
        },
        { replace: true },
      )
    },
    [writeSearchParams],
  )

  const handleSearchKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowDown' && suggestionsOpen && suggestions.length > 0) {
        e.preventDefault()
        setActiveSuggestionIndex((currentIndex) =>
          currentIndex >= suggestions.length - 1 ? 0 : currentIndex + 1,
        )
        return
      }

      if (e.key === 'ArrowUp' && suggestionsOpen && suggestions.length > 0) {
        e.preventDefault()
        setActiveSuggestionIndex((currentIndex) =>
          currentIndex <= 0 ? suggestions.length - 1 : currentIndex - 1,
        )
        return
      }

      if (e.key === 'Enter') {
        if (suggestionsOpen && activeSuggestionIndex >= 0) {
          const selectedSuggestion = suggestions[activeSuggestionIndex]

          if (selectedSuggestion?.slug) {
            e.preventDefault()
            setSuggestionsOpen(false)
            setActiveSuggestionIndex(-1)
            navigate(`/inspire/${selectedSuggestion.slug}`, {
              state: { postPreview: selectedSuggestion },
            })
          }
          return
        }

        setSuggestionsOpen(false)
        setActiveSuggestionIndex(-1)
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        setSuggestionsOpen(false)
        setActiveSuggestionIndex(-1)
        e.target.blur()
      }
    },
    [activeSuggestionIndex, navigate, suggestions, suggestionsOpen],
  )

  useEffect(() => {
    const normalizedValue = searchValue.trim()
    suggestionRequestVersionRef.current += 1
    const requestVersion = suggestionRequestVersionRef.current

    if (!normalizedValue) {
      setSuggestions([])
      setSuggestionsLoading(false)
      setSuggestionsOpen(false)
      setActiveSuggestionIndex(-1)
      return undefined
    }

    if (!suggestionsOpen) {
      setSuggestionsLoading(false)
      return undefined
    }

    setSuggestionsLoading(true)
    setActiveSuggestionIndex(-1)

    const timerId = window.setTimeout(async () => {
      try {
        const nextSuggestions = await client.fetch(SEARCH_SUGGESTIONS_QUERY, {
          broadTerm: buildInspireBroadPattern(normalizedValue),
          foldedTerm: buildInspireSearchPattern(normalizedValue),
          term: `${normalizedValue}*`,
        })

        if (suggestionRequestVersionRef.current !== requestVersion) return

        setSuggestions(
          rankInspireSearchResults(
            (nextSuggestions || []).filter((suggestion) => suggestion.slug),
            normalizedValue,
          ).slice(0, 5),
        )
      } catch (error) {
        if (suggestionRequestVersionRef.current !== requestVersion) return

        console.error('Erro ao carregar sugestões do Inspire:', error)
        setSuggestions([])
      } finally {
        if (suggestionRequestVersionRef.current === requestVersion) {
          setSuggestionsLoading(false)
        }
      }
    }, SEARCH_SUGGESTIONS_DELAY_MS)

    return () => window.clearTimeout(timerId)
  }, [searchValue, suggestionsOpen])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!searchShellRef.current?.contains(event.target)) {
        setSuggestionsOpen(false)
        setActiveSuggestionIndex(-1)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  useEffect(() => {
    const q = searchParams.get('q') || ''
    const internalUpdateId = location.state?.[INTERNAL_SEARCH_UPDATE_STATE_KEY]
    const pendingInternalUpdates = pendingInternalSearchUpdatesRef.current
    const internalUpdateSequence = pendingInternalUpdates.get(internalUpdateId)

    if (internalUpdateSequence !== undefined) {
      pendingInternalUpdates.forEach((sequence, updateId) => {
        if (sequence <= internalUpdateSequence) {
          pendingInternalUpdates.delete(updateId)
        }
      })
      return
    }

    pendingInternalUpdates.clear()
    setSearchValue(q)
  }, [location.state, searchParams])

  return (
    <div className="inspire-shell overflow-x-hidden">
      <header className="inspire-shell__topbar">
        <nav
          className="inspire-shell__topbar-inner mx-auto w-full max-w-full px-6 sm:px-8 lg:px-12"
          aria-label="Navegação do Inspire"
        >
          <div className="inspire-shell__brand-group">
            <button
              type="button"
              className="inspire-shell__icon-button inspire-shell__back-link"
              aria-label="Voltar para a página anterior"
              data-inspire-tooltip="Voltar"
              onClick={handleBackClick}
            >
              <ArrowLeft size={22} strokeWidth={1.8} />
            </button>

            <Link to="/inspire" className="inspire-shell__wordmark" aria-label="Home Inspire">
              {/* Icon — hidden by default, slides in on hover */}
              <svg
                className="inspire-shell__logo-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 400 373.1"
                aria-hidden="true"
              >
                <path
                  fill="#d0d5e0"
                  d="M375.4,263.7c2.6-9,4-18.3,4-27.7,0-53.5-43.4-97.3-96.9-97.9-1-1.1-2.1-2.2-3.2-3.2-.6-.6-1.2-1.2-1.8-1.8C210.4,65.9,137.8,20.8,96.7,20.8h0c-10,0-17.8,2.7-23.2,8.2l-40.6,49.5c-8.5,11.6-13.6,27.5-15,46,0,.6-.1,1.4-.1,2,0,.3,0,.7,0,1,0,.3,0,.6,0,1v.4c0,.3,0,.5,0,.8,0,.3,0,.7,0,.9,0,2.5,0,5,0,7.5v1.2c0,.3,0,.6,0,.9,0,.3,0,.5,0,.8.1,3.9.4,7.7.8,11.1,0,1.1.2,2.3.3,3.3,0,.5.1,1.1.3,1.6l.2,1.7c.3,1.7.5,3.3.8,5.1,4.5,26.6,14.7,54.6,29.5,80.7,20.1,35.5,46.7,64.9,75.1,82.7,1.8,1.1,3.6,2.3,5.5,3.3l2.1,1.2c.7.4,1.4.8,2.2,1.2.5.2.9.5,1.3.7,1,.5,2,1,2.9,1.5.5.3,1.1.5,1.6.7.8.4,1.6.7,2.4,1.1h.4c0,.1,0,.1,0,.1,1.3.5,2.6,1.1,3.9,1.6.6.2,1.3.5,2,.8,10,3.6,19.7,5.5,28.7,5.5s1.7,0,2.6,0h1.2c8.8-.5,16.8-2.8,24.1-6.9,8.9-5,16.2-12.6,21.6-22.4l.5-1-.9-.6c-23.9-16.8-38.9-43.8-40.5-72.8,15.8,15.3,32.2,29.6,48.6,42.4,0,0,.2.2.3.3,12.3,9.6,24.3,18.2,35.7,25.6,2.5,1.6,5,3.2,7.5,4.8l.6.4c0,0,.2.1.3.2.1,0,.2.1.4.2,2.8,1.8,5.6,3.4,8.2,4.9,2.1,1.2,4.4,2.5,6.9,3.9.4.3.9.5,1.3.7l2.1,1.1c1.4.7,2.7,1.4,4,2,1.1.6,2.2,1.1,3.3,1.6l1.5.8c20.1,9.8,37.9,14.9,51.5,14.9s17.7-2.7,23.1-8.1c12.5-12.5,10.3-38.5-6.2-73.2ZM183.7,235.1c-.3-.3-.6-.6-.9-.9-1.1-1.1-2.2-2.2-3.3-3.2-61.7-61.7-106.1-130.4-111-171.8,42.5-7,99.3,34.2,135.5,98.3,2.2,4,4.3,8,6.1,11.5-16.9,18-26.2,41.4-26.4,66.1Z"
                />
              </svg>
              {/* Lettering — always visible */}
              <svg
                className="inspire-shell__logo-lettering"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="435 0 960 373.1"
                aria-hidden="true"
              >
                <g>
                  <path fill="#444b55" d="M472.7,100.2h-37.6v-49.1h37.6v49.1ZM471.7,124.7v168.5h-36V124.7h36Z"/>
                  <path fill="#444b55" d="M507.7,293.2V124.7h34.7l1.3,26.8c8.8-16.7,26.5-30.8,53.6-30.8,40.9,0,58.2,25.5,58.2,63.8v108.6h-35.7v-99.8c0-27.5-10.1-42.9-34.7-42.9s-41.5,18.3-41.5,48.4v94.2h-36Z"/>
                  <path fill="#444b55" d="M682.4,240.8h34.7c2.9,20,17.3,29.4,39.6,29.4s34-8.2,34-23.2-9.5-20-41.5-25.8c-40.9-6.9-60.8-20-60.8-50s27.2-50.4,65.8-50.4,65.8,19.3,69,52.7h-34.3c-2.6-17-15.7-26.2-35-26.2s-30.8,8.2-30.8,21.9,9.5,19.3,40.2,24.2c42.5,6.9,63.1,20.9,63.1,50.4s-27.8,53.6-70,53.6-70.7-20.6-73.9-56.6Z"/>
                  <path fill="#444b55" d="M854.8,348.8V124.7h33.7l1,27.8c8.2-16,27.8-31.7,56.6-31.7,44.2,0,72,35.3,72,85.7v4.9c0,50.4-28.5,86-72.9,86s-44.8-13.7-54-29.8v81.1h-36.3ZM981.4,211.4v-4.9c0-36.3-16.4-57.2-45.1-57.2s-46.5,20.9-46.5,57.2v4.9c0,36.3,16.4,56.9,46.5,56.9s45.1-20.6,45.1-56.9Z"/>
                  <path fill="#444b55" d="M1084.4,100.2h-37.6v-49.1h37.6v49.1ZM1083.5,124.7v168.5h-36V124.7h36Z"/>
                  <path fill="#444b55" d="M1119.4,293.2V124.7h34.7l1,32.7c9.2-21.6,26.8-36,51-36s6.2.3,9.2,1v35c-3.3-.3-7.2-.7-11.1-.7-30.4,0-48.7,17.3-48.7,50.7v85.7h-36Z"/>
                  <path fill="#444b55" d="M1226.7,211.4v-4.9c0-51,31.7-85.7,83.4-85.7s82.1,38.6,79.5,96.2h-125.9c1.6,33.7,18,51.7,46.4,51.7s37.6-11.1,42.5-28.1h36c-8.2,35.3-36.3,56.9-78.5,56.9s-83.4-35-83.4-86ZM1352.7,191.1c-2.6-26.2-16.4-41.9-42.9-41.9s-41.5,14.4-45.5,41.9h88.3Z"/>
                </g>
              </svg>
            </Link>
          </div>

          <div className="inspire-shell__search" ref={searchShellRef}>
            <Search size={18} strokeWidth={1.8} className="inspire-shell__search-icon" />
            <input
              type="text"
              className="inspire-shell__search-input"
              placeholder="Pesquisar artigos, tópicos..."
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => setSuggestionsOpen(Boolean(searchValue.trim()))}
              aria-label="Pesquisar no Inspire"
              aria-autocomplete="list"
              aria-controls="inspire-search-suggestions"
              aria-expanded={suggestionsOpen}
              aria-activedescendant={
                activeSuggestionIndex >= 0
                  ? `inspire-search-suggestion-${activeSuggestionIndex}`
                  : undefined
              }
            />
            {searchValue && (
              <button
                type="button"
                className="inspire-shell__search-clear"
                onClick={clearSearch}
                aria-label="Limpar pesquisa"
                data-inspire-tooltip="Limpar pesquisa"
              >
                <X size={16} strokeWidth={2} />
              </button>
            )}

            {suggestionsOpen && searchValue.trim() && (
              <div id="inspire-search-suggestions" className="inspire-search-suggestions">
                {suggestionsLoading && (
                  <p className="inspire-search-suggestions__status" role="status">
                    Buscando artigos…
                  </p>
                )}

                {!suggestionsLoading && suggestions.length === 0 && (
                  <p className="inspire-search-suggestions__status">
                    Nenhuma sugestão encontrada.
                  </p>
                )}

                {!suggestionsLoading && suggestions.length > 0 && (
                  <div role="listbox" aria-label="Sugestões de artigos">
                    {suggestions.map((suggestion, index) => {
                      const category = suggestion.eyebrow || 'Otimiza Editorial'

                      return (
                        <Link
                          key={suggestion.slug}
                          id={`inspire-search-suggestion-${index}`}
                          to={`/inspire/${suggestion.slug}`}
                          state={{ postPreview: suggestion }}
                          role="option"
                          aria-selected={activeSuggestionIndex === index}
                          aria-label={`${suggestion.title} ${category}`}
                          className={`inspire-search-suggestion${
                            activeSuggestionIndex === index ? ' is-active' : ''
                          }`}
                          onMouseEnter={() => setActiveSuggestionIndex(index)}
                          onClick={() => {
                            setSuggestionsOpen(false)
                            setActiveSuggestionIndex(-1)
                          }}
                        >
                          <span className="inspire-search-suggestion__title">
                            {suggestion.title}
                          </span>
                          <span className="inspire-search-suggestion__category">{category}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}

                <Link
                  to={`/inspire?q=${encodeURIComponent(searchValue.trim())}`}
                  className="inspire-search-suggestions__all"
                  onClick={() => {
                    setSuggestionsOpen(false)
                    setActiveSuggestionIndex(-1)
                  }}
                >
                  Ver todos os resultados
                </Link>
              </div>
            )}
          </div>

          <div className="inspire-shell__actions">
            <Link
              to="/inspire/newsletter"
              className="inspire-shell__app-pill"
              data-inspire-tooltip="Assinar newsletter"
            >
              <Mail size={16} strokeWidth={1.8} />
              <span>Assinar newsletter</span>
            </Link>
          </div>
        </nav>
      </header>

      <main className="inspire-shell__main px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <InspireCursorTooltip />
    </div>
  )
}

export default InspireLayout
