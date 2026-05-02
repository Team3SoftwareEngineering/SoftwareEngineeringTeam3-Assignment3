from src.repositories.resource_repository import ResourceRepository
from src.utils.errors import NotFoundError


class ResourceService:
    def __init__(self, resource_repository=None):
        self.resource_repository = resource_repository or ResourceRepository()

    def list_resources(self):
        return self.resource_repository.list_resources()

    def get_resource_by_slug(self, slug):
        resource = self.resource_repository.find_by_slug(slug)
        if resource is None:
            raise NotFoundError("Resource not found")
        return resource

