from src.app import create_app


def test_health_endpoint():
    app = create_app()

    with app.test_client() as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}

