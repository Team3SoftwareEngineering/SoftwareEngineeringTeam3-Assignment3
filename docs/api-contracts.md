# API Contracts

Base URL: `/api`

Responses should use this shape unless a route has a documented exception:

```json
{
  "data": []
}
```

Errors should use:

```json
{
  "error": "Human-readable error"
}
```

## Health

`GET /api/health`

Returns backend status.

## Locations

`GET /api/locations`

Expected future data:
- buildings
- campus map points
- parking lots
- accessibility metadata

## Events

`GET /api/events`

Expected future data:
- student-life events
- event location references
- event registration availability

## Resources

`GET /api/resources`

Returns official school resource links for directory/chat lookup.

`GET /api/resources/:slug`

Returns one resource by slug or `404`.

## Future Contracts

TODO:
- `POST /api/registrations`
- `GET /api/parking`
- `GET /api/routes`
- directory chat request/response contract

