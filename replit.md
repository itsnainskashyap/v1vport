# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

V1V Creative Studio website — a cinematic, full-screen immersive WebGL-first website for a creative digital studio (v1v.in). The entire experience is driven by a Three.js 3D canvas where scroll moves the camera through a continuous 3D world. ALL decorative text is rendered as micro round particle clouds (V1V title scatters on scroll, tagline, service list, contact header). Features a dense particle-only DNA helix with projects attached that rotates on scroll (scroll-driven, not auto-rotating), hand gesture camera tracking via webcam (camera hidden), floating AI-generated decorative PNG images, and cinematic post-processing. Password-protected admin panel.

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
- **Hand tracking**: Custom skin-color detection (no external ML library)

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
- `pages/Home.tsx` — Full-screen canvas with virtual scroll height (800vh). Lenis smooth scroll drives scrollProgress (0→1). Integrates HandGesture component for camera parallax. Manages selectedCardIndex state for 3D DNA card clicks → project modal.
- `pages/Admin.tsx` — Password-protected admin dashboard
- `components/canvas/Scene.tsx` — Three.js R3F canvas with cinematic post-processing (bloom 1.5, chromatic aberration, sporadic glitch, vignette 0.75). 6 lights. Fog 25-100. Passes onCardClick through to ScrollScene. CSS fallback: 500 multi-colored particles, 4 orbital rings, animated nebula gradients.
- `components/canvas/ScrollScene.tsx` — Camera travels z=8 → z=-80 with minimal serpentine (reduced amplitude for text clarity). Camera auto-aligns toward text sections for readability. Integrates: ParticleText (high particle counts for clear text), DNAHelix (z=-35, scroll-driven), FloatingImages (6 AI-generated PNG sprites), ParticleField (22k particles). Responsive particle counts for mobile/tablet/desktop.
- `components/canvas/ParticleText.tsx` — Canvas-sampled micro round particle text. 64x64 circle texture with hard center. Canvas 800x400 with auto-scaling for long text. Scatter prop for disassemble effect. Responsive particle size. Multi-color gradient. Centered positioning for clear visibility.
- `components/canvas/DNAHelix.tsx` — **PARTICLE-ONLY** dense DNA helix: 1600 strand particles per helix (blue + red), 160 base pairs rendered as 14 dots each (4 colors), 2400 glow particles, 6 turns. DNA rotation and vertical position driven by scroll progress (no auto-rotation). Projects (5 cards) orbit the helix. Cards are clickable (onCardClick prop). Responsive radius/counts.
- `components/canvas/ParticleField.tsx` — 3-layer particle system: main field (22k, multi-color, circular texture), nebula layer (4.4k, larger soft), dust layer (3.3k, tiny sparkles). All micro round.
- `components/canvas/FloatingImages.tsx` — 6 AI-generated decorative PNG images (neural brain, crystal prism, circuit sphere, code fragments, dissolving cube, digital eye) floating in the scene with additive blending and fade based on camera distance. Replaces old wireframe FloatingShapes.
- `components/HandGesture.tsx` — Camera permission prompt with ALLOW/SKIP. Camera preview HIDDEN (no visible video). Widened skin-color detection with higher smoothing (0.25 LERP) and no-detect debouncing for stability.
- `components/UIOverlay.tsx` — Minimal fixed overlays: scroll indicator, "DNA OF CREATIVITY" vertical label, "SELECTED WORK" project list (clickable titles), contact form, copyright, scroll progress bar. Supports selectedCardIndex prop to open project modal when 3D DNA cards are clicked.
- `components/Navigation.tsx` — Pill-shaped "WORK — CONTACT" button
- `components/LoadingScreen.tsx` — Canvas-drawn progress ring (1.5s)
- `components/CustomCursor.tsx` — Zero-delay neon dot (directly follows mouse) + trailing ring cursor using requestAnimationFrame (no Framer Motion dependency).
- `components/ProjectModal.tsx` — Cinematic modal with spring animations, staggered reveal

### Assets
- 5 AI-generated project images at `public/projects/`
- 6 AI-generated decorative images at `public/decorative/` (neural-brain, crystal-prism, circuit-sphere, code-fragments, dissolving-cube, digital-eye)
- 5 seed projects in API store

### API Structure
- `store.ts` — JSON file persistence with seed data
- `auth.ts` — Login/verify with in-memory token set
- `projects.ts` — Full CRUD for projects
- `settings.ts` — Get/update site settings
