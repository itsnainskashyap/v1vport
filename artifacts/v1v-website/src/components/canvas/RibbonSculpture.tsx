import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  opacity: number;
}

export function RibbonSculpture({ opacity }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const secondRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 400;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const scale = 3.2;
      const x = Math.sin(t) * scale * 0.45;
      const y = Math.sin(t * 2) * scale * 0.9;
      const z = Math.cos(t) * scale * 0.3;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points, true);
    return new THREE.TubeGeometry(curve, 400, 0.022, 8, true);
  }, []);

  const geometry2 = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 300;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const scale = 2.5;
      const x = Math.sin(t * 2) * scale * 0.35;
      const y = Math.cos(t) * scale * 0.7;
      const z = Math.sin(t * 3) * scale * 0.2;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points, true);
    return new THREE.TubeGeometry(curve, 300, 0.015, 8, true);
  }, []);

  const trailData = useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const t = (i / count) * Math.PI * 2;
      const scale = 3.0;
      const x = Math.sin(t) * scale * 0.45 + (Math.random() - 0.5) * 0.5;
      const y = Math.sin(t * 2) * scale * 0.9 + (Math.random() - 0.5) * 0.5;
      const z = Math.cos(t) * scale * 0.3 + (Math.random() - 0.5) * 0.5;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      basePositions[i3] = x;
      basePositions[i3 + 1] = y;
      basePositions[i3 + 2] = z;

      colors[i3] = 0.5 + Math.random() * 0.3;
      colors[i3 + 1] = 0.6 + Math.random() * 0.2;
      colors[i3 + 2] = 0.9 + Math.random() * 0.1;
    }

    return { positions, basePositions, colors, count };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.07;
      meshRef.current.rotation.z = Math.sin(t * 0.08) * 0.04;
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = opacity * 0.75;
      mat.emissiveIntensity = 0.25 + Math.sin(t * 0.5) * 0.1;
    }

    if (secondRef.current) {
      secondRef.current.rotation.y = -t * 0.05;
      secondRef.current.rotation.x = t * 0.03;
      const mat = secondRef.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = opacity * 0.5;
    }

    if (trailRef.current) {
      const pos = trailRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < trailData.count; i++) {
        const i3 = i * 3;
        arr[i3] = trailData.basePositions[i3] + Math.sin(t * 0.5 + i * 0.1) * 0.15;
        arr[i3 + 1] = trailData.basePositions[i3 + 1] + Math.cos(t * 0.4 + i * 0.15) * 0.15;
        arr[i3 + 2] = trailData.basePositions[i3 + 2] + Math.sin(t * 0.3 + i * 0.2) * 0.1;
      }
      pos.needsUpdate = true;
      const mat = trailRef.current.material as THREE.PointsMaterial;
      mat.opacity = opacity * 0.5;
    }
  });

  return (
    <group position={[0, 0, -0.5]}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhysicalMaterial
          color="#88ccff"
          metalness={0.4}
          roughness={0.05}
          emissive="#3366aa"
          emissiveIntensity={0.25}
          clearcoat={1}
          clearcoatRoughness={0.02}
          iridescence={0.9}
          iridescenceIOR={1.4}
          iridescenceThicknessRange={[100, 500]}
          transparent
          opacity={opacity * 0.75}
        />
      </mesh>

      <mesh ref={secondRef} geometry={geometry2}>
        <meshPhysicalMaterial
          color="#cc88ff"
          metalness={0.3}
          roughness={0.08}
          emissive="#663399"
          emissiveIntensity={0.2}
          clearcoat={1}
          iridescence={0.7}
          transparent
          opacity={opacity * 0.5}
        />
      </mesh>

      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[trailData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[trailData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          vertexColors
          transparent
          opacity={opacity * 0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
