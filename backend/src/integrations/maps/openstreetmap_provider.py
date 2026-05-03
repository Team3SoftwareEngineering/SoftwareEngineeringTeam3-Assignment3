from src.utils.errors import BadRequestError


class OpenStreetMapRoutingProvider:
    provider_name = "openstreetmap"

    def get_route(self, _origin, _destination, _mode):
        # Placeholder preserves the same interface as future real routing providers.
        raise BadRequestError("OpenStreetMap routing is not implemented in this backend slice")
