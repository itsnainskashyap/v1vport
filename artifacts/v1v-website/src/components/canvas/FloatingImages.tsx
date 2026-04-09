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
    { position: [-7, 3, -8], scale: 2.0, rotSpeed: 0.15, path: "decorative/neural-brain.png" },
    { position: [8, -1, -20], scale: 1.6, rotSpeed: -0.12, path: "decorative/crystal-prism.png" },
    { position: [-9, 2, -35], scale: 1.8, rotSpeed: 0.1, path: "decorative/circuit-sphere.png" },
    { position: [7, 3, -50], scale: 1.5, rotSpeed: -0.08, path: "decorative/code-fragments.png" },
    { position: [-8, -2, -60], scale: 2.2, rotSpeed: 0.13, path: "decorative/dissolving-cube.png" },
    { position: [9, 1, -72], scale: 1.7, rotSpeed: -0.1, path: "decorative/digital-eye.png" },
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
    const maxDist = 30;
    const fadeOpacity = dist < maxDist ? Math.max(0.05, 1 - dist / maxDist) * 0.35 : 0;

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
