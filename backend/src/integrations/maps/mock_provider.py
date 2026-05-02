from src.utils.geo import haversine_miles


METERS_PER_MILE = 1609.344
SECONDS_PER_MILE = {
    "walking": 1200,
    "bicycling": 360,
    "driving": 180,
}


class MockMapRoutingProvider:
    provider_name = "mock"

    def get_route(self, origin, destination, mode):
        distance_miles = haversine_miles(origin, destination)
        distance_meters = round(distance_miles * METERS_PER_MILE)
        duration_seconds = max(60, round(distance_miles * SECONDS_PER_MILE[mode]))

        return {
            "provider": self.provider_name,
            "mode": mode,
            "origin": origin,
            "destination": destination,
            "distance": {
                "meters": distance_meters,
                "miles": round(distance_miles, 2),
            },
            "duration": {
                "seconds": duration_seconds,
                "text": self._format_duration(duration_seconds),
            },
            "directions": [
                {
                    "step": 1,
                    "instruction": f"Start at {origin.get('label', 'origin')}.",
                    "distance_meters": 0,
                },
                {
                    "step": 2,
                    "instruction": (
                        f"Travel toward {destination.get('label', 'destination')} "
                        "using the mock campus route."
                    ),
                    "distance_meters": distance_meters,
                },
                {
                    "step": 3,
                    "instruction": f"Arrive at {destination.get('label', 'destination')}.",
                    "distance_meters": 0,
                },
            ],
            "tolls": {
                "available": False,
                "estimated_cost": None,
                "currency": "USD",
                "source": "not_available_from_mock_provider",
            },
        }

    def _format_duration(self, seconds):
        minutes = max(1, round(seconds / 60))
        return f"{minutes} min"
