# Frontend

React + TypeScript + Vite frontend for the PNW Hammond Campus Map application.

## Purpose

The frontend provides the user-facing experience for campus wayfinding, event discovery, department resources, route planning, and campus assistant workflows.

## Key Features

- Interactive Hammond campus map with points, polygons, category filters, and feature details.
- Campus feature search using Fuse.js and stored Hammond campus feature data.
- Route planner with destination prefill from map features and event detail pages.
- Events page with event search, event details, registration counts, and duplicate-registration protection.
- Department hub with backend resource links and local fallback resources.
- Campus assistant page for events, parking, locations, registrations, and resources.
- Responsive desktop sidebar, collapsible panels, mobile sheet controls, and draggable navigation widget where appropriate.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Leaflet and Leaflet
- Zustand
- Fuse.js
- Vitest and Testing Library

## Run Locally

From the repository root:

```bash
npm install
npm run dev
```

Or from this folder:

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` by default.

## Environment

The frontend reads the backend API URL from:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

The variable can be set in the root `.env` file or in a frontend deployment environment.

## Validation

```bash
npm run lint
npm run test
npm run build
```

## Source Structure

```text
src/
├── app/             Application shell and top-level view switching
├── components/      Shared UI, map, sidebar, details, and controls
├── data/            Hammond campus data and assistant prompt metadata
├── features/        Feature-area documentation
├── models/          TypeScript domain models
├── pages/           Auth, events, and campus assistant pages
├── services/        API clients and frontend business logic
├── state/           Zustand state stores
├── styles/          Global CSS and design tokens
├── test/            Test setup
├── types/           Local type declarations
└── utils/           Search, filter, and map helpers
```

## Backend Integration

The frontend integrates with these backend areas:

- `GET /api/events`
- `GET /api/resources`
- `GET /api/map-features`
- `POST /api/events/:event_id/registrations`
- `POST /api/routes`
- `POST /api/chat/query`

Selected UI areas also include curated local fallback data so the application remains usable during local development if the backend is unavailable.
