import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { hammondFeatures } from '../../data/hammond/features'
import { useMapStore } from '../../state/useMapStore'
import { getFeatureBounds } from '../../utils/map'

export function MapFocusController() {
  const map = useMap()
  const focusedFeatureId = useMapStore((state) => state.focusedFeatureId)
  const focusRevision = useMapStore((state) => state.focusRevision)

  useEffect(() => {
    const feature = hammondFeatures.find((entry) => entry.id === focusedFeatureId)
    if (!feature) {
      return
    }

    if (feature.type === 'point') {
      map.flyTo(feature.coordinates as [number, number], Math.max(map.getZoom(), 17), {
        animate: true,
        duration: 0.85,
      })
      return
    }

    map.fitBounds(getFeatureBounds(feature), {
      animate: true,
      duration: 0.85,
      padding: [32, 32],
    })
  }, [focusedFeatureId, focusRevision, map])

  return null
}
