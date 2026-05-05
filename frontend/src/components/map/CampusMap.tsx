import { useMemo, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { FeatureDetailsCard } from '../details/FeatureDetailsCard'
import { EmptyState } from '../common/EmptyState'
import { ErrorState } from '../common/ErrorState'
import { LoadingState } from '../common/LoadingState'
import { hammondCampusConfig } from '../../data/hammond/campusConfig'
import { hammondFeatures } from '../../data/hammond/features'
import { useMapStore } from '../../state/useMapStore'
import { filterFeaturesByCategories } from '../../utils/filters'
import { MapFocusController } from './MapFocusController'
import { MapControls } from './MapControls'
import { MapFeatureLayer } from './MapFeatureLayer'
import 'leaflet/dist/leaflet.css'

export function CampusMap() {
  const [isMapReady, setIsMapReady] = useState(false)
  const selectedFeatureId = useMapStore((state) => state.selectedFeatureId)
  const setSelectedFeatureId = useMapStore((state) => state.setSelectedFeatureId)
  const activeCategories = useMapStore((state) => state.activeCategories)

  const visibleFeatures = useMemo(
    () => filterFeaturesByCategories(hammondFeatures, activeCategories),
    [activeCategories],
  )

  if (!hammondFeatures.length) {
    return (
      <section className="map-shell relative h-full w-full overflow-hidden rounded-panel border border-slate-300/70 shadow-panelLg">
        <div className="p-4">
          <ErrorState
            title="Map data unavailable"
            description="No Hammond feature data was loaded. This MVP expects local placeholder/demo data."
          />
        </div>
      </section>
    )
  }


  return (
    <section className="map-shell relative h-full w-full overflow-hidden rounded-panel border border-slate-300/75 shadow-panelLg">
      <MapContainer
        bounds={hammondCampusConfig.initialBounds}
        boundsOptions={{ padding: [24, 24] }}
        maxBounds={hammondCampusConfig.maxBounds}
        zoomControl
        scrollWheelZoom
        className="h-full w-full"
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
        <MapFocusController />
        <MapControls />
      </MapContainer>
      {!isMapReady ? (
        <div className="pointer-events-none absolute left-4 top-4 z-[500]">
          <LoadingState message="Loading map..." />
        </div>
      ) : null}
      {!visibleFeatures.length ? (
        <div className="pointer-events-none absolute left-4 top-20 z-[500] max-w-xs">
          <div className="pointer-events-auto">
            <EmptyState
              title="No visible features"
              description="Enable one or more categories to show Hammond demo features."
            />
          </div>
        </div>
      ) : null}
      <div className="pointer-events-none absolute right-4 top-4 z-[500] rounded-control border border-warning/35 bg-warning/10 px-3 py-1.5 text-xs font-semibold text-text-secondary shadow-panelSm">
        Demo/placeholder locations are clearly labeled
      </div>
      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[500] mx-auto max-w-[calc(100vw-2rem)] sm:inset-x-auto sm:left-4 sm:mx-0 sm:max-w-[380px]">
        <div className="pointer-events-auto">
          <FeatureDetailsCard />
        </div>
      </div>
    </section>
  )
}
