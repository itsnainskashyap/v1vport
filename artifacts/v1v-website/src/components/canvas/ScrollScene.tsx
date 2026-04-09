import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
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
    const items: { pos: [number, number, number]; rot: [number, number, number]; scale: [number, number, number] }[] = [
      { pos: [-2.5, 0.5, -32], rot: [0, 0.25, 0], scale: [3.5, 2.2, 1] },
      { pos: [2.8, -0.3, -35], rot: [0, -0.2, 0.02], scale: [3.2, 2.0, 1] },
      { pos: [-1.5, 0.8, -38], rot: [0, 0.15, -0.03], scale: [3.8, 2.4, 1] },
      { pos: [3.0, 0.2, -41], rot: [0, -0.3, 0.01], scale: [3.0, 1.9, 1] },
      { pos: [-2.0, -0.5, -44], rot: [0, 0.2, 0.02], scale: [3.4, 2.1, 1] },
    ];
    return items;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      child.position.y = cards[i].pos[1] + Math.sin(t * 0.5 + i * 1.2) * 0.15;
      child.rotation.y = cards[i].rot[1] + Math.sin(t * 0.3 + i * 0.8) * 0.02;
    });
  });

  const workZoneOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.28) * 5)) * Math.max(0, 1 - (scrollProgress - 0.55) * 5);

  return (
    <group ref={groupRef} visible={workZoneOpacity > 0.01}>
      {cards.map((card, i) => (
        <mesh key={i} position={card.pos} rotation={card.rot}>
          <planeGeometry args={[card.scale[0], card.scale[1]]} />
          <meshStandardMaterial
            map={textures[i]}
            transparent
            opacity={workZoneOpacity * 0.9}
            roughness={0.3}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
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
    const cameraY = Math.sin(p * Math.PI * 0.5) * 1.5;
    const cameraX = Math.sin(p * Math.PI * 2) * 0.8;

    const parallaxX = mouse.current.x * 0.4;
    const parallaxY = mouse.current.y * 0.25;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraX + parallaxX, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraY + parallaxY, 0.03);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, cameraZ, 0.04);

    cameraTarget.current.set(
      camera.position.x * 0.3,
      camera.position.y * 0.3,
      camera.position.z - 10
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
        <GlassTorusLogo opacity={heroOpacity} />
        <RibbonSculpture opacity={heroOpacity} />
      </group>

      <group position={[0, 0, -18]} visible={aboutOpacity > 0.01}>
        <GlassTorusLogo opacity={aboutOpacity} />
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

      <ParticleField count={isMobile ? 3000 : 10000} scrollProgress={scrollProgress} />
    </>
  );
}
