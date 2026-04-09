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
  const prevScroll = useRef(0);
  const prevPos = useRef(new THREE.Vector3(0, 2, 6));
  const velocity = useRef(new THREE.Vector3());
  const flyAwayPhase = useRef(0);
  const sideOffset = useRef(0);
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
            map: frontBase, normalMap: frontNormal, metalnessMap: frontMetallic,
            roughnessMap: frontRoughness, emissiveMap: frontEmissive,
            emissive: new THREE.Color("#33ccff"), emissiveIntensity: 2,
            metalness: 0.9, roughness: 0.2,
          });
        } else if (name.includes("rear")) {
          mat = new THREE.MeshStandardMaterial({
            map: rearBase, normalMap: rearNormal, metalnessMap: rearMetallic,
            roughnessMap: rearRoughness, emissiveMap: rearEmissive,
            emissive: new THREE.Color("#ff5533"), emissiveIntensity: 3,
            metalness: 0.9, roughness: 0.2,
          });
        } else if (name.includes("window")) {
          mat = new THREE.MeshStandardMaterial({
            map: windowBase, normalMap: windowNormal, metalnessMap: windowMetallic,
            roughnessMap: windowRoughness, emissive: new THREE.Color("#55aaff"),
            emissiveIntensity: 1.5, metalness: 1.0, roughness: 0.1,
            transparent: true, opacity: 0.9,
          });
        } else {
          mat = new THREE.MeshStandardMaterial({
            map: bodyBase, normalMap: bodyNormal, metalnessMap: bodyMetallic,
            roughnessMap: bodyRoughness, metalness: 0.85, roughness: 0.15,
            envMapIntensity: 1.5,
          });
        }
        mesh.material = mat;
        mesh.castShadow = true;
      }
    });
  }, [fbx, bodyBase, bodyNormal, bodyMetallic, bodyRoughness, frontBase, frontNormal, frontEmissive, frontMetallic, frontRoughness, rearBase, rearNormal, rearEmissive, rearMetallic, rearRoughness, windowBase, windowNormal, windowMetallic, windowRoughness]);

  const trailData = useMemo(() => {
    const count = 400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      colors[i * 3] = 0.2 + t * 0.8;
      colors[i * 3 + 1] = 0.4 + t * 0.6;
      colors[i * 3 + 2] = 1.0;
    }
    return { positions, colors, count };
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

    smoothScroll.current += (scrollProgress - smoothScroll.current) * 0.04;
    const p = smoothScroll.current;

    const scrollSpeed = p - prevScroll.current;
    prevScroll.current = p;

    const startZ = 8;
    const endZ = -80;
    const camPathZ = startZ + (endZ - startZ) * p;
    const camPathX = Math.sin(p * Math.PI * 4) * 1.5;
    const camPathY = Math.sin(p * Math.PI * 2.5) * 0.8;

    const isFlyingAway = p > 0.92;

    if (isFlyingAway) {
      flyAwayPhase.current += 0.015;
      const flyT = Math.min(flyAwayPhase.current, 1);
      const eased = flyT * flyT * flyT;

      const flyX = camPathX + eased * 30;
      const flyY = camPathY + eased * 20;
      const flyZ = camPathZ - eased * 60;

      const targetPos = new THREE.Vector3(flyX, flyY, flyZ);
      groupRef.current.position.lerp(targetPos, 0.05);

      const flyScale = 0.0015 * (1 + eased * 0.5);
      groupRef.current.scale.setScalar(flyScale);

      const flyRoll = eased * Math.PI * 1.5;
      const flyPitch = -eased * 0.5;
      const targetQuat = new THREE.Quaternion();
      const euler = new THREE.Euler(flyPitch, 0, flyRoll, "XYZ");
      targetQuat.setFromEuler(euler);

      const forwardQuat = new THREE.Quaternion();
      const lookDir = new THREE.Vector3(eased * 2, eased, -1).normalize();
      const mat4 = new THREE.Matrix4();
      mat4.lookAt(new THREE.Vector3(0, 0, 0), lookDir, new THREE.Vector3(0, 1, 0));
      forwardQuat.setFromRotationMatrix(mat4);
      forwardQuat.multiply(targetQuat);

      groupRef.current.quaternion.slerp(forwardQuat, 0.04);
    } else {
      flyAwayPhase.current = 0;

      const isContentVisible = isNearTextSection(p);
      const targetSideOffset = isContentVisible ? 5 : 0;
      const sideDir = Math.sin(p * 10) > 0 ? 1 : -1;
      sideOffset.current += (targetSideOffset * sideDir - sideOffset.current) * 0.02;

      const gentleWobbleX = Math.sin(t * 0.25) * 0.15;
      const gentleWobbleY = Math.cos(t * 0.2) * 0.1;

      const targetX = camPathX + sideOffset.current + gentleWobbleX;
      const targetY = camPathY + 1.2 + gentleWobbleY;
      const targetZ = camPathZ - 6;

      const targetPos = new THREE.Vector3(targetX, targetY, targetZ);
      groupRef.current.position.lerp(targetPos, 0.04);

      velocity.current.subVectors(groupRef.current.position, prevPos.current);
      prevPos.current.copy(groupRef.current.position);

      if (velocity.current.length() > 0.001) {
        const moveDir = velocity.current.clone().normalize();
        const targetQuat = new THREE.Quaternion();
        const up = new THREE.Vector3(0, 1, 0);
        const mat4 = new THREE.Matrix4();
        mat4.lookAt(new THREE.Vector3(0, 0, 0), moveDir, up);
        targetQuat.setFromRotationMatrix(mat4);

        const bankAngle = THREE.MathUtils.clamp(-velocity.current.x * 12, -Math.PI * 0.4, Math.PI * 0.4);
        const pitchAngle = THREE.MathUtils.clamp(velocity.current.y * 6, -Math.PI * 0.25, Math.PI * 0.25);

        const bankQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), bankAngle);
        const pitchQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitchAngle);
        targetQuat.multiply(bankQuat).multiply(pitchQuat);

        groupRef.current.quaternion.slerp(targetQuat, 0.04);
      }

      const targetScale = isContentVisible ? 0.0008 : 0.0015;
      const currentScale = groupRef.current.scale.x;
      const newScale = currentScale + (targetScale - currentScale) * 0.03;
      groupRef.current.scale.setScalar(newScale);
    }

    trailPositions.current.unshift(groupRef.current.position.clone());
    if (trailPositions.current.length > trailData.count) {
      trailPositions.current.length = trailData.count;
    }

    if (trailRef.current) {
      const posAttr = trailRef.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < trailData.count; i++) {
        const tp = trailPositions.current[i] || groupRef.current.position;
        arr[i * 3] = tp.x;
        arr[i * 3 + 1] = tp.y;
        arr[i * 3 + 2] = tp.z;
      }
      posAttr.needsUpdate = true;

      const trailMat = trailRef.current.material as THREE.PointsMaterial;
      const trailOpacity = isFlyingAway ? Math.max(0, 0.8 - flyAwayPhase.current * 0.8) : 0.6;
      trailMat.opacity = trailOpacity;
    }
  });

  return (
    <>
      <group ref={groupRef} scale={[0.0015, 0.0015, 0.0015]}>
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
          size={0.08}
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
    [0.02, 0.08],
    [0.08, 0.14],
    [0.14, 0.22],
    [0.22, 0.26],
    [0.26, 0.30],
    [0.30, 0.58],
    [0.62, 0.73],
    [0.74, 0.88],
    [0.88, 1.0],
  ];
  for (const [start, end] of textRanges) {
    if (p >= start && p <= end) return true;
  }
  return false;
}
