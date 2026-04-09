import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ParticleText } from "./ParticleText";
import { DNAHelix } from "./DNAHelix";
import { ParticleField } from "./ParticleField";
import { FloatingShapes } from "./FloatingShapes";

interface Props {
  scrollProgress: number;
  handPosition?: { x: number; y: number } | null;
}

export function ScrollScene({ scrollProgress, handPosition }: Props) {
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
    const endZ = -80;
    const cameraZ = startZ + (endZ - startZ) * p;

    const cameraX = Math.sin(p * Math.PI * 3) * 2.5 + Math.sin(p * Math.PI * 7) * 0.8;
    const cameraY = Math.sin(p * Math.PI * 1.5) * 1.8 + Math.cos(p * Math.PI * 4) * 0.5;

    let parallaxX = mouse.current.x * 0.6;
    let parallaxY = mouse.current.y * 0.35;

    if (handPosition) {
      parallaxX = handPosition.x * 1.8;
      parallaxY = handPosition.y * 1.2;
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraX + parallaxX, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraY + parallaxY, 0.03);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, cameraZ, 0.04);

    const lookAhead = 14;
    const lookX = Math.sin((p + 0.02) * Math.PI * 3) * 1.5;
    const lookY = Math.sin((p + 0.02) * Math.PI * 1.5) * 0.8;
    cameraTarget.current.set(
      lookX * 0.3,
      lookY * 0.3,
      camera.position.z - lookAhead
    );
    camera.lookAt(cameraTarget.current);
  });

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isTablet = typeof window !== "undefined" && window.innerWidth >= 768 && window.innerWidth < 1024;

  const heroOpacity = Math.max(0, 1 - scrollProgress * 4);
  const heroScatter = Math.max(0, Math.min(1, (scrollProgress - 0.12) * 6));
  const dnaOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.15) * 4)) * Math.max(0, 1 - (scrollProgress - 0.75) * 4);
  const aboutOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.08) * 8)) * Math.max(0, 1 - (scrollProgress - 0.18) * 6);
  const serviceOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.70) * 6)) * Math.max(0, 1 - (scrollProgress - 0.80) * 5);
  const contactOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.82) * 5));

  const heroCount = isMobile ? 6000 : isTablet ? 10000 : 18000;
  const taglineCount = isMobile ? 3000 : isTablet ? 5000 : 10000;
  const smallTextCount = isMobile ? 2000 : isTablet ? 3500 : 6000;

  return (
    <>
      <group visible={heroOpacity > 0.01}>
        <ParticleText
          text="V1V"
          opacity={heroOpacity}
          scatter={heroScatter}
          position={[0, 0.6, 0]}
          size={isMobile ? 3.5 : isTablet ? 4.5 : 6}
          particleCount={heroCount}
          color1="#55aaff"
          color2="#aa55ff"
          color3="#ff55aa"
          fontSize={280}
        />
        <ParticleText
          text="CREATIVE DIGITAL EXPERIENCES"
          opacity={heroOpacity * 0.75}
          scatter={heroScatter}
          position={[0, -1.2, 0]}
          size={isMobile ? 4 : isTablet ? 5 : 7}
          particleCount={taglineCount}
          color1="#4488cc"
          color2="#8855cc"
          color3="#cc5588"
          fontSize={isMobile ? 28 : 38}
        />
      </group>

      <group visible={aboutOpacity > 0.01}>
        <ParticleText
          text="WE BUILD THE FUTURE"
          opacity={aboutOpacity * 0.6}
          position={[isMobile ? 0 : -2, 2.5, -8]}
          size={isMobile ? 3 : 4.5}
          particleCount={smallTextCount}
          color1="#55ccff"
          color2="#55ffcc"
          color3="#aaffee"
          fontSize={isMobile ? 30 : 42}
        />
        <ParticleText
          text="DESIGN • CODE • MOTION"
          opacity={aboutOpacity * 0.5}
          position={[isMobile ? 0 : 2, 1.0, -12]}
          size={isMobile ? 3 : 4}
          particleCount={Math.floor(smallTextCount * 0.7)}
          color1="#cc88ff"
          color2="#ff88cc"
          color3="#ffaa88"
          fontSize={isMobile ? 24 : 32}
        />
      </group>

      <group visible={dnaOpacity > 0.01}>
        <DNAHelix scrollProgress={scrollProgress} opacity={dnaOpacity} />
      </group>

      <group visible={serviceOpacity > 0.01}>
        <ParticleText
          text="BRANDING • WEB • APP • 3D"
          opacity={serviceOpacity * 0.55}
          position={[0, 1, -65]}
          size={isMobile ? 3.5 : 5.5}
          particleCount={smallTextCount}
          color1="#ffaa55"
          color2="#ff5577"
          color3="#aa55ff"
          fontSize={isMobile ? 22 : 30}
        />
      </group>

      <group visible={contactOpacity > 0.01}>
        <ParticleText
          text="GET IN TOUCH"
          opacity={contactOpacity * 0.65}
          position={[0, 0.5, -75]}
          size={isMobile ? 3 : 5}
          particleCount={smallTextCount}
          color1="#55aaff"
          color2="#55ffaa"
          color3="#ffaa55"
          fontSize={isMobile ? 36 : 52}
        />
      </group>

      <FloatingShapes scrollProgress={scrollProgress} />

      <ParticleField count={isMobile ? 6000 : isTablet ? 12000 : 22000} scrollProgress={scrollProgress} />
    </>
  );
}
