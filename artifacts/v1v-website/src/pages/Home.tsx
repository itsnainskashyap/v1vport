import { useEffect, useState, useRef, useCallback } from "react";
import { CustomCursor } from "@/components/CustomCursor";
import { Scene } from "@/components/canvas/Scene";
import { UIOverlay } from "@/components/UIOverlay";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useThemeColors } from "@/hooks/useThemeColors";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  useThemeColors();

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
    lenisRef.current = lenis;

    lenis.on("scroll", (e: { progress: number }) => {
      setScrollProgress(e.progress);
      ScrollTrigger.update();
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

  useEffect(() => {
    const localTriggers: ScrollTrigger[] = [];
    const sections = document.querySelectorAll("[data-gsap-section]");
    sections.forEach((section) => {
      const tween = gsap.fromTo(
        section,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            end: "top 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
      const st = tween.scrollTrigger;
      if (st) localTriggers.push(st);
    });
    triggersRef.current = localTriggers;

    return () => {
      localTriggers.forEach((st) => st.kill());
    };
  }, []);

  const gestureStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pinchStartRef = useRef<number | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    gestureStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!gestureStartRef.current) return;
    const dy = e.clientY - gestureStartRef.current.y;
    const dx = e.clientX - gestureStartRef.current.x;
    const dt = Date.now() - gestureStartRef.current.time;

    if (Math.abs(dy) > 80 && dt < 500 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      const lenis = lenisRef.current;
      if (lenis) {
        const direction = dy < 0 ? 1 : -1;
        lenis.scrollTo(window.scrollY + direction * window.innerHeight * 0.8, {
          duration: 0.8,
        });
      }
    }

    gestureStartRef.current = null;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const delta = currentDist - pinchStartRef.current;

      if (Math.abs(delta) > 30) {
        const lenis = lenisRef.current;
        if (lenis) {
          const direction = delta < 0 ? 1 : -1;
          lenis.scrollTo(window.scrollY + direction * window.innerHeight * 0.5, {
            duration: 0.6,
          });
        }
        pinchStartRef.current = currentDist;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    pinchStartRef.current = null;
  }, []);

  const handleLoadComplete = useCallback(() => setLoaded(true), []);

  return (
    <>
      {!loaded && <LoadingScreen onComplete={handleLoadComplete} />}
      <main
        ref={mainRef}
        className="relative w-full bg-background text-foreground touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CustomCursor />

        <div className="fixed inset-0 z-0 pointer-events-none">
          <Scene scrollProgress={scrollProgress} />
        </div>

        <div className="relative z-10 w-full pointer-events-none">
          <UIOverlay />
        </div>
      </main>
    </>
  );
}
