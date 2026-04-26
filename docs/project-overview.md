# Project Overview: PNW Hammond Campus Map MVP

## Project Title
PNW Hammond Campus Map MVP

## Project Purpose
Build a modern, interactive campus map prototype that is credible for classroom demos, portfolio review, and software engineering evaluation.

## Problem Being Solved
Legacy campus map interfaces are often difficult to scan, visually dated, and weak on mobile usability. This prototype improves discoverability and interaction clarity for users trying to find campus locations and services quickly.

## Why This Prototype Exists
- Demonstrate a maintainable front-end architecture for map-driven products
- Validate core UX flows before deeper GIS/backend investment
- Provide a polished Hammond-campus demo baseline for future expansion

## Target Users
- Current students
- Prospective students and families
- Campus visitors
- Staff/faculty needing quick location lookup

## Scope (Hammond Only)
- This repository implements **Hammond campus only**
- Westville is intentionally out of scope for this MVP

## Key Features
- Interactive 2D map with zoom/pan
- Search with result selection and map focus
- Category/layer filtering
- Clickable map features (points and polygons)
- Feature details card with metadata and accessibility notes (when present)
- Responsive desktop + mobile control experiences

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS (token-driven visual system)
- React Leaflet + Leaflet
- Zustand state management
- Fuse.js fuzzy search
- Vitest + Testing Library

## Architecture Summary
- `src/data/hammond`: typed local demo dataset and category config
- `src/state`: centralized UI/map interaction state
- `src/components`: feature-oriented UI components (header, sidebar, map, details)
- `src/utils`: filtering/search/map helper logic
- `tests`: search/filter/selection behavior coverage

## Run Locally
```bash
npm install
npm run dev
```

## Interaction Summary
1. Open app shell and map.
2. Search or toggle categories.
3. Select result or click map feature.
4. Map focuses selected feature and details panel updates.
5. Reset view as needed.

## Placeholder/Demo Data Disclaimer
This project uses placeholder/demo map data unless explicitly verified from official sources. Location names, coordinates, and descriptions are included for prototype behavior and presentation, not as authoritative campus records.

## Current Limitations
- No official GIS backend connection
- No live parking availability
- No route planning

## Future Improvements
- Integrate official campus datasets
- Add navigation/pathfinding and richer accessibility layers
- Add visual regression and end-to-end interaction testing
