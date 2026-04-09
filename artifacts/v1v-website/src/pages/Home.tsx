import { useEffect, useState, useRef, useCallback } from "react";
import { CustomCursor } from "@/components/CustomCursor";
import { Scene } from "@/components/canvas/Scene";
import { UIOverlay } from "@/components/UIOverlay";
import { CinematicIntro } from "@/components/CinematicIntro";
import { SoundManager } from "@/components/SoundManager";
import { HandGesture } from "@/components/HandGesture";
import { useThemeColors } from "@/hooks/useThemeColors";
import Lenis from "lenis";

const SCROLL_HEIGHT = 800;

const SECTION_TARGETS: Record<string, number> = {
  hero: 0,
  work: 0.35,
  contact: 0.88,
};

interface HandPosition {
  x: number;
  y: number;
}

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [handPosition, setHandPosition] = useState<HandPosition | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
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

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    setTimeout(() => setSceneReady(true), 500);
  }, []);

  const handleHandMove = useCallback((position: HandPosition | null) => {
    setHandPosition(position);
  }, []);

  const handleGestureScroll = useCallback((direction: "up" | "down") => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    const scrollContainer = document.documentElement;
    const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    const currentScroll = window.scrollY;
    const step = maxScroll * 0.05;

    if (direction === "down") {
      lenis.scrollTo(Math.min(currentScroll + step, maxScroll), { duration: 1.2 });
    } else {
      lenis.scrollTo(Math.max(currentScroll - step, 0), { duration: 1.2 });
    }
  }, []);

  const handleGestureSelect = useCallback(() => {
    const clickableElements = document.querySelectorAll(".interactive");
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    let closest: Element | null = null;
    let closestDist = Infinity;

    clickableElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const elCenterX = rect.left + rect.width / 2;
      const elCenterY = rect.top + rect.height / 2;
      const dist = Math.hypot(elCenterX - centerX, elCenterY - centerY);
      if (dist < closestDist) {
        closestDist = dist;
        closest = el;
      }
    });

    if (closest && closestDist < 200) {
      (closest as HTMLElement).click();
    }
  }, []);

  const handleCardClick = useCallback((index: number) => {
    setSelectedCardIndex(index);
  }, []);

  const handleClearCardSelection = useCallback(() => {
    setSelectedCardIndex(null);
  }, []);

  return (
    <>
      {!introComplete && <CinematicIntro onComplete={handleIntroComplete} />}

      <div className="fixed inset-0 z-0">
        {introComplete ? (
          <Scene scrollProgress={scrollProgress} handPosition={handPosition} onCardClick={handleCardClick} />
        ) : (
          <div className="w-full h-full bg-[#030812]" />
        )}
      </div>

      <UIOverlay
        scrollProgress={scrollProgress}
        onNavigate={handleNavigate}
        selectedCardIndex={selectedCardIndex}
        onClearCardSelection={handleClearCardSelection}
      />

      <div style={{ height: `${SCROLL_HEIGHT}vh` }} className="pointer-events-none" aria-hidden="true" />

      {sceneReady && (
        <HandGesture
          onHandMove={handleHandMove}
          onGestureScroll={handleGestureScroll}
          onGestureSelect={handleGestureSelect}
        />
      )}

      <SoundManager scrollProgress={scrollProgress} active={introComplete} />

      <CustomCursor />
    </>
  );
}
