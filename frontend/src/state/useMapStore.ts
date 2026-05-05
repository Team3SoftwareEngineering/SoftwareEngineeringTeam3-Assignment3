import { create } from 'zustand'
import { hammondFeatures } from '../data/hammond/features'
import type { CategoryId } from '../models/campus'
import type { CampusFeature } from '../models/campus'
import type {
  RouteOriginMode,
  RouteResult,
  RouteTravelMode,
  RouteWaypoint,
} from '../models/routing'
import { hammondCategories } from '../data/hammond/categories'

const initialCategories = new Set(
  hammondCategories.filter((item) => item.defaultEnabled).map((item) => item.id),
)

const initialFeatures = hammondFeatures
type RouteStatus = 'idle' | 'loading' | 'success' | 'error'

interface MapStoreState {
  selectedFeatureId: string | null
  focusedFeatureId: string | null
  focusRevision: number
  searchQuery: string
  isMobileDrawerOpen: boolean
  isSidebarCollapsed: boolean
  sidebarWidth: number
  isFeatureDetailsVisible: boolean
  activeCategories: Set<CategoryId>
  features: CampusFeature[]
  featureSource: 'backend' | 'local'
  isLoadingFeatures: boolean
  featureLoadError: string | null
  routingMode: RouteTravelMode
  routeOriginMode: RouteOriginMode
  routeOrigin: RouteWaypoint | null
  routeDestination: RouteWaypoint | null
  routeResult: RouteResult | null
  routeStatus: RouteStatus
  routeError: string | null
  isPickingRouteOrigin: boolean
  setSearchQuery: (query: string) => void
  setSelectedFeatureId: (featureId: string | null) => void
  requestFeatureFocus: (featureId: string) => void
  setMobileDrawerOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarWidth: (width: number) => void
  toggleSidebarCollapsed: () => void
  setFeatureDetailsVisible: (visible: boolean) => void
  toggleCategory: (categoryId: CategoryId) => void
  enableAllCategories: () => void
  clearCategories: () => void
  setCampusFeatures: (features: CampusFeature[], source: 'backend' | 'local') => void
  setFeatureLoading: (isLoading: boolean) => void
  setFeatureLoadError: (message: string | null) => void
  setRoutingMode: (mode: RouteTravelMode) => void
  setRouteOriginMode: (mode: RouteOriginMode) => void
  setRouteOrigin: (origin: RouteWaypoint | null) => void
  setRouteDestination: (destination: RouteWaypoint | null) => void
  setRouteResult: (result: RouteResult | null) => void
  setRouteStatus: (status: RouteStatus, errorMessage?: string | null) => void
  setPickingRouteOrigin: (isPicking: boolean) => void
  clearRoute: () => void
}

export const useMapStore = create<MapStoreState>((set) => ({
  selectedFeatureId: null,
  focusedFeatureId: null,
  focusRevision: 0,
  searchQuery: '',
  isMobileDrawerOpen: false,
  isSidebarCollapsed: false,
  sidebarWidth: 390,
  isFeatureDetailsVisible: false,
  activeCategories: initialCategories,
  features: initialFeatures,
  featureSource: 'local',
  isLoadingFeatures: false,
  featureLoadError: null,
  routingMode: 'walking',
  routeOriginMode: 'current',
  routeOrigin: null,
  routeDestination: null,
  routeResult: null,
  routeStatus: 'idle',
  routeError: null,
  isPickingRouteOrigin: false,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedFeatureId: (selectedFeatureId) =>
    set({
      selectedFeatureId,
      isFeatureDetailsVisible: selectedFeatureId ? true : false,
    }),
  requestFeatureFocus: (featureId) =>
    set((state) => ({
      selectedFeatureId: featureId,
      focusedFeatureId: featureId,
      focusRevision: state.focusRevision + 1,
      isFeatureDetailsVisible: true,
    })),
  setMobileDrawerOpen: (isMobileDrawerOpen) => set({ isMobileDrawerOpen }),
  setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
  setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
  toggleSidebarCollapsed: () =>
    set((state) => ({
      isSidebarCollapsed: !state.isSidebarCollapsed,
    })),
  setFeatureDetailsVisible: (isFeatureDetailsVisible) => set({ isFeatureDetailsVisible }),
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
  enableAllCategories: () =>
    set({
      activeCategories: new Set(hammondCategories.map((category) => category.id)),
    }),
  clearCategories: () =>
    set({
      activeCategories: new Set(),
    }),
  setCampusFeatures: (features, source) =>
    set({
      features,
      featureSource: source,
      featureLoadError: null,
    }),
  setFeatureLoading: (isLoadingFeatures) => set({ isLoadingFeatures }),
  setFeatureLoadError: (featureLoadError) => set({ featureLoadError }),
  setRoutingMode: (routingMode) =>
    set({
      routingMode,
      routeResult: null,
      routeStatus: 'idle',
      routeError: null,
    }),
  setRouteOriginMode: (routeOriginMode) => set({ routeOriginMode }),
  setRouteOrigin: (routeOrigin) =>
    set({
      routeOrigin,
      routeResult: null,
      routeStatus: 'idle',
      routeError: null,
    }),
  setRouteDestination: (routeDestination) =>
    set({
      routeDestination,
      routeResult: null,
      routeStatus: 'idle',
      routeError: null,
    }),
  setRouteResult: (routeResult) => set({ routeResult }),
  setRouteStatus: (routeStatus, errorMessage = null) =>
    set({
      routeStatus,
      routeError: errorMessage,
    }),
  setPickingRouteOrigin: (isPickingRouteOrigin) => set({ isPickingRouteOrigin }),
  clearRoute: () =>
    set({
      routeResult: null,
      routeStatus: 'idle',
      routeError: null,
    }),
}))
