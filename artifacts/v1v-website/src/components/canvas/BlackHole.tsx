import { useRef, useMemo, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useFBX } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  scrollProgress: number;
  opacity: number;
  onCardClick?: (index: number) => void;
}

export function BlackHole({ scrollProgress, opacity, onCardClick }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const cardRefs = useRef<(THREE.Group | null)[]>([]);
  const smoothScroll = useRef(0);

  const basePath = import.meta.env.BASE_URL;

  const fbx = useFBX(`${basePath}models/blackhole.fbx`);

  const [ringColor, ringBump, light1, light2, light3, planetTex] = useLoader(THREE.TextureLoader, [
    `${basePath}models/textures/blackholering_1_color.png`,
    `${basePath}models/textures/blackholering_2_bump.png`,
    `${basePath}models/textures/blackholelight_1_color.png`,
    `${basePath}models/textures/blackholelight_2_color.png`,
    `${basePath}models/textures/blackholelight_3_color.png`,
    `${basePath}models/textures/planet.png`,
  ]);

  const projectTextures = [
    "projects/prometheus.png",
    "projects/echo.png",
    "projects/patronus.png",
    "projects/maison-noir.png",
    "projects/stellar.png",
  ];
  const projTextures = useLoader(
    THREE.TextureLoader,
    projectTextures.map((p) => basePath + p)
  );

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (!fbx) return;
    fbx.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        if (name.includes("ring") || name.includes("disc") || name.includes("accretion")) {
          mesh.material = new THREE.MeshStandardMaterial({
            map: ringColor,
            bumpMap: ringBump,
            bumpScale: 0.3,
            emissive: new THREE.Color("#ff6622"),
            emissiveMap: ringColor,
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
          });
        } else if (name.includes("light") || name.includes("glow") || name.includes("jet")) {
          const texMap = name.includes("2") ? light2 : name.includes("3") ? light3 : light1;
          mesh.material = new THREE.MeshBasicMaterial({
            map: texMap,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
        } else if (name.includes("planet") || name.includes("sphere") || name.includes("core") || name.includes("hole")) {
          mesh.material = new THREE.MeshStandardMaterial({
            map: planetTex,
            color: new THREE.Color("#050510"),
            emissive: new THREE.Color("#110022"),
            emissiveIntensity: 0.5,
            metalness: 0.95,
            roughness: 0.1,
          });
        } else {
          mesh.material = new THREE.MeshStandardMaterial({
            map: ringColor,
            emissive: new THREE.Color("#ff4400"),
            emissiveMap: ringColor,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide,
          });
        }
      }
    });
  }, [fbx, ringColor, ringBump, light1, light2, light3, planetTex]);

  const cardOrbitRadius = isMobile ? 6 : 8;
  const cardSize = isMobile ? 2.8 : 4.0;
  const cardHeight = cardSize * 0.62;

  const projectLabels = ["PROMETHEUS", "ECHO", "PATRONUS", "MAISON NOIR", "STELLAR"];

  useFrame(() => {
    if (!groupRef.current) return;

    smoothScroll.current += (scrollProgress - smoothScroll.current) * 0.05;
    const localProgress = Math.max(0, Math.min(1, (smoothScroll.current - 0.28) / 0.3));

    const bhScale = isMobile ? 0.012 : 0.018;
    groupRef.current.scale.setScalar(bhScale * opacity);

    groupRef.current.rotation.y = localProgress * Math.PI * 2.5;
    groupRef.current.rotation.x = Math.sin(localProgress * Math.PI) * 0.15;

    const activeIndex = Math.min(4, Math.floor(localProgress * 5));
    const activeSubProgress = (localProgress * 5) - activeIndex;

    for (let i = 0; i < 5; i++) {
      const ref = cardRefs.current[i];
      if (!ref) continue;

      const baseAngle = (i / 5) * Math.PI * 2;
      const cardAngle = baseAngle - groupRef.current.rotation.y;

      const isActive = i === activeIndex;
      const wasActive = i === activeIndex - 1 && activeSubProgress < 0.3;

      let targetScale = 0.6;
      let targetOpacity = opacity * 0.4;
      let orbitR = cardOrbitRadius;

      if (isActive) {
        const reveal = Math.min(1, activeSubProgress * 3);
        targetScale = 0.6 + reveal * 0.5;
        targetOpacity = opacity * (0.4 + reveal * 0.55);
        orbitR = cardOrbitRadius - reveal * 1.5;
      } else if (wasActive) {
        const fade = activeSubProgress / 0.3;
        targetScale = 1.1 - fade * 0.5;
        targetOpacity = opacity * (0.95 - fade * 0.55);
      }

      ref.position.x = Math.cos(cardAngle) * orbitR;
      ref.position.y = Math.sin(cardAngle) * 0.3 + (isActive ? 0.5 : 0);
      ref.position.z = Math.sin(cardAngle) * orbitR;

      ref.rotation.y = -cardAngle + Math.PI / 2;

      const currentScale = ref.scale.x;
      const newScale = currentScale + (targetScale - currentScale) * 0.08;
      ref.scale.setScalar(newScale);

      ref.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat.opacity !== undefined) {
            mat.opacity += (targetOpacity - mat.opacity) * 0.08;
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -35]}>
      <primitive object={fbx} />

      {projTextures.map((tex, i) => (
        <group
          key={i}
          ref={(el) => { cardRefs.current[i] = el; }}
          onClick={() => onCardClick?.(i)}
          scale={[0.6, 0.6, 0.6]}
        >
          <mesh>
            <planeGeometry args={[cardSize, cardHeight]} />
            <meshStandardMaterial
              map={tex}
              transparent
              opacity={opacity * 0.9}
              roughness={0.05}
              metalness={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>

          <mesh position={[0, 0, -0.03]}>
            <planeGeometry args={[cardSize + 0.2, cardHeight + 0.2]} />
            <meshBasicMaterial
              color="#ff6622"
              transparent
              opacity={opacity * 0.08}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          <mesh position={[0, -cardHeight / 2 - 0.25, 0]}>
            <planeGeometry args={[cardSize * 0.7, 0.01]} />
            <meshBasicMaterial
              color="#ff8844"
              transparent
              opacity={opacity * 0.4}
            />
          </mesh>

          <pointLight intensity={0.5 * opacity} color="#ff6622" distance={5} />
        </group>
      ))}

      <pointLight position={[0, 0, 0]} intensity={4 * opacity} color="#ff4400" distance={25} />
      <pointLight position={[0, 3, 0]} intensity={2 * opacity} color="#ff8800" distance={15} />
      <pointLight position={[0, -3, 0]} intensity={1.5 * opacity} color="#ff2200" distance={12} />
      <pointLight position={[5, 0, 0]} intensity={1 * opacity} color="#ffaa44" distance={10} />
      <pointLight position={[-5, 0, 0]} intensity={1 * opacity} color="#ff6600" distance={10} />
    </group>
  );
}
