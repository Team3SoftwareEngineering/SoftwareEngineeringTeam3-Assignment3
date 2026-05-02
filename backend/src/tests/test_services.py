import pytest

from src.repositories.errors import DuplicateRecordError
from src.services.chat_query_service import ChatQueryService
from src.services.event_service import EventService
from src.services.map_routing_service import MapRoutingService
from src.services.parking_service import ParkingService
from src.services.registration_service import RegistrationService
from src.utils.errors import BadRequestError, ConflictError, NotFoundError


# Fake repositories keep service tests focused on business rules, not MySQL setup.
class EventRepo:
    def __init__(self, event=None):
        self.event = event

    def list_events(self, name=None, event_date=None):
        return [{"id": 1, "title": name, "date": event_date.isoformat()}]

    def find_by_id(self, _event_id):
        return self.event


class StudentRepo:
    def __init__(self, exists=True):
        self._exists = exists

    def exists(self, _student_id):
        return self._exists


class RegistrationRepo:
    def __init__(self, duplicate=False):
        self.duplicate = duplicate

    def create(self, student_id, event_id):
        if self.duplicate:
            raise DuplicateRecordError("duplicate")
        return {"id": 10, "student_id": student_id, "event_id": event_id}


class LocationRepo:
    def __init__(self):
        self.location = {
            "id": 1,
            "name": "Student Union Library Building",
            "latitude": 41.5839,
            "longitude": -87.4749,
        }

    def find_by_id(self, location_id):
        return self.location if location_id == 1 else None


class ParkingRepo:
    def list_parking_lots(self, campus=None, permit_type=None):
        return [
            {
                "id": 2,
                "name": "Far Lot",
                "campus": campus or "Hammond",
                "permit_type": permit_type or "student",
                "latitude": 41.6,
                "longitude": -87.49,
            },
            {
                "id": 1,
                "name": "Near Lot",
                "campus": campus or "Hammond",
                "permit_type": permit_type or "student",
                "latitude": 41.5843,
                "longitude": -87.4753,
            },
        ]


def test_event_service_returns_event_or_404():
    service = EventService(event_repository=EventRepo(event={"id": 1, "title": "Career Fair"}))

    assert service.get_event(1)["title"] == "Career Fair"

    missing_service = EventService(event_repository=EventRepo(event=None))
    with pytest.raises(NotFoundError):
        missing_service.get_event(99)


def test_registration_requires_existing_event_and_student():
    service = RegistrationService(
        event_repository=EventRepo(event={"id": 1}),
        student_repository=StudentRepo(exists=True),
        registration_repository=RegistrationRepo(),
    )

    registration = service.register_student_for_event(event_id=1, student_id=5)

    assert registration == {"id": 10, "student_id": 5, "event_id": 1}


def test_registration_maps_missing_and_duplicate_failures():
    missing_event = RegistrationService(
        event_repository=EventRepo(event=None),
        student_repository=StudentRepo(exists=True),
        registration_repository=RegistrationRepo(),
    )
    with pytest.raises(NotFoundError, match="Event not found"):
        missing_event.register_student_for_event(event_id=99, student_id=5)

    missing_student = RegistrationService(
        event_repository=EventRepo(event={"id": 1}),
        student_repository=StudentRepo(exists=False),
        registration_repository=RegistrationRepo(),
    )
    with pytest.raises(NotFoundError, match="Student not found"):
        missing_student.register_student_for_event(event_id=1, student_id=99)

    duplicate = RegistrationService(
        event_repository=EventRepo(event={"id": 1}),
        student_repository=StudentRepo(exists=True),
        registration_repository=RegistrationRepo(duplicate=True),
    )
    with pytest.raises(ConflictError):
        duplicate.register_student_for_event(event_id=1, student_id=5)


def test_parking_service_ranks_lots_by_location_distance():
    service = ParkingService(
        parking_repository=ParkingRepo(),
        location_repository=LocationRepo(),
        event_repository=EventRepo(),
    )

    result = service.list_parking_lots(location_id=1)

    assert result["items"][0]["name"] == "Near Lot"
    assert result["items"][0]["distance_miles"] <= result["items"][1]["distance_miles"]
    assert result["meta"]["availability_source"] == "not_available_in_current_schema"
    assert result["meta"]["ranked_by_distance"] is True


def test_parking_service_rejects_conflicting_lookup_contexts():
    service = ParkingService(
        parking_repository=ParkingRepo(),
        location_repository=LocationRepo(),
        event_repository=EventRepo(event={"id": 1}),
    )

    with pytest.raises(BadRequestError):
        service.list_parking_lots(location_id=1, event_id=1)


def test_map_routing_service_returns_mock_route_for_coordinates():
    service = MapRoutingService(location_repository=LocationRepo())

    route = service.get_route(
        origin_input={"label": "Origin", "latitude": 41.5839, "longitude": -87.4749},
        destination_input={"label": "Destination", "latitude": 41.5843, "longitude": -87.4753},
        mode="walking",
    )

    assert route["provider"] == "mock"
    assert route["distance"]["meters"] > 0
    assert route["tolls"]["available"] is False


def test_map_routing_service_validates_waypoints_and_mode():
    service = MapRoutingService(location_repository=LocationRepo())

    with pytest.raises(BadRequestError, match="mode"):
        service.get_route(
            origin_input={"latitude": 41.0, "longitude": -87.0},
            destination_input={"latitude": 42.0, "longitude": -88.0},
            mode="flying",
        )

    with pytest.raises(NotFoundError):
        service.get_route(
            origin_input={"location_id": 404},
            destination_input={"latitude": 42.0, "longitude": -88.0},
        )


def test_chat_query_service_routes_common_queries_deterministically():
    service = ChatQueryService()

    events = service.route_query("events today")
    parking = service.route_query("parking near gym")
    registration = service.route_query("register me for career fair")
    location = service.route_query("where is Student Union Library Building?")

    assert events["intent"] == "event_lookup"
    assert "date" in events["target"]["params"]
    assert parking["intent"] == "parking_lookup"
    assert parking["target"]["params"]["location_name"] == "gym"
    assert registration["intent"] == "event_registration"
    assert registration["parameters"]["event_name"] == "career fair"
    assert location["intent"] == "location_lookup"
    assert location["target"]["params"]["name"] == "Student Union Library Building"
