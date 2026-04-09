import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  progress: number;
  opacity: number;
}

function createHexGeometry(outerR: number, innerR: number): THREE.BufferGeometry {
  const sides = 6;
  const vertices: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i < sides; i++) {
    const a1 = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 1) / sides) * Math.PI * 2 - Math.PI / 2;
    const base = vertices.length / 3;
    vertices.push(
      Math.cos(a1) * outerR, Math.sin(a1) * outerR, 0,
      Math.cos(a2) * outerR, Math.sin(a2) * outerR, 0,
      Math.cos(a1) * innerR, Math.sin(a1) * innerR, 0,
      Math.cos(a2) * innerR, Math.sin(a2) * innerR, 0
    );
    indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function HexTunnel({ progress, opacity }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const { hexGeo, cells } = useMemo(() => {
    const hexGeo = createHexGeometry(1.0, 0.88);
    const cells: { pos: THREE.Vector3; rot: number; scale: number; ring: number; cell: number }[] = [];
    const ringCount = 24;
    const cellsPerRing = 12;
    const tunnelRadius = 3.5;

    for (let r = 0; r < ringCount; r++) {
      const z = -r * 0.8;
      for (let c = 0; c < cellsPerRing; c++) {
        const angle = (c / cellsPerRing) * Math.PI * 2 + (r % 2) * (Math.PI / cellsPerRing);
        cells.push({
          pos: new THREE.Vector3(
            Math.cos(angle) * tunnelRadius,
            Math.sin(angle) * tunnelRadius,
            z
          ),
          rot: angle + Math.PI / 2,
          scale: 0.28 + Math.sin(r * 0.3 + c * 0.5) * 0.06,
          ring: r,
          cell: c,
        });
      }
    }
    return { hexGeo, cells };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.z = t * 0.02;

    const children = groupRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as THREE.Mesh;
      if (!child.isMesh) continue;
      const info = cells[i];
      if (!info) continue;
      const pulse = Math.sin(t * 1.2 + info.ring * 0.25 + info.cell * 0.6) * 0.03;
      child.scale.setScalar(info.scale + pulse);
      const mat = child.material as THREE.MeshBasicMaterial;
      mat.opacity = opacity * (0.08 + Math.sin(t * 1.5 + info.ring * 0.3) * 0.04);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -62]}>
      {cells.map((cell, i) => (
        <mesh
          key={i}
          geometry={hexGeo}
          position={cell.pos}
          rotation={[Math.PI / 2, 0, cell.rot]}
          scale={cell.scale}
        >
          <meshBasicMaterial
            color={
              cell.ring % 4 === 0 ? "#557788" :
              cell.ring % 4 === 1 ? "#665588" :
              cell.ring % 4 === 2 ? "#558866" :
              "#886655"
            }
            transparent
            opacity={opacity * 0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <pointLight position={[0, 0, -10]} intensity={0.6 * opacity} color="#5588aa" distance={25} />
    </group>
  );
}
