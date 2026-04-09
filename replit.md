# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

V1V Creative Studio website — a cinematic, full-screen immersive website for a creative digital studio (v1v.in). Features a Three.js 3D WebGL background with procedurally generated models, GSAP ScrollTrigger + Lenis smooth scrolling, Pointer Events gesture support, and a password-protected admin panel.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Data persistence**: JSON file store (no database)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React 19, Vite, Three.js, @react-three/fiber, @react-three/postprocessing, Framer Motion, GSAP + ScrollTrigger, Lenis, TailwindCSS 4
- **Routing**: wouter

## Artifacts

- **API Server** (`artifacts/api-server`): Express API with JSON file persistence. Routes: `/api/auth/login`, `/api/auth/verify`, `/api/projects`, `/api/projects/:id`, `/api/settings`. Admin password: `v1vadmin123`.
- **V1V Website** (`artifacts/v1v-website`): Main frontend at `/`. Features hero with 3D canvas, about section, projects grid, lab section, contact form. Admin panel at `/admin`.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Architecture

### Frontend Structure
- `pages/Home.tsx` — Main page with fixed 3D canvas + scrolling HTML overlay. Wires scrollProgress (0-1) from Lenis scroll into Scene.tsx. GSAP ScrollTrigger animates section reveals. Pointer Events gesture layer handles swipe-to-scroll and pinch-to-navigate.
- `pages/Admin.tsx` — Password-protected admin dashboard (projects CRUD, settings)
- `components/LoadingScreen.tsx` — Animated loading screen with canvas-drawn 3D progress ring, percentage counter, and fade-out transition
- `components/canvas/Scene.tsx` — Three.js R3F canvas with post-processing (bloom, chromatic aberration, glitch, vignette), CanvasErrorBoundary, WebGL fallback
- `components/canvas/ScrollScene.tsx` — Main 3D composition orchestrated by scrollProgress (replaces old HeroScene.tsx). Contains glass torus, ribbon sculpture, particles with scroll-driven transitions.
- `components/canvas/HexTunnel.tsx` — Procedural hex tunnel geometry (appears in middle scroll range)
- `components/canvas/CrystalSpine.tsx` — Crystal spine backbone with icosahedra
- `components/canvas/CageTransition.tsx` — Industrial cage transition effect
- `components/canvas/GlassTorusLogo.tsx` — Procedural glass torus ring
- `components/canvas/RibbonSculpture.tsx` — Lemniscate wire sculpture
- `components/canvas/ParticleField.tsx` — Animated particle system (6000 desktop / 2000 mobile)
- `components/UIOverlay.tsx` — All HTML sections (hero, about, work, lab, contact) with data-gsap-section attributes
- `components/Navigation.tsx` — Fixed nav with fullscreen overlay menu
- `components/ProjectModal.tsx` — Project detail modal
- `components/CustomCursor.tsx` — Neon dot + ring cursor (hidden on touch)

### API Structure
- `store.ts` — JSON file persistence at `data/v1v-data.json` with seed data (5 projects)
- `auth.ts` — Login/verify with in-memory token set
- `projects.ts` — Full CRUD for projects
- `settings.ts` — Get/update site settings
