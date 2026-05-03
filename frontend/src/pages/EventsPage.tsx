import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Info,
  Link as LinkIcon,
  MapPin,
  Plus,
  Search,
  Ticket,
  Users,
} from 'lucide-react'
import { departmentResources } from '../data/departments'
import type { DemoAccount } from '../models/auth'
import type { CampusEvent, CreateEventPayload, EventCategory } from '../models/event'
import {
  createCampusEvent,
  getCampusEvents,
  getEventRegistrations,
  joinCampusEvent,
} from '../services/eventService'

type EventsTab = 'events' | 'departments'
type CategoryFilter = EventCategory | 'all'

interface EventsPageProps {
  currentUser: DemoAccount | null
  onBackToMap: () => void
  onSignOut: () => void
}

const categoryOptions: Array<{ value: EventCategory; label: string }> = [
  { value: 'student-life', label: 'Student Life' },
  { value: 'career', label: 'Career' },
  { value: 'academic', label: 'Academic' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'athletics', label: 'Athletics' },
  { value: 'community', label: 'Community' },
]

const initialEventForm: CreateEventPayload = {
  name: '',
  abstract: '',
  startDate: '',
  endDate: '',
  cost: 'Free',
  locationName: '',
  department: '',
  category: 'student-life',
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function getCategoryLabel(category: EventCategory) {
  return categoryOptions.find((option) => option.value === category)?.label ?? category
}

function buildRegistrationCounts(events: CampusEvent[]) {
  return events.reduce<Record<string, number>>((counts, event) => {
    counts[event.eventId] = getEventRegistrations(event.eventId).length
    return counts
  }, {})
}

export function EventsPage({ currentUser, onBackToMap, onSignOut }: EventsPageProps) {
  const [activeTab, setActiveTab] = useState<EventsTab>('events')
  const [events, setEvents] = useState<CampusEvent[]>(() => getCampusEvents())
  const [eventSearch, setEventSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [eventForm, setEventForm] = useState<CreateEventPayload>(initialEventForm)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>(() =>
    buildRegistrationCounts(getCampusEvents()),
  )

  const visibleEvents = useMemo(() => {
    const normalizedSearch = eventSearch.trim().toLowerCase()

    return events.filter((event) => {
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter

      const searchableText = [
        event.name,
        event.abstract,
        event.department,
        event.locationName,
        getCategoryLabel(event.category),
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch)

      return matchesCategory && matchesSearch
    })
  }, [events, eventSearch, categoryFilter])

  function updateEventForm<K extends keyof CreateEventPayload>(
    key: K,
    value: CreateEventPayload[K],
  ) {
    setEventForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function handleCreateEvent() {
    const result = createCampusEvent(eventForm)

    setStatus({
      type: result.ok ? 'success' : 'error',
      message: result.message,
    })

    if (!result.ok) return

    const nextEvents = getCampusEvents()
    setEvents(nextEvents)
    setRegistrationCounts(buildRegistrationCounts(nextEvents))
    setEventForm(initialEventForm)
    setShowCreateForm(false)
  }

  function handleJoinEvent(eventId: string) {
    const result = joinCampusEvent(eventId, currentUser)

    setStatus({
      type: result.ok ? 'success' : 'error',
      message: result.message,
    })

    if (result.ok) {
      setRegistrationCounts((current) => ({
        ...current,
        [eventId]: (current[eventId] ?? 0) + 1,
      }))
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg font-body text-text-primary">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-accent-navy/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-0 h-80 w-80 rounded-full bg-accent-gold/15 blur-3xl" />

      <section className="relative mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 rounded-panel border border-slate-300/80 bg-white/82 p-5 shadow-panelLg panel-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <button
                type="button"
                onClick={onBackToMap}
                className="interactive-transition mb-4 inline-flex items-center gap-2 rounded-control border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-text-secondary shadow-panelSm hover:-translate-y-0.5 hover:border-accent-navy/40 hover:text-accent-navy"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to map
              </button>

              <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-gold">
                PNW Student Life
              </p>
              <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                Campus Events & Department Hub
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary sm:text-base">
                Browse campus events in ascending date order, join an event, create a demo event,
                or use the department hub to find helpful campus resources.
              </p>
            </div>

            <div className="rounded-card border border-slate-300 bg-white/88 p-4 shadow-panelSm">
              <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
                Current session
              </p>
              <p className="mt-1 font-heading text-lg font-bold text-text-primary">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Guest User'}
              </p>
              <p className="text-sm capitalize text-text-secondary">
                {currentUser ? `${currentUser.role} account` : 'Demo browsing mode'}
              </p>
              <button
                type="button"
                onClick={onSignOut}
                className="mt-3 text-sm font-bold text-accent-navy hover:underline"
              >
                {currentUser ? 'Sign out' : 'Go to login'}
              </button>
            </div>
          </div>
        </header>

        <div className="mb-5 grid gap-3 rounded-panel border border-slate-300/80 bg-white/82 p-3 shadow-panelMd panel-blur sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`interactive-transition rounded-card px-4 py-3 text-left shadow-panelSm ${
              activeTab === 'events'
                ? 'bg-accent-navy text-white'
                : 'bg-white text-text-secondary hover:-translate-y-0.5 hover:text-accent-navy'
            }`}
          >
            <span className="inline-flex items-center gap-2 font-heading text-base font-bold">
              <CalendarDays className="h-5 w-5" />
              Campus Events
            </span>
            <span className="mt-1 block text-sm opacity-80">Browse, create, and join events.</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('departments')}
            className={`interactive-transition rounded-card px-4 py-3 text-left shadow-panelSm ${
              activeTab === 'departments'
                ? 'bg-accent-navy text-white'
                : 'bg-white text-text-secondary hover:-translate-y-0.5 hover:text-accent-navy'
            }`}
          >
            <span className="inline-flex items-center gap-2 font-heading text-base font-bold">
              <Building2 className="h-5 w-5" />
              Department Hub
            </span>
            <span className="mt-1 block text-sm opacity-80">
              Quick links for campus departments.
            </span>
          </button>
        </div>

        {status ? (
          <div
            className={`mb-5 rounded-card border px-4 py-3 text-sm font-semibold shadow-panelSm ${
              status.type === 'success'
                ? 'border-success/30 bg-green-50 text-success'
                : 'border-danger/30 bg-red-50 text-danger'
            }`}
          >
            {status.message}
          </div>
        ) : null}

        {activeTab === 'events' ? (
          <section className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="space-y-4 rounded-panel border border-slate-300/80 bg-white/82 p-4 shadow-panelLg panel-blur">
              <div>
                <h2 className="font-heading text-lg font-bold text-text-primary">Find events</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Search by event name, department, location, or category.
                </p>
              </div>

              <label htmlFor="event-search" className="block space-y-1.5">
                <span className="text-sm font-semibold text-text-primary">Search</span>
                <span className="flex items-center gap-2 rounded-control border border-slate-300 bg-white px-3 py-2.5 shadow-panelSm focus-within:border-accent-navy/60 focus-within:ring-2 focus-within:ring-accent-navy/10">
                  <Search className="h-4 w-4 text-text-secondary" />
                  <input
                    id="event-search"
                    value={eventSearch}
                    onChange={(event) => setEventSearch(event.target.value)}
                    placeholder="Search campus events"
                    className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </span>
              </label>

              <label htmlFor="category-filter" className="block space-y-1.5">
                <span className="text-sm font-semibold text-text-primary">Category</span>
                <select
                  id="category-filter"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
                  className="w-full rounded-control border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-text-primary shadow-panelSm outline-none focus:border-accent-navy/60 focus:ring-2 focus:ring-accent-navy/10"
                >
                  <option value="all">All categories</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => {
                  setShowCreateForm((current) => !current)
                  setStatus(null)
                }}
                className="interactive-transition inline-flex w-full items-center justify-center gap-2 rounded-control bg-accent-gold px-4 py-3 text-sm font-bold text-white shadow-panelSm hover:-translate-y-0.5 hover:bg-[#a77814]"
              >
                <Plus className="h-4 w-4" />
                {showCreateForm ? 'Close create form' : 'Create event'}
              </button>

              <div className="rounded-card border border-accent-navy/20 bg-accent-navy-soft/60 p-4 text-sm text-text-secondary">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-navy" />
                  <p>
                    This page uses frontend demo data for now. Later, the backend can connect this
                    to MySQL through event API endpoints.
                  </p>
                </div>
              </div>
            </aside>

            <div className="space-y-5">
              {showCreateForm ? (
                <section className="rounded-panel border border-slate-300/80 bg-white/88 p-5 shadow-panelLg panel-blur">
                  <h2 className="font-heading text-xl font-bold text-text-primary">
                    Create a demo event
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    This creates an event locally in the browser for frontend demonstration.
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label htmlFor="create-event-name" className="block space-y-1.5">
                      <span className="text-sm font-semibold text-text-primary">Event name</span>
                      <input
                        id="create-event-name"
                        value={eventForm.name}
                        onChange={(event) => updateEventForm('name', event.target.value)}
                        placeholder="Example: Club Mixer"
                        className="w-full rounded-control border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-navy/60 focus:ring-2 focus:ring-accent-navy/10"
                      />
                    </label>

                    <label htmlFor="create-event-department" className="block space-y-1.5">
                      <span className="text-sm font-semibold text-text-primary">Department</span>
                      <input
                        id="create-event-department"
                        value={eventForm.department}
                        onChange={(event) => updateEventForm('department', event.target.value)}
                        placeholder="Example: Student Life"
                        className="w-full rounded-control border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-navy/60 focus:ring-2 focus:ring-accent-navy/10"
                      />
                    </label>

                    <label htmlFor="create-event-start" className="block space-y-1.5">
                      <span className="text-sm font-semibold text-text-primary">Start date</span>
                      <input
                        id="create-event-start"
                        type="datetime-local"
                        value={eventForm.startDate}
                        onChange={(event) => updateEventForm('startDate', event.target.value)}
                        className="w-full rounded-control border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-navy/60 focus:ring-2 focus:ring-accent-navy/10"
                      />
                    </label>

                    <label htmlFor="create-event-end" className="block space-y-1.5">
                      <span className="text-sm font-semibold text-text-primary">End date</span>
                      <input
                        id="create-event-end"
                        type="datetime-local"
                        value={eventForm.endDate}
                        onChange={(event) => updateEventForm('endDate', event.target.value)}
                        className="w-full rounded-control border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-navy/60 focus:ring-2 focus:ring-accent-navy/10"
                      />
                    </label>

                    <label htmlFor="create-event-location" className="block space-y-1.5">
                      <span className="text-sm font-semibold text-text-primary">Location</span>
                      <input
                        id="create-event-location"
                        value={eventForm.locationName}
                        onChange={(event) => updateEventForm('locationName', event.target.value)}
                        placeholder="Example: Alumni Hall"
                        className="w-full rounded-control border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-navy/60 focus:ring-2 focus:ring-accent-navy/10"
                      />
                    </label>

                    <label htmlFor="create-event-cost" className="block space-y-1.5">
                      <span className="text-sm font-semibold text-text-primary">Cost</span>
                      <input
                        id="create-event-cost"
                        value={eventForm.cost}
                        onChange={(event) => updateEventForm('cost', event.target.value)}
                        placeholder="Free"
                        className="w-full rounded-control border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-navy/60 focus:ring-2 focus:ring-accent-navy/10"
                      />
                    </label>

                    <label htmlFor="create-event-category" className="block space-y-1.5 sm:col-span-2">
                      <span className="text-sm font-semibold text-text-primary">Category</span>
                      <select
                        id="create-event-category"
                        value={eventForm.category}
                        onChange={(event) =>
                          updateEventForm('category', event.target.value as EventCategory)
                        }
                        className="w-full rounded-control border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-text-primary outline-none focus:border-accent-navy/60 focus:ring-2 focus:ring-accent-navy/10"
                      >
                        {categoryOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label htmlFor="create-event-description" className="block space-y-1.5 sm:col-span-2">
                      <span className="text-sm font-semibold text-text-primary">Description</span>
                      <textarea
                        id="create-event-description"
                        value={eventForm.abstract}
                        onChange={(event) => updateEventForm('abstract', event.target.value)}
                        placeholder="Briefly describe the event."
                        rows={4}
                        className="w-full resize-none rounded-control border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-navy/60 focus:ring-2 focus:ring-accent-navy/10"
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleCreateEvent}
                      className="interactive-transition inline-flex items-center justify-center gap-2 rounded-control bg-accent-navy px-4 py-3 text-sm font-bold text-white shadow-panelSm hover:-translate-y-0.5"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Save event
                    </button>

                    <button
                      type="button"
                      onClick={() => setEventForm(initialEventForm)}
                      className="interactive-transition rounded-control border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-text-secondary shadow-panelSm hover:border-accent-navy/40 hover:text-accent-navy"
                    >
                      Clear form
                    </button>
                  </div>
                </section>
              ) : null}

              <section className="grid gap-4 xl:grid-cols-2">
                {visibleEvents.map((event) => (
                  <article
                    key={event.eventId}
                    className="rounded-panel border border-slate-300/80 bg-white/88 p-5 shadow-panelMd panel-blur"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex rounded-full border border-accent-gold/30 bg-accent-gold-soft/70 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#5d4308]">
                          {getCategoryLabel(event.category)}
                        </span>
                        <h3 className="mt-3 font-heading text-xl font-bold text-text-primary">
                          {event.name}
                        </h3>
                      </div>

                      <div className="rounded-card border border-slate-300 bg-surface-muted px-3 py-2 text-center">
                        <p className="text-lg font-bold text-accent-navy">
                          {registrationCounts[event.eventId] ?? 0}
                        </p>
                        <p className="text-xs font-semibold text-text-secondary">joined</p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-text-secondary">{event.abstract}</p>

                    <div className="mt-4 grid gap-2 text-sm text-text-secondary">
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-accent-navy" />
                        {formatEventDate(event.startDate)}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-accent-navy" />
                        {event.locationName}
                      </p>
                      <p className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-accent-navy" />
                        {event.cost}
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-accent-navy" />
                        {event.department}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => handleJoinEvent(event.eventId)}
                        className="interactive-transition inline-flex flex-1 items-center justify-center gap-2 rounded-control bg-accent-gold px-4 py-2.5 text-sm font-bold text-white shadow-panelSm hover:-translate-y-0.5 hover:bg-[#a77814]"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Join Event
                      </button>

                      {event.externalUrl ? (
                        <a
                          href={event.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="interactive-transition inline-flex items-center justify-center gap-2 rounded-control border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-text-secondary shadow-panelSm hover:border-accent-navy/40 hover:text-accent-navy"
                        >
                          Details
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </section>
            </div>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {departmentResources.map((resource) => (
              <article
                key={resource.resourceId}
                className="rounded-panel border border-slate-300/80 bg-white/88 p-5 shadow-panelMd panel-blur"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-control border border-accent-navy/20 bg-accent-navy-soft text-accent-navy">
                  <LinkIcon className="h-5 w-5" />
                </div>

                <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-accent-gold">
                  {resource.category}
                </p>
                <h3 className="mt-2 font-heading text-xl font-bold text-text-primary">
                  {resource.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  {resource.description}
                </p>

                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="interactive-transition mt-5 inline-flex items-center gap-2 rounded-control border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-accent-navy shadow-panelSm hover:-translate-y-0.5 hover:border-accent-navy/50"
                >
                  {resource.cta}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  )
}