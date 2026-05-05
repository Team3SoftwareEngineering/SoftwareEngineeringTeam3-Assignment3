import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { SidebarContent } from '../components/sidebar/SidebarContent'
import { TopNav } from '../components/header/TopNav'
import { CampusMap } from '../components/map/CampusMap'
// import CampusMapEditor from "../components/map/CampusMapEditor"

import { useMapStore } from '../state/useMapStore'

export function AppShell() {
  const isMobileDrawerOpen = useMapStore((state) => state.isMobileDrawerOpen)
  const setMobileDrawerOpen = useMapStore((state) => state.setMobileDrawerOpen)

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg font-body text-text-primary">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-accent-navy/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-0 h-80 w-80 rounded-full bg-accent-gold/15 blur-3xl" />

      <TopNav onOpenMobileDrawer={() => setMobileDrawerOpen(true)} />

      <div className="relative mx-auto grid h-[calc(100vh-74px)] w-full max-w-[1600px] grid-cols-1 gap-4 p-4 lg:grid-cols-[390px_minmax(0,1fr)] lg:gap-6 lg:p-5">
        <aside className="hidden min-h-0 overflow-y-auto rounded-panel border border-slate-300/80 bg-white/72 shadow-panelLg panel-blur lg:block">
          <SidebarContent />
        </aside>

        <main className="relative min-h-[calc(100vh-160px)] lg:min-h-0">
          <CampusMap />
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
