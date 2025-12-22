import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GIFT_PRESETS } from './GiftConfig';
import type { GiftConfig, GiftType } from './GiftConfig';

// 获取螺旋位置的辅助函数
const getSpiralPosition = (index: number, total: number) => {
  const h = 32;
  const rBase = 14;
  const t = index / total;
  const y = t * h - (h / 2);
  const normalizedY = t;
  const coneRadius = rBase * (1 - normalizedY * 0.95);
  const spiralAngle = t * 5 * Math.PI * 2;
  const angleOffset = (Math.random() - 0.5) * 0.3;
  const theta = spiralAngle + angleOffset;
  const radiusFactor = 0.9 + Math.random() * 0.1;
  const r = coneRadius * radiusFactor;
  const noise = (Math.random() - 0.5) * 0.2;
  return new THREE.Vector3(r * Math.cos(theta) + noise, y + (Math.random() - 0.5) * 0.5, r * Math.sin(theta) + noise);
};

const getRandomPosition = () => {
  const h = 32, rBase = 14;
  const y = (Math.random() - 0.5) * h;
  const normalizedY = (y + h/2) / h;
  const coneRadius = rBase * (1 - normalizedY * 0.95);
  const theta = Math.random() * Math.PI * 2;
  const r = Math.random() * coneRadius;
  return new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta));
};

const getLayeredPosition = (index: number, total: number) => {
  const h = 32, rBase = 14, layers = 5;
  const layer = Math.floor((index / total) * layers);
  const layerY = -h/2 + (layer / (layers - 1)) * h;
  const layerRadius = rBase * (1 - (layer / layers) * 0.95);
  const itemsInLayer = Math.ceil(total / layers);
  const angleStep = (Math.PI * 2) / itemsInLayer;
  const angle = (index % itemsInLayer) * angleStep + Math.random() * 0.5;
  const r = layerRadius * (0.3 + Math.random() * 0.7);
  return new THREE.Vector3(r * Math.cos(angle), layerY + (Math.random() - 0.5) * 2, r * Math.sin(angle));
};

const getClusteredPosition = () => {
  const h = 32, rBase = 14, clusters = 3;
  const cluster = Math.floor(Math.random() * clusters);
  const clusterY = -h/2 + (cluster / (clusters - 1)) * h;
  const clusterRadius = rBase * (1 - (cluster / clusters) * 0.95);
  const angle = Math.random() * Math.PI * 2;
  const r = Math.random() * clusterRadius * 0.5;
  return new THREE.Vector3(r * Math.cos(angle), clusterY + (Math.random() - 0.5) * 4, r * Math.sin(angle));
};

const getPositionByDistribution = (distribution: string, index: number, total: number) => {
  switch (distribution) {
    case 'random': return getRandomPosition();
    case 'layered': return getLayeredPosition(index, total);
    case 'clustered': return getClusteredPosition();
    default: return getSpiralPosition(index, total);
  }
};

// 圣诞礼盒组件
const ChristmasGiftBox: React.FC<{ color: string; size: number; brightness: number }> = ({ color, size, brightness }) => {
  const ribbonColor = color === '#FFD700' ? '#DC143C' : '#FFD700';
  return (
    <group scale={[size, size * 0.8, size]}>
      <mesh><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color={color} roughness={0.4} metalness={0.3} emissive={color} emissiveIntensity={0.15 * brightness} /></mesh>
      <mesh><boxGeometry args={[1.02, 0.1, 1.02]} /><meshStandardMaterial color={ribbonColor} roughness={0.3} metalness={0.5} emissive={ribbonColor} emissiveIntensity={0.3 * brightness} /></mesh>
      <mesh><boxGeometry args={[0.1, 1.02, 1.02]} /><meshStandardMaterial color={ribbonColor} roughness={0.3} metalness={0.5} emissive={ribbonColor} emissiveIntensity={0.3 * brightness} /></mesh>
      <mesh position={[0, 0.55, 0]}><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial color={ribbonColor} roughness={0.3} metalness={0.5} emissive={ribbonColor} emissiveIntensity={0.4 * brightness} /></mesh>
      <mesh position={[-0.15, 0.55, 0]} rotation={[0, 0, 0.3]}><sphereGeometry args={[0.12, 8, 8]} /><meshStandardMaterial color={ribbonColor} roughness={0.3} metalness={0.5} emissive={ribbonColor} emissiveIntensity={0.4 * brightness} /></mesh>
      <mesh position={[0.15, 0.55, 0]} rotation={[0, 0, -0.3]}><sphereGeometry args={[0.12, 8, 8]} /><meshStandardMaterial color={ribbonColor} roughness={0.3} metalness={0.5} emissive={ribbonColor} emissiveIntensity={0.4 * brightness} /></mesh>
    </group>
  );
};

// 圣诞帽组件
const ChristmasHat: React.FC<{ size: number; brightness: number }> = ({ size, brightness }) => (
  <group scale={[size, size, size]}>
    {/* 帽身 - 红色锥形 */}
    <mesh position={[0, 0.5, 0]}>
      <coneGeometry args={[0.5, 1.3, 16]} />
      <meshStandardMaterial color="#DC143C" roughness={0.8} emissive="#DC143C" emissiveIntensity={0.1 * brightness} />
    </mesh>
    {/* 帽檐 - 白色毛边圆环，紧贴锥形底部 */}
    <mesh position={[0, -0.12, 0]}>
      <cylinderGeometry args={[0.55, 0.55, 0.2, 16]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.9} emissive="#FFFFFF" emissiveIntensity={0.15 * brightness} />
    </mesh>
    {/* 帽顶 - 白色绒球 */}
    <mesh position={[0.15, 1.1, 0.1]}>
      <sphereGeometry args={[0.18, 12, 12]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.9} emissive="#FFFFFF" emissiveIntensity={0.2 * brightness} />
    </mesh>
  </group>
);

// 圣诞袜组件
const ChristmasSock: React.FC<{ size: number; brightness: number }> = ({ size, brightness }) => (
  <group scale={[size, size, size]}>
    {/* 袜筒 - 垂直部分 */}
    <mesh position={[0, 0.4, 0]}>
      <cylinderGeometry args={[0.22, 0.28, 0.9, 12]} />
      <meshStandardMaterial color="#DC143C" roughness={0.7} emissive="#DC143C" emissiveIntensity={0.1 * brightness} />
    </mesh>
    {/* 袜口 - 白色毛边 */}
    <mesh position={[0, 0.88, 0]}>
      <cylinderGeometry args={[0.26, 0.24, 0.18, 12]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.9} emissive="#FFFFFF" emissiveIntensity={0.15 * brightness} />
    </mesh>
    {/* 袜跟 - 连接部分 */}
    <mesh position={[0.1, -0.05, 0]}>
      <sphereGeometry args={[0.28, 12, 12]} />
      <meshStandardMaterial color="#DC143C" roughness={0.7} emissive="#DC143C" emissiveIntensity={0.1 * brightness} />
    </mesh>
    {/* 袜脚 - 水平部分 */}
    <mesh position={[0.35, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.2, 0.25, 0.5, 12]} />
      <meshStandardMaterial color="#DC143C" roughness={0.7} emissive="#DC143C" emissiveIntensity={0.1 * brightness} />
    </mesh>
    {/* 袜尖 */}
    <mesh position={[0.6, -0.05, 0]}>
      <sphereGeometry args={[0.2, 12, 12]} />
      <meshStandardMaterial color="#DC143C" roughness={0.7} emissive="#DC143C" emissiveIntensity={0.1 * brightness} />
    </mesh>
    {/* 装饰 - 绿色条纹 */}
    <mesh position={[0, 0.55, 0]}>
      <cylinderGeometry args={[0.24, 0.24, 0.06, 12]} />
      <meshStandardMaterial color="#228B22" roughness={0.6} emissive="#228B22" emissiveIntensity={0.1 * brightness} />
    </mesh>
    <mesh position={[0, 0.25, 0]}>
      <cylinderGeometry args={[0.27, 0.27, 0.06, 12]} />
      <meshStandardMaterial color="#228B22" roughness={0.6} emissive="#228B22" emissiveIntensity={0.1 * brightness} />
    </mesh>
  </group>
);

// 姜饼人组件
const GingerbreadMan: React.FC<{ size: number; brightness: number }> = ({ size, brightness }) => (
  <group scale={[size, size, size]}>
    <mesh position={[0, 0.3, 0]}><sphereGeometry args={[0.25, 12, 12]} /><meshStandardMaterial color="#D2691E" roughness={0.8} emissive="#D2691E" emissiveIntensity={0.15 * brightness} /></mesh>
    <mesh position={[0, -0.1, 0]}><capsuleGeometry args={[0.2, 0.4, 8, 12]} /><meshStandardMaterial color="#D2691E" roughness={0.8} emissive="#D2691E" emissiveIntensity={0.15 * brightness} /></mesh>
    <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 4]}><capsuleGeometry args={[0.08, 0.25, 6, 8]} /><meshStandardMaterial color="#D2691E" roughness={0.8} emissive="#D2691E" emissiveIntensity={0.15 * brightness} /></mesh>
    <mesh position={[0.3, 0, 0]} rotation={[0, 0, -Math.PI / 4]}><capsuleGeometry args={[0.08, 0.25, 6, 8]} /><meshStandardMaterial color="#D2691E" roughness={0.8} emissive="#D2691E" emissiveIntensity={0.15 * brightness} /></mesh>
    <mesh position={[-0.12, -0.5, 0]}><capsuleGeometry args={[0.08, 0.2, 6, 8]} /><meshStandardMaterial color="#D2691E" roughness={0.8} emissive="#D2691E" emissiveIntensity={0.15 * brightness} /></mesh>
    <mesh position={[0.12, -0.5, 0]}><capsuleGeometry args={[0.08, 0.2, 6, 8]} /><meshStandardMaterial color="#D2691E" roughness={0.8} emissive="#D2691E" emissiveIntensity={0.15 * brightness} /></mesh>
    <mesh position={[-0.08, 0.35, 0.2]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.3 * brightness} /></mesh>
    <mesh position={[0.08, 0.35, 0.2]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.3 * brightness} /></mesh>
    <mesh position={[0, 0, 0.18]}><sphereGeometry args={[0.03, 8, 8]} /><meshStandardMaterial color="#DC143C" emissive="#DC143C" emissiveIntensity={0.2 * brightness} /></mesh>
    <mesh position={[0, -0.15, 0.18]}><sphereGeometry args={[0.03, 8, 8]} /><meshStandardMaterial color="#DC143C" emissive="#DC143C" emissiveIntensity={0.2 * brightness} /></mesh>
  </group>
);


// 圣诞铃铛组件
const ChristmasBell: React.FC<{ size: number; brightness: number }> = ({ size, brightness }) => (
  <group scale={[size, size, size]}>
    {/* 铃铛主体 - 上窄下宽的钟形 */}
    <mesh position={[0, 0.1, 0]}>
      <cylinderGeometry args={[0.15, 0.4, 0.6, 16]} />
      <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={0.9} emissive="#FFD700" emissiveIntensity={0.3 * brightness} />
    </mesh>
    {/* 铃铛顶部圆顶 */}
    <mesh position={[0, 0.4, 0]}>
      <sphereGeometry args={[0.15, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={0.9} emissive="#FFD700" emissiveIntensity={0.3 * brightness} />
    </mesh>
    {/* 铃铛底部边缘加厚 */}
    <mesh position={[0, -0.2, 0]}>
      <torusGeometry args={[0.38, 0.06, 8, 16]} />
      <meshStandardMaterial color="#FFD700" roughness={0.1} metalness={0.9} emissive="#FFD700" emissiveIntensity={0.35 * brightness} />
    </mesh>
    {/* 铃舌 */}
    <mesh position={[0, -0.1, 0]}>
      <sphereGeometry args={[0.1, 10, 10]} />
      <meshStandardMaterial color="#B8860B" roughness={0.2} metalness={0.8} emissive="#B8860B" emissiveIntensity={0.2 * brightness} />
    </mesh>
    {/* 蝴蝶结 - 左边 */}
    <mesh position={[-0.18, 0.5, 0]} rotation={[0, 0, 0.5]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#DC143C" roughness={0.5} emissive="#DC143C" emissiveIntensity={0.25 * brightness} />
    </mesh>
    {/* 蝴蝶结 - 右边 */}
    <mesh position={[0.18, 0.5, 0]} rotation={[0, 0, -0.5]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#DC143C" roughness={0.5} emissive="#DC143C" emissiveIntensity={0.25 * brightness} />
    </mesh>
    {/* 蝴蝶结 - 中心 */}
    <mesh position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial color="#DC143C" roughness={0.5} emissive="#DC143C" emissiveIntensity={0.25 * brightness} />
    </mesh>
  </group>
);

// 拐杖糖组件
const CandyCane: React.FC<{ size: number; brightness: number }> = ({ size, brightness }) => (
  <group scale={[size, size, size]} rotation={[0, 0, 0.3]}>
    <mesh><cylinderGeometry args={[0.08, 0.08, 1.2, 12]} /><meshStandardMaterial color="#FFFFFF" roughness={0.3} emissive="#FFFFFF" emissiveIntensity={0.1 * brightness} /></mesh>
    {[0, 1, 2, 3, 4].map((i) => (
      <mesh key={i} position={[0, -0.5 + i * 0.25, 0]}><cylinderGeometry args={[0.085, 0.085, 0.08, 12]} /><meshStandardMaterial color="#FF0000" roughness={0.3} emissive="#FF0000" emissiveIntensity={0.15 * brightness} /></mesh>
    ))}
    <mesh position={[0.12, 0.5, 0]}><sphereGeometry args={[0.1, 12, 12]} /><meshStandardMaterial color="#FF0000" roughness={0.3} emissive="#FF0000" emissiveIntensity={0.15 * brightness} /></mesh>
    <mesh position={[0.2, 0.45, 0]}><sphereGeometry args={[0.08, 12, 12]} /><meshStandardMaterial color="#FFFFFF" roughness={0.3} emissive="#FFFFFF" emissiveIntensity={0.1 * brightness} /></mesh>
    <mesh position={[0.25, 0.38, 0]}><sphereGeometry args={[0.07, 12, 12]} /><meshStandardMaterial color="#FF0000" roughness={0.3} emissive="#FF0000" emissiveIntensity={0.15 * brightness} /></mesh>
  </group>
);

// 根据礼物类型渲染对应组件
const GiftItem: React.FC<{ giftType: GiftType; brightness: number }> = ({ giftType, brightness }) => {
  const { id, color, size } = giftType;
  
  switch (id) {
    case 'christmas-hat':
      return <ChristmasHat size={size} brightness={brightness} />;
    case 'christmas-sock':
      return <ChristmasSock size={size} brightness={brightness} />;
    case 'gingerbread-man':
      return <GingerbreadMan size={size} brightness={brightness} />;
    case 'christmas-bell':
      return <ChristmasBell size={size} brightness={brightness} />;
    case 'candy-cane':
      return <CandyCane size={size} brightness={brightness} />;
    default:
      // 礼盒类型
      return <ChristmasGiftBox color={color} size={size} brightness={brightness} />;
  }
};

interface EnhancedGiftsProps {
  state: 'CHAOS' | 'FORMED';
  config: GiftConfig;
}

export const EnhancedGifts: React.FC<EnhancedGiftsProps> = ({ state, config }) => {
  const groupRef = useRef<THREE.Group>(null);

  const allGiftTypes = useMemo(() => [...GIFT_PRESETS, ...config.customTypes], [config.customTypes]);
  const selectedGiftTypes = useMemo(() => allGiftTypes.filter(gift => config.selectedTypes.includes(gift.id)), [allGiftTypes, config.selectedTypes]);

  const giftData = useMemo(() => {
    if (!config.enabled || selectedGiftTypes.length === 0) return [];
    return new Array(config.count).fill(0).map((_, i) => ({
      chaosPos: new THREE.Vector3((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60),
      targetPos: getPositionByDistribution(config.distribution, i, config.count),
      currentPos: new THREE.Vector3((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60),
      giftType: selectedGiftTypes[i % selectedGiftTypes.length],
      rotationSpeed: { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5, z: (Math.random() - 0.5) * 0.5 },
      wobbleOffset: Math.random() * 10,
      wobbleSpeed: 0.5 + Math.random() * 0.5,
      floatOffset: Math.random() * Math.PI * 2,
      floatSpeed: 0.3 + Math.random() * 0.4,
      chaosRotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
    }));
  }, [config, selectedGiftTypes]);

  useFrame((stateObj, delta) => {
    if (!groupRef.current || giftData.length === 0) return;
    const isFormed = state === 'FORMED';
    const time = stateObj.clock.elapsedTime;
    
    groupRef.current.children.forEach((child, i) => {
      if (i >= giftData.length) return;
      const group = child as THREE.Group;
      const objData = giftData[i];
      const target = isFormed ? objData.targetPos : objData.chaosPos;
      
      objData.currentPos.lerp(target, delta * 1.2);
      group.position.copy(objData.currentPos);
      
      if (isFormed) {
        if (config.animation.floating) {
          group.position.y += Math.sin(time * objData.floatSpeed + objData.floatOffset) * 0.3;
        }
        if (config.animation.wobble) {
          group.rotation.x += Math.sin(time * objData.wobbleSpeed + objData.wobbleOffset) * 0.02;
          group.rotation.z += Math.cos(time * objData.wobbleSpeed * 0.8 + objData.wobbleOffset) * 0.02;
        }
        if (config.animation.rotation) {
          group.rotation.y += delta * objData.rotationSpeed.y;
        }
      } else {
        group.rotation.x += delta * objData.rotationSpeed.x;
        group.rotation.y += delta * objData.rotationSpeed.y;
        group.rotation.z += delta * objData.rotationSpeed.z;
      }
    });
  });

  if (!config.enabled || giftData.length === 0) return null;

  return (
    <group ref={groupRef}>
      {giftData.map((data, i) => (
        <group key={i} rotation={data.chaosRotation}>
          <GiftItem giftType={data.giftType} brightness={config.brightness} />
        </group>
      ))}
    </group>
  );
};
