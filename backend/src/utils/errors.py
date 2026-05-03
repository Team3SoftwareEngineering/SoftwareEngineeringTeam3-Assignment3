from flask import jsonify
from werkzeug.exceptions import HTTPException


class ApiError(Exception):
    status_code = 500

    def __init__(self, message):
        super().__init__(message)
        self.message = message


class BadRequestError(ApiError):
    status_code = 400


class NotFoundError(ApiError):
    status_code = 404


class ConflictError(ApiError):
    status_code = 409


def register_error_handlers(app):
    # Central handlers keep every endpoint on the same JSON error contract.
    @app.errorhandler(ApiError)
    def handle_api_error(error):
        return jsonify({"error": error.message}), error.status_code

    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        return jsonify({"error": error.description}), error.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        app.logger.exception("Unexpected backend error", exc_info=error)
        return jsonify({"error": "Internal server error"}), 500
