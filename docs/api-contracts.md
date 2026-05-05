# API Contracts

Base URL: `/api`

Standard success response shape:

```json
{
  "data": []
}
```

Standard error response shape:

```json
{
  "error": "Human-readable error"
}
```

## Health

`GET /api/health`

Returns backend status.

## Events

`GET /api/events`

Returns campus events sorted by start date.

`GET /api/events/:event_id`

Returns one event by ID.

`POST /api/events/:event_id/registrations`

Registers a student for an event. Duplicate registrations should return an error response.

## Locations

`GET /api/locations`

Returns campus location records.

`GET /api/locations/:location_id/parking`

Returns parking lots related to a campus location.

## Map Features

`GET /api/map-features`

Returns campus map feature records for frontend map layers.

## Parking

`GET /api/parking-lots`

Returns parking lot records.

## Resources

`GET /api/resources`

Returns official campus resource links.

`GET /api/resources/:slug`

Returns one resource by slug or `404`.

## Routing

`POST /api/routes`

Calculates a route between an origin and destination.

## Campus Assistant

`POST /api/chat/query`

Classifies a user query and returns route metadata used by the frontend assistant response cards.
