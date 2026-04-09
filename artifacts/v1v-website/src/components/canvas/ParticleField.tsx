import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  count: number;
  scrollProgress: number;
}

export function ParticleField({ count, scrollProgress }: Props) {
  const pointsRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);
  const streakRef = useRef<THREE.Points>(null);

  const mainData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 1.5 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const zSpread = (Math.random() - 0.5) * 120;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = zSpread;
      basePositions[i3] = x;
      basePositions[i3 + 1] = y;
      basePositions[i3 + 2] = zSpread;

      const colorChoice = Math.random();
      if (colorChoice < 0.25) {
        colors[i3] = 0.35 + Math.random() * 0.2;
        colors[i3 + 1] = 0.55 + Math.random() * 0.15;
        colors[i3 + 2] = 0.9 + Math.random() * 0.1;
      } else if (colorChoice < 0.45) {
        colors[i3] = 0.6 + Math.random() * 0.15;
        colors[i3 + 1] = 0.4 + Math.random() * 0.1;
        colors[i3 + 2] = 0.9 + Math.random() * 0.1;
      } else if (colorChoice < 0.65) {
        colors[i3] = 0.9 + Math.random() * 0.1;
        colors[i3 + 1] = 0.5 + Math.random() * 0.2;
        colors[i3 + 2] = 0.6 + Math.random() * 0.15;
      } else if (colorChoice < 0.8) {
        colors[i3] = 0.3 + Math.random() * 0.1;
        colors[i3 + 1] = 0.8 + Math.random() * 0.15;
        colors[i3 + 2] = 0.7 + Math.random() * 0.1;
      } else {
        colors[i3] = 0.8;
        colors[i3 + 1] = 0.85;
        colors[i3 + 2] = 0.95;
      }

      sizes[i] = 0.02 + Math.random() * 0.08;
    }

    return { positions, basePositions, colors, sizes };
  }, [count]);

  const dustCount = Math.floor(count * 0.4);
  const dustData = useMemo(() => {
    const positions = new Float32Array(dustCount * 3);
    const basePositions = new Float32Array(dustCount * 3);
    const colors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 120;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      basePositions[i3] = x;
      basePositions[i3 + 1] = y;
      basePositions[i3 + 2] = z;

      const brightness = 0.3 + Math.random() * 0.3;
      colors[i3] = brightness * 0.7;
      colors[i3 + 1] = brightness * 0.8;
      colors[i3 + 2] = brightness;
    }

    return { positions, basePositions, colors };
  }, [dustCount]);

  const streakCount = 200;
  const streakData = useMemo(() => {
    const positions = new Float32Array(streakCount * 3);
    const basePositions = new Float32Array(streakCount * 3);
    const colors = new Float32Array(streakCount * 3);

    for (let i = 0; i < streakCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const r = 5 + Math.random() * 15;
      positions[i3] = Math.cos(angle) * r;
      positions[i3 + 1] = Math.sin(angle) * r;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;
      basePositions[i3] = positions[i3];
      basePositions[i3 + 1] = positions[i3 + 1];
      basePositions[i3 + 2] = positions[i3 + 2];

      colors[i3] = 0.5 + Math.random() * 0.3;
      colors[i3 + 1] = 0.6 + Math.random() * 0.2;
      colors[i3 + 2] = 0.9 + Math.random() * 0.1;
    }

    return { positions, basePositions, colors };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const speed = 0.04 + (i % 17) * 0.003;
        const orbit = (i % 7) * 0.002;
        arr[i3] = mainData.basePositions[i3] + Math.sin(t * speed + i * 0.37) * 0.2 + Math.cos(t * orbit) * 0.1;
        arr[i3 + 1] = mainData.basePositions[i3 + 1] + Math.cos(t * speed * 0.7 + i * 0.23) * 0.2;
        arr[i3 + 2] = mainData.basePositions[i3 + 2] + Math.sin(t * speed * 0.3 + i * 0.51) * 0.15;
      }
      pos.needsUpdate = true;
      pointsRef.current.rotation.y = t * 0.004;
    }

    if (dustRef.current) {
      const pos = dustRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        const i3 = i * 3;
        arr[i3] = dustData.basePositions[i3] + Math.sin(t * 0.15 + i * 0.5) * 0.5;
        arr[i3 + 1] = dustData.basePositions[i3 + 1] + Math.cos(t * 0.12 + i * 0.3) * 0.3;
        arr[i3 + 2] = dustData.basePositions[i3 + 2] + Math.sin(t * 0.08 + i * 0.7) * 0.4;
      }
      pos.needsUpdate = true;
    }

    if (streakRef.current) {
      const pos = streakRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < streakCount; i++) {
        const i3 = i * 3;
        const orbitSpeed = 0.02 + (i % 5) * 0.005;
        const angle = t * orbitSpeed + i * 0.3;
        const baseR = Math.sqrt(streakData.basePositions[i3] ** 2 + streakData.basePositions[i3 + 1] ** 2);
        arr[i3] = Math.cos(angle) * baseR;
        arr[i3 + 1] = Math.sin(angle) * baseR;
        arr[i3 + 2] = streakData.basePositions[i3 + 2];
      }
      pos.needsUpdate = true;
      streakRef.current.rotation.z = t * 0.002;
    }
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[mainData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[mainData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dustData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          vertexColors
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <points ref={streakRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[streakData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[streakData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </>
  );
}
