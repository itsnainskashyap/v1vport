import { useRef } from "react";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useGetProjects } from "@workspace/api-client-react";

interface Props {
  scrollProgress: number;
  onCardClick?: (index: number) => void;
}

const PROJECT_IMAGES = [
  "projects/prometheus.png",
  "projects/echo.png",
  "projects/patronus.png",
  "projects/maison-noir.png",
  "projects/stellar.png",
];

const CARD_CONFIGS = [
  { x: -5.0, y: 0.4,  z: -22, rotY:  0.28, rotX: -0.04 },
  { x:  5.0, y: -0.2, z: -26, rotY: -0.28, rotX:  0.04 },
  { x: -4.5, y:  0.6, z: -30, rotY:  0.22, rotX: -0.03 },
  { x:  5.0, y: -0.4, z: -34, rotY: -0.24, rotX:  0.05 },
  { x:  0.0, y:  0.3, z: -38, rotY:  0.06, rotX: -0.02 },
];

const CARD_W = 5.0;
const CARD_H = 3.1;

function ProjectCard({
  position,
  rotY,
  rotX,
  texture,
  title,
  category,
  index,
  visible,
  opacity,
  onCardClick,
}: {
  position: [number, number, number];
  rotY: number;
  rotX: number;
  texture: THREE.Texture;
  title: string;
  category: string;
  index: number;
  visible: boolean;
  opacity: number;
  onCardClick?: (i: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.4 + index * 1.3) * 0.12;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position} rotation={[rotX, rotY, 0]}>
      <mesh
        onClick={() => onCardClick?.(index)}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      >
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={opacity * 0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[CARD_W + 0.28, CARD_H + 0.28]} />
        <meshBasicMaterial
          color="#55aaff"
          transparent
          opacity={opacity * 0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, -0.08]}>
        <planeGeometry args={[CARD_W + 0.6, CARD_H + 0.6]} />
        <meshBasicMaterial
          color="#aa55ff"
          transparent
          opacity={opacity * 0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight intensity={0.9 * opacity} color="#55aaff" distance={14} />

      {opacity > 0.3 && (
        <Html
          position={[0, -CARD_H / 2 - 0.42, 0]}
          center
          zIndexRange={[0, 0]}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "7px",
              pointerEvents: "auto",
              whiteSpace: "nowrap",
              opacity,
            }}
          >
            <div
              style={{
                color: "rgba(255,255,255,0.9)",
                fontFamily: "monospace",
                fontSize: "11px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                textShadow: "0 0 14px rgba(85,170,255,1), 0 0 30px rgba(85,170,255,0.4)",
              }}
            >
              {title}
            </div>
            <div
              style={{
                color: "rgba(170,170,255,0.5)",
                fontFamily: "monospace",
                fontSize: "8px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              {category}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onCardClick?.(index); }}
              style={{
                marginTop: "2px",
                padding: "5px 18px",
                background: "rgba(85,170,255,0.12)",
                border: "1px solid rgba(85,170,255,0.35)",
                borderRadius: "100px",
                color: "rgba(85,170,255,0.95)",
                fontFamily: "monospace",
                fontSize: "8px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = "rgba(85,170,255,0.28)";
                (e.target as HTMLButtonElement).style.color = "white";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = "rgba(85,170,255,0.12)";
                (e.target as HTMLButtonElement).style.color = "rgba(85,170,255,0.95)";
              }}
            >
              DETAILS
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}

export function ProjectCards3D({ scrollProgress, onCardClick }: Props) {
  const basePath = import.meta.env.BASE_URL;
  const { data: projects } = useGetProjects();
  const { camera } = useThree();
  const textures = useLoader(
    THREE.TextureLoader,
    PROJECT_IMAGES.map((p) => basePath + p)
  );

  const projectList = projects || [];

  return (
    <group>
      {CARD_CONFIGS.map((cfg, i) => {
        const proj = projectList[i];
        if (!proj) return null;

        const dist = Math.abs(camera.position.z - cfg.z);
        const fadeStart = 25;
        const fadeEnd = 18;
        const cardOpacity = dist > fadeStart ? 0 : dist < fadeEnd ? 1 : (fadeStart - dist) / (fadeStart - fadeEnd);
        const isVisible = cardOpacity > 0.01;

        return (
          <ProjectCard
            key={i}
            position={[cfg.x, cfg.y, cfg.z]}
            rotY={cfg.rotY}
            rotX={cfg.rotX}
            texture={textures[i]}
            title={proj.title}
            category={proj.category}
            index={i}
            visible={isVisible}
            opacity={cardOpacity}
            onCardClick={onCardClick}
          />
        );
      })}
    </group>
  );
}
