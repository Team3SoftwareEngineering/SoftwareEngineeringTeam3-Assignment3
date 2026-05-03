from flask import Blueprint

from src.controllers.chat_controller import route_chat_query


chat_blueprint = Blueprint("chat", __name__)

# Query routing stays deterministic and returns the backend endpoint a UI should call next.
chat_blueprint.add_url_rule("/query", view_func=route_chat_query, methods=["POST"])
