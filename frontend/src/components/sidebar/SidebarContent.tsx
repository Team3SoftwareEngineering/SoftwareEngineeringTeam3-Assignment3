import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { CategoryList } from './CategoryList'
import { RoutePlannerPanel } from './RoutePlannerPanel'
import { SearchPanel } from './SearchPanel'
import { useMapStore } from '../../state/useMapStore'

export function SidebarContent() {
  const featureSource = useMapStore((state) => state.featureSource)
  const isLoadingFeatures = useMapStore((state) => state.isLoadingFeatures)
  const [isOverviewCollapsed, setIsOverviewCollapsed] = useState(false)
  const [isCampusInfoCollapsed, setIsCampusInfoCollapsed] = useState(false)

  return (
    <div className="flex min-h-full flex-col gap-3.5 bg-transparent p-4">
      <div className="surface-card shrink-0 overflow-hidden rounded-panel border border-slate-200/90 shadow-panelMd">
        <div className="hero-banner relative h-28 w-full" role="img" aria-label="PNW Hammond campus hero banner">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent" />
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/45 bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white panel-blur">
            Hammond Campus
          </div>
          <button
            type="button"
            onClick={() => setIsOverviewCollapsed((current) => !current)}
            className="interactive-transition absolute right-3 top-3 inline-flex items-center gap-1 rounded-control border border-white/50 bg-white/20 px-2 py-1 text-[11px] font-semibold text-white panel-blur hover:bg-white/30"
            aria-expanded={!isOverviewCollapsed}
            aria-label={isOverviewCollapsed ? 'Show overview details' : 'Hide overview details'}
          >
            Overview
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${isOverviewCollapsed ? '-rotate-90' : 'rotate-0'}`}
            />
          </button>
        </div>
        {!isOverviewCollapsed ? (
          <div className="space-y-2.5 border-t border-slate-200/70 p-3.5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Campus Control Center
              </p>
              <h1 className="font-heading text-[1.28rem] font-semibold leading-tight text-text-primary">
                PNW Hammond Map
              </h1>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full border border-accent-gold/45 bg-accent-gold-soft/85 px-2.5 py-1 text-[11px] font-semibold text-[#63460a]">
                Live route planner
              </span>
              <span className="rounded-full border border-focus/35 bg-accent-navy-soft/70 px-2.5 py-1 text-[11px] font-semibold text-accent-navy">
                Hammond campus
              </span>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              Search locations, pick an origin, and route across real road and path data.
            </p>
            <p className="text-xs font-semibold text-text-secondary">
              Data source:{' '}
              {isLoadingFeatures
                ? 'Loading...'
                : featureSource === 'backend'
                  ? 'Backend + campus DB'
                  : 'Curated fallback'}
            </p>
          </div>
        ) : (
          <div className="border-t border-slate-200/70 px-3.5 py-2.5 text-xs font-semibold text-text-secondary">
            Overview hidden
          </div>
        )}
      </div>

      <SearchPanel />
      <RoutePlannerPanel />
      <CategoryList />

      <footer className="surface-card rounded-card border border-slate-200/90 p-3 text-text-primary shadow-panelMd">
        <div className="flex items-center justify-between gap-2">
          <p className="font-heading text-base font-semibold">Campus Info</p>
          <button
            type="button"
            onClick={() => setIsCampusInfoCollapsed((current) => !current)}
            className="interactive-transition inline-flex items-center gap-1 rounded-control border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-text-secondary hover:border-accent-navy/35 hover:text-accent-navy"
            aria-expanded={!isCampusInfoCollapsed}
            aria-label={isCampusInfoCollapsed ? 'Show campus info details' : 'Hide campus info details'}
          >
            Details
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${isCampusInfoCollapsed ? '-rotate-90' : 'rotate-0'}`}
            />
          </button>
        </div>
        {!isCampusInfoCollapsed ? (
          <>
            <p className="mt-1 text-xs text-text-secondary">
              Purdue University Northwest, Hammond Main Campus: 2200 169th Street, Hammond, IN
              46323
            </p>
            <p className="mt-2 rounded-control border border-slate-200 bg-surface-muted px-2 py-1 text-[11px] text-text-secondary">
              Directions use OpenStreetMap-based routing and geocoding providers.
            </p>
          </>
        ) : (
          <p className="mt-1 text-xs font-semibold text-text-secondary">Campus info hidden</p>
        )}
      </footer>
    </div>
  )
}
