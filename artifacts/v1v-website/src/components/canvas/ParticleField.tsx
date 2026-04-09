import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  count: number;
  scrollProgress: number;
}

export function ParticleField({ count, scrollProgress }: Props) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, basePositions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 2 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const zSpread = (Math.random() - 0.5) * 100;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = zSpread;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      basePositions[i3] = x;
      basePositions[i3 + 1] = y;
      basePositions[i3 + 2] = z;

      const colorChoice = Math.random();
      if (colorChoice < 0.35) {
        colors[i3] = 0.3; colors[i3 + 1] = 0.55; colors[i3 + 2] = 0.4;
      } else if (colorChoice < 0.55) {
        colors[i3] = 0.25; colors[i3 + 1] = 0.65; colors[i3 + 2] = 0.5;
      } else if (colorChoice < 0.75) {
        colors[i3] = 0.7; colors[i3 + 1] = 0.6; colors[i3 + 2] = 0.25;
      } else if (colorChoice < 0.88) {
        colors[i3] = 0.5; colors[i3 + 1] = 0.35; colors[i3 + 2] = 0.6;
      } else {
        colors[i3] = 0.6; colors[i3 + 1] = 0.4; colors[i3 + 2] = 0.45;
      }

      sizes[i] = 0.02 + Math.random() * 0.06;
    }

    return { positions, basePositions, colors, sizes };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const pos = pointsRef.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const speed = 0.03 + (i % 11) * 0.005;
      arr[i3] = basePositions[i3] + Math.sin(t * speed + i * 0.7) * 0.1;
      arr[i3 + 1] = basePositions[i3 + 1] + Math.cos(t * speed * 0.6 + i * 0.3) * 0.1;
      arr[i3 + 2] = basePositions[i3 + 2] + Math.sin(t * speed * 0.4 + i * 0.5) * 0.08;
    }
    pos.needsUpdate = true;
    pointsRef.current.rotation.y = t * 0.003;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
