import { useState } from 'react'
import { AppShell } from './AppShell'
import { AuthPage } from '../pages/AuthPage'
import type { DemoAccount } from '../models/auth'
import { clearCurrentSession, getCurrentSession } from '../services/authService'

type AppView = 'auth' | 'map'

export function App() {
  const [session, setSession] = useState<DemoAccount | null>(() => getCurrentSession())
  const [view, setView] = useState<AppView>(() => (getCurrentSession() ? 'map' : 'auth'))

  function handleAuthenticated(account: DemoAccount) {
    setSession(account)
    setView('map')
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
        onContinueAsGuest={() => setView('map')}
      />
    )
  }

  return (
    <div className="relative">
      <AppShell />

      <div className="fixed bottom-4 left-4 z-[1000] rounded-card border border-slate-300 bg-white/90 px-4 py-3 text-sm shadow-panelLg panel-blur">
        <p className="font-semibold text-text-primary">
          {session ? `${session.firstName} ${session.lastName}` : 'Guest mode'}
        </p>
        <p className="text-xs capitalize text-text-secondary">
          {session ? `${session.role} account` : 'No account session'}
        </p>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-2 text-xs font-bold text-accent-navy hover:underline"
        >
          {session ? 'Sign out' : 'Back to login'}
        </button>
      </div>
    </div>
  )
}