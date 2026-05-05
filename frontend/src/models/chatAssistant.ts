export type AssistantIntent =
  | 'event_lookup'
  | 'location_lookup'
  | 'parking_lookup'
  | 'event_registration'
  | 'resource_lookup'
  | 'unknown'

export interface AssistantSuggestion {
  id: string
  label: string
  query: string
}

export interface AssistantEventCard {
  kind: 'event'
  id: string
  title: string
  description?: string
  startLabel: string
  locationLabel: string
  costLabel: string
  registrationCount?: number
  actionLabel?: string
  detailsLabel?: string
  detailsUrl?: string
  eventId?: string
  locationId?: string
  locationName?: string
}

export interface AssistantLocationCard {
  kind: 'location'
  id: string
  title: string
  summary: string
  address: string
  primaryActionLabel?: string
  secondaryActionLabel?: string
  locationId?: string
  locationName?: string
  latitude?: number
  longitude?: number
}

export interface AssistantParkingCard {
  kind: 'parking'
  id: string
  title: string
  summary: string
  availabilityLabel?: string
  walkingTimeLabel?: string
  primaryActionLabel?: string
  secondaryActionLabel?: string
  parkingId?: string
  locationId?: string
  locationName?: string
  latitude?: number
  longitude?: number
}

export interface AssistantRegistrationCard {
  kind: 'registration'
  id: string
  title: string
  summary: string
  statusLabel: string
  primaryActionLabel?: string
  secondaryActionLabel?: string
  eventId?: string
  locationId?: string
  locationName?: string
}

export interface AssistantResourceCard {
  kind: 'resource'
  id: string
  title: string
  category: string
  summary: string
  actionLabel: string
  href?: string
  resourceId?: string
}

export interface AssistantNoticeCard {
  kind: 'notice'
  id: string
  title: string
  summary: string
}

export type AssistantResultCard =
  | AssistantEventCard
  | AssistantLocationCard
  | AssistantParkingCard
  | AssistantRegistrationCard
  | AssistantResourceCard
  | AssistantNoticeCard

export interface AssistantResponsePayload {
  intent: AssistantIntent
  confidence?: 'high' | 'medium' | 'low'
  badgeLabel: string
  intro: string
  cards: AssistantResultCard[]
  suggestions?: AssistantSuggestion[]
}

export interface AssistantUserMessage {
  id: string
  role: 'user'
  query: string
  createdAt: string
}

export interface AssistantBotMessage {
  id: string
  role: 'assistant'
  createdAt: string
  payload: AssistantResponsePayload
}

export type AssistantMessage = AssistantUserMessage | AssistantBotMessage

export interface AssistantCardActionPayload {
  type: AssistantIntent
  action: 'primary' | 'secondary' | 'details'
  id: string
  href?: string
  card: AssistantResultCard
}
