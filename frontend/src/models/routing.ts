import type { PointCoordinates } from './campus'

export type RouteTravelMode = 'walking' | 'driving' | 'bicycling'
export type RouteOriginMode = 'current' | 'address' | 'map'

export interface RouteWaypoint {
  label: string
  latitude: number
  longitude: number
  source: 'current' | 'address' | 'map-click' | 'feature'
}

export interface RouteResult {
  provider: string
  mode: RouteTravelMode
  origin: RouteWaypoint
  destination: RouteWaypoint
  path: PointCoordinates[]
  distanceMeters: number
  distanceMiles: number
  durationSeconds: number
  durationText: string
  steps: string[]
}
