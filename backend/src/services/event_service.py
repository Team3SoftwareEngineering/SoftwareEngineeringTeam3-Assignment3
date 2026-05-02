from src.repositories.events_repository import EventRepository
from src.utils.errors import NotFoundError


class EventService:
    def __init__(self, event_repository=None):
        self.event_repository = event_repository or EventRepository()

    def list_events(self, name=None, event_date=None):
        return self.event_repository.list_events(name=name, event_date=event_date)

    def get_event(self, event_id):
        event = self.event_repository.find_by_id(event_id)
        if event is None:
            raise NotFoundError("Event not found")
        return event
