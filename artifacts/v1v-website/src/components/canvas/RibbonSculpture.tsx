import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  opacity: number;
}

export function RibbonSculpture({ opacity }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 200;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const scale = 2.0;
      const x = Math.sin(t) * scale;
      const y = Math.sin(t * 2) * scale * 0.6;
      const z = Math.cos(t) * scale * 0.3;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points, true);
    return new THREE.TubeGeometry(curve, 200, 0.025, 12, true);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.12) * 0.05;
      (meshRef.current.material as THREE.MeshPhysicalMaterial).opacity = opacity * 0.85;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshPhysicalMaterial
        color="#00d4ff"
        metalness={0.4}
        roughness={0.1}
        emissive="#00a8cc"
        emissiveIntensity={0.4}
        clearcoat={1}
        clearcoatRoughness={0.05}
        transparent
        opacity={opacity * 0.85}
      />
    </mesh>
  );
}
