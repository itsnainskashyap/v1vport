import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { ParticleText } from "./ParticleText";
import { DNAHelix } from "./DNAHelix";
import { ParticleField } from "./ParticleField";

interface Props {
  scrollProgress: number;
  handPosition?: { x: number; y: number } | null;
}

function createCircleTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.6)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function NebulaClouds() {
  const ref = useRef<THREE.Points>(null);
  const circleMap = useMemo(() => createCircleTexture(), []);

  const data = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 120;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      basePositions[i3] = x;
      basePositions[i3 + 1] = y;
      basePositions[i3 + 2] = z;

      const t = Math.random();
      if (t < 0.3) {
        colors[i3] = 0.1; colors[i3 + 1] = 0.15; colors[i3 + 2] = 0.4;
      } else if (t < 0.6) {
        colors[i3] = 0.2; colors[i3 + 1] = 0.08; colors[i3 + 2] = 0.35;
      } else {
        colors[i3] = 0.15; colors[i3 + 1] = 0.05; colors[i3 + 2] = 0.2;
      }
    }

    return { positions, basePositions, colors, count };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < data.count; i++) {
      const i3 = i * 3;
      arr[i3] = data.basePositions[i3] + Math.sin(t * 0.03 + i) * 2;
      arr[i3 + 1] = data.basePositions[i3 + 1] + Math.cos(t * 0.02 + i * 0.5) * 1;
      arr[i3 + 2] = data.basePositions[i3 + 2];
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={3.0}
        map={circleMap}
        vertexColors
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
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
    return [
      { pos: [-4.0, 0.8, -38] as [number, number, number], rot: [0, 0.2, 0.02] as [number, number, number], scale: [5.0, 3.1, 1] as [number, number, number] },
      { pos: [4.0, -0.5, -44] as [number, number, number], rot: [0, -0.2, -0.01] as [number, number, number], scale: [4.8, 3.0, 1] as [number, number, number] },
      { pos: [-3.5, 0.3, -50] as [number, number, number], rot: [0, 0.15, -0.02] as [number, number, number], scale: [5.2, 3.2, 1] as [number, number, number] },
      { pos: [4.5, 1.0, -56] as [number, number, number], rot: [0, -0.22, 0.01] as [number, number, number], scale: [4.6, 2.9, 1] as [number, number, number] },
      { pos: [-3.0, -0.6, -62] as [number, number, number], rot: [0, 0.18, 0.02] as [number, number, number], scale: [5.0, 3.1, 1] as [number, number, number] },
    ];
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const children = groupRef.current.children;
    for (let i = 0; i < cards.length; i++) {
      if (!children[i]) continue;
      children[i].position.y = cards[i].pos[1] + Math.sin(t * 0.35 + i * 1.8) * 0.25;
      children[i].rotation.y = cards[i].rot[1] + Math.sin(t * 0.2 + i * 1.2) * 0.04;
    }
  });

  const getCardOpacity = (cardZ: number) => {
    const cameraZ = 8 + (8 - (-75)) * scrollProgress * -1;
    const dist = Math.abs(cameraZ - cardZ);
    if (dist > 25) return 0;
    if (dist > 18) return (25 - dist) / 7;
    return 1;
  };

  return (
    <group ref={groupRef}>
      {cards.map((card, i) => {
        const cardOpacity = getCardOpacity(card.pos[2]);
        return (
          <group key={i} position={card.pos} rotation={card.rot} visible={cardOpacity > 0.01}>
            <mesh>
              <planeGeometry args={[card.scale[0], card.scale[1]]} />
              <meshStandardMaterial
                map={textures[i]}
                transparent
                opacity={cardOpacity * 0.95}
                roughness={0.15}
                metalness={0.1}
                side={THREE.DoubleSide}
              />
            </mesh>

            <mesh position={[0, 0, -0.02]}>
              <planeGeometry args={[card.scale[0] + 0.2, card.scale[1] + 0.2]} />
              <meshBasicMaterial
                color="#55aaff"
                transparent
                opacity={cardOpacity * 0.06}
                side={THREE.DoubleSide}
              />
            </mesh>

            <pointLight position={[0, 0, 1.5]} intensity={0.5 * cardOpacity} color="#5599cc" distance={6} />
          </group>
        );
      })}
    </group>
  );
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
    const endZ = -75;
    const cameraZ = startZ + (endZ - startZ) * p;
    const cameraY = Math.sin(p * Math.PI * 0.5) * 2.0;
    const cameraX = Math.sin(p * Math.PI * 2) * 1.2;

    let parallaxX = mouse.current.x * 0.5;
    let parallaxY = mouse.current.y * 0.3;

    if (handPosition) {
      parallaxX = handPosition.x * 1.5;
      parallaxY = handPosition.y * 1.0;
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraX + parallaxX, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraY + parallaxY, 0.03);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, cameraZ, 0.04);

    cameraTarget.current.set(
      camera.position.x * 0.2,
      camera.position.y * 0.2,
      camera.position.z - 12
    );
    camera.lookAt(cameraTarget.current);
  });

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const heroOpacity = Math.max(0, 1 - scrollProgress * 4);
  const dnaOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.2) * 5)) * Math.max(0, 1 - (scrollProgress - 0.55) * 4);
  const contactOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.82) * 5));

  return (
    <>
      <group visible={heroOpacity > 0.01}>
        <ParticleText
          text="V1V"
          opacity={heroOpacity}
          position={[0, 0.5, 0]}
          size={5.5}
          particleCount={isMobile ? 5000 : 15000}
          color1="#55aaff"
          color2="#aa55ff"
          color3="#ff55aa"
          fontSize={220}
        />
        <ParticleText
          text="CREATIVE DIGITAL EXPERIENCES"
          opacity={heroOpacity * 0.7}
          position={[0, -1.3, 0]}
          size={6}
          particleCount={isMobile ? 3000 : 8000}
          color1="#4488cc"
          color2="#8855cc"
          color3="#cc5588"
          fontSize={32}
        />
      </group>

      <group visible={dnaOpacity > 0.01}>
        <DNAHelix scrollProgress={scrollProgress} opacity={dnaOpacity} />
      </group>

      <ProjectCards scrollProgress={scrollProgress} />

      <group visible={contactOpacity > 0.01}>
        <ParticleText
          text="GET IN TOUCH"
          opacity={contactOpacity * 0.6}
          position={[0, 0.5, -70]}
          size={5}
          particleCount={isMobile ? 2000 : 6000}
          color1="#55aaff"
          color2="#55ffaa"
          color3="#ffaa55"
          fontSize={50}
        />
      </group>

      <NebulaClouds />

      <ParticleField count={isMobile ? 5000 : 18000} scrollProgress={scrollProgress} />
    </>
  );
}
