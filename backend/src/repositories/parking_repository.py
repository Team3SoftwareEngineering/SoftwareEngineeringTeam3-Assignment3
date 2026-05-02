from src.repositories.database import fetch_all


class ParkingRepository:
    def list_parking_lots(self, campus=None, permit_type=None):
        # Repository filters mirror current schema columns only; availability is not modeled.
        query = """
            SELECT id, name, campus, latitude, longitude, permit_type
            FROM parking_lots
        """
        conditions = []
        params = []

        if campus:
            conditions.append("LOWER(campus) = LOWER(%s)")
            params.append(campus)

        if permit_type:
            conditions.append("LOWER(permit_type) = LOWER(%s)")
            params.append(permit_type)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY campus ASC, name ASC"
        return [self._to_parking_lot(row) for row in fetch_all(query, tuple(params))]

    def _to_parking_lot(self, row):
        return {
            "id": row["id"],
            "name": row["name"],
            "campus": row["campus"],
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "permit_type": row["permit_type"],
        }
