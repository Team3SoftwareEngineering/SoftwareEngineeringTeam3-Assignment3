import type { RouteWaypoint } from '../models/routing'

interface NominatimSearchResult {
  display_name: string
  lat: string
  lon: string
}

interface NominatimReverseResult {
  display_name?: string
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'

export async function geocodeAddress(query: string): Promise<RouteWaypoint[]> {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return []

  const url = new URL(`${NOMINATIM_BASE_URL}/search`)
  url.searchParams.set('q', trimmedQuery)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '5')
  url.searchParams.set('addressdetails', '1')

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Geocoding request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as NominatimSearchResult[]

  return payload
    .map((item) => ({
      label: item.display_name,
      latitude: Number.parseFloat(item.lat),
      longitude: Number.parseFloat(item.lon),
      source: 'address' as const,
    }))
    .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  const url = new URL(`${NOMINATIM_BASE_URL}/reverse`)
  url.searchParams.set('lat', latitude.toString())
  url.searchParams.set('lon', longitude.toString())
  url.searchParams.set('format', 'jsonv2')

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    return `Pinned start (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`
  }

  const payload = (await response.json()) as NominatimReverseResult
  return (
    payload.display_name?.trim() ||
    `Pinned start (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`
  )
}
