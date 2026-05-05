import { useEffect } from 'react'
import { CircleMarker, Polyline, Tooltip, useMap } from 'react-leaflet'
import { useMapStore } from '../../state/useMapStore'

export function RouteLayer() {
  const map = useMap()
  const routeResult = useMapStore((state) => state.routeResult)
  const routeOrigin = useMapStore((state) => state.routeOrigin)
  const routeDestination = useMapStore((state) => state.routeDestination)

  useEffect(() => {
    if (!routeResult?.path.length) return
    map.fitBounds(routeResult.path, {
      padding: [48, 48],
      animate: true,
      duration: 0.9,
      maxZoom: 18,
    })
  }, [map, routeResult])

  if (!routeOrigin || !routeDestination) {
    return null
  }

  return (
    <>
      {routeResult?.path?.length ? (
        <Polyline
          positions={routeResult.path}
          pathOptions={{
            color: '#0f4c81',
            weight: 5,
            opacity: 0.88,
          }}
        />
      ) : (
        <Polyline
          positions={[
            [routeOrigin.latitude, routeOrigin.longitude],
            [routeDestination.latitude, routeDestination.longitude],
          ]}
          pathOptions={{
            color: '#0f4c81',
            weight: 3,
            opacity: 0.5,
            dashArray: '6 6',
          }}
        />
      )}

      <CircleMarker
        center={[routeOrigin.latitude, routeOrigin.longitude]}
        radius={7}
        pathOptions={{
          color: '#0a6a3f',
          fillColor: '#0a6a3f',
          fillOpacity: 0.95,
          weight: 2,
        }}
      >
        <Tooltip>Start: {routeOrigin.label}</Tooltip>
      </CircleMarker>

      <CircleMarker
        center={[routeDestination.latitude, routeDestination.longitude]}
        radius={7}
        pathOptions={{
          color: '#9c3a14',
          fillColor: '#9c3a14',
          fillOpacity: 0.95,
          weight: 2,
        }}
      >
        <Tooltip>Destination: {routeDestination.label}</Tooltip>
      </CircleMarker>
    </>
  )
}
