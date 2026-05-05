from flask import Blueprint

from src.controllers.map_features_controller import list_map_features


map_features_blueprint = Blueprint("map_features", __name__)

map_features_blueprint.add_url_rule(
    "",
    view_func=list_map_features,
    methods=["GET"],
    strict_slashes=False,
)
