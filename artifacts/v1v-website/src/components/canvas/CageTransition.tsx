import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  progress: number;
  opacity: number;
}

export function CageTransition({ progress, opacity }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const particleRef = useRef<THREE.Points>(null);

  const { verticalBars, rings, particlePositions } = useMemo(() => {
    const verticalBars: THREE.Vector3[] = [];
    const barCount = 20;
    const radius = 2.5;

    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      verticalBars.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ));
    }

    const rings: { y: number; radius: number }[] = [];
    for (let j = 0; j < 6; j++) {
      rings.push({ y: -3 + j * 1.2, radius: radius + (j % 2) * 0.15 });
    }

    const particleCount = 800;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const r = Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) - 0.5;
      particlePositions[i3 + 2] = r * Math.cos(phi);
    }

    return { verticalBars, rings, particlePositions };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.03;

    if (particleRef.current) {
      const pos = particleRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < arr.length / 3; i++) {
        const i3 = i * 3;
        arr[i3] = particlePositions[i3] + Math.sin(t * 0.6 + i * 0.15) * 0.08;
        arr[i3 + 1] = particlePositions[i3 + 1] + Math.sin(t * 0.8 + i * 0.1) * 0.12;
        arr[i3 + 2] = particlePositions[i3 + 2] + Math.cos(t * 0.5 + i * 0.2) * 0.06;
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -50]}>
      {verticalBars.map((pos, i) => (
        <mesh key={`bar-${i}`} position={[pos.x, 0, pos.z]}>
          <cylinderGeometry args={[0.02, 0.02, 7, 6]} />
          <meshBasicMaterial color="#334455" transparent opacity={opacity * 0.5} />
        </mesh>
      ))}
      {rings.map((ring, j) => (
        <mesh key={`ring-${j}`} position={[0, ring.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[ring.radius, 0.025, 8, 40]} />
          <meshBasicMaterial color="#445566" transparent opacity={opacity * 0.4} />
        </mesh>
      ))}
      <points ref={particleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#88bbdd"
          transparent
          opacity={opacity * 0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
      <pointLight position={[0, 0, 0]} intensity={0.8 * opacity} color="#5588aa" distance={8} />
    </group>
  );
}
