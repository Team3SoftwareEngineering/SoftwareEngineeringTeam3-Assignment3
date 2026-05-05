import { useMemo, useState } from 'react'
import {
  ChevronDown,
  Crosshair,
  LocateFixed,
  MapPin,
  Navigation,
  Route as RouteIcon,
  Search,
  XCircle,
} from 'lucide-react'
import type { RouteWaypoint } from '../../models/routing'
import { geocodeAddress } from '../../services/geocodingService'
import { getRoute } from '../../services/mapRoutingService'
import { useMapStore } from '../../state/useMapStore'
import { getFeatureAnchor } from '../../utils/map'
import { searchFeatures } from '../../utils/search'

function formatDistance(miles: number) {
  if (!Number.isFinite(miles)) return '--'
  return `${miles.toFixed(2)} mi`
}

function getBrowserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported in this browser.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => {
        reject(
          new Error(
            'Unable to access your location. Check browser location permissions and try again.',
          ),
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
      },
    )
  })
}

export function RoutePlannerPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const routeOriginMode = useMapStore((state) => state.routeOriginMode)
  const setRouteOriginMode = useMapStore((state) => state.setRouteOriginMode)
  const routingMode = useMapStore((state) => state.routingMode)
  const setRoutingMode = useMapStore((state) => state.setRoutingMode)
  const routeOrigin = useMapStore((state) => state.routeOrigin)
  const setRouteOrigin = useMapStore((state) => state.setRouteOrigin)
  const routeDestination = useMapStore((state) => state.routeDestination)
  const routeResult = useMapStore((state) => state.routeResult)
  const setRouteResult = useMapStore((state) => state.setRouteResult)
  const routeStatus = useMapStore((state) => state.routeStatus)
  const routeError = useMapStore((state) => state.routeError)
  const setRouteStatus = useMapStore((state) => state.setRouteStatus)
  const clearRoute = useMapStore((state) => state.clearRoute)
  const isPickingRouteOrigin = useMapStore((state) => state.isPickingRouteOrigin)
  const setPickingRouteOrigin = useMapStore((state) => state.setPickingRouteOrigin)
  const features = useMapStore((state) => state.features)

  const [originQuery, setOriginQuery] = useState('')
  const [originSuggestions, setOriginSuggestions] = useState<RouteWaypoint[]>([])
  const [destinationQuery, setDestinationQuery] = useState('')
  const [destinationSuggestions, setDestinationSuggestions] = useState<RouteWaypoint[]>([])
  const setRouteDestination = useMapStore((state) => state.setRouteDestination)

  const canComputeRoute = useMemo(() => {
    return Boolean(routeOrigin && routeDestination && routeStatus !== 'loading')
  }, [routeDestination, routeOrigin, routeStatus])

  const localDestinationSuggestions = useMemo(() => {
    const matches = searchFeatures(features, destinationQuery).slice(0, 8)
    return matches.map((feature) => {
      const [latitude, longitude] = getFeatureAnchor(feature)
      return {
        label: feature.name,
        latitude,
        longitude,
        source: 'feature' as const,
      }
    })
  }, [destinationQuery, features])

  const combinedDestinationSuggestions = useMemo(() => {
    const seen = new Set<string>()
    const combined: RouteWaypoint[] = []

    function appendUnique(items: RouteWaypoint[]) {
      items.forEach((item) => {
        const key = item.label.trim().toLowerCase()
        if (seen.has(key)) return
        seen.add(key)
        combined.push(item)
      })
    }

    appendUnique(localDestinationSuggestions)
    appendUnique(destinationSuggestions)
    return combined.slice(0, 10)
  }, [destinationSuggestions, localDestinationSuggestions])

  async function handleUseCurrentLocation() {
    setRouteStatus('loading')
    try {
      const position = await getBrowserLocation()
      setRouteOrigin({
        label: 'Current location',
        latitude: position.latitude,
        longitude: position.longitude,
        source: 'current',
      })
      setRouteOriginMode('current')
      setRouteStatus('idle')
    } catch (error) {
      setRouteStatus('error', error instanceof Error ? error.message : 'Failed to access location.')
    }
  }

  async function handleSearchOrigin() {
    if (!originQuery.trim()) return

    setRouteStatus('loading')
    try {
      const matches = await geocodeAddress(originQuery)
      setOriginSuggestions(matches)
      setRouteStatus('idle')
      if (!matches.length) {
        setRouteStatus('error', 'No address matches found. Try a more specific query.')
      }
    } catch (error) {
      setRouteStatus(
        'error',
        error instanceof Error ? error.message : 'Failed to search origin address.',
      )
    }
  }

  async function handleComputeRoute() {
    if (!routeDestination) {
      setRouteStatus('error', 'Choose a destination from the map or search results first.')
      return
    }

    if (!routeOrigin) {
      setRouteStatus('error', 'Choose a route origin before requesting directions.')
      return
    }

    setRouteStatus('loading')
    try {
      const result = await getRoute(routeOrigin, routeDestination, routingMode)
      setRouteResult(result)
      setRouteStatus('success')
    } catch (error) {
      setRouteStatus(
        'error',
        error instanceof Error ? error.message : 'Failed to compute route.',
      )
    }
  }

  async function handleSearchDestination() {
    if (!destinationQuery.trim()) return

    setRouteStatus('loading')
    try {
      const localMatches = searchFeatures(features, destinationQuery).map((feature) => {
        const [latitude, longitude] = getFeatureAnchor(feature)
        return {
          label: feature.name,
          latitude,
          longitude,
          source: 'feature' as const,
        }
      })
      const addressMatches = await geocodeAddress(destinationQuery)
      const matches = [...localMatches, ...addressMatches]
      setDestinationSuggestions(matches)
      setRouteStatus('idle')
      if (!matches.length) {
        setRouteStatus('error', 'No destination matches found. Try a more specific query.')
      }
    } catch (error) {
      setRouteStatus(
        'error',
        error instanceof Error ? error.message : 'Failed to search destination address.',
      )
    }
  }

  return (
    <section className="surface-card space-y-3 rounded-card border border-slate-200/90 p-4 shadow-panelMd">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex flex-1 flex-wrap items-center gap-2">
          <h2 className="font-heading text-base font-semibold text-text-primary">Route Planner</h2>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
            Live routing
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed((current) => !current)}
          className="interactive-transition shrink-0 inline-flex items-center gap-1 rounded-control border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-text-secondary hover:border-accent-navy/35 hover:text-accent-navy"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Show route planner widget content' : 'Hide route planner widget content'}
        >
          Planner
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} />
        </button>
      </div>
      {!isCollapsed ? (
        <>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Destination</p>
        {routeDestination ? (
          <div className="rounded-control border border-slate-300 bg-white px-3 py-2 text-xs text-text-primary">
            <p className="font-semibold">{routeDestination.label}</p>
            <p className="text-text-secondary">
              {routeDestination.latitude.toFixed(5)}, {routeDestination.longitude.toFixed(5)}
            </p>
          </div>
        ) : (
          <p className="rounded-control border border-slate-200 bg-white/80 px-3 py-2 text-xs text-text-secondary">
            Pick a map feature, then click a Directions button.
          </p>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-control border border-slate-300 bg-white px-3 py-2">
            <MapPin className="h-4 w-4 text-accent-navy" />
            <input
              type="text"
              value={destinationQuery}
              onChange={(event) => {
                setDestinationQuery(event.currentTarget.value)
                setDestinationSuggestions([])
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void handleSearchDestination()
                }
              }}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Or search destination address"
            />
          </div>
          <button
            type="button"
            onClick={handleSearchDestination}
            className="w-full rounded-control border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-text-secondary"
          >
            Search broader address results
          </button>
          {combinedDestinationSuggestions.length ? (
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-control border border-slate-200 bg-white p-1.5">
              {combinedDestinationSuggestions.map((suggestion) => (
                <li key={`${suggestion.label}-${suggestion.latitude}-${suggestion.longitude}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setRouteDestination({
                        ...suggestion,
                      })
                      if (suggestion.source === 'feature') {
                        setDestinationSuggestions([])
                      }
                      setDestinationQuery(suggestion.label)
                    }}
                    className="w-full rounded-control px-2 py-1.5 text-left text-xs hover:bg-surface-muted"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{suggestion.label}</span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          suggestion.source === 'feature'
                            ? 'bg-accent-navy-soft text-accent-navy'
                            : 'bg-slate-100 text-text-secondary'
                        }`}
                      >
                        {suggestion.source === 'feature' ? 'PNW' : 'Address'}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Start point</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setRouteOriginMode('current')
              setPickingRouteOrigin(false)
              void handleUseCurrentLocation()
            }}
            className={`rounded-control border px-2 py-2 text-xs font-semibold ${
              routeOriginMode === 'current'
                ? 'border-accent-navy bg-accent-navy-soft text-accent-navy'
                : 'border-slate-300 bg-white text-text-secondary'
            }`}
          >
            <LocateFixed className="mx-auto mb-1 h-3.5 w-3.5" />
            Current
          </button>
          <button
            type="button"
            onClick={() => {
              setRouteOriginMode('address')
              setPickingRouteOrigin(false)
            }}
            className={`rounded-control border px-2 py-2 text-xs font-semibold ${
              routeOriginMode === 'address'
                ? 'border-accent-navy bg-accent-navy-soft text-accent-navy'
                : 'border-slate-300 bg-white text-text-secondary'
            }`}
          >
            <Search className="mx-auto mb-1 h-3.5 w-3.5" />
            Address
          </button>
          <button
            type="button"
            onClick={() => {
              setRouteOriginMode('map')
              setPickingRouteOrigin(true)
            }}
            className={`rounded-control border px-2 py-2 text-xs font-semibold ${
              routeOriginMode === 'map'
                ? 'border-accent-navy bg-accent-navy-soft text-accent-navy'
                : 'border-slate-300 bg-white text-text-secondary'
            }`}
          >
            <Crosshair className="mx-auto mb-1 h-3.5 w-3.5" />
            Pick map
          </button>
        </div>

        {routeOriginMode === 'address' ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-control border border-slate-300 bg-white px-3 py-2">
              <MapPin className="h-4 w-4 text-accent-navy" />
              <input
                type="text"
                value={originQuery}
                onChange={(event) => setOriginQuery(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void handleSearchOrigin()
                  }
                }}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Enter home address"
              />
            </div>
            <button
              type="button"
              onClick={handleSearchOrigin}
              className="w-full rounded-control bg-accent-navy px-3 py-2 text-xs font-semibold text-white"
            >
              Find address
            </button>
            {originSuggestions.length ? (
              <ul className="max-h-44 space-y-1 overflow-y-auto rounded-control border border-slate-200 bg-white p-1.5">
                {originSuggestions.map((suggestion) => (
                  <li key={`${suggestion.latitude}-${suggestion.longitude}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setRouteOrigin({
                          ...suggestion,
                          source: 'address',
                        })
                        setOriginSuggestions([])
                        setOriginQuery(suggestion.label)
                      }}
                      className="w-full rounded-control px-2 py-1.5 text-left text-xs hover:bg-surface-muted"
                    >
                      {suggestion.label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {routeOriginMode === 'map' ? (
          <p className="rounded-control border border-accent-gold/35 bg-accent-gold-soft/70 px-3 py-2 text-xs text-[#5f4308]">
            {isPickingRouteOrigin
              ? 'Click anywhere on the map to place your route start.'
              : routeOrigin?.source === 'map-click'
                ? 'Map origin selected.'
                : 'Select "Pick map" again and click a start point.'}
          </p>
        ) : null}

        {routeOrigin ? (
          <div className="rounded-control border border-slate-300 bg-white px-3 py-2 text-xs text-text-primary">
            <p className="font-semibold">{routeOrigin.label}</p>
            <p className="text-text-secondary">
              {routeOrigin.latitude.toFixed(5)}, {routeOrigin.longitude.toFixed(5)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="routing-mode" className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Travel mode
        </label>
        <select
          id="routing-mode"
          value={routingMode}
          onChange={(event) => setRoutingMode(event.target.value as typeof routingMode)}
          className="w-full rounded-control border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="walking">Walking</option>
          <option value="driving">Driving</option>
          <option value="bicycling">Bicycling</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleComputeRoute}
          disabled={!canComputeRoute}
          className="inline-flex items-center justify-center gap-1.5 rounded-control bg-accent-gold px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          <RouteIcon className="h-3.5 w-3.5" />
          Route
        </button>
        <button
          type="button"
          onClick={() => {
            setPickingRouteOrigin(false)
            clearRoute()
            setRouteResult(null)
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-control border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-text-secondary"
        >
          <XCircle className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      {routeStatus === 'loading' ? (
        <p className="rounded-control border border-focus/35 bg-focus/10 px-3 py-2 text-xs text-text-secondary">
          Working on your request...
        </p>
      ) : null}

      {routeError ? (
        <p className="rounded-control border border-danger/35 bg-red-50 px-3 py-2 text-xs text-danger">
          {routeError}
        </p>
      ) : null}

      {routeStatus === 'success' && routeResult ? (
        <p className="rounded-control border border-success/35 bg-green-50 px-3 py-2 text-xs text-success">
          Route ready. Follow the line on the map and step list below.
        </p>
      ) : null}

      {routeResult ? (
        <div className="space-y-2 rounded-card border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">{formatDistance(routeResult.distanceMiles)}</span>
            <span>{routeResult.durationText}</span>
          </div>
          <p className="text-[11px] text-text-secondary">Provider: {routeResult.provider}</p>
          {routeResult.steps.length ? (
            <ol className="max-h-40 space-y-1 overflow-y-auto text-xs text-text-secondary">
              {routeResult.steps.map((step, index) => (
                <li key={`${step}-${index}`} className="rounded-control bg-surface-muted px-2 py-1">
                  <span className="font-semibold text-text-primary">{index + 1}.</span> {step}
                </li>
              ))}
            </ol>
          ) : null}
          <button
            type="button"
            onClick={handleComputeRoute}
            disabled={routeStatus === 'loading'}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-navy disabled:opacity-50"
          >
            <Navigation className="h-3.5 w-3.5" />
            Refresh route
          </button>
        </div>
      ) : null}
        </>
      ) : (
        <p className="rounded-control border border-slate-200 bg-white/80 px-2.5 py-1.5 text-xs font-semibold text-text-secondary">
          Route planner hidden
        </p>
      )}
    </section>
  )
}
