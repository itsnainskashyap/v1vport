import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  progress: number;
  opacity: number;
}

export function CrystalSpine({ progress, opacity }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const crystals = useMemo(() => {
    const items: { pos: [number, number, number]; scale: number; rotSpeed: number; color: string }[] = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const x = Math.sin(t * Math.PI * 4) * (1.5 + t * 0.5);
      const y = (t - 0.5) * 6;
      const z = Math.cos(t * Math.PI * 4) * 0.5;
      const colors = ["#00f0ff", "#8b5cf6", "#f0c040", "#00d4ff"];
      items.push({
        pos: [x, y, z],
        scale: 0.08 + Math.random() * 0.12,
        rotSpeed: 0.5 + Math.random() * 1.5,
        color: colors[i % colors.length],
      });
    }
    return items;
  }, []);

  const spineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 100;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = Math.sin(t * Math.PI * 4) * 0.3;
      const y = (t - 0.5) * 6;
      const z = Math.cos(t * Math.PI * 4) * 0.15;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 100, 0.015, 8, false);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.05;

    groupRef.current.children.forEach((child, i) => {
      if (i < crystals.length) {
        const crystal = crystals[i];
        child.rotation.x = t * crystal.rotSpeed * 0.3;
        child.rotation.z = t * crystal.rotSpeed * 0.2;
        const breathe = Math.sin(t * 1.5 + i * 0.4) * 0.02;
        child.scale.setScalar(crystal.scale + breathe);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {crystals.map((crystal, i) => (
        <mesh key={i} position={crystal.pos}>
          <icosahedronGeometry args={[crystal.scale, 1]} />
          <meshPhysicalMaterial
            color={crystal.color}
            metalness={0.2}
            roughness={0.1}
            emissive={crystal.color}
            emissiveIntensity={0.5}
            transparent
            opacity={opacity * 0.8}
            clearcoat={1}
          />
        </mesh>
      ))}
      <mesh geometry={spineGeometry}>
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={opacity * 0.3}
        />
      </mesh>
    </group>
  );
}
