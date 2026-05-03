from src.services.service_factory import create_resource_service


def list_resources():
    # Resource links are DB-backed so chat and directory UI share the same source.
    return {"data": create_resource_service().list_resources()}


def get_resource_by_slug(slug):
    resource = create_resource_service().get_resource_by_slug(slug)
    return {"data": resource}

