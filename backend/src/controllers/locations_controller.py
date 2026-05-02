from flask import request

from src.services.service_factory import create_location_service, create_parking_service
from src.utils.validation import get_optional_string, parse_positive_int


def list_locations():
    # Keep filtering optional so the same endpoint supports map load and search.
    name = get_optional_string(request.args.get("name"))
    locations = create_location_service().list_locations(name=name)
    return {"data": locations}


def get_location_parking(location_id):
    parsed_location_id = parse_positive_int(location_id, "location_id")
    parking_lots = create_parking_service().get_parking_for_location(parsed_location_id)
    return {"data": parking_lots}

