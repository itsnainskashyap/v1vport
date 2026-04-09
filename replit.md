# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

V1V Creative Studio website — a cinematic, full-screen immersive WebGL-first website for a creative digital studio (v1v.in). The entire experience is driven by a Three.js 3D canvas where scroll moves the camera through a continuous 3D world weaving left and right. ALL decorative text is rendered as micro round particle clouds (V1V title scatters on scroll, tagline, service list, contact header). Features a particle-only DNA helix with projects attached to it that rotates on scroll, hand gesture camera tracking via webcam (camera hidden), floating wireframe geometric shapes, and cinematic post-processing. Password-protected admin panel.

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
- **Hand tracking**: @mediapipe/tasks-vision (skin-color detection)

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
- `pages/Home.tsx` — Full-screen canvas with virtual scroll height (800vh). Lenis smooth scroll drives scrollProgress (0→1). Integrates HandGesture component for camera parallax.
- `pages/Admin.tsx` — Password-protected admin dashboard
- `components/canvas/Scene.tsx` — Three.js R3F canvas with cinematic post-processing (bloom 1.5, chromatic aberration, sporadic glitch, vignette 0.75). 6 lights. Fog 25-100. CSS fallback: 500 multi-colored particles, 4 orbital rings, animated nebula gradients.
- `components/canvas/ScrollScene.tsx` — Camera travels z=8 → z=-80 weaving left/right (sinusoidal X+Y movement). Integrates: ParticleText ("V1V" with scatter, tagline, "WE BUILD THE FUTURE", "DESIGN • CODE • MOTION", services, contact), DNAHelix (z=-35, particle-only with projects attached), FloatingShapes (12 wireframe shapes + grid), ParticleField (22k particles, 3 layers). Responsive particle counts for mobile/tablet/desktop.
- `components/canvas/ParticleText.tsx` — Canvas-sampled micro round particle text. 64x64 circle texture with hard center. Canvas 800x400 with auto-scaling for long text. Scatter prop for disassemble effect. Responsive particle size. Multi-color gradient.
- `components/canvas/DNAHelix.tsx` — **PARTICLE-ONLY** DNA helix: 800 strand particles per helix (blue + red), 80 base pairs rendered as 10 dots each (4 colors), 1200 glow particles. Projects (5 cards) attached to helix and orbit with it. Rotates faster in DNA zone (scroll 0.2-0.75). Responsive radius/counts.
- `components/canvas/ParticleField.tsx` — 3-layer particle system: main field (22k, multi-color, circular texture), nebula layer (4.4k, larger soft), dust layer (3.3k, tiny sparkles). All micro round.
- `components/canvas/FloatingShapes.tsx` — 12 wireframe geometric shapes (icosahedra, octahedra, torus, rings, dodecahedra) floating in background + 300-dot animated grid floor. Fills the scene visually.
- `components/HandGesture.tsx` — Camera permission prompt with ALLOW/SKIP. Camera preview HIDDEN (no visible video). Skin-color detection maps hand centroid to camera parallax. Responsive prompt.
- `components/UIOverlay.tsx` — Minimal fixed overlays: scroll indicator, "DNA OF CREATIVITY" vertical label, "SELECTED WORK" project list, contact form, copyright, scroll progress bar.
- `components/Navigation.tsx` — Pill-shaped "WORK — CONTACT" button
- `components/LoadingScreen.tsx` — Canvas-drawn progress ring (1.5s)
- `components/CustomCursor.tsx` — Neon dot + ring cursor
- `components/ProjectModal.tsx` — Cinematic modal with spring animations, staggered reveal

### Demo Content
- 5 AI-generated project images at `public/projects/`
- 5 seed projects in API store

### API Structure
- `store.ts` — JSON file persistence with seed data
- `auth.ts` — Login/verify with in-memory token set
- `projects.ts` — Full CRUD for projects
- `settings.ts` — Get/update site settings
