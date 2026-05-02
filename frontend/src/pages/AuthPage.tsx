import { useMemo, useState } from 'react'
import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react'
import {
  ArrowRight,
  BookOpenCheck,
  Eye,
  EyeOff,
  LockKeyhole,
  MapPinned,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'
import type { AccountRole, DemoAccount, SignupPayload } from '../models/auth'
import { loginUser, signupUser } from '../services/authService'

type AuthMode = 'login' | 'signup'

interface AuthPageProps {
  onAuthenticated: (account: DemoAccount) => void
  onContinueAsGuest: () => void
}
interface AuthStatus {
  type: 'success' | 'error'
  message: string
}

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  icon?: ReactNode
  hint?: string
}

const initialSignupForm: SignupPayload = {
  role: 'student',
  username: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  middleName: '',
  lastName: '',
  studentId: '',
  staffId: '',
  city: '',
  state: '',
}

function AuthField({ id, label, icon, hint, className = '', ...props }: AuthFieldProps) {
  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      <span className="flex items-center gap-2 rounded-control border border-slate-300 bg-white/90 px-3 py-2.5 shadow-panelSm focus-within:border-accent-navy/60 focus-within:ring-2 focus-within:ring-accent-navy/10">
        {icon ? <span className="text-text-secondary">{icon}</span> : null}
        <input
          id={id}
          className={`min-w-0 flex-1 border-0 bg-transparent text-sm text-text-primary outline-none placeholder:text-slate-400 ${className}`}
          {...props}
        />
      </span>
      {hint ? <span className="text-xs text-text-secondary">{hint}</span> : null}
    </label>
  )
}

export function AuthPage({ onAuthenticated, onContinueAsGuest }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<AuthStatus | null>(null)

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  })

  const [signupForm, setSignupForm] = useState<SignupPayload>(initialSignupForm)

  const passwordInputType = showPassword ? 'text' : 'password'

  const heading = useMemo(() => {
    return mode === 'login' ? 'Welcome back' : 'Create your account'
  }, [mode])

  function updateSignupField<K extends keyof SignupPayload>(key: K, value: SignupPayload[K]) {
    setSignupForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = loginUser(loginForm)
    setStatus({
      type: result.ok ? 'success' : 'error',
      message: result.message,
    })

    if (result.ok && result.account) {
      onAuthenticated(result.account)
    }
  }

  function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = signupUser(signupForm)
    setStatus({
      type: result.ok ? 'success' : 'error',
      message: result.message,
    })

    if (result.ok && result.account) {
      onAuthenticated(result.account)
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode)
    setStatus(null)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg font-body text-text-primary">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-accent-navy/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-0 h-80 w-80 rounded-full bg-accent-gold/15 blur-3xl" />

      <section className="relative mx-auto grid min-h-screen w-full max-w-[1280px] grid-cols-1 gap-8 px-5 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
        <div className="hidden lg:block">
          <div className="hero-banner overflow-hidden rounded-panel border border-white/30 p-8 text-white shadow-panelLg">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-card border border-white/25 bg-white/15 shadow-panelSm">
              <MapPinned className="h-7 w-7" />
            </div>

            <div className="mt-10 space-y-5">
              <p className="inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]">
                PNW Student Life
              </p>

              <h1 className="font-heading text-4xl font-bold leading-tight">
                Register for campus events and find your way around Hammond.
              </h1>

              <p className="max-w-xl text-base leading-7 text-white/84">
                This login and signup prototype matches the database design with accounts,
                students, staff, addresses, and event registration support.
              </p>
            </div>

            <div className="mt-10 grid gap-3">
              <div className="rounded-card border border-white/20 bg-white/12 p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-accent-gold-soft" />
                  <p className="font-semibold">Role-based access</p>
                </div>
                <p className="mt-2 text-sm text-white/78">
                  Students can register for events. Staff can later create and manage events.
                </p>
              </div>

              <div className="rounded-card border border-white/20 bg-white/12 p-4">
                <div className="flex items-center gap-3">
                  <BookOpenCheck className="h-5 w-5 text-accent-gold-soft" />
                  <p className="font-semibold">Database-aligned fields</p>
                </div>
                <p className="mt-2 text-sm text-white/78">
                  Signup collects account, name, ID, role, city, and state data.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[560px] rounded-panel border border-slate-300/80 bg-white/82 p-4 shadow-panelLg panel-blur sm:p-6">
          <div className="rounded-card border border-slate-200 bg-white p-4 shadow-panelSm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-gold">
                  Purdue University Northwest
                </p>
                <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-primary">
                  {heading}
                </h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {mode === 'login'
                    ? 'Sign in to continue to the student life campus map.'
                    : 'Create a student or staff account for the student life website.'}
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-accent-navy/20 bg-accent-navy-soft text-accent-navy">
                {mode === 'login' ? <LockKeyhole className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-control border border-slate-300 bg-surface-muted p-1">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`interactive-transition rounded-[8px] px-4 py-2 text-sm font-bold ${
                  mode === 'login'
                    ? 'bg-accent-navy text-white shadow-panelSm'
                    : 'text-text-secondary hover:bg-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`interactive-transition rounded-[8px] px-4 py-2 text-sm font-bold ${
                  mode === 'signup'
                    ? 'bg-accent-navy text-white shadow-panelSm'
                    : 'text-text-secondary hover:bg-white'
                }`}
              >
                Sign up
              </button>
            </div>

            {status ? (
              <div
                className={`mt-5 rounded-card border px-4 py-3 text-sm font-semibold ${
                  status.type === 'success'
                    ? 'border-success/30 bg-green-50 text-success'
                    : 'border-danger/30 bg-red-50 text-danger'
                }`}
              >
                {status.message}
              </div>
            ) : null}

            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
                <AuthField
                  id="login-username"
                  label="Username"
                  placeholder="student@pnw.edu"
                  value={loginForm.username}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  autoComplete="username"
                />

                <div className="space-y-1.5">
                  <AuthField
                    id="login-password"
                    label="Password"
                    placeholder="Enter your password"
                    type={passwordInputType}
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent-navy"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {showPassword ? 'Hide password' : 'Show password'}
                  </button>
                </div>

                <div className="rounded-card border border-accent-gold/30 bg-accent-gold-soft/45 px-4 py-3 text-sm text-[#5d4308]">
                  <p className="font-bold">Demo login</p>
                  <p className="mt-1">
                    Username: <span className="font-mono">student@pnw.edu</span>
                  </p>
                  <p>
                    Password: <span className="font-mono">Password123</span>
                  </p>
                </div>

                <button
                  type="submit"
                  className="interactive-transition inline-flex w-full items-center justify-center gap-2 rounded-control bg-accent-gold px-4 py-3 text-sm font-bold text-white shadow-panelSm hover:-translate-y-0.5 hover:bg-[#a77814]"
                >
                  Login and continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="mt-6 space-y-5">
                <label htmlFor="signup-role" className="block space-y-1.5">
                  <span className="text-sm font-semibold text-text-primary">Account role</span>
                  <select
                    id="signup-role"
                    value={signupForm.role}
                    onChange={(event) => updateSignupField('role', event.target.value as AccountRole)}
                    className="w-full rounded-control border border-slate-300 bg-white/90 px-3 py-2.5 text-sm font-semibold text-text-primary shadow-panelSm outline-none focus:border-accent-navy/60 focus:ring-2 focus:ring-accent-navy/10"
                  >
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                  </select>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <AuthField
                    id="signup-first-name"
                    label="First name"
                    placeholder="First name"
                    value={signupForm.firstName}
                    onChange={(event) => updateSignupField('firstName', event.target.value)}
                    autoComplete="given-name"
                  />

                  <AuthField
                    id="signup-last-name"
                    label="Last name"
                    placeholder="Last name"
                    value={signupForm.lastName}
                    onChange={(event) => updateSignupField('lastName', event.target.value)}
                    autoComplete="family-name"
                  />
                </div>

                <AuthField
                  id="signup-middle-name"
                  label="Middle name"
                  placeholder="Optional"
                  value={signupForm.middleName}
                  onChange={(event) => updateSignupField('middleName', event.target.value)}
                  autoComplete="additional-name"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  {signupForm.role === 'student' ? (
                    <AuthField
                      id="signup-student-id"
                      label="Student ID"
                      placeholder="Example: 1001"
                      value={signupForm.studentId}
                      onChange={(event) => updateSignupField('studentId', event.target.value)}
                      inputMode="numeric"
                    />
                  ) : (
                    <AuthField
                      id="signup-staff-id"
                      label="Staff ID"
                      placeholder="Example: 2001"
                      value={signupForm.staffId}
                      onChange={(event) => updateSignupField('staffId', event.target.value)}
                      inputMode="numeric"
                    />
                  )}

                  <AuthField
                    id="signup-username"
                    label="Username"
                    placeholder="name@pnw.edu"
                    value={signupForm.username}
                    onChange={(event) => updateSignupField('username', event.target.value)}
                    autoComplete="username"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <AuthField
                    id="signup-city"
                    label="City"
                    placeholder="Hammond"
                    value={signupForm.city}
                    onChange={(event) => updateSignupField('city', event.target.value)}
                    autoComplete="address-level2"
                  />

                  <AuthField
                    id="signup-state"
                    label="State"
                    placeholder="IN"
                    value={signupForm.state}
                    onChange={(event) => updateSignupField('state', event.target.value)}
                    autoComplete="address-level1"
                    maxLength={2}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <AuthField
                    id="signup-password"
                    label="Password"
                    placeholder="At least 8 characters"
                    type={passwordInputType}
                    value={signupForm.password}
                    onChange={(event) => updateSignupField('password', event.target.value)}
                    autoComplete="new-password"
                  />

                  <AuthField
                    id="signup-confirm-password"
                    label="Confirm password"
                    placeholder="Re-enter password"
                    type={passwordInputType}
                    value={signupForm.confirmPassword}
                    onChange={(event) => updateSignupField('confirmPassword', event.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent-navy"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showPassword ? 'Hide passwords' : 'Show passwords'}
                </button>

                <button
                  type="submit"
                  className="interactive-transition inline-flex w-full items-center justify-center gap-2 rounded-control bg-accent-gold px-4 py-3 text-sm font-bold text-white shadow-panelSm hover:-translate-y-0.5 hover:bg-[#a77814]"
                >
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={onContinueAsGuest}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-control border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-text-secondary shadow-panelSm hover:border-accent-navy/40 hover:text-accent-navy"
            >
              Continue to map as guest
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}