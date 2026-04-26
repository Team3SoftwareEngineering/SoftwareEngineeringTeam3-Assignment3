import { create } from 'zustand'
import type { CategoryId } from '../models/campus'
import { hammondCategories } from '../data/hammond/categories'

const initialCategories = new Set(
  hammondCategories.filter((item) => item.defaultEnabled).map((item) => item.id),
)

interface MapStoreState {
  selectedFeatureId: string | null
  focusedFeatureId: string | null
  focusRevision: number
  searchQuery: string
  isMobileDrawerOpen: boolean
  activeCategories: Set<CategoryId>
  setSearchQuery: (query: string) => void
  setSelectedFeatureId: (featureId: string | null) => void
  requestFeatureFocus: (featureId: string) => void
  setMobileDrawerOpen: (open: boolean) => void
  toggleCategory: (categoryId: CategoryId) => void
}

export const useMapStore = create<MapStoreState>((set) => ({
  selectedFeatureId: null,
  focusedFeatureId: null,
  focusRevision: 0,
  searchQuery: '',
  isMobileDrawerOpen: false,
  activeCategories: initialCategories,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedFeatureId: (selectedFeatureId) => set({ selectedFeatureId }),
  requestFeatureFocus: (featureId) =>
    set((state) => ({
      selectedFeatureId: featureId,
      focusedFeatureId: featureId,
      focusRevision: state.focusRevision + 1,
    })),
  setMobileDrawerOpen: (isMobileDrawerOpen) => set({ isMobileDrawerOpen }),
  toggleCategory: (categoryId) =>
    set((state) => {
      const next = new Set(state.activeCategories)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return { activeCategories: next }
    }),
}))
