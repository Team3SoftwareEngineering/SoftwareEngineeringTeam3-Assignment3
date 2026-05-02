from math import atan2, cos, radians, sin, sqrt


EARTH_RADIUS_MILES = 3958.8


def haversine_miles(origin, destination):
    # Haversine is accurate enough for ranking nearby campus lots by straight-line distance.
    lat1 = radians(float(origin["latitude"]))
    lon1 = radians(float(origin["longitude"]))
    lat2 = radians(float(destination["latitude"]))
    lon2 = radians(float(destination["longitude"]))

    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1

    a = sin(delta_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(delta_lon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return EARTH_RADIUS_MILES * c


def has_coordinates(value):
    return value.get("latitude") is not None and value.get("longitude") is not None
