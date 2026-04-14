import { LatLngBounds } from 'leaflet'
import { hammondCategories } from '../data/hammond/categories'
import type {
  CampusFeature,
  CategoryId,
  PointCoordinates,
  PolygonCoordinates,
} from '../models/campus'

export function getCategoryColor(categoryId: CategoryId): string {
  return (
    hammondCategories.find((category) => category.id === categoryId)?.colorToken ??
    'var(--color-accent-navy)'
  )
}

export function toPointCoordinates(feature: CampusFeature): PointCoordinates[] {
  if (feature.type === 'point') {
    return [feature.coordinates as PointCoordinates]
  }

  return feature.coordinates as PolygonCoordinates
}

export function getFeatureBounds(feature: CampusFeature): LatLngBounds {
  const points = toPointCoordinates(feature)
  return new LatLngBounds(points)
}
