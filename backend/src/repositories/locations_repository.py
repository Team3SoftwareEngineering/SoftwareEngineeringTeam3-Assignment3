from src.repositories.database import fetch_all, fetch_one


class LocationRepository:
    def list_locations(self, name=None):
        # The schema stores campus location records in campus_locations.
        query = """
            SELECT location_uuid, name, address, latitude, longitude, description
            FROM campus_locations
        """
        params = []

        if name:
            query += " WHERE LOWER(name) LIKE LOWER(%s)"
            params.append(f"%{name}%")

        query += " ORDER BY name ASC"
        return [self._to_location(row) for row in fetch_all(query, tuple(params))]

    def find_by_id(self, location_id):
        row = fetch_one(
            """
            SELECT location_uuid, name, address, latitude, longitude, description
            FROM campus_locations
            WHERE location_uuid = %s
            """,
            (location_id,),
        )
        return self._to_location(row) if row else None

    def _to_location(self, row):
        return {
            "id": row["location_uuid"],
            "name": row["name"],
            "campus": self._extract_campus_name(row["address"]),
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "description": row["description"],
            "address": row["address"],
        }

    def _extract_campus_name(self, address):
        if not address:
            return "Unknown"

        parts = [part.strip() for part in address.split(",") if part.strip()]
        if len(parts) >= 2:
            return parts[1]
        return parts[0]
