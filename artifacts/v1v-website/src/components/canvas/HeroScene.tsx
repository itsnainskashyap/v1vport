import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ParticleField } from "./ParticleField";
import { GlassTorusLogo } from "./GlassTorusLogo";
import { RibbonSculpture } from "./RibbonSculpture";

export function HeroScene() {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouse.current.x * 0.15,
        0.02
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mouse.current.y * 0.08,
        0.02
      );
    }
  });

  return (
    <group ref={groupRef}>
      <GlassTorusLogo />
      <RibbonSculpture />
      <ParticleField count={typeof window !== "undefined" && window.innerWidth < 768 ? 2000 : 6000} />
    </group>
  );
}
