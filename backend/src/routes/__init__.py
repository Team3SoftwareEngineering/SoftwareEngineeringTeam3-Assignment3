from flask import Blueprint

from src.routes.events import events_blueprint
from src.routes.locations import locations_blueprint
from src.routes.resources import resources_blueprint


api_blueprint = Blueprint("api", __name__)


@api_blueprint.get("/health")
def health():
    return {"status": "ok"}


api_blueprint.register_blueprint(events_blueprint, url_prefix="/events")
api_blueprint.register_blueprint(locations_blueprint, url_prefix="/locations")
api_blueprint.register_blueprint(resources_blueprint, url_prefix="/resources")

