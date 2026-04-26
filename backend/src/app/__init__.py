from flask import Flask
from flask_cors import CORS

from src.routes import api_blueprint


def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    app.register_blueprint(api_blueprint, url_prefix="/api")

    return app

