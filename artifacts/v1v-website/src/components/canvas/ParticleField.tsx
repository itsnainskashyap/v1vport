import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  count: number;
}

export function ParticleField({ count }: Props) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, basePositions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 3 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      basePositions[i3] = x;
      basePositions[i3 + 1] = y;
      basePositions[i3 + 2] = z;

      const colorChoice = Math.random();
      if (colorChoice < 0.4) {
        colors[i3] = 0.2; colors[i3 + 1] = 0.8; colors[i3 + 2] = 0.6;
      } else if (colorChoice < 0.7) {
        colors[i3] = 0.0; colors[i3 + 1] = 0.9; colors[i3 + 2] = 1.0;
      } else if (colorChoice < 0.85) {
        colors[i3] = 0.9; colors[i3 + 1] = 0.75; colors[i3 + 2] = 0.2;
      } else {
        colors[i3] = 0.55; colors[i3 + 1] = 0.36; colors[i3 + 2] = 0.96;
      }

      sizes[i] = 0.5 + Math.random() * 2.5;
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
      const speed = 0.05 + (i % 7) * 0.008;
      arr[i3] = basePositions[i3] + Math.sin(t * speed + i) * 0.15;
      arr[i3 + 1] = basePositions[i3 + 1] + Math.cos(t * speed * 0.7 + i * 0.5) * 0.15;
      arr[i3 + 2] = basePositions[i3 + 2] + Math.sin(t * speed * 0.5 + i * 0.3) * 0.12;
    }
    pos.needsUpdate = true;
    pointsRef.current.rotation.y = t * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
