import { useState } from 'react'
import { AppShell } from './AppShell'
import { AuthPage } from '../pages/AuthPage'
import { CampusAssistantPage } from '../pages/CampusAssistantPage'
import { EventsPage } from '../pages/EventsPage'
import type { PublicDemoAccount } from '../models/auth'
import type { AssistantCardActionPayload } from '../models/chatAssistant'
import type { CampusEvent } from '../models/event'
import { clearCurrentSession, getCurrentSession } from '../services/authService'
import { DraggableWidget } from '../components/common/DraggableWidget'
import { useMapStore } from '../state/useMapStore'
import { getFeatureAnchor } from '../utils/map'
import { searchFeatures } from '../utils/search'

type AppView = 'auth' | 'events' | 'map' | 'assistant'

function normalize(value: string) {
  return value.trim().toLowerCase()
}

export function App() {
  const [session, setSession] = useState<PublicDemoAccount | null>(() => getCurrentSession())
  const features = useMapStore((state) => state.features)
  const requestFeatureFocus = useMapStore((state) => state.requestFeatureFocus)
  const setRouteDestination = useMapStore((state) => state.setRouteDestination)
  const setSidebarCollapsed = useMapStore((state) => state.setSidebarCollapsed)

  const [view, setView] = useState<AppView>(() => {
    return getCurrentSession() ? 'events' : 'auth'
  })

  function handleAuthenticated(account: PublicDemoAccount) {
    setSession(account)
    setView('events')
  }

  function handleContinueAsGuest() {
    setView('events')
  }

  function handleSignOut() {
    clearCurrentSession()
    setSession(null)
    setView('auth')
  }

  function focusMapFromAction(payload: AssistantCardActionPayload, withDirections: boolean) {
    const card = payload.card
    const possibleLocationId =
      card.kind === 'location' || card.kind === 'parking' || card.kind === 'registration'
        ? card.locationId
        : card.kind === 'event'
          ? card.locationId
          : undefined
    const possibleName =
      card.kind === 'location' || card.kind === 'parking' || card.kind === 'registration'
        ? card.locationName || card.title
        : card.kind === 'event'
          ? card.locationName || card.locationLabel
          : undefined
    const possibleLatitude =
      card.kind === 'location' || card.kind === 'parking' ? card.latitude : undefined
    const possibleLongitude =
      card.kind === 'location' || card.kind === 'parking' ? card.longitude : undefined

    const featureMatch = features.find((feature) => {
      if (feature.id === payload.id) return true
      if (possibleLocationId && feature.locationId === possibleLocationId) return true
      if (possibleName && normalize(feature.name) === normalize(possibleName)) return true
      return false
    })

    if (featureMatch) {
      requestFeatureFocus(featureMatch.id)
      if (withDirections) {
        const [latitude, longitude] = getFeatureAnchor(featureMatch)
        setRouteDestination({
          label: featureMatch.name,
          latitude,
          longitude,
          source: 'feature',
        })
      }
      setView('map')
      return
    }

    if (
      typeof possibleLatitude === 'number' &&
      Number.isFinite(possibleLatitude) &&
      typeof possibleLongitude === 'number' &&
      Number.isFinite(possibleLongitude)
    ) {
      setRouteDestination({
        label: possibleName || 'Selected destination',
        latitude: possibleLatitude,
        longitude: possibleLongitude,
        source: 'address',
      })
      setView('map')
      return
    }

    setView('map')
  }

  function handleAssistantPrimaryAction(payload: AssistantCardActionPayload) {
    if (payload.card.kind === 'resource' && payload.href) {
      window.open(payload.href, '_blank', 'noopener,noreferrer')
      return
    }

    if (payload.card.kind === 'location' || payload.card.kind === 'parking') {
      focusMapFromAction(payload, false)
      return
    }

    if (payload.card.kind === 'event' || payload.card.kind === 'registration') {
      setView('events')
      return
    }
  }

  function handleAssistantSecondaryAction(payload: AssistantCardActionPayload) {
    if (payload.card.kind === 'location' || payload.card.kind === 'parking') {
      focusMapFromAction(payload, true)
      return
    }

    if (payload.card.kind === 'event' || payload.card.kind === 'registration') {
      if (payload.href) {
        window.open(payload.href, '_blank', 'noopener,noreferrer')
        return
      }
      setView('events')
      return
    }
  }

  function handleAssistantDetailsAction(payload: AssistantCardActionPayload) {
    if (payload.href) {
      window.open(payload.href, '_blank', 'noopener,noreferrer')
      return
    }

    if (payload.card.kind === 'location' || payload.card.kind === 'parking') {
      focusMapFromAction(payload, false)
      return
    }

    setView('events')
  }

  function handleRouteToEvent(event: CampusEvent, featureId?: string) {
    const featureMatch =
      (featureId ? features.find((feature) => feature.id === featureId) : undefined) ??
      features.find((feature) => normalize(feature.name) === normalize(event.locationName)) ??
      searchFeatures(features, event.locationName)[0]

    if (featureMatch) {
      const [latitude, longitude] = getFeatureAnchor(featureMatch)
      setRouteDestination({
        label: event.locationName || featureMatch.name,
        latitude,
        longitude,
        source: 'feature',
      })
      requestFeatureFocus(featureMatch.id)
      setSidebarCollapsed(false)
    }

    setView('map')
  }

  if (view === 'auth') {
    return (
      <AuthPage onAuthenticated={handleAuthenticated} onContinueAsGuest={handleContinueAsGuest} />
    )
  }

  if (view === 'events') {
    return (
      <div className="relative">
        <EventsPage
          currentUser={session}
          onBackToMap={() => setView('map')}
          onSignOut={handleSignOut}
          onOpenAssistant={() => setView('assistant')}
          onRouteToEvent={handleRouteToEvent}
        />

        <DraggableWidget storageKey="pnw_events_widget_position" title="Navigation">
          <p className="font-semibold text-text-primary">
            {session ? `${session.firstName} ${session.lastName}` : 'Guest mode'}
          </p>

          <p className="text-xs capitalize text-text-secondary">
            {session ? `${session.role} account` : 'Browsing campus events'}
          </p>

          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setView('map')}
              className="rounded-control bg-accent-gold px-3 py-2 text-xs font-bold text-white shadow-panelSm hover:bg-[#a77814]"
            >
              Go to map
            </button>
            <button
              type="button"
              onClick={() => setView('assistant')}
              className="rounded-control border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-accent-navy shadow-panelSm hover:border-accent-navy/40"
            >
              Campus assistant
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-control border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-accent-navy shadow-panelSm hover:border-accent-navy/40"
            >
              {session ? 'Sign out' : 'Back to login'}
            </button>
          </div>
        </DraggableWidget>
      </div>
    )
  }

  if (view === 'assistant') {
    return (
      <CampusAssistantPage
        currentUser={session}
        onBackToMap={() => setView('map')}
        onBackToEvents={() => setView('events')}
        onSignOut={handleSignOut}
        onPrimaryAction={handleAssistantPrimaryAction}
        onSecondaryAction={handleAssistantSecondaryAction}
        onOpenDetails={handleAssistantDetailsAction}
      />
    )
  }

  return (
    <div className="relative">
      <AppShell />

      <DraggableWidget storageKey="pnw_map_widget_position" title="Navigation">
        <p className="font-semibold text-text-primary">
          {session ? `${session.firstName} ${session.lastName}` : 'Guest mode'}
        </p>

        <p className="text-xs capitalize text-text-secondary">
          {session ? `${session.role} account` : 'Campus map view'}
        </p>

        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setView('events')}
            className="rounded-control bg-accent-gold px-3 py-2 text-xs font-bold text-white shadow-panelSm hover:bg-[#a77814]"
          >
            View events
          </button>

          <button
            type="button"
            onClick={() => setView('assistant')}
            className="rounded-control border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-accent-navy shadow-panelSm hover:border-accent-navy/40"
          >
            Campus assistant
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-control border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-accent-navy shadow-panelSm hover:border-accent-navy/40"
          >
            {session ? 'Sign out' : 'Back to login'}
          </button>
        </div>
      </DraggableWidget>
    </div>
  )
}
