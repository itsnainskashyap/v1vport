import { useRef, useMemo } from "react";
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
  { x: -6.5, y: 0.3,  z: -20, rotY:  0.35 },
  { x:  6.5, y: 0.0,  z: -28, rotY: -0.35 },
  { x: -6.0, y: 0.5,  z: -36, rotY:  0.30 },
  { x:  6.5, y: -0.2, z: -44, rotY: -0.30 },
  { x:  0.0, y: 0.2,  z: -52, rotY:  0.0  },
];

const ACCENT = [
  "#55aaff",
  "#ff6644",
  "#44ffaa",
  "#ff44aa",
  "#aa88ff",
];

const CARD_W = 4.8;
const CARD_H = 2.8;

function ProjectCard({
  position,
  rotY,
  texture,
  title,
  category,
  year,
  index,
  visible,
  opacity,
  onCardClick,
}: {
  position: [number, number, number];
  rotY: number;
  texture: THREE.Texture;
  title: string;
  category: string;
  year: string;
  index: number;
  visible: boolean;
  opacity: number;
  onCardClick?: (i: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const color = ACCENT[index % ACCENT.length];

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.3 + index * 1.8) * 0.1;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[CARD_W + 0.16, CARD_H + 0.16]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.35} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[CARD_W + 0.08, CARD_H + 0.08]} />
        <meshBasicMaterial color="#020408" transparent opacity={opacity * 0.95} side={THREE.DoubleSide} />
      </mesh>

      <mesh
        onClick={() => onCardClick?.(index)}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      >
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshBasicMaterial map={texture} transparent opacity={opacity} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0, -0.12]}>
        <planeGeometry args={[CARD_W + 1.5, CARD_H + 1.5]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight intensity={0.8 * opacity} color={color} distance={10} position={[0, 0, 1.5]} />

      {opacity > 0.4 && (
        <Html
          position={[0, -CARD_H / 2 - 0.5, 0]}
          center
          zIndexRange={[0, 0]}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "5px",
              pointerEvents: "auto",
              whiteSpace: "nowrap",
              opacity,
            }}
          >
            <div style={{
              color: "white",
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              textShadow: `0 0 12px ${color}`,
            }}>
              {title}
            </div>
            <div style={{
              color: "rgba(255,255,255,0.35)",
              fontFamily: "monospace",
              fontSize: "8px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}>
              {category} · {year}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onCardClick?.(index); }}
              style={{
                marginTop: "3px",
                padding: "5px 18px",
                background: "transparent",
                border: `1px solid ${color}66`,
                borderRadius: "100px",
                color,
                fontFamily: "monospace",
                fontSize: "7px",
                fontWeight: 600,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                const b = e.target as HTMLButtonElement;
                b.style.background = `${color}22`;
                b.style.borderColor = `${color}aa`;
                b.style.color = "white";
              }}
              onMouseLeave={(e) => {
                const b = e.target as HTMLButtonElement;
                b.style.background = "transparent";
                b.style.borderColor = `${color}66`;
                b.style.color = color;
              }}
            >
              VIEW PROJECT
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
        const fadeStart = 18;
        const fadeEnd = 10;
        const cardOpacity = dist > fadeStart ? 0 : dist < fadeEnd ? 1 : (fadeStart - dist) / (fadeStart - fadeEnd);
        const isVisible = cardOpacity > 0.01;

        return (
          <ProjectCard
            key={i}
            position={[cfg.x, cfg.y, cfg.z]}
            rotY={cfg.rotY}
            texture={textures[i]}
            title={proj.title}
            category={proj.category}
            year={proj.year || "2024"}
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
