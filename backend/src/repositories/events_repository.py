from src.repositories.database import fetch_all, fetch_one


class EventRepository:
    def list_events(self, name=None, event_date=None):
        query = """
            SELECT
              e.id,
              e.title,
              e.starts_at,
              e.ends_at,
              e.description,
              b.id AS location_id,
              b.name AS location_name,
              b.campus AS location_campus,
              b.latitude AS location_latitude,
              b.longitude AS location_longitude
            FROM events e
            LEFT JOIN buildings b ON b.id = e.building_id
        """
        conditions = []
        params = []

        if name:
            conditions.append("LOWER(e.title) LIKE LOWER(%s)")
            params.append(f"%{name}%")

        if event_date:
            conditions.append("DATE(e.starts_at) = %s")
            params.append(event_date.isoformat())

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY e.starts_at ASC, e.title ASC"
        return [self._to_event(row) for row in fetch_all(query, tuple(params))]

    def find_by_id(self, event_id):
        row = fetch_one(
            """
            SELECT
              e.id,
              e.title,
              e.starts_at,
              e.ends_at,
              e.description,
              b.id AS location_id,
              b.name AS location_name,
              b.campus AS location_campus,
              b.latitude AS location_latitude,
              b.longitude AS location_longitude
            FROM events e
            LEFT JOIN buildings b ON b.id = e.building_id
            WHERE e.id = %s
            """,
            (event_id,),
        )
        return self._to_event(row) if row else None

    def _to_event(self, row):
        location = None
        if row.get("location_id") is not None:
            location = {
                "id": row["location_id"],
                "name": row["location_name"],
                "campus": row["location_campus"],
                "latitude": row["location_latitude"],
                "longitude": row["location_longitude"],
            }

        return {
            "id": row["id"],
            "title": row["title"],
            "starts_at": row["starts_at"],
            "ends_at": row["ends_at"],
            "description": row["description"],
            "location": location,
        }
