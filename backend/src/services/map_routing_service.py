from src.integrations.maps.mock_provider import MockMapRoutingProvider
from src.repositories.locations_repository import LocationRepository
from src.utils.errors import BadRequestError, NotFoundError
from src.utils.validation import parse_identifier


VALID_ROUTE_MODES = {"walking", "driving", "bicycling"}


class MapRoutingService:
    def __init__(self, location_repository=None, route_provider=None):
        self.location_repository = location_repository or LocationRepository()
        self.route_provider = route_provider or MockMapRoutingProvider()

    def get_route(self, origin_input, destination_input, mode="walking"):
        # Normalize mode here so providers can focus on route calculation only.
        mode = mode or "walking"
        if not isinstance(mode, str):
            raise BadRequestError("mode must be walking, driving, or bicycling")

        mode = mode.lower()
        if mode not in VALID_ROUTE_MODES:
            raise BadRequestError("mode must be walking, driving, or bicycling")

        origin = self._resolve_waypoint(origin_input, "origin")
        destination = self._resolve_waypoint(destination_input, "destination")

        return self.route_provider.get_route(origin, destination, mode)

    def _resolve_waypoint(self, waypoint, field_name):
        if "location_id" in waypoint:
            # Location ids let the frontend route from known campus buildings.
            location_id = parse_identifier(
                waypoint["location_id"],
                f"{field_name}.location_id",
            )
            lookup_id = int(location_id) if location_id.isdigit() else location_id
            location = self.location_repository.find_by_id(lookup_id)
            if location is None:
                raise NotFoundError(f"{field_name} location not found")
            if location.get("latitude") is None or location.get("longitude") is None:
                raise BadRequestError(f"{field_name} location does not have coordinates")
            return {
                "label": location["name"],
                "latitude": location["latitude"],
                "longitude": location["longitude"],
            }

        if "latitude" not in waypoint or "longitude" not in waypoint:
            raise BadRequestError(f"{field_name} must include coordinates or location_id")

        try:
            latitude = float(waypoint["latitude"])
            longitude = float(waypoint["longitude"])
        except (TypeError, ValueError):
            raise BadRequestError(f"{field_name} latitude and longitude must be numbers")

        if latitude < -90 or latitude > 90 or longitude < -180 or longitude > 180:
            raise BadRequestError(f"{field_name} coordinates are out of range")

        return {
            "label": waypoint.get("label", field_name),
            "latitude": latitude,
            "longitude": longitude,
        }
