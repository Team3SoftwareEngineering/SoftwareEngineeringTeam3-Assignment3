from flask import request

from src.services.service_factory import create_event_service, create_registration_service
from src.utils.validation import (
    get_json_object,
    get_optional_string,
    parse_optional_date,
    parse_positive_int,
)


def list_events():
    # Controllers normalize HTTP inputs before services apply business rules.
    name = get_optional_string(request.args.get("name"))
    event_date = parse_optional_date(request.args.get("date"))
    events = create_event_service().list_events(name=name, event_date=event_date)
    return {"data": events}


def get_event(event_id):
    parsed_event_id = parse_positive_int(event_id, "event_id")
    event = create_event_service().get_event(parsed_event_id)
    return {"data": event}


def create_event_registration(event_id):
    parsed_event_id = parse_positive_int(event_id, "event_id")
    body = get_json_object()
    # Registration intentionally requires an existing student record in this slice.
    student_id = parse_positive_int(body.get("student_id"), "student_id")
    registration = create_registration_service().register_student_for_event(
        event_id=parsed_event_id,
        student_id=student_id,
    )
    return {"data": registration}, 201

