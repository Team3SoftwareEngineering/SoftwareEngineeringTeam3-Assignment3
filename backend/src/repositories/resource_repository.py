from src.repositories.database import fetch_all, fetch_one


class ResourceRepository:
    def list_resources(self):
        # Resource links come from MySQL so directory and chat features stay consistent.
        rows = fetch_all(
            """
            SELECT
              r.resource_uuid AS slug,
              COALESCE(e.name, 'Campus Resource') AS label,
              'events' AS category,
              r.url AS official_url,
              r.description
            FROM resource_links r
            LEFT JOIN events e ON e.event_uuid = r.event_uuid
            ORDER BY label ASC
            """
        )
        return [self._to_resource(row) for row in rows]

    def find_by_slug(self, slug):
        row = fetch_one(
            """
            SELECT
              r.resource_uuid AS slug,
              COALESCE(e.name, 'Campus Resource') AS label,
              'events' AS category,
              r.url AS official_url,
              r.description
            FROM resource_links r
            LEFT JOIN events e ON e.event_uuid = r.event_uuid
            WHERE r.resource_uuid = %s
            """,
            (slug,),
        )
        return self._to_resource(row) if row else None

    def _to_resource(self, row):
        return {
            "slug": row["slug"],
            "label": row["label"],
            "category": row["category"],
            "url": row["official_url"],
            "description": row["description"],
        }
