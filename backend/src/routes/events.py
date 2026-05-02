from flask import Blueprint

from src.controllers.events_controller import (
    create_event_registration,
    get_event,
    list_events,
)


events_blueprint = Blueprint("events", __name__)
events_blueprint.add_url_rule(
    "",
    view_func=list_events,
    methods=["GET"],
    strict_slashes=False,
)
events_blueprint.add_url_rule("/<event_id>", view_func=get_event, methods=["GET"])
events_blueprint.add_url_rule(
    "/<event_id>/registrations",
    view_func=create_event_registration,
    methods=["POST"],
)

