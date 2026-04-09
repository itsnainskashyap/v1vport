# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

V1V Creative Studio website — a cinematic, full-screen immersive WebGL-first website for a creative digital studio (v1v.in). The entire experience is driven by a Three.js 3D canvas where scroll moves the camera through a continuous 3D world. HTML text overlays fade in/out based on camera position. Features a password-protected admin panel.

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
- **Frontend**: React 19, Vite, Three.js, @react-three/fiber, @react-three/postprocessing, Framer Motion, GSAP, Lenis, TailwindCSS 4
- **Routing**: wouter

## Artifacts

- **API Server** (`artifacts/api-server`): Express API with JSON file persistence. Routes: `/api/auth/login`, `/api/auth/verify`, `/api/projects`, `/api/projects/:id`, `/api/settings`. Admin password: `v1vadmin123`.
- **V1V Website** (`artifacts/v1v-website`): Main frontend at `/`. WebGL-first immersive 3D experience with scroll-driven camera. Admin panel at `/admin`.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Architecture

### Frontend Structure (Scroll-Driven 3D World)
- `pages/Home.tsx` — Full-screen canvas with virtual scroll height (600vh). Lenis smooth scroll drives scrollProgress (0→1). No normal HTML sections — camera travels through 3D space.
- `pages/Admin.tsx` — Password-protected admin dashboard (projects CRUD, settings, social links, theme colors)
- `components/canvas/Scene.tsx` — Three.js R3F canvas with post-processing (bloom, chromatic aberration, sporadic glitch, vignette). Camera FOV 55, far plane 200.
- `components/canvas/ScrollScene.tsx` — Camera-driven 3D orchestration. Camera travels z=8 → z=-75. Mouse parallax. 3D project cards with real texture maps. Shows/hides elements by scroll zones (hero→about→work→cage→lab).
- `components/canvas/GlassTorusLogo.tsx` — Iridescent glass torus with embedded V1V logo mark (ExtrudeGeometry)
- `components/canvas/RibbonSculpture.tsx` — Lemniscate wire sculpture (figure-8 TubeGeometry)
- `components/canvas/ParticleField.tsx` — 10,000 particles (3,000 mobile) with per-frame CPU animation, additive blending
- `components/canvas/CrystalSpine.tsx` — 24 icosahedron crystals + spine backbone at z=-32 zone
- `components/canvas/CageTransition.tsx` — Industrial cage (20 bars + 6 rings + 800 particles) at z=-50 zone
- `components/canvas/HexTunnel.tsx` — Honeycomb tunnel (24 rings × 12 cells) at z=-62 zone
- `components/UIOverlay.tsx` — Fixed-position HTML overlays that fade in/out based on scroll progress zones. Sections: hero, about, work categories, lab, contact form. Scroll progress indicator on right side.
- `components/Navigation.tsx` — Pill-shaped "WORK — CONTACT" button (top-right, no hamburger menu)
- `components/LoadingScreen.tsx` — Canvas-drawn progress ring with percentage counter
- `components/CustomCursor.tsx` — Neon dot + ring cursor (hidden on touch devices)
- `components/ProjectModal.tsx` — Project detail modal

### Demo Content
- 5 AI-generated project images at `public/projects/` (prometheus, echo, patronus, maison-noir, stellar)
- 5 seed projects in API store (PROMETHEUS, E.C.H.O., PATRONUS, NEURAL DRIFT, VOID RUNNER)

### API Structure
- `store.ts` — JSON file persistence at `data/v1v-data.json` with seed data (5 projects)
- `auth.ts` — Login/verify with in-memory token set, 24h TTL, crypto.randomBytes(32)
- `projects.ts` — Full CRUD for projects
- `settings.ts` — Get/update site settings (social links, theme colors, hero/about text)
