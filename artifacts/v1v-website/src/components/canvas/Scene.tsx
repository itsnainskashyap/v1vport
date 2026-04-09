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
        <div className="w-24 h-24 border border-[rgba(255,255,255,0.05)] rounded-full mx-auto mb-4 animate-pulse" />
        <p className="text-[rgba(255,255,255,0.15)] text-xs font-mono tracking-[0.15em]">LOADING 3D ENGINE</p>
      </div>
    </div>
  );
}

function WebGLFallback() {
  return (
    <div className="w-full h-full bg-[#050510] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[rgba(255,255,255,0.03)] rounded-full animate-pulse" />
    </div>
  );
}

interface SceneProps {
  scrollProgress: number;
}

export function Scene({ scrollProgress }: SceneProps) {
  const [hasError, setHasError] = useState(false);
  const glitchDelay = useMemo(() => new Vector2(12, 25), []);
  const glitchDuration = useMemo(() => new Vector2(0.05, 0.15), []);
  const glitchStrength = useMemo(() => new Vector2(0.01, 0.03), []);

  if (hasError) {
    return <WebGLFallback />;
  }

  return (
    <CanvasErrorBoundary fallback={<WebGLFallback />}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55, near: 0.1, far: 200 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        style={{ background: "#050510" }}
        fallback={<SceneFallback />}
        onCreated={() => {}}
        onError={() => setHasError(true)}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={["#050510", 15, 60]} />
          <ambientLight intensity={0.08} />
          <pointLight position={[5, 5, 5]} intensity={0.35} color="#6688aa" />
          <pointLight position={[-5, -3, 3]} intensity={0.2} color="#665588" />
          <directionalLight position={[0, 10, 5]} intensity={0.15} color="#889aab" />
          <ScrollScene scrollProgress={scrollProgress} />
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.8}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={[0.0003, 0.0003]}
            />
            <Glitch
              delay={glitchDelay}
              duration={glitchDuration}
              strength={glitchStrength}
              mode={GlitchMode.SPORADIC}
              active
              ratio={0.85}
            />
            <Vignette darkness={0.6} offset={0.25} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </CanvasErrorBoundary>
  );
}
