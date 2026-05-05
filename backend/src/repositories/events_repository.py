from src.repositories.database import fetch_all, fetch_one


class EventRepository:
    def list_events(self, name=None, event_date=None):
        # Join campus locations and registration counts so the frontend can render one payload.
        query = """
            SELECT
              e.event_uuid,
              e.name,
              e.event_date,
              e.description,
              e.cost,
              c.location_uuid AS location_id,
              c.name AS location_name,
              c.latitude AS location_latitude,
              c.longitude AS location_longitude,
              c.address AS location_address,
              COUNT(r.registration_uuid) AS registration_count
            FROM events e
            LEFT JOIN campus_locations c ON c.location_uuid = e.location_uuid
            LEFT JOIN registrations r ON r.event_uuid = e.event_uuid
        """
        conditions = []
        params = []

        if name:
            conditions.append("LOWER(e.name) LIKE LOWER(%s)")
            params.append(f"%{name}%")

        if event_date:
            conditions.append("DATE(e.event_date) = %s")
            params.append(event_date.isoformat())

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += """
            GROUP BY
              e.event_uuid,
              e.name,
              e.event_date,
              e.description,
              e.cost,
              c.location_uuid,
              c.name,
              c.latitude,
              c.longitude,
              c.address
            ORDER BY e.event_date ASC, e.name ASC
        """
        return [self._to_event(row) for row in fetch_all(query, tuple(params))]

    def find_by_id(self, event_id):
        # Detail lookup uses the same projection as list responses for consistency.
        row = fetch_one(
            """
            SELECT
              e.event_uuid,
              e.name,
              e.event_date,
              e.description,
              e.cost,
              c.location_uuid AS location_id,
              c.name AS location_name,
              c.latitude AS location_latitude,
              c.longitude AS location_longitude,
              c.address AS location_address,
              COUNT(r.registration_uuid) AS registration_count
            FROM events e
            LEFT JOIN campus_locations c ON c.location_uuid = e.location_uuid
            LEFT JOIN registrations r ON r.event_uuid = e.event_uuid
            WHERE e.event_uuid = %s
            GROUP BY
              e.event_uuid,
              e.name,
              e.event_date,
              e.description,
              e.cost,
              c.location_uuid,
              c.name,
              c.latitude,
              c.longitude,
              c.address
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
                "campus": self._extract_campus_name(row.get("location_address")),
                "latitude": row["location_latitude"],
                "longitude": row["location_longitude"],
                "address": row.get("location_address"),
            }

        return {
            "id": row["event_uuid"],
            "title": row["name"],
            "starts_at": row["event_date"],
            "ends_at": None,
            "description": row["description"],
            "cost": row["cost"],
            "registration_count": int(row["registration_count"] or 0),
            "location": location,
        }

    def _extract_campus_name(self, address):
        if not address:
            return "Unknown"

        parts = [part.strip() for part in address.split(",") if part.strip()]
        if len(parts) >= 2:
            return parts[1]
        return parts[0]
