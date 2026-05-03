import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { GripHorizontal } from 'lucide-react'

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

  return (
    <div
      ref={widgetRef}
      className="fixed z-[1000] w-[230px] overflow-hidden rounded-card border border-slate-300 bg-white/90 text-sm shadow-panelLg panel-blur"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`flex w-full cursor-grab items-center justify-between border-b border-slate-200 bg-surface-muted px-3 py-2 text-xs font-bold uppercase tracking-wide text-text-secondary active:cursor-grabbing ${
          isDragging ? 'select-none' : ''
        }`}
        aria-label="Drag navigation widget"
      >
        <span>{title}</span>
        <GripHorizontal className="h-4 w-4" />
      </button>

      <div className="px-4 py-3">{children}</div>
    </div>
  )
}