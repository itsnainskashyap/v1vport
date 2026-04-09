import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useMemo, useEffect } from "react";
import { ScrollScene } from "./ScrollScene";
import { Bloom, EffectComposer, Vignette, ChromaticAberration, Glitch } from "@react-three/postprocessing";
import { BlendFunction, GlitchMode } from "postprocessing";
import { Vector2 } from "three";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    const gl = c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl");
    if (!gl) return false;
    const g = gl as WebGLRenderingContext;
    g.clearColor(0, 0, 0, 1);
    g.clear(g.COLOR_BUFFER_BIT);
    if (g.getError() !== g.NO_ERROR) return false;
    if (g.isContextLost()) return false;
    return true;
  } catch {
    return false;
  }
}

function CSSFallbackScene({ scrollProgress }: { scrollProgress: number }) {
  const stars = useMemo(() => {
    const arr: { x: number; y: number; size: number; delay: number; color: string; layer: number }[] = [];
    const colors = ["85,170,255", "170,85,255", "255,85,170", "85,255,170", "255,170,85", "170,200,255"];
    for (let i = 0; i < 500; i++) {
      const layer = Math.floor(Math.random() * 3);
      const opacity = 0.15 + Math.random() * 0.5;
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 400,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 8,
        color: `rgba(${colors[i % colors.length]},${opacity})`,
        layer,
      });
    }
    return arr;
  }, []);

  const scrollShift = scrollProgress * 200;

  return (
    <div className="w-full h-full bg-[#030812] relative overflow-hidden">
      <div
        className="absolute inset-[-60%]"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at ${50 + Math.sin(scrollProgress * 3) * 15}% ${30 - scrollProgress * 25}%, rgba(40,80,160,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at ${30 + scrollProgress * 25}% ${60 - scrollProgress * 15}%, rgba(120,50,180,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 50% ${50 - scrollProgress * 50}%, rgba(15,30,60,0.2) 0%, transparent 80%)
          `,
          animation: "nebulaDrift 20s ease-in-out infinite alternate",
        }}
      />

      {stars.map((star, i) => {
        const parallax = 0.2 + star.layer * 0.4;
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y - scrollShift * parallax}px`,
              width: star.size,
              height: star.size,
              backgroundColor: star.color,
              boxShadow: star.size > 1.5 ? `0 0 ${star.size * 2}px ${star.color}` : "none",
              animation: `starTwinkle ${3 + star.delay}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        );
      })}

      {[360, 240, 500, 160].map((size, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2"
          style={{
            width: size,
            height: size,
            border: `1px solid rgba(85,170,255,${0.04 - i * 0.01})`,
            borderRadius: "50%",
            animation: `orbitSpin ${25 + i * 10}s linear infinite ${i % 2 ? "reverse" : ""}`,
            opacity: Math.max(0, 1 - scrollProgress * 3),
          }}
        >
          <div
            className="absolute -top-[3px] rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              width: 4 + i,
              height: 4 + i,
              backgroundColor: `rgba(${["85,170,255", "170,85,255", "255,85,170", "85,255,170"][i]},0.3)`,
              boxShadow: `0 0 8px rgba(${["85,170,255", "170,85,255", "255,85,170", "85,255,170"][i]},0.4)`,
            }}
          />
        </div>
      ))}

      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 120% 120% at 50% 50%, transparent 30%, rgba(3,8,18,0.7) 100%)",
      }} />

      <style>{`
        @keyframes starTwinkle { 0%, 100% { opacity: 0.1; } 50% { opacity: 1; } }
        @keyframes orbitSpin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes nebulaDrift { from { transform: translate(0%, 0%) scale(1); } to { transform: translate(3%, -2%) scale(1.05); } }
      `}</style>
    </div>
  );
}

interface SceneProps {
  scrollProgress: number;
  handPosition?: { x: number; y: number } | null;
}

export function Scene({ scrollProgress, handPosition }: SceneProps) {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [hasError, setHasError] = useState(false);

  const glitchDelay = useMemo(() => new Vector2(18, 35), []);
  const glitchDuration = useMemo(() => new Vector2(0.02, 0.08), []);
  const glitchStrength = useMemo(() => new Vector2(0.005, 0.02), []);
  const chromaOffset = useMemo(() => new Vector2(0.0005, 0.0005), []);

  useEffect(() => {
    setWebglSupported(detectWebGL());
  }, []);

  if (webglSupported === null) {
    return <div className="w-full h-full bg-[#030812]" />;
  }

  if (!webglSupported || hasError) {
    return <CSSFallbackScene scrollProgress={scrollProgress} />;
  }

  return (
    <div className="w-full h-full">
      <CanvasErrorBoundary fallback={<CSSFallbackScene scrollProgress={scrollProgress} />}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 55, near: 0.1, far: 200 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          style={{ background: "#030812" }}
          fallback={<CSSFallbackScene scrollProgress={scrollProgress} />}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", () => setHasError(true));
          }}
          onError={() => setHasError(true)}
        >
          <Suspense fallback={null}>
            <fog attach="fog" args={["#030812", 20, 80]} />
            <ambientLight intensity={0.1} />
            <pointLight position={[5, 5, 5]} intensity={0.5} color="#5599cc" />
            <pointLight position={[-5, -3, 3]} intensity={0.35} color="#9955cc" />
            <pointLight position={[3, -5, -2]} intensity={0.25} color="#cc5599" />
            <directionalLight position={[0, 10, 5]} intensity={0.2} color="#88aacc" />
            <ScrollScene scrollProgress={scrollProgress} handPosition={handPosition} />
            <EffectComposer multisampling={0}>
              <Bloom
                intensity={1.5}
                luminanceThreshold={0.12}
                luminanceSmoothing={0.7}
                mipmapBlur
              />
              <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={chromaOffset}
              />
              <Glitch
                delay={glitchDelay}
                duration={glitchDuration}
                strength={glitchStrength}
                mode={GlitchMode.SPORADIC}
                active
                ratio={0.85}
              />
              <Vignette darkness={0.75} offset={0.18} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
