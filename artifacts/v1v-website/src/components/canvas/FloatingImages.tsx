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
    { position: [-6, 3, -3], scale: 1.8, rotSpeed: 0.12, path: "decorative/neural-brain.png" },
    { position: [7, -1, -8], scale: 1.4, rotSpeed: -0.1, path: "decorative/crystal-prism.png" },
    { position: [-8, 4, -14], scale: 1.6, rotSpeed: 0.08, path: "decorative/holo-planet.png" },
    { position: [6, 2, -18], scale: 1.3, rotSpeed: -0.14, path: "decorative/neon-hand.png" },
    { position: [-5, -2, -22], scale: 1.5, rotSpeed: 0.11, path: "decorative/crystal-diamond.png" },
    { position: [8, 3, -26], scale: 1.7, rotSpeed: -0.09, path: "decorative/light-butterfly.png" },
    { position: [-7, 1, -30], scale: 1.4, rotSpeed: 0.13, path: "decorative/metal-sphere.png" },
    { position: [5, -1, -34], scale: 1.6, rotSpeed: -0.07, path: "decorative/dna-glow.png" },
    { position: [-6, 3, -38], scale: 1.3, rotSpeed: 0.1, path: "decorative/circuit-sphere.png" },
    { position: [7, 2, -42], scale: 1.5, rotSpeed: -0.12, path: "decorative/portal-vortex.png" },
    { position: [-8, -1, -46], scale: 1.8, rotSpeed: 0.08, path: "decorative/neon-astronaut.png" },
    { position: [6, 4, -50], scale: 1.4, rotSpeed: -0.11, path: "decorative/light-rocket.png" },
    { position: [-5, 1, -53], scale: 1.6, rotSpeed: 0.14, path: "decorative/holo-crown.png" },
    { position: [8, -2, -56], scale: 1.3, rotSpeed: -0.09, path: "decorative/space-jellyfish.png" },
    { position: [-7, 3, -59], scale: 1.7, rotSpeed: 0.07, path: "decorative/digital-phoenix.png" },
    { position: [5, 2, -62], scale: 1.5, rotSpeed: -0.13, path: "decorative/code-fragments.png" },
    { position: [-6, -1, -65], scale: 1.4, rotSpeed: 0.1, path: "decorative/neon-compass.png" },
    { position: [7, 3, -68], scale: 1.6, rotSpeed: -0.08, path: "decorative/geo-heart.png" },
    { position: [-8, 1, -71], scale: 1.3, rotSpeed: 0.12, path: "decorative/energy-bolt.png" },
    { position: [6, -2, -74], scale: 1.8, rotSpeed: -0.1, path: "decorative/dissolving-cube.png" },
    { position: [-5, 4, -77], scale: 1.5, rotSpeed: 0.09, path: "decorative/digital-eye.png" },
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

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    meshRef.current.rotation.z += config.rotSpeed * 0.003;
    meshRef.current.position.y = config.position[1] + Math.sin(t * 0.4 + config.position[0]) * 0.5;
    meshRef.current.position.x = config.position[0] + Math.sin(t * 0.2 + config.position[2]) * 0.3;

    const camZ = 8 + (-80 - 8) * scrollProgress;
    const dist = Math.abs(meshRef.current.position.z - camZ);
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
