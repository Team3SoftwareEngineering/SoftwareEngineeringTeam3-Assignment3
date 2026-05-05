import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Eye, EyeOff, GripHorizontal } from 'lucide-react'

interface Position {
  x: number
  y: number
}

interface DraggableWidgetProps {
  storageKey: string
  title?: string
  children: ReactNode
}

function getInitialPosition(storageKey: string): Position {
  if (typeof window === 'undefined') {
    return { x: 16, y: 420 }
  }

  try {
    const savedPosition = localStorage.getItem(storageKey)

    if (savedPosition) {
      return JSON.parse(savedPosition)
    }
  } catch {
    // Ignore invalid saved position.
  }

  return {
    x: 16,
    y: Math.max(window.innerHeight - 170, 16),
  }
}

function clampPosition(position: Position, element: HTMLDivElement | null): Position {
  if (typeof window === 'undefined' || !element) {
    return position
  }

  const padding = 12
  const rect = element.getBoundingClientRect()

  const maxX = window.innerWidth - rect.width - padding
  const maxY = window.innerHeight - rect.height - padding

  return {
    x: Math.min(Math.max(position.x, padding), Math.max(maxX, padding)),
    y: Math.min(Math.max(position.y, padding), Math.max(maxY, padding)),
  }
}

export function DraggableWidget({ storageKey, title = 'Drag widget', children }: DraggableWidgetProps) {
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const dragStartRef = useRef({
    pointerX: 0,
    pointerY: 0,
    widgetX: 0,
    widgetY: 0,
  })

  const [position, setPosition] = useState<Position>(() => getInitialPosition(storageKey))
  const [isDragging, setIsDragging] = useState(false)
  const [isHidden, setIsHidden] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(`${storageKey}:hidden`) === 'true'
  })

  useEffect(() => {
    const clampedPosition = clampPosition(position, widgetRef.current)
    setPosition(clampedPosition)
    // Only run once after mount so the widget does not appear off-screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function handleResize() {
      setPosition((currentPosition) => {
        const nextPosition = clampPosition(currentPosition, widgetRef.current)
        localStorage.setItem(storageKey, JSON.stringify(nextPosition))
        return nextPosition
      })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [storageKey])

  function setWidgetHidden(hidden: boolean) {
    setIsHidden(hidden)
    localStorage.setItem(`${storageKey}:hidden`, String(hidden))
  }

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)

    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      widgetX: position.x,
      widgetY: position.y,
    }

    setIsDragging(true)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!isDragging) return

    const deltaX = event.clientX - dragStartRef.current.pointerX
    const deltaY = event.clientY - dragStartRef.current.pointerY

    const nextPosition = clampPosition(
      {
        x: dragStartRef.current.widgetX + deltaX,
        y: dragStartRef.current.widgetY + deltaY,
      },
      widgetRef.current,
    )

    setPosition(nextPosition)
  }

  function handlePointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId)
    setIsDragging(false)

    const finalPosition = clampPosition(position, widgetRef.current)
    localStorage.setItem(storageKey, JSON.stringify(finalPosition))
  }

  if (isHidden) {
    return (
      <div
        ref={widgetRef}
        className="fixed z-[1000]"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <button
          type="button"
          onClick={() => setWidgetHidden(false)}
          className="interactive-transition inline-flex items-center gap-2 rounded-control border border-slate-300 bg-white/92 px-3 py-2 text-xs font-bold uppercase tracking-wide text-accent-navy shadow-panelLg panel-blur hover:-translate-y-0.5 hover:border-accent-navy/45"
          aria-label={`Show ${title.toLowerCase()} widget`}
          title={`Show ${title}`}
        >
          <Eye className="h-4 w-4" />
          Show {title}
        </button>
      </div>
    )
  }

  return (
    <div
      ref={widgetRef}
      className="fixed z-[1000] w-[230px] overflow-hidden rounded-card border border-slate-300 bg-white/90 text-sm shadow-panelLg panel-blur"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="flex items-stretch border-b border-slate-200 bg-surface-muted">
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`flex min-w-0 flex-1 cursor-grab items-center justify-between gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide text-text-secondary active:cursor-grabbing ${
            isDragging ? 'select-none' : ''
          }`}
          aria-label="Drag navigation widget"
        >
          <span className="truncate">{title}</span>
          <GripHorizontal className="h-4 w-4 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => setWidgetHidden(true)}
          className="interactive-transition flex w-10 items-center justify-center border-l border-slate-200 text-text-secondary hover:bg-white hover:text-accent-navy"
          aria-label={`Hide ${title.toLowerCase()} widget`}
          title={`Hide ${title}`}
        >
          <EyeOff className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 py-3">{children}</div>
    </div>
  )
}
