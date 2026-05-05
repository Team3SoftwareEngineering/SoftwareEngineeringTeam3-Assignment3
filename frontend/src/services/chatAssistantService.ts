import type { DemoAccount } from '../models/auth'
import type {
  AssistantEventCard,
  AssistantIntent,
  AssistantLocationCard,
  AssistantNoticeCard,
  AssistantParkingCard,
  AssistantRegistrationCard,
  AssistantResourceCard,
  AssistantResponsePayload,
  AssistantSuggestion,
} from '../models/chatAssistant'
import { defaultSuggestions } from '../data/chatAssistant'
import { hammondFeatures } from '../data/hammond/features'
import type { CampusFeature } from '../models/campus'
import type { CampusEvent } from '../models/event'
import { getCampusEvents, joinCampusEvent } from './eventService'
import { getDepartmentResources } from './resourceService'
import { apiGet, apiPost } from './apiClient'
import { getFeatureAnchor } from '../utils/map'

type AssistantConfidence = 'high' | 'medium' | 'low'
type Primitive = string | number | boolean | null | undefined

interface AssistantRouteTarget {
  method: string
  path: string
  params?: Record<string, Primitive>
  body?: Record<string, Primitive>
}

interface AssistantRouteResult {
  intent: AssistantIntent
  confidence?: AssistantConfidence
  target?: AssistantRouteTarget | null
  message?: string
  suggestions?: string[]
  parameters?: Record<string, Primitive>
  missing?: string[]
}

interface AssistantRouteResponse {
  data: AssistantRouteResult
}

interface BackendLocation {
  id: string
  name: string
  campus?: string
  address?: string
  description?: string | null
  latitude?: number
  longitude?: number
}

interface BackendParkingLot {
  id: string
  name: string
  campus?: string
  permit_type?: string
  capacity?: number
  location_id?: string
  distance_miles?: number
  latitude?: number
  longitude?: number
}

interface BackendParkingResponse {
  data: BackendParkingLot[]
  meta?: {
    availability_source?: string
  }
}

export interface SendCampusAssistantQueryOptions {
  currentUser?: DemoAccount | null
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function toIsoDate(value: string): string | null {
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return null
  return parsedDate.toISOString().slice(0, 10)
}

function asString(value: Primitive): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

const SEARCH_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'at',
  'by',
  'can',
  'for',
  'from',
  'get',
  'how',
  'i',
  'in',
  'is',
  'me',
  'near',
  'of',
  'on',
  'please',
  'show',
  'the',
  'to',
  'where',
])

const QUERY_ALIASES: Array<{ phrases: string[]; expansion: string }> = [
  {
    phrases: ['gym', 'rec center', 'recreation center', 'fitness center'],
    expansion: 'fitness recreation center wellness gym',
  },
  {
    phrases: ['sulb', 'student union library building', 'student union library'],
    expansion: 'student union commons library learning',
  },
  {
    phrases: ['career fair', 'career event', 'job fair'],
    expansion: 'career resume internship job employer prep',
  },
  {
    phrases: ['class registration', 'register for classes', 'course registration'],
    expansion: 'registrar enrollment records registration classes courses',
  },
  {
    phrases: ['financial aid', 'fafsa', 'scholarship'],
    expansion: 'financial aid tuition support fafsa scholarships grants loans',
  },
]

function canonicalSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function expandSearchText(value: string) {
  const canonical = canonicalSearchText(value)
  const expansions = QUERY_ALIASES.filter((alias) =>
    alias.phrases.some((phrase) => canonical.includes(canonicalSearchText(phrase))),
  ).map((alias) => alias.expansion)

  return [canonical, ...expansions].join(' ').trim()
}

function tokenizeSearch(value: string) {
  return expandSearchText(value)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !SEARCH_STOP_WORDS.has(token))
}

function scoreCandidate(query: string, parts: Array<string | undefined | null>) {
  const queryText = expandSearchText(query)
  if (!queryText) return 0

  const candidateText = expandSearchText(parts.filter(Boolean).join(' '))
  if (!candidateText) return 0

  const queryTokens = tokenizeSearch(query)
  const candidateTokens = new Set(tokenizeSearch(candidateText))
  let score = candidateText.includes(queryText) ? queryTokens.length + 4 : 0

  queryTokens.forEach((token) => {
    if (candidateTokens.has(token)) {
      score += 2
      return
    }

    if ([...candidateTokens].some((candidateToken) => candidateToken.startsWith(token))) {
      score += 1
    }
  })

  return score
}

function scoreFeature(query: string, feature: CampusFeature) {
  return scoreCandidate(query, [
    feature.name,
    feature.shortDescription,
    feature.address,
    feature.category,
    feature.tags.join(' '),
  ])
}

function rankFeatures(query: string, features: CampusFeature[] = hammondFeatures) {
  return features
    .map((feature) => ({
      feature,
      score: scoreFeature(query, feature),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.feature.name.localeCompare(b.feature.name))
}

function scoreEvent(query: string, event: CampusEvent) {
  return scoreCandidate(query, [
    event.name,
    event.abstract,
    event.department,
    event.category,
    event.locationName,
  ])
}

function rankEvents(query: string, events: CampusEvent[]) {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return events.map((event) => ({ event, score: 0 }))

  return events
    .map((event) => ({
      event,
      score: scoreEvent(query, event),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || eventTime(a.event) - eventTime(b.event))
}

function eventTime(event: CampusEvent) {
  const value = new Date(event.startDate).getTime()
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
}

function haversineMiles(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
) {
  const radiusMiles = 3958.8
  const toRadians = (value: number) => (value * Math.PI) / 180
  const deltaLatitude = toRadians(destination.latitude - origin.latitude)
  const deltaLongitude = toRadians(destination.longitude - origin.longitude)
  const originLatitude = toRadians(origin.latitude)
  const destinationLatitude = toRadians(destination.latitude)
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(deltaLongitude / 2) ** 2
  return radiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
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

function formatWalkingTime(distanceMiles: number | null): string | undefined {
  if (distanceMiles === null) return undefined
  const minutes = Math.max(1, Math.round((distanceMiles / 3) * 60))
  return `${minutes} min walk`
}

function toSuggestions(routeSuggestions: string[] | undefined): AssistantSuggestion[] {
  const values = routeSuggestions?.length ? routeSuggestions : defaultSuggestions.map((item) => item.query)
  return values.map((query, index) => ({
    id: `suggestion-${index}-${query}`,
    label: query,
    query,
  }))
}

function unknownPayload(
  query: string,
  options?: {
    intro?: string
    message?: string
    suggestions?: AssistantSuggestion[]
    confidence?: AssistantConfidence
  },
): AssistantResponsePayload {
  const card: AssistantNoticeCard = {
    kind: 'notice',
    id: createId('notice'),
    title: 'I could not route that request cleanly.',
    summary:
      options?.message ||
      'Try asking about events, parking, campus locations, registration, or official resources.',
  }

  return {
    intent: 'unknown',
    confidence: options?.confidence || 'low',
    badgeLabel: 'Unknown route',
    intro:
      options?.intro ||
      (query
        ? 'I could not determine the right campus tool from that message.'
        : 'Ask about events, parking, locations, registration, or resources.'),
    cards: [card],
    suggestions: options?.suggestions || toSuggestions(undefined),
  }
}

function toEventCard(event: CampusEvent): AssistantEventCard {
  return {
    kind: 'event',
    id: event.eventId,
    eventId: event.eventId,
    title: event.name,
    description: event.abstract,
    startLabel: formatEventDate(event.startDate),
    locationLabel: event.locationName,
    locationName: event.locationName,
    costLabel: event.cost,
    registrationCount: event.registrationCount,
    actionLabel: 'Open event hub',
    detailsLabel: event.externalUrl ? 'Open details' : undefined,
    detailsUrl: event.externalUrl,
  }
}

function applyEventFilters(events: CampusEvent[], route: AssistantRouteResult): CampusEvent[] {
  const params = route.target?.params || {}
  const dateValue = asString(params.date)
  const dateFrom = asString(params.date_from)
  const dateTo = asString(params.date_to)
  const searchTerm = asString(params.search)

  return events.filter((event) => {
    const eventDate = toIsoDate(event.startDate)
    if (!eventDate) return false

    if (dateValue && eventDate !== dateValue) {
      return false
    }

    if (dateFrom && eventDate < dateFrom) {
      return false
    }

    if (dateTo && eventDate > dateTo) {
      return false
    }

    if (searchTerm) {
      const searchable = [event.name, event.abstract, event.locationName, event.department]
        .join(' ')
        .toLowerCase()
      if (!searchable.includes(searchTerm.toLowerCase())) {
        return false
      }
    }

    return true
  })
}

function eventIntroFromRoute(route: AssistantRouteResult): string {
  const params = route.target?.params || {}
  if (asString(params.date)) {
    return 'Here are events for that date.'
  }
  if (asString(params.date_from) || asString(params.date_to)) {
    return 'Here are events in the requested date range.'
  }
  if (asString(params.search)) {
    return 'Here are events matching your search.'
  }
  return 'Here are matching campus events.'
}

async function buildEventLookupPayload(route: AssistantRouteResult): Promise<AssistantResponsePayload> {
  const events = applyEventFilters(await getCampusEvents(), route).slice(0, 8)

  if (!events.length) {
    return {
      intent: 'event_lookup',
      confidence: route.confidence,
      badgeLabel: 'Event lookup',
      intro: 'No events matched that request.',
      cards: [
        {
          kind: 'notice',
          id: createId('notice'),
          title: 'No events found',
          summary: 'Try a broader event name or ask for events on a different date.',
        },
      ],
      suggestions: toSuggestions(route.suggestions),
    }
  }

  return {
    intent: 'event_lookup',
    confidence: route.confidence,
    badgeLabel: 'Event lookup',
    intro: eventIntroFromRoute(route),
    cards: events.map(toEventCard),
    suggestions: toSuggestions(route.suggestions),
  }
}

async function fetchLocationsByName(name: string): Promise<BackendLocation[]> {
  const query = new URLSearchParams({ name }).toString()
  const response = await apiGet<{ data: BackendLocation[] }>(`/locations?${query}`)
  return response.data
}

function fallbackLocationCards(query: string): AssistantLocationCard[] {
  return rankFeatures(query)
    .slice(0, 6)
    .map(({ feature }) => {
      const [latitude, longitude] = getFeatureAnchor(feature)
      return {
        kind: 'location',
        id: feature.id,
        locationName: feature.name,
        title: feature.name,
        summary: feature.shortDescription,
        address: feature.address || 'Purdue Northwest Hammond Campus',
        primaryActionLabel: 'Open on map',
        secondaryActionLabel: 'Get directions',
        latitude,
        longitude,
      }
    })
}

async function buildLocationLookupPayload(route: AssistantRouteResult, query: string): Promise<AssistantResponsePayload> {
  const locationName = asString(route.target?.params?.name) || query

  let cards: AssistantLocationCard[] = []

  try {
    const locations = await fetchLocationsByName(locationName)
    cards = locations.slice(0, 6).map((location) => ({
      kind: 'location',
      id: location.id,
      locationId: location.id,
      locationName: location.name,
      title: location.name,
      summary: location.description?.trim() || 'Campus location match.',
      address: location.address || `${location.campus || 'PNW'} campus`,
      primaryActionLabel: 'Open on map',
      secondaryActionLabel: 'Get directions',
      latitude: asFiniteNumber(location.latitude) || undefined,
      longitude: asFiniteNumber(location.longitude) || undefined,
    }))
  } catch {
    cards = []
  }

  if (!cards.length) {
    cards = fallbackLocationCards(locationName)
  }

  if (!cards.length) {
    return {
      intent: 'location_lookup',
      confidence: route.confidence,
      badgeLabel: 'Location lookup',
      intro: 'No campus location matched that name.',
      cards: [
        {
          kind: 'notice',
          id: createId('notice'),
          title: 'No location found',
          summary: 'Try the exact building name or a broader keyword.',
        },
      ],
      suggestions: toSuggestions(route.suggestions),
    }
  }

  return {
    intent: 'location_lookup',
    confidence: route.confidence,
    badgeLabel: 'Location lookup',
    intro: 'I found these campus locations.',
    cards,
    suggestions: toSuggestions(route.suggestions),
  }
}

function fallbackParkingCards(query: string): AssistantParkingCard[] {
  const parkingFeatures = hammondFeatures.filter((feature) => {
    return feature.category === 'parking' || feature.tags.some((tag) => tag.toLowerCase().includes('parking'))
  })
  const destinationMatch = query
    ? rankFeatures(
        query,
        hammondFeatures.filter((feature) => !parkingFeatures.includes(feature)),
      )[0]?.feature
    : undefined

  const destinationAnchor = destinationMatch ? getFeatureAnchor(destinationMatch) : null
  const rankedParking = parkingFeatures
    .map((feature) => {
      const [latitude, longitude] = getFeatureAnchor(feature)
      const distanceMiles = destinationAnchor
        ? haversineMiles(
            { latitude: destinationAnchor[0], longitude: destinationAnchor[1] },
            { latitude, longitude },
          )
        : null

      return {
        feature,
        latitude,
        longitude,
        distanceMiles,
        score: scoreFeature(query, feature),
      }
    })
    .sort((a, b) => {
      if (a.distanceMiles !== null && b.distanceMiles !== null) {
        return a.distanceMiles - b.distanceMiles
      }
      return b.score - a.score || a.feature.name.localeCompare(b.feature.name)
    })

  const visibleParking = rankedParking.filter((item) => {
    return Boolean(destinationMatch) || !query.trim() || item.score > 0
  })

  return (visibleParking.length ? visibleParking : rankedParking)
    .slice(0, 6)
    .map(({ feature, latitude, longitude, distanceMiles }) => {
      return {
        kind: 'parking',
        id: feature.id,
        parkingId: feature.id,
        locationName: feature.name,
        title: feature.name,
        summary: feature.shortDescription,
        availabilityLabel: 'Capacity data unavailable in current schema',
        walkingTimeLabel:
          distanceMiles !== null
            ? `${distanceMiles.toFixed(2)} mi from ${destinationMatch?.name}`
            : undefined,
        primaryActionLabel: 'Open on map',
        secondaryActionLabel: 'Get directions',
        latitude,
        longitude,
      }
    })
}

async function resolveLocationByName(name: string): Promise<BackendLocation | null> {
  const locations = await fetchLocationsByName(name)
  return locations[0] || null
}

async function buildParkingLookupPayload(route: AssistantRouteResult): Promise<AssistantResponsePayload> {
  const locationName = asString(route.target?.params?.location_name)

  let endpoint = '/parking-lots'

  try {
    if (locationName) {
      const resolvedLocation = await resolveLocationByName(locationName)
      if (resolvedLocation?.id) {
        const query = new URLSearchParams({ location_id: resolvedLocation.id }).toString()
        endpoint = `/parking-lots?${query}`
      } else {
        const localCards = fallbackParkingCards(locationName)
        if (localCards.length) {
          return {
            intent: 'parking_lookup',
            confidence: route.confidence,
            badgeLabel: 'Parking lookup',
            intro: 'Here are nearby parking options from local map data.',
            cards: localCards,
            suggestions: toSuggestions(route.suggestions),
          }
        }
      }
    }

    const response = await apiGet<BackendParkingResponse>(endpoint)
    const cards: AssistantParkingCard[] = response.data.slice(0, 8).map((lot) => {
      const distanceMiles = asFiniteNumber(lot.distance_miles)
      const campusLabel = asString(lot.campus)
      const permitTypeLabel = asString(lot.permit_type)
      const capacityLabel = asFiniteNumber(lot.capacity)

      return {
        kind: 'parking',
        id: lot.id,
        parkingId: lot.id,
        locationId: asString(lot.location_id) || undefined,
        locationName: lot.name,
        title: lot.name,
        summary: campusLabel ? `${campusLabel} campus parking option.` : 'Campus parking option.',
        availabilityLabel: permitTypeLabel
          ? `Permit: ${permitTypeLabel}`
          : response.meta?.availability_source === 'not_available_in_current_schema'
            ? 'Availability is not modeled in current schema'
            : undefined,
        walkingTimeLabel:
          formatWalkingTime(distanceMiles) ||
          (capacityLabel !== null ? `Capacity: ${capacityLabel}` : undefined),
        primaryActionLabel: 'Open on map',
        secondaryActionLabel: 'Get directions',
        latitude: asFiniteNumber(lot.latitude) || undefined,
        longitude: asFiniteNumber(lot.longitude) || undefined,
      }
    })

    if (cards.length) {
      return {
        intent: 'parking_lookup',
        confidence: route.confidence,
        badgeLabel: 'Parking lookup',
        intro: 'Here are parking options that match your request.',
        cards,
        suggestions: toSuggestions(route.suggestions),
      }
    }
  } catch {
    // Fall back to local feature cards below.
  }

  const fallbackCards = fallbackParkingCards(locationName || '')
  if (!fallbackCards.length) {
    return {
      intent: 'parking_lookup',
      confidence: route.confidence,
      badgeLabel: 'Parking lookup',
      intro: 'No parking results were found.',
      cards: [
        {
          kind: 'notice',
          id: createId('notice'),
          title: 'No parking found',
          summary: 'Try asking for parking near a known building.',
        },
      ],
      suggestions: toSuggestions(route.suggestions),
    }
  }

  return {
    intent: 'parking_lookup',
    confidence: route.confidence,
    badgeLabel: 'Parking lookup',
    intro: 'Here are nearby parking options from local map data.',
    cards: fallbackCards,
    suggestions: toSuggestions(route.suggestions),
  }
}

function bestEventMatch(events: CampusEvent[], requestedName: string | null): CampusEvent | null {
  if (!events.length) return null
  if (!requestedName) return events[0]

  const normalizedRequested = normalize(requestedName)
  const genericTargets = new Set(['event', 'events', 'class', 'classes', 'thing', 'activity'])
  if (genericTargets.has(normalizedRequested)) return null

  const exactMatch = events.find((event) => normalize(event.name) === normalizedRequested)
  if (exactMatch) return exactMatch

  const partialMatch = events.find((event) => normalize(event.name).includes(normalizedRequested))
  if (partialMatch) return partialMatch

  const rankedMatch = rankEvents(requestedName, events)[0]
  return rankedMatch && rankedMatch.score >= 4 ? rankedMatch.event : null
}

function eventSuggestions(events: CampusEvent[], requestedName: string | null) {
  const rankedEvents = requestedName ? rankEvents(requestedName, events) : []
  if (rankedEvents.length) {
    return rankedEvents.map((item) => item.event).slice(0, 4)
  }

  return [...events].sort((a, b) => eventTime(a) - eventTime(b)).slice(0, 4)
}

function registrationSuggestions(events: CampusEvent[]): AssistantSuggestion[] {
  return events.slice(0, 4).map((event, index) => ({
    id: `event-suggestion-${index}-${event.eventId}`,
    label: `register for ${event.name}`,
    query: `register for ${event.name}`,
  }))
}

async function buildRegistrationPayload(
  route: AssistantRouteResult,
  currentUser: DemoAccount | null,
): Promise<AssistantResponsePayload> {
  const eventName = asString(route.parameters?.event_name)
  const events = await getCampusEvents()
  const selectedEvent = bestEventMatch(events, eventName)

  if (!selectedEvent) {
    const suggestedEvents = eventSuggestions(events, eventName)
    const noMatchCard: AssistantRegistrationCard = {
      kind: 'registration',
      id: createId('registration'),
      title: eventName ? `No event found for "${eventName}"` : 'No matching event found',
      summary: suggestedEvents.length
        ? 'Did you mean one of these events?'
        : 'I could not find an event to register for. Try a specific event name.',
      statusLabel: 'Missing event match',
      primaryActionLabel: 'Open event hub',
    }

    return {
      intent: 'event_registration',
      confidence: route.confidence,
      badgeLabel: 'Registration route',
      intro: suggestedEvents.length
        ? 'I matched your request to registration. Pick one of these likely event matches.'
        : 'I matched your request to registration, but no event was resolved yet.',
      cards: [noMatchCard, ...suggestedEvents.map(toEventCard)],
      suggestions: registrationSuggestions(suggestedEvents),
    }
  }

  if (!currentUser) {
    const signInCard: AssistantRegistrationCard = {
      kind: 'registration',
      id: selectedEvent.eventId,
      eventId: selectedEvent.eventId,
      locationName: selectedEvent.locationName,
      title: `Sign in required: ${selectedEvent.name}`,
      summary: 'You need a signed-in student account to complete registration.',
      statusLabel: 'Missing student session',
      primaryActionLabel: 'Open event hub',
      secondaryActionLabel: 'View event details',
    }

    return {
      intent: 'event_registration',
      confidence: route.confidence,
      badgeLabel: 'Registration route',
      intro: 'I found the event, but a student login is required to register.',
      cards: [signInCard],
      suggestions: toSuggestions(route.suggestions),
    }
  }

  const registrationResult = await joinCampusEvent(selectedEvent.eventId, currentUser)

  const registrationCard: AssistantRegistrationCard = {
    kind: 'registration',
    id: selectedEvent.eventId,
    eventId: selectedEvent.eventId,
    locationName: selectedEvent.locationName,
    title: selectedEvent.name,
    summary: registrationResult.message,
    statusLabel: registrationResult.ok ? 'Registration complete' : 'Registration not completed',
    primaryActionLabel: 'Open event hub',
    secondaryActionLabel: selectedEvent.externalUrl ? 'Open details' : undefined,
  }

  return {
    intent: 'event_registration',
    confidence: route.confidence,
    badgeLabel: 'Registration route',
    intro: registrationResult.ok
      ? 'Your registration request was processed.'
      : 'The registration route was matched, but the request could not be completed.',
    cards: [registrationCard],
    suggestions: toSuggestions(route.suggestions),
  }
}

async function buildResourcePayload(route: AssistantRouteResult, query: string): Promise<AssistantResponsePayload> {
  const searchTerm = asString(route.target?.params?.search) || query
  const resourceResult = await getDepartmentResources()

  const filtered = resourceResult.items
    .map((resource) => ({
      resource,
      score: scoreCandidate(searchTerm, [
        resource.title,
        resource.category,
        resource.description,
        resource.cta,
      ]),
    }))
    .filter((item) => !searchTerm.trim() || item.score > 0)
    .sort((a, b) => b.score - a.score || a.resource.title.localeCompare(b.resource.title))

  const cards: AssistantResourceCard[] = (filtered.length
    ? filtered.map((item) => item.resource)
    : resourceResult.items)
    .slice(0, 8)
    .map((resource) => ({
      kind: 'resource',
      id: resource.resourceId,
      resourceId: resource.resourceId,
      title: resource.title,
      category: resource.category,
      summary: resource.description,
      actionLabel: resource.cta || 'Open resource',
      href: resource.url,
    }))

  if (!cards.length) {
    return {
      intent: 'resource_lookup',
      confidence: route.confidence,
      badgeLabel: 'Resource lookup',
      intro: 'No matching resources were found.',
      cards: [
        {
          kind: 'notice',
          id: createId('notice'),
          title: 'No resources found',
          summary: 'Try asking with terms like advising, registrar, financial aid, or career center.',
        },
      ],
      suggestions: toSuggestions(route.suggestions),
    }
  }

  return {
    intent: 'resource_lookup',
    confidence: route.confidence,
    badgeLabel: 'Resource lookup',
    intro:
      resourceResult.source === 'backend'
        ? 'Here are official campus resources from the backend.'
        : 'Backend resources are unavailable. Showing local fallback links.',
    cards,
    suggestions: toSuggestions(route.suggestions),
  }
}

export async function sendCampusAssistantQuery(
  query: string,
  options: SendCampusAssistantQueryOptions = {},
): Promise<AssistantResponsePayload> {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) {
    return unknownPayload(query, {
      intro: 'Ask about events, parking, campus locations, registration, or resources.',
    })
  }

  let route: AssistantRouteResult

  try {
    const response = await apiPost<AssistantRouteResponse, { query: string }>('/chat/query', {
      query,
    })
    route = response.data
  } catch (error) {
    return unknownPayload(query, {
      intro: 'The assistant route service is temporarily unavailable.',
      message: error instanceof Error ? error.message : 'Chat route request failed.',
      suggestions: toSuggestions(undefined),
      confidence: 'low',
    })
  }

  try {
    switch (route.intent) {
      case 'event_lookup':
        return await buildEventLookupPayload(route)
      case 'location_lookup':
        return await buildLocationLookupPayload(route, query)
      case 'parking_lookup':
        return await buildParkingLookupPayload(route)
      case 'event_registration':
        return await buildRegistrationPayload(route, options.currentUser || null)
      case 'resource_lookup':
        return await buildResourcePayload(route, query)
      default:
        return unknownPayload(query, {
          intro: 'I could not determine the right campus tool from that message.',
          message: route.message,
          suggestions: toSuggestions(route.suggestions),
          confidence: route.confidence || 'low',
        })
    }
  } catch (error) {
    return unknownPayload(query, {
      intro: 'The assistant found a route, but the follow-up query failed.',
      message: error instanceof Error ? error.message : 'Route follow-up request failed.',
      suggestions: toSuggestions(route.suggestions),
      confidence: route.confidence || 'low',
    })
  }
}
