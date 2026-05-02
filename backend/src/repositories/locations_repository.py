from src.repositories.database import fetch_all, fetch_one


class LocationRepository:
    def list_locations(self, name=None):
        query = """
            SELECT id, name, campus, latitude, longitude, description
            FROM buildings
        """
        params = []

        if name:
            query += " WHERE LOWER(name) LIKE LOWER(%s)"
            params.append(f"%{name}%")

        query += " ORDER BY campus ASC, name ASC"
        return [self._to_location(row) for row in fetch_all(query, tuple(params))]

    def find_by_id(self, location_id):
        row = fetch_one(
            """
            SELECT id, name, campus, latitude, longitude, description
            FROM buildings
            WHERE id = %s
            """,
            (location_id,),
        )
        return self._to_location(row) if row else None

    def _to_location(self, row):
        return {
            "id": row["id"],
            "name": row["name"],
            "campus": row["campus"],
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "description": row["description"],
        }
