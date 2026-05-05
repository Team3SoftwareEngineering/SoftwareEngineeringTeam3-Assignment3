import type {
  CampusEvent,
  CreateEventPayload,
  EventActionResult,
  EventCategory,
  EventRegistration,
} from "../models/event";
import type { DemoAccount } from "../models/auth";
import { seedCampusEvents } from "../data/events";
import { apiGet, apiPost } from "./apiClient";

const CREATED_EVENTS_STORAGE_KEY = "pnw_created_events";
const EVENT_REGISTRATIONS_STORAGE_KEY = "pnw_event_registrations";
const GUEST_REGISTRANT_STORAGE_KEY = "pnw_guest_registrant_key";

interface BackendEventLocation {
  id: string;
  name: string;
  campus?: string;
  address?: string;
}

interface BackendEvent {
  id: string;
  title: string;
  description?: string | null;
  starts_at: string;
  ends_at?: string | null;
  cost?: number | null;
  location?: BackendEventLocation | null;
  registration_count?: number;
}

interface BackendRegistration {
  id: string;
  event_id: string;
  student_id: number;
  registered_at: string;
}

function canUseStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function createUuid(prefix: string) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getStoredCreatedEvents(): CampusEvent[] {
  if (!canUseStorage()) return [];

  try {
    const rawEvents = localStorage.getItem(CREATED_EVENTS_STORAGE_KEY);
    if (!rawEvents) return [];

    const parsedEvents = JSON.parse(rawEvents) as unknown;
    return Array.isArray(parsedEvents) ? (parsedEvents as CampusEvent[]) : [];
  } catch {
    return [];
  }
}

function saveStoredCreatedEvents(events: CampusEvent[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(CREATED_EVENTS_STORAGE_KEY, JSON.stringify(events));
}

function getStoredRegistrations(): EventRegistration[] {
  if (!canUseStorage()) return [];

  try {
    const rawRegistrations = localStorage.getItem(
      EVENT_REGISTRATIONS_STORAGE_KEY,
    );
    if (!rawRegistrations) return [];

    const parsedRegistrations = JSON.parse(rawRegistrations) as unknown;
    return Array.isArray(parsedRegistrations)
      ? (parsedRegistrations as EventRegistration[])
      : [];
  } catch {
    return [];
  }
}

function saveStoredRegistrations(registrations: EventRegistration[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(
    EVENT_REGISTRATIONS_STORAGE_KEY,
    JSON.stringify(registrations),
  );
}

function getGuestRegistrantKey() {
  if (!canUseStorage()) return "guest-session";

  const existingKey = localStorage.getItem(GUEST_REGISTRANT_STORAGE_KEY);
  if (existingKey) return existingKey;

  const nextKey = createUuid("guest");
  localStorage.setItem(GUEST_REGISTRANT_STORAGE_KEY, nextKey);
  return nextKey;
}

function registrationBelongsToUser(
  registration: EventRegistration,
  account: DemoAccount | null,
) {
  if (account) {
    return (
      registration.accountUuid === account.accountUuid ||
      registration.idNumber === account.idNumber
    );
  }

  const guestKey = getGuestRegistrantKey();
  return (
    registration.accountUuid === guestKey ||
    (!registration.accountUuid && registration.registrantName === "Guest User")
  );
}

export function hasJoinedCampusEvent(
  eventId: string,
  account: DemoAccount | null,
): boolean {
  return getStoredRegistrations().some(
    (registration) =>
      registration.eventId === eventId &&
      registrationBelongsToUser(registration, account),
  );
}

function saveRegistrationIfMissing(
  registration: EventRegistration,
  account: DemoAccount | null,
) {
  const registrations = getStoredRegistrations();
  const alreadyStored = registrations.some(
    (storedRegistration) =>
      storedRegistration.registrationId === registration.registrationId ||
      (storedRegistration.eventId === registration.eventId &&
        registrationBelongsToUser(storedRegistration, account)),
  );

  if (alreadyStored) return;
  saveStoredRegistrations([...registrations, registration]);
}

function formatCost(cost: number | null | undefined): string {
  if (typeof cost !== "number" || Number.isNaN(cost) || cost === 0) {
    return "Free";
  }
  return `$${cost.toFixed(2)}`;
}

function inferCategory(title: string, description: string): EventCategory {
  const text = `${title} ${description}`.toLowerCase();
  if (
    text.includes("career") ||
    text.includes("resume") ||
    text.includes("intern")
  )
    return "career";
  if (text.includes("wellness") || text.includes("health")) return "wellness";
  if (text.includes("athletic") || text.includes("sport")) return "athletics";
  if (text.includes("community") || text.includes("volunteer"))
    return "community";
  if (
    text.includes("study") ||
    text.includes("academic") ||
    text.includes("workshop")
  )
    return "academic";
  return "student-life";
}

function toCampusEvent(event: BackendEvent): CampusEvent {
  const description = event.description ?? "";
  const category = inferCategory(event.title, description);

  return {
    eventId: event.id,
    name: event.title,
    abstract: description || "No description available yet.",
    startDate: event.starts_at,
    endDate: event.ends_at ?? undefined,
    cost: formatCost(event.cost),
    locationName: event.location?.name ?? "TBD",
    address: event.location?.address,
    department: "Student Life",
    category,
    createdBy: "PNW Staff",
    registrationCount: event.registration_count ?? 0,
    source: "backend",
  };
}

function sortByStartDate(events: CampusEvent[]): CampusEvent[] {
  return [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );
}

function isLocalEvent(eventId: string): boolean {
  return (
    getStoredCreatedEvents().some((event) => event.eventId === eventId) ||
    seedCampusEvents.some((event) => event.eventId === eventId)
  );
}

function getFallbackEvents(): CampusEvent[] {
  return seedCampusEvents.map((event) => ({
    ...event,
    source: "local",
  }));
}

export async function getCampusEvents(): Promise<CampusEvent[]> {
  const createdEvents = getStoredCreatedEvents();

  try {
    const response = await apiGet<{ data: BackendEvent[] }>("/events");
    const backendEvents = response.data.map(toCampusEvent);
    return sortByStartDate([...backendEvents, ...createdEvents]);
  } catch {
    return sortByStartDate([...getFallbackEvents(), ...createdEvents]);
  }
}

export function getEventRegistrations(eventId: string): EventRegistration[] {
  return getStoredRegistrations().filter(
    (registration) => registration.eventId === eventId,
  );
}

export function createCampusEvent(
  payload: CreateEventPayload,
): EventActionResult {
  const name = payload.name.trim();
  const abstract = payload.abstract.trim();
  const startDate = payload.startDate.trim();
  const endDate = payload.endDate.trim();
  const cost = payload.cost.trim() || "Free";
  const locationName = payload.locationName.trim();
  const department = payload.department.trim();

  if (!name || !abstract || !startDate || !locationName || !department) {
    return {
      ok: false,
      message:
        "Event name, description, start date, location, and department are required.",
    };
  }

  const parsedStartDate = new Date(startDate);
  if (Number.isNaN(parsedStartDate.getTime())) {
    return {
      ok: false,
      message: "Please enter a valid event start date.",
    };
  }

  const parsedEndDate = endDate ? new Date(endDate) : undefined;
  if (parsedEndDate && parsedEndDate.getTime() < parsedStartDate.getTime()) {
    return {
      ok: false,
      message: "End date cannot be earlier than start date.",
    };
  }

  const externalUrl = payload.externalUrl?.trim();

  if (externalUrl && !/^https?:\/\/\S+$/i.test(externalUrl)) {
    return {
      ok: false,
      message: "External link must start with http:// or https://",
    };
  }

  const newEvent: CampusEvent = {
    eventId: createUuid("event"),
    name,
    abstract,
    startDate: parsedStartDate.toISOString(),
    endDate: parsedEndDate?.toISOString(),
    cost,
    locationName,
    department,
    category: payload.category,
    createdBy: "anonymous user",
    source: "local",
    registrationCount: 0,
    externalUrl: externalUrl || undefined,
  };

  const storedEvents = getStoredCreatedEvents();
  saveStoredCreatedEvents([...storedEvents, newEvent]);

  return {
    ok: true,
    message:
      "Event created!",
    event: newEvent,
  };
}

function registerLocalEvent(
  eventId: string,
  account: DemoAccount | null,
): EventActionResult {
  const events = [...getFallbackEvents(), ...getStoredCreatedEvents()];
  const event = events.find((campusEvent) => campusEvent.eventId === eventId);

  if (!event) {
    return {
      ok: false,
      message: "Event could not be found.",
    };
  }

  if (hasJoinedCampusEvent(eventId, account)) {
    return {
      ok: false,
      message: "You are already registered for this event.",
    };
  }

  const registration: EventRegistration = {
    registrationId: createUuid("registration"),
    eventId,
    accountUuid: account?.accountUuid ?? getGuestRegistrantKey(),
    registrantName: account
      ? `${account.firstName} ${account.lastName}`
      : "Guest User",
    idNumber: account?.idNumber,
    createdAt: new Date().toISOString(),
  };

  saveRegistrationIfMissing(registration, account);

  return {
    ok: true,
    message: `Registered for ${event.name}.`,
    event,
    registration,
  };
}

export async function joinCampusEvent(
  eventId: string,
  account: DemoAccount | null,
): Promise<EventActionResult> {
  if (isLocalEvent(eventId)) {
    return registerLocalEvent(eventId, account);
  }

  if (!account) {
    return {
      ok: false,
      message: "Sign in with a student account to register for backend events.",
    };
  }

  if (hasJoinedCampusEvent(eventId, account)) {
    return {
      ok: false,
      message: "You are already registered for this event.",
    };
  }

  const studentId = Number.parseInt(account.idNumber, 10);
  if (!Number.isInteger(studentId) || studentId <= 0) {
    return {
      ok: false,
      message: "Your account is missing a valid student ID for registration.",
    };
  }

  try {
    const response = await apiPost<
      { data: BackendRegistration },
      { student_id: number }
    >(`/events/${encodeURIComponent(eventId)}/registrations`, {
      student_id: studentId,
    });

    const registration: EventRegistration = {
      registrationId: response.data.id,
      eventId: response.data.event_id,
      idNumber: response.data.student_id.toString(),
      registrantName: `${account.firstName} ${account.lastName}`,
      accountUuid: account.accountUuid,
      createdAt: response.data.registered_at,
    };

    saveRegistrationIfMissing(registration, account);

    return {
      ok: true,
      message: "Registration saved to the database.",
      registration,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to register for the event.",
    };
  }
}
