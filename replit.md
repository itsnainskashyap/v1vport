# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

V1V Creative Studio website — a cinematic, full-screen immersive WebGL-first website for a creative digital studio (v1v.in). Features a cinematic intro sequence ("Welcome to V1V Space" → "Experience Something Unbelievable" → "Enter the World") before revealing the main 3D experience. The entire experience is driven by a Three.js 3D canvas where scroll moves the camera through a continuous 3D world with cinematic left-right serpentine movement. ALL decorative text is rendered as micro round particle clouds that appear and disappear sequentially. Features a realistic dense particle-only DNA helix with projects attached that rotates on scroll, hand gesture camera tracking via webcam (camera hidden), 21 floating AI-generated decorative PNG images, ambient cinematic sound effects, and cinematic post-processing. Password-protected admin panel.

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
- **Audio**: Web Audio API (procedural ambient soundscapes)

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
- `pages/Home.tsx` — Full-screen canvas with virtual scroll height (800vh). Lenis smooth scroll drives scrollProgress (0→1). Integrates CinematicIntro, SoundManager, HandGesture. Manages selectedCardIndex state for 3D DNA card clicks → project modal.
- `pages/Admin.tsx` — Password-protected admin dashboard
- `components/CinematicIntro.tsx` — Full-screen cinematic text sequence on load: 5 animated text slides with particle background ("Welcome to V1V Space", "Experience Something Unbelievable", "Where Creativity Meets Technology", "We Craft Digital Experiences", "Enter the World"). Has SKIP button and progress bar.
- `components/SoundManager.tsx` — Procedural ambient sound using Web Audio API. 3 sine pad oscillators (65Hz, 98Hz, 131Hz), bandpass-filtered noise atmosphere, LFO modulation. Volume reacts to scroll position (DNA section boost, contact fadeout). Mute/unmute button.
- `components/canvas/Scene.tsx` — Three.js R3F canvas with cinematic post-processing (bloom 1.5, chromatic aberration, sporadic glitch, vignette 0.75). 6 lights. Fog 25-100. Passes onCardClick through to ScrollScene. CSS fallback.
- `components/canvas/ScrollScene.tsx` — Camera travels z=8 → z=-80 with cinematic serpentine (sin×1.5 X, sin×0.8 Y). 11 text sections defined for camera auto-alignment. Texts appear/disappear sequentially: V1V hero → tagline → "WE BUILD THE FUTURE" → "DESIGN • CODE • MOTION" → "INNOVATION AT EVERY PIXEL" → "CRAFTING DIGITAL WORLDS" → [DNA zone] → "BRANDING • WEB • APP • 3D" → "FROM CONCEPT TO REALITY" → "IMMERSIVE EXPERIENCES" → "AWARD WINNING STUDIO" → "GET IN TOUCH". Content closer together for cinematic pacing.
- `components/canvas/ParticleText.tsx` — Canvas-sampled micro round particle text. Sequential fade-in/fade-out per section.
- `components/canvas/DNAHelix.tsx` — Dense realistic particle DNA: 3200 strand particles per helix (cyan + red with color variation), 240 base pairs × 18 dots (6 colors, variable width, mid-bulge), 1200 phosphate backbone particles per strand (outer ring), 3600 glow particles. Minor groove modulation for realism. 8 turns. Scroll-driven rotation + vertical position. 5 project cards orbiting the helix. Clickable cards with glow underlining.
- `components/canvas/ParticleField.tsx` — 3-layer particle system: main field (22k), nebula (4.4k), dust (3.3k).
- `components/canvas/FloatingImages.tsx` — 21 AI-generated decorative PNG images floating throughout the scene with additive blending and distance-based fade. Spread evenly from z=-3 to z=-77.
- `components/HandGesture.tsx` — Camera permission prompt with ALLOW/SKIP. Skin-color detection with smoothing and debouncing.
- `components/UIOverlay.tsx` — Scroll indicator ("SCROLL TO EXPLORE"), "DNA OF CREATIVITY" vertical label, "SELECTED WORK" project list with category+year, contact form, social links, gradient scroll progress bar. Project list items animate in with slide.
- `components/Navigation.tsx` — Pill-shaped "WORK — CONTACT" button
- `components/LoadingScreen.tsx` — Canvas-drawn progress ring (1.5s)
- `components/CustomCursor.tsx` — Zero-delay neon dot + trailing ring cursor using RAF.
- `components/ProjectModal.tsx` — Cinematic modal with spring animations, staggered reveal

### Assets
- 5 AI-generated project images at `public/projects/`
- 21 AI-generated decorative images at `public/decorative/` (neural-brain, crystal-prism, circuit-sphere, code-fragments, dissolving-cube, digital-eye, holo-planet, neon-hand, crystal-diamond, dna-glow, light-butterfly, metal-sphere, light-rocket, portal-vortex, neon-astronaut, holo-crown, space-jellyfish, digital-phoenix, neon-compass, geo-heart, energy-bolt)
- 5 seed projects in API store

### API Structure
- `store.ts` — JSON file persistence with seed data
- `auth.ts` — Login/verify with in-memory token set
- `projects.ts` — Full CRUD for projects
- `settings.ts` — Get/update site settings
