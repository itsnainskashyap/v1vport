import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  progress: number;
  opacity: number;
}

export function HexTunnel({ progress, opacity }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const hexRings = useMemo(() => {
    const rings: { position: THREE.Vector3; rotation: number; scale: number }[] = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const z = -i * 1.2;
      rings.push({
        position: new THREE.Vector3(0, 0, z),
        rotation: (i * Math.PI) / 6,
        scale: 1.5 + Math.sin(i * 0.5) * 0.3,
      });
    }
    return rings;
  }, []);

  const hexShape = useMemo(() => {
    const shape = new THREE.Shape();
    const sides = 6;
    const r = 1;
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    const hole = new THREE.Path();
    const innerR = r - 0.06;
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * innerR;
      const y = Math.sin(angle) * innerR;
      if (i === 0) hole.moveTo(x, y);
      else hole.lineTo(x, y);
    }
    shape.holes.push(hole);
    return shape;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.z = 3 + progress * 8;
    groupRef.current.children.forEach((child, i) => {
      child.rotation.z = (i * Math.PI) / 6 + t * 0.1 * (i % 2 === 0 ? 1 : -1);
      const pulse = Math.sin(t * 2 + i * 0.5) * 0.05;
      child.scale.setScalar(hexRings[i].scale + pulse);
    });
  });

  return (
    <group ref={groupRef}>
      {hexRings.map((ring, i) => (
        <mesh key={i} position={ring.position} rotation={[0, 0, ring.rotation]}>
          <shapeGeometry args={[hexShape]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? "#00f0ff" : "#8b5cf6"}
            transparent
            opacity={opacity * (0.15 + Math.sin(i * 0.7) * 0.1)}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <pointLight position={[0, 0, -6]} intensity={0.8 * opacity} color="#00f0ff" distance={15} />
    </group>
  );
}
