import { CategoryList } from './CategoryList'
import { SearchPanel } from './SearchPanel'

export function SidebarContent() {
  return (
    <div className="flex min-h-full flex-col gap-3.5 bg-transparent p-4">
      <div className="surface-card shrink-0 overflow-hidden rounded-panel border border-slate-200/90 shadow-panelMd">
        <div className="hero-banner relative h-28 w-full" role="img" aria-label="PNW Hammond campus hero placeholder">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent" />
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/45 bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white panel-blur">
            Hammond Campus
          </div>
        </div>
        <div className="space-y-2.5 border-t border-slate-200/70 p-3.5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Campus Control Center
            </p>
            <h1 className="font-heading text-[1.28rem] font-semibold leading-tight text-text-primary">
              PNW Hammond Map
            </h1>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full border border-accent-gold/45 bg-accent-gold-soft/85 px-2.5 py-1 text-[11px] font-semibold text-[#63460a]">
              Demo-ready UI
            </span>
            <span className="rounded-full border border-focus/35 bg-accent-navy-soft/70 px-2.5 py-1 text-[11px] font-semibold text-accent-navy">
              Hammond-only scope
            </span>
          </div>
          <p className="text-xs leading-relaxed text-text-secondary">
            All map records shown in this MVP are clearly marked placeholder/demo unless officially verified.
          </p>
        </div>
      </div>

      <SearchPanel />
      <CategoryList />

      <footer className="surface-card rounded-card border border-slate-200/90 p-3 text-text-primary shadow-panelMd">
        <p className="font-heading text-base font-semibold">Purdue University Northwest</p>
        <p className="mt-1 text-xs text-text-secondary">
          Hammond Main Campus: 2200 169th Street, Hammond, IN 46323
        </p>
        <p className="mt-2 rounded-control border border-warning/35 bg-warning/10 px-2 py-1 text-[11px] text-text-secondary">
          Map content in this MVP is placeholder/demo for class-project prototyping.
        </p>
      </footer>
    </div>
  )
}
