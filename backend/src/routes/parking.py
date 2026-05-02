from flask import Blueprint

from src.controllers.parking_controller import list_parking_lots


parking_blueprint = Blueprint("parking", __name__)
parking_blueprint.add_url_rule(
    "",
    view_func=list_parking_lots,
    methods=["GET"],
    strict_slashes=False,
)
