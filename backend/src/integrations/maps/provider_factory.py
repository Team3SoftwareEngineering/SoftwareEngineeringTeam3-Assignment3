from src.config.env import Config
from src.integrations.maps.google_maps_provider import GoogleMapsRoutingProvider
from src.integrations.maps.mock_provider import MockMapRoutingProvider
from src.integrations.maps.openstreetmap_provider import OpenStreetMapRoutingProvider
from src.utils.errors import BadRequestError


def create_map_provider():
    # Mock is the safe default because it does not need secrets or network access.
    provider_name = (Config.MAP_PROVIDER or "mock").lower()

    if provider_name == "mock":
        return MockMapRoutingProvider()
    if provider_name in ("google", "google_maps"):
        return GoogleMapsRoutingProvider(Config.MAP_API_KEY)
    if provider_name in ("openstreetmap", "osm"):
        return OpenStreetMapRoutingProvider()

    raise BadRequestError("MAP_PROVIDER must be mock, google, or openstreetmap")
