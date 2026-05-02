from src.utils.errors import BadRequestError


class OpenStreetMapRoutingProvider:
    provider_name = "openstreetmap"

    def get_route(self, _origin, _destination, _mode):
        raise BadRequestError("OpenStreetMap routing is not implemented in this backend slice")
