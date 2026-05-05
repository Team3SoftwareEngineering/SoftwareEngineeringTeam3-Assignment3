import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { FeatureDetailsCard } from '../details/FeatureDetailsCard'
import { EmptyState } from '../common/EmptyState'
import { ErrorState } from '../common/ErrorState'
import { LoadingState } from '../common/LoadingState'
import { hammondCampusConfig } from '../../data/hammond/campusConfig'
import { useMapStore } from '../../state/useMapStore'
import { filterFeaturesByCategories } from '../../utils/filters'
import { MapFocusController } from './MapFocusController'
import { MapControls } from './MapControls'
import { MapFeatureLayer } from './MapFeatureLayer'
import { MapOriginPicker } from './MapOriginPicker'
import { MapResizeController } from './MapResizeController'
import { RouteLayer } from './RouteLayer'
import 'leaflet/dist/leaflet.css'

export function CampusMap() {
  const [isMapReady, setIsMapReady] = useState(false)
  const selectedFeatureId = useMapStore((state) => state.selectedFeatureId)
  const setSelectedFeatureId = useMapStore((state) => state.setSelectedFeatureId)
  const activeCategories = useMapStore((state) => state.activeCategories)
  const features = useMapStore((state) => state.features)
  const isLoadingFeatures = useMapStore((state) => state.isLoadingFeatures)
  const featureLoadError = useMapStore((state) => state.featureLoadError)
  const isPickingRouteOrigin = useMapStore((state) => state.isPickingRouteOrigin)
  const isFeatureDetailsVisible = useMapStore((state) => state.isFeatureDetailsVisible)
  const setFeatureDetailsVisible = useMapStore((state) => state.setFeatureDetailsVisible)

  const visibleFeatures = useMemo(
    () => filterFeaturesByCategories(features, activeCategories),
    [activeCategories, features],
  )

  if (!features.length && !isLoadingFeatures) {
    return (
      <section className="map-shell relative h-full w-full overflow-hidden rounded-panel border border-slate-300/70 shadow-panelLg">
        <div className="p-4">
          <ErrorState
            title="Map data unavailable"
            description="No campus features were loaded. Check backend connectivity and try again."
          />
        </div>
      </section>
    )
  }

  return (
    <section className="map-shell relative h-full w-full overflow-hidden rounded-panel border border-slate-300/75 shadow-panelLg">
      <MapContainer
        center={hammondCampusConfig.center}
        zoom={hammondCampusConfig.defaultZoom}
        minZoom={13}
        zoomControl
        scrollWheelZoom
        className={isPickingRouteOrigin ? 'h-full w-full cursor-crosshair' : 'h-full w-full'}
        whenReady={() => setIsMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFeatureLayer
          features={visibleFeatures}
          selectedFeatureId={selectedFeatureId}
          onFeatureClick={setSelectedFeatureId}
        />
        <RouteLayer />
        <MapOriginPicker />
        <MapResizeController />
        <MapFocusController />
        <MapControls visibleFeatures={visibleFeatures} />
      </MapContainer>
      {!isMapReady || isLoadingFeatures ? (
        <div className="pointer-events-none absolute left-4 top-4 z-[500]">
          <LoadingState message={isLoadingFeatures ? 'Loading campus data...' : 'Loading map...'} />
        </div>
      ) : null}
      {!visibleFeatures.length ? (
        <div className="pointer-events-none absolute left-4 top-20 z-[500] max-w-xs">
          <div className="pointer-events-auto">
            <EmptyState
              title="No visible features"
              description="Enable categories or clear filters to display map content."
            />
          </div>
        </div>
      ) : null}
      {featureLoadError ? (
        <div className="pointer-events-none absolute left-4 top-20 z-[500] max-w-sm">
          <div className="pointer-events-auto">
            <ErrorState title="Feature sync warning" description={featureLoadError} />
          </div>
        </div>
      ) : null}
      {isPickingRouteOrigin ? (
        <div className="pointer-events-none absolute right-4 top-4 z-[500] rounded-control border border-accent-gold/35 bg-accent-gold-soft/90 px-3 py-2 text-xs font-semibold text-[#65490e] shadow-panelSm">
          Click on map to set route start
        </div>
      ) : null}
      <div className="pointer-events-none absolute bottom-4 right-4 z-[500] hidden rounded-control border border-slate-300/85 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-text-secondary shadow-panelSm sm:block">
        Drag to pan - Scroll to zoom - Click a feature to inspect
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-[500] hidden sm:block">
        <div
          className="relative transition-transform duration-300"
          style={{
            transform: isFeatureDetailsVisible
              ? 'translateX(0)'
              : 'translateX(calc(-100% + 18px))',
          }}
        >
          <div className="pointer-events-auto w-[380px] max-w-[calc(100vw-7rem)]">
            <FeatureDetailsCard />
          </div>
          <button
            type="button"
            onClick={() => setFeatureDetailsVisible(!isFeatureDetailsVisible)}
            className="interactive-transition pointer-events-auto absolute -right-7 top-1/2 inline-flex h-14 w-7 -translate-y-1/2 items-center justify-center rounded-r-control border border-slate-300 bg-white/95 text-text-secondary shadow-panelMd panel-blur hover:border-accent-navy/45 hover:text-accent-navy"
            aria-label={isFeatureDetailsVisible ? 'Hide feature details panel' : 'Show feature details panel'}
            title={isFeatureDetailsVisible ? 'Hide feature details panel' : 'Show feature details panel'}
          >
            {isFeatureDetailsVisible ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[500] sm:hidden">
        <div className="pointer-events-auto">
          {isFeatureDetailsVisible ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setFeatureDetailsVisible(false)}
                className="interactive-transition inline-flex items-center gap-1 rounded-control border border-slate-300 bg-white/92 px-2.5 py-1 text-[11px] font-semibold text-text-secondary shadow-panelSm"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Hide details
              </button>
              <FeatureDetailsCard />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setFeatureDetailsVisible(true)}
              className="interactive-transition inline-flex items-center gap-1 rounded-control border border-slate-300 bg-white/92 px-2.5 py-1 text-[11px] font-semibold text-text-secondary shadow-panelSm"
            >
              <ChevronRight className="h-3.5 w-3.5" />
              Show details
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
