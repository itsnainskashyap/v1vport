import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  text: string;
  opacity: number;
  position?: [number, number, number];
  size?: number;
  particleCount?: number;
  color1?: string;
  color2?: string;
  color3?: string;
}

function sampleTextPositions(
  text: string,
  maxParticles: number,
  canvasWidth: number,
  canvasHeight: number,
  fontSize: number
): { x: number; y: number }[] {
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = "#fff";
  ctx.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);

  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const pixels = imageData.data;

  const validPositions: { x: number; y: number }[] = [];
  const step = 2;
  for (let y = 0; y < canvasHeight; y += step) {
    for (let x = 0; x < canvasWidth; x += step) {
      const i = (y * canvasWidth + x) * 4;
      if (pixels[i] > 128) {
        validPositions.push({ x, y });
      }
    }
  }

  const selected: { x: number; y: number }[] = [];
  const count = Math.min(maxParticles, validPositions.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * validPositions.length);
    selected.push(validPositions[idx]);
  }

  return selected;
}

export function ParticleText({
  text,
  opacity,
  position = [0, 0, 0],
  size = 4,
  particleCount = 8000,
  color1 = "#88ccff",
  color2 = "#aa88ff",
  color3 = "#ff88cc",
}: Props) {
  const pointsRef = useRef<THREE.Points>(null);
  const [ready, setReady] = useState(false);

  const canvasW = 512;
  const canvasH = 256;
  const fontSize = 180;

  const data = useMemo(() => {
    const textPositions = sampleTextPositions(text, particleCount, canvasW, canvasH, fontSize);
    if (textPositions.length === 0) return null;

    const count = textPositions.length;
    const positions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const randomOffsets = new Float32Array(count * 3);

    const scaleX = size / canvasW;
    const scaleY = (size * (canvasH / canvasW)) / canvasH;

    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    const c3 = new THREE.Color(color3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const tx = (textPositions[i].x - canvasW / 2) * scaleX;
      const ty = -(textPositions[i].y - canvasH / 2) * scaleY;
      const tz = (Math.random() - 0.5) * 0.3;

      targetPositions[i3] = tx;
      targetPositions[i3 + 1] = ty;
      targetPositions[i3 + 2] = tz;

      const angle = Math.random() * Math.PI * 2;
      const dist = 3 + Math.random() * 8;
      positions[i3] = Math.cos(angle) * dist;
      positions[i3 + 1] = Math.sin(angle) * dist;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      randomOffsets[i3] = Math.random() * 10;
      randomOffsets[i3 + 1] = Math.random() * 10;
      randomOffsets[i3 + 2] = Math.random() * 10;

      const colorT = Math.random();
      let color: THREE.Color;
      if (colorT < 0.4) {
        color = c1.clone().lerp(c2, colorT / 0.4);
      } else if (colorT < 0.7) {
        color = c2.clone().lerp(c3, (colorT - 0.4) / 0.3);
      } else {
        color = c3.clone().lerp(c1, (colorT - 0.7) / 0.3);
      }
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = 0.015 + Math.random() * 0.035;
    }

    return { positions, targetPositions, colors, sizes, randomOffsets, count };
  }, [text, particleCount, size, color1, color2, color3]);

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => setReady(true), 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [data]);

  useFrame((state) => {
    if (!pointsRef.current || !data) return;
    const t = state.clock.elapsedTime;
    const pos = pointsRef.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;

    const morphSpeed = ready ? 0.025 : 0;

    for (let i = 0; i < data.count; i++) {
      const i3 = i * 3;
      const rx = data.randomOffsets[i3];
      const ry = data.randomOffsets[i3 + 1];
      const rz = data.randomOffsets[i3 + 2];

      const breatheX = Math.sin(t * 0.8 + rx) * 0.04;
      const breatheY = Math.cos(t * 0.6 + ry) * 0.04;
      const breatheZ = Math.sin(t * 0.5 + rz) * 0.02;

      const targetX = data.targetPositions[i3] + breatheX;
      const targetY = data.targetPositions[i3 + 1] + breatheY;
      const targetZ = data.targetPositions[i3 + 2] + breatheZ;

      arr[i3] += (targetX - arr[i3]) * morphSpeed;
      arr[i3 + 1] += (targetY - arr[i3 + 1]) * morphSpeed;
      arr[i3 + 2] += (targetZ - arr[i3 + 2]) * morphSpeed;
    }
    pos.needsUpdate = true;
  });

  if (!data) return null;

  return (
    <group position={position}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          vertexColors
          transparent
          opacity={opacity * 0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
