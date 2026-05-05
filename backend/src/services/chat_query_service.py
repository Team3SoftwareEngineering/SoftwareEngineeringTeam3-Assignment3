from datetime import date, timedelta
import re

from src.utils.errors import BadRequestError


class ChatQueryService:
    """
    Deterministic rule-based router for the campus assistant.

    Improvements over the original version:
    - Supports more natural phrases for registration, parking, location, and resources.
    - Extracts simple relative dates like today, tomorrow, this week, and next week.
    - Preserves an optional search term so the UI or controller can resolve a specific event.
    - Returns a lightweight confidence label to help the frontend explain ambiguous matches.
    """

    REGISTRATION_KEYWORDS = {
        "register",
        "registration",
        "rsvp",
        "sign up",
        "signup",
        "sign me up",
        "join",
        "join me",
        "enroll me",
        "reserve a spot",
        "save me a spot",
        "attend",
    }
    EVENT_HINTS = {
        "event",
        "events",
        "fair",
        "night",
        "workshop",
        "mixer",
        "club",
        "activity",
        "activities",
        "program",
        "session",
        "seminar",
        "volunteer",
        "showcase",
        "welcome",
    }
    PARKING_KEYWORDS = {
        "parking",
        "parking lot",
        "lot",
        "garage",
        "park near",
        "park by",
        "where can i park",
        "closest parking",
        "visitor parking",
        "accessible parking",
        "ada parking",
    }
    LOCATION_PREFIXES = (
        "where is",
        "where's",
        "locate",
        "find",
        "how do i get to",
        "take me to",
        "directions to",
        "navigate to",
        "map to",
        "show me",
        "show me where",
        "where can i find",
    )
    LOCATION_HINTS = {
        "building",
        "hall",
        "library",
        "student union",
        "classroom",
        "office",
        "lab",
        "center",
        "gym",
        "fitness",
        "recreation",
        "bookstore",
        "cafeteria",
    }
    RESOURCE_KEYWORDS = {
        "advising",
        "advisor",
        "registrar",
        "register for classes",
        "class registration",
        "course registration",
        "enroll in classes",
        "enroll for classes",
        "courses",
        "classes",
        "transcript",
        "records",
        "academic calendar",
        "financial aid",
        "fafsa",
        "scholarship",
        "scholarships",
        "tuition",
        "bill",
        "billing",
        "bursar",
        "admissions",
        "apply",
        "resources",
        "housing",
        "residence",
        "dining",
        "food",
        "meal plan",
        "career",
        "career center",
        "career services",
        "internship",
        "job",
        "jobs",
    }
    CLASS_REGISTRATION_KEYWORDS = {
        "register for class",
        "register for classes",
        "class registration",
        "course registration",
        "enroll in class",
        "enroll in classes",
        "enroll for class",
        "enroll for classes",
        "add a class",
        "drop a class",
        "schedule classes",
    }

    def route_query(self, query):
        cleaned = " ".join(query.strip().split())
        if not cleaned:
            raise BadRequestError("query is required")

        normalized = cleaned.casefold()

        # Ordered checks keep the UI predictable.
        if self._is_class_registration_query(normalized):
            return self._resource_route(
                search="registrar",
                message="Route class registration questions to registrar resources.",
            )

        if self._is_registration_query(normalized):
            return self._registration_route(cleaned, normalized)

        if self._contains_any(normalized, self.PARKING_KEYWORDS):
            return self._parking_route(cleaned, normalized)

        if self._is_event_query(normalized):
            return self._event_route(cleaned, normalized)

        if self._looks_like_resource_question(normalized):
            return self._resource_route(search=self._resource_search_term(normalized))

        if normalized.startswith(self.LOCATION_PREFIXES) or self._looks_like_location_reference(
            normalized
        ):
            return self._location_route(cleaned, normalized)

        return {
            "intent": "unknown",
            "confidence": "low",
            "target": None,
            "message": "No deterministic route matched this query.",
            "suggestions": [
                "events today",
                "parking near gym",
                "register for Student Life Welcome Night",
                "where is Student Union Library Building",
                "financial aid resources",
            ],
        }

    def _registration_route(self, cleaned, normalized):
        event_name = self._extract_registration_subject(cleaned, normalized)
        return {
            "intent": "event_registration",
            "confidence": "high" if event_name else "medium",
            "target": {
                "method": "POST",
                "path": "/api/events/{event_id}/registrations",
                "body": {"student_id": "{student_id}"},
            },
            "parameters": {"event_name": event_name},
            "missing": ["event_id", "student_id"],
            "message": "Resolve the event, then submit a registration with an existing student_id.",
        }

    def _parking_route(self, cleaned, normalized):
        location_name = self._extract_subject_after_keywords(
            cleaned=cleaned,
            normalized=normalized,
            keywords=("near", "by", "for", "at", "around", "closest to"),
        )
        return {
            "intent": "parking_lookup",
            "confidence": "high" if location_name else "medium",
            "target": {
                "method": "GET",
                "path": "/api/parking-lots",
                "params": {"location_name": location_name},
            },
            "message": "Route this question to parking lookup. Resolve location_name to location_id when possible.",
            "suggestions": [
                "parking near Student Union Library Building",
                "parking near Fitness and Recreation Center",
                "accessible parking near Bioscience Building",
            ],
        }

    def _event_route(self, cleaned, normalized):
        params = self._extract_date_params(normalized)
        search_term = self._event_search_term(cleaned, normalized)
        if search_term:
            params["search"] = search_term

        return {
            "intent": "event_lookup",
            "confidence": "high" if params or search_term else "medium",
            "target": {"method": "GET", "path": "/api/events", "params": params},
            "message": "Route this question to event lookup.",
            "suggestions": [
                "events today",
                "events this week",
                "career events",
                "student life events",
            ],
        }

    def _location_route(self, cleaned, normalized):
        name = cleaned
        for prefix in self.LOCATION_PREFIXES:
            if normalized.startswith(prefix):
                name = cleaned[len(prefix) :].strip(" ?")
                break

        return {
            "intent": "location_lookup",
            "confidence": "high" if name else "medium",
            "target": {"method": "GET", "path": "/api/locations", "params": {"name": name}},
            "message": "Route this question to campus location lookup.",
            "suggestions": [
                "where is Student Union Library Building",
                "where is Classroom Office Building",
                "directions to Fitness and Recreation Center",
            ],
        }

    def _is_registration_query(self, normalized):
        has_registration_language = self._contains_any(normalized, self.REGISTRATION_KEYWORDS)
        has_event_hint = self._contains_any(normalized, self.EVENT_HINTS)
        return has_registration_language and (has_event_hint or " for " in normalized)

    def _is_class_registration_query(self, normalized):
        return self._contains_any(normalized, self.CLASS_REGISTRATION_KEYWORDS)

    def _is_event_query(self, normalized):
        return self._contains_any(normalized, self.EVENT_HINTS) or any(
            token in normalized for token in ("today", "tomorrow", "this week", "next week")
        )

    def _extract_registration_subject(self, cleaned, normalized):
        subject = self._extract_subject_after_keywords(
            cleaned=cleaned,
            normalized=normalized,
            keywords=("for", "to"),
        )
        if subject:
            return subject

        prefixes = ("register me for", "register for", "sign me up for", "join", "enroll me in")
        lowered = cleaned.casefold()
        for prefix in prefixes:
            if lowered.startswith(prefix):
                return cleaned[len(prefix) :].strip(" ?") or None
        return None

    def _extract_subject_after_keywords(self, cleaned, normalized, keywords):
        for keyword in keywords:
            marker = f" {keyword} "
            index = normalized.find(marker)
            if index != -1:
                return cleaned[index + len(marker) :].strip(" ?") or None
        return None

    def _extract_date_params(self, normalized):
        params = {}

        if "today" in normalized:
            params["date"] = date.today().isoformat()
        elif "tomorrow" in normalized:
            params["date"] = (date.today() + timedelta(days=1)).isoformat()
        elif "this week" in normalized:
            params["date_from"] = date.today().isoformat()
            params["date_to"] = (date.today() + timedelta(days=6)).isoformat()
        elif "next week" in normalized:
            start = date.today() + timedelta(days=7)
            params["date_from"] = start.isoformat()
            params["date_to"] = (start + timedelta(days=6)).isoformat()

        date_match = re.search(r"\b\d{4}-\d{2}-\d{2}\b", normalized)
        if date_match:
            params["date"] = date_match.group(0)

        return params

    def _event_search_term(self, cleaned, normalized):
        without_date_tokens = re.sub(
            r"\b(today|tomorrow|this week|next week|\d{4}-\d{2}-\d{2})\b",
            "",
            normalized,
        )
        without_event_tokens = re.sub(
            r"\b(events?|show me|find|campus|happening|activities|activity|calendar|upcoming)\b",
            "",
            without_date_tokens,
        )
        search_term = " ".join(without_event_tokens.split()).strip(" ?")
        if not search_term:
            return None

        return search_term

    def _resource_route(self, search=None, message=None):
        params = {}
        if search:
            params["search"] = search

        return {
            "intent": "resource_lookup",
            "confidence": "high",
            "target": {"method": "GET", "path": "/api/resources", "params": params},
            "message": message or "Route this question to official PNW resource links.",
            "suggestions": [
                "financial aid resources",
                "class registration",
                "housing resources",
                "career center",
            ],
        }

    def _resource_search_term(self, normalized):
        registrar_terms = (
            "registrar",
            "registration",
            "classes",
            "courses",
            "transcript",
            "records",
            "academic calendar",
        )
        if self._contains_any(normalized, registrar_terms):
            return "registrar"

        if self._contains_any(normalized, ("financial aid", "fafsa", "scholarship", "tuition")):
            return "financial aid"

        if self._contains_any(normalized, ("career", "internship", "job", "resume")):
            return "career"

        if self._contains_any(normalized, ("housing", "residence", "dorm")):
            return "housing"

        if self._contains_any(normalized, ("dining", "food", "meal")):
            return "dining"

        return None

    def _looks_like_resource_question(self, normalized):
        return self._contains_any(normalized, self.RESOURCE_KEYWORDS)

    def _looks_like_location_reference(self, normalized):
        return self._contains_any(normalized, self.LOCATION_HINTS)

    @staticmethod
    def _contains_any(normalized, phrases):
        return any(phrase in normalized for phrase in phrases)
