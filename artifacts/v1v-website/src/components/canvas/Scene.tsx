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
    const arr: { x: number; y: number; size: number; opacity: number; delay: number; color: string }[] = [];
    const colors = [
      "rgba(140,180,220,VAL)",
      "rgba(180,160,220,VAL)",
      "rgba(220,180,140,VAL)",
      "rgba(160,200,180,VAL)",
      "rgba(200,140,170,VAL)",
    ];
    for (let i = 0; i < 300; i++) {
      const op = 0.15 + Math.random() * 0.6;
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        opacity: op,
        delay: Math.random() * 6,
        color: colors[i % colors.length].replace("VAL", String(op)),
      });
    }
    return arr;
  }, []);

  const scrollShift = scrollProgress * 100;

  return (
    <div className="w-full h-full bg-[#050510] relative overflow-hidden">
      <div
        className="absolute inset-[-50%]"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at ${50 + Math.sin(scrollProgress * 3) * 10}% ${30 - scrollProgress * 20}%, rgba(50,80,130,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 35% at ${30 + scrollProgress * 20}% ${60 - scrollProgress * 10}%, rgba(90,60,140,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 25% at ${70 - scrollProgress * 15}% ${70 + scrollProgress * 5}%, rgba(120,80,50,0.06) 0%, transparent 50%),
            radial-gradient(ellipse 70% 50% at 50% ${50 - scrollProgress * 40}%, rgba(30,50,80,0.15) 0%, transparent 80%)
          `,
          animation: "nebulaDrift 25s ease-in-out infinite alternate",
        }}
      />

      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(circle at ${50 + scrollProgress * 30}% ${50 - scrollProgress * 25}%, rgba(60,100,160,0.06) 0%, transparent 40%),
          radial-gradient(circle at ${30 - scrollProgress * 10}% ${70 + scrollProgress * 10}%, rgba(100,60,140,0.04) 0%, transparent 35%)
        `,
      }} />

      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            boxShadow: star.size > 2 ? `0 0 ${star.size * 2}px ${star.color}` : "none",
            animation: `starTwinkle ${2.5 + star.delay}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
            transform: `translateY(${-scrollShift * (0.3 + star.opacity * 0.7)}px)`,
          }}
        />
      ))}

      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: 320,
          height: 320,
          border: "1px solid rgba(120,160,200,0.06)",
          borderRadius: "50%",
          animation: "orbitSpin 35s linear infinite",
          opacity: Math.max(0, 1 - scrollProgress * 3),
        }}
      >
        <div className="absolute -top-[3px] left-1/2 w-[6px] h-[6px] rounded-full bg-[rgba(120,170,220,0.3)]" style={{ boxShadow: "0 0 8px rgba(120,170,220,0.4)" }} />
      </div>

      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: 220,
          height: 220,
          border: "1px solid rgba(120,160,200,0.04)",
          borderRadius: "50%",
          animation: "orbitSpin 22s linear infinite reverse",
          opacity: Math.max(0, 1 - scrollProgress * 3),
        }}
      >
        <div className="absolute -top-[2px] left-1/3 w-[4px] h-[4px] rounded-full bg-[rgba(170,140,200,0.25)]" style={{ boxShadow: "0 0 6px rgba(170,140,200,0.3)" }} />
      </div>

      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: 420,
          height: 420,
          border: "1px solid rgba(100,130,170,0.025)",
          borderRadius: "50%",
          animation: "orbitSpin 50s linear infinite",
          opacity: Math.max(0, 0.8 - scrollProgress * 2),
        }}
      />

      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(5,5,16,0.6) 100%)",
      }} />

      <style>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes orbitSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes nebulaDrift {
          from { transform: translate(0%, 0%) scale(1); }
          to { transform: translate(2%, -1%) scale(1.03); }
        }
      `}</style>
    </div>
  );
}

interface SceneProps {
  scrollProgress: number;
}

export function Scene({ scrollProgress }: SceneProps) {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [hasError, setHasError] = useState(false);

  const glitchDelay = useMemo(() => new Vector2(12, 25), []);
  const glitchDuration = useMemo(() => new Vector2(0.05, 0.15), []);
  const glitchStrength = useMemo(() => new Vector2(0.01, 0.03), []);

  useEffect(() => {
    const supported = detectWebGL();
    setWebglSupported(supported);
  }, []);


  if (webglSupported === null) {
    return <div className="w-full h-full bg-[#050510]" />;
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
          style={{ background: "#050510" }}
          fallback={<CSSFallbackScene scrollProgress={scrollProgress} />}
          onCreated={({ gl }) => {
            const canvas = gl.domElement;
            canvas.addEventListener("webglcontextlost", () => setHasError(true));
          }}
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
    </div>
  );
}
