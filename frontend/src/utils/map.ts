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

export function getFeatureAnchor(feature: CampusFeature): PointCoordinates {
  if (feature.type === 'point') {
    return feature.coordinates as PointCoordinates
  }

  const polygon = feature.coordinates as PolygonCoordinates
  if (!polygon.length) return [0, 0]

  const totals = polygon.reduce<[number, number]>(
    (acc, point) => [acc[0] + point[0], acc[1] + point[1]],
    [0, 0],
  )

  return [totals[0] / polygon.length, totals[1] / polygon.length]
}
