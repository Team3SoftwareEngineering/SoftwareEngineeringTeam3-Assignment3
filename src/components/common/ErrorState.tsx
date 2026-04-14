interface ErrorStateProps {
  title: string
  description: string
}

export function ErrorState({ title, description }: ErrorStateProps) {
  return (
    <div className="rounded-card border border-danger/40 bg-danger/10 p-4 shadow-panelSm">
      <p className="font-heading text-base font-semibold text-danger">{title}</p>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
    </div>
  )
}
