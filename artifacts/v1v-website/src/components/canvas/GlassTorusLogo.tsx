import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function GlassTorusLogo() {
  const torusRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (torusRef.current) {
      torusRef.current.rotation.x = Math.sin(t * 0.2) * 0.1 + 0.3;
      torusRef.current.rotation.y = t * 0.15;
      torusRef.current.rotation.z = Math.cos(t * 0.15) * 0.05;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.x = t * 0.3;
      innerRingRef.current.rotation.y = Math.sin(t * 0.25) * 0.5;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={torusRef}>
        <torusGeometry args={[1.2, 0.08, 64, 128]} />
        <meshPhysicalMaterial
          color="#88ccff"
          metalness={0.1}
          roughness={0.05}
          transmission={0.92}
          thickness={0.5}
          ior={2.33}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={2}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh ref={innerRingRef}>
        <torusGeometry args={[0.6, 0.03, 32, 64]} />
        <meshPhysicalMaterial
          color="#a78bfa"
          metalness={0.3}
          roughness={0.1}
          emissive="#8b5cf6"
          emissiveIntensity={0.3}
          clearcoat={1}
          transparent
          opacity={0.7}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#00f0ff" distance={5} />
    </group>
  );
}
