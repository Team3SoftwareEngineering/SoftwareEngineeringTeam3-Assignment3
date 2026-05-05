import { type MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import clsx from 'clsx'
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { SidebarContent } from '../components/sidebar/SidebarContent'
import { TopNav } from '../components/header/TopNav'
import { CampusMap } from '../components/map/CampusMap'
import { getCampusFeatures } from '../services/campusFeatureService'
// import CampusMapEditor from "../components/map/CampusMapEditor"

import { useMapStore } from '../state/useMapStore'

export function AppShell() {
  const SIDEBAR_MIN_WIDTH = 300
  const SIDEBAR_MAX_WIDTH = 560
  const SIDEBAR_DRAG_THRESHOLD = 6
  const isMobileDrawerOpen = useMapStore((state) => state.isMobileDrawerOpen)
  const setMobileDrawerOpen = useMapStore((state) => state.setMobileDrawerOpen)
  const setCampusFeatures = useMapStore((state) => state.setCampusFeatures)
  const setFeatureLoading = useMapStore((state) => state.setFeatureLoading)
  const setFeatureLoadError = useMapStore((state) => state.setFeatureLoadError)
  const isSidebarCollapsed = useMapStore((state) => state.isSidebarCollapsed)
  const sidebarWidth = useMapStore((state) => state.sidebarWidth)
  const setSidebarWidth = useMapStore((state) => state.setSidebarWidth)
  const toggleSidebarCollapsed = useMapStore((state) => state.toggleSidebarCollapsed)
  const [isDraggingSidebarTab, setIsDraggingSidebarTab] = useState(false)
  const sidebarInteractionState = useRef<{
    startX: number
    startWidth: number
    didDrag: boolean
  } | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadCampusData() {
      setFeatureLoading(true)
      try {
        const result = await getCampusFeatures()
        if (!isMounted) return
        setCampusFeatures(result.items, result.source)
      } catch (error) {
        if (!isMounted) return
        setFeatureLoadError(
          error instanceof Error ? error.message : 'Failed to load campus features.',
        )
      } finally {
        if (isMounted) {
          setFeatureLoading(false)
        }
      }
    }

    loadCampusData()
    return () => {
      isMounted = false
    }
  }, [setCampusFeatures, setFeatureLoadError, setFeatureLoading])

  useEffect(() => {
    if (!isDraggingSidebarTab) return

    function handleMouseMove(event: globalThis.MouseEvent) {
      const state = sidebarInteractionState.current
      if (!state) return
      const deltaX = event.clientX - state.startX
      if (!state.didDrag && Math.abs(deltaX) >= SIDEBAR_DRAG_THRESHOLD) {
        state.didDrag = true
      }

      if (isSidebarCollapsed || !state.didDrag) {
        return
      }

      const nextWidth = Math.min(
        SIDEBAR_MAX_WIDTH,
        Math.max(SIDEBAR_MIN_WIDTH, state.startWidth + deltaX),
      )
      setSidebarWidth(nextWidth)
    }

    function handleMouseUp() {
      const state = sidebarInteractionState.current
      if (state && !state.didDrag) {
        toggleSidebarCollapsed()
      }
      setIsDraggingSidebarTab(false)
      sidebarInteractionState.current = null
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [
    SIDEBAR_DRAG_THRESHOLD,
    isDraggingSidebarTab,
    isSidebarCollapsed,
    setSidebarWidth,
    toggleSidebarCollapsed,
  ])

  function startSidebarTabInteraction(event: ReactMouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    sidebarInteractionState.current = {
      startX: event.clientX,
      startWidth: sidebarWidth,
      didDrag: false,
    }
    setIsDraggingSidebarTab(true)
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg font-body text-text-primary">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-accent-navy/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-0 h-80 w-80 rounded-full bg-accent-gold/15 blur-3xl" />

      <TopNav onOpenMobileDrawer={() => setMobileDrawerOpen(true)} />

      <div
        className="relative mx-auto grid h-[calc(100vh-74px)] w-full max-w-[1600px] grid-cols-1 gap-4 p-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-6 lg:p-5"
      >
        <aside
          className={clsx(
            'hidden min-h-0 overflow-y-auto rounded-panel border border-slate-300/80 bg-white/72 shadow-panelLg panel-blur transition-all duration-300 lg:block',
            isSidebarCollapsed
              ? 'pointer-events-none opacity-0 -translate-x-4'
              : 'pointer-events-auto opacity-100 translate-x-0',
          )}
          style={{
            width: isSidebarCollapsed ? 0 : sidebarWidth,
          }}
        >
          <SidebarContent />
        </aside>

        <main className="relative min-h-[calc(100vh-160px)] lg:min-h-0">
          <CampusMap />
          <button
            type="button"
            onMouseDown={startSidebarTabInteraction}
            className={clsx(
              'interactive-transition absolute left-0 top-1/2 z-[550] hidden h-16 w-6 -translate-x-1/2 -translate-y-1/2 cursor-col-resize items-center justify-center rounded-r-control border border-slate-300 bg-white/95 text-text-secondary shadow-panelMd panel-blur hover:border-accent-navy/45 hover:text-accent-navy lg:inline-flex',
              isDraggingSidebarTab ? 'border-accent-navy/45 text-accent-navy' : null,
            )}
            aria-label={isSidebarCollapsed ? 'Show sidebar widgets' : 'Hide sidebar widgets'}
            title={
              isSidebarCollapsed
                ? 'Click to show sidebar. Drag after opening to resize.'
                : 'Click to hide sidebar. Drag to resize.'
            }
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </main>
      </div>

      <Dialog.Root open={isMobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/48 lg:hidden" />
          <Dialog.Content className="sheet-content fixed inset-x-2.5 bottom-2 top-[10vh] z-50 overflow-hidden rounded-[22px] border border-slate-300 bg-white/88 shadow-panelLg panel-blur lg:hidden">
            <Dialog.Title className="sr-only">Map controls</Dialog.Title>
            <div className="border-b border-slate-200/80 px-4 py-3.5">
              <div className="flex items-center justify-between">
                <p className="font-heading text-base font-semibold text-text-primary">Hammond Map Controls</p>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="interactive-transition inline-flex h-10 w-10 items-center justify-center rounded-control border border-slate-300 bg-white text-text-primary hover:-translate-y-0.5 hover:border-accent-navy/40 hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                    aria-label="Close map controls"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>
              </div>
            </div>
            <div className="h-[calc(100%-65px)] overflow-y-auto">
              <SidebarContent />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
