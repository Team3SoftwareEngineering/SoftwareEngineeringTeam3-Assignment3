import { LatLngBounds } from 'leaflet'
import { Crosshair, LocateFixed, Maximize2 } from 'lucide-react'
import { useState } from 'react'
import { ScaleControl, useMap } from 'react-leaflet'
import { hammondCampusConfig } from '../../data/hammond/campusConfig'
import type { CampusFeature } from '../../models/campus'
import { useMapStore } from '../../state/useMapStore'
import { toPointCoordinates } from '../../utils/map'

interface MapControlsProps {
  visibleFeatures: CampusFeature[]
}

export function MapControls({ visibleFeatures }: MapControlsProps) {
  const map = useMap()
  const [isLocating, setIsLocating] = useState(false)
  const setRouteOrigin = useMapStore((state) => state.setRouteOrigin)
  const setRouteOriginMode = useMapStore((state) => state.setRouteOriginMode)
  const setRouteStatus = useMapStore((state) => state.setRouteStatus)
  const setPickingRouteOrigin = useMapStore((state) => state.setPickingRouteOrigin)

  function resetCampusView() {
    map.fitBounds(hammondCampusConfig.initialBounds, {
      animate: true,
      duration: 0.85,
      padding: [34, 34],
    })
  }

  function fitVisibleFeatures() {
    if (!visibleFeatures.length) {
      resetCampusView()
      return
    }

    const points = visibleFeatures.flatMap((feature) => toPointCoordinates(feature))
    if (!points.length) {
      resetCampusView()
      return
    }

    map.fitBounds(new LatLngBounds(points), {
      animate: true,
      duration: 0.85,
      padding: [38, 38],
      maxZoom: 17,
    })
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setRouteStatus('error', 'Geolocation is not supported in this browser.')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        map.flyTo([latitude, longitude], 17, {
          animate: true,
          duration: 0.9,
        })

        setRouteOrigin({
          label: 'Current location',
          latitude,
          longitude,
          source: 'current',
        })
        setRouteOriginMode('current')
        setPickingRouteOrigin(false)
        setRouteStatus('idle')
        setIsLocating(false)
      },
      () => {
        setRouteStatus(
          'error',
          'Unable to access your location. Check browser location permissions and try again.',
        )
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
      },
    )
  }

  return (
    <>
      <ScaleControl position="bottomleft" imperial />
      <div className="pointer-events-none absolute right-4 top-4 z-[500]">
        <div className="pointer-events-auto flex flex-col gap-2">
          <button
            type="button"
            onClick={resetCampusView}
            className="interactive-transition inline-flex items-center gap-2 rounded-control border border-slate-300 bg-white/92 px-3 py-2 text-xs font-semibold text-text-primary shadow-panelMd panel-blur hover:-translate-y-0.5 hover:border-accent-navy/45 hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
            title="Reset to campus view"
          >
            <Maximize2 className="h-3.5 w-3.5 text-accent-navy" />
            Reset campus
          </button>
          <button
            type="button"
            onClick={fitVisibleFeatures}
            className="interactive-transition inline-flex items-center gap-2 rounded-control border border-slate-300 bg-white/92 px-3 py-2 text-xs font-semibold text-text-primary shadow-panelMd panel-blur hover:-translate-y-0.5 hover:border-accent-navy/45 hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
            title="Fit all visible layers"
          >
            <Crosshair className="h-3.5 w-3.5 text-accent-navy" />
            Fit visible
          </button>
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={isLocating}
            className="interactive-transition inline-flex items-center gap-2 rounded-control border border-slate-300 bg-white/92 px-3 py-2 text-xs font-semibold text-text-primary shadow-panelMd panel-blur hover:-translate-y-0.5 hover:border-accent-navy/45 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
            title="Center on your current location"
          >
            <LocateFixed className="h-3.5 w-3.5 text-accent-navy" />
            {isLocating ? 'Locating...' : 'My location'}
          </button>
        </div>
      </div>
    </>
  )
}
