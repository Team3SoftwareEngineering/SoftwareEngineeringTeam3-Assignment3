from flask import Blueprint

from src.controllers.locations_controller import list_locations


locations_blueprint = Blueprint("locations", __name__)
locations_blueprint.add_url_rule("/", view_func=list_locations, methods=["GET"])

