import { useMapEvent } from 'react-leaflet'
import { reverseGeocode } from '../../services/geocodingService'
import { useMapStore } from '../../state/useMapStore'

export function MapOriginPicker() {
  const isPickingRouteOrigin = useMapStore((state) => state.isPickingRouteOrigin)
  const setRouteOrigin = useMapStore((state) => state.setRouteOrigin)
  const setPickingRouteOrigin = useMapStore((state) => state.setPickingRouteOrigin)
  const setRouteStatus = useMapStore((state) => state.setRouteStatus)

  useMapEvent('click', (event) => {
    if (!isPickingRouteOrigin) return

    const { lat, lng } = event.latlng
    setRouteOrigin({
      label: `Pinned start (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
      latitude: lat,
      longitude: lng,
      source: 'map-click',
    })
    setPickingRouteOrigin(false)
    setRouteStatus('idle')

    void reverseGeocode(lat, lng)
      .then((label) => {
        setRouteOrigin({
          label,
          latitude: lat,
          longitude: lng,
          source: 'map-click',
        })
      })
      .catch(() => {
        // Keep coordinate label if reverse geocode fails.
      })
  })

  return null
}
