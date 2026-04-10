import { useRef, useEffect, useMemo, Suspense } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ParticleText } from "./ParticleText";
import { BlackHole } from "./BlackHole";
import { ParticleField } from "./ParticleField";
import { FloatingImages } from "./FloatingImages";
import { Spaceship } from "./Spaceship";

interface Props {
  scrollProgress: number;
  onCardClick?: (index: number) => void;
}

export function ScrollScene({ scrollProgress, onCardClick }: Props) {
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

  const textSections = useMemo(() => [
    { start: 0, end: 0.08, x: 0, y: 0.6, z: 0 },
    { start: 0.06, end: 0.14, x: 0, y: -1.2, z: 0 },
    { start: 0.10, end: 0.18, x: 0, y: 2, z: -10 },
    { start: 0.14, end: 0.22, x: 0, y: 0.5, z: -14 },
    { start: 0.18, end: 0.26, x: 0, y: 2, z: -18 },
    { start: 0.22, end: 0.30, x: 0, y: 0, z: -22 },
    { start: 0.60, end: 0.68, x: 0, y: 1.5, z: -55 },
    { start: 0.65, end: 0.73, x: 0, y: 0, z: -59 },
    { start: 0.72, end: 0.80, x: 0, y: 1, z: -65 },
    { start: 0.80, end: 0.88, x: 0, y: 0, z: -70 },
    { start: 0.85, end: 1.0, x: 0, y: 0.5, z: -75 },
  ], []);

  useFrame(() => {
    smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, scrollProgress, 0.04);
    const p = smoothProgress.current;

    const startZ = 8;
    const endZ = -80;
    const cameraZ = startZ + (endZ - startZ) * p;

    let cameraX = Math.sin(p * Math.PI * 4) * 1.5;
    let cameraY = Math.sin(p * Math.PI * 2.5) * 0.8;

    let textInfluence = 0;
    let targetTextX = 0;
    let targetTextY = 0;

    for (const section of textSections) {
      if (p >= section.start && p <= section.end) {
        const mid = (section.start + section.end) / 2;
        const range = (section.end - section.start) / 2;
        const dist = Math.abs(p - mid);
        const influence = Math.max(0, 1 - dist / range);
        if (influence > textInfluence) {
          textInfluence = influence;
          targetTextX = section.x;
          targetTextY = section.y;
        }
      }
    }

    cameraX = THREE.MathUtils.lerp(cameraX, targetTextX, textInfluence * 0.85);
    cameraY = THREE.MathUtils.lerp(cameraY, targetTextY, textInfluence * 0.6);

    const parallaxX = mouse.current.x * 0.4;
    const parallaxY = mouse.current.y * 0.25;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraX + parallaxX, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraY + parallaxY, 0.04);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, cameraZ, 0.04);

    const lookAhead = 12;
    cameraTarget.current.set(
      cameraX * 0.2,
      cameraY * 0.2,
      camera.position.z - lookAhead
    );
    camera.lookAt(cameraTarget.current);
  });

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isTablet = typeof window !== "undefined" && window.innerWidth >= 768 && window.innerWidth < 1024;

  const heroCount = isMobile ? 8000 : isTablet ? 12000 : 20000;
  const taglineCount = isMobile ? 4000 : isTablet ? 6000 : 12000;
  const smallTextCount = isMobile ? 3000 : isTablet ? 5000 : 8000;

  const opText = (fadeIn: number, peak: number, fadeOut: number) => {
    if (scrollProgress < fadeIn) return 0;
    if (scrollProgress < peak) return Math.min(1, (scrollProgress - fadeIn) / (peak - fadeIn));
    if (scrollProgress < fadeOut) return 1;
    return Math.max(0, 1 - (scrollProgress - fadeOut) / 0.04);
  };

  const heroOpacity = Math.max(0, 1 - scrollProgress * 6);
  const heroScatter = Math.max(0, Math.min(1, (scrollProgress - 0.08) * 6));
  const taglineOpacity = opText(0.02, 0.05, 0.10);

  const text1Opacity = opText(0.10, 0.13, 0.17);
  const text2Opacity = opText(0.14, 0.17, 0.21);
  const text3Opacity = opText(0.18, 0.21, 0.25);
  const text4Opacity = opText(0.22, 0.25, 0.29);

  const dnaOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.28) * 4)) * Math.max(0, 1 - (scrollProgress - 0.58) * 4);

  const text5Opacity = opText(0.60, 0.63, 0.67);
  const text6Opacity = opText(0.65, 0.68, 0.72);
  const text7Opacity = opText(0.72, 0.75, 0.79);
  const text8Opacity = opText(0.80, 0.83, 0.87);
  const contactOpacity = opText(0.85, 0.88, 1.0);

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
      </group>

      <group visible={taglineOpacity > 0.01}>
        <ParticleText
          text="CREATIVE DIGITAL EXPERIENCES"
          opacity={taglineOpacity * 0.85}
          scatter={heroScatter * 0.8}
          position={[0, -1.2, 0]}
          size={isMobile ? 4 : isTablet ? 5 : 7}
          particleCount={taglineCount}
          color1="#4488cc"
          color2="#8855cc"
          color3="#cc5588"
          fontSize={isMobile ? 32 : 44}
        />
      </group>

      <group visible={text1Opacity > 0.01}>
        <ParticleText
          text="WE BUILD THE FUTURE"
          opacity={text1Opacity * 0.8}
          position={[0, 2, -10]}
          size={isMobile ? 3.5 : 5}
          particleCount={smallTextCount}
          color1="#55ccff"
          color2="#55ffcc"
          color3="#aaffee"
          fontSize={isMobile ? 34 : 48}
        />
      </group>

      <group visible={text2Opacity > 0.01}>
        <ParticleText
          text="DESIGN • CODE • MOTION"
          opacity={text2Opacity * 0.7}
          position={[0, 0.5, -14]}
          size={isMobile ? 3.5 : 4.5}
          particleCount={Math.floor(smallTextCount * 0.8)}
          color1="#cc88ff"
          color2="#ff88cc"
          color3="#ffaa88"
          fontSize={isMobile ? 28 : 38}
        />
      </group>

      <group visible={text3Opacity > 0.01}>
        <ParticleText
          text="INNOVATION AT EVERY PIXEL"
          opacity={text3Opacity * 0.75}
          position={[0, 2, -18]}
          size={isMobile ? 3.5 : 5}
          particleCount={smallTextCount}
          color1="#ffaa55"
          color2="#ff5577"
          color3="#aa55ff"
          fontSize={isMobile ? 28 : 40}
        />
      </group>

      <group visible={text4Opacity > 0.01}>
        <ParticleText
          text="CRAFTING DIGITAL WORLDS"
          opacity={text4Opacity * 0.7}
          position={[0, 0, -22]}
          size={isMobile ? 3.5 : 5}
          particleCount={smallTextCount}
          color1="#55ff88"
          color2="#88ffaa"
          color3="#aaddff"
          fontSize={isMobile ? 28 : 40}
        />
      </group>

      <Suspense fallback={null}>
        <group visible={dnaOpacity > 0.01}>
          <BlackHole scrollProgress={scrollProgress} opacity={dnaOpacity} onCardClick={onCardClick} />
        </group>
      </Suspense>

      <group visible={text5Opacity > 0.01}>
        <ParticleText
          text="BRANDING • WEB • APP • 3D"
          opacity={text5Opacity * 0.7}
          position={[0, 1.5, -55]}
          size={isMobile ? 4 : 6}
          particleCount={smallTextCount}
          color1="#ffaa55"
          color2="#ff5577"
          color3="#aa55ff"
          fontSize={isMobile ? 26 : 36}
        />
      </group>

      <group visible={text6Opacity > 0.01}>
        <ParticleText
          text="FROM CONCEPT TO REALITY"
          opacity={text6Opacity * 0.7}
          position={[0, 0, -59]}
          size={isMobile ? 3.5 : 5}
          particleCount={smallTextCount}
          color1="#55aaff"
          color2="#55ffaa"
          color3="#ffaa55"
          fontSize={isMobile ? 28 : 40}
        />
      </group>

      <group visible={text7Opacity > 0.01}>
        <ParticleText
          text="IMMERSIVE EXPERIENCES"
          opacity={text7Opacity * 0.65}
          position={[0, 1, -65]}
          size={isMobile ? 4 : 6}
          particleCount={smallTextCount}
          color1="#ff88aa"
          color2="#aa88ff"
          color3="#88ffaa"
          fontSize={isMobile ? 30 : 42}
        />
      </group>

      <group visible={text8Opacity > 0.01}>
        <ParticleText
          text="AWARD WINNING STUDIO"
          opacity={text8Opacity * 0.65}
          position={[0, 0, -70]}
          size={isMobile ? 3.5 : 5}
          particleCount={smallTextCount}
          color1="#ffcc55"
          color2="#ff7755"
          color3="#cc55ff"
          fontSize={isMobile ? 28 : 40}
        />
      </group>

      <group visible={contactOpacity > 0.01}>
        <ParticleText
          text="GET IN TOUCH"
          opacity={contactOpacity * 0.75}
          position={[0, 0.5, -75]}
          size={isMobile ? 3.5 : 5.5}
          particleCount={smallTextCount}
          color1="#55aaff"
          color2="#55ffaa"
          color3="#ffaa55"
          fontSize={isMobile ? 40 : 58}
        />
      </group>

      <FloatingImages scrollProgress={scrollProgress} />

      <Suspense fallback={null}>
        <Spaceship scrollProgress={scrollProgress} />
      </Suspense>

      <ParticleField count={isMobile ? 6000 : isTablet ? 12000 : 22000} scrollProgress={scrollProgress} />
    </>
  );
}
