from flask import Blueprint

from src.controllers.chat_controller import route_chat_query


chat_blueprint = Blueprint("chat", __name__)
chat_blueprint.add_url_rule("/query", view_func=route_chat_query, methods=["POST"])
