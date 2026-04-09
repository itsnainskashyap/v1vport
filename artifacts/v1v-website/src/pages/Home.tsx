import { useEffect, useState, useRef, useCallback } from "react";
import { CustomCursor } from "@/components/CustomCursor";
import { Scene } from "@/components/canvas/Scene";
import { UIOverlay } from "@/components/UIOverlay";
import { LoadingScreen } from "@/components/LoadingScreen";
import { HandGesture } from "@/components/HandGesture";
import { useThemeColors } from "@/hooks/useThemeColors";
import Lenis from "lenis";

const SCROLL_HEIGHT = 700;

const SECTION_TARGETS: Record<string, number> = {
  hero: 0,
  work: 0.4,
  contact: 0.88,
};

interface HandPosition {
  x: number;
  y: number;
}

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [handPosition, setHandPosition] = useState<HandPosition | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useThemeColors();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.7,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", (e: { progress: number }) => {
      setScrollProgress(e.progress);
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

  const handleNavigate = useCallback((section: string) => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    const target = SECTION_TARGETS[section];
    if (target === undefined) return;
    const scrollContainer = document.documentElement;
    const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    lenis.scrollTo(target * maxScroll, { duration: 2.5 });
  }, []);

  const handleLoadComplete = useCallback(() => setLoaded(true), []);

  const handleHandMove = useCallback((position: HandPosition | null) => {
    setHandPosition(position);
  }, []);

  return (
    <>
      {!loaded && <LoadingScreen onComplete={handleLoadComplete} />}

      <div className="fixed inset-0 z-0">
        <Scene scrollProgress={scrollProgress} handPosition={handPosition} />
      </div>

      <UIOverlay scrollProgress={scrollProgress} onNavigate={handleNavigate} />

      <div style={{ height: `${SCROLL_HEIGHT}vh` }} className="pointer-events-none" aria-hidden="true" />

      {loaded && <HandGesture onHandMove={handleHandMove} />}

      <CustomCursor />
    </>
  );
}
