from contextlib import contextmanager
from datetime import date, datetime
from decimal import Decimal

import mysql.connector

from src.config.env import Config


@contextmanager
def get_connection():
    connection = mysql.connector.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        database=Config.DB_NAME,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
    )
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
