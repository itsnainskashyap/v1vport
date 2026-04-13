import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  scrollProgress: number;
}

export function EngineFlame({ scrollProgress }: Props) {
  const ref = useRef<THREE.Points>(null);
  const prevScroll = useRef(0);
  const smoothThrust = useRef(0);
  const count = 120;

  const { positions, lifetimes, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const life = new Float32Array(count);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.15;
      pos[i * 3 + 2] = Math.random() * 2;
      life[i] = Math.random();
      spd[i] = 0.02 + Math.random() * 0.06;
    }
    return { positions: pos, lifetimes: life, speeds: spd };
  }, []);

  const colors = useMemo(() => {
    const c = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      c[i * 3] = 1.0;
      c[i * 3 + 1] = 0.4 + t * 0.4;
      c[i * 3 + 2] = 0.1 + t * 0.3;
    }
    return c;
  }, []);

  const flameTex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.3, "rgba(255,200,100,0.8)");
    g.addColorStop(0.7, "rgba(255,100,50,0.3)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
    const t = new THREE.CanvasTexture(canvas);
    t.needsUpdate = true;
    return t;
  }, []);

  useFrame(() => {
    if (!ref.current) return;

    const scrollDelta = Math.abs(scrollProgress - prevScroll.current);
    prevScroll.current = scrollProgress;
    const thrust = Math.min(1, scrollDelta * 80);
    smoothThrust.current += (thrust - smoothThrust.current) * 0.1;
    const intensity = 0.15 + smoothThrust.current * 0.85;

    const posAttr = ref.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      lifetimes[i] += speeds[i] * (0.5 + intensity);
      if (lifetimes[i] > 1) {
        lifetimes[i] = 0;
        arr[i * 3] = (Math.random() - 0.5) * 0.12;
        arr[i * 3 + 1] = (Math.random() - 0.5) * 0.12;
        arr[i * 3 + 2] = 0;
      }
      const l = lifetimes[i];
      arr[i * 3 + 2] = l * (1.5 + intensity * 2);
      arr[i * 3] += (Math.random() - 0.5) * 0.005;
      arr[i * 3 + 1] += (Math.random() - 0.5) * 0.005;
    }
    posAttr.needsUpdate = true;

    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = intensity * 0.8;
    mat.size = 0.03 + intensity * 0.04;
  });

  return (
    <points ref={ref} position={[0, 0, 50]} rotation={[0, Math.PI, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={flameTex}
        vertexColors
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
        size={0.04}
      />
    </points>
  );
}
