import { CircleMarker, Polygon, Tooltip } from 'react-leaflet'
import type { CampusFeature } from '../../models/campus'
import { getCategoryColor } from '../../utils/map'

interface MapFeatureLayerProps {
  features: CampusFeature[]
  selectedFeatureId: string | null
  onFeatureClick: (featureId: string) => void
}

export function MapFeatureLayer({
  features,
  selectedFeatureId,
  onFeatureClick,
}: MapFeatureLayerProps) {
  return (
    <>
      {features.map((feature) => {
        const selected = selectedFeatureId === feature.id
        const color = getCategoryColor(feature.category)

        if (feature.type === 'point') {
          return (
            <CircleMarker
              key={feature.id}
              center={feature.coordinates as [number, number]}
              radius={selected ? 10 : 7.5}
              pathOptions={{
                color,
                weight: selected ? 4 : 2.2,
                fillColor: color,
                fillOpacity: selected ? 0.95 : 0.7,
              }}
              eventHandlers={{
                click: () => onFeatureClick(feature.id),
                mouseover: (event) => {
                  if (!selected) {
                    event.target.setStyle({ weight: 3, fillOpacity: 0.82 })
                    event.target.setRadius(8.5)
                  }
                },
                mouseout: (event) => {
                  if (!selected) {
                    event.target.setStyle({ weight: 2.2, fillOpacity: 0.7 })
                    event.target.setRadius(7.5)
                  }
                },
              }}
            >
              <Tooltip>{feature.name}</Tooltip>
            </CircleMarker>
          )
        }

        return (
          <Polygon
            key={feature.id}
            positions={feature.coordinates as [number, number][]}
            pathOptions={{
              color,
              weight: selected ? 3.8 : 2.3,
              fillOpacity: selected ? 0.42 : 0.23,
            }}
            eventHandlers={{
              click: () => onFeatureClick(feature.id),
              mouseover: (event) => {
                if (!selected) {
                  event.target.setStyle({ weight: 3, fillOpacity: 0.3 })
                }
              },
              mouseout: (event) => {
                if (!selected) {
                  event.target.setStyle({ weight: 2.3, fillOpacity: 0.23 })
                }
              },
            }}
          >
            <Tooltip>{feature.name}</Tooltip>
          </Polygon>
        )
      })}
    </>
  )
}
