import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  scrollProgress: number;
}

interface ImageConfig {
  position: [number, number, number];
  scale: number;
  rotSpeed: number;
  path: string;
}

export function FloatingImages({ scrollProgress }: Props) {
  const configs: ImageConfig[] = useMemo(() => [
    { position: [-6, 3, -3], scale: 2.0, rotSpeed: 0.06, path: "decorative/planet-gas-giant-blue.png" },
    { position: [7, -1, -8], scale: 1.6, rotSpeed: -0.05, path: "decorative/galaxy-spiral-purple.png" },
    { position: [-8, 4, -14], scale: 1.8, rotSpeed: 0.04, path: "decorative/planet-ringed-gold.png" },
    { position: [6, 2, -18], scale: 1.5, rotSpeed: -0.07, path: "decorative/planet-rocky-red.png" },
    { position: [-5, -2, -22], scale: 1.7, rotSpeed: 0.05, path: "decorative/planet-ice-turquoise.png" },
    { position: [8, 3, -26], scale: 1.9, rotSpeed: -0.04, path: "decorative/planet-ringed-blue.png" },
    { position: [-7, 1, -30], scale: 1.6, rotSpeed: 0.06, path: "decorative/planet-lava-red.png" },
    { position: [5, -1, -34], scale: 1.8, rotSpeed: -0.03, path: "decorative/galaxy-spiral-gold.png" },
    { position: [-6, 3, -38], scale: 1.5, rotSpeed: 0.05, path: "decorative/planet-emerald-ringed.png" },
    { position: [7, 2, -42], scale: 1.7, rotSpeed: -0.06, path: "decorative/star-blue-giant.png" },
    { position: [-8, -1, -46], scale: 2.0, rotSpeed: 0.04, path: "decorative/planet-violet-moons.png" },
    { position: [6, 4, -50], scale: 1.6, rotSpeed: -0.05, path: "decorative/galaxy-elliptical-warm.png" },
    { position: [-5, 1, -53], scale: 1.8, rotSpeed: 0.07, path: "decorative/planet-ocean-blue.png" },
    { position: [8, -2, -56], scale: 1.5, rotSpeed: -0.04, path: "decorative/planet-ringed-rainbow.png" },
    { position: [-7, 3, -59], scale: 1.9, rotSpeed: 0.03, path: "decorative/nebula-pillar-teal.png" },
    { position: [5, 2, -62], scale: 1.7, rotSpeed: -0.06, path: "decorative/planet-desert-gold.png" },
    { position: [-6, -1, -65], scale: 1.6, rotSpeed: 0.05, path: "decorative/galaxy-barred-spiral.png" },
    { position: [7, 3, -68], scale: 1.8, rotSpeed: -0.04, path: "decorative/moon-ice-geysers.png" },
    { position: [-8, 1, -71], scale: 1.5, rotSpeed: 0.06, path: "decorative/planet-ringed-red.png" },
    { position: [6, -2, -74], scale: 2.0, rotSpeed: -0.05, path: "decorative/nebula-supernova.png" },
  ], []);

  const textures = useLoader(
    THREE.TextureLoader,
    configs.map((c) => import.meta.env.BASE_URL + c.path)
  );

  return (
    <>
      {configs.map((config, i) => (
        <FloatingImage key={i} config={config} texture={textures[i]} scrollProgress={scrollProgress} />
      ))}
    </>
  );
}

function FloatingImage({ config, texture, scrollProgress }: { config: ImageConfig; texture: THREE.Texture; scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!meshRef.current) return;

    meshRef.current.rotation.z += config.rotSpeed * 0.003;

    const camZ = 8 + (-80 - 8) * scrollProgress;
    const dist = Math.abs(config.position[2] - camZ);
    const maxDist = 25;
    const fadeOpacity = dist < maxDist ? Math.max(0.05, 1 - dist / maxDist) * 0.45 : 0;

    if (materialRef.current) {
      materialRef.current.opacity = fadeOpacity;
    }
  });

  return (
    <mesh ref={meshRef} position={config.position}>
      <planeGeometry args={[config.scale, config.scale]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
