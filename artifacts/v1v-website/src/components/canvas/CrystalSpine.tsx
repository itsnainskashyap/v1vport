import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  progress: number;
  opacity: number;
}

export function CrystalSpine({ progress, opacity }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Points>(null);

  const { crystals, spineGeometry, glowData } = useMemo(() => {
    const crystals: { pos: [number, number, number]; scale: number; rotSpeed: number; color: string; emissive: string }[] = [];
    const count = 36;
    const colors = [
      { color: "#55aaff", emissive: "#2266cc" },
      { color: "#aa66ff", emissive: "#6633aa" },
      { color: "#ff6688", emissive: "#cc3355" },
      { color: "#66ffaa", emissive: "#33aa66" },
      { color: "#ffaa44", emissive: "#cc7722" },
      { color: "#44ddff", emissive: "#2299cc" },
    ];

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const spread = 2.5 + t * 2.0;
      const x = Math.sin(t * Math.PI * 4) * spread * 0.5;
      const y = (t - 0.5) * 12;
      const z = -32 + Math.cos(t * Math.PI * 4) * spread * 0.4;
      const c = colors[i % colors.length];
      crystals.push({
        pos: [x, y, z],
        scale: 0.15 + Math.random() * 0.3,
        rotSpeed: 0.4 + Math.random() * 1.5,
        color: c.color,
        emissive: c.emissive,
      });
    }

    const points: THREE.Vector3[] = [];
    const segments = 150;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = Math.sin(t * Math.PI * 4) * 0.35;
      const y = (t - 0.5) * 12;
      const z = -32 + Math.cos(t * Math.PI * 4) * 0.2;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const spineGeometry = new THREE.TubeGeometry(curve, 150, 0.03, 8, false);

    const glowCount = 600;
    const glowPositions = new Float32Array(glowCount * 3);
    const glowColors = new Float32Array(glowCount * 3);
    const glowBasePositions = new Float32Array(glowCount * 3);

    for (let i = 0; i < glowCount; i++) {
      const i3 = i * 3;
      const t = Math.random();
      const spread = 2.5 + t * 2.0;
      const x = Math.sin(t * Math.PI * 4) * spread * 0.5 + (Math.random() - 0.5) * 1.5;
      const y = (t - 0.5) * 12 + (Math.random() - 0.5) * 1.0;
      const z = -32 + Math.cos(t * Math.PI * 4) * spread * 0.4 + (Math.random() - 0.5) * 1.0;
      glowPositions[i3] = x;
      glowPositions[i3 + 1] = y;
      glowPositions[i3 + 2] = z;
      glowBasePositions[i3] = x;
      glowBasePositions[i3 + 1] = y;
      glowBasePositions[i3 + 2] = z;

      const ci = i % 6;
      const cArr = [
        [0.4, 0.7, 1.0],
        [0.7, 0.4, 1.0],
        [1.0, 0.4, 0.5],
        [0.4, 1.0, 0.7],
        [1.0, 0.7, 0.3],
        [0.3, 0.9, 1.0],
      ];
      glowColors[i3] = cArr[ci][0];
      glowColors[i3 + 1] = cArr[ci][1];
      glowColors[i3 + 2] = cArr[ci][2];
    }

    return { crystals, spineGeometry, glowData: { positions: glowPositions, basePositions: glowBasePositions, colors: glowColors, count: glowCount } };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    const children = groupRef.current.children;
    for (let i = 0; i < crystals.length; i++) {
      const child = children[i];
      const crystal = crystals[i];
      if (!child || !crystal) continue;
      child.rotation.x = t * crystal.rotSpeed * 0.3;
      child.rotation.z = t * crystal.rotSpeed * 0.2;
      child.rotation.y = t * crystal.rotSpeed * 0.15;
      const breathe = Math.sin(t * 1.5 + i * 0.6) * 0.03;
      child.scale.setScalar(crystal.scale + breathe);

      const mat = (child as THREE.Mesh).material as THREE.MeshPhysicalMaterial;
      if (mat) {
        mat.emissiveIntensity = 0.4 + Math.sin(t * 2 + i * 0.8) * 0.2;
      }
    }

    if (glowRef.current) {
      const pos = glowRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < glowData.count; i++) {
        const i3 = i * 3;
        arr[i3] = glowData.basePositions[i3] + Math.sin(t * 0.6 + i * 0.3) * 0.15;
        arr[i3 + 1] = glowData.basePositions[i3 + 1] + Math.cos(t * 0.8 + i * 0.2) * 0.2;
        arr[i3 + 2] = glowData.basePositions[i3 + 2] + Math.sin(t * 0.4 + i * 0.5) * 0.1;
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <>
      <group ref={groupRef}>
        {crystals.map((crystal, i) => (
          <mesh key={i} position={crystal.pos}>
            <icosahedronGeometry args={[crystal.scale, 2]} />
            <meshPhysicalMaterial
              color={crystal.color}
              metalness={0.4}
              roughness={0.1}
              emissive={crystal.emissive}
              emissiveIntensity={0.4}
              transparent
              opacity={opacity * 0.85}
              clearcoat={1}
              clearcoatRoughness={0.05}
              iridescence={0.7}
              iridescenceIOR={1.6}
              envMapIntensity={2}
            />
          </mesh>
        ))}
        <mesh geometry={spineGeometry}>
          <meshPhysicalMaterial
            color="#5588cc"
            emissive="#3366aa"
            emissiveIntensity={0.3}
            transparent
            opacity={opacity * 0.5}
            metalness={0.5}
            roughness={0.1}
          />
        </mesh>
      </group>

      <points ref={glowRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[glowData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[glowData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={opacity * 0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <pointLight position={[0, 3, -32]} intensity={1.0 * opacity} color="#5588cc" distance={12} />
      <pointLight position={[0, -3, -32]} intensity={0.7 * opacity} color="#8855cc" distance={10} />
    </>
  );
}
