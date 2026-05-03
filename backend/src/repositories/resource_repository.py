from src.repositories.database import fetch_all, fetch_one


class ResourceRepository:
    def list_resources(self):
        # Resource links come from MySQL so directory and chat features stay consistent.
        rows = fetch_all(
            """
            SELECT slug, label, category, official_url
            FROM resource_links
            ORDER BY category ASC, label ASC
            """
        )
        return [self._to_resource(row) for row in rows]

    def find_by_slug(self, slug):
        row = fetch_one(
            """
            SELECT slug, label, category, official_url
            FROM resource_links
            WHERE slug = %s
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
        }
