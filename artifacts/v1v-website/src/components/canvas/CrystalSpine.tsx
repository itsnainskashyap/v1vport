import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  progress: number;
  opacity: number;
}

export function CrystalSpine({ progress, opacity }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const { crystals, spineGeometry } = useMemo(() => {
    const crystals: { pos: [number, number, number]; scale: number; rotSpeed: number; color: string }[] = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const spread = 2.0 + t * 1.5;
      const x = Math.sin(t * Math.PI * 5) * spread * 0.4;
      const y = (t - 0.5) * 10;
      const z = -32 + Math.cos(t * Math.PI * 5) * spread * 0.3;
      const colors = ["#6688aa", "#8866aa", "#cc8844", "#66aa88", "#aa6688"];
      crystals.push({
        pos: [x, y, z],
        scale: 0.08 + Math.random() * 0.18,
        rotSpeed: 0.3 + Math.random() * 1.2,
        color: colors[i % colors.length],
      });
    }

    const points: THREE.Vector3[] = [];
    const segments = 120;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = Math.sin(t * Math.PI * 5) * 0.25;
      const y = (t - 0.5) * 10;
      const z = -32 + Math.cos(t * Math.PI * 5) * 0.12;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const spineGeometry = new THREE.TubeGeometry(curve, 120, 0.02, 6, false);

    return { crystals, spineGeometry };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    const children = groupRef.current.children;
    for (let i = 0; i < children.length - 1; i++) {
      const child = children[i];
      const crystal = crystals[i];
      if (!crystal) continue;
      child.rotation.x = t * crystal.rotSpeed * 0.2;
      child.rotation.z = t * crystal.rotSpeed * 0.15;
      const breathe = Math.sin(t * 1.2 + i * 0.5) * 0.015;
      child.scale.setScalar(crystal.scale + breathe);
    }
  });

  return (
    <group ref={groupRef}>
      {crystals.map((crystal, i) => (
        <mesh key={i} position={crystal.pos}>
          <icosahedronGeometry args={[crystal.scale, 1]} />
          <meshPhysicalMaterial
            color={crystal.color}
            metalness={0.3}
            roughness={0.15}
            emissive={crystal.color}
            emissiveIntensity={0.25}
            transparent
            opacity={opacity * 0.75}
            clearcoat={1}
            iridescence={0.5}
          />
        </mesh>
      ))}
      <mesh geometry={spineGeometry}>
        <meshBasicMaterial
          color="#556677"
          transparent
          opacity={opacity * 0.25}
        />
      </mesh>
    </group>
  );
}
