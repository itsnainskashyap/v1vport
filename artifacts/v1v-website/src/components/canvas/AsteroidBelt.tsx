import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  scrollProgress: number;
}

function createRockGeometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, 0);
  const pos = geo.attributes.position;
  const arr = pos.array as Float32Array;
  for (let i = 0; i < arr.length; i++) {
    arr[i] += (Math.random() - 0.5) * 0.35;
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

const BELT_CENTER_Z = -45;
const BELT_DEPTH = 12;

export function AsteroidBelt({ scrollProgress }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const asteroids = useMemo(() => {
    const count = 60;
    const items: {
      pos: [number, number, number];
      scale: number;
      rotSpeed: [number, number, number];
      geo: THREE.BufferGeometry;
    }[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 4 + Math.random() * 12;
      const x = Math.cos(angle) * dist;
      const y = (Math.random() - 0.5) * 6;
      const z = BELT_CENTER_Z + (Math.random() - 0.5) * BELT_DEPTH;
      const scale = 0.03 + Math.random() * 0.12;

      items.push({
        pos: [x, y, z],
        scale,
        rotSpeed: [
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.3,
        ],
        geo: createRockGeometry(),
      });
    }
    return items;
  }, []);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const dist = Math.abs(camera.position.z - BELT_CENTER_Z);
    const visible = dist < 25;

    if (groupRef.current) {
      groupRef.current.visible = visible;
    }

    if (!visible) return;

    for (let i = 0; i < asteroids.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      const a = asteroids[i];
      mesh.rotation.x += a.rotSpeed[0] * 0.01;
      mesh.rotation.y += a.rotSpeed[1] * 0.01;
      mesh.rotation.z += a.rotSpeed[2] * 0.01;

      mesh.position.x = a.pos[0] + Math.sin(t * 0.1 + i) * 0.3;
      mesh.position.y = a.pos[1] + Math.cos(t * 0.08 + i * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {asteroids.map((a, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          position={a.pos}
          scale={a.scale}
          geometry={a.geo}
        >
          <meshStandardMaterial
            color="#2a2a3a"
            roughness={0.9}
            metalness={0.3}
            emissive="#0a0a15"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}

      <pointLight position={[0, 0, BELT_CENTER_Z]} color="#55aaff" intensity={0.4} distance={20} />
    </group>
  );
}
