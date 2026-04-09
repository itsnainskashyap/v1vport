import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  progress: number;
  opacity: number;
}

export function CageTransition({ progress, opacity }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const cageBars = useMemo(() => {
    const bars: { start: THREE.Vector3; end: THREE.Vector3; color: string }[] = [];
    const count = 24;
    const radius = 2.0;
    const height = 3.0;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      bars.push({
        start: new THREE.Vector3(x, -height / 2, z),
        end: new THREE.Vector3(x, height / 2, z),
        color: i % 3 === 0 ? "#00f0ff" : i % 3 === 1 ? "#8b5cf6" : "#f0c040",
      });
    }

    for (let j = 0; j < 4; j++) {
      const y = -height / 2 + (j + 1) * (height / 5);
      for (let i = 0; i < count / 2; i++) {
        const angle1 = (i / (count / 2)) * Math.PI * 2;
        const angle2 = ((i + 1) / (count / 2)) * Math.PI * 2;
        bars.push({
          start: new THREE.Vector3(Math.cos(angle1) * radius, y, Math.sin(angle1) * radius),
          end: new THREE.Vector3(Math.cos(angle2) * radius, y, Math.sin(angle2) * radius),
          color: "#00f0ff",
        });
      }
    }

    return bars;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.05;
    const expandFactor = Math.sin(progress * Math.PI) * 0.3;
    groupRef.current.scale.setScalar(0.8 + expandFactor);
  });

  return (
    <group ref={groupRef}>
      {cageBars.map((bar, i) => {
        const dir = new THREE.Vector3().subVectors(bar.end, bar.start);
        const len = dir.length();
        const mid = new THREE.Vector3().addVectors(bar.start, bar.end).multiplyScalar(0.5);

        return (
          <mesh key={i} position={mid} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}>
            <cylinderGeometry args={[0.008, 0.008, len, 4]} />
            <meshBasicMaterial
              color={bar.color}
              transparent
              opacity={opacity * 0.4}
            />
          </mesh>
        );
      })}
      <pointLight position={[0, 0, 0]} intensity={0.6 * opacity} color="#8b5cf6" distance={8} />
    </group>
  );
}
