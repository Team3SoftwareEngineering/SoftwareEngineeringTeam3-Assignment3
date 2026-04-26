import type { CampusFeature, CategoryId } from '../models/campus'

export function filterFeaturesByCategories(
  features: CampusFeature[],
  activeCategories: Set<CategoryId>,
): CampusFeature[] {
  return features.filter((feature) => activeCategories.has(feature.category))
}

export function getFeatureById(features: CampusFeature[], featureId: string | null): CampusFeature | null {
  if (!featureId) {
    return null
  }

  return features.find((feature) => feature.id === featureId) ?? null
}
