import type { AssistantIntent, AssistantSuggestion } from '../models/chatAssistant'

export interface QuickPrompt {
  id: string
  label: string
  query: string
}

export interface SupportedIntentOption {
  intent: AssistantIntent
  label: string
}

export const quickPrompts: QuickPrompt[] = [
  { id: 'events-today', label: 'events today', query: 'events today' },
  { id: 'parking-near-gym', label: 'parking near gym', query: 'parking near gym' },
  {
    id: 'register-career-fair',
    label: 'register me for career fair',
    query: 'register me for career fair',
  },
  {
    id: 'student-union-location',
    label: 'where is Student Union Library Building',
    query: 'where is Student Union Library Building',
  },
  {
    id: 'financial-aid-resources',
    label: 'financial aid resources',
    query: 'financial aid resources',
  },
]

export const supportedIntents: SupportedIntentOption[] = [
  { intent: 'event_lookup', label: 'Events' },
  { intent: 'parking_lookup', label: 'Parking' },
  { intent: 'location_lookup', label: 'Locations' },
  { intent: 'event_registration', label: 'Registration' },
  { intent: 'resource_lookup', label: 'Resources' },
]

export const defaultSuggestions: AssistantSuggestion[] = [
  {
    id: 'parking-bioscience',
    label: 'parking near bioscience building',
    query: 'parking near bioscience building',
  },
  {
    id: 'register-career-fair-secondary',
    label: 'register me for career fair',
    query: 'register me for career fair',
  },
]
