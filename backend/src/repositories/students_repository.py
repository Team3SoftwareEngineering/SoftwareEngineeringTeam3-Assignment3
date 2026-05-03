from src.repositories.database import fetch_one


class StudentRepository:
    def exists(self, student_id):
        # Registration requires a real student row; this avoids creating users implicitly.
        row = fetch_one("SELECT id FROM students WHERE id = %s", (student_id,))
        return row is not None
