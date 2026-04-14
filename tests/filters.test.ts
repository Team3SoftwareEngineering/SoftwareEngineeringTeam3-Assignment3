import { describe, expect, it } from 'vitest'
import { hammondFeatures } from '../src/data/hammond/features'
import { filterFeaturesByCategories } from '../src/utils/filters'

describe('filterFeaturesByCategories', () => {
  it('returns only features from selected categories', () => {
    const visible = filterFeaturesByCategories(hammondFeatures, new Set(['parking']))
    expect(visible.length).toBeGreaterThan(0)
    expect(visible.every((feature) => feature.category === 'parking')).toBe(true)
  })

  it('returns empty list when no categories are active', () => {
    expect(filterFeaturesByCategories(hammondFeatures, new Set()).length).toBe(0)
  })
})
