import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const FLARE_POSITIONS = [
  { x: 8, y: 4, z: -12, color: "#55aaff", size: 0.8, intensity: 0.4 },
  { x: -10, y: 6, z: -30, color: "#aa55ff", size: 1.0, intensity: 0.3 },
  { x: 6, y: -4, z: -50, color: "#ffaa55", size: 0.6, intensity: 0.35 },
  { x: -7, y: 5, z: -65, color: "#55ffaa", size: 0.9, intensity: 0.3 },
];

function FlareStar({ x, y, z, color, size, intensity, index }: {
  x: number; y: number; z: number; color: string; size: number; intensity: number; index: number;
}) {
  const ref = useRef<THREE.Sprite>(null);
  const { camera } = useThree();

  const flareTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128; c.height = 128;
    const ctx = c.getContext("2d")!;

    const g1 = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g1.addColorStop(0, "rgba(255,255,255,1)");
    g1.addColorStop(0.05, "rgba(255,255,255,0.8)");
    g1.addColorStop(0.15, "rgba(255,255,255,0.2)");
    g1.addColorStop(0.4, "rgba(255,255,255,0.04)");
    g1.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, 128, 128);

    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 64); ctx.lineTo(128, 64);
    ctx.moveTo(64, 0); ctx.lineTo(64, 128);
    ctx.stroke();

    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const dist = Math.abs(camera.position.z - z);
    const fadeRange = 25;
    const visibility = dist < fadeRange ? 1 - dist / fadeRange : 0;
    const pulse = 0.7 + Math.sin(t * 1.5 + index * 2) * 0.3;

    ref.current.material.opacity = visibility * intensity * pulse;
    const s = size * (0.8 + pulse * 0.2);
    ref.current.scale.set(s, s, 1);
  });

  return (
    <sprite ref={ref} position={[x, y, z]}>
      <spriteMaterial
        map={flareTex}
        color={color}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
}

export function LensFlares() {
  return (
    <group>
      {FLARE_POSITIONS.map((f, i) => (
        <FlareStar key={i} {...f} index={i} />
      ))}
    </group>
  );
}
