import { useRef, useMemo, useCallback } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  scrollProgress: number;
  opacity: number;
  onCardClick?: (index: number) => void;
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

export function DNAHelix({ scrollProgress, opacity, onCardClick }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const strandRef1 = useRef<THREE.Points>(null);
  const strandRef2 = useRef<THREE.Points>(null);
  const basePairRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Points>(null);
  const backboneRef1 = useRef<THREE.Points>(null);
  const backboneRef2 = useRef<THREE.Points>(null);
  const cardGroupRef = useRef<THREE.Group>(null);

  const strandMap = useMemo(() => createCircleTexture(64, 0.25), []);
  const glowMap = useMemo(() => createCircleTexture(64, 0.05), []);
  const backboneMap = useMemo(() => createCircleTexture(64, 0.4), []);

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
    const radius = isMobile ? 1.4 : isTablet ? 1.6 : 2.0;
    const height = 50;
    const turns = 8;
    const strandDensity = isMobile ? 1200 : isTablet ? 2000 : 3200;
    const basePairCount = isMobile ? 140 : 240;
    const basePairDots = isMobile ? 10 : 18;
    const glowCount = isMobile ? 1600 : 3600;
    const backboneDensity = isMobile ? 600 : 1200;

    const s1Pos = new Float32Array(strandDensity * 3);
    const s1Base = new Float32Array(strandDensity * 3);
    const s1Colors = new Float32Array(strandDensity * 3);
    const s2Pos = new Float32Array(strandDensity * 3);
    const s2Base = new Float32Array(strandDensity * 3);
    const s2Colors = new Float32Array(strandDensity * 3);

    const c1 = new THREE.Color("#33ccff");
    const c1b = new THREE.Color("#66ddff");
    const c2 = new THREE.Color("#ff3366");
    const c2b = new THREE.Color("#ff6699");

    for (let i = 0; i < strandDensity; i++) {
      const i3 = i * 3;
      const t = i / strandDensity;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;

      const minorGroove = 0.92 + Math.sin(angle * 5) * 0.08;
      const r1 = radius * minorGroove;

      const jx = (Math.random() - 0.5) * 0.04;
      const jy = (Math.random() - 0.5) * 0.04;
      const jz = (Math.random() - 0.5) * 0.04;

      s1Pos[i3] = Math.cos(angle) * r1 + jx;
      s1Pos[i3 + 1] = y + jy;
      s1Pos[i3 + 2] = Math.sin(angle) * r1 + jz;
      s1Base[i3] = s1Pos[i3]; s1Base[i3 + 1] = s1Pos[i3 + 1]; s1Base[i3 + 2] = s1Pos[i3 + 2];

      const lerpT = Math.sin(angle * 2) * 0.5 + 0.5;
      const col1 = c1.clone().lerp(c1b, lerpT);
      const bright1 = 0.75 + Math.random() * 0.25;
      s1Colors[i3] = col1.r * bright1; s1Colors[i3 + 1] = col1.g * bright1; s1Colors[i3 + 2] = col1.b * bright1;

      s2Pos[i3] = Math.cos(angle + Math.PI) * r1 + jx;
      s2Pos[i3 + 1] = y + jy;
      s2Pos[i3 + 2] = Math.sin(angle + Math.PI) * r1 + jz;
      s2Base[i3] = s2Pos[i3]; s2Base[i3 + 1] = s2Pos[i3 + 1]; s2Base[i3 + 2] = s2Pos[i3 + 2];

      const col2 = c2.clone().lerp(c2b, lerpT);
      const bright2 = 0.75 + Math.random() * 0.25;
      s2Colors[i3] = col2.r * bright2; s2Colors[i3 + 1] = col2.g * bright2; s2Colors[i3 + 2] = col2.b * bright2;
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
      new THREE.Color("#ff55aa"),
      new THREE.Color("#aaff55"),
    ];

    for (let bp = 0; bp < basePairCount; bp++) {
      const t = (bp + 0.5) / basePairCount;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;
      const minorGroove = 0.92 + Math.sin(angle * 5) * 0.08;
      const r = radius * minorGroove;
      const p1x = Math.cos(angle) * r;
      const p1z = Math.sin(angle) * r;
      const p2x = Math.cos(angle + Math.PI) * r;
      const p2z = Math.sin(angle + Math.PI) * r;
      const col = pairColorList[bp % pairColorList.length];

      const pairWidth = 0.7 + Math.sin(bp * 1.5) * 0.3;

      for (let d = 0; d < basePairDots; d++) {
        const idx = (bp * basePairDots + d) * 3;
        const f = d / (basePairDots - 1);
        const midBulge = Math.sin(f * Math.PI) * 0.06;
        bpPos[idx] = p1x + (p2x - p1x) * f * pairWidth + (Math.random() - 0.5) * 0.02;
        bpPos[idx + 1] = y + midBulge + (Math.random() - 0.5) * 0.02;
        bpPos[idx + 2] = p1z + (p2z - p1z) * f * pairWidth + (Math.random() - 0.5) * 0.02;
        bpBase[idx] = bpPos[idx]; bpBase[idx + 1] = bpPos[idx + 1]; bpBase[idx + 2] = bpPos[idx + 2];
        const b = 0.6 + Math.random() * 0.4;
        const edgeFade = 1 - Math.abs(f - 0.5) * 0.4;
        bpColors[idx] = col.r * b * edgeFade;
        bpColors[idx + 1] = col.g * b * edgeFade;
        bpColors[idx + 2] = col.b * b * edgeFade;
      }
    }

    const bb1Pos = new Float32Array(backboneDensity * 3);
    const bb1Base = new Float32Array(backboneDensity * 3);
    const bb1Colors = new Float32Array(backboneDensity * 3);
    const bb2Pos = new Float32Array(backboneDensity * 3);
    const bb2Base = new Float32Array(backboneDensity * 3);
    const bb2Colors = new Float32Array(backboneDensity * 3);

    const bbColor1 = new THREE.Color("#88ddff");
    const bbColor2 = new THREE.Color("#ff88aa");

    for (let i = 0; i < backboneDensity; i++) {
      const i3 = i * 3;
      const t = i / backboneDensity;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;
      const outerR = radius * 1.15;

      bb1Pos[i3] = Math.cos(angle) * outerR + (Math.random() - 0.5) * 0.08;
      bb1Pos[i3 + 1] = y + (Math.random() - 0.5) * 0.08;
      bb1Pos[i3 + 2] = Math.sin(angle) * outerR + (Math.random() - 0.5) * 0.08;
      bb1Base[i3] = bb1Pos[i3]; bb1Base[i3 + 1] = bb1Pos[i3 + 1]; bb1Base[i3 + 2] = bb1Pos[i3 + 2];
      bb1Colors[i3] = bbColor1.r * 0.6; bb1Colors[i3 + 1] = bbColor1.g * 0.6; bb1Colors[i3 + 2] = bbColor1.b * 0.6;

      bb2Pos[i3] = Math.cos(angle + Math.PI) * outerR + (Math.random() - 0.5) * 0.08;
      bb2Pos[i3 + 1] = y + (Math.random() - 0.5) * 0.08;
      bb2Pos[i3 + 2] = Math.sin(angle + Math.PI) * outerR + (Math.random() - 0.5) * 0.08;
      bb2Base[i3] = bb2Pos[i3]; bb2Base[i3 + 1] = bb2Pos[i3 + 1]; bb2Base[i3 + 2] = bb2Pos[i3 + 2];
      bb2Colors[i3] = bbColor2.r * 0.6; bb2Colors[i3 + 1] = bbColor2.g * 0.6; bb2Colors[i3 + 2] = bbColor2.b * 0.6;
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
      glowColors[i3] = c.r * 0.4; glowColors[i3 + 1] = c.g * 0.4; glowColors[i3 + 2] = c.b * 0.4;
    }

    const cardPositions: { y: number; angle: number; side: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const t = 0.1 + (i * 0.18);
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;
      cardPositions.push({ y, angle, side: i % 2 === 0 ? 1 : -1 });
    }

    return {
      strand1: { positions: s1Pos, base: s1Base, colors: s1Colors, count: strandDensity },
      strand2: { positions: s2Pos, base: s2Base, colors: s2Colors, count: strandDensity },
      basePairs: { positions: bpPos, base: bpBase, colors: bpColors, count: totalBP },
      backbone1: { positions: bb1Pos, base: bb1Base, colors: bb1Colors, count: backboneDensity },
      backbone2: { positions: bb2Pos, base: bb2Base, colors: bb2Colors, count: backboneDensity },
      glow: { positions: glowPos, base: glowBase, colors: glowColors, count: glowCount },
      cardPositions,
      radius,
      height,
      turns,
    };
  }, [isMobile, isTablet]);

  const smoothScroll = useRef(0);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    smoothScroll.current += (scrollProgress - smoothScroll.current) * 0.05;

    const dnaProgress = Math.max(0, Math.min(1, (smoothScroll.current - 0.28) / 0.3));
    groupRef.current.rotation.y = dnaProgress * Math.PI * 4;

    const verticalShift = dnaProgress * dna.height * 0.4;
    groupRef.current.position.y = verticalShift;

    const animatePoints = (ref: React.RefObject<THREE.Points | null>, base: Float32Array, count: number, speed: number) => {
      if (!ref.current) return;
      const pos = ref.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        arr[i3] = base[i3] + Math.sin(t * speed + i * 0.2) * 0.03;
        arr[i3 + 1] = base[i3 + 1] + Math.cos(t * speed * 0.8 + i * 0.15) * 0.04;
        arr[i3 + 2] = base[i3 + 2] + Math.sin(t * speed * 0.5 + i * 0.25) * 0.02;
      }
      pos.needsUpdate = true;
    };

    animatePoints(strandRef1, dna.strand1.base, dna.strand1.count, 0.3);
    animatePoints(strandRef2, dna.strand2.base, dna.strand2.count, 0.3);
    animatePoints(basePairRef, dna.basePairs.base, dna.basePairs.count, 0.25);
    animatePoints(glowRef, dna.glow.base, dna.glow.count, 0.4);
    animatePoints(backboneRef1, dna.backbone1.base, dna.backbone1.count, 0.2);
    animatePoints(backboneRef2, dna.backbone2.base, dna.backbone2.count, 0.2);

    if (cardGroupRef.current) {
      const children = cardGroupRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const card = dna.cardPositions[i];
        if (!card) continue;
        const cardAngle = card.angle + groupRef.current.rotation.y;
        const cardR = dna.radius + 3.5;
        children[i].position.x = Math.cos(cardAngle) * cardR * card.side;
        children[i].position.y = card.y + Math.sin(t * 0.3 + i) * 0.15;
        children[i].position.z = Math.sin(cardAngle) * cardR * card.side;
        children[i].rotation.y = -cardAngle * card.side + Math.PI / 2;
      }
    }
  });

  const handleCardClick = useCallback((index: number) => {
    if (onCardClick) onCardClick(index);
  }, [onCardClick]);

  const cardScale = isMobile ? 2.8 : isTablet ? 3.5 : 4.2;
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

      <points ref={backboneRef1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dna.backbone1.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dna.backbone1.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} map={backboneMap} vertexColors transparent opacity={opacity * 0.5} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>

      <points ref={backboneRef2}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dna.backbone2.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dna.backbone2.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} map={backboneMap} vertexColors transparent opacity={opacity * 0.5} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>

      <points ref={basePairRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dna.basePairs.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dna.basePairs.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.08} map={strandMap} vertexColors transparent opacity={opacity * 0.85} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>

      <points ref={glowRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dna.glow.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dna.glow.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.05} map={glowMap} vertexColors transparent opacity={opacity * 0.4} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>

      <group ref={cardGroupRef}>
        {dna.cardPositions.map((_, i) => (
          <group key={i} onClick={() => handleCardClick(i)}>
            <mesh>
              <planeGeometry args={[cardScale, cardH]} />
              <meshStandardMaterial map={textures[i]} transparent opacity={opacity * 0.92} roughness={0.08} metalness={0.15} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0, -0.02]}>
              <planeGeometry args={[cardScale + 0.2, cardH + 0.2]} />
              <meshBasicMaterial color="#33ccff" transparent opacity={opacity * 0.1} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, -cardH / 2 - 0.15, 0]}>
              <planeGeometry args={[cardScale * 0.6, 0.01]} />
              <meshBasicMaterial color="#33ccff" transparent opacity={opacity * 0.3} />
            </mesh>
            <pointLight intensity={0.5 * opacity} color="#33aaff" distance={6} />
          </group>
        ))}
      </group>

      <pointLight position={[0, 15, 0]} intensity={1.5 * opacity} color="#33ccff" distance={30} />
      <pointLight position={[0, -15, 0]} intensity={1.2 * opacity} color="#ff3366" distance={25} />
      <pointLight position={[4, 0, 0]} intensity={0.8 * opacity} color="#55ff88" distance={15} />
      <pointLight position={[-4, 0, 0]} intensity={0.6 * opacity} color="#aa55ff" distance={12} />
    </group>
  );
}
