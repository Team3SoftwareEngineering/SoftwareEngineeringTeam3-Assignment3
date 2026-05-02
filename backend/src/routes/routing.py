from flask import Blueprint

from src.controllers.routing_controller import create_route


routing_blueprint = Blueprint("routing", __name__)
routing_blueprint.add_url_rule(
    "",
    view_func=create_route,
    methods=["POST"],
    strict_slashes=False,
)
