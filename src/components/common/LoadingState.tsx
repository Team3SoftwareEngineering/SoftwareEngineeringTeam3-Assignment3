interface LoadingStateProps {
  message: string
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="panel-blur inline-flex items-center gap-2 rounded-control border border-slate-300 bg-white/88 px-3 py-2 text-sm font-semibold text-text-secondary shadow-panelSm">
      <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-accent-navy" />
      <span>{message}</span>
    </div>
  )
}
