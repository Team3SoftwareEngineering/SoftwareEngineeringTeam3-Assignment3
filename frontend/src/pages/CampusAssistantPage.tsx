import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  ExternalLink,
  Map,
  MapPin,
  Navigation,
  ParkingCircle,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  WalletCards,
  Zap,
} from 'lucide-react'
import { quickPrompts, supportedIntents } from '../data/chatAssistant'
import type { DemoAccount } from '../models/auth'
import type {
  AssistantBotMessage,
  AssistantCardActionPayload,
  AssistantIntent,
  AssistantMessage,
  AssistantResponsePayload,
  AssistantResultCard,
  AssistantSuggestion,
  AssistantUserMessage,
} from '../models/chatAssistant'
import { sendCampusAssistantQuery } from '../services/chatAssistantService'

interface CampusAssistantPageProps {
  currentUser: DemoAccount | null
  onBackToMap: () => void
  onBackToEvents?: () => void
  onSignOut?: () => void
  onOpenDetails?: (value: AssistantCardActionPayload) => void
  onPrimaryAction?: (value: AssistantCardActionPayload) => void
  onSecondaryAction?: (value: AssistantCardActionPayload) => void
}

const intentLabelMap: Record<AssistantIntent, string> = {
  event_lookup: 'Events',
  location_lookup: 'Locations',
  parking_lookup: 'Parking',
  event_registration: 'Registration',
  resource_lookup: 'Resources',
  unknown: 'Unknown',
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function makeUserMessage(query: string): AssistantUserMessage {
  return {
    id: createId('user-message'),
    role: 'user',
    query,
    createdAt: new Date().toISOString(),
  }
}

function makeBotMessage(payload: AssistantResponsePayload): AssistantBotMessage {
  return {
    id: createId('bot-message'),
    role: 'assistant',
    createdAt: new Date().toISOString(),
    payload,
  }
}

function getIntentIcon(intent: AssistantIntent) {
  switch (intent) {
    case 'event_lookup':
      return CalendarDays
    case 'location_lookup':
      return MapPin
    case 'parking_lookup':
      return ParkingCircle
    case 'event_registration':
      return Users
    case 'resource_lookup':
      return Search
    default:
      return CircleHelp
  }
}

function getSupportedIntentIcon(intent: AssistantIntent) {
  switch (intent) {
    case 'event_lookup':
      return CalendarDays
    case 'parking_lookup':
      return ParkingCircle
    case 'location_lookup':
      return MapPin
    case 'event_registration':
      return Users
    case 'resource_lookup':
      return WalletCards
    default:
      return CircleHelp
  }
}

function AssistantBadge({ intent, label }: { intent: AssistantIntent; label: string }) {
  const Icon = getIntentIcon(intent)

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent-gold/25 bg-accent-gold-soft/70 px-3 py-1 text-xs font-bold tracking-wide text-[#72510a]">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

function renderCardIcon(kind: AssistantResultCard['kind']) {
  switch (kind) {
    case 'event':
      return CalendarDays
    case 'location':
      return MapPin
    case 'parking':
      return ParkingCircle
    case 'registration':
      return Users
    case 'resource':
      return WalletCards
    default:
      return CircleHelp
  }
}

function EventResultCard({
  card,
  onJoin,
  onDetails,
}: {
  card: Extract<AssistantResultCard, { kind: 'event' }>
  onJoin?: () => void
  onDetails?: () => void
}) {
  return (
    <article className="rounded-card border border-slate-300/80 bg-white p-4 shadow-panelSm">
      <div className="flex h-full flex-col">
        <div className="rounded-control border border-accent-navy/10 bg-accent-navy-soft/50 px-3 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent-navy">
          Event result
        </div>

        <h4 className="mt-3 font-heading text-xl font-bold text-text-primary">{card.title}</h4>
        {card.description ? (
          <p className="mt-2 text-sm leading-6 text-text-secondary">{card.description}</p>
        ) : null}

        <div className="mt-4 space-y-2 text-sm text-text-secondary">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-accent-navy" />
            {card.startLabel}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent-navy" />
            {card.locationLabel}
          </p>
          <p className="flex items-center gap-2">
            <WalletCards className="h-4 w-4 text-accent-navy" />
            {card.costLabel}
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onJoin}
            className="interactive-transition inline-flex flex-1 items-center justify-center gap-2 rounded-control bg-accent-gold px-4 py-2.5 text-sm font-bold text-white shadow-panelSm hover:-translate-y-0.5 hover:bg-[#a77814]"
          >
            <CheckCircle2 className="h-4 w-4" />
            {card.actionLabel ?? 'Open event hub'}
          </button>

          {card.detailsLabel ? (
            <button
              type="button"
              onClick={onDetails}
              className="interactive-transition inline-flex items-center justify-center gap-2 rounded-control border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-text-secondary shadow-panelSm hover:border-accent-navy/40 hover:text-accent-navy"
            >
              {card.detailsLabel}
              <ExternalLink className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function LocationResultCard({
  card,
  onPrimaryAction,
  onSecondaryAction,
}: {
  card: Extract<AssistantResultCard, { kind: 'location' }>
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
}) {
  return (
    <article className="rounded-card border border-slate-300/80 bg-white p-4 shadow-panelSm">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <h4 className="font-heading text-xl font-bold text-text-primary">{card.title}</h4>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{card.summary}</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
            <MapPin className="h-4 w-4 text-accent-navy" />
            {card.address}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {card.primaryActionLabel ? (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="interactive-transition inline-flex items-center justify-center gap-2 rounded-control bg-accent-gold px-4 py-2.5 text-sm font-bold text-white shadow-panelSm hover:-translate-y-0.5 hover:bg-[#a77814]"
            >
              <Map className="h-4 w-4" />
              {card.primaryActionLabel}
            </button>
          ) : null}

          {card.secondaryActionLabel ? (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="interactive-transition inline-flex items-center justify-center gap-2 rounded-control border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-text-secondary shadow-panelSm hover:border-accent-navy/40 hover:text-accent-navy"
            >
              <Navigation className="h-4 w-4" />
              {card.secondaryActionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function ParkingResultCard({
  card,
  onPrimaryAction,
  onSecondaryAction,
}: {
  card: Extract<AssistantResultCard, { kind: 'parking' }>
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
}) {
  return (
    <article className="rounded-card border border-slate-300/80 bg-white p-4 shadow-panelSm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-heading text-xl font-bold text-text-primary">{card.title}</h4>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{card.summary}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {card.availabilityLabel ? (
              <span className="rounded-full border border-slate-200 bg-surface-muted px-3 py-1 text-xs font-semibold text-text-secondary">
                {card.availabilityLabel}
              </span>
            ) : null}
            {card.walkingTimeLabel ? (
              <span className="rounded-full border border-slate-200 bg-surface-muted px-3 py-1 text-xs font-semibold text-text-secondary">
                {card.walkingTimeLabel}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex min-w-[180px] flex-col gap-2">
          {card.primaryActionLabel ? (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="interactive-transition inline-flex items-center justify-center gap-2 rounded-control bg-accent-gold px-4 py-2.5 text-sm font-bold text-white shadow-panelSm hover:-translate-y-0.5 hover:bg-[#a77814]"
            >
              <Map className="h-4 w-4" />
              {card.primaryActionLabel}
            </button>
          ) : null}

          {card.secondaryActionLabel ? (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="interactive-transition inline-flex items-center justify-center gap-2 rounded-control border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-text-secondary shadow-panelSm hover:border-accent-navy/40 hover:text-accent-navy"
            >
              <Navigation className="h-4 w-4" />
              {card.secondaryActionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function RegistrationResultCard({
  card,
  onPrimaryAction,
  onSecondaryAction,
}: {
  card: Extract<AssistantResultCard, { kind: 'registration' }>
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
}) {
  return (
    <article className="rounded-card border border-slate-300/80 bg-white p-4 shadow-panelSm">
      <h4 className="font-heading text-xl font-bold text-text-primary">{card.title}</h4>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{card.summary}</p>
      <p className="mt-4 inline-flex rounded-full border border-accent-navy/15 bg-accent-navy-soft/60 px-3 py-1 text-xs font-semibold text-accent-navy">
        {card.statusLabel}
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {card.primaryActionLabel ? (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="interactive-transition inline-flex items-center justify-center gap-2 rounded-control bg-accent-gold px-4 py-2.5 text-sm font-bold text-white shadow-panelSm hover:-translate-y-0.5 hover:bg-[#a77814]"
          >
            <CheckCircle2 className="h-4 w-4" />
            {card.primaryActionLabel}
          </button>
        ) : null}

        {card.secondaryActionLabel ? (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="interactive-transition inline-flex items-center justify-center gap-2 rounded-control border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-text-secondary shadow-panelSm hover:border-accent-navy/40 hover:text-accent-navy"
          >
            <ExternalLink className="h-4 w-4" />
            {card.secondaryActionLabel}
          </button>
        ) : null}
      </div>
    </article>
  )
}

function ResourceResultCard({
  card,
  onPrimaryAction,
}: {
  card: Extract<AssistantResultCard, { kind: 'resource' }>
  onPrimaryAction?: () => void
}) {
  return (
    <article className="rounded-card border border-slate-300/80 bg-white p-4 shadow-panelSm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-gold">
        {card.category}
      </p>
      <h4 className="mt-2 font-heading text-xl font-bold text-text-primary">{card.title}</h4>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{card.summary}</p>

      <button
        type="button"
        onClick={onPrimaryAction}
        className="interactive-transition mt-5 inline-flex items-center gap-2 rounded-control border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-accent-navy shadow-panelSm hover:-translate-y-0.5 hover:border-accent-navy/50"
      >
        {card.actionLabel}
        <ExternalLink className="h-4 w-4" />
      </button>
    </article>
  )
}

function NoticeResultCard({
  card,
}: {
  card: Extract<AssistantResultCard, { kind: 'notice' }>
}) {
  const Icon = renderCardIcon(card.kind)

  return (
    <article className="rounded-card border border-slate-300/80 bg-white p-4 shadow-panelSm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-control border border-accent-navy/15 bg-accent-navy-soft/60 text-accent-navy">
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <h4 className="font-heading text-lg font-bold text-text-primary">{card.title}</h4>
          <p className="mt-1 text-sm leading-6 text-text-secondary">{card.summary}</p>
        </div>
      </div>
    </article>
  )
}

function AssistantResultGroup({
  payload,
  onAction,
}: {
  payload: AssistantResponsePayload
  onAction?: (value: AssistantCardActionPayload) => void
}) {
  const gridClassName =
    payload.cards.some((card) => card.kind === 'event' || card.kind === 'resource')
      ? 'grid gap-4 xl:grid-cols-2'
      : 'space-y-4'

  return (
    <div className="space-y-4 rounded-card border border-slate-300/80 bg-white/80 p-4 shadow-panelSm">
      <div className="flex flex-wrap items-center gap-3">
        <AssistantBadge intent={payload.intent} label={payload.badgeLabel} />
        <p className="text-sm font-medium text-text-secondary">{payload.intro}</p>
      </div>

      <div className={gridClassName}>
        {payload.cards.map((card) => {
          switch (card.kind) {
            case 'event':
              return (
                <EventResultCard
                  key={card.id}
                  card={card}
                  onJoin={() =>
                    onAction?.({ type: payload.intent, id: card.id, action: 'primary', card })
                  }
                  onDetails={() =>
                    onAction?.({
                      type: payload.intent,
                      id: card.id,
                      href: card.detailsUrl,
                      action: 'details',
                      card,
                    })
                  }
                />
              )
            case 'location':
              return (
                <LocationResultCard
                  key={card.id}
                  card={card}
                  onPrimaryAction={() =>
                    onAction?.({ type: payload.intent, id: card.id, action: 'primary', card })
                  }
                  onSecondaryAction={() =>
                    onAction?.({ type: payload.intent, id: card.id, action: 'secondary', card })
                  }
                />
              )
            case 'parking':
              return (
                <ParkingResultCard
                  key={card.id}
                  card={card}
                  onPrimaryAction={() =>
                    onAction?.({ type: payload.intent, id: card.id, action: 'primary', card })
                  }
                  onSecondaryAction={() =>
                    onAction?.({ type: payload.intent, id: card.id, action: 'secondary', card })
                  }
                />
              )
            case 'registration':
              return (
                <RegistrationResultCard
                  key={card.id}
                  card={card}
                  onPrimaryAction={() =>
                    onAction?.({ type: payload.intent, id: card.id, action: 'primary', card })
                  }
                  onSecondaryAction={() =>
                    onAction?.({ type: payload.intent, id: card.id, action: 'secondary', card })
                  }
                />
              )
            case 'resource':
              return (
                <ResourceResultCard
                  key={card.id}
                  card={card}
                  onPrimaryAction={() =>
                    onAction?.({
                      type: payload.intent,
                      id: card.id,
                      href: card.href,
                      action: 'primary',
                      card,
                    })
                  }
                />
              )
            case 'notice':
              return <NoticeResultCard key={card.id} card={card} />
            default:
              return null
          }
        })}
      </div>
    </div>
  )
}

function SuggestionBar({
  suggestions,
  onPick,
}: {
  suggestions: AssistantSuggestion[]
  onPick: (value: string) => void
}) {
  if (!suggestions.length) return null

  return (
    <div className="rounded-control border border-accent-navy/10 bg-accent-navy-soft/40 px-4 py-3 text-sm text-text-secondary">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 font-semibold text-text-primary">
          <Sparkles className="h-4 w-4 text-accent-navy" />
          Try asking:
        </span>

        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion.id}
            type="button"
            onClick={() => onPick(suggestion.query)}
            className="font-semibold text-accent-navy hover:underline"
          >
            {suggestion.label}
            {index < suggestions.length - 1 ? ', ' : ''}
          </button>
        ))}
      </div>
    </div>
  )
}

export function CampusAssistantPage({
  currentUser,
  onBackToMap,
  onBackToEvents,
  onSignOut,
  onOpenDetails,
  onPrimaryAction,
  onSecondaryAction,
}: CampusAssistantPageProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const lastAssistantMessage = useMemo(() => {
    return [...messages]
      .reverse()
      .find((message): message is AssistantBotMessage => message.role === 'assistant')
  }, [messages])

  async function handleSend(nextQuery: string) {
    const trimmed = nextQuery.trim()
    if (!trimmed || isSubmitting) return

    setMessages((current) => [...current, makeUserMessage(trimmed)])
    setQuery('')
    setStatus(null)
    setIsSubmitting(true)

    try {
      const payload = await sendCampusAssistantQuery(trimmed, { currentUser })
      setMessages((current) => [...current, makeBotMessage(payload)])
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Assistant routing failed. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleAction(value: AssistantCardActionPayload) {
    if (value.action === 'details') {
      onOpenDetails?.(value)
      return
    }

    if (value.action === 'primary') {
      onPrimaryAction?.(value)
      return
    }

    onSecondaryAction?.(value)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg font-body text-text-primary">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-accent-navy/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-0 h-80 w-80 rounded-full bg-accent-gold/15 blur-3xl" />

      <section className="relative mx-auto w-full max-w-[1550px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 rounded-panel border border-slate-300/80 bg-white/82 p-5 shadow-panelLg panel-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
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
                {onBackToEvents ? (
                  <button
                    type="button"
                    onClick={onBackToEvents}
                    className="interactive-transition inline-flex items-center gap-2 rounded-control border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-text-secondary shadow-panelSm hover:-translate-y-0.5 hover:border-accent-navy/40 hover:text-accent-navy"
                  >
                    Back to events
                  </button>
                ) : null}
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-gold">
                PNW Student Life
              </p>
              <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                Campus Assistant
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary sm:text-base">
                Ask about events, parking, campus locations, registration, and official university
                resources.
              </p>
            </div>

            <div className="w-full max-w-[290px] rounded-card border border-slate-300 bg-white/88 p-4 shadow-panelSm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
                  Navigation
                </p>
                <span className="text-text-secondary">...</span>
              </div>

              <p className="mt-4 font-heading text-lg font-bold text-text-primary">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Guest User'}
              </p>
              <p className="text-sm capitalize text-text-secondary">
                {currentUser ? `${currentUser.role} account` : 'Assistant preview'}
              </p>

              <button
                type="button"
                onClick={onBackToMap}
                className="interactive-transition mt-4 inline-flex w-full items-center justify-center rounded-control bg-accent-gold px-4 py-2.5 text-sm font-bold text-white shadow-panelSm hover:-translate-y-0.5 hover:bg-[#a77814]"
              >
                Go to map
              </button>

              {onSignOut ? (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="mt-3 text-sm font-bold text-accent-navy hover:underline"
                >
                  Sign out
                </button>
              ) : null}
            </div>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-5 rounded-panel border border-slate-300/80 bg-white/82 p-5 shadow-panelLg panel-blur">
            <div>
              <h2 className="font-heading text-2xl font-bold text-text-primary">Ask the assistant</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                I&apos;ll route your question to the right campus tool or resource.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-text-primary">Quick prompts</p>
              <div className="mt-4 space-y-3">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => void handleSend(prompt.query)}
                    className="interactive-transition flex w-full items-center gap-3 rounded-control border border-slate-300 bg-white px-4 py-3 text-left text-sm font-semibold text-text-primary shadow-panelSm hover:-translate-y-0.5 hover:border-accent-navy/35 hover:text-accent-navy"
                  >
                    <Search className="h-4 w-4 shrink-0 text-accent-navy" />
                    <span>{prompt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-5">
              <p className="text-sm font-semibold text-text-primary">Supported intents</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {supportedIntents.map((item) => {
                  const Icon = getSupportedIntentIcon(item.intent)
                  return (
                    <span
                      key={item.intent}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-surface-muted px-3 py-2 text-sm font-medium text-text-secondary"
                    >
                      <Icon className="h-4 w-4 text-accent-navy" />
                      {item.label}
                    </span>
                  )
                })}
              </div>
            </div>

            <div className="rounded-card border border-accent-navy/10 bg-accent-navy-soft/50 p-4 text-sm text-text-secondary">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-navy" />
                <p>Answers are routed through your backend API and campus data services.</p>
              </div>
            </div>
          </aside>

          <section className="rounded-panel border border-slate-300/80 bg-white/82 p-5 shadow-panelLg panel-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-heading text-2xl font-bold text-text-primary">Conversation</h2>

              <button
                type="button"
                onClick={() => {
                  setMessages([])
                  setStatus(null)
                }}
                className="interactive-transition inline-flex items-center gap-2 rounded-control border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-text-secondary shadow-panelSm hover:-translate-y-0.5 hover:border-accent-navy/40 hover:text-accent-navy"
              >
                <RefreshCcw className="h-4 w-4" />
                Clear chat
              </button>
            </div>

            {status ? (
              <div
                className={`mt-4 rounded-card border px-4 py-3 text-sm font-semibold shadow-panelSm ${
                  status.type === 'success'
                    ? 'border-success/30 bg-green-50 text-success'
                    : 'border-danger/30 bg-red-50 text-danger'
                }`}
              >
                {status.message}
              </div>
            ) : null}

            <div className="mt-4 min-h-[520px] rounded-card border border-slate-300/80 bg-white/88 p-4 shadow-panelMd">
              {messages.length === 0 ? (
                <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-card border border-dashed border-slate-300 bg-surface-muted/60 p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-navy text-white shadow-panelSm">
                    <Bot className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 font-heading text-2xl font-bold text-text-primary">
                    Start with a campus question
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
                    Ask about events, parking, locations, registration, or official student
                    resources. The assistant tags each answer with the matched route.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {messages.map((message) =>
                    message.role === 'user' ? (
                      <div key={message.id} className="flex justify-end gap-3">
                        <div className="max-w-[min(720px,100%)] rounded-control bg-accent-navy-soft px-4 py-3 text-sm font-medium text-accent-navy shadow-panelSm">
                          {message.query}
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-text-secondary shadow-panelSm">
                          <UserRound className="h-5 w-5" />
                        </div>
                      </div>
                    ) : (
                      <div key={message.id} className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-navy text-white shadow-panelSm">
                          <Bot className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-4">
                          <AssistantResultGroup payload={message.payload} onAction={handleAction} />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            {lastAssistantMessage?.payload.suggestions?.length ? (
              <div className="mt-4">
                <SuggestionBar
                  suggestions={lastAssistantMessage.payload.suggestions}
                  onPick={(value) => void handleSend(value)}
                />
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-card border border-slate-200 bg-white px-4 py-3 shadow-panelSm">
                <p className="inline-flex items-center gap-2 text-sm font-bold text-text-primary">
                  <ShieldCheck className="h-4 w-4 text-accent-navy" />
                  Smart routing
                </p>
                <p className="mt-1 text-xs text-text-secondary">Finds the right campus tool.</p>
              </div>

              <div className="rounded-card border border-slate-200 bg-white px-4 py-3 shadow-panelSm">
                <p className="inline-flex items-center gap-2 text-sm font-bold text-text-primary">
                  <Zap className="h-4 w-4 text-accent-navy" />
                  API-driven results
                </p>
                <p className="mt-1 text-xs text-text-secondary">Returns structured cards quickly.</p>
              </div>

              <div className="rounded-card border border-slate-200 bg-white px-4 py-3 shadow-panelSm">
                <p className="inline-flex items-center gap-2 text-sm font-bold text-text-primary">
                  <ShieldCheck className="h-4 w-4 text-accent-navy" />
                  Official links
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  Routes users to trusted university resources.
                </p>
              </div>
            </div>

            <form
              className="mt-4"
              onSubmit={(event) => {
                event.preventDefault()
                void handleSend(query)
              }}
            >
              <div className="flex items-stretch gap-2 rounded-control border border-slate-300 bg-white p-2 shadow-panelSm focus-within:border-accent-navy/60 focus-within:ring-2 focus-within:ring-accent-navy/10">
                <textarea
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void handleSend(query)
                    }
                  }}
                  placeholder="Ask about events, parking, locations, or resources..."
                  rows={2}
                  className="h-14 min-w-0 flex-1 resize-none border-0 bg-transparent px-1 py-1 text-sm leading-5 outline-none placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="interactive-transition inline-flex h-14 w-12 shrink-0 items-center justify-center rounded-control bg-accent-gold text-white shadow-panelSm hover:-translate-y-0.5 hover:bg-[#a77814] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="mt-3 text-xs font-medium text-text-secondary">
              Current route coverage:{' '}
              <span className="font-bold text-text-primary">
                {supportedIntents.map((item) => intentLabelMap[item.intent]).join(' · ')}
              </span>
            </div>
          </section>
        </section>
      </section>
    </main>
  )
}
