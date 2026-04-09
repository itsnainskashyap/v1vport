import { useEffect, useRef, useCallback, useState } from "react";

interface Props {
  scrollProgress: number;
  active: boolean;
}

export function SoundManager({ scrollProgress, active }: Props) {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const initAttempted = useRef(false);

  const initAudio = useCallback(() => {
    if (ctxRef.current || !active || initAttempted.current) return;
    initAttempted.current = true;
    try {
      const ctx = new AudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      ctxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.12;
      masterGain.connect(ctx.destination);
      gainRef.current = masterGain;

      const pad1 = createPad(ctx, 65.41, masterGain);
      const pad2 = createPad(ctx, 98.0, masterGain);
      const pad3 = createPad(ctx, 130.81, masterGain);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.08;
      lfo.type = "sine";
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain);
      lfoGain.connect(pad1.frequency);
      lfo.start();

      createAtmosphere(ctx, masterGain);

      setStarted(true);
    } catch {
      initAttempted.current = false;
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const handleInteraction = () => {
      initAudio();
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("wheel", handleInteraction);
    };
    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("wheel", handleInteraction);
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("wheel", handleInteraction);
    };
  }, [active, initAudio]);

  useEffect(() => {
    if (!gainRef.current || !ctxRef.current) return;
    const baseVol = 0.12;
    const dnaBoost = scrollProgress > 0.2 && scrollProgress < 0.7 ? 0.04 : 0;
    const contactFade = scrollProgress > 0.85 ? (1 - (scrollProgress - 0.85) / 0.15) : 1;
    const targetVol = muted ? 0 : (baseVol + dnaBoost) * contactFade;
    gainRef.current.gain.setTargetAtTime(
      targetVol,
      ctxRef.current.currentTime,
      0.1
    );
  }, [scrollProgress, muted]);

  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleClick = useCallback(() => {
    if (!started) {
      initAudio();
    } else {
      setMuted((m) => !m);
    }
  }, [started, initAudio]);

  if (!active) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-8 right-8 z-50 w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] hover:border-[rgba(85,170,255,0.3)] transition-all interactive"
      title={!started ? "Enable Sound" : muted ? "Unmute" : "Mute"}
    >
      {!started || muted ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(85,170,255,0.5)" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  );
}

function createPad(ctx: AudioContext, freq: number, dest: AudioNode): OscillatorNode {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.value = 0.08;
  filter.type = "lowpass";
  filter.frequency.value = 800;
  filter.Q.value = 1;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  osc.start();

  return osc;
}

function createAtmosphere(ctx: AudioContext, dest: AudioNode) {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.01;
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 200;
  filter.Q.value = 0.5;

  const gain = ctx.createGain();
  gain.gain.value = 0.15;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  source.start();
}
