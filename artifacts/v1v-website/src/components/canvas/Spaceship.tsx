import { useRef, useMemo, useEffect } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useFBX } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  scrollProgress: number;
}

export function Spaceship({ scrollProgress }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Points>(null);
  const smoothScroll = useRef(0);
  const prevPos = useRef(new THREE.Vector3(0, 2, 4));
  const velocity = useRef(new THREE.Vector3());
  const { camera } = useThree();

  const basePath = import.meta.env.BASE_URL;

  const fbx = useFBX(`${basePath}models/Fighter_01.fbx`);

  const [bodyBase, bodyNormal, bodyMetallic, bodyRoughness] = useLoader(THREE.TextureLoader, [
    `${basePath}models/Fighter_01_Body_BaseColor.png`,
    `${basePath}models/Fighter_01_Body_Normal.png`,
    `${basePath}models/Fighter_01_Body_Metallic.png`,
    `${basePath}models/Fighter_01_Body_Roughness.png`,
  ]);
  const [frontBase, frontNormal, frontEmissive, frontMetallic, frontRoughness] = useLoader(THREE.TextureLoader, [
    `${basePath}models/Fighter_01_Front_BaseColor.png`,
    `${basePath}models/Fighter_01_Front_Normal.png`,
    `${basePath}models/Fighter_01_Front_Emissive.png`,
    `${basePath}models/Fighter_01_Front_Metallic.png`,
    `${basePath}models/Fighter_01_Front_Roughness.png`,
  ]);
  const [rearBase, rearNormal, rearEmissive, rearMetallic, rearRoughness] = useLoader(THREE.TextureLoader, [
    `${basePath}models/Fighter_01_Rear_BaseColor.png`,
    `${basePath}models/Fighter_01_Rear_Normal.png`,
    `${basePath}models/Fighter_01_Rear_Emissive.png`,
    `${basePath}models/Fighter_01_Rear_Metallic.png`,
    `${basePath}models/Fighter_01_Rear_Roughness.png`,
  ]);
  const [windowBase, windowNormal, windowMetallic, windowRoughness] = useLoader(THREE.TextureLoader, [
    `${basePath}models/Fighter_01_Windows_BaseColor.png`,
    `${basePath}models/Fighter_01_Windows_Normal.png`,
    `${basePath}models/Fighter_01_Windows_Metallic.png`,
    `${basePath}models/Fighter_01_Windows_Roughness.png`,
  ]);

  useEffect(() => {
    if (!fbx) return;
    fbx.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();
        let mat: THREE.MeshStandardMaterial;

        if (name.includes("front")) {
          mat = new THREE.MeshStandardMaterial({
            map: frontBase,
            normalMap: frontNormal,
            metalnessMap: frontMetallic,
            roughnessMap: frontRoughness,
            emissiveMap: frontEmissive,
            emissive: new THREE.Color("#33ccff"),
            emissiveIntensity: 2,
            metalness: 0.9,
            roughness: 0.2,
          });
        } else if (name.includes("rear")) {
          mat = new THREE.MeshStandardMaterial({
            map: rearBase,
            normalMap: rearNormal,
            metalnessMap: rearMetallic,
            roughnessMap: rearRoughness,
            emissiveMap: rearEmissive,
            emissive: new THREE.Color("#ff5533"),
            emissiveIntensity: 3,
            metalness: 0.9,
            roughness: 0.2,
          });
        } else if (name.includes("window")) {
          mat = new THREE.MeshStandardMaterial({
            map: windowBase,
            normalMap: windowNormal,
            metalnessMap: windowMetallic,
            roughnessMap: windowRoughness,
            emissive: new THREE.Color("#55aaff"),
            emissiveIntensity: 1.5,
            metalness: 1.0,
            roughness: 0.1,
            transparent: true,
            opacity: 0.9,
          });
        } else {
          mat = new THREE.MeshStandardMaterial({
            map: bodyBase,
            normalMap: bodyNormal,
            metalnessMap: bodyMetallic,
            roughnessMap: bodyRoughness,
            metalness: 0.85,
            roughness: 0.15,
            envMapIntensity: 1.5,
          });
        }
        mesh.material = mat;
        mesh.castShadow = true;
      }
    });
  }, [fbx, bodyBase, bodyNormal, bodyMetallic, bodyRoughness, frontBase, frontNormal, frontEmissive, frontMetallic, frontRoughness, rearBase, rearNormal, rearEmissive, rearMetallic, rearRoughness, windowBase, windowNormal, windowMetallic, windowRoughness]);

  const trailData = useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      const t = i / count;
      colors[i * 3] = 0.2 + t * 0.8;
      colors[i * 3 + 1] = 0.5 + t * 0.5;
      colors[i * 3 + 2] = 1.0;
      sizes[i] = (1 - t) * 0.15;
    }
    return { positions, colors, sizes, count };
  }, []);

  const trailPositions = useRef<THREE.Vector3[]>([]);

  const glowMap = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.3, "rgba(255,255,255,0.6)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    smoothScroll.current += (scrollProgress - smoothScroll.current) * 0.03;
    const p = smoothScroll.current;

    const camZ = camera.position.z;
    const camX = camera.position.x;
    const camY = camera.position.y;

    const shipOffsetX = Math.sin(t * 0.4 + p * 8) * 3 + Math.sin(t * 0.7) * 1.5;
    const shipOffsetY = Math.cos(t * 0.3 + p * 6) * 2 + Math.sin(t * 0.5) * 1;
    const shipZ = camZ - 8 - Math.sin(t * 0.2) * 3;

    const targetX = camX + shipOffsetX;
    const targetY = camY + shipOffsetY + 2;
    const targetZ = shipZ;

    const newPos = new THREE.Vector3(targetX, targetY, targetZ);
    const currentPos = groupRef.current.position;
    currentPos.lerp(newPos, 0.025);

    velocity.current.subVectors(currentPos, prevPos.current);
    prevPos.current.copy(currentPos);

    const moveDir = velocity.current.clone().normalize();
    if (velocity.current.length() > 0.001) {
      const targetQuat = new THREE.Quaternion();
      const lookDir = moveDir.clone();
      const up = new THREE.Vector3(0, 1, 0);

      const bankAngle = -velocity.current.x * 8;
      const pitchAngle = velocity.current.y * 5;

      const mat4 = new THREE.Matrix4();
      mat4.lookAt(new THREE.Vector3(0, 0, 0), lookDir, up);
      targetQuat.setFromRotationMatrix(mat4);

      const bankQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), bankAngle);
      const pitchQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitchAngle);
      targetQuat.multiply(bankQuat).multiply(pitchQuat);

      groupRef.current.quaternion.slerp(targetQuat, 0.03);
    }

    const isTextVisible = isNearTextSection(p);
    const targetScale = isTextVisible ? 0.0005 : 0.0015;
    const currentScale = groupRef.current.scale.x;
    const newScale = currentScale + (targetScale - currentScale) * 0.03;
    groupRef.current.scale.setScalar(newScale);

    trailPositions.current.unshift(currentPos.clone());
    if (trailPositions.current.length > trailData.count) {
      trailPositions.current.length = trailData.count;
    }

    if (trailRef.current) {
      const posAttr = trailRef.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < trailData.count; i++) {
        const tp = trailPositions.current[i] || currentPos;
        arr[i * 3] = tp.x;
        arr[i * 3 + 1] = tp.y;
        arr[i * 3 + 2] = tp.z;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <>
      <group ref={groupRef} scale={[0.0012, 0.0012, 0.0012]}>
        <primitive object={fbx} />
        <pointLight color="#33ccff" intensity={2} distance={8} />
        <pointLight color="#ff5533" intensity={1.5} distance={5} position={[0, 0, 50]} />
      </group>

      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[trailData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[trailData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          map={glowMap}
          vertexColors
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </>
  );
}

function isNearTextSection(p: number): boolean {
  const textRanges = [
    [0, 0.08],
    [0.06, 0.14],
    [0.10, 0.22],
    [0.14, 0.26],
    [0.18, 0.30],
    [0.60, 0.73],
    [0.72, 0.88],
    [0.85, 1.0],
  ];
  for (const [start, end] of textRanges) {
    if (p >= start && p <= end) return true;
  }
  return false;
}
