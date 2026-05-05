import { hammondFeatures } from '../data/hammond/features'
import type { CampusFeature } from '../models/campus'
import { apiGet } from './apiClient'

interface BackendMapFeature {
  id: string
  campus: 'hammond'
  name: string
  category: CampusFeature['category']
  type: CampusFeature['type']
  coordinates: CampusFeature['coordinates']
  shortDescription: string
  tags: string[]
  accessibilityInfo?: string | null
  address?: string | null
  locationId?: string | null
  isPlaceholderData: boolean
  dataSource?: 'backend'
}

export interface CampusFeatureResult {
  items: CampusFeature[]
  source: 'backend' | 'local'
}

function toCampusFeature(feature: BackendMapFeature): CampusFeature {
  return {
    id: feature.id,
    campus: 'hammond',
    name: feature.name,
    category: feature.category,
    type: feature.type,
    coordinates: feature.coordinates,
    shortDescription: feature.shortDescription,
    tags: Array.isArray(feature.tags) ? feature.tags : [],
    accessibilityInfo: feature.accessibilityInfo ?? undefined,
    address: feature.address ?? undefined,
    locationId: feature.locationId ?? undefined,
    dataSource: 'backend',
    isPlaceholderData: Boolean(feature.isPlaceholderData),
  }
}

function getCuratedLocalFeatures(): CampusFeature[] {
  return hammondFeatures
}

export async function getCampusFeatures(): Promise<CampusFeatureResult> {
  try {
    const response = await apiGet<{ data: BackendMapFeature[] }>(
      '/map-features?campus=hammond',
    )
    const mapped = response.data.map(toCampusFeature)

    if (!mapped.length) {
      return { items: getCuratedLocalFeatures(), source: 'local' }
    }

    return { items: mapped, source: 'backend' }
  } catch {
    return { items: getCuratedLocalFeatures(), source: 'local' }
  }
}
