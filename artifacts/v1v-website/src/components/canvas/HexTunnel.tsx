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
  const trailRef = useRef<THREE.Points>(null);

  const { hexGeo, cells, trailData } = useMemo(() => {
    const hexGeo = createHexGeometry(1.0, 0.85);
    const cells: { pos: THREE.Vector3; rot: number; scale: number; ring: number; cell: number }[] = [];
    const ringCount = 30;
    const cellsPerRing = 14;
    const tunnelRadius = 4.0;

    for (let r = 0; r < ringCount; r++) {
      const z = -r * 0.7;
      for (let c = 0; c < cellsPerRing; c++) {
        const angle = (c / cellsPerRing) * Math.PI * 2 + (r % 2) * (Math.PI / cellsPerRing);
        cells.push({
          pos: new THREE.Vector3(
            Math.cos(angle) * tunnelRadius,
            Math.sin(angle) * tunnelRadius,
            z
          ),
          rot: angle + Math.PI / 2,
          scale: 0.3 + Math.sin(r * 0.25 + c * 0.4) * 0.08,
          ring: r,
          cell: c,
        });
      }
    }

    const trailCount = 500;
    const trailPositions = new Float32Array(trailCount * 3);
    const trailBasePositions = new Float32Array(trailCount * 3);
    const trailColors = new Float32Array(trailCount * 3);

    for (let i = 0; i < trailCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const r = 1.0 + Math.random() * 3.5;
      const z = -Math.random() * 20;
      trailPositions[i3] = Math.cos(angle) * r;
      trailPositions[i3 + 1] = Math.sin(angle) * r;
      trailPositions[i3 + 2] = z;
      trailBasePositions[i3] = trailPositions[i3];
      trailBasePositions[i3 + 1] = trailPositions[i3 + 1];
      trailBasePositions[i3 + 2] = trailPositions[i3 + 2];

      const ct = Math.random();
      if (ct < 0.4) {
        trailColors[i3] = 0.3; trailColors[i3 + 1] = 0.6; trailColors[i3 + 2] = 0.9;
      } else if (ct < 0.7) {
        trailColors[i3] = 0.6; trailColors[i3 + 1] = 0.4; trailColors[i3 + 2] = 0.9;
      } else {
        trailColors[i3] = 0.3; trailColors[i3 + 1] = 0.8; trailColors[i3 + 2] = 0.7;
      }
    }

    return { hexGeo, cells, trailData: { positions: trailPositions, basePositions: trailBasePositions, colors: trailColors, count: trailCount } };
  }, []);

  const cellColors = useMemo(() => {
    const palette = ["#4488cc", "#7755bb", "#44aa88", "#bb6644", "#5599cc", "#9955aa"];
    return cells.map((cell) => palette[(cell.ring + cell.cell) % palette.length]);
  }, [cells]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.z = t * 0.025;

    const children = groupRef.current.children;
    for (let i = 0; i < cells.length; i++) {
      const child = children[i] as THREE.Mesh;
      if (!child || !child.isMesh) continue;
      const info = cells[i];
      if (!info) continue;
      const pulse = Math.sin(t * 1.5 + info.ring * 0.2 + info.cell * 0.5) * 0.04;
      child.scale.setScalar(info.scale + pulse);
      const mat = child.material as THREE.MeshPhysicalMaterial;
      mat.opacity = opacity * (0.12 + Math.sin(t * 1.8 + info.ring * 0.25) * 0.06);
      mat.emissiveIntensity = 0.2 + Math.sin(t * 2 + info.ring * 0.3) * 0.15;
    }

    if (trailRef.current) {
      const pos = trailRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < trailData.count; i++) {
        const i3 = i * 3;
        const speed = 0.3 + (i % 7) * 0.05;
        const angle = t * speed + i * 0.1;
        const baseR = Math.sqrt(trailData.basePositions[i3] ** 2 + trailData.basePositions[i3 + 1] ** 2);
        arr[i3] = Math.cos(angle) * baseR;
        arr[i3 + 1] = Math.sin(angle) * baseR;
        arr[i3 + 2] = trailData.basePositions[i3 + 2];
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, -62]}>
      <group ref={groupRef}>
        {cells.map((cell, i) => (
          <mesh
            key={i}
            geometry={hexGeo}
            position={cell.pos}
            rotation={[Math.PI / 2, 0, cell.rot]}
            scale={cell.scale}
          >
            <meshPhysicalMaterial
              color={cellColors[i]}
              emissive={cellColors[i]}
              emissiveIntensity={0.2}
              transparent
              opacity={opacity * 0.12}
              side={THREE.DoubleSide}
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>

      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[trailData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[trailData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={opacity * 0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <pointLight position={[0, 0, -5]} intensity={1.0 * opacity} color="#5588aa" distance={20} />
      <pointLight position={[0, 0, -15]} intensity={0.8 * opacity} color="#8855aa" distance={15} />
    </group>
  );
}
