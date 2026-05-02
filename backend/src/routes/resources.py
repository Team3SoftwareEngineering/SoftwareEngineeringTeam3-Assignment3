from flask import Blueprint

from src.controllers.resources_controller import get_resource_by_slug, list_resources


resources_blueprint = Blueprint("resources", __name__)

# Resource routes expose official PNW links for directory and chat lookup flows.
resources_blueprint.add_url_rule(
    "",
    view_func=list_resources,
    methods=["GET"],
    strict_slashes=False,
)
resources_blueprint.add_url_rule("/<slug>", view_func=get_resource_by_slug, methods=["GET"])

