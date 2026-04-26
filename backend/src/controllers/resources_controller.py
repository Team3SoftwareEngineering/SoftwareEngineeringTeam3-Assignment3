from src.services.resource_service import find_resource_by_slug, get_resources


def list_resources():
    return {"data": get_resources()}


def get_resource_by_slug(slug):
    resource = find_resource_by_slug(slug)

    if resource is None:
        return {"error": "Resource not found"}, 404

    return {"data": resource}

