from flask import Blueprint

from src.controllers.events_controller import list_events


events_blueprint = Blueprint("events", __name__)
events_blueprint.add_url_rule("/", view_func=list_events, methods=["GET"])

