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
- `components/canvas/Scene.tsx` — Three.js R3F canvas with enhanced post-processing (bloom 1.2 intensity, chromatic aberration, sporadic glitch, vignette 0.7). Multiple lights (5 total: ambient + 3 point + 2 directional, mixed colors). CSS fallback: 400 multi-colored particles with 3-layer parallax, 4 orbital rings with glowing dots, animated nebula gradients. WebGL detection + context-loss handler.
- `components/canvas/ScrollScene.tsx` — Camera travels z=8 → z=-75 with mouse parallax. Integrates ParticleText for "V1V" hero, GlassTorusLogo, RibbonSculpture, ProjectCards (larger 4.5x2.8 with glow frames + per-card point lights), CrystalSpine, CageTransition, HexTunnel, ParticleField. 15k particles desktop / 5k mobile.
- `components/canvas/ParticleText.tsx` — **NEW** Canvas-sampled particle text. Draws text on hidden 2D canvas, samples pixel positions, creates thousands of particles that morph from scattered to text shape. Multi-color gradient (blue→purple→pink). Breathing animation.
- `components/canvas/GlassTorusLogo.tsx` — Enhanced iridescent glass torus with 400 orbiting particles, multi-color point lights (3 total), animated emissive intensity
- `components/canvas/RibbonSculpture.tsx` — Dual lemniscate ribbons (primary + secondary) with 300 trailing particles
- `components/canvas/ParticleField.tsx` — 3-layer particle system: main field (15k, multi-color), dust layer (6k, subtle), streak layer (200, orbiting)
- `components/canvas/CrystalSpine.tsx` — 36 icosahedron crystals (6 colors) with 600 glow particles, pulsing emissive, dual point lights
- `components/canvas/CageTransition.tsx` — 28 bars + 8 rings + 1500 core particles + 300 energy orbit particles, emissive materials, 3 point lights
- `components/canvas/HexTunnel.tsx` — 30 rings × 14 cells with emissive materials, 500 trailing orbit particles, dual depth lights
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
