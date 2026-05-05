import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useMapStore } from '../../state/useMapStore'

export function MapResizeController() {
  const map = useMap()
  const isSidebarCollapsed = useMapStore((state) => state.isSidebarCollapsed)
  const sidebarWidth = useMapStore((state) => state.sidebarWidth)

  useEffect(() => {
    const runInvalidate = () => {
      map.invalidateSize()
    }

    const frame = window.requestAnimationFrame(runInvalidate)
    const timer = window.setTimeout(runInvalidate, 340)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [isSidebarCollapsed, map, sidebarWidth])

  useEffect(() => {
    const handleResize = () => map.invalidateSize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [map])

  return null
}

