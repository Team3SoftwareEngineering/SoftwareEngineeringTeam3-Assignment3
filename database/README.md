# Student Life Database

## Overview
Database Name: student_life_db
Database Type: MySQL (Using Docker)
Primary Key Format: UUID stored as CHAR(36)

Notes:
Seed data file should be named 02_seed.sql and be placed in init/
Precision variable in the addresses table has been changed to address_precision

--- 

## Structure

```text
database/
│
├── docker-compose.yml
│
└── init/
    ├── 01_schema.sql
    └── 02_seed.sql
```

> Note: Only files inside `init/` are automatically executed by Docker during initialization.

---

## File Descriptions

* `01_schema.sql` → creates database and tables
* `02_seed.sql` → inserts sample data
* `docker-compose.yml` → runs MySQL container
* `init/` → automatically initializes the database on first run

---

## Initialization Order

Docker executes SQL files in alphabetical order:

```
01_schema.sql → runs first (creates tables)
02_seed.sql   → runs second (inserts data)
```

If this order is incorrect, the database will fail to initialize.

---

## Setup Instructions (Terminal)

### 1. Navigate to database folder

```bash
cd path/to/repository/database

```

---

### 2. Start the database (clean setup)

```bash
docker compose down -v
docker compose up -d

```

This ensures:

* a fresh database
* initialization scripts are executed

---

### 3. Connect to the database (CLI)

```bash

mysql -h 127.0.0.1 -P 3308 -u root -p
```

Password:

```

password
```

---

## Event List (Ascending Order)

Query:
SELECT 
    event_uuid,
    name,
    description,
    event_date,
    cost,
    location_uuid
FROM events
ORDER BY event_date ASC;

Expected Columns:
event_uuid (UUID)
name (STRING)
description (STRING, nullable)
event_date (DATETIME)
cost (FLOAT)
location_uuid (UUID)

---

## Registered Students by Event

SELECT 
    s.student_uuid,
    s.student_id,
    s.first_name,
    s.last_name
FROM registrations r
JOIN students s ON r.student_uuid = s.student_uuid
WHERE r.event_uuid = ?;

Parameters:
event_uuid (UUID)

Expected Columns:
student_uuid (UUID)
student_id (INT)
first_name (STRING)
last_name (STRING)

---

## Parking Lot Lookup

Query (by location):
SELECT 
    parking_uuid,
    name,
    capacity,
    lot_type
FROM parking_lots
WHERE location_uuid = ?;

Query (by event):
SELECT 
    p.parking_uuid,
    p.name,
    p.capacity,
    p.lot_type
FROM events e
JOIN parking_lots p ON e.location_uuid = p.location_uuid
WHERE e.event_uuid = ?;

Parameters:
location_uuid (UUID)
event_uuid (UUID)

Expected Columns:
parking_uuid (UUID)
name (STRING)
capacity (INT)
lot_type (STRING)

---

## Building / Location Lookup

Query:
SELECT 
    location_uuid,
    name,
    description,
    address,
    latitude,
    longitude,
    place_id
FROM campus_locations
WHERE location_uuid = ?;

Parameters:
location_uuid (UUID)

Expected Columns:
location_uuid (UUID)
name (STRING)
description (STRING, nullable)
address (STRING)
latitude (FLOAT)
longitude (FLOAT)
place_id (STRING)

