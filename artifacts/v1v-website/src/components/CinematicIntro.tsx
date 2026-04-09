import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onComplete: () => void;
}

const INTRO_LINES = [
  { text: "WELCOME TO", sub: "V1V SPACE", duration: 2400 },
  { text: "EXPERIENCE SOMETHING", sub: "UNBELIEVABLE", duration: 2400 },
  { text: "WHERE CREATIVITY", sub: "MEETS TECHNOLOGY", duration: 2200 },
  { text: "WE CRAFT DIGITAL", sub: "EXPERIENCES", duration: 2200 },
  { text: "ENTER", sub: "THE WORLD", duration: 2000 },
];

export function CinematicIntro({ onComplete }: Props) {
  const [currentLine, setCurrentLine] = useState(0);
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[] = [];
    const colors = ["85,170,255", "170,85,255", "255,85,170", "85,255,170"];
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.3 + 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let raf: number;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = window.innerWidth;
        if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        if (p.y > window.innerHeight) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const totalDuration = INTRO_LINES.reduce((sum, l) => sum + l.duration + 800, 0);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(1, elapsed / totalDuration));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentLine >= INTRO_LINES.length) {
      setVisible(false);
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }

    const line = INTRO_LINES[currentLine];
    setPhase("in");

    const inTimer = setTimeout(() => {
      setPhase("hold");
    }, 600);

    const holdTimer = setTimeout(() => {
      setPhase("out");
    }, 600 + line.duration);

    const nextTimer = setTimeout(() => {
      setCurrentLine((c) => c + 1);
    }, 600 + line.duration + 600);

    return () => {
      clearTimeout(inTimer);
      clearTimeout(holdTimer);
      clearTimeout(nextTimer);
    };
  }, [currentLine, onComplete]);

  const handleSkip = useCallback(() => {
    setVisible(false);
    setTimeout(onComplete, 300);
  }, [onComplete]);

  const line = currentLine < INTRO_LINES.length ? INTRO_LINES[currentLine] : null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#030812] flex flex-col items-center justify-center overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse 60% 50% at 50% 50%, rgba(40,80,160,0.08) 0%, transparent 70%),
                  radial-gradient(ellipse 40% 30% at 30% 40%, rgba(120,50,180,0.05) 0%, transparent 60%)
                `,
              }}
            />
          </div>

          <div className="relative z-10 text-center px-8">
            <AnimatePresence mode="wait">
              {line && (
                <motion.div
                  key={currentLine}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase === "out" ? 0 : 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.p
                    initial={{ opacity: 0, y: 30, letterSpacing: "0.5em" }}
                    animate={{
                      opacity: phase === "out" ? 0 : 0.4,
                      y: phase === "out" ? -20 : 0,
                      letterSpacing: "0.3em",
                    }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-xs md:text-sm font-mono text-[rgba(85,170,255,0.4)] tracking-[0.3em] uppercase mb-4"
                  >
                    {line.text}
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{
                      opacity: phase === "out" ? 0 : 1,
                      y: phase === "out" ? -30 : 0,
                      scale: phase === "out" ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl md:text-7xl lg:text-8xl font-black tracking-[-0.04em] text-white"
                    style={{
                      textShadow: "0 0 40px rgba(85,170,255,0.15), 0 0 80px rgba(85,170,255,0.05)",
                    }}
                  >
                    {line.sub}
                  </motion.h1>

                  {currentLine === INTRO_LINES.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 0.6, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                      className="mt-8"
                    >
                      <div className="w-[1px] h-12 bg-gradient-to-b from-[rgba(85,170,255,0.4)] to-transparent mx-auto animate-pulse" />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-48">
            <div className="w-full h-[1px] bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[rgba(85,170,255,0.3)] to-[rgba(170,85,255,0.3)]"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="absolute bottom-8 right-8 z-10 text-[8px] tracking-[0.3em] uppercase text-[rgba(255,255,255,0.15)] hover:text-[rgba(255,255,255,0.4)] transition-colors font-mono interactive"
          >
            SKIP
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
