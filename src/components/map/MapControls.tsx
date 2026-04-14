import { Maximize2 } from 'lucide-react'
import { useMap } from 'react-leaflet'
import { hammondCampusConfig } from '../../data/hammond/campusConfig'

export function MapControls() {
  const map = useMap()

  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-[500]">
      <button
        type="button"
        onClick={() =>
          map.fitBounds(hammondCampusConfig.initialBounds, {
            animate: true,
            duration: 0.85,
            padding: [32, 32],
          })
        }
        className="interactive-transition pointer-events-auto inline-flex items-center gap-2 rounded-control border border-slate-300 bg-white/92 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wide text-text-primary shadow-panelMd panel-blur hover:-translate-y-0.5 hover:border-accent-navy/45 hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
      >
        <Maximize2 className="h-3.5 w-3.5 text-accent-navy" />
        Reset View
      </button>
    </div>
  )
}
