import json

from src.repositories.database import fetch_all


class MapFeaturesRepository:
    def list_map_features(self, campus=None, category=None):
        query = """
            SELECT
              feature_uuid,
              campus_id,
              name,
              category,
              geometry_type,
              coordinates_json,
              short_description,
              tags_json,
              accessibility_info,
              address,
              location_uuid,
              is_placeholder_data
            FROM map_features
        """
        conditions = []
        params = []

        if campus:
            conditions.append("LOWER(campus_id) = LOWER(%s)")
            params.append(campus)

        if category:
            conditions.append("LOWER(category) = LOWER(%s)")
            params.append(category)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY category ASC, name ASC"
        return [self._to_map_feature(row) for row in fetch_all(query, tuple(params))]

    def _to_map_feature(self, row):
        return {
            "id": row["feature_uuid"],
            "campus": row["campus_id"],
            "name": row["name"],
            "category": row["category"],
            "type": row["geometry_type"],
            "coordinates": self._parse_json_column(row["coordinates_json"], []),
            "shortDescription": row["short_description"],
            "tags": self._parse_json_column(row["tags_json"], []),
            "accessibilityInfo": row["accessibility_info"],
            "address": row["address"],
            "locationId": row["location_uuid"],
            "isPlaceholderData": bool(row["is_placeholder_data"]),
            "dataSource": "backend",
        }

    def _parse_json_column(self, value, default):
        if isinstance(value, (list, dict)):
            return value

        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return default

        return default
