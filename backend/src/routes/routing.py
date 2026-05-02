from flask import Blueprint

from src.controllers.routing_controller import create_route


routing_blueprint = Blueprint("routing", __name__)

# Route calculation is a POST because origins/destinations can be structured JSON.
routing_blueprint.add_url_rule(
    "",
    view_func=create_route,
    methods=["POST"],
    strict_slashes=False,
)
