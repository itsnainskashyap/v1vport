import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  scrollProgress: number;
  opacity: number;
}

function createCircleTexture(size: number, hardness: number): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(hardness, "rgba(255,255,255,0.9)");
  gradient.addColorStop(hardness + 0.2, "rgba(255,255,255,0.3)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function DNAHelix({ scrollProgress, opacity }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const strandRef1 = useRef<THREE.Points>(null);
  const strandRef2 = useRef<THREE.Points>(null);
  const basePairRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Points>(null);
  const cardGroupRef = useRef<THREE.Group>(null);

  const strandMap = useMemo(() => createCircleTexture(64, 0.2), []);
  const glowMap = useMemo(() => createCircleTexture(64, 0.05), []);

  const projectTextures = [
    "/projects/prometheus.png",
    "/projects/echo.png",
    "/projects/patronus.png",
    "/projects/maison-noir.png",
    "/projects/stellar.png",
  ];

  const textures = useLoader(
    THREE.TextureLoader,
    projectTextures.map((p) => import.meta.env.BASE_URL + p.replace(/^\//, ""))
  );

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isTablet = typeof window !== "undefined" && window.innerWidth >= 768 && window.innerWidth < 1024;

  const dna = useMemo(() => {
    const radius = isMobile ? 1.0 : isTablet ? 1.1 : 1.3;
    const height = 45;
    const turns = 4.5;
    const strandDensity = isMobile ? 400 : isTablet ? 600 : 800;
    const basePairCount = isMobile ? 50 : 80;
    const basePairDots = isMobile ? 6 : 10;
    const glowCount = isMobile ? 600 : 1200;

    const s1Pos = new Float32Array(strandDensity * 3);
    const s1Base = new Float32Array(strandDensity * 3);
    const s1Colors = new Float32Array(strandDensity * 3);
    const s2Pos = new Float32Array(strandDensity * 3);
    const s2Base = new Float32Array(strandDensity * 3);
    const s2Colors = new Float32Array(strandDensity * 3);

    const c1 = new THREE.Color("#55bbff");
    const c2 = new THREE.Color("#ff5577");

    for (let i = 0; i < strandDensity; i++) {
      const i3 = i * 3;
      const t = i / strandDensity;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;

      const jx = (Math.random() - 0.5) * 0.08;
      const jy = (Math.random() - 0.5) * 0.08;
      const jz = (Math.random() - 0.5) * 0.08;

      s1Pos[i3] = Math.cos(angle) * radius + jx;
      s1Pos[i3 + 1] = y + jy;
      s1Pos[i3 + 2] = Math.sin(angle) * radius + jz;
      s1Base[i3] = s1Pos[i3]; s1Base[i3 + 1] = s1Pos[i3 + 1]; s1Base[i3 + 2] = s1Pos[i3 + 2];

      const bright1 = 0.7 + Math.random() * 0.3;
      s1Colors[i3] = c1.r * bright1; s1Colors[i3 + 1] = c1.g * bright1; s1Colors[i3 + 2] = c1.b * bright1;

      s2Pos[i3] = Math.cos(angle + Math.PI) * radius + jx;
      s2Pos[i3 + 1] = y + jy;
      s2Pos[i3 + 2] = Math.sin(angle + Math.PI) * radius + jz;
      s2Base[i3] = s2Pos[i3]; s2Base[i3 + 1] = s2Pos[i3 + 1]; s2Base[i3 + 2] = s2Pos[i3 + 2];

      const bright2 = 0.7 + Math.random() * 0.3;
      s2Colors[i3] = c2.r * bright2; s2Colors[i3 + 1] = c2.g * bright2; s2Colors[i3 + 2] = c2.b * bright2;
    }

    const totalBP = basePairCount * basePairDots;
    const bpPos = new Float32Array(totalBP * 3);
    const bpBase = new Float32Array(totalBP * 3);
    const bpColors = new Float32Array(totalBP * 3);
    const pairColorList = [
      new THREE.Color("#55ffaa"),
      new THREE.Color("#ffaa55"),
      new THREE.Color("#aa55ff"),
      new THREE.Color("#55aaff"),
    ];

    for (let bp = 0; bp < basePairCount; bp++) {
      const t = (bp + 0.5) / basePairCount;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;
      const p1x = Math.cos(angle) * radius;
      const p1z = Math.sin(angle) * radius;
      const p2x = Math.cos(angle + Math.PI) * radius;
      const p2z = Math.sin(angle + Math.PI) * radius;
      const col = pairColorList[bp % pairColorList.length];

      for (let d = 0; d < basePairDots; d++) {
        const idx = (bp * basePairDots + d) * 3;
        const f = d / (basePairDots - 1);
        bpPos[idx] = p1x + (p2x - p1x) * f + (Math.random() - 0.5) * 0.04;
        bpPos[idx + 1] = y + (Math.random() - 0.5) * 0.04;
        bpPos[idx + 2] = p1z + (p2z - p1z) * f + (Math.random() - 0.5) * 0.04;
        bpBase[idx] = bpPos[idx]; bpBase[idx + 1] = bpPos[idx + 1]; bpBase[idx + 2] = bpPos[idx + 2];
        const b = 0.6 + Math.random() * 0.4;
        bpColors[idx] = col.r * b; bpColors[idx + 1] = col.g * b; bpColors[idx + 2] = col.b * b;
      }
    }

    const glowPos = new Float32Array(glowCount * 3);
    const glowBase = new Float32Array(glowCount * 3);
    const glowColors = new Float32Array(glowCount * 3);
    const allColors = [c1, c2, ...pairColorList];

    for (let i = 0; i < glowCount; i++) {
      const i3 = i * 3;
      const t = Math.random();
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;
      const side = Math.random() > 0.5 ? 0 : Math.PI;
      const r = radius + (Math.random() - 0.5) * 1.2;
      glowPos[i3] = Math.cos(angle + side) * r + (Math.random() - 0.5) * 0.5;
      glowPos[i3 + 1] = y + (Math.random() - 0.5) * 0.8;
      glowPos[i3 + 2] = Math.sin(angle + side) * r + (Math.random() - 0.5) * 0.5;
      glowBase[i3] = glowPos[i3]; glowBase[i3 + 1] = glowPos[i3 + 1]; glowBase[i3 + 2] = glowPos[i3 + 2];
      const c = allColors[i % allColors.length];
      glowColors[i3] = c.r * 0.5; glowColors[i3 + 1] = c.g * 0.5; glowColors[i3 + 2] = c.b * 0.5;
    }

    const cardPositions: { y: number; angle: number; side: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const t = 0.12 + (i * 0.19);
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;
      cardPositions.push({ y, angle, side: i % 2 === 0 ? 1 : -1 });
    }

    return {
      strand1: { positions: s1Pos, base: s1Base, colors: s1Colors, count: strandDensity },
      strand2: { positions: s2Pos, base: s2Base, colors: s2Colors, count: strandDensity },
      basePairs: { positions: bpPos, base: bpBase, colors: bpColors, count: totalBP },
      glow: { positions: glowPos, base: glowBase, colors: glowColors, count: glowCount },
      cardPositions,
      radius,
      height,
      turns,
    };
  }, [isMobile, isTablet]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    const dnaZone = scrollProgress > 0.2 && scrollProgress < 0.75;
    const targetSpeed = dnaZone ? 0.35 : 0.04;
    const currentSpeed = THREE.MathUtils.lerp(
      groupRef.current.userData.rotSpeed || 0.04,
      targetSpeed,
      0.02
    );
    groupRef.current.userData.rotSpeed = currentSpeed;
    groupRef.current.rotation.y += currentSpeed * 0.016;

    const animatePoints = (ref: React.RefObject<THREE.Points | null>, base: Float32Array, count: number, speed: number) => {
      if (!ref.current) return;
      const pos = ref.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        arr[i3] = base[i3] + Math.sin(t * speed + i * 0.2) * 0.05;
        arr[i3 + 1] = base[i3 + 1] + Math.cos(t * speed * 0.8 + i * 0.15) * 0.06;
        arr[i3 + 2] = base[i3 + 2] + Math.sin(t * speed * 0.5 + i * 0.25) * 0.04;
      }
      pos.needsUpdate = true;
    };

    animatePoints(strandRef1, dna.strand1.base, dna.strand1.count, 0.4);
    animatePoints(strandRef2, dna.strand2.base, dna.strand2.count, 0.4);
    animatePoints(basePairRef, dna.basePairs.base, dna.basePairs.count, 0.3);
    animatePoints(glowRef, dna.glow.base, dna.glow.count, 0.5);

    if (cardGroupRef.current) {
      const children = cardGroupRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const card = dna.cardPositions[i];
        if (!card) continue;
        const cardAngle = card.angle + groupRef.current.rotation.y;
        const cardR = dna.radius + 2.8;
        children[i].position.x = Math.cos(cardAngle) * cardR * card.side;
        children[i].position.y = card.y + Math.sin(t * 0.3 + i) * 0.15;
        children[i].position.z = Math.sin(cardAngle) * cardR * card.side;
        children[i].rotation.y = -cardAngle * card.side + Math.PI / 2;
      }
    }
  });

  const cardScale = isMobile ? 2.2 : isTablet ? 2.8 : 3.5;
  const cardH = cardScale * 0.62;

  return (
    <group ref={groupRef} position={[0, 0, -35]}>
      <points ref={strandRef1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dna.strand1.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dna.strand1.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.12} map={strandMap} vertexColors transparent opacity={opacity * 0.95} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>

      <points ref={strandRef2}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dna.strand2.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dna.strand2.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.12} map={strandMap} vertexColors transparent opacity={opacity * 0.95} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>

      <points ref={basePairRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dna.basePairs.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dna.basePairs.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.09} map={strandMap} vertexColors transparent opacity={opacity * 0.8} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>

      <points ref={glowRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dna.glow.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dna.glow.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} map={glowMap} vertexColors transparent opacity={opacity * 0.4} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>

      <group ref={cardGroupRef}>
        {dna.cardPositions.map((_, i) => (
          <group key={i}>
            <mesh>
              <planeGeometry args={[cardScale, cardH]} />
              <meshStandardMaterial map={textures[i]} transparent opacity={opacity * 0.9} roughness={0.1} metalness={0.1} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[cardScale + 0.15, cardH + 0.15]} />
              <meshBasicMaterial color="#55aaff" transparent opacity={opacity * 0.08} side={THREE.DoubleSide} />
            </mesh>
            <pointLight intensity={0.4 * opacity} color="#5599cc" distance={5} />
          </group>
        ))}
      </group>

      <pointLight position={[0, 12, 0]} intensity={1.2 * opacity} color="#55aaff" distance={25} />
      <pointLight position={[0, -12, 0]} intensity={1.0 * opacity} color="#ff5577" distance={20} />
      <pointLight position={[3, 0, 0]} intensity={0.6 * opacity} color="#55ff88" distance={12} />
    </group>
  );
}
