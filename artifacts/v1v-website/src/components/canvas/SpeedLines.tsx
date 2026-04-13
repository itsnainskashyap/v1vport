import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  scrollProgress: number;
}

export function SpeedLines({ scrollProgress }: Props) {
  const ref = useRef<THREE.Points>(null);
  const prevScroll = useRef(0);
  const smoothSpeed = useRef(0);
  const { camera } = useThree();

  const count = 600;

  const { positions, velocities, baseAlphas } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    const alp = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 2 + Math.random() * 8;
      pos[i * 3] = Math.cos(angle) * dist;
      pos[i * 3 + 1] = Math.sin(angle) * dist;
      pos[i * 3 + 2] = -Math.random() * 40;
      vel[i] = 0.3 + Math.random() * 1.2;
      alp[i] = 0.3 + Math.random() * 0.7;
    }
    return { positions: pos, velocities: vel, baseAlphas: alp };
  }, []);

  const glowTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64; c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.2, "rgba(200,220,255,0.8)");
    g.addColorStop(0.6, "rgba(100,150,255,0.2)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  }, []);

  useFrame(() => {
    if (!ref.current) return;

    const scrollDelta = Math.abs(scrollProgress - prevScroll.current);
    prevScroll.current = scrollProgress;
    const rawSpeed = scrollDelta * 60;
    smoothSpeed.current += (rawSpeed - smoothSpeed.current) * 0.08;

    const intensity = Math.max(0, (smoothSpeed.current - 0.15) * 3);
    const clampedIntensity = Math.min(intensity, 1);

    const posAttr = ref.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      arr[i * 3 + 2] += velocities[i] * clampedIntensity * 2;
      if (arr[i * 3 + 2] > 5) {
        arr[i * 3 + 2] = -30 - Math.random() * 20;
        const angle = Math.random() * Math.PI * 2;
        const dist = 2 + Math.random() * 8;
        arr[i * 3] = Math.cos(angle) * dist + camera.position.x;
        arr[i * 3 + 1] = Math.sin(angle) * dist + camera.position.y;
      }
    }
    posAttr.needsUpdate = true;

    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = clampedIntensity * 0.6;
    mat.size = 0.03 + clampedIntensity * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={glowTex}
        color="#aaccff"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
        size={0.05}
      />
    </points>
  );
}
