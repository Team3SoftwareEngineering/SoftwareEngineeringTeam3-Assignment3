from datetime import date
import re

from src.utils.errors import BadRequestError


class ChatQueryService:
    def route_query(self, query):
        cleaned = " ".join(query.strip().split())
        if not cleaned:
            raise BadRequestError("query is required")

        normalized = cleaned.lower()

        if "register" in normalized:
            return self._registration_route(cleaned, normalized)

        if "parking" in normalized:
            return self._parking_route(cleaned, normalized)

        if "event" in normalized or "events" in normalized:
            return self._event_route(normalized)

        if normalized.startswith(("where is", "where's", "locate ", "find ")):
            return self._location_route(cleaned, normalized)

        if self._looks_like_resource_question(normalized):
            return {
                "intent": "resource_lookup",
                "target": {"method": "GET", "path": "/api/resources", "params": {}},
                "message": "Route this question to official PNW resource links.",
            }

        return {
            "intent": "unknown",
            "target": None,
            "message": "No deterministic route matched this query.",
            "suggestions": [
                "events today",
                "parking near gym",
                "register me for career fair",
                "where is Student Union Library Building",
            ],
        }

    def _registration_route(self, cleaned, normalized):
        event_name = self._text_after_keyword(cleaned, normalized, "for")
        return {
            "intent": "event_registration",
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
        location_name = self._text_after_keyword(cleaned, normalized, "near")
        return {
            "intent": "parking_lookup",
            "target": {
                "method": "GET",
                "path": "/api/parking-lots",
                "params": {"location_name": location_name},
            },
            "message": "Route this question to parking lookup. Resolve location_name to location_id when possible.",
        }

    def _event_route(self, normalized):
        params = {}
        if "today" in normalized:
            params["date"] = date.today().isoformat()

        date_match = re.search(r"\b\d{4}-\d{2}-\d{2}\b", normalized)
        if date_match:
            params["date"] = date_match.group(0)

        return {
            "intent": "event_lookup",
            "target": {"method": "GET", "path": "/api/events", "params": params},
            "message": "Route this question to event lookup.",
        }

    def _location_route(self, cleaned, normalized):
        name = cleaned
        for prefix in ("where is", "where's", "locate", "find"):
            if normalized.startswith(prefix):
                name = cleaned[len(prefix) :].strip(" ?")
                break

        return {
            "intent": "location_lookup",
            "target": {"method": "GET", "path": "/api/locations", "params": {"name": name}},
            "message": "Route this question to campus location lookup.",
        }

    def _text_after_keyword(self, cleaned, normalized, keyword):
        marker = f" {keyword} "
        index = normalized.find(marker)
        if index == -1:
            return None
        return cleaned[index + len(marker) :].strip(" ?") or None

    def _looks_like_resource_question(self, normalized):
        resource_keywords = {
            "advising",
            "advisor",
            "registrar",
            "financial aid",
            "tuition",
            "admissions",
            "resources",
        }
        return any(keyword in normalized for keyword in resource_keywords)
