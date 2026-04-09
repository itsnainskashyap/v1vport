import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
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

export function ScrollScene({ scrollProgress }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const progressRef = useRef(0);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useFrame(() => {
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, scrollProgress, 0.05);
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouse.current.x * 0.08,
        0.02
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mouse.current.y * 0.04,
        0.02
      );
    }
  });

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const heroOpacity = Math.max(0, 1 - scrollProgress * 5);
  const aboutOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.15) * 6)) * Math.max(0, 1 - (scrollProgress - 0.3) * 6);
  const workOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.3) * 5)) * Math.max(0, 1 - (scrollProgress - 0.6) * 5);
  const labOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.55) * 5)) * Math.max(0, 1 - (scrollProgress - 0.8) * 5);
  const contactOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.75) * 5));

  return (
    <group ref={groupRef}>
      <group visible={heroOpacity > 0.01}>
        <GlassTorusLogo opacity={heroOpacity} />
        <RibbonSculpture opacity={heroOpacity} />
      </group>
      <group visible={aboutOpacity > 0.01}>
        <CageTransition progress={scrollProgress} opacity={aboutOpacity} />
      </group>
      <group visible={workOpacity > 0.01}>
        <CrystalSpine progress={scrollProgress} opacity={workOpacity} />
      </group>
      <group visible={labOpacity > 0.01}>
        <HexTunnel progress={scrollProgress} opacity={labOpacity} />
      </group>
      <ParticleField count={isMobile ? 2000 : 8000} scrollProgress={scrollProgress} />
    </group>
  );
}
