import { useEffect, useRef, useCallback, useState } from "react";

interface Props {
  scrollProgress: number;
  active: boolean;
}

interface AudioLayers {
  masterGain: GainNode;
  bassGain: GainNode;
  bassFilter: BiquadFilterNode;
  highGain: GainNode;
  highFilter: BiquadFilterNode;
  whooshGain: GainNode;
  whooshFilter: BiquadFilterNode;
  padFilters: BiquadFilterNode[];
}

export function SoundManager({ scrollProgress, active }: Props) {
  const ctxRef = useRef<AudioContext | null>(null);
  const layersRef = useRef<AudioLayers | null>(null);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const initAttempted = useRef(false);
  const prevScroll = useRef(0);
  const smoothSpeed = useRef(0);

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

      const padFilters: BiquadFilterNode[] = [];
      const pad1 = createPad(ctx, 65.41, masterGain, padFilters);
      createPad(ctx, 98.0, masterGain, padFilters);
      createPad(ctx, 130.81, masterGain, padFilters);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.08;
      lfo.type = "sine";
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain);
      lfoGain.connect(pad1.frequency);
      lfo.start();

      createAtmosphere(ctx, masterGain);

      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      const bassFilter = ctx.createBiquadFilter();
      bassOsc.type = "sine";
      bassOsc.frequency.value = 35;
      bassGain.gain.value = 0;
      bassFilter.type = "lowpass";
      bassFilter.frequency.value = 100;
      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(masterGain);
      bassOsc.start();

      const bassOsc2 = ctx.createOscillator();
      bassOsc2.type = "sine";
      bassOsc2.frequency.value = 55;
      const bGain2 = ctx.createGain();
      bGain2.gain.value = 0;
      bassOsc2.connect(bGain2);
      bGain2.connect(bassGain);
      bassOsc2.start();

      const highOsc = ctx.createOscillator();
      const highGain = ctx.createGain();
      const highFilter = ctx.createBiquadFilter();
      highOsc.type = "sine";
      highOsc.frequency.value = 2200;
      highGain.gain.value = 0;
      highFilter.type = "bandpass";
      highFilter.frequency.value = 2500;
      highFilter.Q.value = 8;
      highOsc.connect(highFilter);
      highFilter.connect(highGain);
      highGain.connect(masterGain);
      highOsc.start();

      const highOsc2 = ctx.createOscillator();
      highOsc2.type = "sine";
      highOsc2.frequency.value = 3300;
      const hGain2 = ctx.createGain();
      hGain2.gain.value = 0;
      highOsc2.connect(hGain2);
      hGain2.connect(highGain);
      highOsc2.start();

      const whooshBufferSize = ctx.sampleRate * 2;
      const whooshBuffer = ctx.createBuffer(2, whooshBufferSize, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = whooshBuffer.getChannelData(ch);
        for (let i = 0; i < whooshBufferSize; i++) {
          d[i] = (Math.random() * 2 - 1) * 0.5;
        }
      }
      const whooshSrc = ctx.createBufferSource();
      whooshSrc.buffer = whooshBuffer;
      whooshSrc.loop = true;
      const whooshFilter = ctx.createBiquadFilter();
      whooshFilter.type = "bandpass";
      whooshFilter.frequency.value = 600;
      whooshFilter.Q.value = 2;
      const whooshGain = ctx.createGain();
      whooshGain.gain.value = 0;
      whooshSrc.connect(whooshFilter);
      whooshFilter.connect(whooshGain);
      whooshGain.connect(masterGain);
      whooshSrc.start();

      layersRef.current = {
        masterGain,
        bassGain,
        bassFilter,
        highGain,
        highFilter,
        whooshGain,
        whooshFilter,
        padFilters,
      };

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

  const scrollProgressRef = useRef(scrollProgress);
  const mutedRef = useRef(muted);
  scrollProgressRef.current = scrollProgress;
  mutedRef.current = muted;

  useEffect(() => {
    if (!layersRef.current || !ctxRef.current) return;
    const ctx = ctxRef.current;
    const layers = layersRef.current;
    const t = ctx.currentTime;

    const baseVol = 0.12;
    const contactFade = scrollProgress > 0.85 ? (1 - (scrollProgress - 0.85) / 0.15) : 1;
    const targetVol = muted ? 0 : baseVol * contactFade;
    layers.masterGain.gain.setTargetAtTime(targetVol, t, 0.1);

    const nearAsteroid = scrollProgress > 0.35 && scrollProgress < 0.65;
    const asteroidIntensity = nearAsteroid
      ? 1 - Math.abs(scrollProgress - 0.5) / 0.15
      : 0;
    layers.bassGain.gain.setTargetAtTime(
      Math.min(1, asteroidIntensity) * 0.15, t, 0.3
    );
    layers.bassFilter.frequency.setTargetAtTime(
      60 + asteroidIntensity * 80, t, 0.3
    );

    const inOpenSpace = scrollProgress < 0.2 || (scrollProgress > 0.7 && scrollProgress < 0.85);
    layers.highGain.gain.setTargetAtTime(
      inOpenSpace ? 0.02 : 0, t, 0.5
    );

    const padCutoff = 400 + scrollProgress * 600 + asteroidIntensity * 300;
    layers.padFilters.forEach((f) => {
      f.frequency.setTargetAtTime(padCutoff, t, 0.3);
    });
  }, [scrollProgress, muted]);

  useEffect(() => {
    if (!started || !layersRef.current || !ctxRef.current) return;
    let raf: number;
    const tick = () => {
      if (!layersRef.current || !ctxRef.current) return;
      const scrollDelta = Math.abs(scrollProgressRef.current - prevScroll.current);
      prevScroll.current = scrollProgressRef.current;
      const rawSpeed = scrollDelta * 60;
      smoothSpeed.current += (rawSpeed - smoothSpeed.current) * 0.08;
      if (smoothSpeed.current < 0.001) smoothSpeed.current = 0;
      const whooshVol = Math.min(1, Math.max(0, (smoothSpeed.current - 0.1) * 2));
      const t = ctxRef.current.currentTime;
      layersRef.current.whooshGain.gain.setTargetAtTime(
        (mutedRef.current ? 0 : whooshVol) * 0.08, t, 0.05
      );
      layersRef.current.whooshFilter.frequency.setTargetAtTime(
        400 + whooshVol * 1200, t, 0.05
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started]);

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

function createPad(ctx: AudioContext, freq: number, dest: AudioNode, filterStore: BiquadFilterNode[]): OscillatorNode {
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

  filterStore.push(filter);
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
