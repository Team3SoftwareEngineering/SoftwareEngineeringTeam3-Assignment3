from flask import Flask
from flask_cors import CORS

from src.routes import api_blueprint
from src.utils.errors import register_error_handlers


def create_app(config_overrides=None):
    app = Flask(__name__)
    if config_overrides:
        app.config.update(config_overrides)

    CORS(app)
    register_error_handlers(app)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    app.register_blueprint(api_blueprint, url_prefix="/api")

    return app

