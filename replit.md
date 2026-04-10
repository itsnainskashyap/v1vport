# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

V1V Creative Studio website — a cinematic, full-screen immersive WebGL-first website for a creative digital studio (v1v.in). Features a cinematic intro sequence ("Welcome to V1V Space" → "Experience Something Unbelievable" → "Enter the World") before revealing the main 3D experience. The entire experience is driven by a Three.js 3D canvas where scroll moves the camera through a continuous 3D world with cinematic left-right serpentine movement. ALL decorative text is rendered as micro round particle clouds that appear and disappear sequentially. Features a Cosmic Orbit system (central glowing planet with 3 particle rings and orbiting project cards) replacing the old DNA helix, hand gesture camera tracking via webcam (camera hidden), 20 floating AI-generated planet/galaxy/nebula PNG images, ambient cinematic sound effects, cinematic post-processing, and a contact popup that appears on scroll. Password-protected admin panel.

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
- `components/CinematicIntro.tsx` — Full-screen cinematic intro with star warp speed effect (600 stars streaming from center with colored light trails), expanding energy rings, radial gradient overlays. 5 uniquely styled text slides: hero (scale-up), glow (gradient text + blur), split (slide from opposite sides), zoom (3x scale-in with blur), final (with underline reveal). Progress bar with percentage. V1V STUDIO branding. SKIP button. Each slide transitions with distinct Framer Motion animations.
- `components/SoundManager.tsx` — Procedural ambient sound using Web Audio API. 3 sine pad oscillators (65Hz, 98Hz, 131Hz), bandpass-filtered noise atmosphere, LFO modulation. Volume reacts to scroll position (DNA section boost, contact fadeout). Mute/unmute button.
- `components/canvas/Scene.tsx` — Three.js R3F canvas with cinematic post-processing (bloom 1.5, chromatic aberration, sporadic glitch, vignette 0.75). 6 lights. Fog 25-100. Passes onCardClick through to ScrollScene. CSS fallback.
- `components/canvas/ScrollScene.tsx` — Camera travels z=8 → z=-80 with cinematic serpentine (sin×1.5 X, sin×0.8 Y). 11 text sections defined for camera auto-alignment. Texts appear/disappear sequentially: V1V hero → tagline → "WE BUILD THE FUTURE" → "DESIGN • CODE • MOTION" → "INNOVATION AT EVERY PIXEL" → "CRAFTING DIGITAL WORLDS" → [DNA zone] → "BRANDING • WEB • APP • 3D" → "FROM CONCEPT TO REALITY" → "IMMERSIVE EXPERIENCES" → "AWARD WINNING STUDIO" → "GET IN TOUCH". Content closer together for cinematic pacing.
- `components/canvas/ParticleText.tsx` — Canvas-sampled micro round particle text. Sequential fade-in/fade-out per section.
- `components/canvas/CosmicOrbit.tsx` — Cosmic orbital system replacing DNAHelix: central glowing planet (sphere with emissive purple glow + outer atmosphere), inner nebula cloud (8k particles), 3 concentric particle rings (22k particles with tilt/spread variation), 5 project cards orbiting at different radii/speeds/tilts. Scroll-driven rotation with gentle auto-spin. Clickable project cards.
- `components/canvas/ParticleField.tsx` — 3-layer particle system: main field (22k), nebula (4.4k), dust (3.3k).
- `components/canvas/Spaceship.tsx` — 3D fighter spaceship (FBX model with PBR textures). Centered by default, follows the camera path like the user is flying it. Smoothly moves to the side when content/text sections appear. Banking and pitching based on velocity direction. Dramatic fly-away animation at scroll end (>92%). 400-particle engine trail. Uses @react-three/drei's useFBX loader with 4 material groups (Body, Front, Rear, Windows) each with PBR maps.
- `components/canvas/FloatingImages.tsx` — 20 AI-generated planet/galaxy/nebula PNG images stationary in the scene. Slow rotation. Camera flies past them as user scrolls. Additive blending with distance-based fade. Spread from z=-3 to z=-74.
- `components/HandGesture.tsx` — Camera permission prompt with gesture instructions. Pinch gesture = select nearest interactive element. Hand up = scroll down, hand down = scroll back. Skin-color detection with smoothing. Sample-based motion detection for directional scrolling.
- `components/UIOverlay.tsx` — Scroll indicator, "COSMIC ORBIT" label, "SELECTED WORK" project list. Contact panel + contact popup trigger at scroll 88%. Gradient scroll progress bar.
- `components/ContactPopup.tsx` — Modal popup triggered when scrolling past "GET IN TOUCH" (scroll >= 88%). Frosted glass overlay with contact form (name, email, message), WhatsApp button, social links. Animated entrance with scale + slide.
- `components/Navigation.tsx` — Pill-shaped "WORK — CONTACT" button
- `components/LoadingScreen.tsx` — Canvas-drawn progress ring (1.5s)
- `components/CustomCursor.tsx` — Zero-delay neon dot + trailing ring cursor using RAF.
- `components/ProjectModal.tsx` — Cinematic modal with spring animations, staggered reveal

### Assets
- 5 AI-generated project images at `public/projects/`
- 20 AI-generated planet/galaxy/nebula decorative images at `public/decorative/` (planet-gas-giant-blue, planet-ringed-gold, planet-rocky-red, planet-ice-turquoise, galaxy-spiral-purple, planet-ringed-blue, planet-lava-red, galaxy-spiral-gold, planet-emerald-ringed, star-blue-giant, planet-violet-moons, galaxy-elliptical-warm, planet-ocean-blue, planet-ringed-rainbow, nebula-pillar-teal, planet-desert-gold, galaxy-barred-spiral, moon-ice-geysers, planet-ringed-red, nebula-supernova)
- Fighter spaceship 3D model at `public/models/` — FBX mesh + 19 PBR texture maps (BaseColor, Normal, Metallic, Roughness, Emissive for Body/Front/Rear/Windows)
- 5 seed projects in API store

### API Structure
- `store.ts` — JSON file persistence with seed data
- `auth.ts` — Login/verify with in-memory token set
- `projects.ts` — Full CRUD for projects
- `settings.ts` — Get/update site settings
