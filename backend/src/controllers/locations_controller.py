from src.services.location_service import get_locations


def list_locations():
    return {"data": get_locations()}

