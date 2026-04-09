import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { ParticleText } from "./ParticleText";
import { GlassTorusLogo } from "./GlassTorusLogo";
import { RibbonSculpture } from "./RibbonSculpture";
import { ParticleField } from "./ParticleField";
import { HexTunnel } from "./HexTunnel";
import { CrystalSpine } from "./CrystalSpine";
import { CageTransition } from "./CageTransition";

interface Props {
  scrollProgress: number;
}

function ProjectCards({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const frameRefs = useRef<THREE.Mesh[]>([]);

  const projectTextures = [
    "/projects/prometheus.png",
    "/projects/echo.png",
    "/projects/patronus.png",
    "/projects/maison-noir.png",
    "/projects/stellar.png",
  ];

  const textures = useLoader(
    THREE.TextureLoader,
    projectTextures.map((p) => import.meta.env.BASE_URL + p.replace(/^\//, ""))
  );

  const cards = useMemo(() => {
    const items: { pos: [number, number, number]; rot: [number, number, number]; scale: [number, number, number]; title: string }[] = [
      { pos: [-3.5, 1.0, -30], rot: [0, 0.2, 0.02], scale: [4.5, 2.8, 1], title: "PROMETHEUS" },
      { pos: [3.5, -0.5, -34], rot: [0, -0.2, -0.01], scale: [4.2, 2.6, 1], title: "E.C.H.O." },
      { pos: [-2.5, 0.5, -38], rot: [0, 0.15, -0.02], scale: [4.8, 3.0, 1], title: "PATRONUS" },
      { pos: [4.0, 1.2, -42], rot: [0, -0.25, 0.01], scale: [4.0, 2.5, 1], title: "MAISON NOIR" },
      { pos: [-3.0, -0.8, -46], rot: [0, 0.18, 0.02], scale: [4.5, 2.8, 1], title: "STELLAR" },
    ];
    return items;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      if (i >= cards.length) return;
      child.position.y = cards[i].pos[1] + Math.sin(t * 0.4 + i * 1.5) * 0.2;
      child.rotation.y = cards[i].rot[1] + Math.sin(t * 0.25 + i * 0.9) * 0.03;
    });
  });

  const workZoneOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.25) * 5)) * Math.max(0, 1 - (scrollProgress - 0.55) * 4);

  return (
    <group ref={groupRef} visible={workZoneOpacity > 0.01}>
      {cards.map((card, i) => (
        <group key={i} position={card.pos} rotation={card.rot}>
          <mesh>
            <planeGeometry args={[card.scale[0], card.scale[1]]} />
            <meshStandardMaterial
              map={textures[i]}
              transparent
              opacity={workZoneOpacity * 0.95}
              roughness={0.2}
              metalness={0.15}
              side={THREE.DoubleSide}
              emissive="#111111"
              emissiveIntensity={0.1}
            />
          </mesh>

          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[card.scale[0] + 0.15, card.scale[1] + 0.15]} />
            <meshBasicMaterial
              color="#4488cc"
              transparent
              opacity={workZoneOpacity * 0.08}
              side={THREE.DoubleSide}
            />
          </mesh>

          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[card.scale[0] + 0.4, card.scale[1] + 0.4]} />
            <meshBasicMaterial
              color="#223344"
              transparent
              opacity={workZoneOpacity * 0.04}
              side={THREE.DoubleSide}
            />
          </mesh>

          <pointLight
            position={[0, 0, 1]}
            intensity={0.4 * workZoneOpacity}
            color="#5599cc"
            distance={5}
          />
        </group>
      ))}
    </group>
  );
}

export function ScrollScene({ scrollProgress }: Props) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const smoothProgress = useRef(0);
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useFrame(() => {
    smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, scrollProgress, 0.04);
    const p = smoothProgress.current;

    const startZ = 8;
    const endZ = -75;
    const cameraZ = startZ + (endZ - startZ) * p;
    const cameraY = Math.sin(p * Math.PI * 0.5) * 2.0;
    const cameraX = Math.sin(p * Math.PI * 2) * 1.0;

    const parallaxX = mouse.current.x * 0.5;
    const parallaxY = mouse.current.y * 0.3;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraX + parallaxX, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraY + parallaxY, 0.03);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, cameraZ, 0.04);

    cameraTarget.current.set(
      camera.position.x * 0.25,
      camera.position.y * 0.25,
      camera.position.z - 12
    );
    camera.lookAt(cameraTarget.current);
  });

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const heroOpacity = Math.max(0, 1 - scrollProgress * 4);
  const aboutOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.12) * 6)) * Math.max(0, 1 - (scrollProgress - 0.28) * 5);
  const workOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.28) * 5)) * Math.max(0, 1 - (scrollProgress - 0.55) * 4);
  const cageOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.52) * 5)) * Math.max(0, 1 - (scrollProgress - 0.7) * 5);
  const labOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.65) * 5)) * Math.max(0, 1 - (scrollProgress - 0.85) * 5);

  return (
    <>
      <group visible={heroOpacity > 0.01}>
        <ParticleText
          text="V1V"
          opacity={heroOpacity}
          position={[0, 0.3, 0]}
          size={5}
          particleCount={isMobile ? 4000 : 10000}
          color1="#55aaff"
          color2="#aa66ff"
          color3="#ff66aa"
        />
        <GlassTorusLogo opacity={heroOpacity} />
        <RibbonSculpture opacity={heroOpacity * 0.7} />
      </group>

      <group position={[0, 0, -18]} visible={aboutOpacity > 0.01}>
        <ParticleText
          text="V1V"
          opacity={aboutOpacity * 0.5}
          position={[3, 0, 0]}
          size={3}
          particleCount={isMobile ? 2000 : 5000}
          color1="#4488cc"
          color2="#8855cc"
          color3="#cc5588"
        />
        <GlassTorusLogo opacity={aboutOpacity * 0.6} />
      </group>

      <group visible={workOpacity > 0.01}>
        <CrystalSpine progress={scrollProgress} opacity={workOpacity} />
      </group>

      <ProjectCards scrollProgress={scrollProgress} />

      <group visible={cageOpacity > 0.01}>
        <CageTransition progress={scrollProgress} opacity={cageOpacity} />
      </group>

      <group visible={labOpacity > 0.01}>
        <HexTunnel progress={scrollProgress} opacity={labOpacity} />
      </group>

      <ParticleField count={isMobile ? 5000 : 15000} scrollProgress={scrollProgress} />
    </>
  );
}
