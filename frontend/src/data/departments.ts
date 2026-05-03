import type { DepartmentResource } from '../models/event'

export const departmentResources: DepartmentResource[] = [
  {
    resourceId: 'student-life',
    title: 'Student Life',
    category: 'Campus involvement',
    description:
      'Find student organizations, campus activities, leadership opportunities, and student engagement resources.',
    url: 'https://www.pnw.edu/student-life/',
    cta: 'Explore student life',
  },
  {
    resourceId: 'career-center',
    title: 'Career Center',
    category: 'Jobs and internships',
    description:
      'Get help with resumes, interviews, job searches, internships, and professional development.',
    url: 'https://www.pnw.edu/career-center/',
    cta: 'Visit career center',
  },
  {
    resourceId: 'financial-aid',
    title: 'Financial Aid',
    category: 'Tuition support',
    description:
      'Learn about FAFSA, scholarships, grants, loans, and student financial support options.',
    url: 'https://www.pnw.edu/financial-aid/',
    cta: 'View financial aid',
  },
  {
    resourceId: 'registrar',
    title: 'Registrar',
    category: 'Enrollment records',
    description:
      'Access registration, transcripts, enrollment verification, academic calendars, and student records information.',
    url: 'https://www.pnw.edu/registrar/',
    cta: 'Go to registrar',
  },
  {
    resourceId: 'housing',
    title: 'Housing',
    category: 'Campus living',
    description:
      'Find information about residence halls, housing applications, room assignments, and campus living.',
    url: 'https://www.pnw.edu/housing/',
    cta: 'View housing info',
  },
  {
    resourceId: 'dining',
    title: 'Dining',
    category: 'Food and meal options',
    description:
      'Find campus dining locations, meal options, hours, and student food resources.',
    url: 'https://www.pnw.edu/dining/',
    cta: 'View dining options',
  },
]