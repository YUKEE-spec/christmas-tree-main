import React, { useRef, useMemo, useState, useEffect, Suspense, useCallback } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  shaderMaterial,
  Float,
  Stars,
  Sparkles,
  useTexture
} from '@react-three/drei';
import * as THREE from 'three';
import { MathUtils } from 'three';
import * as random from 'maath/random';
import { EnhancedGifts } from './EnhancedGifts';
import type { GiftConfig } from './GiftConfig';
import { SnowGround } from './SnowGround';
import { ParticleOlaf } from './ParticleOlaf';
import { ParticleAnimals } from './ParticleAnimals';
import { ParticleText } from './ParticleText';

// 装饰配置类型
interface DecorationSettings {
  showGifts: boolean;
  showPhotos: boolean;
  showLights: boolean;
  showSnow: boolean;
  showStars: boolean;
  showSparkles: boolean;
  showGoldenNebula: boolean;
}

// 视觉配置
const CONFIG = {
  colors: {
    emerald: '#004225',
    gold: '#FFD700',
    silver: '#ECEFF1',
    red: '#D32F2F',
    green: '#2E7D32',
    white: '#FFFFFF',
    warmLight: '#FFD54F',
    lights: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
    borders: ['#FFFAF0', '#F0E68C', '#E6E6FA', '#FFB6C1', '#98FB98', '#87CEFA', '#FFDAB9'],
    giftColors: ['#D32F2F', '#FFD700', '#1976D2', '#2E7D32'],
    candyColors: ['#FF0000', '#FFFFFF']
  },
  counts: {
    foliage: 15000,
    ornaments: 50,
    elements: 80,
    lights: 200
  },
  tree: { height: 32, radius: 14 },
  photos: {
    body: [
      '/photos/top.jpg',
      ...Array.from({ length: 20 }, (_, i) => `/photos/${i + 1}.jpg`)
    ]
  }
};

// Shader Material (Foliage) - 增强版粒子效果
const FoliageMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color('#006C35'), uProgress: 0 },
  // Vertex Shader
  `
  precision highp float;
  uniform float uTime;
  uniform float uProgress;
  attribute vec3 aTargetPos;
  attribute float aRandom;
  varying float vMix;
  varying float vRandom;
  
  float cubicInOut(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
  }
  
  void main() {
    vRandom = aRandom;
    float noiseScale = 0.25;
    vec3 noise = vec3(
      sin(uTime * 2.0 + position.x * 0.5 + aRandom * 10.0),
      cos(uTime * 1.5 + position.y * 0.5 + aRandom * 8.0),
      sin(uTime * 1.8 + position.z * 0.5 + aRandom * 12.0)
    ) * noiseScale;
    float t = cubicInOut(uProgress);
    vec3 finalPos = mix(position, aTargetPos + noise, t);
    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_PointSize = (100.0 * (1.0 + aRandom * 0.8)) / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
    vMix = t;
  }
  `,
  // Fragment Shader
  `
  precision highp float;
  uniform vec3 uColor;
  uniform float uTime;
  varying float vMix;
  varying float vRandom;
  
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.3, 0.5, r);
    float sparkle = sin(uTime * 3.0 + vRandom * 20.0) * 0.3 + 0.7;
    vec3 finalColor = mix(uColor * 0.4, uColor * 1.5 * sparkle, vMix);
    finalColor += uColor * 0.3 * (1.0 - r * 2.0);
    gl_FragColor = vec4(finalColor, alpha);
  }
  `
);
extend({ FoliageMaterial });

// 螺旋参数配置
const SPIRAL_CONFIG = {
  turns: 5,
  width: 1.8
};

// Helper: 获取螺旋位置
const getSpiralPosition = (index: number, total: number) => {
  const h = CONFIG.tree.height;
  const rBase = CONFIG.tree.radius;

  const t = index / total;
  const y = t * h - (h / 2);
  const normalizedY = t;

  const coneRadius = rBase * (1 - normalizedY * 0.95);
  const spiralAngle = t * SPIRAL_CONFIG.turns * Math.PI * 2;

  const angleOffset = (Math.random() - 0.5) * 0.3;
  const theta = spiralAngle + angleOffset;

  const radiusFactor = 0.9 + Math.random() * 0.1;
  const r = coneRadius * radiusFactor;

  const noise = (Math.random() - 0.5) * 0.2;

  return new THREE.Vector3(
    r * Math.cos(theta) + noise,
    y + (Math.random() - 0.5) * 0.5,
    r * Math.sin(theta) + noise
  );
};

// Helper: Tree Shape
const getTreePosition = (shape: string = 'spiral') => {
  const h = CONFIG.tree.height;
  const rBase = CONFIG.tree.radius;
  const t = Math.random();
  const y = t * h - (h / 2);
  const normalizedY = t;

  if (shape === 'cone') {
    const coneRadius = rBase * (1 - normalizedY * 0.95);
    const theta = Math.random() * Math.PI * 2;
    const radiusFactor = 0.3 + Math.random() * 0.7;
    const r = coneRadius * radiusFactor;
    return [
      r * Math.cos(theta),
      y,
      r * Math.sin(theta)
    ];
  }

  // 默认：螺旋形
  const coneRadius = rBase * (1 - normalizedY * 0.95);
  const spiralAngle = t * SPIRAL_CONFIG.turns * Math.PI * 2;
  const isOnSpiral = Math.random() < 0.7;

  if (isOnSpiral) {
    const angleOffset = (Math.random() - 0.5) * 0.8;
    const theta = spiralAngle + angleOffset;
    const radiusFactor = 0.85 + Math.random() * 0.15;
    const r = coneRadius * radiusFactor;
    const noise = (Math.random() - 0.5) * 0.3;
    return [
      r * Math.cos(theta) + noise,
      y + (Math.random() - 0.5) * SPIRAL_CONFIG.width,
      r * Math.sin(theta) + noise
    ];
  } else {
    const theta = Math.random() * Math.PI * 2;
    const radiusFactor = Math.random() * 0.7;
    const r = coneRadius * radiusFactor;
    const noise = (Math.random() - 0.5) * 0.5;
    return [
      r * Math.cos(theta) + noise,
      y,
      r * Math.sin(theta) + noise
    ];
  }
};

// Component: Foliage
const Foliage = ({ state, treeColor, particleCount, treeShape }: {
  state: 'CHAOS' | 'FORMED',
  treeColor: string,
  particleCount?: number,
  treeShape?: string
}) => {
  const materialRef = useRef<any>(null);
  const count = particleCount || CONFIG.counts.foliage;
  const shape = treeShape || 'spiral';

  const { positions, targetPositions, randoms } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const spherePoints = random.inSphere(new Float32Array(count * 3), { radius: 30 }) as Float32Array;
    for (let i = 0; i < count; i++) {
      positions[i * 3] = spherePoints[i * 3];
      positions[i * 3 + 1] = spherePoints[i * 3 + 1];
      positions[i * 3 + 2] = spherePoints[i * 3 + 2];
      const [tx, ty, tz] = getTreePosition(shape);
      targetPositions[i * 3] = tx;
      targetPositions[i * 3 + 1] = ty;
      targetPositions[i * 3 + 2] = tz;
      randoms[i] = Math.random();
    }
    return { positions, targetPositions, randoms };
  }, [count, shape]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uColor = new THREE.Color(treeColor);
    }
  }, [treeColor]);

  useFrame((rootState, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime = rootState.clock.elapsedTime;
      const targetProgress = state === 'FORMED' ? 1 : 0;
      materialRef.current.uProgress = MathUtils.damp(materialRef.current.uProgress, targetProgress, 1.5, delta);
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aTargetPos" args={[targetPositions, 3]} />
        <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
      </bufferGeometry>
      {/* @ts-ignore */}
      <foliageMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uColor={new THREE.Color(treeColor)}
        uTime={0}
        uProgress={0}
      />
    </points>
  );
};


// Component: Photo Ornaments (Double-Sided Polaroid)
const PhotoOrnamentsInner = ({ state, textureArray, onPhotoClick }: {
  state: 'CHAOS' | 'FORMED';
  textureArray: THREE.Texture[];
  onPhotoClick?: (textureIndex: number) => void;
}) => {
  // 移动端使用更少的照片
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);
  const count = isMobile ? 20 : CONFIG.counts.ornaments;
  const groupRef = useRef<THREE.Group>(null);

  const borderGeometry = useMemo(() => new THREE.PlaneGeometry(1.3, 1.6), []);
  const photoGeometry = useMemo(() => new THREE.PlaneGeometry(1.1, 1.1), []);

  // 使用稳定的种子生成随机数，避免每次渲染位置变化
  const seededRandom = useCallback((seed: number) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }, []);

  // 只依赖 count，不依赖 textureArray.length，避免闪烁
  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      const seed = i * 1000;
      const chaosPos = new THREE.Vector3(
        (seededRandom(seed) - 0.5) * 70,
        (seededRandom(seed + 1) - 0.5) * 70,
        (seededRandom(seed + 2) - 0.5) * 70
      );
      // 照片位置稍微向外偏移，避免被树遮挡
      const baseTargetPos = getSpiralPosition(i, count);
      const targetPos = new THREE.Vector3(
        baseTargetPos.x * 1.15,
        baseTargetPos.y,
        baseTargetPos.z * 1.15
      );

      // 增大照片尺寸
      const isBig = seededRandom(seed + 3) < 0.25;
      const baseScale = isBig ? 2.5 : 1.2 + seededRandom(seed + 4) * 0.8;
      const weight = 0.8 + seededRandom(seed + 5) * 1.2;

      const borderColors = [
        '#FFD700', '#C0C0C0', '#CD7F32', '#FFFAF0',
        '#F5F5DC', '#DDA0DD', '#FFB6C1', '#98FB98',
      ];
      const borderColor = borderColors[Math.floor(seededRandom(seed + 6) * borderColors.length)];

      const rotationSpeed = {
        x: (seededRandom(seed + 7) - 0.5) * 0.5,
        y: (seededRandom(seed + 8) - 0.5) * 0.5,
        z: (seededRandom(seed + 9) - 0.5) * 0.5
      };
      const chaosRotation = new THREE.Euler(
        seededRandom(seed + 10) * Math.PI,
        seededRandom(seed + 11) * Math.PI,
        seededRandom(seed + 12) * Math.PI
      );

      return {
        chaosPos, targetPos, scale: baseScale, weight,
        borderColor,
        currentPos: chaosPos.clone(),
        chaosRotation,
        rotationSpeed,
        wobbleOffset: seededRandom(seed + 13) * 10,
        wobbleSpeed: 0.3 + seededRandom(seed + 14) * 0.4,
        frameType: seededRandom(seed + 15) < 0.3 ? 'ornate' : 'simple'
      };
    });
  }, [count, seededRandom]);

  // 纹理索引单独计算，这样纹理变化不会影响位置
  const getTextureIndex = useCallback((i: number) => {
    return i % textureArray.length;
  }, [textureArray.length]);

  useFrame((stateObj, delta) => {
    if (!groupRef.current) return;
    const isFormed = state === 'FORMED';
    const time = stateObj.clock.elapsedTime;

    groupRef.current.children.forEach((group, i) => {
      const objData = data[i];
      const target = isFormed ? objData.targetPos : objData.chaosPos;

      objData.currentPos.lerp(target, delta * (isFormed ? 0.8 * objData.weight : 0.5));
      group.position.copy(objData.currentPos);

      if (isFormed) {
        const targetLookPos = new THREE.Vector3(group.position.x * 1.5, group.position.y + 0.3, group.position.z * 1.5);
        group.lookAt(targetLookPos);

        const wobbleX = Math.sin(time * objData.wobbleSpeed + objData.wobbleOffset) * 0.03;
        const wobbleZ = Math.cos(time * objData.wobbleSpeed * 0.8 + objData.wobbleOffset) * 0.03;
        group.rotation.x += wobbleX;
        group.rotation.z += wobbleZ;

      } else {
        group.rotation.x += delta * objData.rotationSpeed.x;
        group.rotation.y += delta * objData.rotationSpeed.y;
        group.rotation.z += delta * objData.rotationSpeed.z;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((obj, i) => {
        const texIdx = getTextureIndex(i);
        return (
          <group key={i} scale={[obj.scale, obj.scale, obj.scale]} rotation={state === 'CHAOS' ? obj.chaosRotation : [0, 0, 0]}>
            {/* 正面 */}
            <group position={[0, 0, 0.05]}>
              <mesh
                geometry={photoGeometry}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onPhotoClick?.(texIdx);
                }}
              >
                <meshStandardMaterial
                  map={textureArray[texIdx]}
                  roughness={0.2}
                  metalness={0.1}
                  emissive={CONFIG.colors.white}
                  emissiveMap={textureArray[texIdx]}
                  emissiveIntensity={1.2}
                  side={THREE.FrontSide}
                />
              </mesh>
              {obj.frameType === 'ornate' ? (
                <>
                  <mesh geometry={borderGeometry} position={[0, -0.15, -0.04]}>
                    <meshStandardMaterial
                      color={obj.borderColor}
                      roughness={0.2}
                      metalness={0.8}
                      emissive={obj.borderColor}
                      emissiveIntensity={0.4}
                      side={THREE.FrontSide}
                    />
                  </mesh>
                  <mesh geometry={new THREE.PlaneGeometry(1.2, 1.5)} position={[0, -0.15, -0.02]}>
                    <meshStandardMaterial
                      color={obj.borderColor === '#FFD700' ? '#FFF8DC' : '#FFFFFF'}
                      roughness={0.8}
                      metalness={0.1}
                      side={THREE.FrontSide}
                    />
                  </mesh>
                </>
              ) : (
                <mesh geometry={borderGeometry} position={[0, -0.15, -0.04]}>
                  <meshStandardMaterial
                    color={obj.borderColor}
                    roughness={0.5}
                    metalness={0.5}
                    emissive={obj.borderColor}
                    emissiveIntensity={0.3}
                    side={THREE.FrontSide}
                  />
                </mesh>
              )}
            </group>
            {/* 背面 */}
            <group position={[0, 0, -0.05]} rotation={[0, Math.PI, 0]}>
              <mesh
                geometry={photoGeometry}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onPhotoClick?.(texIdx);
                }}
              >
                <meshStandardMaterial
                  map={textureArray[texIdx]}
                  roughness={0.3}
                  metalness={0.1}
                  emissive={CONFIG.colors.white}
                  emissiveMap={textureArray[texIdx]}
                  emissiveIntensity={0.8}
                  side={THREE.FrontSide}
                />
              </mesh>
              <mesh geometry={borderGeometry} position={[0, -0.15, -0.04]}>
                <meshStandardMaterial
                  color={obj.borderColor}
                  roughness={0.6}
                  metalness={0.4}
                  side={THREE.FrontSide}
                />
              </mesh>
            </group>
            <mesh geometry={new THREE.PlaneGeometry(1.4, 1.7)} position={[0, -0.15, 0]}>
              <meshBasicMaterial
                color={obj.borderColor}
                transparent
                opacity={0.05}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const PhotoOrnamentsDefault = ({ state, onPhotoClick }: { state: 'CHAOS' | 'FORMED'; onPhotoClick?: (index: number) => void }) => {
  const textures = useTexture(CONFIG.photos.body);
  const textureArray = useMemo(() => {
    const arr = Array.isArray(textures) ? textures : [textures];
    arr.forEach(t => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 16;
    });
    return arr;
  }, [textures]);
  return <PhotoOrnamentsInner state={state} textureArray={textureArray} onPhotoClick={onPhotoClick} />;
};

const PhotoOrnamentsCustom = ({ state, customPhotos, onPhotoClick }: { state: 'CHAOS' | 'FORMED'; customPhotos: string[]; onPhotoClick?: (index: number) => void }) => {
  const [textures, setTextures] = useState<THREE.Texture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const prevPhotosRef = useRef<string[]>([]);

  // 当照片列表变化时，重新加载纹理
  useEffect(() => {
    // 检查照片是否真的变化了
    const photosChanged = customPhotos.length !== prevPhotosRef.current.length ||
      customPhotos.some((url, i) => url !== prevPhotosRef.current[i]);

    if (!photosChanged && textures.length > 0) {
      return;
    }

    prevPhotosRef.current = [...customPhotos];

    const loader = new THREE.TextureLoader();
    let mounted = true;
    setIsLoading(true);

    console.log('Loading custom photos:', customPhotos.length);

    if (customPhotos.length === 0) {
      setIsLoading(false);
      setTextures([]);
      return;
    }

    Promise.all(
      customPhotos.map(
        (url) =>
          new Promise<THREE.Texture>((resolve) => {
            loader.load(
              url,
              (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                // 开启各向异性过滤，防止倾斜变糊
                const maxAnisotropy = 16;
                texture.anisotropy = maxAnisotropy;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.generateMipmaps = true;
                resolve(texture);
              },
              undefined,
              (error) => {
                console.error('Texture load error:', error);
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext('2d')!;
                ctx.fillStyle = '#FFB6C1';
                ctx.fillRect(0, 0, 64, 64);
                const fallbackTexture = new THREE.CanvasTexture(canvas);
                resolve(fallbackTexture);
              }
            );
          })
      )
    ).then((results) => {
      if (mounted) {
        console.log('All textures loaded:', results.length);
        setTextures(results);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [customPhotos]);

  // 加载中或没有纹理时返回空组件（不返回 null 避免闪烁）
  if (isLoading || textures.length === 0) {
    return <group />;
  }

  return <PhotoOrnamentsInner state={state} textureArray={textures} onPhotoClick={onPhotoClick} />;
};

const PhotoOrnaments = ({ state, customPhotos, onPhotoClick }: { state: 'CHAOS' | 'FORMED'; customPhotos?: string[]; onPhotoClick?: (index: number) => void }) => {
  // 明确判断：有自定义照片就只用自定义的，不混用
  const hasCustomPhotos = customPhotos && customPhotos.length > 0;

  if (hasCustomPhotos) {
    return <PhotoOrnamentsCustom state={state} customPhotos={customPhotos} onPhotoClick={onPhotoClick} />;
  }
  return <PhotoOrnamentsDefault state={state} onPhotoClick={onPhotoClick} />;
};

// Component: Fairy Lights
const FairyLights = ({ state, lightColors }: { state: 'CHAOS' | 'FORMED'; lightColors: string[] }) => {
  // 移动端使用更少的彩灯
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);
  const count = isMobile ? 80 : CONFIG.counts.lights;
  const groupRef = useRef<THREE.Group>(null);

  // 安全的颜色列表，防止除以0导致的 NaN
  const safeColors = useMemo(() => {
    return (lightColors && lightColors.length > 0) ? lightColors : ['#FFD700', '#FFFFFF', '#FF0000', '#00FF00'];
  }, [lightColors]);

  const lightColorsLengthRef = useRef(safeColors.length);
  // 当颜色列表长度变化时更新 ref，避免重生成数据但计算越界
  useEffect(() => {
    lightColorsLengthRef.current = safeColors.length;
  }, [safeColors.length]);

  // 预创建几何体，避免在循环中重复创建造成内存泄漏和性能崩溃
  const starGeo = useMemo(() => new THREE.CylinderGeometry(0, 1.2, 0.8, 5), []);
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1.2, 16, 16), []);
  const haloGeo = useMemo(() => new THREE.SphereGeometry(2.2, 8, 8), []);
  const glowGeo = useMemo(() => new THREE.SphereGeometry(1.6, 6, 6), []);

  // 只在数量变化时重新生成数据，颜色变化不影响位置
  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      const chaosPos = new THREE.Vector3((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60);
      const targetPos = getSpiralPosition(i, count);
      // 使用 ref 避免闭包依赖
      const colorIndex = i;
      const speed = 1 + Math.random() * 1.5;
      const phase = Math.random() * Math.PI * 2;
      const size = 0.15 + Math.random() * 0.2;
      const lightType = Math.random() < 0.4 ? 'star' : 'sphere';
      return { chaosPos, targetPos, colorIndex, speed, phase, size, currentPos: chaosPos.clone(), lightType };
    });
  }, [count]);

  useFrame((stateObj, delta) => {
    if (!groupRef.current) return;
    const isFormed = state === 'FORMED';
    const time = stateObj.clock.elapsedTime;
    const colors = safeColors; // 捕获当前 render 的颜色
    const numColors = colors.length;

    groupRef.current.children.forEach((child, i) => {
      const group = child as THREE.Group;
      const objData = data[i];
      const target = isFormed ? objData.targetPos : objData.chaosPos;
      objData.currentPos.lerp(target, delta * 2.0);
      group.position.copy(objData.currentPos);

      const wave1 = Math.sin(time * objData.speed + objData.phase);
      const wave2 = Math.sin(time * objData.speed * 0.6 + objData.phase * 1.2);
      const pulse = (wave1 * 0.7 + wave2 * 0.3 + 2) / 4;

      const mesh = group.children[0] as THREE.Mesh;
      const halo = group.children[1] as THREE.Mesh;

      // 动态获取颜色
      const colorIndex = objData.colorIndex % numColors;
      const currentColor = colors[colorIndex];

      if (mesh && mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = isFormed ? 2 + pulse * 4 : 0;

        mat.color.set(currentColor);
        mat.emissive.set(currentColor);

        const breathe = 1 + pulse * 0.25;
        group.scale.setScalar(objData.size * breathe);

        if (objData.lightType === 'star') {
          group.rotation.z = time * 0.3 + objData.phase;
        }
      }

      if (halo && halo.material) {
        const haloMat = halo.material as THREE.MeshBasicMaterial;
        haloMat.opacity = isFormed ? 0.2 + pulse * 0.3 : 0;
        haloMat.color.set(currentColor);
      }

      // 更新第三个光晕
      const halo2 = group.children[2] as THREE.Mesh;
      if (halo2 && halo2.material) {
        const halo2Mat = halo2.material as THREE.MeshBasicMaterial;
        halo2Mat.color.set(currentColor);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((obj, i) => {
        // Render 时的颜色 (初始值)，动画循环会覆盖它
        const initialColor = safeColors[obj.colorIndex % safeColors.length];

        return (
          <group key={i}>
            {/* 主体光源 */}
            <mesh geometry={obj.lightType === 'star' ? starGeo : sphereGeo}>
              <meshStandardMaterial
                color={initialColor}
                emissive={initialColor}
                emissiveIntensity={0}
                toneMapped={false}
                transparent
                opacity={1.0}
                roughness={obj.lightType === 'star' ? 0.05 : 0.02}
                metalness={obj.lightType === 'star' ? 0.8 : 0.9}
              />
            </mesh>

            {/* 外层大光晕 */}
            <mesh geometry={haloGeo}>
              <meshBasicMaterial
                color={initialColor}
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* 内层强光晕 */}
            <mesh geometry={glowGeo}>
              <meshBasicMaterial
                color={initialColor}
                transparent
                opacity={0.15}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  );
};

// Component: Top Star - 粒子效果的圣诞树顶星
const TopStar = ({ state, color }: { state: 'CHAOS' | 'FORMED'; color: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const innerGlowRef = useRef<THREE.MeshBasicMaterial>(null);
  const outerGlowRef = useRef<THREE.MeshBasicMaterial>(null);

  // 生成五角星形状的粒子
  const { positions, targetPositions, randoms } = useMemo(() => {
    const count = 800;
    const positions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    // 五角星参数
    const outerRadius = 2.2;
    const innerRadius = 0.9;
    const points = 5;
    const thickness = 0.4;

    for (let i = 0; i < count; i++) {
      // 初始位置：随机散开
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      // 目标位置：五角星形状
      const t = Math.random();
      const starIndex = Math.floor(Math.random() * points * 2);
      const nextIndex = (starIndex + 1) % (points * 2);

      const angle1 = (starIndex / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const angle2 = (nextIndex / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const r1 = starIndex % 2 === 0 ? outerRadius : innerRadius;
      const r2 = nextIndex % 2 === 0 ? outerRadius : innerRadius;

      // 在星星边缘上插值
      const x = r1 * Math.cos(angle1) * (1 - t) + r2 * Math.cos(angle2) * t;
      const y = r1 * Math.sin(angle1) * (1 - t) + r2 * Math.sin(angle2) * t;
      const z = (Math.random() - 0.5) * thickness;

      // 添加一些粒子在星星内部
      const fillFactor = Math.random();
      if (fillFactor < 0.3) {
        const scale = Math.random() * 0.8;
        targetPositions[i * 3] = x * scale;
        targetPositions[i * 3 + 1] = y * scale;
        targetPositions[i * 3 + 2] = z;
      } else {
        targetPositions[i * 3] = x + (Math.random() - 0.5) * 0.15;
        targetPositions[i * 3 + 1] = y + (Math.random() - 0.5) * 0.15;
        targetPositions[i * 3 + 2] = z;
      }

      randoms[i] = Math.random();
    }

    return { positions, targetPositions, randoms };
  }, []);

  // 更新颜色
  useEffect(() => {
    const threeColor = new THREE.Color(color);
    if (materialRef.current) {
      materialRef.current.color = threeColor;
    }
    if (innerGlowRef.current) {
      innerGlowRef.current.color = threeColor;
    }
    if (outerGlowRef.current) {
      outerGlowRef.current.color = threeColor;
    }
  }, [color]);

  // 动画
  useFrame((stateObj, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
      const targetScale = state === 'FORMED' ? 1 : 0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 2);
    }

    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.attributes.position;
      const targetAttr = pointsRef.current.geometry.attributes.aTargetPos;
      const randomAttr = pointsRef.current.geometry.attributes.aRandom;
      const time = stateObj.clock.elapsedTime;
      const isFormed = state === 'FORMED';

      for (let i = 0; i < posAttr.count; i++) {
        const tx = targetAttr.getX(i);
        const ty = targetAttr.getY(i);
        const tz = targetAttr.getZ(i);
        const rand = randomAttr.getX(i);

        if (isFormed) {
          // 聚合到星星形状，带轻微浮动
          const wobble = Math.sin(time * 2 + rand * 10) * 0.05;
          const cx = posAttr.getX(i);
          const cy = posAttr.getY(i);
          const cz = posAttr.getZ(i);

          posAttr.setXYZ(
            i,
            THREE.MathUtils.lerp(cx, tx + wobble, delta * 3),
            THREE.MathUtils.lerp(cy, ty + wobble, delta * 3),
            THREE.MathUtils.lerp(cz, tz, delta * 3)
          );
        } else {
          // 散开
          const cx = posAttr.getX(i);
          const cy = posAttr.getY(i);
          const cz = posAttr.getZ(i);
          const chaosX = (rand - 0.5) * 30;
          const chaosY = (rand * 1.5 - 0.5) * 30;
          const chaosZ = ((rand * 2) % 1 - 0.5) * 30;

          posAttr.setXYZ(
            i,
            THREE.MathUtils.lerp(cx, chaosX, delta * 1.5),
            THREE.MathUtils.lerp(cy, chaosY, delta * 1.5),
            THREE.MathUtils.lerp(cz, chaosZ, delta * 1.5)
          );
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={[0, CONFIG.tree.height / 2 + 3, 0]}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* 粒子星星 */}
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="attributes-aTargetPos" args={[targetPositions, 3]} />
            <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
          </bufferGeometry>
          <pointsMaterial
            ref={materialRef}
            color={color}
            size={0.35}
            transparent
            opacity={1}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {/* 内层光晕 */}
        <mesh>
          <sphereGeometry args={[1.0, 16, 16]} />
          <meshBasicMaterial ref={innerGlowRef} color={color} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        {/* 外层光晕 */}
        <mesh>
          <sphereGeometry args={[2.0, 16, 16]} />
          <meshBasicMaterial ref={outerGlowRef} color={color} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        {/* 点光源 */}
        <pointLight color={color} intensity={80} distance={25} decay={2} />
      </Float>
    </group>
  );
};

// 圣诞礼物堆配置
const CHRISTMAS_PILE_ITEMS = [
  { type: 'giftbox', color: '#DC143C', ribbonColor: '#FFD700', name: '大红礼盒' },
  { type: 'giftbox', color: '#FFD700', ribbonColor: '#DC143C', name: '金色礼盒' },
  { type: 'giftbox', color: '#FF8C00', ribbonColor: '#FFFFFF', name: '橙色礼盒' },
  { type: 'giftbox', color: '#228B22', ribbonColor: '#FFD700', name: '绿色礼盒' },
  { type: 'hat', color: '#DC143C', name: '圣诞帽' },
  { type: 'sock', color: '#DC143C', name: '圣诞袜' },
  { type: 'bell', color: '#FFD700', name: '圣诞铃铛' },
  { type: 'candycane', color: '#FF0000', name: '拐杖糖' },
];

// Component: Christmas Gift Box (带丝带的礼盒)
const ChristmasGiftBox = ({ color, ribbonColor, scale }: { color: string; ribbonColor: string; scale: number }) => {
  return (
    <group scale={[scale, scale * 0.8, scale]}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} emissive={color} emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.02, 0.12, 1.02]} />
        <meshStandardMaterial color={ribbonColor} roughness={0.3} metalness={0.5} emissive={ribbonColor} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.12, 1.02, 1.02]} />
        <meshStandardMaterial color={ribbonColor} roughness={0.3} metalness={0.5} emissive={ribbonColor} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={ribbonColor} roughness={0.3} metalness={0.5} emissive={ribbonColor} emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-0.18, 0.55, 0]} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color={ribbonColor} roughness={0.3} metalness={0.5} emissive={ribbonColor} emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.18, 0.55, 0]} rotation={[0, 0, -0.3]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color={ribbonColor} roughness={0.3} metalness={0.5} emissive={ribbonColor} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
};

// Component: Christmas Hat (圣诞帽)
const ChristmasHat = ({ scale }: { scale: number }) => {
  return (
    <group scale={[scale, scale, scale]}>
      {/* 帽身 - 红色锥形 */}
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.5, 1.3, 16]} />
        <meshStandardMaterial color="#DC143C" roughness={0.8} emissive="#DC143C" emissiveIntensity={0.1} />
      </mesh>
      {/* 帽檐 - 白色毛边圆柱，紧贴锥形底部 */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.2, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} emissive="#FFFFFF" emissiveIntensity={0.15} />
      </mesh>
      {/* 帽顶 - 白色绒球，稍微偏向一侧 */}
      <mesh position={[0.15, 1.1, 0.1]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} emissive="#FFFFFF" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
};

// Component: Christmas Sock (圣诞袜)
const ChristmasSock = ({ scale }: { scale: number }) => {
  return (
    <group scale={[scale, scale, scale]}>
      {/* 袜筒 - 垂直部分 */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.9, 12]} />
        <meshStandardMaterial color="#DC143C" roughness={0.7} emissive="#DC143C" emissiveIntensity={0.1} />
      </mesh>
      {/* 袜口 - 白色毛边 */}
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.26, 0.24, 0.18, 12]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} emissive="#FFFFFF" emissiveIntensity={0.15} />
      </mesh>
      {/* 袜跟 - 连接部分 */}
      <mesh position={[0.1, -0.05, 0]}>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshStandardMaterial color="#DC143C" roughness={0.7} emissive="#DC143C" emissiveIntensity={0.1} />
      </mesh>
      {/* 袜脚 - 水平部分 */}
      <mesh position={[0.35, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.25, 0.5, 12]} />
        <meshStandardMaterial color="#DC143C" roughness={0.7} emissive="#DC143C" emissiveIntensity={0.1} />
      </mesh>
      {/* 袜尖 */}
      <mesh position={[0.6, -0.05, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#DC143C" roughness={0.7} emissive="#DC143C" emissiveIntensity={0.1} />
      </mesh>
      {/* 装饰 - 绿色条纹 */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.06, 12]} />
        <meshStandardMaterial color="#228B22" roughness={0.6} emissive="#228B22" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.06, 12]} />
        <meshStandardMaterial color="#228B22" roughness={0.6} emissive="#228B22" emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
};

// Component: Christmas Bell (圣诞铃铛)
const ChristmasBell = ({ scale }: { scale: number }) => {
  return (
    <group scale={[scale, scale, scale]}>
      {/* 铃铛主体 - 上窄下宽的钟形 */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.15, 0.4, 0.6, 16]} />
        <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={0.9} emissive="#FFD700" emissiveIntensity={0.3} />
      </mesh>
      {/* 铃铛顶部圆顶 */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.15, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={0.9} emissive="#FFD700" emissiveIntensity={0.3} />
      </mesh>
      {/* 铃铛底部边缘加厚 */}
      <mesh position={[0, -0.2, 0]}>
        <torusGeometry args={[0.38, 0.06, 8, 16]} />
        <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={0.9} emissive="#FFD700" emissiveIntensity={0.35} />
      </mesh>
      {/* 铃舌 */}
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#B8860B" roughness={0.2} metalness={0.8} emissive="#B8860B" emissiveIntensity={0.2} />
      </mesh>
      {/* 蝴蝶结 - 左边 */}
      <mesh position={[-0.18, 0.5, 0]} rotation={[0, 0, 0.5]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#DC143C" roughness={0.5} emissive="#DC143C" emissiveIntensity={0.25} />
      </mesh>
      {/* 蝴蝶结 - 右边 */}
      <mesh position={[0.18, 0.5, 0]} rotation={[0, 0, -0.5]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#DC143C" roughness={0.5} emissive="#DC143C" emissiveIntensity={0.25} />
      </mesh>
      {/* 蝴蝶结 - 中心 */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#DC143C" roughness={0.5} emissive="#DC143C" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
};

// Component: Candy Cane (拐杖糖)
const CandyCane = ({ scale }: { scale: number }) => {
  return (
    <group scale={[scale, scale, scale]} rotation={[0, 0, 0.2]}>
      {/* 直杆部分 - 红白条纹效果用多个圆柱模拟 */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 12]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} emissive="#FFFFFF" emissiveIntensity={0.1} />
      </mesh>
      {/* 红色条纹 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, -0.5 + i * 0.25, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.1, 12]} />
          <meshStandardMaterial color="#FF0000" roughness={0.3} emissive="#FF0000" emissiveIntensity={0.15} />
        </mesh>
      ))}
      {/* 弯曲顶部 - 用球体模拟 */}
      <mesh position={[0.15, 0.55, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#FF0000" roughness={0.3} emissive="#FF0000" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0.08, 0.62, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} emissive="#FFFFFF" emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
};

// Component: Gift Pile (圣诞礼物堆)
const GiftPile = ({ state }: { state: 'CHAOS' | 'FORMED' }) => {
  // 移动端使用更少的礼物
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);
  const count = isMobile ? 8 : 20;
  const groupRef = useRef<THREE.Group>(null);

  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, index) => {
      const chaosPos = new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60
      );

      const angle = Math.random() * Math.PI * 2;
      const distance = 8 + Math.random() * 8;
      const targetPos = new THREE.Vector3(
        Math.cos(angle) * distance,
        -CONFIG.tree.height / 2 + 0.5 + Math.random() * 1.5,
        Math.sin(angle) * distance
      );

      const item = CHRISTMAS_PILE_ITEMS[index % CHRISTMAS_PILE_ITEMS.length];
      const scale = 1.2 + Math.random() * 1.0;
      const rotationY = Math.random() * Math.PI * 2;

      return { chaosPos, targetPos, item, scale, currentPos: chaosPos.clone(), rotationY };
    });
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const isFormed = state === 'FORMED';
    groupRef.current.children.forEach((child, i) => {
      const group = child as THREE.Group;
      const objData = data[i];
      const target = isFormed ? objData.targetPos : objData.chaosPos;
      objData.currentPos.lerp(target, delta * 1.2);
      group.position.copy(objData.currentPos);
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((obj, i) => (
        <group key={i} rotation={[0, obj.rotationY, 0]}>
          {obj.item.type === 'giftbox' && (
            <ChristmasGiftBox color={obj.item.color} ribbonColor={obj.item.ribbonColor || '#FFD700'} scale={obj.scale} />
          )}
          {obj.item.type === 'hat' && <ChristmasHat scale={obj.scale} />}
          {obj.item.type === 'sock' && <ChristmasSock scale={obj.scale} />}
          {obj.item.type === 'bell' && <ChristmasBell scale={obj.scale} />}
          {obj.item.type === 'candycane' && <CandyCane scale={obj.scale} />}
        </group>
      ))}
    </group>
  );
};
// Component: Golden Nebula - 减少粒子数量以降低内存占用
const GoldenNebula = ({ state }: { state: 'CHAOS' | 'FORMED' }) => {
  // 移动端使用更少的粒子
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);
  const count = isMobile ? 30 : 100;
  const pointsRef = useRef<THREE.Points>(null);

  // 创建圆形星云纹理
  const nebulaTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const cx = 32, cy = 32;

    // 创建径向渐变
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 32);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    return new THREE.CanvasTexture(canvas);
  }, []);

  const { positions, targetPositions, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 80;
      const distance = 35 + Math.random() * 60;

      const wave = Math.sin(angle * 2 + height * 0.05) * 8;

      targetPositions[i * 3] = Math.cos(angle) * (distance + wave);
      targetPositions[i * 3 + 1] = height;
      targetPositions[i * 3 + 2] = Math.sin(angle) * (distance + wave);

      sizes[i] = 2 + Math.random() * 4;
    }

    return { positions, targetPositions, sizes };
  }, []);

  useFrame((stateObj, delta) => {
    if (!pointsRef.current) return;
    const isFormed = state === 'FORMED';
    const time = stateObj.clock.elapsedTime;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const targetAttr = pointsRef.current.geometry.attributes.aTargetPos;

    for (let i = 0; i < count; i++) {
      const currentX = posAttr.getX(i);
      const currentY = posAttr.getY(i);
      const currentZ = posAttr.getZ(i);

      const targetX = targetAttr.getX(i);
      const targetY = targetAttr.getY(i);
      const targetZ = targetAttr.getZ(i);

      const lerpFactor = isFormed ? 0.5 * delta : 0.2 * delta;

      const newX = THREE.MathUtils.lerp(currentX, targetX, lerpFactor);
      const newY = THREE.MathUtils.lerp(currentY, targetY, lerpFactor);
      const newZ = THREE.MathUtils.lerp(currentZ, targetZ, lerpFactor);

      const drift = Math.sin(time * 0.2 + i * 0.1) * 0.5;

      posAttr.setXYZ(i, newX + drift, newY, newZ + drift * 0.5);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aTargetPos" args={[targetPositions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        color="#FFD700"
        size={3}
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        map={nebulaTexture}
      />
    </points>
  );
};

// Component: Snowfall - 减少粒子数量以降低内存占用
const Snowfall = () => {
  // 移动端使用更少的雪花
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);
  const count = isMobile ? 50 : 150;
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 180;
      positions[i * 3 + 1] = Math.random() * 120 - 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 180;
      velocities[i] = 2 + Math.random() * 3;
    }

    return { positions, velocities };
  }, []);

  const snowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const cx = 64, cy = 64;

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const endX = cx + Math.cos(angle) * 50;
      const endY = cy + Math.sin(angle) * 50;
      ctx.lineTo(endX, endY);
      ctx.stroke();

      for (let j = 1; j <= 2; j++) {
        const branchDist = j * 18;
        const branchX = cx + Math.cos(angle) * branchDist;
        const branchY = cy + Math.sin(angle) * branchDist;
        const branchLen = 12 - j * 3;

        ctx.beginPath();
        ctx.moveTo(branchX, branchY);
        ctx.lineTo(
          branchX + Math.cos(angle + Math.PI / 4) * branchLen,
          branchY + Math.sin(angle + Math.PI / 4) * branchLen
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(branchX, branchY);
        ctx.lineTo(
          branchX + Math.cos(angle - Math.PI / 4) * branchLen,
          branchY + Math.sin(angle - Math.PI / 4) * branchLen
        );
        ctx.stroke();
      }
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i) - velocities[i] * delta;

      if (y < -50) {
        y = 90;
        posAttr.setX(i, (Math.random() - 0.5) * 180);
        posAttr.setZ(i, (Math.random() - 0.5) * 180);
      }

      const x = posAttr.getX(i) + Math.sin(time * 0.5 + i * 0.1) * delta * 3;
      const z = posAttr.getZ(i) + Math.cos(time * 0.4 + i * 0.1) * delta * 2;

      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#FFFFFF"
        size={8}
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        map={snowTexture}
      />
    </points>
  );
};

// Main Experience Component
interface ExperienceProps {
  sceneState: 'CHAOS' | 'FORMED';
  rotationSpeed: number;
  treeColor: string;
  decorations: DecorationSettings;
  customPhotos: string[];
  onPhotoClick?: (index: number) => void;
  particleCount: number;
  treeShape: string;
  lightColors: string[];
  giftConfig: GiftConfig;
  particleText?: string;
  particleTextColor?: string;
  particleFont?: string;
}

export const Experience: React.FC<ExperienceProps> = ({
  sceneState,
  rotationSpeed,
  treeColor,
  decorations,
  customPhotos,
  onPhotoClick,
  particleCount,
  treeShape,
  lightColors,
  giftConfig,
  particleText = '',
  particleTextColor,
  particleFont = '"Ma Shan Zheng", cursive',
}) => {
  const controlsRef = useRef<any>(null);

  // 检测移动端
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);

  // 移动端相机更近，FOV更大
  const cameraPosition: [number, number, number] = isMobile ? [0, 8, 55] : [0, 10, 75];
  const cameraFov = isMobile ? 60 : 50;
  const minDistance = isMobile ? 30 : 40;
  const maxDistance = isMobile ? 100 : 150;

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.setAzimuthalAngle(controlsRef.current.getAzimuthalAngle() + rotationSpeed);
      controlsRef.current.update();
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={cameraPosition} fov={cameraFov} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minDistance={minDistance}
        maxDistance={maxDistance}
        autoRotate={rotationSpeed === 0 && sceneState === 'FORMED'}
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 1.7}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      />

      <color attach="background" args={['#000300']} />
      {decorations.showStars && !isMobile && <Stars radius={100} depth={50} count={300} factor={3} saturation={0} fade speed={1} />}
      {decorations.showStars && isMobile && <Stars radius={80} depth={30} count={100} factor={2} saturation={0} fade speed={0.5} />}
      {/* 移动端不加载 Environment HDR 贴图，避免内存问题 */}
      {!isMobile && <Environment preset="night" background={false} />}

      <ambientLight intensity={isMobile ? 0.6 : 0.4} color="#003311" />
      <pointLight position={[30, 30, 30]} intensity={isMobile ? 50 : 100} color={CONFIG.colors.warmLight} />
      <pointLight position={[-30, 10, -30]} intensity={isMobile ? 25 : 50} color={CONFIG.colors.gold} />
      {!isMobile && <pointLight position={[0, -20, 10]} intensity={30} color="#ffffff" />}

      {decorations.showGoldenNebula && <GoldenNebula state={sceneState} />}
      {decorations.showSnow && (
        <>
          <Snowfall />
          <SnowGround />
          <ParticleOlaf position={[18, -12, 10]} scale={1.2} />
          <ParticleAnimals />
        </>
      )}

      {/* 粒子文字 */}
      {particleText && (
        <ParticleText
          text={particleText}
          color={particleTextColor || treeColor}
          state={sceneState}
          position={[0, 20, -35]}
          size={12}
          particleSize={0.2}
          fontFamily={particleFont}
        />
      )}

      <group position={[0, -6, 0]}>
        <Foliage state={sceneState} treeColor={treeColor} particleCount={particleCount} treeShape={treeShape} />
        <Suspense fallback={null}>
          {decorations.showPhotos && <PhotoOrnaments state={sceneState} customPhotos={customPhotos} onPhotoClick={onPhotoClick} />}
          {decorations.showGifts && <EnhancedGifts state={sceneState} config={giftConfig} />}
          {decorations.showGifts && <GiftPile state={sceneState} />}
          {decorations.showLights && <FairyLights state={sceneState} lightColors={lightColors} />}
          {decorations.showLights && <TopStar state={sceneState} color={lightColors[0]} />}
        </Suspense>
        {decorations.showSparkles && !isMobile && <Sparkles count={40} scale={50} size={4} speed={0.3} opacity={0.5} color={CONFIG.colors.gold} />}
        {decorations.showSparkles && isMobile && <Sparkles count={15} scale={40} size={3} speed={0.2} opacity={0.4} color={CONFIG.colors.gold} />}
      </group>
    </>
  );
};