from flask import Blueprint

from src.controllers.resources_controller import get_resource_by_slug, list_resources


resources_blueprint = Blueprint("resources", __name__)
resources_blueprint.add_url_rule("/", view_func=list_resources, methods=["GET"])
resources_blueprint.add_url_rule("/<slug>", view_func=get_resource_by_slug, methods=["GET"])

