import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PLANET_Z = -48;

function createPlanetTexture(): THREE.Texture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const g1 = ctx.createLinearGradient(0, 0, size, size);
  g1.addColorStop(0, "#1a2844");
  g1.addColorStop(0.3, "#2a3855");
  g1.addColorStop(0.5, "#1a3048");
  g1.addColorStop(0.7, "#2a2844");
  g1.addColorStop(1, "#1a2040");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 30; i++) {
    const y = Math.random() * size;
    const h = 2 + Math.random() * 8;
    const alpha = 0.05 + Math.random() * 0.1;
    ctx.fillStyle = `rgba(${60 + Math.random() * 40}, ${80 + Math.random() * 40}, ${120 + Math.random() * 60}, ${alpha})`;
    ctx.fillRect(0, y, size, h);
  }

  for (let i = 0; i < 8; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 5 + Math.random() * 20;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(100,140,200,0.15)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function PlanetFlyby() {
  const groupRef = useRef<THREE.Group>(null);
  const atmosRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const planetTex = useMemo(() => createPlanetTexture(), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const dist = Math.abs(camera.position.z - PLANET_Z);
    const visible = dist < 35;
    groupRef.current.visible = visible;
    if (!visible) return;

    groupRef.current.rotation.y = t * 0.02;

    if (atmosRef.current) {
      const mat = atmosRef.current.material as THREE.MeshBasicMaterial;
      const glow = Math.max(0, 1 - dist / 35);
      mat.opacity = glow * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[12, -3, PLANET_Z]}>
      <mesh>
        <sphereGeometry args={[4, 48, 48]} />
        <meshStandardMaterial
          map={planetTex}
          roughness={0.7}
          metalness={0.1}
          emissive="#1a2844"
          emissiveIntensity={0.3}
        />
      </mesh>

      <mesh ref={atmosRef} scale={1.05}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial
          color="#4488cc"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.15}>
        <sphereGeometry args={[4, 24, 24]} />
        <meshBasicMaterial
          color="#2255aa"
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <pointLight color="#4488cc" intensity={1.5} distance={20} position={[-3, 2, 3]} />
    </group>
  );
}
