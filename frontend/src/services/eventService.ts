import { seedCampusEvents } from '../data/events'
import type {
  CampusEvent,
  CreateEventPayload,
  EventActionResult,
  EventRegistration,
} from '../models/event'
import type { DemoAccount } from '../models/auth'

const CREATED_EVENTS_STORAGE_KEY = 'pnw_created_events'
const EVENT_REGISTRATIONS_STORAGE_KEY = 'pnw_event_registrations'

function canUseStorage() {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage)
  } catch {
    return false
  }
}

function createUuid(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getStoredCreatedEvents(): CampusEvent[] {
  if (!canUseStorage()) return []

  try {
    const rawEvents = localStorage.getItem(CREATED_EVENTS_STORAGE_KEY)
    if (!rawEvents) return []

    const parsedEvents = JSON.parse(rawEvents)
    return Array.isArray(parsedEvents) ? parsedEvents : []
  } catch {
    return []
  }
}

function saveStoredCreatedEvents(events: CampusEvent[]) {
  if (!canUseStorage()) return
  localStorage.setItem(CREATED_EVENTS_STORAGE_KEY, JSON.stringify(events))
}

function getStoredRegistrations(): EventRegistration[] {
  if (!canUseStorage()) return []

  try {
    const rawRegistrations = localStorage.getItem(EVENT_REGISTRATIONS_STORAGE_KEY)
    if (!rawRegistrations) return []

    const parsedRegistrations = JSON.parse(rawRegistrations)
    return Array.isArray(parsedRegistrations) ? parsedRegistrations : []
  } catch {
    return []
  }
}

function saveStoredRegistrations(registrations: EventRegistration[]) {
  if (!canUseStorage()) return
  localStorage.setItem(EVENT_REGISTRATIONS_STORAGE_KEY, JSON.stringify(registrations))
}

export function getCampusEvents(): CampusEvent[] {
  return [...seedCampusEvents, ...getStoredCreatedEvents()].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  )
}

export function getEventRegistrations(eventId: string): EventRegistration[] {
  return getStoredRegistrations().filter((registration) => registration.eventId === eventId)
}

export function createCampusEvent(payload: CreateEventPayload): EventActionResult {
  const name = payload.name.trim()
  const abstract = payload.abstract.trim()
  const startDate = payload.startDate.trim()
  const endDate = payload.endDate.trim()
  const cost = payload.cost.trim() || 'Free'
  const locationName = payload.locationName.trim()
  const department = payload.department.trim()

  if (!name || !abstract || !startDate || !locationName || !department) {
    return {
      ok: false,
      message: 'Event name, description, start date, location, and department are required.',
    }
  }

  const parsedStartDate = new Date(startDate)

  if (Number.isNaN(parsedStartDate.getTime())) {
    return {
      ok: false,
      message: 'Please enter a valid event start date.',
    }
  }

  const parsedEndDate = endDate ? new Date(endDate) : undefined

  if (parsedEndDate && parsedEndDate.getTime() < parsedStartDate.getTime()) {
    return {
      ok: false,
      message: 'End date cannot be earlier than start date.',
    }
  }

  const newEvent: CampusEvent = {
    eventId: createUuid('event'),
    name,
    abstract,
    startDate: parsedStartDate.toISOString(),
    endDate: parsedEndDate?.toISOString(),
    cost,
    locationName,
    department,
    category: payload.category,
    createdBy: 'Frontend demo form',
  }

  const storedEvents = getStoredCreatedEvents()
  saveStoredCreatedEvents([...storedEvents, newEvent])

  return {
    ok: true,
    message: 'Event created successfully for the frontend demo.',
    event: newEvent,
  }
}

export function joinCampusEvent(eventId: string, account: DemoAccount | null): EventActionResult {
  const events = getCampusEvents()
  const event = events.find((campusEvent) => campusEvent.eventId === eventId)

  if (!event) {
    return {
      ok: false,
      message: 'Event could not be found.',
    }
  }

  const registrations = getStoredRegistrations()

  if (account) {
    const alreadyRegistered = registrations.some(
      (registration) =>
        registration.eventId === eventId && registration.accountUuid === account.accountUuid,
    )

    if (alreadyRegistered) {
      return {
        ok: false,
        message: 'You are already registered for this event.',
      }
    }
  }

  const registration: EventRegistration = {
    registrationId: createUuid('registration'),
    eventId,
    accountUuid: account?.accountUuid,
    registrantName: account ? `${account.firstName} ${account.lastName}` : 'Guest User',
    idNumber: account?.idNumber,
    createdAt: new Date().toISOString(),
  }

  saveStoredRegistrations([...registrations, registration])

  return {
    ok: true,
    message: `Registered for ${event.name}.`,
    event,
    registration,
  }
}