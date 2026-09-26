# Tiny Digital Architecture

An experimental procedural architecture generator built with React, TypeScript, and the HTML Canvas API.

The project generates small isometric architectural compositions from a seed. I'm building it as an exploration of procedural generation, geometry, color, and generative visual design.

> **Status:** Work in progress. The core generation system is functional, but I'm still developing the visual system and expanding the generator.

## Current Features

- Seeded, deterministic scene generation
- Isometric rendering with the Canvas API
- Multiple procedural structure types:
  - Cubes
  - Columns
  - Walls
  - Staircases
  - Arches
- Configurable grid size, density, height variation, and complexity
- Collision-aware structure placement
- Depth sorting for correct isometric rendering
- Seed-derived color palettes with independent palette shuffling
- URL-synced generation parameters for reproducible/shareable compositions
- Responsive, device-pixel-ratio-aware canvas rendering
- PNG export
- Unit tests for core generation utilities

## In Progress

The project is still evolving. Current areas I'm working on include:

- Expanding the procedural structure system
- Improving composition and generation rules
- Refining palettes, lighting, and visual style
- Improving the controls and overall UI
- Adding more tests as the generation system grows

## Tech

- React
- TypeScript
- Vite
- HTML Canvas API
- Vitest

## Running Locally

Requires Node.js 20.

```bash
git clone https://github.com/parisacodes/tiny-digital-architecture-generator.git
cd tiny-digital-architecture-generator
npm install
npm run dev
```
