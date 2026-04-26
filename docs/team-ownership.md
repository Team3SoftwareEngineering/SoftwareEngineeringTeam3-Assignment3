# Team Ownership

## Frontend Team

Works only inside `frontend/` for UI, pages, components, styles, frontend service calls, frontend tests, and static assets.

Example tasks:
- Build landing, map, and directory chat screens
- Add reusable components and hooks
- Connect UI to backend API contracts through `frontend/src/services`
- Maintain React/Vite frontend tests

## Backend Team

Works only inside `backend/` for APIs, controllers, services, integrations, server-side models, schemas, and backend tests.

Example tasks:
- Add API endpoints for locations, events, parking, resources, and registrations
- Implement resource lookup and redirect behavior
- Add map/routing API integration adapters
- Connect backend services to MySQL

## Database Team

Works only inside `database/` for schema files, seed files, database docs, and ERD/table documentation.

Example tasks:
- Maintain MySQL schema and seed data
- Document tables and relationships
- Coordinate database changes with backend API contracts

## QA Team

Works across testing documentation, PR validation, test cases, and verification steps. QA should avoid owning product code unless a test or fixture change requires it.

Example tasks:
- Define manual and automated test cases
- Validate Docker/local setup steps
- Review PRs against acceptance criteria
- Track defects and regression risks

## DevOps / Project Management Team

Owns root config, Docker, docs, repo structure, onboarding docs, and workflow standards.

Example tasks:
- Maintain `docker-compose.yml`, Dockerfiles, and `.env.example`
- Keep onboarding and local development docs current
- Coordinate team boundaries and PR standards
- Maintain root scripts in `scripts/`

