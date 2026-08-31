import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Cloud, MeshReflectorMaterial, OrbitControls, Sky, Stars } from "@react-three/drei";
import * as THREE from "three";

export type WeatherCondition = "clear" | "clouds" | "rain" | "drizzle" | "thunderstorm" | "snow" | "mist";

interface Weather3DSceneProps {
  condition: WeatherCondition;
  isNight: boolean;
  accent: string;
  className?: string;
}

export function conditionFromDescription(description: string): WeatherCondition {
  const lower = description.toLowerCase();
  if (lower.includes("thunder") || lower.includes("storm")) return "thunderstorm";
  if (lower.includes("drizzle")) return "drizzle";
  if (lower.includes("rain")) return "rain";
  if (lower.includes("snow")) return "snow";
  if (lower.includes("mist") || lower.includes("fog") || lower.includes("haze")) return "mist";
  if (lower.includes("cloud")) return "clouds";
  return "clear";
}

interface Atmosphere {
  sunPosition: [number, number, number];
  turbidity: number;
  rayleigh: number;
  mieCoefficient: number;
  mieDirectionalG: number;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  groundColor: string;
  ambient: number;
  sunColor: string;
}

const ATMOSPHERES: Record<WeatherCondition, Atmosphere> = {
  clear: { sunPosition: [4, 3.2, 2], turbidity: 3, rayleigh: 1.4, mieCoefficient: 0.004, mieDirectionalG: 0.8, fogColor: "#bfe3ff", fogNear: 12, fogFar: 38, groundColor: "#3d8f5c", ambient: 0.75, sunColor: "#fff4d6" },
  clouds: { sunPosition: [3, 1.6, 2.5], turbidity: 8, rayleigh: 1.1, mieCoefficient: 0.02, mieDirectionalG: 0.85, fogColor: "#c7d2e2", fogNear: 8, fogFar: 30, groundColor: "#4b6a5a", ambient: 0.65, sunColor: "#f4ede0" },
  mist: { sunPosition: [2.5, 1.1, 2.5], turbidity: 12, rayleigh: 0.6, mieCoefficient: 0.05, mieDirectionalG: 0.9, fogColor: "#dbe6e2", fogNear: 3, fogFar: 16, groundColor: "#6b8378", ambient: 0.6, sunColor: "#eef2ee" },
  drizzle: { sunPosition: [2, 1.3, 2.5], turbidity: 10, rayleigh: 1, mieCoefficient: 0.03, mieDirectionalG: 0.85, fogColor: "#93a9c4", fogNear: 6, fogFar: 24, groundColor: "#3d5a52", ambient: 0.55, sunColor: "#e6ecf5" },
  rain: { sunPosition: [1.5, 1, 2], turbidity: 14, rayleigh: 0.9, mieCoefficient: 0.04, mieDirectionalG: 0.85, fogColor: "#5b7291", fogNear: 5, fogFar: 22, groundColor: "#33454a", ambient: 0.45, sunColor: "#cfe0f0" },
  thunderstorm: { sunPosition: [1, 0.5, 1.8], turbidity: 18, rayleigh: 0.7, mieCoefficient: 0.05, mieDirectionalG: 0.9, fogColor: "#2b2440", fogNear: 4, fogFar: 20, groundColor: "#241f38", ambient: 0.28, sunColor: "#c4b5fd" },
  snow: { sunPosition: [3, 1.8, 2.2], turbidity: 6, rayleigh: 0.9, mieCoefficient: 0.02, mieDirectionalG: 0.85, fogColor: "#e6f1fb", fogNear: 5, fogFar: 24, groundColor: "#eef5fb", ambient: 0.8, sunColor: "#f8fbff" },
};

function useSoftCircleTexture(hex: string) {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, `${hex}ff`);
    gradient.addColorStop(0.5, `${hex}aa`);
    gradient.addColorStop(1, `${hex}00`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }, [hex]);
}

function SunDisc({ position, color }: { position: [number, number, number]; color: string }) {
  const glow = useSoftCircleTexture(color);
  const dir = useMemo(() => new THREE.Vector3(...position).normalize().multiplyScalar(28), [position]);

  return (
    <group position={dir}>
      <sprite scale={[9, 9, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.9} />
      </sprite>
      <mesh>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function Moon({ position }: { position: [number, number, number] }) {
  const glow = useSoftCircleTexture("#e2e8f0");
  const dir = useMemo(() => new THREE.Vector3(...position).normalize().multiplyScalar(26), [position]);
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.02;
  });

  return (
    <group position={dir}>
      <sprite scale={[7, 7, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.55} />
      </sprite>
      <mesh ref={ref}>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial color="#eef2f7" roughness={0.9} metalness={0} emissive="#334155" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

function VolumetricClouds({ condition }: { condition: WeatherCondition }) {
  const dense = condition === "thunderstorm" || condition === "rain";
  const count = condition === "clear" ? 3 : condition === "clouds" ? 6 : dense ? 8 : condition === "mist" ? 5 : 4;
  const color = condition === "thunderstorm" ? "#4b4560" : condition === "rain" || condition === "drizzle" ? "#8a97ab" : condition === "mist" ? "#e7edf0" : "#ffffff";
  const opacity = condition === "thunderstorm" ? 0.85 : dense ? 0.75 : condition === "mist" ? 0.55 : 0.55;

  const layout = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        position: [(Math.random() - 0.5) * 20, 3 + Math.random() * 3.5, -6 - Math.random() * 10] as [number, number, number],
        scale: 1.4 + Math.random() * 1.8,
        speed: 0.05 + Math.random() * 0.1,
        seg: 18 + Math.floor(Math.random() * 10),
      })),
    [count]
  );

  return (
    <>
      {layout.map((c, i) => (
        <Cloud
          key={i}
          position={c.position}
          scale={c.scale}
          speed={c.speed}
          segments={c.seg}
          opacity={opacity}
          color={color}
          bounds={[6, 1.5, 2]}
          volume={5}
          fade={30}
        />
      ))}
    </>
  );
}

function RainStreaks({ intensity = 260, color = "#bfe3ff" }: { intensity?: number; color?: string }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const bounds = { x: 16, y: 10, z: 10 };

  const drops = useMemo(
    () =>
      Array.from({ length: intensity }, () => ({
        x: (Math.random() - 0.5) * bounds.x,
        y: Math.random() * bounds.y,
        z: (Math.random() - 0.5) * bounds.z + 2,
        speed: 9 + Math.random() * 6,
        length: 0.5 + Math.random() * 0.5,
      })),
    [intensity]
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      d.y -= d.speed * delta;
      if (d.y < -2) {
        d.y = bounds.y - 1;
        d.x = (Math.random() - 0.5) * bounds.x;
        d.z = (Math.random() - 0.5) * bounds.z + 2;
      }
      dummy.position.set(d.x + d.y * 0.03, d.y, d.z);
      dummy.rotation.set(0, 0, -0.12);
      dummy.scale.set(1, d.length, 1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, intensity]} frustumCulled={false}>
      <cylinderGeometry args={[0.008, 0.008, 0.55, 4]} />
      <meshBasicMaterial color={color} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}

function SnowFall({ count = 260 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const flakeTexture = useSoftCircleTexture("#ffffff");
  const bounds = { x: 16, y: 10, z: 10 };

  const flakes = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * bounds.x,
        y: Math.random() * bounds.y,
        z: (Math.random() - 0.5) * bounds.z + 2,
        speed: 0.6 + Math.random() * 0.7,
        sway: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        scale: 0.05 + Math.random() * 0.07,
      })),
    [count]
  );

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      f.y -= f.speed * delta;
      if (f.y < -2) {
        f.y = bounds.y - 1;
        f.x = (Math.random() - 0.5) * bounds.x;
      }
      const sway = Math.sin(t * f.sway + f.phase) * 0.5;
      dummy.position.set(f.x + sway, f.y, f.z);
      dummy.scale.setScalar(f.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={flakeTexture} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

function LightningFlash() {
  const lightRef = useRef<THREE.PointLight>(null);
  const flashRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const cycle = t % 5.5;
    const flashing = cycle < 0.1 || (cycle > 0.2 && cycle < 0.26);
    if (lightRef.current) lightRef.current.intensity = flashing ? 14 : 0;
    if (flashRef.current) {
      const mat = flashRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = flashing ? 0.35 : 0;
    }
  });

  return (
    <>
      <pointLight ref={lightRef} position={[0, 6, -4]} color="#e0e7ff" distance={30} intensity={0} />
      <mesh ref={flashRef} position={[0, 0, -10]}>
        <planeGeometry args={[60, 40]} />
        <meshBasicMaterial color="#e0e7ff" transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

function Ground({ color }: { color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <MeshReflectorMaterial
        blur={[300, 80]}
        resolution={512}
        mixBlur={1}
        mixStrength={35}
        roughness={0.9}
        depthScale={1}
        minDepthThreshold={0.85}
        color={color}
        metalness={0.15}
        mirror={0.35}
      />
    </mesh>
  );
}

function SceneContents({ condition, isNight }: Weather3DSceneProps) {
  const atmo = ATMOSPHERES[condition];

  return (
    <>
      <fog attach="fog" args={[isNight ? "#050814" : atmo.fogColor, atmo.fogNear, atmo.fogFar]} />
      <ambientLight intensity={isNight ? 0.22 : atmo.ambient} color={isNight ? "#4c5b8a" : "#ffffff"} />
      <directionalLight
        position={atmo.sunPosition}
        intensity={isNight ? 0.15 : condition === "thunderstorm" ? 0.5 : 1.1}
        color={atmo.sunColor}
        castShadow
      />

      {isNight ? (
        <>
          <color attach="background" args={["#050814"]} />
          <Stars radius={60} depth={40} count={2200} factor={3} saturation={0} fade speed={0.5} />
          <Moon position={atmo.sunPosition} />
        </>
      ) : (
        <>
          <Sky
            distance={450000}
            sunPosition={atmo.sunPosition}
            turbidity={atmo.turbidity}
            rayleigh={atmo.rayleigh}
            mieCoefficient={atmo.mieCoefficient}
            mieDirectionalG={atmo.mieDirectionalG}
          />
          {condition !== "mist" && <SunDisc position={atmo.sunPosition} color={atmo.sunColor} />}
        </>
      )}

      <VolumetricClouds condition={condition} />
      <Ground color={isNight ? "#0c1224" : atmo.groundColor} />

      {(condition === "rain" || condition === "thunderstorm") && <RainStreaks intensity={condition === "thunderstorm" ? 320 : 260} />}
      {condition === "drizzle" && <RainStreaks intensity={140} color="#dbeafe" />}
      {condition === "snow" && <SnowFall count={240} />}
      {condition === "thunderstorm" && <LightningFlash />}
    </>
  );
}

export function Weather3DScene({ condition, isNight, accent, className = "" }: Weather3DSceneProps) {
  return (
    <div className={`relative h-full w-full ${className}`}>
      <Canvas
        shadows
        camera={{ position: [0, 0.6, 9], fov: 50 }}
        gl={{ antialias: true }}
        dpr={[1, 1.75]}
      >
        <Suspense fallback={null}>
          <SceneContents condition={condition} isNight={isNight} accent={accent} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2 - 0.45}
          maxPolarAngle={Math.PI / 2 + 0.15}
          autoRotate
          autoRotateSpeed={0.5}
          target={[0, 1, 0]}
        />
      </Canvas>
    </div>
  );
}
