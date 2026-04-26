interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="surface-card rounded-card border border-dashed border-slate-300 p-4 text-center shadow-panelSm">
      <p className="font-heading text-base font-semibold text-text-primary">{title}</p>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
    </div>
  )
}
