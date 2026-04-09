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
  fontSize?: number;
}

function createCircleTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.3, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.6, "rgba(255,255,255,0.4)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
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
  for (let y = 0; y < canvasHeight; y += 1) {
    for (let x = 0; x < canvasWidth; x += 1) {
      const i = (y * canvasWidth + x) * 4;
      if (pixels[i] > 128) {
        validPositions.push({ x, y });
      }
    }
  }

  const selected: { x: number; y: number }[] = [];
  const count = Math.min(maxParticles, validPositions.length);
  const step = Math.max(1, Math.floor(validPositions.length / count));
  for (let i = 0; i < count; i++) {
    const idx = (i * step) % validPositions.length;
    const pos = validPositions[idx];
    selected.push({
      x: pos.x + (Math.random() - 0.5) * 0.8,
      y: pos.y + (Math.random() - 0.5) * 0.8,
    });
  }

  return selected;
}

export function ParticleText({
  text,
  opacity,
  position = [0, 0, 0],
  size = 4,
  particleCount = 12000,
  color1 = "#55aaff",
  color2 = "#aa55ff",
  color3 = "#ff55aa",
  fontSize = 200,
}: Props) {
  const pointsRef = useRef<THREE.Points>(null);
  const [ready, setReady] = useState(false);

  const canvasW = 600;
  const canvasH = 300;

  const circleMap = useMemo(() => createCircleTexture(), []);

  const data = useMemo(() => {
    const textPositions = sampleTextPositions(text, particleCount, canvasW, canvasH, fontSize);
    if (textPositions.length === 0) return null;

    const count = textPositions.length;
    const positions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
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
      const tz = (Math.random() - 0.5) * 0.15;

      targetPositions[i3] = tx;
      targetPositions[i3 + 1] = ty;
      targetPositions[i3 + 2] = tz;

      const angle = Math.random() * Math.PI * 2;
      const dist = 2 + Math.random() * 6;
      positions[i3] = Math.cos(angle) * dist;
      positions[i3 + 1] = Math.sin(angle) * dist;
      positions[i3 + 2] = (Math.random() - 0.5) * 8;

      randomOffsets[i3] = Math.random() * 10;
      randomOffsets[i3 + 1] = Math.random() * 10;
      randomOffsets[i3 + 2] = Math.random() * 10;

      const normalizedX = (textPositions[i].x / canvasW);
      let color: THREE.Color;
      if (normalizedX < 0.35) {
        color = c1.clone().lerp(c2, normalizedX / 0.35);
      } else if (normalizedX < 0.65) {
        color = c2.clone().lerp(c3, (normalizedX - 0.35) / 0.3);
      } else {
        color = c3.clone().lerp(c1, (normalizedX - 0.65) / 0.35);
      }

      const brightness = 0.8 + Math.random() * 0.2;
      colors[i3] = color.r * brightness;
      colors[i3 + 1] = color.g * brightness;
      colors[i3 + 2] = color.b * brightness;
    }

    return { positions, targetPositions, colors, randomOffsets, count };
  }, [text, particleCount, size, color1, color2, color3, fontSize]);

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => setReady(true), 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [data]);

  useFrame((state) => {
    if (!pointsRef.current || !data) return;
    const t = state.clock.elapsedTime;
    const pos = pointsRef.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;

    const morphSpeed = ready ? 0.03 : 0;

    for (let i = 0; i < data.count; i++) {
      const i3 = i * 3;
      const rx = data.randomOffsets[i3];
      const ry = data.randomOffsets[i3 + 1];
      const rz = data.randomOffsets[i3 + 2];

      const breatheX = Math.sin(t * 0.6 + rx) * 0.02;
      const breatheY = Math.cos(t * 0.5 + ry) * 0.02;
      const breatheZ = Math.sin(t * 0.4 + rz) * 0.01;

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
          size={0.025}
          map={circleMap}
          vertexColors
          transparent
          opacity={opacity * 0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
