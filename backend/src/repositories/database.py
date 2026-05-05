from contextlib import contextmanager
from datetime import date, datetime
from decimal import Decimal
import os
import mysql.connector

from src.utils.errors import ServiceUnavailableError


@contextmanager
def get_connection():
    db_host = os.getenv("DB_HOST")
    db_port = int(os.getenv("DB_PORT", "3306"))
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_name = os.getenv("DB_NAME")

    try:
        connection = mysql.connector.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            database=db_name,
        )
    except mysql.connector.Error as error:
        message = (
            f"Database connection failed to {db_host}:{db_port}. "
            "Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME."
        )
        raise ServiceUnavailableError(message) from error

    try:
        yield connection
    finally:
        connection.close()


def fetch_all(query, params=None):
    with get_connection() as connection:
        cursor = connection.cursor(dictionary=True)
        try:
            cursor.execute(query, params or ())
            return [_serialize_row(row) for row in cursor.fetchall()]
        finally:
            cursor.close()


def fetch_one(query, params=None):
    rows = fetch_all(query, params)
    return rows[0] if rows else None


def execute_insert(query, params=None):
    with get_connection() as connection:
        cursor = connection.cursor()
        try:
            cursor.execute(query, params or ())
            connection.commit()
            return cursor.lastrowid
        except Exception:
            connection.rollback()
            raise
        finally:
            cursor.close()


def _serialize_row(row):
    return {key: _serialize_value(value) for key, value in row.items()}


def _serialize_value(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return value