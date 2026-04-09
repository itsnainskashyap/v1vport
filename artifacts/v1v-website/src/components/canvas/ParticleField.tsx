import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  count: number;
  scrollProgress: number;
}

function createCircleTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.2, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.4)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createSoftTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255,255,255,0.6)");
  gradient.addColorStop(0.3, "rgba(255,255,255,0.3)");
  gradient.addColorStop(0.6, "rgba(255,255,255,0.1)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function ParticleField({ count, scrollProgress }: Props) {
  const pointsRef = useRef<THREE.Points>(null);
  const nebulaRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);

  const circleMap = useMemo(() => createCircleTexture(), []);
  const softMap = useMemo(() => createSoftTexture(), []);

  const mainData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 1.5 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const zSpread = (Math.random() - 0.5) * 160;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = zSpread;
      basePositions[i3] = positions[i3];
      basePositions[i3 + 1] = positions[i3 + 1];
      basePositions[i3 + 2] = positions[i3 + 2];

      const colorChoice = Math.random();
      if (colorChoice < 0.25) {
        colors[i3] = 0.3 + Math.random() * 0.2;
        colors[i3 + 1] = 0.5 + Math.random() * 0.2;
        colors[i3 + 2] = 0.9 + Math.random() * 0.1;
      } else if (colorChoice < 0.45) {
        colors[i3] = 0.6 + Math.random() * 0.2;
        colors[i3 + 1] = 0.3 + Math.random() * 0.2;
        colors[i3 + 2] = 0.9 + Math.random() * 0.1;
      } else if (colorChoice < 0.6) {
        colors[i3] = 0.9 + Math.random() * 0.1;
        colors[i3 + 1] = 0.3 + Math.random() * 0.2;
        colors[i3 + 2] = 0.5 + Math.random() * 0.2;
      } else if (colorChoice < 0.8) {
        colors[i3] = 0.4 + Math.random() * 0.2;
        colors[i3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i3 + 2] = 0.6 + Math.random() * 0.2;
      } else {
        colors[i3] = 0.7 + Math.random() * 0.2;
        colors[i3 + 1] = 0.7 + Math.random() * 0.2;
        colors[i3 + 2] = 0.9 + Math.random() * 0.1;
      }
    }

    return { positions, basePositions, colors };
  }, [count]);

  const nebulaCount = Math.floor(count * 0.2);
  const nebulaData = useMemo(() => {
    const positions = new Float32Array(nebulaCount * 3);
    const basePositions = new Float32Array(nebulaCount * 3);
    const colors = new Float32Array(nebulaCount * 3);

    for (let i = 0; i < nebulaCount; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 160;
      positions[i3] = x; positions[i3 + 1] = y; positions[i3 + 2] = z;
      basePositions[i3] = x; basePositions[i3 + 1] = y; basePositions[i3 + 2] = z;

      const brightness = 0.15 + Math.random() * 0.15;
      colors[i3] = brightness * (0.5 + Math.random() * 0.5);
      colors[i3 + 1] = brightness * (0.4 + Math.random() * 0.4);
      colors[i3 + 2] = brightness * 1.2;
    }

    return { positions, basePositions, colors };
  }, [nebulaCount]);

  const dustCount = Math.floor(count * 0.15);
  const dustData = useMemo(() => {
    const positions = new Float32Array(dustCount * 3);
    const basePositions = new Float32Array(dustCount * 3);
    const colors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 35;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 160;
      positions[i3] = x; positions[i3 + 1] = y; positions[i3 + 2] = z;
      basePositions[i3] = x; basePositions[i3 + 1] = y; basePositions[i3 + 2] = z;

      colors[i3] = 0.7 + Math.random() * 0.3;
      colors[i3 + 1] = 0.7 + Math.random() * 0.3;
      colors[i3 + 2] = 0.8 + Math.random() * 0.2;
    }

    return { positions, basePositions, colors };
  }, [dustCount]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const speed = 0.03 + (i % 17) * 0.002;
        arr[i3] = mainData.basePositions[i3] + Math.sin(t * speed + i * 0.31) * 0.12;
        arr[i3 + 1] = mainData.basePositions[i3 + 1] + Math.cos(t * speed * 0.6 + i * 0.19) * 0.12;
        arr[i3 + 2] = mainData.basePositions[i3 + 2] + Math.sin(t * speed * 0.3 + i * 0.43) * 0.08;
      }
      pos.needsUpdate = true;
      pointsRef.current.rotation.y = t * 0.002;
    }

    if (nebulaRef.current) {
      const pos = nebulaRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < nebulaCount; i++) {
        const i3 = i * 3;
        arr[i3] = nebulaData.basePositions[i3] + Math.sin(t * 0.08 + i * 0.4) * 0.8;
        arr[i3 + 1] = nebulaData.basePositions[i3 + 1] + Math.cos(t * 0.06 + i * 0.25) * 0.5;
        arr[i3 + 2] = nebulaData.basePositions[i3 + 2] + Math.sin(t * 0.05 + i * 0.6) * 0.4;
      }
      pos.needsUpdate = true;
    }

    if (dustRef.current) {
      const pos = dustRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        const i3 = i * 3;
        arr[i3] = dustData.basePositions[i3] + Math.sin(t * 0.15 + i * 0.5) * 0.2;
        arr[i3 + 1] = dustData.basePositions[i3 + 1] + Math.cos(t * 0.12 + i * 0.3) * 0.15;
        arr[i3 + 2] = dustData.basePositions[i3 + 2];
      }
      pos.needsUpdate = true;
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
          size={0.04}
          map={circleMap}
          vertexColors
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <points ref={nebulaRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nebulaData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[nebulaData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.25}
          map={softMap}
          vertexColors
          transparent
          opacity={0.18}
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
          map={circleMap}
          vertexColors
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </>
  );
}
