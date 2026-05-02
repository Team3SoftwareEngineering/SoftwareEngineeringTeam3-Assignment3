import { useState } from 'react'
import { AppShell } from './AppShell'
import { AuthPage } from '../pages/AuthPage'
import { EventsPage } from '../pages/EventsPage'
import type { DemoAccount } from '../models/auth'
import { clearCurrentSession, getCurrentSession } from '../services/authService'
import { DraggableWidget } from '../components/common/DraggableWidget'

type AppView = 'auth' | 'events' | 'map'

export function App() {
  const [session, setSession] = useState<DemoAccount | null>(() => getCurrentSession())

  const [view, setView] = useState<AppView>(() => {
    return getCurrentSession() ? 'events' : 'auth'
  })

  function handleAuthenticated(account: DemoAccount) {
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

  if (view === 'auth') {
    return (
      <AuthPage
        onAuthenticated={handleAuthenticated}
        onContinueAsGuest={handleContinueAsGuest}
      />
    )
  }

  if (view === 'events') {
    return (
      <div className="relative">
        <EventsPage
          currentUser={session}
          onBackToMap={() => setView('map')}
          onSignOut={handleSignOut}
        />

        <DraggableWidget storageKey="pnw_events_widget_position" title="Navigation">
          <p className="font-semibold text-text-primary">
            {session ? `${session.firstName} ${session.lastName}` : 'Guest mode'}
          </p>

          <p className="text-xs capitalize text-text-secondary">
            {session ? `${session.role} account` : 'Browsing campus events'}
          </p>

          <button
            type="button"
            onClick={() => setView('map')}
            className="mt-3 w-full rounded-control bg-accent-gold px-3 py-2 text-xs font-bold text-white shadow-panelSm hover:bg-[#a77814]"
          >
            Go to map
          </button>
        </DraggableWidget>
      </div>
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