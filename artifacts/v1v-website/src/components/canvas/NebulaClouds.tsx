import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const NEBULA_CONFIGS = [
  { z: -8,  color1: "#1a3366", color2: "#2a1a55", scale: 18, opacity: 0.08 },
  { z: -25, color1: "#331a44", color2: "#1a2244", scale: 22, opacity: 0.07 },
  { z: -42, color1: "#1a4433", color2: "#2a3355", scale: 20, opacity: 0.06 },
  { z: -58, color1: "#441a2a", color2: "#2a1a44", scale: 24, opacity: 0.07 },
  { z: -72, color1: "#1a3355", color2: "#331a55", scale: 20, opacity: 0.08 },
];

function createNebulaTexture(color1: string, color2: string): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 5; i++) {
    const cx = size * (0.3 + Math.random() * 0.4);
    const cy = size * (0.3 + Math.random() * 0.4);
    const r = size * (0.2 + Math.random() * 0.3);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const c = i % 2 === 0 ? color1 : color2;
    g.addColorStop(0, c + "40");
    g.addColorStop(0.5, c + "18");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function NebulaPlane({
  z, color1, color2, scale, baseOpacity, index,
}: {
  z: number; color1: string; color2: string; scale: number; baseOpacity: number; index: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const tex = useMemo(() => createNebulaTexture(color1, color2), [color1, color2]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const dist = Math.abs(camera.position.z - z);
    const fadeRange = 30;
    const visibility = dist < fadeRange ? 1 - dist / fadeRange : 0;

    (ref.current.material as THREE.MeshBasicMaterial).opacity = visibility * baseOpacity;

    ref.current.rotation.z = Math.sin(t * 0.05 + index * 2) * 0.3;
    ref.current.position.x = Math.sin(t * 0.03 + index) * 1.5;
    ref.current.position.y = Math.cos(t * 0.04 + index * 1.5) * 1;
  });

  return (
    <mesh ref={ref} position={[0, 0, z]}>
      <planeGeometry args={[scale, scale]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function NebulaClouds() {
  return (
    <group>
      {NEBULA_CONFIGS.map((cfg, i) => (
        <NebulaPlane
          key={i}
          z={cfg.z}
          color1={cfg.color1}
          color2={cfg.color2}
          scale={cfg.scale}
          baseOpacity={cfg.opacity}
          index={i}
        />
      ))}
    </group>
  );
}
