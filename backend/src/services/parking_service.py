from src.repositories.events_repository import EventRepository
from src.repositories.locations_repository import LocationRepository
from src.repositories.parking_repository import ParkingRepository
from src.utils.errors import BadRequestError, NotFoundError
from src.utils.geo import has_coordinates, haversine_miles


class ParkingService:
    def __init__(
        self,
        parking_repository=None,
        location_repository=None,
        event_repository=None,
    ):
        self.parking_repository = parking_repository or ParkingRepository()
        self.location_repository = location_repository or LocationRepository()
        self.event_repository = event_repository or EventRepository()

    def list_parking_lots(
        self,
        campus=None,
        permit_type=None,
        location_id=None,
        event_id=None,
        parking_date=None,
    ):
        if location_id and event_id:
            raise BadRequestError("Use either location_id or event_id, not both")

        origin = None
        if location_id:
            origin = self.location_repository.find_by_id(location_id)
            if origin is None:
                raise NotFoundError("Location not found")

        if event_id:
            event = self.event_repository.find_by_id(event_id)
            if event is None:
                raise NotFoundError("Event not found")
            origin = event.get("location")
            if origin is None:
                raise NotFoundError("Event location not found")

        parking_lots = self.parking_repository.list_parking_lots(
            campus=campus,
            permit_type=permit_type,
        )
        parking_lots = self._rank_by_distance(parking_lots, origin)
        return {
            "items": parking_lots,
            "meta": {
                "availability_source": "not_available_in_current_schema",
                "date": parking_date.isoformat() if parking_date else None,
                "ranked_by_distance": origin is not None and has_coordinates(origin),
            },
        }

    def get_parking_for_location(self, location_id):
        result = self.list_parking_lots(location_id=location_id)
        return result["items"]

    def _rank_by_distance(self, parking_lots, origin):
        if origin is None or not has_coordinates(origin):
            return parking_lots

        ranked = []
        unranked = []
        for parking_lot in parking_lots:
            if has_coordinates(parking_lot):
                enriched = dict(parking_lot)
                enriched["distance_miles"] = round(haversine_miles(origin, parking_lot), 2)
                ranked.append(enriched)
            else:
                unranked.append(parking_lot)

        ranked.sort(key=lambda item: item["distance_miles"])
        return ranked + unranked
