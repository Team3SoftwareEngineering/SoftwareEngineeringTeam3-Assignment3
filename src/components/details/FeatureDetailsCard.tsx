import { CircleHelp, MapPin, Sparkles } from 'lucide-react'
import { hammondCategories } from '../../data/hammond/categories'
import { hammondFeatures } from '../../data/hammond/features'
import { useMapStore } from '../../state/useMapStore'

export function FeatureDetailsCard() {
  const selectedFeatureId = useMapStore((state) => state.selectedFeatureId)
  const feature = hammondFeatures.find((entry) => entry.id === selectedFeatureId) ?? null
  const category = feature
    ? hammondCategories.find((entry) => entry.id === feature.category) ?? null
    : null

  if (!feature) {
    return (
      <aside className="surface-card rounded-card border border-slate-200/90 p-4 shadow-panelMd">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Feature Details</p>
        <h2 className="mt-1 font-heading text-lg font-semibold text-text-primary">No feature selected</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Click a map point or polygon to inspect details.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-control border border-slate-200 bg-white/85 px-2.5 py-1.5 text-xs text-text-secondary">
          <CircleHelp className="h-3.5 w-3.5 text-accent-navy" />
          Select from map or search results
        </div>
      </aside>
    )
  }

  return (
    <aside className="surface-card rounded-card border border-slate-200/90 p-4 shadow-panelLg">
      <div className="mb-3 h-1 w-20 rounded-full bg-gradient-to-r from-accent-navy to-accent-gold" />
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Feature Details</p>
        <span className="inline-flex items-center gap-1 rounded-full border border-accent-navy/30 bg-accent-navy-soft/80 px-2 py-0.5 text-[11px] font-semibold text-accent-navy">
          <MapPin className="h-3 w-3" />
          {feature.type === 'point' ? 'Point' : 'Area'}
        </span>
      </div>
      <h2 className="mt-2 font-heading text-[1.05rem] font-semibold leading-snug text-text-primary">
        {feature.name}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{feature.shortDescription}</p>

      <div className="mt-3 flex flex-wrap gap-2.5">
        <span className="rounded-full border border-accent-gold/40 bg-accent-gold-soft/80 px-2.5 py-1 text-xs font-semibold text-[#67490d]">
          {category?.label ?? feature.category}
        </span>
        {feature.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-xs text-text-secondary"
          >
            {tag}
          </span>
        ))}
      </div>

      {feature.accessibilityInfo ? (
        <p className="mt-3 rounded-control border border-focus/30 bg-focus/10 px-2.5 py-1.5 text-xs leading-relaxed text-text-secondary">
          Accessibility info: {feature.accessibilityInfo}
        </p>
      ) : null}

      {feature.isPlaceholderData ? (
        <p className="mt-3 inline-flex items-start gap-1.5 rounded-control border border-warning/40 bg-warning/10 px-2.5 py-1.5 text-xs leading-relaxed text-text-secondary">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 text-warning" />
          Demo/placeholder entry. Not an official campus record.
        </p>
      ) : null}
    </aside>
  )
}
