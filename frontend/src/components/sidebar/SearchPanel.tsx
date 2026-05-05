import { useMemo, useState } from 'react'
import { ChevronDown, Navigation, Search, Sparkles, X } from 'lucide-react'
import { hammondCategories } from '../../data/hammond/categories'
import { useMapStore } from '../../state/useMapStore'
import { searchFeatures } from '../../utils/search'
import { filterFeaturesByCategories } from '../../utils/filters'
import { getFeatureAnchor } from '../../utils/map'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim()
  if (!trimmed) {
    return <>{text}</>
  }

  const expression = new RegExp(`(${escapeRegExp(trimmed)})`, 'ig')
  const pieces = text.split(expression)
  const loweredQuery = trimmed.toLowerCase()

  return (
    <>
      {pieces.map((piece, index) =>
        piece.toLowerCase() === loweredQuery ? <mark key={`${piece}-${index}`}>{piece}</mark> : piece,
      )}
    </>
  )
}

export function SearchPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const searchQuery = useMapStore((state) => state.searchQuery)
  const features = useMapStore((state) => state.features)
  const activeCategories = useMapStore((state) => state.activeCategories)
  const setSearchQuery = useMapStore((state) => state.setSearchQuery)
  const requestFeatureFocus = useMapStore((state) => state.requestFeatureFocus)
  const setMobileDrawerOpen = useMapStore((state) => state.setMobileDrawerOpen)
  const setRouteDestination = useMapStore((state) => state.setRouteDestination)

  const visibleFeatures = useMemo(
    () => filterFeaturesByCategories(features, activeCategories),
    [activeCategories, features],
  )

  const results = useMemo(
    () => searchFeatures(visibleFeatures, searchQuery),
    [visibleFeatures, searchQuery],
  )

  const categoryLabelLookup = useMemo(() => {
    return new Map(hammondCategories.map((category) => [category.id, category.label]))
  }, [])

  return (
    <section
      aria-label="Search locations"
      className="surface-card space-y-3 rounded-card border border-slate-200/90 p-4 shadow-panelMd"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex flex-1 flex-wrap items-center gap-2">
          <label htmlFor="map-search" className="text-sm font-semibold text-text-primary">
            Search campus features
          </label>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
            <Sparkles className="h-3 w-3 text-accent-gold" />
            Live results
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed((current) => !current)}
          className="interactive-transition shrink-0 inline-flex items-center gap-1 rounded-control border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-text-secondary hover:border-accent-navy/35 hover:text-accent-navy"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Show search widget content' : 'Hide search widget content'}
        >
          Search
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} />
        </button>
      </div>
      {!isCollapsed ? (
        <>
          <div className="interactive-transition flex items-center gap-3 rounded-control border border-slate-300 bg-white px-3 py-2.5 shadow-softInset focus-within:-translate-y-0.5 focus-within:border-focus focus-within:ring-2 focus-within:ring-focus/30">
            <Search className="h-4 w-4 text-accent-navy" aria-hidden="true" />
            <input
              id="map-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              type="text"
              placeholder="Search buildings, parking, accessibility..."
              className="w-full border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary/70"
            />
            {searchQuery.trim() ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="interactive-transition inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-text-secondary hover:border-accent-navy/40 hover:text-accent-navy"
                aria-label="Clear search query"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {searchQuery.trim() ? (
            <div className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-panelSm">
              <div className="border-b border-slate-200 px-3.5 py-2">
                <p className="text-xs font-semibold text-text-secondary">
                  {results.length} result{results.length === 1 ? '' : 's'} in enabled categories
                </p>
              </div>
              {results.length ? (
                <ul className="max-h-64 overflow-y-auto py-1.5">
                  {results.map((result) => {
                    const categoryLabel = categoryLabelLookup.get(result.category) ?? result.category
                    return (
                      <li key={result.id}>
                        <div className="grid grid-cols-[1fr_auto] items-center gap-2 px-3.5 py-2.5 hover:bg-surface-muted">
                          <button
                            type="button"
                            onClick={() => {
                              requestFeatureFocus(result.id)
                              setMobileDrawerOpen(false)
                            }}
                            className="interactive-transition min-w-0 text-left focus-visible:bg-surface-muted"
                          >
                            <p className="truncate text-sm font-semibold text-text-primary">
                              <HighlightedText text={result.name} query={searchQuery} />
                            </p>
                            <p className="mt-0.5 truncate text-xs text-text-secondary">
                              <HighlightedText text={categoryLabel} query={searchQuery} />
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const point = getFeatureAnchor(result)
                              setRouteDestination({
                                label: result.name,
                                latitude: point[0],
                                longitude: point[1],
                                source: 'feature',
                              })
                              requestFeatureFocus(result.id)
                              setMobileDrawerOpen(false)
                            }}
                            className="interactive-transition inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-accent-navy hover:-translate-y-0.5 hover:border-accent-navy/40"
                            aria-label={`Route to ${result.name}`}
                            title={`Route to ${result.name}`}
                          >
                            <Navigation className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="px-3.5 py-3">
                  <p className="text-sm font-semibold text-text-primary">No matching results</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Try a broader term or enable more categories.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="rounded-control border border-slate-200 bg-white/80 px-2.5 py-1.5 text-xs text-text-secondary">
              Type to search within currently enabled categories.
            </p>
          )}
        </>
      ) : (
        <p className="rounded-control border border-slate-200 bg-white/80 px-2.5 py-1.5 text-xs font-semibold text-text-secondary">
          Search widget hidden
        </p>
      )}
    </section>
  )
}
