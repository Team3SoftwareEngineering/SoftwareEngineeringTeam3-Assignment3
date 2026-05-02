from flask import Blueprint

from src.controllers.locations_controller import get_location_parking, list_locations


locations_blueprint = Blueprint("locations", __name__)
locations_blueprint.add_url_rule(
    "",
    view_func=list_locations,
    methods=["GET"],
    strict_slashes=False,
)
locations_blueprint.add_url_rule(
    "/<location_id>/parking",
    view_func=get_location_parking,
    methods=["GET"],
)

