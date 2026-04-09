import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useMemo } from "react";
import { ScrollScene } from "./ScrollScene";
import { Bloom, EffectComposer, Vignette, ChromaticAberration, Glitch } from "@react-three/postprocessing";
import { BlendFunction, GlitchMode } from "postprocessing";
import { Vector2 } from "three";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";

function SceneFallback() {
  return (
    <div className="w-full h-full bg-[#050510] flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 border border-primary/20 rounded-full mx-auto mb-4 animate-pulse" />
        <p className="text-foreground/20 text-xs font-mono tracking-[0.15em]">LOADING 3D ENGINE</p>
      </div>
    </div>
  );
}

function WebGLFallback() {
  return (
    <div className="w-full h-full bg-[#050510] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-primary/10 rounded-full animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-secondary/10 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
    </div>
  );
}

interface SceneProps {
  scrollProgress: number;
}

export function Scene({ scrollProgress }: SceneProps) {
  const [hasError, setHasError] = useState(false);
  const glitchDelay = useMemo(() => new Vector2(8, 15), []);
  const glitchDuration = useMemo(() => new Vector2(0.1, 0.3), []);
  const glitchStrength = useMemo(() => new Vector2(0.02, 0.05), []);

  if (hasError) {
    return <WebGLFallback />;
  }

  return (
    <CanvasErrorBoundary fallback={<WebGLFallback />}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "#050510" }}
        fallback={<SceneFallback />}
        onCreated={() => {}}
        onError={() => setHasError(true)}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={["#050510", 5, 30]} />
          <ambientLight intensity={0.15} />
          <pointLight position={[5, 5, 5]} intensity={0.5} color="#00f0ff" />
          <pointLight position={[-5, -3, 3]} intensity={0.3} color="#8b5cf6" />
          <ScrollScene scrollProgress={scrollProgress} />
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={1.2}
              luminanceThreshold={0.15}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={[0.0005, 0.0005]}
            />
            <Glitch
              delay={glitchDelay}
              duration={glitchDuration}
              strength={glitchStrength}
              mode={GlitchMode.SPORADIC}
              active
              ratio={0.85}
            />
            <Vignette darkness={0.5} offset={0.3} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </CanvasErrorBoundary>
  );
}
