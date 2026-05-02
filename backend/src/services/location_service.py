from src.repositories.locations_repository import LocationRepository
from src.utils.errors import NotFoundError


class LocationService:
    def __init__(self, location_repository=None):
        self.location_repository = location_repository or LocationRepository()

    def list_locations(self, name=None):
        return self.location_repository.list_locations(name=name)

    def get_location(self, location_id):
        location = self.location_repository.find_by_id(location_id)
        if location is None:
            raise NotFoundError("Location not found")
        return location

