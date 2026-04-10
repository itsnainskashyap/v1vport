import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  scrollProgress: number;
  opacity: number;
  onCardClick?: (index: number) => void;
}

function createGlowTexture(size: number): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.15, "rgba(255,255,255,0.8)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.3)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function CosmicOrbit({ scrollProgress, opacity, onCardClick }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const ringParticlesRef = useRef<THREE.Points>(null);
  const nebulaRef = useRef<THREE.Points>(null);
  const orbiterRefs = useRef<(THREE.Group | null)[]>([]);
  const smoothScroll = useRef(0);

  const basePath = import.meta.env.BASE_URL;
  const projectTextures = [
    "projects/prometheus.png",
    "projects/echo.png",
    "projects/patronus.png",
    "projects/maison-noir.png",
    "projects/stellar.png",
  ];
  const textures = useLoader(
    THREE.TextureLoader,
    projectTextures.map((p) => basePath + p)
  );

  const glowMap = useMemo(() => createGlowTexture(64), []);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isTablet = typeof window !== "undefined" && window.innerWidth >= 768 && window.innerWidth < 1024;

  const ringData = useMemo(() => {
    const ringCount = isMobile ? 8000 : isTablet ? 14000 : 22000;
    const positions = new Float32Array(ringCount * 3);
    const colors = new Float32Array(ringCount * 3);
    const basePositions = new Float32Array(ringCount * 3);

    const ringColors = [
      new THREE.Color("#55aaff"),
      new THREE.Color("#aa55ff"),
      new THREE.Color("#ff55aa"),
      new THREE.Color("#55ffcc"),
      new THREE.Color("#ffaa55"),
    ];

    for (let i = 0; i < ringCount; i++) {
      const i3 = i * 3;
      const ringIdx = Math.floor(Math.random() * 3);
      const baseRadius = 4 + ringIdx * 3;
      const spread = 0.8 + ringIdx * 0.4;
      const angle = Math.random() * Math.PI * 2;
      const radiusOffset = (Math.random() - 0.5) * spread;
      const r = baseRadius + radiusOffset;
      const tilt = ringIdx * 0.15;
      const ySpread = (Math.random() - 0.5) * (0.3 + ringIdx * 0.2);

      positions[i3] = Math.cos(angle) * r;
      positions[i3 + 1] = Math.sin(angle) * tilt + ySpread;
      positions[i3 + 2] = Math.sin(angle) * r;

      basePositions[i3] = positions[i3];
      basePositions[i3 + 1] = positions[i3 + 1];
      basePositions[i3 + 2] = positions[i3 + 2];

      const col = ringColors[(ringIdx + Math.floor(Math.random() * 2)) % ringColors.length];
      const brightness = 0.4 + Math.random() * 0.6;
      colors[i3] = col.r * brightness;
      colors[i3 + 1] = col.g * brightness;
      colors[i3 + 2] = col.b * brightness;
    }

    return { positions, basePositions, colors, count: ringCount };
  }, [isMobile, isTablet]);

  const nebulaData = useMemo(() => {
    const count = isMobile ? 3000 : isTablet ? 5000 : 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);

    const nebulaColors = [
      new THREE.Color("#4466ff"),
      new THREE.Color("#8833dd"),
      new THREE.Color("#dd3388"),
      new THREE.Color("#3388dd"),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * 2;

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i3 + 2] = r * Math.cos(phi);

      basePositions[i3] = positions[i3];
      basePositions[i3 + 1] = positions[i3 + 1];
      basePositions[i3 + 2] = positions[i3 + 2];

      const col = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
      const b = 0.3 + Math.random() * 0.7;
      colors[i3] = col.r * b;
      colors[i3 + 1] = col.g * b;
      colors[i3 + 2] = col.b * b;
    }

    return { positions, basePositions, colors, count };
  }, [isMobile, isTablet]);

  const orbiterConfigs = useMemo(() => [
    { radius: 5, speed: 0.4, tilt: 0.1, size: isMobile ? 1.8 : 2.5 },
    { radius: 7, speed: -0.3, tilt: -0.15, size: isMobile ? 1.6 : 2.2 },
    { radius: 9, speed: 0.2, tilt: 0.2, size: isMobile ? 1.5 : 2.0 },
    { radius: 6, speed: -0.35, tilt: -0.05, size: isMobile ? 1.7 : 2.3 },
    { radius: 8, speed: 0.25, tilt: 0.12, size: isMobile ? 1.5 : 2.1 },
  ], [isMobile]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    smoothScroll.current += (scrollProgress - smoothScroll.current) * 0.05;
    const dnaProgress = Math.max(0, Math.min(1, (smoothScroll.current - 0.28) / 0.3));

    groupRef.current.rotation.y = t * 0.05 + dnaProgress * Math.PI * 2;
    groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.05;

    if (ringParticlesRef.current) {
      const pos = ringParticlesRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < ringData.count; i++) {
        const i3 = i * 3;
        const wave = Math.sin(t * 0.3 + i * 0.01) * 0.05;
        arr[i3] = ringData.basePositions[i3] + Math.sin(t * 0.2 + i * 0.005) * 0.03;
        arr[i3 + 1] = ringData.basePositions[i3 + 1] + wave;
        arr[i3 + 2] = ringData.basePositions[i3 + 2] + Math.cos(t * 0.15 + i * 0.008) * 0.03;
      }
      pos.needsUpdate = true;
    }

    if (nebulaRef.current) {
      const pos = nebulaRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < nebulaData.count; i++) {
        const i3 = i * 3;
        arr[i3] = nebulaData.basePositions[i3] + Math.sin(t * 0.5 + i * 0.02) * 0.08;
        arr[i3 + 1] = nebulaData.basePositions[i3 + 1] + Math.cos(t * 0.4 + i * 0.015) * 0.06;
        arr[i3 + 2] = nebulaData.basePositions[i3 + 2] + Math.sin(t * 0.3 + i * 0.025) * 0.07;
      }
      pos.needsUpdate = true;
    }

    orbiterConfigs.forEach((config, i) => {
      const ref = orbiterRefs.current[i];
      if (!ref) return;
      const angle = t * config.speed + (i * Math.PI * 2) / 5;
      ref.position.x = Math.cos(angle) * config.radius;
      ref.position.y = Math.sin(angle) * config.tilt * config.radius + Math.sin(t * 0.5 + i) * 0.3;
      ref.position.z = Math.sin(angle) * config.radius;
      ref.rotation.y = -angle + Math.PI / 2;
      ref.rotation.x = Math.sin(t * 0.3 + i) * 0.1;
    });
  });

  const cardH = (isMobile ? 1.8 : 2.5) * 0.62;

  return (
    <group ref={groupRef} position={[0, 0, -35]}>
      <mesh>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial
          color="#1a0a2e"
          emissive="#4422aa"
          emissiveIntensity={0.8 * opacity}
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={opacity * 0.9}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial
          color="#6633cc"
          transparent
          opacity={opacity * 0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      <points ref={nebulaRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nebulaData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[nebulaData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          map={glowMap}
          vertexColors
          transparent
          opacity={opacity * 0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <points ref={ringParticlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[ringData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[ringData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          map={glowMap}
          vertexColors
          transparent
          opacity={opacity * 0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {orbiterConfigs.map((config, i) => (
        <group
          key={i}
          ref={(el) => { orbiterRefs.current[i] = el; }}
          onClick={() => onCardClick?.(i)}
        >
          <mesh>
            <planeGeometry args={[config.size, config.size * 0.62]} />
            <meshStandardMaterial
              map={textures[i]}
              transparent
              opacity={opacity * 0.92}
              roughness={0.08}
              metalness={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[config.size + 0.15, config.size * 0.62 + 0.15]} />
            <meshBasicMaterial
              color="#55aaff"
              transparent
              opacity={opacity * 0.12}
              side={THREE.DoubleSide}
            />
          </mesh>
          <pointLight intensity={0.6 * opacity} color="#55aaff" distance={5} />
        </group>
      ))}

      <pointLight position={[0, 0, 0]} intensity={3 * opacity} color="#6633cc" distance={20} />
      <pointLight position={[5, 3, 0]} intensity={1.5 * opacity} color="#55aaff" distance={15} />
      <pointLight position={[-5, -2, 3]} intensity={1.2 * opacity} color="#ff55aa" distance={12} />
      <pointLight position={[0, 5, -3]} intensity={1 * opacity} color="#55ffcc" distance={10} />
    </group>
  );
}
