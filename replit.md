# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

V1V Creative Studio website — a cinematic, full-screen immersive WebGL-first website for a creative digital studio (v1v.in). The entire experience is driven by a Three.js 3D canvas where scroll moves the camera through a continuous 3D world. ALL decorative text is rendered as micro round particle clouds (V1V title, tagline, contact header). Features a DNA helix that rotates on scroll, hand gesture camera tracking via webcam, and cinematic post-processing. Password-protected admin panel.

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
- **Hand tracking**: @mediapipe/tasks-vision (skin-color detection fallback)

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
- `pages/Home.tsx` — Full-screen canvas with virtual scroll height (700vh). Lenis smooth scroll drives scrollProgress (0→1). Integrates HandGesture component for camera parallax via webcam.
- `pages/Admin.tsx` — Password-protected admin dashboard (projects CRUD, settings, social links, theme colors)
- `components/canvas/Scene.tsx` — Three.js R3F canvas with cinematic post-processing (bloom 1.5, chromatic aberration, sporadic glitch, vignette 0.75). CSS fallback: 500 multi-colored particles with 3-layer parallax, 4 orbital rings, animated nebula gradients. WebGL detection + context-loss handler.
- `components/canvas/ScrollScene.tsx` — Camera travels z=8 → z=-75 with mouse/hand parallax. Integrates: ParticleText for "V1V" hero + "CREATIVE DIGITAL EXPERIENCES" tagline + "GET IN TOUCH" contact, DNAHelix (z=-32), ProjectCards (5 cards spaced z=-38 to z=-62 with glow borders), NebulaClouds, ParticleField (18k particles). All decorative text is particle-based, no HTML text overlays.
- `components/canvas/ParticleText.tsx` — Canvas-sampled micro round particle text. Uses circular gradient texture (32x32 canvas) for round particles instead of square default. Particles morph from scattered to text shape with breathing animation. Multi-color gradient (blue→purple→pink). Configurable size, count, colors, fontSize.
- `components/canvas/DNAHelix.tsx` — Double helix DNA structure with two TubeGeometry strands (blue + red), 40 base pairs with connecting cylinders and sphere nodes (4 colors), 2000 floating particles. Rotates faster when user scrolls into its zone (scrollProgress 0.25-0.55). 3 point lights.
- `components/canvas/ParticleField.tsx` — 2-layer micro round particle system: main field (18k, multi-color with circular texture) + nebula layer (5.4k, larger soft particles). All particles use circular canvas texture for round appearance.
- `components/HandGesture.tsx` — Camera permission prompt ("For hand gesture, allow camera access") with ALLOW/SKIP buttons. On allow: starts webcam, processes frames for skin-color detection, maps detected hand centroid to camera parallax (-1 to 1 range with smoothing). Shows small camera preview in bottom-right corner.
- `components/UIOverlay.tsx` — Minimal fixed-position HTML overlays. Only small labels: "SCROLL" indicator, "DNA OF CREATIVITY" vertical label, "SELECTED WORK" project list, contact form, copyright. NO decorative V1V text or tagline — those are particle-based in 3D.
- `components/Navigation.tsx` — Pill-shaped "WORK — CONTACT" button (top-right)
- `components/LoadingScreen.tsx` — Canvas-drawn progress ring with percentage counter (1.5s)
- `components/CustomCursor.tsx` — Neon dot + ring cursor (hidden on touch devices)
- `components/ProjectModal.tsx` — Cinematic project detail modal with spring animations, rounded borders, gradient overlays, staggered content reveal. Close button with rotation animation.

### Removed 3D Elements (still in codebase but not used)
- `GlassTorusLogo.tsx`, `RibbonSculpture.tsx`, `CrystalSpine.tsx`, `CageTransition.tsx`, `HexTunnel.tsx`

### Demo Content
- 5 AI-generated project images at `public/projects/` (prometheus, echo, patronus, maison-noir, stellar)
- 5 seed projects in API store (PROMETHEUS, E.C.H.O., PATRONUS, NEURAL DRIFT, VOID RUNNER)

### API Structure
- `store.ts` — JSON file persistence at `data/v1v-data.json` with seed data (5 projects)
- `auth.ts` — Login/verify with in-memory token set, 24h TTL, crypto.randomBytes(32)
- `projects.ts` — Full CRUD for projects
- `settings.ts` — Get/update site settings (social links, theme colors, hero/about text)
