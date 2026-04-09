import { useEffect } from "react";
import { CustomCursor } from "@/components/CustomCursor";
import { Scene } from "@/components/canvas/Scene";
import { CanvasErrorBoundary } from "@/components/canvas/CanvasErrorBoundary";
import { UIOverlay } from "@/components/UIOverlay";
import Lenis from "lenis";

function WebGLFallback() {
  return (
    <div className="w-full h-full bg-[#050510] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-primary/10 rounded-full animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-secondary/10 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="relative w-full bg-background text-foreground">
      <CustomCursor />
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <CanvasErrorBoundary fallback={<WebGLFallback />}>
          <Scene />
        </CanvasErrorBoundary>
      </div>

      <div className="relative z-10 w-full pointer-events-none">
        <UIOverlay />
      </div>
    </main>
  );
}
