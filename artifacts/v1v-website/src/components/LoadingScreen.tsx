import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 1500;
    let rafId: number;
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;

    function tick() {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      progressRef.current = eased;
      setProgress(eased);
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        t1 = setTimeout(() => {
          setVisible(false);
          t2 = setTimeout(onComplete, 600);
        }, 300);
      }
    }
    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animRaf: number;
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = 200 * dpr;
    canvas.height = 200 * dpr;
    ctx.scale(dpr, dpr);

    function draw() {
      if (!ctx) return;
      const currentProgress = progressRef.current;
      ctx.clearRect(0, 0, 200, 200);
      const cx = 100;
      const cy = 100;
      const r = 60;
      const t = Date.now() * 0.001;

      ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      const angle = currentProgress * Math.PI * 2 - Math.PI / 2;
      ctx.strokeStyle = "rgba(0, 240, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, angle);
      ctx.stroke();

      const glowGrad = ctx.createRadialGradient(
        cx + Math.cos(angle) * r,
        cy + Math.sin(angle) * r,
        0,
        cx + Math.cos(angle) * r,
        cy + Math.sin(angle) * r,
        12
      );
      glowGrad.addColorStop(0, "rgba(0, 240, 255, 0.6)");
      glowGrad.addColorStop(1, "rgba(0, 240, 255, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(139, 92, 246, 0.12)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(139, 92, 246, 0.06)";
      ctx.beginPath();
      ctx.arc(cx, cy, r + 30, 0, Math.PI * 2);
      ctx.stroke();

      const innerR = 20;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.5);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
      ctx.lineWidth = 0.8;
      const sides = 6;
      ctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const a = (i / sides) * Math.PI * 2;
        const px = Math.cos(a) * innerR;
        const py = Math.sin(a) * innerR;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();

      animRaf = requestAnimationFrame(draw);
    }
    animRaf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRaf);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#050510] flex flex-col items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="w-[200px] h-[200px] mb-8"
          />
          <p className="text-xs font-mono tracking-[0.3em] text-foreground/30 mb-2">
            V1V STUDIO
          </p>
          <p className="text-xs font-mono tracking-[0.15em] text-primary/50">
            {Math.round(progress * 100)}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
