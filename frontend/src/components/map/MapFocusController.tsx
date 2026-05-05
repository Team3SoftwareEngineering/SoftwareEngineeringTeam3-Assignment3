import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useMapStore } from '../../state/useMapStore'
import { getFeatureBounds } from '../../utils/map'

export function MapFocusController() {
  const map = useMap()
  const focusedFeatureId = useMapStore((state) => state.focusedFeatureId)
  const focusRevision = useMapStore((state) => state.focusRevision)
  const features = useMapStore((state) => state.features)

  useEffect(() => {
    const feature = features.find((entry) => entry.id === focusedFeatureId)
    if (!feature) {
      return
    }

    if (feature.type === 'point') {
      map.flyTo(feature.coordinates as [number, number], Math.min(Math.max(map.getZoom(), 17), 18), {
        animate: true,
        duration: 0.85,
      })
      return
    }

    map.fitBounds(getFeatureBounds(feature), {
      animate: true,
      duration: 0.85,
      padding: [44, 44],
      maxZoom: 18,
    })
  }, [features, focusedFeatureId, focusRevision, map])

  return null
}
