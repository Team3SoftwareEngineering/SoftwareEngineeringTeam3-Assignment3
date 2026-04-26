RESOURCES = [
    {
        "slug": "advising",
        "label": "Academic Advising",
        "url": "https://www.pnw.edu/academic-advising/",
        "category": "student-support",
    },
    {
        "slug": "registrar",
        "label": "Registrar",
        "url": "https://www.pnw.edu/registrar/",
        "category": "student-support",
    },
]


def get_resources():
    return RESOURCES


def find_resource_by_slug(slug):
    return next((resource for resource in RESOURCES if resource["slug"] == slug), None)

