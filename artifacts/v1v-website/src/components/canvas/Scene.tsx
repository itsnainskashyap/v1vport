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
    const arr: { x: number; y: number; size: number; opacity: number; delay: number; color: string; layer: number }[] = [];
    const colors = [
      "85,170,255",
      "170,100,255",
      "255,100,170",
      "100,255,170",
      "255,170,85",
      "100,200,255",
      "200,200,255",
    ];
    for (let i = 0; i < 400; i++) {
      const op = 0.2 + Math.random() * 0.6;
      const layer = Math.floor(Math.random() * 3);
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 300,
        size: 1 + Math.random() * 3,
        opacity: op,
        delay: Math.random() * 8,
        color: colors[i % colors.length],
        layer,
      });
    }
    return arr;
  }, []);

  const scrollShift = scrollProgress * 150;

  return (
    <div className="w-full h-full bg-[#030812] relative overflow-hidden">
      <div
        className="absolute inset-[-60%]"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at ${50 + Math.sin(scrollProgress * 3) * 15}% ${30 - scrollProgress * 25}%, rgba(40,80,160,0.15) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at ${30 + scrollProgress * 25}% ${60 - scrollProgress * 15}%, rgba(120,60,180,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 50% 30% at ${70 - scrollProgress * 20}% ${70 + scrollProgress * 10}%, rgba(180,60,100,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 80% 60% at 50% ${50 - scrollProgress * 50}%, rgba(20,40,80,0.2) 0%, transparent 80%)
          `,
          animation: "nebulaDrift 20s ease-in-out infinite alternate",
        }}
      />

      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(circle at ${50 + scrollProgress * 35}% ${50 - scrollProgress * 30}%, rgba(60,120,200,0.08) 0%, transparent 45%),
          radial-gradient(circle at ${30 - scrollProgress * 15}% ${70 + scrollProgress * 15}%, rgba(140,60,180,0.06) 0%, transparent 40%)
        `,
      }} />

      {stars.map((star, i) => {
        const parallax = 0.3 + star.layer * 0.35;
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y - scrollShift * parallax}px`,
              width: star.size,
              height: star.size,
              backgroundColor: `rgba(${star.color},${star.opacity})`,
              boxShadow: star.size > 2 ? `0 0 ${star.size * 3}px rgba(${star.color},${star.opacity * 0.6})` : "none",
              animation: `starTwinkle ${3 + star.delay}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        );
      })}

      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: 360,
          height: 360,
          border: "1px solid rgba(85,170,255,0.08)",
          borderRadius: "50%",
          animation: "orbitSpin 30s linear infinite",
          opacity: Math.max(0, 1 - scrollProgress * 3),
        }}
      >
        <div className="absolute -top-[4px] left-1/2 w-[8px] h-[8px] rounded-full bg-[rgba(85,170,255,0.4)]" style={{ boxShadow: "0 0 12px rgba(85,170,255,0.5), 0 0 24px rgba(85,170,255,0.2)" }} />
        <div className="absolute bottom-0 left-1/4 w-[5px] h-[5px] rounded-full bg-[rgba(170,100,255,0.3)]" style={{ boxShadow: "0 0 8px rgba(170,100,255,0.4)" }} />
      </div>

      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: 240,
          height: 240,
          border: "1px solid rgba(170,100,255,0.06)",
          borderRadius: "50%",
          animation: "orbitSpin 18s linear infinite reverse",
          opacity: Math.max(0, 1 - scrollProgress * 3),
        }}
      >
        <div className="absolute -top-[3px] left-1/3 w-[6px] h-[6px] rounded-full bg-[rgba(255,100,170,0.35)]" style={{ boxShadow: "0 0 10px rgba(255,100,170,0.4)" }} />
      </div>

      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: 500,
          height: 500,
          border: "1px solid rgba(100,200,255,0.03)",
          borderRadius: "50%",
          animation: "orbitSpin 45s linear infinite",
          opacity: Math.max(0, 0.7 - scrollProgress * 2),
        }}
      >
        <div className="absolute -top-[2px] right-1/4 w-[4px] h-[4px] rounded-full bg-[rgba(100,255,170,0.25)]" style={{ boxShadow: "0 0 6px rgba(100,255,170,0.3)" }} />
      </div>

      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: 160,
          height: 160,
          border: "1px solid rgba(85,170,255,0.05)",
          borderRadius: "50%",
          animation: "orbitSpin 12s linear infinite",
          opacity: Math.max(0, 1 - scrollProgress * 3),
        }}
      />

      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 120% 120% at 50% 50%, transparent 30%, rgba(3,8,18,0.7) 100%)",
      }} />

      <style>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 1; }
        }
        @keyframes orbitSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes nebulaDrift {
          from { transform: translate(0%, 0%) scale(1); }
          to { transform: translate(3%, -2%) scale(1.05); }
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

  const glitchDelay = useMemo(() => new Vector2(15, 30), []);
  const glitchDuration = useMemo(() => new Vector2(0.03, 0.12), []);
  const glitchStrength = useMemo(() => new Vector2(0.008, 0.025), []);

  useEffect(() => {
    const supported = detectWebGL();
    setWebglSupported(supported);
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
            const canvas = gl.domElement;
            canvas.addEventListener("webglcontextlost", () => setHasError(true));
          }}
          onError={() => setHasError(true)}
        >
          <Suspense fallback={null}>
            <fog attach="fog" args={["#030812", 18, 70]} />
            <ambientLight intensity={0.12} />
            <pointLight position={[5, 5, 5]} intensity={0.5} color="#5599cc" />
            <pointLight position={[-5, -3, 3]} intensity={0.35} color="#8855cc" />
            <pointLight position={[3, -5, -2]} intensity={0.25} color="#cc5588" />
            <directionalLight position={[0, 10, 5]} intensity={0.2} color="#88aacc" />
            <directionalLight position={[-5, -5, 10]} intensity={0.1} color="#aa88cc" />
            <ScrollScene scrollProgress={scrollProgress} />
            <EffectComposer multisampling={0}>
              <Bloom
                intensity={1.2}
                luminanceThreshold={0.15}
                luminanceSmoothing={0.8}
                mipmapBlur
              />
              <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={[0.0004, 0.0004]}
              />
              <Glitch
                delay={glitchDelay}
                duration={glitchDuration}
                strength={glitchStrength}
                mode={GlitchMode.SPORADIC}
                active
                ratio={0.85}
              />
              <Vignette darkness={0.7} offset={0.2} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
