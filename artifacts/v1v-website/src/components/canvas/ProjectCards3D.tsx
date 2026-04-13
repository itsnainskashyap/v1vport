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
  { x: -5.0, y: 0.4,  z: -22, rotY:  0.28, rotX: -0.04 },
  { x:  5.0, y: -0.2, z: -26, rotY: -0.28, rotX:  0.04 },
  { x: -4.5, y:  0.6, z: -30, rotY:  0.22, rotX: -0.03 },
  { x:  5.0, y: -0.4, z: -34, rotY: -0.24, rotX:  0.05 },
  { x:  0.0, y:  0.3, z: -38, rotY:  0.06, rotX: -0.02 },
];

const ACCENT_COLORS = [
  { primary: "#55aaff", secondary: "#3388dd", glow: "#2266bb" },
  { primary: "#ff6644", secondary: "#dd4422", glow: "#bb3311" },
  { primary: "#44ffaa", secondary: "#22dd88", glow: "#11bb66" },
  { primary: "#ff44aa", secondary: "#dd2288", glow: "#bb1166" },
  { primary: "#aa88ff", secondary: "#8866dd", glow: "#6644bb" },
];

const CARD_W = 5.0;
const CARD_H = 3.1;

function createHoloBorderMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#55aaff") },
      uOpacity: { value: 1.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        float borderX = step(0.96, vUv.x) + step(vUv.x, 0.04);
        float borderY = step(0.94, vUv.y) + step(vUv.y, 0.06);
        float border = clamp(borderX + borderY, 0.0, 1.0);
        float scan = sin(vUv.y * 80.0 - uTime * 3.0) * 0.5 + 0.5;
        float pulse = sin(uTime * 1.5) * 0.15 + 0.85;
        float cornerGlow = 0.0;
        vec2 corners[4];
        corners[0] = vec2(0.0, 0.0);
        corners[1] = vec2(1.0, 0.0);
        corners[2] = vec2(0.0, 1.0);
        corners[3] = vec2(1.0, 1.0);
        for (int i = 0; i < 4; i++) {
          float d = distance(vUv, corners[i]);
          cornerGlow += smoothstep(0.15, 0.0, d) * 0.6;
        }
        float alpha = border * (0.5 + scan * 0.3) * pulse + cornerGlow;
        alpha *= uOpacity;
        gl_FragColor = vec4(uColor, alpha * 0.7);
      }
    `,
  });
}

function createScanLineMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        float scanLine = sin(vUv.y * 120.0) * 0.5 + 0.5;
        scanLine = pow(scanLine, 8.0) * 0.06;
        float sweepY = fract(uTime * 0.15);
        float sweep = smoothstep(sweepY - 0.02, sweepY, vUv.y) * smoothstep(sweepY + 0.02, sweepY, vUv.y);
        sweep *= 0.25;
        float vignette = 1.0 - smoothstep(0.3, 0.5, distance(vUv, vec2(0.5)));
        float alpha = (scanLine + sweep) * vignette * uOpacity;
        gl_FragColor = vec4(0.4, 0.7, 1.0, alpha);
      }
    `,
  });
}

function CardParticles({ color, opacity }: { color: string; opacity: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 30;

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * (CARD_W + 1.2);
      pos[i * 3 + 1] = (Math.random() - 0.5) * (CARD_H + 1.2);
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
      spd[i] = 0.2 + Math.random() * 0.6;
    }
    return { positions: pos, speeds: spd };
  }, []);

  const glowTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 32; c.height = 32;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.4)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const posAttr = ref.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * 0.003;
      arr[i * 3] += Math.sin(t * speeds[i] + i) * 0.001;
      if (arr[i * 3 + 1] > (CARD_H + 1.2) / 2) {
        arr[i * 3 + 1] = -(CARD_H + 1.2) / 2;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        map={glowTex}
        color={color}
        transparent
        opacity={opacity * 0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function ProjectCard({
  position,
  rotY,
  rotX,
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
  rotX: number;
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
  const holoBorder = useMemo(() => createHoloBorderMaterial(), []);
  const scanOverlay = useMemo(() => createScanLineMaterial(), []);
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.35 + index * 1.5) * 0.15;
    groupRef.current.rotation.y = rotY + Math.sin(t * 0.2 + index) * 0.02;

    holoBorder.uniforms.uTime.value = t;
    holoBorder.uniforms.uColor.value.set(accent.primary);
    holoBorder.uniforms.uOpacity.value = opacity;

    scanOverlay.uniforms.uTime.value = t;
    scanOverlay.uniforms.uOpacity.value = opacity * 0.4;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position} rotation={[rotX, rotY, 0]}>
      <mesh position={[0, 0, -0.12]}>
        <planeGeometry args={[CARD_W + 0.3, CARD_H + 0.3]} />
        <meshBasicMaterial
          color="#000408"
          transparent
          opacity={opacity * 0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

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

      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <primitive object={scanOverlay} attach="material" />
      </mesh>

      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[CARD_W + 0.18, CARD_H + 0.18]} />
        <primitive object={holoBorder} attach="material" />
      </mesh>

      <mesh position={[0, 0, -0.15]}>
        <planeGeometry args={[CARD_W + 1.0, CARD_H + 1.0]} />
        <meshBasicMaterial
          color={accent.glow}
          transparent
          opacity={opacity * 0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, -0.2]}>
        <planeGeometry args={[CARD_W + 2.0, CARD_H + 2.0]} />
        <meshBasicMaterial
          color={accent.glow}
          transparent
          opacity={opacity * 0.025}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <CardParticles color={accent.primary} opacity={opacity} />

      <pointLight intensity={1.2 * opacity} color={accent.primary} distance={12} position={[0, 0, 2]} />
      <pointLight intensity={0.4 * opacity} color={accent.secondary} distance={8} position={[CARD_W / 2, -CARD_H / 2, 1]} />
      <pointLight intensity={0.4 * opacity} color={accent.secondary} distance={8} position={[-CARD_W / 2, CARD_H / 2, 1]} />

      {opacity > 0.3 && (
        <Html
          position={[0, -CARD_H / 2 - 0.55, 0]}
          center
          zIndexRange={[0, 0]}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              pointerEvents: "auto",
              whiteSpace: "nowrap",
              opacity,
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <div style={{
                width: "20px",
                height: "1px",
                background: `linear-gradient(90deg, transparent, ${accent.primary})`,
              }} />
              <div style={{
                color: "rgba(255,255,255,0.95)",
                fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                textShadow: `0 0 20px ${accent.primary}, 0 0 40px ${accent.glow}`,
              }}>
                {title}
              </div>
              <div style={{
                width: "20px",
                height: "1px",
                background: `linear-gradient(90deg, ${accent.primary}, transparent)`,
              }} />
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              <span style={{
                color: accent.primary,
                fontFamily: "monospace",
                fontSize: "8px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                opacity: 0.8,
              }}>
                {category}
              </span>
              <span style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: accent.primary,
                opacity: 0.4,
              }} />
              <span style={{
                color: "rgba(255,255,255,0.3)",
                fontFamily: "monospace",
                fontSize: "8px",
                letterSpacing: "0.15em",
              }}>
                {year}
              </span>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onCardClick?.(index); }}
              style={{
                marginTop: "4px",
                padding: "6px 22px",
                background: `linear-gradient(135deg, ${accent.glow}22, ${accent.primary}18)`,
                border: `1px solid ${accent.primary}55`,
                borderRadius: "100px",
                color: accent.primary,
                fontFamily: "monospace",
                fontSize: "8px",
                fontWeight: 600,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                cursor: "pointer",
                backdropFilter: "blur(12px)",
                transition: "all 0.3s ease",
                boxShadow: `0 0 15px ${accent.glow}20, inset 0 0 15px ${accent.glow}08`,
              }}
              onMouseEnter={(e) => {
                const btn = e.target as HTMLButtonElement;
                btn.style.background = `linear-gradient(135deg, ${accent.glow}44, ${accent.primary}33)`;
                btn.style.color = "white";
                btn.style.borderColor = `${accent.primary}88`;
                btn.style.boxShadow = `0 0 25px ${accent.glow}40, inset 0 0 20px ${accent.glow}15`;
              }}
              onMouseLeave={(e) => {
                const btn = e.target as HTMLButtonElement;
                btn.style.background = `linear-gradient(135deg, ${accent.glow}22, ${accent.primary}18)`;
                btn.style.color = accent.primary;
                btn.style.borderColor = `${accent.primary}55`;
                btn.style.boxShadow = `0 0 15px ${accent.glow}20, inset 0 0 15px ${accent.glow}08`;
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
