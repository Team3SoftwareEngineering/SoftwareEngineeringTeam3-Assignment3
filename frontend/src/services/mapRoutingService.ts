import type { PointCoordinates } from '../models/campus'
import type { RouteResult, RouteTravelMode, RouteWaypoint } from '../models/routing'
import { apiPost } from './apiClient'

interface OsrmStep {
  maneuver?: {
    instruction?: string
    type?: string
    modifier?: string
  }
  name?: string
}

interface OsrmRouteLeg {
  steps?: OsrmStep[]
}

interface OsrmRoute {
  geometry?: {
    coordinates?: [number, number][]
  }
  distance?: number
  duration?: number
  legs?: OsrmRouteLeg[]
}

interface OsrmResponse {
  code?: string
  routes?: OsrmRoute[]
}

interface OsrmNearestWaypoint {
  location?: [number, number]
  distance?: number
}

interface OsrmNearestResponse {
  code?: string
  waypoints?: OsrmNearestWaypoint[]
}

interface BackendRouteResponse {
  data: {
    provider: string
    mode: RouteTravelMode
    distance?: {
      meters?: number
      miles?: number
    }
    duration?: {
      seconds?: number
      text?: string
    }
    directions?: Array<{ instruction?: string }>
  }
}

const OSRM_BASE_URL = 'https://router.project-osrm.org'
const MAX_WALKING_SNAP_DISTANCE_METERS = 120

function toOsrmProfile(mode: RouteTravelMode): string {
  if (mode === 'walking') return 'foot'
  if (mode === 'bicycling') return 'bike'
  return 'driving'
}

function formatDuration(durationSeconds: number): string {
  const totalMinutes = Math.max(1, Math.round(durationSeconds / 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (!hours) return `${minutes} min`
  if (!minutes) return `${hours} hr`
  return `${hours} hr ${minutes} min`
}

function toLeafletPath(coordinates: [number, number][]): PointCoordinates[] {
  return coordinates.map((coordinate) => [coordinate[1], coordinate[0]])
}

function toInstruction(step: OsrmStep): string | null {
  const maneuver = step.maneuver
  if (maneuver?.instruction && maneuver.instruction.trim()) {
    return maneuver.instruction
  }

  const maneuverType = maneuver?.type || 'continue'
  const modifier = maneuver?.modifier ? ` ${maneuver.modifier}` : ''
  const roadName = step.name?.trim() ? ` on ${step.name.trim()}` : ''
  return `${maneuverType}${modifier}${roadName}`.trim() || null
}

async function snapWaypointToNetwork(
  waypoint: RouteWaypoint,
  profile: string,
  enforceDistanceLimit: boolean,
): Promise<RouteWaypoint> {
  const coordinate = `${waypoint.longitude},${waypoint.latitude}`
  const url = new URL(`${OSRM_BASE_URL}/nearest/v1/${profile}/${coordinate}`)
  url.searchParams.set('number', '1')

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    return waypoint
  }

  const payload = (await response.json()) as OsrmNearestResponse
  if (payload.code !== 'Ok' || !payload.waypoints?.length) {
    return waypoint
  }

  const nearest = payload.waypoints[0]
  const location = nearest.location
  if (!location || location.length < 2) {
    return waypoint
  }

  if (
    enforceDistanceLimit &&
    Number.isFinite(nearest.distance) &&
    (nearest.distance as number) > MAX_WALKING_SNAP_DISTANCE_METERS
  ) {
    throw new Error(
      `No nearby pedestrian path was found within ${MAX_WALKING_SNAP_DISTANCE_METERS} meters.`,
    )
  }

  return {
    ...waypoint,
    latitude: location[1],
    longitude: location[0],
  }
}

async function getRouteFromOsrm(
  origin: RouteWaypoint,
  destination: RouteWaypoint,
  mode: RouteTravelMode,
): Promise<RouteResult> {
  const profile = toOsrmProfile(mode)
  const enforceWalkingSnapLimit = mode === 'walking'
  const [snappedOrigin, snappedDestination] = await Promise.all([
    snapWaypointToNetwork(origin, profile, enforceWalkingSnapLimit),
    snapWaypointToNetwork(destination, profile, enforceWalkingSnapLimit),
  ])
  const coordinates = `${snappedOrigin.longitude},${snappedOrigin.latitude};${snappedDestination.longitude},${snappedDestination.latitude}`
  const url = new URL(`${OSRM_BASE_URL}/route/v1/${profile}/${coordinates}`)
  url.searchParams.set('overview', 'full')
  url.searchParams.set('geometries', 'geojson')
  url.searchParams.set('steps', 'true')

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Routing request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as OsrmResponse
  if (payload.code !== 'Ok' || !payload.routes?.length) {
    throw new Error('No route could be calculated for the selected points.')
  }

  const route = payload.routes[0]
  const geometry = route.geometry?.coordinates ?? []
  if (!geometry.length) {
    throw new Error('The routing provider returned an empty path.')
  }

  const distanceMeters = Math.round(route.distance ?? 0)
  const durationSeconds = Math.round(route.duration ?? 0)
  const instructions =
    route.legs
      ?.flatMap((leg) => leg.steps ?? [])
      .map(toInstruction)
      .filter((value): value is string => Boolean(value)) ?? []

  return {
    provider: 'osrm',
    mode,
    origin: snappedOrigin,
    destination: snappedDestination,
    path: toLeafletPath(geometry),
    distanceMeters,
    distanceMiles: Number((distanceMeters / 1609.344).toFixed(2)),
    durationSeconds,
    durationText: formatDuration(durationSeconds),
    steps: instructions,
  }
}

async function getRouteFromBackend(
  origin: RouteWaypoint,
  destination: RouteWaypoint,
  mode: RouteTravelMode,
): Promise<RouteResult> {
  const response = await apiPost<BackendRouteResponse, unknown>('/routes', {
    origin,
    destination,
    mode,
  })

  const distanceMeters = Math.round(response.data.distance?.meters ?? 0)
  const durationSeconds = Math.round(response.data.duration?.seconds ?? 0)
  return {
    provider: response.data.provider || 'backend',
    mode,
    origin,
    destination,
    path: [
      [origin.latitude, origin.longitude],
      [destination.latitude, destination.longitude],
    ],
    distanceMeters,
    distanceMiles: Number(((response.data.distance?.miles ?? distanceMeters / 1609.344)).toFixed(2)),
    durationSeconds,
    durationText: response.data.duration?.text || formatDuration(durationSeconds),
    steps:
      response.data.directions
        ?.map((entry) => entry.instruction?.trim() || '')
        .filter((instruction) => Boolean(instruction)) ?? [],
  }
}

export async function getRoute(
  origin: RouteWaypoint,
  destination: RouteWaypoint,
  mode: RouteTravelMode,
): Promise<RouteResult> {
  try {
    return await getRouteFromOsrm(origin, destination, mode)
  } catch {
    if (mode === 'walking') {
      throw new Error(
        'Walking directions are temporarily unavailable for this selection. Try moving the start or destination closer to a mapped pedestrian path.',
      )
    }

    return getRouteFromBackend(origin, destination, mode)
  }
}
