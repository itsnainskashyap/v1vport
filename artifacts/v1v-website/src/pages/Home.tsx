import { useEffect, useState, useRef, useCallback } from "react";
import { CustomCursor } from "@/components/CustomCursor";
import { Scene } from "@/components/canvas/Scene";
import { UIOverlay } from "@/components/UIOverlay";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useThemeColors } from "@/hooks/useThemeColors";
import Lenis from "lenis";

const SCROLL_HEIGHT = 600;

const SECTION_TARGETS: Record<string, number> = {
  hero: 0,
  about: 0.16,
  work: 0.35,
  lab: 0.7,
  contact: 0.88,
};

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  useThemeColors();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.8,
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
    lenis.scrollTo(target * maxScroll, { duration: 2.0 });
  }, []);

  const handleLoadComplete = useCallback(() => setLoaded(true), []);

  return (
    <>
      {!loaded && <LoadingScreen onComplete={handleLoadComplete} />}

      <div className="fixed inset-0 z-0">
        <Scene scrollProgress={scrollProgress} />
      </div>

      <UIOverlay scrollProgress={scrollProgress} onNavigate={handleNavigate} />

      <div style={{ height: `${SCROLL_HEIGHT}vh` }} className="pointer-events-none" aria-hidden="true" />

      <CustomCursor />
    </>
  );
}
