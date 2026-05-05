export type EventCategory =
  | 'student-life'
  | 'career'
  | 'academic'
  | 'wellness'
  | 'athletics'
  | 'community'

export interface CampusEvent {
  eventId: string
  name: string
  abstract: string
  startDate: string
  endDate?: string
  cost: string
  locationName: string
  address?: string
  department: string
  category: EventCategory
  capacity?: number
  externalUrl?: string
  createdBy: string
  registrationCount?: number
  source?: 'backend' | 'local'
}

export interface CreateEventPayload {
  name: string
  abstract: string
  startDate: string
  endDate: string
  cost: string
  locationName: string
  department: string
  category: EventCategory
  externalUrl?: string
}

export interface EventRegistration {
  registrationId: string
  eventId: string
  accountUuid?: string
  registrantName: string
  idNumber?: string
  createdAt: string
}

export interface EventActionResult {
  ok: boolean
  message: string
  event?: CampusEvent
  registration?: EventRegistration
}

export interface DepartmentResource {
  resourceId: string
  title: string
  category: string
  description: string
  url: string
  cta: string
}
