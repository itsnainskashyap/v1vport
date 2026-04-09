import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  opacity: number;
}

export function GlassTorusLogo({ opacity }: Props) {
  const torusRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  const v1vShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.35, -0.3);
    shape.lineTo(-0.15, 0.3);
    shape.lineTo(0, -0.05);
    shape.lineTo(0.15, 0.3);
    shape.lineTo(0.35, -0.3);
    shape.lineTo(0.25, -0.3);
    shape.lineTo(0.12, 0.15);
    shape.lineTo(0, -0.2);
    shape.lineTo(-0.12, 0.15);
    shape.lineTo(-0.25, -0.3);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 3,
    });
    geo.center();
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (torusRef.current) {
      torusRef.current.rotation.x = Math.sin(t * 0.15) * 0.15 + 0.2;
      torusRef.current.rotation.y = t * 0.1;
      torusRef.current.rotation.z = Math.cos(t * 0.12) * 0.05;
      const mat = torusRef.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = opacity * 0.92;
      mat.iridescence = 0.8 + Math.sin(t * 0.4) * 0.2;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.x = t * 0.2;
      innerRingRef.current.rotation.y = Math.sin(t * 0.18) * 0.4;
      const mat = innerRingRef.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = opacity * 0.75;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = -t * 0.06;
      outerRingRef.current.rotation.y = t * 0.04;
      const mat = outerRingRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = opacity * 0.12;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={torusRef}>
        <torusGeometry args={[1.4, 0.12, 64, 128]} />
        <meshPhysicalMaterial
          color="#aaddff"
          metalness={0.05}
          roughness={0.03}
          transmission={0.95}
          thickness={0.8}
          ior={2.4}
          clearcoat={1}
          clearcoatRoughness={0.01}
          envMapIntensity={3}
          iridescence={1}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[100, 800]}
          transparent
          opacity={opacity * 0.92}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={innerRingRef}>
        <torusGeometry args={[0.7, 0.04, 32, 64]} />
        <meshPhysicalMaterial
          color="#ccccdd"
          metalness={0.2}
          roughness={0.08}
          emissive="#334455"
          emissiveIntensity={0.2}
          clearcoat={1}
          iridescence={0.6}
          iridescenceIOR={1.5}
          iridescenceThicknessRange={[200, 500]}
          transparent
          opacity={opacity * 0.75}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={outerRingRef}>
        <torusGeometry args={[2.2, 0.01, 16, 128]} />
        <meshBasicMaterial
          color="#556677"
          transparent
          opacity={opacity * 0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={v1vShape} position={[0, -0.02, 0]}>
        <meshPhysicalMaterial
          color="#778899"
          metalness={0.5}
          roughness={0.15}
          emissive="#445566"
          emissiveIntensity={0.15 * opacity}
          transparent
          opacity={opacity * 0.6}
        />
      </mesh>
      <pointLight position={[0, 0, 0.5]} intensity={0.3 * opacity} color="#88aacc" distance={6} />
    </group>
  );
}
