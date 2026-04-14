import { useMemo } from 'react'
import clsx from 'clsx'
import { Check } from 'lucide-react'
import { hammondCategories } from '../../data/hammond/categories'
import { hammondFeatures } from '../../data/hammond/features'
import type { CategoryId, CampusFeature } from '../../models/campus'
import { useMapStore } from '../../state/useMapStore'

interface CategoryListProps {
  onCategorySelect?: (categoryId: CategoryId) => void
}

export function CategoryList({ onCategorySelect }: CategoryListProps) {
  const activeCategories = useMapStore((state) => state.activeCategories)
  const toggleCategory = useMapStore((state) => state.toggleCategory)

  const categoryCounts = useMemo(() => {
    return hammondFeatures.reduce<Partial<Record<CategoryId, number>>>((acc, feature: CampusFeature) => {
      acc[feature.category] = (acc[feature.category] ?? 0) + 1
      return acc
    }, {})
  }, [])

  return (
    <section
      aria-label="Category filters"
      className="surface-card overflow-hidden rounded-card border border-slate-200/90 shadow-panelMd"
    >
      <div className="border-b border-slate-200/80 px-4 py-3.5">
        <h2 className="font-heading text-base font-semibold text-text-primary">Layer Categories</h2>
        <p className="text-xs text-text-secondary">Toggle what appears on the Hammond map</p>
      </div>
      <ul className="divide-y divide-slate-100/80">
        {hammondCategories.map((category) => {
          const active = activeCategories.has(category.id)
          const Icon = category.icon
          const count = categoryCounts[category.id] ?? 0

          return (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => {
                  toggleCategory(category.id)
                  onCategorySelect?.(category.id)
                }}
                className={clsx(
                  'interactive-transition flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left',
                  active
                    ? 'border-l-2 border-accent-navy bg-accent-navy-soft/55 shadow-softInset'
                    : 'bg-transparent hover:bg-surface-muted/90',
                )}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={clsx(
                      'inline-flex h-9 w-9 items-center justify-center rounded-control border bg-white shadow-softInset',
                      active ? 'border-accent-navy/30' : 'border-slate-200',
                    )}
                    style={{ color: category.colorToken }}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-text-primary">
                      {category.label}{' '}
                      <span className="text-xs font-semibold text-text-secondary">({count})</span>
                    </span>
                    <span className="block truncate text-xs text-text-secondary">
                      {category.description}
                    </span>
                  </span>
                </span>
                <span
                  className={clsx(
                    'inline-flex h-6 w-10 items-center rounded-full border p-[2px] transition-colors',
                    active
                      ? 'border-accent-gold bg-accent-gold-soft'
                      : 'border-slate-300 bg-slate-200/80',
                  )}
                  aria-hidden="true"
                >
                  <span
                    className={clsx(
                      'inline-flex h-5 w-5 items-center justify-center rounded-full transition-transform',
                      active
                        ? 'translate-x-[14px] bg-accent-gold text-white shadow-panelSm'
                        : 'translate-x-0 bg-white text-slate-400',
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
