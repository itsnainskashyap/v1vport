import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  scrollProgress: number;
  opacity: number;
}

function createCircleTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.8)");
  gradient.addColorStop(0.7, "rgba(255,255,255,0.3)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function DNAHelix({ scrollProgress, opacity }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const circleMap = useMemo(() => createCircleTexture(), []);

  const { strand1Geo, strand2Geo, basePairs, particleData } = useMemo(() => {
    const radius = 1.2;
    const height = 20;
    const turns = 3;
    const segments = 300;

    const points1: THREE.Vector3[] = [];
    const points2: THREE.Vector3[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;
      points1.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      ));
      points2.push(new THREE.Vector3(
        Math.cos(angle + Math.PI) * radius,
        y,
        Math.sin(angle + Math.PI) * radius
      ));
    }

    const curve1 = new THREE.CatmullRomCurve3(points1);
    const curve2 = new THREE.CatmullRomCurve3(points2);
    const strand1Geo = new THREE.TubeGeometry(curve1, segments, 0.06, 8, false);
    const strand2Geo = new THREE.TubeGeometry(curve2, segments, 0.06, 8, false);

    const basePairCount = 40;
    const basePairs: { start: THREE.Vector3; end: THREE.Vector3; color: string; midColor: string }[] = [];
    const pairColors = [
      { color: "#55aaff", midColor: "#88ccff" },
      { color: "#ff5577", midColor: "#ff88aa" },
      { color: "#55ff88", midColor: "#88ffaa" },
      { color: "#ffaa33", midColor: "#ffcc66" },
    ];

    for (let i = 0; i < basePairCount; i++) {
      const t = (i + 0.5) / basePairCount;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;
      const c = pairColors[i % pairColors.length];
      basePairs.push({
        start: new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius),
        end: new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius),
        color: c.color,
        midColor: c.midColor,
      });
    }

    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const basePositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const pColors = [
      new THREE.Color("#55aaff"),
      new THREE.Color("#ff5577"),
      new THREE.Color("#55ff88"),
      new THREE.Color("#ffaa33"),
      new THREE.Color("#aa55ff"),
      new THREE.Color("#55ffff"),
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const t = Math.random();
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;
      const side = Math.random() > 0.5 ? 0 : Math.PI;
      const r = radius + (Math.random() - 0.5) * 0.8;

      positions[i3] = Math.cos(angle + side) * r + (Math.random() - 0.5) * 0.3;
      positions[i3 + 1] = y + (Math.random() - 0.5) * 0.5;
      positions[i3 + 2] = Math.sin(angle + side) * r + (Math.random() - 0.5) * 0.3;
      basePositions[i3] = positions[i3];
      basePositions[i3 + 1] = positions[i3 + 1];
      basePositions[i3 + 2] = positions[i3 + 2];

      const c = pColors[i % pColors.length];
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    return { strand1Geo, strand2Geo, basePairs, particleData: { positions, basePositions, colors, count: particleCount } };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    const dnaZone = scrollProgress > 0.25 && scrollProgress < 0.55;
    const targetSpeed = dnaZone ? 0.4 : 0.05;
    const currentSpeed = THREE.MathUtils.lerp(
      groupRef.current.userData.rotSpeed || 0.05,
      targetSpeed,
      0.02
    );
    groupRef.current.userData.rotSpeed = currentSpeed;
    groupRef.current.rotation.y += currentSpeed * 0.016;

    groupRef.current.position.y = Math.sin(t * 0.3) * 0.2;

    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < particleData.count; i++) {
        const i3 = i * 3;
        arr[i3] = particleData.basePositions[i3] + Math.sin(t * 0.5 + i * 0.15) * 0.08;
        arr[i3 + 1] = particleData.basePositions[i3 + 1] + Math.cos(t * 0.7 + i * 0.1) * 0.1;
        arr[i3 + 2] = particleData.basePositions[i3 + 2] + Math.sin(t * 0.4 + i * 0.2) * 0.06;
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -32]}>
      <mesh geometry={strand1Geo}>
        <meshPhysicalMaterial
          color="#55aaff"
          emissive="#2266cc"
          emissiveIntensity={0.5}
          metalness={0.4}
          roughness={0.1}
          transparent
          opacity={opacity * 0.85}
          clearcoat={1}
        />
      </mesh>

      <mesh geometry={strand2Geo}>
        <meshPhysicalMaterial
          color="#ff5577"
          emissive="#cc2244"
          emissiveIntensity={0.5}
          metalness={0.4}
          roughness={0.1}
          transparent
          opacity={opacity * 0.85}
          clearcoat={1}
        />
      </mesh>

      {basePairs.map((pair, i) => {
        const mid = new THREE.Vector3().lerpVectors(pair.start, pair.end, 0.5);
        const dir = new THREE.Vector3().subVectors(pair.end, pair.start);
        const length = dir.length();
        const halfLen = length / 2;

        return (
          <group key={i}>
            <mesh position={[
              (pair.start.x + mid.x) / 2,
              (pair.start.y + mid.y) / 2,
              (pair.start.z + mid.z) / 2
            ]} lookAt={mid}>
              <cylinderGeometry args={[0.03, 0.03, halfLen, 6]} />
              <meshPhysicalMaterial
                color={pair.color}
                emissive={pair.color}
                emissiveIntensity={0.4}
                transparent
                opacity={opacity * 0.7}
                metalness={0.3}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[
              (pair.end.x + mid.x) / 2,
              (pair.end.y + mid.y) / 2,
              (pair.end.z + mid.z) / 2
            ]}>
              <cylinderGeometry args={[0.03, 0.03, halfLen, 6]} />
              <meshPhysicalMaterial
                color={pair.midColor}
                emissive={pair.midColor}
                emissiveIntensity={0.4}
                transparent
                opacity={opacity * 0.7}
                metalness={0.3}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[mid.x, mid.y, mid.z]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshPhysicalMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.6}
                transparent
                opacity={opacity * 0.8}
              />
            </mesh>
          </group>
        );
      })}

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particleData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[particleData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          map={circleMap}
          vertexColors
          transparent
          opacity={opacity * 0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <pointLight position={[0, 5, 0]} intensity={1.0 * opacity} color="#55aaff" distance={15} />
      <pointLight position={[0, -5, 0]} intensity={0.8 * opacity} color="#ff5577" distance={12} />
      <pointLight position={[2, 0, 0]} intensity={0.5 * opacity} color="#55ff88" distance={8} />
    </group>
  );
}
