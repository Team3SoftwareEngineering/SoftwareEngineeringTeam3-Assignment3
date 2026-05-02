from src.services.service_factory import create_chat_query_service
from src.utils.validation import get_json_object, require_string


def route_chat_query():
    body = get_json_object()
    query = require_string(body, "query")
    result = create_chat_query_service().route_query(query)
    return {"data": result}
