import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Bot,
  Building2,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Info,
  Link as LinkIcon,
  MapPin,
  Navigation,
  Plus,
  Search,
  Ticket,
  Users,
} from 'lucide-react'
import { CircleMarker, MapContainer, Polygon, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { departmentResources as staticDepartmentResources } from '../data/departments'
import { hammondCampusConfig } from '../data/hammond/campusConfig'
import { hammondFeatures } from '../data/hammond/features'
import type { DemoAccount } from '../models/auth'
import type { CampusFeature } from '../models/campus'
import type {
  CampusEvent,
  CreateEventPayload,
  DepartmentResource,
  EventCategory,
} from '../models/event'
import {
  createCampusEvent,
  getCampusEvents,
  getEventRegistrations,
  hasJoinedCampusEvent,
  joinCampusEvent,
} from '../services/eventService'
import { getDepartmentResources } from '../services/resourceService'
import { AutocompleteField } from '../components/common/AutocompleteField'
import { useMapStore } from '../state/useMapStore'
import { getCategoryColor, getFeatureAnchor, getFeatureBounds } from '../utils/map'
import { searchFeatures } from '../utils/search'
import 'leaflet/dist/leaflet.css'

type EventsTab = 'events' | 'departments'
type CategoryFilter = EventCategory | 'all'

interface EventsPageProps {
  currentUser: DemoAccount | null
  onBackToMap: () => void
  onSignOut: () => void
  onOpenAssistant: () => void
  onRouteToEvent: (event: CampusEvent, featureId?: string) => void
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
  externalUrl: '',
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
    counts[event.eventId] =
      event.source === 'local'
        ? getEventRegistrations(event.eventId).length
        : (event.registrationCount ?? 0)
    return counts
  }, {})
}

function normalizeLocationName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(building|hall|lobby|classroom|area|campus|hammond)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function findEventLocationFeature(
  event: CampusEvent,
  features: CampusFeature[],
): CampusFeature | null {
  const query = event.locationName.trim()
  if (!query || query.toLowerCase() === 'tbd') return null

  const normalizedQuery = normalizeLocationName(query)
  const exactMatch = features.find((feature) => {
    const normalizedFeatureName = normalizeLocationName(feature.name)
    return (
      normalizedFeatureName === normalizedQuery ||
      normalizedFeatureName.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedFeatureName)
    )
  })

  if (exactMatch) return exactMatch

  return searchFeatures(features, query)[0] ?? null
}

function EventPreviewFocus({ feature }: { feature: CampusFeature | null }) {
  const map = useMap()

  useEffect(() => {
    const invalidateFrame = window.requestAnimationFrame(() => map.invalidateSize())
    const invalidateTimer = window.setTimeout(() => map.invalidateSize(), 250)

    if (!feature) {
      map.setView(hammondCampusConfig.center, hammondCampusConfig.defaultZoom)
      return () => {
        window.cancelAnimationFrame(invalidateFrame)
        window.clearTimeout(invalidateTimer)
      }
    }

    if (feature.type === 'point') {
      map.setView(feature.coordinates as [number, number], 17)
    } else {
      map.fitBounds(getFeatureBounds(feature), {
        padding: [28, 28],
        maxZoom: 18,
      })
    }

    return () => {
      window.cancelAnimationFrame(invalidateFrame)
      window.clearTimeout(invalidateTimer)
    }
  }, [feature, map])

  return null
}

function EventLocationPreviewMap({ feature }: { feature: CampusFeature | null }) {
  const center = feature ? getFeatureAnchor(feature) : hammondCampusConfig.center
  const color = feature ? getCategoryColor(feature.category) : '#123a67'

  return (
    <div className="relative h-[320px] overflow-hidden rounded-card border border-slate-300 bg-surface-muted shadow-panelSm">
      <MapContainer
        center={center}
        zoom={feature ? 17 : hammondCampusConfig.defaultZoom}
        scrollWheelZoom={false}
        zoomControl
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {feature?.type === 'point' ? (
          <CircleMarker
            center={feature.coordinates as [number, number]}
            radius={11}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.88,
              weight: 3,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -10]}>
              {feature.name}
            </Tooltip>
          </CircleMarker>
        ) : null}
        {feature?.type === 'polygon' ? (
          <Polygon
            positions={feature.coordinates as [number, number][]}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.38,
              weight: 3,
            }}
          >
            <Tooltip permanent direction="center">
              {feature.name}
            </Tooltip>
          </Polygon>
        ) : null}
        <EventPreviewFocus feature={feature} />
      </MapContainer>

      {!feature ? (
        <div className="absolute inset-x-4 bottom-4 rounded-control border border-slate-300 bg-white/92 px-3 py-2 text-xs font-semibold text-text-secondary shadow-panelSm panel-blur">
          No precise campus map match was found for this location yet.
        </div>
      ) : null}
    </div>
  )
}

function EventDetailView({
  event,
  isJoined,
  registrationCount,
  locationFeature,
  onBack,
  onJoin,
  onRouteToEvent,
}: {
  event: CampusEvent
  isJoined: boolean
  registrationCount: number
  locationFeature: CampusFeature | null
  onBack: () => void
  onJoin: (eventId: string) => void
  onRouteToEvent: (event: CampusEvent, featureId?: string) => void
}) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const isLongDescription = event.abstract.length > 340
  const visibleDescription =
    isLongDescription && !isDescriptionExpanded
      ? `${event.abstract.slice(0, 340).trim()}...`
      : event.abstract

  return (
    <section className="rounded-panel border border-slate-300/80 bg-white/88 p-5 shadow-panelLg panel-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="interactive-transition inline-flex items-center gap-2 rounded-control border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-text-secondary shadow-panelSm hover:-translate-y-0.5 hover:border-accent-navy/40 hover:text-accent-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all events
          </button>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-accent-gold">
            {getCategoryLabel(event.category)}
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-primary">
            {event.name}
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Hosted by {event.department}
          </p>
        </div>

        <div className="rounded-card border border-accent-navy/20 bg-accent-navy-soft/70 px-4 py-3 text-center shadow-panelSm">
          <p className="font-heading text-3xl font-bold text-accent-navy">{registrationCount}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">signed up</p>
          {event.capacity ? (
            <p className="mt-1 text-xs text-text-secondary">Capacity: {event.capacity}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <div className="rounded-card border border-slate-300 bg-white p-4 shadow-panelSm">
            <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
              Event Description
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text-secondary">
              {visibleDescription}
            </p>
            {isLongDescription ? (
              <button
                type="button"
                onClick={() => setIsDescriptionExpanded((current) => !current)}
                className="interactive-transition mt-3 inline-flex items-center gap-1 rounded-control border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-accent-navy shadow-panelSm hover:-translate-y-0.5 hover:border-accent-navy/40"
              >
                {isDescriptionExpanded ? 'Show less' : 'Show full description'}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    isDescriptionExpanded ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-card border border-slate-300 bg-white p-4 shadow-panelSm">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-text-secondary">
                <CalendarDays className="h-4 w-4 text-accent-navy" />
                Starts
              </p>
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {formatEventDate(event.startDate)}
              </p>
            </div>

            <div className="rounded-card border border-slate-300 bg-white p-4 shadow-panelSm">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-text-secondary">
                <CalendarDays className="h-4 w-4 text-accent-navy" />
                Ends
              </p>
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {event.endDate ? formatEventDate(event.endDate) : 'No end time listed'}
              </p>
            </div>

            <div className="rounded-card border border-slate-300 bg-white p-4 shadow-panelSm">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-text-secondary">
                <MapPin className="h-4 w-4 text-accent-navy" />
                Location
              </p>
              <p className="mt-2 text-sm font-semibold text-text-primary">{event.locationName}</p>
              {event.address ? (
                <p className="mt-1 text-xs leading-5 text-text-secondary">{event.address}</p>
              ) : null}
              {locationFeature ? (
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Matched map feature: {locationFeature.name}
                </p>
              ) : null}
            </div>

            <div className="rounded-card border border-slate-300 bg-white p-4 shadow-panelSm">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-text-secondary">
                <Ticket className="h-4 w-4 text-accent-navy" />
                Cost
              </p>
              <p className="mt-2 text-sm font-semibold text-text-primary">{event.cost}</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                Created by {event.createdBy}
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-card border border-slate-300 bg-white p-4 shadow-panelSm">
            <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
              Location Map
            </p>
            <div className="mt-3">
              <EventLocationPreviewMap feature={locationFeature} />
            </div>
            <button
              type="button"
              onClick={() => onRouteToEvent(event, locationFeature?.id)}
              disabled={!locationFeature}
              className="interactive-transition mt-4 inline-flex w-full items-center justify-center gap-2 rounded-control bg-accent-gold px-4 py-3 text-sm font-bold text-white shadow-panelSm hover:-translate-y-0.5 hover:bg-[#a77814] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-text-secondary disabled:hover:translate-y-0"
            >
              <Navigation className="h-4 w-4" />
              Directions to this event
            </button>
            {!locationFeature ? (
              <p className="mt-2 text-xs leading-5 text-text-secondary">
                Add this event location as a mapped campus feature before directions can be prefilled.
              </p>
            ) : null}
          </div>

          <div className="rounded-card border border-slate-300 bg-white p-4 shadow-panelSm">
            <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
              Event Actions
            </p>
            <button
              type="button"
              onClick={() => onJoin(event.eventId)}
              disabled={isJoined}
              className="interactive-transition mt-3 inline-flex w-full items-center justify-center gap-2 rounded-control bg-accent-navy px-4 py-3 text-sm font-bold text-white shadow-panelSm hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-text-secondary disabled:hover:translate-y-0"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isJoined ? 'Already joined' : 'Join Event'}
            </button>
            {event.externalUrl ? (
              <a
                href={event.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="interactive-transition mt-2 inline-flex w-full items-center justify-center gap-2 rounded-control border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-accent-navy shadow-panelSm hover:-translate-y-0.5 hover:border-accent-navy/40"
              >
                Event details
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  )
}

export function EventsPage({
  currentUser,
  onBackToMap,
  onSignOut,
  onOpenAssistant,
  onRouteToEvent,
}: EventsPageProps) {
  const mapFeatures = useMapStore((state) => state.features)
  const [activeTab, setActiveTab] = useState<EventsTab>('events')
  const [events, setEvents] = useState<CampusEvent[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [eventSearch, setEventSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [eventForm, setEventForm] = useState<CreateEventPayload>(initialEventForm)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({})
  const [departmentResources, setDepartmentResources] = useState<DepartmentResource[]>(
    staticDepartmentResources,
  )
  const [departmentResourceSource, setDepartmentResourceSource] = useState<'backend' | 'local'>(
    'local',
  )

  useEffect(() => {
    let isMounted = true

    async function loadEvents() {
      setIsLoadingEvents(true)
      try {
        const [nextEvents, resourceResult] = await Promise.all([
          getCampusEvents(),
          getDepartmentResources(),
        ])
        if (!isMounted) return
        setEvents(nextEvents)
        setRegistrationCounts(buildRegistrationCounts(nextEvents))
        setDepartmentResources(resourceResult.items)
        setDepartmentResourceSource(resourceResult.source)
      } catch (error) {
        if (!isMounted) return
        setStatus({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to load events from the backend.',
        })
      } finally {
        if (isMounted) {
          setIsLoadingEvents(false)
        }
      }
    }

    loadEvents()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (selectedEventId && events.length && !events.some((event) => event.eventId === selectedEventId)) {
      setSelectedEventId(null)
    }
  }, [events, selectedEventId])

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

  const selectedEvent = useMemo(() => {
    return events.find((event) => event.eventId === selectedEventId) ?? null
  }, [events, selectedEventId])

  const selectedEventLocationFeature = useMemo(() => {
    if (!selectedEvent) return null

    const features = mapFeatures.length ? mapFeatures : hammondFeatures
    return findEventLocationFeature(selectedEvent, features)
  }, [mapFeatures, selectedEvent])

  const joinedEventIds = useMemo(() => {
    return new Set(
      events
        .filter((event) => hasJoinedCampusEvent(event.eventId, currentUser))
        .map((event) => event.eventId),
    )
  }, [currentUser, events, registrationCounts])

  const departmentSuggestions = useMemo(() => {
    const suggestions = new Set<string>()

    events.forEach((event) => {
      const value = event.department?.trim()
      if (value) suggestions.add(value)
    })

    departmentResources.forEach((resource) => {
      const titleValue = resource.title?.trim()
      const categoryValue = resource.category?.trim()
      if (titleValue) suggestions.add(titleValue)
      if (categoryValue) suggestions.add(categoryValue)
    })

    return [...suggestions].sort((a, b) => a.localeCompare(b))
  }, [departmentResources, events])

  const locationSuggestions = useMemo(() => {
    const suggestions = new Set<string>()

    events.forEach((event) => {
      const value = event.locationName?.trim()
      if (value) suggestions.add(value)
    })

    hammondFeatures.forEach((feature) => {
      const value = feature.name?.trim()
      if (value) suggestions.add(value)
    })

    return [...suggestions].sort((a, b) => a.localeCompare(b))
  }, [events])

  function updateEventForm<K extends keyof CreateEventPayload>(
    key: K,
    value: CreateEventPayload[K],
  ) {
    setEventForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function openEventDetails(eventId: string) {
    setSelectedEventId(eventId)
    setShowCreateForm(false)
    setStatus(null)
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  async function refreshEvents() {
    const nextEvents = await getCampusEvents()
    setEvents(nextEvents)
    setRegistrationCounts(buildRegistrationCounts(nextEvents))
  }

  async function handleCreateEvent() {
    const result = createCampusEvent(eventForm)

    setStatus({
      type: result.ok ? 'success' : 'error',
      message: result.message,
    })

    if (!result.ok) return

    try {
      await refreshEvents()
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Failed to refresh events after creating one.',
      })
      return
    }

    setEventForm(initialEventForm)
    setShowCreateForm(false)
  }

  async function handleJoinEvent(eventId: string) {
    if (joinedEventIds.has(eventId)) {
      setStatus({
        type: 'error',
        message: 'You are already registered for this event.',
      })
      return
    }

    const result = await joinCampusEvent(eventId, currentUser)

    setStatus({
      type: result.ok ? 'success' : 'error',
      message: result.message,
    })

    if (result.ok) {
      try {
        await refreshEvents()
      } catch (error) {
        setStatus({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to refresh events after registration.',
        })
      }
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
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onBackToMap}
                  className="interactive-transition inline-flex items-center gap-2 rounded-control border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-text-secondary shadow-panelSm hover:-translate-y-0.5 hover:border-accent-navy/40 hover:text-accent-navy"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to map
                </button>
                <button
                  type="button"
                  onClick={onOpenAssistant}
                  className="interactive-transition inline-flex items-center gap-2 rounded-control border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-text-secondary shadow-panelSm hover:-translate-y-0.5 hover:border-accent-navy/40 hover:text-accent-navy"
                >
                  <Bot className="h-4 w-4" />
                  Campus assistant
                </button>
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-gold">
                PNW Student Life
              </p>
              <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                Campus Events & Department Hub
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary sm:text-base">
                Browse campus events in ascending date order, join an event,
                create events, or use the department hub to find helpful
                campus resources.
              </p>
            </div>

            <div className="rounded-card border border-slate-300 bg-white/88 p-4 shadow-panelSm">
              <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
                Current session
              </p>
              <p className="mt-1 font-heading text-lg font-bold text-text-primary">
                {currentUser
                  ? `${currentUser.firstName} ${currentUser.lastName}`
                  : "Guest User"}
              </p>
              <p className="text-sm capitalize text-text-secondary">
                {currentUser
                  ? `${currentUser.role} account`
                  : "Guest browsing mode"}
              </p>
              <button
                type="button"
                onClick={onSignOut}
                className="mt-3 text-sm font-bold text-accent-navy hover:underline"
              >
                {currentUser ? "Sign out" : "Go to login"}
              </button>
            </div>
          </div>
        </header>

        <div className="mb-5 grid gap-3 rounded-panel border border-slate-300/80 bg-white/82 p-3 shadow-panelMd panel-blur sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`interactive-transition rounded-card px-4 py-3 text-left shadow-panelSm ${
              activeTab === "events"
                ? "bg-accent-navy text-white"
                : "bg-white text-text-secondary hover:-translate-y-0.5 hover:text-accent-navy"
            }`}
          >
            <span className="inline-flex items-center gap-2 font-heading text-base font-bold">
              <CalendarDays className="h-5 w-5" />
              Campus Events
            </span>
            <span className="mt-1 block text-sm opacity-80">
              Browse, create, and join events.
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedEventId(null)
              setActiveTab("departments")
            }}
            className={`interactive-transition rounded-card px-4 py-3 text-left shadow-panelSm ${
              activeTab === "departments"
                ? "bg-accent-navy text-white"
                : "bg-white text-text-secondary hover:-translate-y-0.5 hover:text-accent-navy"
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
              status.type === "success"
                ? "border-success/30 bg-green-50 text-success"
                : "border-danger/30 bg-red-50 text-danger"
            }`}
          >
            {status.message}
          </div>
        ) : null}

        {activeTab === "events" ? (
          selectedEvent ? (
            <EventDetailView
              event={selectedEvent}
              isJoined={joinedEventIds.has(selectedEvent.eventId)}
              registrationCount={registrationCounts[selectedEvent.eventId] ?? 0}
              locationFeature={selectedEventLocationFeature}
              onBack={() => setSelectedEventId(null)}
              onJoin={(eventId) => void handleJoinEvent(eventId)}
              onRouteToEvent={onRouteToEvent}
            />
          ) : (
          <section className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="space-y-4 rounded-panel border border-slate-300/80 bg-white/82 p-4 shadow-panelLg panel-blur">
              <div>
                <h2 className="font-heading text-lg font-bold text-text-primary">
                  Find events
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Search by event name, department, location, or category.
                </p>
              </div>

              <label htmlFor="event-search" className="block space-y-1.5">
                <span className="text-sm font-semibold text-text-primary">
                  Search
                </span>
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
                <span className="text-sm font-semibold text-text-primary">
                  Category
                </span>
                <select
                  id="category-filter"
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(event.target.value as CategoryFilter)
                  }
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
                  setShowCreateForm((current) => !current);
                  setStatus(null);
                }}
                className="interactive-transition inline-flex w-full items-center justify-center gap-2 rounded-control bg-accent-gold px-4 py-3 text-sm font-bold text-white shadow-panelSm hover:-translate-y-0.5 hover:bg-[#a77814]"
              >
                <Plus className="h-4 w-4" />
                {showCreateForm ? "Close create form" : "Create event"}
              </button>

              <div className="rounded-card border border-accent-navy/20 bg-accent-navy-soft/60 p-4 text-sm text-text-secondary">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-navy" />
                  <p>
                    Events and registrations are loaded from the backend API and
                    database.
                  </p>
                </div>
              </div>
            </aside>

            <div className="space-y-5">
              {isLoadingEvents ? (
                <section className="rounded-panel border border-slate-300/80 bg-white/88 p-5 shadow-panelLg panel-blur">
                  <p className="text-sm font-semibold text-text-secondary">
                    Loading events...
                  </p>
                </section>
              ) : null}

              {showCreateForm ? (
                <section className="rounded-panel border border-slate-300/80 bg-white/88 p-5 shadow-panelLg panel-blur">
                  <h2 className="font-heading text-xl font-bold text-text-primary">
                    Create an event
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    This creates an event for others to view and join.
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label
                      htmlFor="create-event-name"
                      className="block space-y-1.5"
                    >
                      <span className="text-sm font-semibold text-text-primary">
                        Event name
                      </span>
                      <input
                        id="create-event-name"
                        value={eventForm.name}
                        onChange={(event) =>
                          updateEventForm("name", event.target.value)
                        }
                        placeholder="Example: CompSci Club Callout"
                        className="w-full rounded-control border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-navy/60 focus:ring-2 focus:ring-accent-navy/10"
                      />
                    </label>

                    <AutocompleteField
                      id="create-event-department"
                      label="Department"
                      value={eventForm.department}
                      onChange={(value) => updateEventForm("department", value)}
                      options={departmentSuggestions}
                      placeholder="Example: Student Life"
                    />

                    <label
                      htmlFor="create-event-start"
                      className="block space-y-1.5"
                    >
                      <span className="text-sm font-semibold text-text-primary">
                        Start date
                      </span>
                      <input
                        id="create-event-start"
                        type="datetime-local"
                        value={eventForm.startDate}
                        onChange={(event) =>
                          updateEventForm("startDate", event.target.value)
                        }
                        className="w-full rounded-control border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-navy/60 focus:ring-2 focus:ring-accent-navy/10"
                      />
                    </label>

                    <label
                      htmlFor="create-event-end"
                      className="block space-y-1.5"
                    >
                      <span className="text-sm font-semibold text-text-primary">
                        End date
                      </span>
                      <input
                        id="create-event-end"
                        type="datetime-local"
                        value={eventForm.endDate}
                        onChange={(event) =>
                          updateEventForm("endDate", event.target.value)
                        }
                        className="w-full rounded-control border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-navy/60 focus:ring-2 focus:ring-accent-navy/10"
                      />
                    </label>

                    <AutocompleteField
                      id="create-event-location"
                      label="Location"
                      value={eventForm.locationName}
                      onChange={(value) =>
                        updateEventForm("locationName", value)
                      }
                      options={locationSuggestions}
                      placeholder="Example: Alumni Hall"
                    />

                    <label
                      htmlFor="create-event-cost"
                      className="block space-y-1.5"
                    >
                      <span className="text-sm font-semibold text-text-primary">
                        Cost
                      </span>
                      <input
                        id="create-event-cost"
                        value={eventForm.cost}
                        onChange={(event) =>
                          updateEventForm("cost", event.target.value)
                        }
                        placeholder="Free"
                        className="w-full rounded-control border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-navy/60 focus:ring-2 focus:ring-accent-navy/10"
                      />
                    </label>

                    <label
                      htmlFor="create-event-category"
                      className="block space-y-1.5 sm:col-span-2"
                    >
                      <span className="text-sm font-semibold text-text-primary">
                        Category
                      </span>
                      <select
                        id="create-event-category"
                        value={eventForm.category}
                        onChange={(event) =>
                          updateEventForm(
                            "category",
                            event.target.value as EventCategory,
                          )
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
                    <label
                      htmlFor="create-event-external-link"
                      className="block space-y-1.5 sm:col-span-2"
                    >
                      <span className="text-sm font-semibold text-text-primary">
                        External link
                      </span>
                      <input
                        id="create-event-external-link"
                        type="url"
                        value={eventForm.externalUrl ?? ""}
                        onChange={(event) =>
                          updateEventForm("externalUrl", event.target.value)
                        }
                        placeholder="https://example.com/event-details"
                        className="w-full rounded-control border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-navy/60 focus:ring-2 focus:ring-accent-navy/10"
                      />
                      <p className="text-xs text-text-secondary">
                        Optional. Add a webpage, registration page, or map link.
                      </p>
                    </label>
                    <label
                      htmlFor="create-event-description"
                      className="block space-y-1.5 sm:col-span-2"
                    >
                      <span className="text-sm font-semibold text-text-primary">
                        Description
                      </span>
                      <textarea
                        id="create-event-description"
                        value={eventForm.abstract}
                        onChange={(event) =>
                          updateEventForm("abstract", event.target.value)
                        }
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
                        <button
                          type="button"
                          onClick={() => openEventDetails(event.eventId)}
                          className="interactive-transition mt-3 inline-flex rounded-full border border-accent-navy/20 bg-accent-navy-soft/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-navy hover:-translate-y-0.5 hover:border-accent-navy/40"
                        >
                          Open event details
                        </button>
                      </div>

                      <div className="rounded-card border border-slate-300 bg-surface-muted px-3 py-2 text-center">
                        <p className="text-lg font-bold text-accent-navy">
                          {registrationCounts[event.eventId] ?? 0}
                        </p>
                        <p className="text-xs font-semibold text-text-secondary">
                          joined
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-text-secondary">
                      {event.abstract}
                    </p>

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
                        disabled={joinedEventIds.has(event.eventId)}
                        className="interactive-transition inline-flex flex-1 items-center justify-center gap-2 rounded-control bg-accent-gold px-4 py-2.5 text-sm font-bold text-white shadow-panelSm hover:-translate-y-0.5 hover:bg-[#a77814] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-text-secondary disabled:hover:translate-y-0"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {joinedEventIds.has(event.eventId) ? 'Already joined' : 'Join Event'}
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
          )
        ) : (
          <section className="space-y-4">
            <div className="rounded-card border border-slate-300/80 bg-white/88 px-4 py-3 text-sm text-text-secondary shadow-panelSm">
              Resource source:{" "}
              <span className="font-semibold text-text-primary">
                {departmentResourceSource === "backend"
                  ? "Backend API + MySQL"
                  : "PNW redirections"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
