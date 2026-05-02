from datetime import date
import re

from flask import request

from src.utils.errors import BadRequestError


def get_json_object():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        raise BadRequestError("Request body must be a JSON object")
    return body


def parse_positive_int(value, field_name):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        raise BadRequestError(f"{field_name} must be a positive integer")

    if parsed <= 0:
        raise BadRequestError(f"{field_name} must be a positive integer")

    return parsed


def parse_optional_date(value, field_name="date"):
    if value in (None, ""):
        return None

    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(value)):
        raise BadRequestError(f"{field_name} must use YYYY-MM-DD format")

    try:
        return date.fromisoformat(value)
    except ValueError:
        raise BadRequestError(f"{field_name} must use YYYY-MM-DD format")


def get_optional_string(value):
    if value is None:
        return None

    cleaned = str(value).strip()
    return cleaned or None


def require_string(body, field_name):
    value = get_optional_string(body.get(field_name))
    if value is None:
        raise BadRequestError(f"{field_name} is required")
    return value


def require_object(body, field_name):
    value = body.get(field_name)
    if not isinstance(value, dict):
        raise BadRequestError(f"{field_name} must be an object")
    return value
