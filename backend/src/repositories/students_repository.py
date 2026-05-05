from src.repositories.database import fetch_one


class StudentRepository:
    def exists(self, student_id):
        # Registration requires a real student row; this avoids creating users implicitly.
        row = fetch_one("SELECT student_uuid FROM students WHERE student_id = %s", (student_id,))
        return row is not None

    def find_by_student_id(self, student_id):
        return fetch_one(
            """
            SELECT student_uuid, student_id, first_name, last_name
            FROM students
            WHERE student_id = %s
            """,
            (student_id,),
        )
