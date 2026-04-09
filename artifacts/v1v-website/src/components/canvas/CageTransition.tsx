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
  const energyRef = useRef<THREE.Points>(null);

  const { verticalBars, rings, particlePositions, energyData } = useMemo(() => {
    const verticalBars: THREE.Vector3[] = [];
    const barCount = 28;
    const radius = 3.0;

    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      verticalBars.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ));
    }

    const rings: { y: number; radius: number }[] = [];
    for (let j = 0; j < 8; j++) {
      rings.push({ y: -4 + j * 1.15, radius: radius + (j % 2) * 0.2 });
    }

    const particleCount = 1500;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const r = Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i3 + 2] = r * Math.cos(phi);
    }

    const energyCount = 300;
    const energyPositions = new Float32Array(energyCount * 3);
    const energyBasePositions = new Float32Array(energyCount * 3);
    const energyColors = new Float32Array(energyCount * 3);
    for (let i = 0; i < energyCount; i++) {
      const i3 = i * 3;
      const angle = (i / energyCount) * Math.PI * 2 * 3;
      const r = 2.8 + Math.sin(i * 0.1) * 0.5;
      const y = (Math.random() - 0.5) * 8;
      energyPositions[i3] = Math.cos(angle) * r;
      energyPositions[i3 + 1] = y;
      energyPositions[i3 + 2] = Math.sin(angle) * r;
      energyBasePositions[i3] = energyPositions[i3];
      energyBasePositions[i3 + 1] = energyPositions[i3 + 1];
      energyBasePositions[i3 + 2] = energyPositions[i3 + 2];

      energyColors[i3] = 0.3 + Math.random() * 0.4;
      energyColors[i3 + 1] = 0.5 + Math.random() * 0.3;
      energyColors[i3 + 2] = 0.8 + Math.random() * 0.2;
    }

    return {
      verticalBars,
      rings,
      particlePositions,
      energyData: { positions: energyPositions, basePositions: energyBasePositions, colors: energyColors, count: energyCount }
    };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.04;

    if (particleRef.current) {
      const pos = particleRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < arr.length / 3; i++) {
        const i3 = i * 3;
        arr[i3] = particlePositions[i3] + Math.sin(t * 0.7 + i * 0.12) * 0.12;
        arr[i3 + 1] = particlePositions[i3 + 1] + Math.sin(t * 0.9 + i * 0.08) * 0.18;
        arr[i3 + 2] = particlePositions[i3 + 2] + Math.cos(t * 0.6 + i * 0.15) * 0.1;
      }
      pos.needsUpdate = true;
    }

    if (energyRef.current) {
      const pos = energyRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < energyData.count; i++) {
        const i3 = i * 3;
        const angle = t * 0.3 + i * 0.05;
        arr[i3] = energyData.basePositions[i3] + Math.cos(angle) * 0.3;
        arr[i3 + 1] = energyData.basePositions[i3 + 1] + Math.sin(t * 1.2 + i * 0.1) * 0.2;
        arr[i3 + 2] = energyData.basePositions[i3 + 2] + Math.sin(angle) * 0.3;
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -50]}>
      {verticalBars.map((pos, i) => (
        <mesh key={`bar-${i}`} position={[pos.x, 0, pos.z]}>
          <cylinderGeometry args={[0.025, 0.025, 9, 6]} />
          <meshPhysicalMaterial
            color="#445566"
            emissive="#223344"
            emissiveIntensity={0.3}
            transparent
            opacity={opacity * 0.6}
            metalness={0.6}
            roughness={0.2}
          />
        </mesh>
      ))}

      {rings.map((ring, j) => (
        <mesh key={`ring-${j}`} position={[0, ring.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[ring.radius, 0.035, 8, 48]} />
          <meshPhysicalMaterial
            color="#5577aa"
            emissive="#334466"
            emissiveIntensity={0.25}
            transparent
            opacity={opacity * 0.5}
            metalness={0.5}
            roughness={0.15}
          />
        </mesh>
      ))}

      <points ref={particleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#88ccff"
          transparent
          opacity={opacity * 0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <points ref={energyRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[energyData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[energyData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={opacity * 0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <pointLight position={[0, 0, 0]} intensity={1.2 * opacity} color="#5599cc" distance={10} />
      <pointLight position={[0, 3, 0]} intensity={0.6 * opacity} color="#8866cc" distance={8} />
      <pointLight position={[0, -3, 0]} intensity={0.6 * opacity} color="#cc6688" distance={8} />
    </group>
  );
}
