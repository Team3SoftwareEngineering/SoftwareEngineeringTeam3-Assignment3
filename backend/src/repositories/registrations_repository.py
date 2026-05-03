import mysql.connector

from src.repositories.database import execute_insert, fetch_one
from src.repositories.errors import DuplicateRecordError


class RegistrationRepository:
    def create(self, student_id, event_id):
        try:
            # Insert is intentionally small; validation and existence checks live in services.
            registration_id = execute_insert(
                """
                INSERT INTO registrations (student_id, event_id)
                VALUES (%s, %s)
                """,
                (student_id, event_id),
            )
        except mysql.connector.IntegrityError as error:
            if error.errno == mysql.connector.errorcode.ER_DUP_ENTRY:
                raise DuplicateRecordError("Duplicate event registration") from error
            raise

        return self.find_by_id(registration_id)

    def find_by_id(self, registration_id):
        return fetch_one(
            """
            SELECT id, student_id, event_id, registered_at
            FROM registrations
            WHERE id = %s
            """,
            (registration_id,),
        )
