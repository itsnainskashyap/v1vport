import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  scrollProgress: number;
}

function createCircleTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.3, "rgba(255,255,255,0.7)");
  gradient.addColorStop(0.6, "rgba(255,255,255,0.2)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

interface ShapeConfig {
  position: [number, number, number];
  geoType: "icosa" | "octa" | "torus" | "ring" | "dodeca";
  scale: number;
  rotSpeed: [number, number, number];
  color: string;
}

function WireframeShape({ config }: { config: ShapeConfig }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x += config.rotSpeed[0] * 0.01;
    meshRef.current.rotation.y += config.rotSpeed[1] * 0.01;
    meshRef.current.rotation.z += config.rotSpeed[2] * 0.01;
    meshRef.current.position.y = config.position[1] + Math.sin(t * 0.3 + config.position[0]) * 0.3;
  });

  const geo = useMemo(() => {
    switch (config.geoType) {
      case "icosa": return new THREE.IcosahedronGeometry(config.scale, 0);
      case "octa": return new THREE.OctahedronGeometry(config.scale, 0);
      case "torus": return new THREE.TorusGeometry(config.scale, config.scale * 0.3, 8, 16);
      case "ring": return new THREE.TorusGeometry(config.scale, config.scale * 0.05, 4, 32);
      case "dodeca": return new THREE.DodecahedronGeometry(config.scale, 0);
    }
  }, [config.geoType, config.scale]);

  return (
    <mesh ref={meshRef} position={config.position} geometry={geo}>
      <meshBasicMaterial color={config.color} wireframe transparent opacity={0.12} />
    </mesh>
  );
}

export function FloatingShapes({ scrollProgress }: Props) {
  const gridRef = useRef<THREE.Points>(null);
  const circleMap = useMemo(() => createCircleTexture(), []);

  const shapes: ShapeConfig[] = useMemo(() => [
    { position: [-8, 3, -5], geoType: "icosa", scale: 1.2, rotSpeed: [0.3, 0.5, 0.1], color: "#3388cc" },
    { position: [9, -2, -15], geoType: "octa", scale: 0.9, rotSpeed: [0.2, -0.4, 0.3], color: "#8855cc" },
    { position: [-7, 1, -25], geoType: "torus", scale: 1.0, rotSpeed: [0.4, 0.2, -0.1], color: "#cc5588" },
    { position: [8, 3, -35], geoType: "ring", scale: 1.8, rotSpeed: [0.1, 0.3, 0.2], color: "#55aaff" },
    { position: [-10, -2, -45], geoType: "dodeca", scale: 0.8, rotSpeed: [-0.2, 0.3, 0.4], color: "#55cc88" },
    { position: [7, 2, -55], geoType: "icosa", scale: 0.7, rotSpeed: [0.5, -0.2, 0.1], color: "#ccaa55" },
    { position: [-9, -1, -65], geoType: "octa", scale: 1.1, rotSpeed: [0.3, 0.4, -0.2], color: "#5588cc" },
    { position: [6, 4, -10], geoType: "ring", scale: 2.2, rotSpeed: [0.05, 0.15, 0], color: "#aa55cc" },
    { position: [-6, -3, -50], geoType: "torus", scale: 0.7, rotSpeed: [-0.3, 0.2, 0.5], color: "#55cccc" },
    { position: [10, 0, -70], geoType: "dodeca", scale: 1.3, rotSpeed: [0.2, -0.3, 0.1], color: "#cc5555" },
    { position: [-5, 5, -20], geoType: "ring", scale: 1.5, rotSpeed: [0.08, 0.2, 0.05], color: "#4477cc" },
    { position: [5, -4, -40], geoType: "icosa", scale: 0.6, rotSpeed: [0.4, 0.3, -0.2], color: "#cc77aa" },
  ], []);

  const gridData = useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const gridColors = [
      new THREE.Color("#2244aa"),
      new THREE.Color("#442288"),
      new THREE.Color("#224488"),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const gridSize = 30;
      const cols = Math.ceil(Math.sqrt(count));
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = (col / cols - 0.5) * gridSize * 2 + (Math.random() - 0.5) * 0.5;
      const z = -80 + row * 1.2 + (Math.random() - 0.5) * 0.5;
      const y = -6 + Math.sin(x * 0.3) * 0.5 + Math.cos(z * 0.2) * 0.5;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      basePositions[i3] = x;
      basePositions[i3 + 1] = y;
      basePositions[i3 + 2] = z;

      const c = gridColors[i % gridColors.length];
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    return { positions, basePositions, colors, count };
  }, []);

  useFrame((state) => {
    if (!gridRef.current) return;
    const t = state.clock.elapsedTime;
    const pos = gridRef.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < gridData.count; i++) {
      const i3 = i * 3;
      const bx = gridData.basePositions[i3];
      const bz = gridData.basePositions[i3 + 2];
      arr[i3 + 1] = gridData.basePositions[i3 + 1] +
        Math.sin(t * 0.5 + bx * 0.3) * 0.3 +
        Math.cos(t * 0.3 + bz * 0.2) * 0.2;
    }
    pos.needsUpdate = true;
  });

  return (
    <>
      {shapes.map((shape, i) => (
        <WireframeShape key={i} config={shape} />
      ))}

      <points ref={gridRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[gridData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[gridData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          map={circleMap}
          vertexColors
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </>
  );
}
