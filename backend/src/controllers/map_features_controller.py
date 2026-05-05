from flask import request

from src.services.service_factory import create_map_feature_service
from src.utils.validation import get_optional_string


def list_map_features():
    campus = get_optional_string(request.args.get("campus"))
    category = get_optional_string(request.args.get("category"))
    map_features = create_map_feature_service().list_map_features(
        campus=campus,
        category=category,
    )
    return {"data": map_features}
