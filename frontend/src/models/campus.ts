import type { LucideIcon } from 'lucide-react'

export type CampusId = 'hammond'

export type CategoryId =
  | 'ada'
  | 'parking'
  | 'residence'
  | 'emergency'
  | 'community'
  | 'campusLife'
  | 'research'

export type GeometryType = 'point' | 'polygon'

export type PointCoordinates = [number, number]
export type PolygonCoordinates = PointCoordinates[]

export interface CampusFeature {
  id: string
  campus: CampusId
  name: string
  category: CategoryId
  type: GeometryType
  coordinates: PointCoordinates | PolygonCoordinates
  shortDescription: string
  tags: string[]
  accessibilityInfo?: string
  isPlaceholderData: boolean
}

export interface CategoryConfig {
  id: CategoryId
  label: string
  description: string
  defaultEnabled: boolean
  colorToken: string
  icon: LucideIcon
}

export interface CampusConfig {
  campusId: CampusId
  displayName: string
  center: PointCoordinates
  defaultZoom: number
  initialBounds: [PointCoordinates, PointCoordinates]
  maxBounds: [PointCoordinates, PointCoordinates]
}
