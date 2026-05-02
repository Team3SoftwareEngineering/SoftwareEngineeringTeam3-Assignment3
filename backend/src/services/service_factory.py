from src.services.chat_query_service import ChatQueryService
from src.services.event_service import EventService
from src.services.location_service import LocationService
from src.services.map_routing_service import MapRoutingService
from src.services.parking_service import ParkingService
from src.services.registration_service import RegistrationService
from src.services.resource_service import ResourceService
from src.integrations.maps.provider_factory import create_map_provider


# Factory functions keep controllers easy to monkeypatch in tests.
def create_event_service():
    return EventService()


def create_registration_service():
    return RegistrationService()


def create_location_service():
    return LocationService()


def create_parking_service():
    return ParkingService()


def create_map_routing_service():
    return MapRoutingService(route_provider=create_map_provider())


def create_chat_query_service():
    return ChatQueryService()


def create_resource_service():
    return ResourceService()
