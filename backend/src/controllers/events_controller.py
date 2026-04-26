from src.services.event_service import get_events


def list_events():
    return {"data": get_events()}

