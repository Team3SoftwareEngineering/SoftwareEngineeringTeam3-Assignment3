from src.repositories.errors import DuplicateRecordError
from src.repositories.events_repository import EventRepository
from src.repositories.registrations_repository import RegistrationRepository
from src.repositories.students_repository import StudentRepository
from src.utils.errors import ConflictError, NotFoundError


class RegistrationService:
    def __init__(
        self,
        student_repository=None,
        event_repository=None,
        registration_repository=None,
    ):
        self.student_repository = student_repository or StudentRepository()
        self.event_repository = event_repository or EventRepository()
        self.registration_repository = registration_repository or RegistrationRepository()

    def register_student_for_event(self, event_id, student_id):
        # Check existence up front so API callers get specific 404s instead of DB errors.
        event = self.event_repository.find_by_id(event_id)
        if event is None:
            raise NotFoundError("Event not found")

        student = self.student_repository.find_by_student_id(student_id)
        if student is None:
            raise NotFoundError("Student not found")

        try:
            # The unique DB constraint is still the source of truth for duplicate safety.
            registration = self.registration_repository.create(
                student_uuid=student["student_uuid"],
                event_uuid=event_id,
            )
        except DuplicateRecordError as error:
            raise ConflictError("Student is already registered for this event") from error

        return registration
