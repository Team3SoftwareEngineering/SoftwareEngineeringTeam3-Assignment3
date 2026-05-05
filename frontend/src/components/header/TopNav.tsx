import { Compass, Layers3, MapPinned, Menu } from 'lucide-react'
import { useMapStore } from '../../state/useMapStore'

interface TopNavProps {
  onOpenMobileDrawer: () => void
}

export function TopNav({ onOpenMobileDrawer }: TopNavProps) {
  const selectedFeatureId = useMapStore((state) => state.selectedFeatureId)
  const features = useMapStore((state) => state.features)

  return (
    <header className="border-b border-slate-300/70 bg-white/72 shadow-panelSm panel-blur">
      <div className="mx-auto flex h-[74px] w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3.5">
          <button
            type="button"
            className="interactive-transition inline-flex h-10 w-10 items-center justify-center rounded-control border border-slate-300 bg-white text-text-primary hover:-translate-y-0.5 hover:border-accent-navy/40 hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus lg:hidden"
            aria-label="Open map controls"
            onClick={onOpenMobileDrawer}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-control border border-accent-navy/20 bg-gradient-to-br from-accent-navy to-[#1e4e84] text-slate-100 shadow-panelSm">
              <MapPinned className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="truncate font-heading text-base font-semibold tracking-tight text-text-primary">
                Purdue University Northwest
              </p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-gold/40 bg-accent-gold-soft/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#5d4308]">
                  <Layers3 className="h-3.5 w-3.5" />
                  Hammond Map
                </span>
                <p className="hidden truncate text-xs text-text-secondary sm:block">
                  Interactive campus navigation
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-control border border-slate-300 bg-white/85 px-3 py-2 shadow-softInset sm:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-gold/40 bg-accent-gold-soft px-2 py-0.5 text-[11px] font-semibold text-[#5d4308]">
            Hammond Campus
          </span>
          <span className="text-xs font-semibold text-text-secondary">
            {features.length} mapped locations
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-control border border-slate-300 bg-white/88 px-3 py-2 text-xs font-semibold text-text-secondary shadow-panelSm">
          <Compass className="h-4 w-4 text-accent-navy" />
          <span className="inline-flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${selectedFeatureId ? 'bg-success' : 'bg-slate-300'}`}
              aria-hidden="true"
            />
            {selectedFeatureId ? 'Feature selected' : 'No selection'}
          </span>
        </div>
      </div>
    </header>
  )
}
