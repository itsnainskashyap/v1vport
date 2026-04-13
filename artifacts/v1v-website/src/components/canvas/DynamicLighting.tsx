import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  scrollProgress: number;
}

const COLOR_ZONES = [
  { start: 0.0,  ambient: "#0a1525", point1: "#3388cc", point2: "#5533aa" },
  { start: 0.15, ambient: "#0a1020", point1: "#5555cc", point2: "#aa44cc" },
  { start: 0.35, ambient: "#100a18", point1: "#cc5588", point2: "#8844cc" },
  { start: 0.55, ambient: "#0a1510", point1: "#44aa88", point2: "#2288cc" },
  { start: 0.75, ambient: "#151008", point1: "#cc8844", point2: "#cc5533" },
];

export function DynamicLighting({ scrollProgress }: Props) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const point1Ref = useRef<THREE.PointLight>(null);
  const point2Ref = useRef<THREE.PointLight>(null);

  const precomputed = useMemo(() => {
    return COLOR_ZONES.map((z) => ({
      start: z.start,
      ambient: new THREE.Color(z.ambient),
      point1: new THREE.Color(z.point1),
      point2: new THREE.Color(z.point2),
    }));
  }, []);

  const tempA = useMemo(() => new THREE.Color(), []);
  const tempP1 = useMemo(() => new THREE.Color(), []);
  const tempP2 = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    let zoneIdx = precomputed.length - 1;
    for (let i = 0; i < precomputed.length - 1; i++) {
      if (scrollProgress < precomputed[i + 1].start) {
        zoneIdx = i;
        break;
      }
    }
    const zone = precomputed[zoneIdx];
    const next = precomputed[Math.min(zoneIdx + 1, precomputed.length - 1)];
    const range = next.start - zone.start || 1;
    const t = Math.max(0, Math.min(1, (scrollProgress - zone.start) / range));

    tempA.copy(zone.ambient).lerp(next.ambient, t);
    tempP1.copy(zone.point1).lerp(next.point1, t);
    tempP2.copy(zone.point2).lerp(next.point2, t);

    if (ambientRef.current) ambientRef.current.color.lerp(tempA, 0.03);
    if (point1Ref.current) point1Ref.current.color.lerp(tempP1, 0.03);
    if (point2Ref.current) point2Ref.current.color.lerp(tempP2, 0.03);
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.08} color="#0a1525" />
      <pointLight ref={point1Ref} position={[8, 5, 0]} intensity={0.5} color="#3388cc" distance={50} />
      <pointLight ref={point2Ref} position={[-8, -3, 0]} intensity={0.4} color="#5533aa" distance={50} />
    </>
  );
}
