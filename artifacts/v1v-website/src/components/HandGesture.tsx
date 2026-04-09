import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HandPosition {
  x: number;
  y: number;
}

interface Props {
  onHandMove: (position: HandPosition | null) => void;
}

export function HandGesture({ onHandMove }: Props) {
  const [showPrompt, setShowPrompt] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [denied, setDenied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const prevCenterRef = useRef<{ x: number; y: number } | null>(null);
  const noDetectCount = useRef(0);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setShowPrompt(false);
    } catch {
      setDenied(true);
      setTimeout(() => setShowPrompt(false), 2000);
    }
  }, []);

  useEffect(() => {
    if (!cameraActive || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = 160;
    canvas.height = 120;

    function detectHand() {
      if (!ctx || !video || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(detectHand);
        return;
      }

      ctx.drawImage(video, 0, 0, 160, 120);
      const imageData = ctx.getImageData(0, 0, 160, 120);
      const pixels = imageData.data;

      let sumX = 0;
      let sumY = 0;
      let count = 0;

      for (let y = 0; y < 120; y += 2) {
        for (let x = 0; x < 160; x += 2) {
          const i = (y * 160 + x) * 4;
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);

          const isSkin =
            (r > 50 && g > 30 && b > 15 &&
            r > g && (r - g) > 10 &&
            max - min > 10 &&
            max - min < 200) ||
            (r > 180 && g > 130 && b > 80 &&
            r > g && r > b);

          if (isSkin) {
            sumX += x;
            sumY += y;
            count++;
          }
        }
      }

      if (count > 30) {
        noDetectCount.current = 0;
        const cx = sumX / count;
        const cy = sumY / count;

        const rawX = -((cx / 160) * 2 - 1);
        const rawY = -((cy / 120) * 2 - 1);

        const smoothing = 0.25;
        const prev = prevCenterRef.current;
        const smoothX = prev ? prev.x + (rawX - prev.x) * smoothing : rawX;
        const smoothY = prev ? prev.y + (rawY - prev.y) * smoothing : rawY;
        prevCenterRef.current = { x: smoothX, y: smoothY };

        onHandMove({ x: smoothX, y: smoothY });
      } else {
        noDetectCount.current++;
        if (noDetectCount.current > 10) {
          prevCenterRef.current = null;
          onHandMove(null);
        }
      }

      rafRef.current = requestAnimationFrame(detectHand);
    }

    rafRef.current = requestAnimationFrame(detectHand);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [cameraActive, onHandMove]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const dismiss = useCallback(() => {
    setShowPrompt(false);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] pointer-events-auto"
          >
            <div className="bg-[rgba(10,15,25,0.9)] backdrop-blur-xl border border-[rgba(85,170,255,0.15)] rounded-2xl px-6 sm:px-8 py-4 sm:py-5 flex flex-col items-center gap-3 sm:gap-4 shadow-[0_0_40px_rgba(85,170,255,0.1)] max-w-[90vw]">
              <div className="flex items-center gap-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(85,170,255,0.7)" strokeWidth="1.5" className="flex-shrink-0">
                  <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v1M14 7V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4M10 8V3a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7" />
                  <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8H12a8 8 0 0 1-8-8V8a2 2 0 1 1 4 0" />
                </svg>
                <p className="text-[10px] sm:text-[11px] tracking-[0.12em] sm:tracking-[0.15em] text-[rgba(255,255,255,0.6)] font-mono uppercase">
                  {denied ? "Camera access denied" : "For hand gesture, allow camera access"}
                </p>
              </div>

              {!denied && (
                <div className="flex gap-3">
                  <button
                    onClick={startCamera}
                    className="px-5 sm:px-6 py-2 bg-[rgba(85,170,255,0.15)] border border-[rgba(85,170,255,0.3)] text-[rgba(85,170,255,0.9)] text-[10px] tracking-[0.2em] uppercase font-mono rounded-full hover:bg-[rgba(85,170,255,0.25)] transition-all interactive"
                  >
                    ALLOW
                  </button>
                  <button
                    onClick={dismiss}
                    className="px-5 sm:px-6 py-2 border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.3)] text-[10px] tracking-[0.2em] uppercase font-mono rounded-full hover:text-[rgba(255,255,255,0.5)] transition-all interactive"
                  >
                    SKIP
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}
