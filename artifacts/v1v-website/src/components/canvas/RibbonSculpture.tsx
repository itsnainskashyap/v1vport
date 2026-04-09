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
    const segments = 300;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const scale = 2.8;
      const x = Math.sin(t) * scale * 0.4;
      const y = Math.sin(t * 2) * scale * 0.8;
      const z = Math.cos(t) * scale * 0.25;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points, true);
    return new THREE.TubeGeometry(curve, 300, 0.018, 8, true);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.rotation.y = t * 0.06;
      meshRef.current.rotation.z = Math.sin(t * 0.08) * 0.03;
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = opacity * 0.7;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 0, -0.5]}>
      <meshPhysicalMaterial
        color="#aaccee"
        metalness={0.3}
        roughness={0.08}
        emissive="#334466"
        emissiveIntensity={0.2}
        clearcoat={1}
        clearcoatRoughness={0.03}
        iridescence={0.8}
        iridescenceIOR={1.4}
        iridescenceThicknessRange={[100, 400]}
        transparent
        opacity={opacity * 0.7}
      />
    </mesh>
  );
}
