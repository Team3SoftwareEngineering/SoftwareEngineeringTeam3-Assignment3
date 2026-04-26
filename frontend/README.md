# Frontend

React + TypeScript + Vite workspace for the Purdue Northwest campus map frontend.

## Owned By

Frontend team owns UI, pages, components, hooks, styles, assets, frontend services, and frontend tests in this folder.

## Purpose
This project demonstrates a production-style front-end MVP for campus wayfinding and location discovery. It preserves core map interactions (search, filters, click-to-details) while using clearly labeled placeholder/demo data for classroom and portfolio presentation.

## Scope
- Hammond campus only
- Westville intentionally excluded (future hook only)
- 2D interactive map experience (no 3D scope)

## Key Features
- Search campus buildings/features and focus the map on selection
- Category/layer filtering for ADA, parking, residence, emergency, community, campus life, and research
- Clickable points and polygons with contextual details card
- Responsive desktop sidebar + mobile control sheet
- Clearly visible placeholder/demo data labeling in UI

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS + tokenized design system
- React Leaflet + Leaflet
- Zustand for UI/map state
- Fuse.js for fuzzy search
- Vitest + Testing Library

## Local Development
```bash
npm install
npm run dev
```

The app defaults to `http://localhost:5173`.

## Validation Commands
```bash
npm run lint
npm run test
npm run build
```

## Project Structure
```text
src/
  app/
  components/
  features/
    home/
    map/
    directory-chat/
  pages/
  services/
  hooks/
  assets/
  data/hammond/
  models/
  state/
  styles/
  utils/
tests/
```

## Placeholder Data Disclaimer
All map features in this repository are placeholder/demo records unless explicitly verified from official sources. Coordinates, names, and descriptions are included to support prototype interactions and should not be treated as official campus GIS data.

## Current Limitations
- No live backend/GIS integration
- No route planning/navigation engine
- No real-time parking occupancy

## Future Improvements
- Integrate official campus datasets
- Add turn-by-turn routing and path accessibility overlays
- Add end-to-end UI regression tests
