from flask import Blueprint

from src.routes.chat import chat_blueprint
from src.routes.events import events_blueprint
from src.routes.locations import locations_blueprint
from src.routes.map_features import map_features_blueprint
from src.routes.parking import parking_blueprint
from src.routes.resources import resources_blueprint
from src.routes.routing import routing_blueprint


api_blueprint = Blueprint("api", __name__)


@api_blueprint.get("/health")
def health():
    return {"status": "ok"}


# Feature blueprints stay grouped here so each route module owns only its URL slice.
api_blueprint.register_blueprint(events_blueprint, url_prefix="/events")
api_blueprint.register_blueprint(locations_blueprint, url_prefix="/locations")
api_blueprint.register_blueprint(map_features_blueprint, url_prefix="/map-features")
api_blueprint.register_blueprint(parking_blueprint, url_prefix="/parking-lots")
api_blueprint.register_blueprint(resources_blueprint, url_prefix="/resources")
api_blueprint.register_blueprint(routing_blueprint, url_prefix="/routes")
api_blueprint.register_blueprint(chat_blueprint, url_prefix="/chat")

