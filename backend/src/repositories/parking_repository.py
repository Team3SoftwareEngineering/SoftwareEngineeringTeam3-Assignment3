from src.repositories.database import fetch_all


class ParkingRepository:
    def list_parking_lots(self, campus=None, permit_type=None):
        # Repository filters mirror current schema columns only; availability is not modeled.
        query = """
            SELECT
              p.parking_uuid,
              p.name,
              p.capacity,
              p.lot_type,
              c.latitude,
              c.longitude,
              c.address,
              c.location_uuid
            FROM parking_lots p
            JOIN campus_locations c ON c.location_uuid = p.location_uuid
        """
        conditions = []
        params = []

        if campus:
            conditions.append("LOWER(c.address) LIKE LOWER(%s)")
            params.append(f"%{campus}%")

        if permit_type:
            conditions.append("LOWER(p.lot_type) = LOWER(%s)")
            params.append(permit_type)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY p.name ASC"
        return [self._to_parking_lot(row) for row in fetch_all(query, tuple(params))]

    def _to_parking_lot(self, row):
        return {
            "id": row["parking_uuid"],
            "name": row["name"],
            "campus": self._extract_campus_name(row.get("address")),
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "permit_type": row["lot_type"],
            "capacity": row["capacity"],
            "location_id": row["location_uuid"],
        }

    def _extract_campus_name(self, address):
        if not address:
            return "Unknown"

        parts = [part.strip() for part in address.split(",") if part.strip()]
        if len(parts) >= 2:
            return parts[1]
        return parts[0]
