from flask import request

from src.services.service_factory import create_parking_service
from src.utils.validation import (
    get_optional_string,
    parse_optional_date,
    parse_positive_int,
)


def list_parking_lots():
    # Query parameters describe lookup context; the service decides ranking rules.
    campus = get_optional_string(request.args.get("campus"))
    permit_type = get_optional_string(request.args.get("permit_type"))
    parking_date = parse_optional_date(request.args.get("date"))

    location_id = None
    if request.args.get("location_id") not in (None, ""):
        location_id = parse_positive_int(request.args.get("location_id"), "location_id")

    event_id = None
    if request.args.get("event_id") not in (None, ""):
        event_id = parse_positive_int(request.args.get("event_id"), "event_id")

    result = create_parking_service().list_parking_lots(
        campus=campus,
        permit_type=permit_type,
        location_id=location_id,
        event_id=event_id,
        parking_date=parking_date,
    )
    return {"data": result["items"], "meta": result["meta"]}
