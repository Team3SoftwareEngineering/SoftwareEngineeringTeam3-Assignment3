# Database

MySQL workspace for schema, starter seed data, and database documentation.

## Owned By

Database team owns files in `schema/`, `seed/`, and `docs/`.

## Local Docker Initialization

The root `docker-compose.yml` mounts:

- `database/schema` into MySQL initialization
- `database/seed` into MySQL initialization

Files run when the MySQL volume is first created. If you change schema files after the first run, recreate the Docker volume or apply a migration manually.

