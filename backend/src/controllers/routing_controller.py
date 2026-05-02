from src.services.service_factory import create_map_routing_service
from src.utils.validation import get_json_object, require_object


def create_route():
    body = get_json_object()
    origin = require_object(body, "origin")
    destination = require_object(body, "destination")
    mode = body.get("mode", "walking")

    route = create_map_routing_service().get_route(
        origin_input=origin,
        destination_input=destination,
        mode=mode,
    )
    return {"data": route}
