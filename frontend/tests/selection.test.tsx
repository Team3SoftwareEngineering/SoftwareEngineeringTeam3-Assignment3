import { describe, expect, it } from 'vitest'
import { useMapStore } from '../src/state/useMapStore'

describe('selection state', () => {
  it('sets selected and focused feature when requesting focus', () => {
    const baseline = useMapStore.getState().focusRevision
    useMapStore.getState().requestFeatureFocus('hammond-library-01')

    const next = useMapStore.getState()
    expect(next.selectedFeatureId).toBe('hammond-library-01')
    expect(next.focusedFeatureId).toBe('hammond-library-01')
    expect(next.focusRevision).toBe(baseline + 1)
  })

  it('increments focus revision even on repeated feature focus', () => {
    const baseline = useMapStore.getState().focusRevision
    useMapStore.getState().requestFeatureFocus('hammond-library-01')
    const next = useMapStore.getState()
    expect(next.focusRevision).toBe(baseline + 1)
  })
})
