import mysql.connector
from uuid import uuid4

from src.repositories.database import execute_insert, fetch_one
from src.repositories.errors import DuplicateRecordError


class RegistrationRepository:
    def create(self, student_uuid, event_uuid):
        registration_uuid = str(uuid4())
        try:
            # Insert is intentionally small; validation and existence checks live in services.
            execute_insert(
                """
                INSERT INTO registrations (
                    registration_uuid,
                    student_uuid,
                    event_uuid,
                    registered_at
                )
                VALUES (%s, %s, %s, NOW())
                """,
                (registration_uuid, student_uuid, event_uuid),
            )
        except mysql.connector.IntegrityError as error:
            if error.errno == mysql.connector.errorcode.ER_DUP_ENTRY:
                raise DuplicateRecordError("Duplicate event registration") from error
            raise

        return self.find_by_id(registration_uuid)

    def find_by_id(self, registration_id):
        return fetch_one(
            """
            SELECT
              r.registration_uuid AS id,
              r.event_uuid AS event_id,
              s.student_id,
              r.registered_at
            FROM registrations r
            JOIN students s ON s.student_uuid = r.student_uuid
            WHERE r.registration_uuid = %s
            """,
            (registration_id,),
        )
