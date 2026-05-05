from src.repositories.map_features_repository import MapFeaturesRepository


class MapFeatureService:
    def __init__(self, map_features_repository=None):
        self.map_features_repository = map_features_repository or MapFeaturesRepository()

    def list_map_features(self, campus=None, category=None):
        return self.map_features_repository.list_map_features(
            campus=campus,
            category=category,
        )
