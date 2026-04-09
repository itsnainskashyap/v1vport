import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  opacity: number;
}

export function GlassTorusLogo({ opacity }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const orbitParticlesRef = useRef<THREE.Points>(null);

  const orbitData = useMemo(() => {
    const count = 400;
    const positions = new Float32Array(count * 3);
    const baseAngles = new Float32Array(count);
    const baseRadii = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 1.2;
      const z = (Math.random() - 0.5) * 0.5;
      positions[i3] = Math.cos(angle) * r;
      positions[i3 + 1] = Math.sin(angle) * r;
      positions[i3 + 2] = z;
      baseAngles[i] = angle;
      baseRadii[i] = r;

      const t = Math.random();
      colors[i3] = 0.5 + t * 0.3;
      colors[i3 + 1] = 0.6 + t * 0.2;
      colors[i3 + 2] = 0.9 + t * 0.1;
    }

    return { positions, baseAngles, baseRadii, colors, count };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.05;
    }

    if (torusRef.current) {
      torusRef.current.rotation.x = Math.sin(t * 0.15) * 0.2 + 0.3;
      torusRef.current.rotation.z = Math.cos(t * 0.12) * 0.08;
      const mat = torusRef.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = opacity * 0.92;
      mat.iridescence = 0.8 + Math.sin(t * 0.4) * 0.2;
      mat.emissiveIntensity = 0.15 + Math.sin(t * 0.6) * 0.1;
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.x = t * 0.25;
      innerRingRef.current.rotation.y = Math.sin(t * 0.18) * 0.5;
      const mat = innerRingRef.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = opacity * 0.8;
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = -t * 0.08;
      outerRingRef.current.rotation.z = t * 0.05;
      const mat = outerRingRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = opacity * 0.15;
    }

    if (orbitParticlesRef.current) {
      const pos = orbitParticlesRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < orbitData.count; i++) {
        const i3 = i * 3;
        const a = orbitData.baseAngles[i] + t * (0.1 + (i % 5) * 0.02);
        const r = orbitData.baseRadii[i] + Math.sin(t * 0.8 + i * 0.5) * 0.1;
        arr[i3] = Math.cos(a) * r;
        arr[i3 + 1] = Math.sin(a) * r;
        arr[i3 + 2] = Math.sin(t * 0.5 + i * 0.3) * 0.3;
      }
      pos.needsUpdate = true;
      const mat = orbitParticlesRef.current.material as THREE.PointsMaterial;
      mat.opacity = opacity * 0.7;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh ref={torusRef}>
        <torusGeometry args={[1.6, 0.14, 64, 128]} />
        <meshPhysicalMaterial
          color="#88bbff"
          metalness={0.1}
          roughness={0.02}
          transmission={0.92}
          thickness={1.0}
          ior={2.4}
          clearcoat={1}
          clearcoatRoughness={0.01}
          envMapIntensity={3}
          iridescence={1}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[100, 800]}
          emissive="#3366aa"
          emissiveIntensity={0.15}
          transparent
          opacity={opacity * 0.92}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={innerRingRef}>
        <torusGeometry args={[0.85, 0.05, 32, 64]} />
        <meshPhysicalMaterial
          color="#aabbdd"
          metalness={0.3}
          roughness={0.05}
          emissive="#4466aa"
          emissiveIntensity={0.3}
          clearcoat={1}
          iridescence={0.8}
          iridescenceIOR={1.5}
          iridescenceThicknessRange={[200, 500]}
          transparent
          opacity={opacity * 0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={outerRingRef}>
        <torusGeometry args={[2.5, 0.015, 16, 128]} />
        <meshBasicMaterial
          color="#667799"
          transparent
          opacity={opacity * 0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      <points ref={orbitParticlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[orbitData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[orbitData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          vertexColors
          transparent
          opacity={opacity * 0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <pointLight position={[0, 0, 0.5]} intensity={0.6 * opacity} color="#5599cc" distance={8} />
      <pointLight position={[1.5, 0, 0]} intensity={0.3 * opacity} color="#8866cc" distance={5} />
      <pointLight position={[-1.5, 0, 0]} intensity={0.3 * opacity} color="#cc6688" distance={5} />
    </group>
  );
}
