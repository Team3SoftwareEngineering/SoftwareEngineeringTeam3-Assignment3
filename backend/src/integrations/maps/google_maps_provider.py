from src.utils.errors import BadRequestError


class GoogleMapsRoutingProvider:
    provider_name = "google"

    def __init__(self, api_key):
        self.api_key = api_key

    def get_route(self, _origin, _destination, _mode):
        # Placeholder keeps the provider boundary ready without making live calls yet.
        if not self.api_key:
            raise BadRequestError("MAP_API_KEY is required for Google Maps routing")
        raise BadRequestError("Google Maps routing is not implemented in this backend slice")
