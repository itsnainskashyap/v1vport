import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onComplete: () => void;
}

const INTRO_LINES = [
  { text: "WELCOME TO", sub: "V1V SPACE", duration: 2200, style: "hero" as const },
  { text: "EXPERIENCE SOMETHING", sub: "UNBELIEVABLE", duration: 2200, style: "glow" as const },
  { text: "WHERE CREATIVITY", sub: "MEETS TECHNOLOGY", duration: 2000, style: "split" as const },
  { text: "WE CRAFT", sub: "DIGITAL WORLDS", duration: 2000, style: "zoom" as const },
  { text: "", sub: "ENTER THE WORLD", duration: 1800, style: "final" as const },
];

export function CinematicIntro({ onComplete }: Props) {
  const [currentLine, setCurrentLine] = useState(0);
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const warpRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const stars: { x: number; y: number; z: number; prevZ: number; color: string }[] = [];
    const colors = ["85,170,255", "170,85,255", "255,85,170", "85,255,170", "255,200,100"];
    for (let i = 0; i < 600; i++) {
      stars.push({
        x: (Math.random() - 0.5) * w * 3,
        y: (Math.random() - 0.5) * h * 3,
        z: Math.random() * 1500,
        prevZ: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let raf: number;
    const speed = 8;

    function draw() {
      if (!ctx) return;
      ctx.fillStyle = "rgba(3,8,18,0.15)";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      for (const star of stars) {
        star.prevZ = star.z;
        star.z -= speed;
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * w * 3;
          star.y = (Math.random() - 0.5) * h * 3;
          star.z = 1500;
          star.prevZ = 1500;
        }

        const sx = (star.x / star.z) * 100 + cx;
        const sy = (star.y / star.z) * 100 + cy;
        const px = (star.x / star.prevZ) * 100 + cx;
        const py = (star.y / star.prevZ) * 100 + cy;

        const brightness = Math.max(0, 1 - star.z / 1500);
        const alpha = brightness * 0.8;
        const lineWidth = brightness * 2;

        ctx.strokeStyle = `rgba(${star.color},${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        if (brightness > 0.6) {
          ctx.beginPath();
          ctx.arc(sx, sy, brightness * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${star.color},${alpha * 0.5})`;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    ctx.fillStyle = "#030812";
    ctx.fillRect(0, 0, w, h);
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const warp = warpRef.current;
    if (!warp) return;
    const ctx = warp.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    warp.width = w * dpr;
    warp.height = h * dpr;
    ctx.scale(dpr, dpr);

    let raf: number;
    let time = 0;

    function drawRings() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      time += 0.02;
      const cx = w / 2;
      const cy = h / 2;

      for (let i = 0; i < 8; i++) {
        const radius = 50 + i * 60 + Math.sin(time + i * 0.5) * 20;
        const alpha = 0.03 + Math.sin(time * 0.5 + i) * 0.02;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(85,170,255,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (let i = 0; i < 4; i++) {
        const angle = time * 0.3 + (i * Math.PI) / 2;
        const len = 200 + Math.sin(time + i) * 50;
        const x1 = cx + Math.cos(angle) * 30;
        const y1 = cy + Math.sin(angle) * 30;
        const x2 = cx + Math.cos(angle) * len;
        const y2 = cy + Math.sin(angle) * len;
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, "rgba(85,170,255,0.08)");
        gradient.addColorStop(1, "rgba(85,170,255,0)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      raf = requestAnimationFrame(drawRings);
    }
    raf = requestAnimationFrame(drawRings);
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

    const inTimer = setTimeout(() => setPhase("hold"), 600);
    const holdTimer = setTimeout(() => setPhase("out"), 600 + line.duration);
    const nextTimer = setTimeout(() => setCurrentLine((c) => c + 1), 600 + line.duration + 600);

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
          <canvas ref={warpRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: "screen" }} />

          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse 50% 50% at 50% 50%, rgba(40,80,180,0.12) 0%, transparent 70%),
                  radial-gradient(ellipse 30% 30% at 30% 40%, rgba(120,50,180,0.06) 0%, transparent 60%),
                  radial-gradient(ellipse 30% 30% at 70% 60%, rgba(255,85,170,0.04) 0%, transparent 60%)
                `,
              }}
            />
          </div>

          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 120% 120% at 50% 50%, transparent 20%, rgba(3,8,18,0.6) 80%)",
          }} />

          <div className="relative z-10 text-center px-8">
            <AnimatePresence mode="wait">
              {line && (
                <motion.div
                  key={currentLine}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase === "out" ? 0 : 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative"
                >
                  {line.style === "hero" && (
                    <>
                      <motion.p
                        initial={{ opacity: 0, y: 30, letterSpacing: "0.8em" }}
                        animate={{
                          opacity: phase === "out" ? 0 : 0.35,
                          y: phase === "out" ? -20 : 0,
                          letterSpacing: "0.4em",
                        }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-xs md:text-sm font-mono text-[rgba(85,170,255,0.35)] tracking-[0.4em] uppercase mb-6"
                      >
                        {line.text}
                      </motion.p>
                      <motion.h1
                        initial={{ opacity: 0, y: 60, scale: 0.85 }}
                        animate={{
                          opacity: phase === "out" ? 0 : 1,
                          y: phase === "out" ? -40 : 0,
                          scale: phase === "out" ? 1.1 : 1,
                        }}
                        transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl md:text-8xl lg:text-9xl font-black tracking-[-0.04em] text-white"
                        style={{ textShadow: "0 0 60px rgba(85,170,255,0.2), 0 0 120px rgba(85,170,255,0.08)" }}
                      >
                        {line.sub}
                      </motion.h1>
                    </>
                  )}

                  {line.style === "glow" && (
                    <>
                      <motion.p
                        initial={{ opacity: 0, letterSpacing: "0.6em" }}
                        animate={{
                          opacity: phase === "out" ? 0 : 0.3,
                          letterSpacing: "0.3em",
                        }}
                        transition={{ duration: 0.8 }}
                        className="text-xs md:text-sm font-mono text-[rgba(170,85,255,0.4)] uppercase mb-6"
                      >
                        {line.text}
                      </motion.p>
                      <motion.h1
                        initial={{ opacity: 0, scale: 1.3, filter: "blur(20px)" }}
                        animate={{
                          opacity: phase === "out" ? 0 : 1,
                          scale: phase === "out" ? 0.95 : 1,
                          filter: phase === "out" ? "blur(10px)" : "blur(0px)",
                        }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl md:text-8xl lg:text-9xl font-black tracking-[-0.04em]"
                        style={{
                          background: "linear-gradient(135deg, #55aaff, #aa55ff, #ff55aa)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          filter: phase === "hold" ? "drop-shadow(0 0 40px rgba(170,85,255,0.3))" : undefined,
                        }}
                      >
                        {line.sub}
                      </motion.h1>
                    </>
                  )}

                  {line.style === "split" && (
                    <div className="flex flex-col items-center gap-2">
                      <motion.p
                        initial={{ opacity: 0, x: -100 }}
                        animate={{
                          opacity: phase === "out" ? 0 : 0.35,
                          x: phase === "out" ? -50 : 0,
                        }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-lg md:text-2xl font-mono text-[rgba(85,170,255,0.35)] tracking-[0.3em] uppercase"
                      >
                        {line.text}
                      </motion.p>
                      <motion.h1
                        initial={{ opacity: 0, x: 100 }}
                        animate={{
                          opacity: phase === "out" ? 0 : 1,
                          x: phase === "out" ? 50 : 0,
                        }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl md:text-8xl lg:text-9xl font-black tracking-[-0.04em] text-white"
                        style={{ textShadow: "0 0 50px rgba(85,170,255,0.15)" }}
                      >
                        {line.sub}
                      </motion.h1>
                    </div>
                  )}

                  {line.style === "zoom" && (
                    <>
                      <motion.p
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                          opacity: phase === "out" ? 0 : 0.3,
                          scale: phase === "out" ? 1.2 : 1,
                        }}
                        transition={{ duration: 0.6 }}
                        className="text-xs md:text-sm font-mono text-[rgba(255,170,85,0.4)] tracking-[0.3em] uppercase mb-6"
                      >
                        {line.text}
                      </motion.p>
                      <motion.h1
                        initial={{ opacity: 0, scale: 3, filter: "blur(30px)" }}
                        animate={{
                          opacity: phase === "out" ? 0 : 1,
                          scale: phase === "out" ? 0.8 : 1,
                          filter: "blur(0px)",
                        }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl md:text-8xl lg:text-9xl font-black tracking-[-0.04em] text-white"
                        style={{ textShadow: "0 0 60px rgba(255,170,85,0.15)" }}
                      >
                        {line.sub}
                      </motion.h1>
                    </>
                  )}

                  {line.style === "final" && (
                    <motion.div className="relative">
                      <motion.h1
                        initial={{ opacity: 0, y: 40, letterSpacing: "0.2em" }}
                        animate={{
                          opacity: phase === "out" ? 0 : 1,
                          y: phase === "out" ? -20 : 0,
                          letterSpacing: phase === "hold" ? "0.15em" : "0.3em",
                        }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-4xl md:text-7xl lg:text-8xl font-black text-white"
                        style={{ textShadow: "0 0 80px rgba(85,170,255,0.3), 0 0 160px rgba(85,170,255,0.1)" }}
                      >
                        {line.sub}
                      </motion.h1>
                      <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 0.5, scaleX: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="mt-6 mx-auto w-32 h-[1px] bg-gradient-to-r from-transparent via-[rgba(85,170,255,0.5)] to-transparent"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0.4, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="mt-4"
                      >
                        <div className="w-[1px] h-10 bg-gradient-to-b from-[rgba(85,170,255,0.4)] to-transparent mx-auto animate-pulse" />
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            className="absolute top-6 left-6 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-[9px] font-mono tracking-[0.3em] text-[rgba(255,255,255,0.3)]">V1V STUDIO</p>
          </motion.div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-48">
            <div className="w-full h-[2px] bg-[rgba(255,255,255,0.03)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[rgba(85,170,255,0.5)] via-[rgba(170,85,255,0.4)] to-[rgba(255,85,170,0.3)]"
                style={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-[7px] font-mono tracking-[0.2em] text-[rgba(255,255,255,0.1)] text-center mt-2">
              {Math.round(progress * 100)}%
            </p>
          </div>

          <button
            onClick={handleSkip}
            className="absolute bottom-8 right-8 z-10 text-[8px] tracking-[0.3em] uppercase text-[rgba(255,255,255,0.12)] hover:text-[rgba(255,255,255,0.4)] transition-colors font-mono interactive px-3 py-1 border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] rounded-full"
          >
            SKIP
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
