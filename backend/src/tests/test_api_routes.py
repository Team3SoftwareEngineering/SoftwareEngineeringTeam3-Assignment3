from src.app import create_app
from src.utils.errors import ConflictError, NotFoundError


def make_client():
    app = create_app({"TESTING": True})
    return app.test_client()


# Route tests monkeypatch services so they validate HTTP behavior without MySQL.
def test_events_endpoint_filters_by_name_and_date(monkeypatch):
    from src.controllers import events_controller

    class FakeEventService:
        def list_events(self, name=None, event_date=None):
            assert name == "career"
            assert event_date.isoformat() == "2026-05-01"
            return [{"id": 1, "title": "Career Fair"}]

    monkeypatch.setattr(
        events_controller,
        "create_event_service",
        lambda: FakeEventService(),
    )

    response = make_client().get("/api/events?name=career&date=2026-05-01")

    assert response.status_code == 200
    assert response.get_json() == {"data": [{"id": 1, "title": "Career Fair"}]}


def test_events_endpoint_allows_trailing_slash(monkeypatch):
    from src.controllers import events_controller

    class FakeEventService:
        def list_events(self, name=None, event_date=None):
            return []

    monkeypatch.setattr(
        events_controller,
        "create_event_service",
        lambda: FakeEventService(),
    )

    response = make_client().get("/api/events/")

    assert response.status_code == 200
    assert response.get_json() == {"data": []}


def test_events_endpoint_rejects_bad_date():
    response = make_client().get("/api/events?date=05-01-2026")

    assert response.status_code == 400
    assert response.get_json() == {"error": "date must use YYYY-MM-DD format"}


def test_events_endpoint_rejects_compact_date():
    response = make_client().get("/api/events?date=20260501")

    assert response.status_code == 400
    assert response.get_json() == {"error": "date must use YYYY-MM-DD format"}


def test_event_detail_endpoint_returns_404_from_service(monkeypatch):
    from src.controllers import events_controller

    class FakeEventService:
        def get_event(self, _event_id):
            raise NotFoundError("Event not found")

    monkeypatch.setattr(
        events_controller,
        "create_event_service",
        lambda: FakeEventService(),
    )

    response = make_client().get("/api/events/99")

    assert response.status_code == 404
    assert response.get_json() == {"error": "Event not found"}


def test_event_registration_requires_student_id():
    response = make_client().post("/api/events/1/registrations", json={})

    assert response.status_code == 400
    assert response.get_json() == {"error": "student_id must be a positive integer"}


def test_event_registration_success_and_duplicate(monkeypatch):
    from src.controllers import events_controller

    class FakeRegistrationService:
        def __init__(self, duplicate=False):
            self.duplicate = duplicate

        def register_student_for_event(self, event_id=None, student_id=None):
            if self.duplicate:
                raise ConflictError("Student is already registered for this event")
            return {"id": 7, "event_id": event_id, "student_id": student_id}

    monkeypatch.setattr(
        events_controller,
        "create_registration_service",
        lambda: FakeRegistrationService(),
    )

    response = make_client().post("/api/events/1/registrations", json={"student_id": 2})

    assert response.status_code == 201
    assert response.get_json() == {"data": {"id": 7, "event_id": 1, "student_id": 2}}

    monkeypatch.setattr(
        events_controller,
        "create_registration_service",
        lambda: FakeRegistrationService(duplicate=True),
    )

    duplicate_response = make_client().post(
        "/api/events/1/registrations",
        json={"student_id": 2},
    )

    assert duplicate_response.status_code == 409
    assert duplicate_response.get_json() == {
        "error": "Student is already registered for this event"
    }


def test_locations_parking_endpoint(monkeypatch):
    from src.controllers import locations_controller

    class FakeParkingService:
        def get_parking_for_location(self, location_id):
            assert location_id == 1
            return [{"id": 3, "name": "Lot A"}]

    monkeypatch.setattr(
        locations_controller,
        "create_parking_service",
        lambda: FakeParkingService(),
    )

    response = make_client().get("/api/locations/1/parking")

    assert response.status_code == 200
    assert response.get_json() == {"data": [{"id": 3, "name": "Lot A"}]}


def test_map_features_endpoint_supports_filters(monkeypatch):
    from src.controllers import map_features_controller

    class FakeMapFeatureService:
        def list_map_features(self, campus=None, category=None):
            assert campus == "hammond"
            assert category == "parking"
            return [{"id": "f1", "name": "Parking Lot A"}]

    monkeypatch.setattr(
        map_features_controller,
        "create_map_feature_service",
        lambda: FakeMapFeatureService(),
    )

    response = make_client().get("/api/map-features?campus=hammond&category=parking")

    assert response.status_code == 200
    assert response.get_json() == {"data": [{"id": "f1", "name": "Parking Lot A"}]}


def test_parking_lots_endpoint_returns_meta(monkeypatch):
    from src.controllers import parking_controller

    class FakeParkingService:
        def list_parking_lots(self, **kwargs):
            assert kwargs["campus"] == "Hammond"
            assert kwargs["parking_date"].isoformat() == "2026-05-01"
            return {
                "items": [{"id": 1, "name": "Lot A"}],
                "meta": {"availability_source": "not_available_in_current_schema"},
            }

    monkeypatch.setattr(
        parking_controller,
        "create_parking_service",
        lambda: FakeParkingService(),
    )

    response = make_client().get("/api/parking-lots?campus=Hammond&date=2026-05-01")

    assert response.status_code == 200
    assert response.get_json() == {
        "data": [{"id": 1, "name": "Lot A"}],
        "meta": {"availability_source": "not_available_in_current_schema"},
    }


def test_route_endpoint_uses_mock_provider_without_external_call():
    response = make_client().post(
        "/api/routes",
        json={
            "origin": {"label": "A", "latitude": 41.5839, "longitude": -87.4749},
            "destination": {"label": "B", "latitude": 41.5843, "longitude": -87.4753},
            "mode": "walking",
        },
    )

    assert response.status_code == 200
    data = response.get_json()["data"]
    assert data["provider"] == "mock"
    assert data["distance"]["meters"] > 0
    assert data["tolls"]["available"] is False


def test_route_endpoint_normalizes_uppercase_mode():
    response = make_client().post(
        "/api/routes",
        json={
            "origin": {"label": "A", "latitude": 41.5839, "longitude": -87.4749},
            "destination": {"label": "B", "latitude": 41.5843, "longitude": -87.4753},
            "mode": "Walking",
        },
    )

    assert response.status_code == 200
    assert response.get_json()["data"]["mode"] == "walking"


def test_route_endpoint_rejects_non_string_mode():
    response = make_client().post(
        "/api/routes",
        json={
            "origin": {"label": "A", "latitude": 41.5839, "longitude": -87.4749},
            "destination": {"label": "B", "latitude": 41.5843, "longitude": -87.4753},
            "mode": ["walking"],
        },
    )

    assert response.status_code == 400
    assert response.get_json() == {"error": "mode must be walking, driving, or bicycling"}


def test_route_endpoint_rejects_missing_destination():
    response = make_client().post(
        "/api/routes",
        json={"origin": {"latitude": 41.5839, "longitude": -87.4749}},
    )

    assert response.status_code == 400
    assert response.get_json() == {"error": "destination must be an object"}


def test_http_errors_use_json_format():
    response = make_client().post("/api/health")

    assert response.status_code == 405
    assert response.get_json()["error"]


def test_chat_query_endpoint_routes_deterministically():
    response = make_client().post("/api/chat/query", json={"query": "parking near gym"})

    assert response.status_code == 200
    data = response.get_json()["data"]
    assert data["intent"] == "parking_lookup"
    assert data["target"]["path"] == "/api/parking-lots"


def test_resource_endpoint_uses_resource_service(monkeypatch):
    from src.controllers import resources_controller

    class FakeResourceService:
        def get_resource_by_slug(self, slug):
            assert slug == "advising"
            return {"slug": slug, "label": "Academic Advising"}

    monkeypatch.setattr(
        resources_controller,
        "create_resource_service",
        lambda: FakeResourceService(),
    )

    response = make_client().get("/api/resources/advising")

    assert response.status_code == 200
    assert response.get_json() == {
        "data": {"slug": "advising", "label": "Academic Advising"}
    }
