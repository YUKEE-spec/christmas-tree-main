import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleTextProps {
  text: string;
  color: string;
  state: 'CHAOS' | 'FORMED';
  position?: [number, number, number];
  size?: number;
  particleSize?: number;
}

// 从 Canvas 获取文字像素点
const getTextPixels = (text: string, fontSize: number = 120): { x: number; y: number }[] => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // 使用更高级的字体组合
  // 优先使用装饰性字体，回退到系统字体
  // 优先使用花体/手写字体，回退到系统字体
  const fontFamily = '"Great Vibes", "Dancing Script", "Ma Shan Zheng", "Zhi Mang Xing", "Long Cang", "Playfair Display", "Georgia", "Times New Roman", "Noto Serif SC", "Source Han Serif CN", "SimSun", cursive, serif';

  // 设置字体
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);

  // 设置 canvas 大小
  canvas.width = Math.ceil(metrics.width) + 40;
  canvas.height = fontSize + 60;

  // 重新设置字体（canvas 大小改变后需要重设）
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = 'white';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  // 添加轻微阴影效果增加立体感
  ctx.shadowColor = 'white';
  ctx.shadowBlur = 2;

  // 绘制文字
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  // 获取像素数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels: { x: number; y: number }[] = [];

  // 采样间隔（控制粒子密度）
  const sampleStep = 2;

  for (let y = 0; y < canvas.height; y += sampleStep) {
    for (let x = 0; x < canvas.width; x += sampleStep) {
      const i = (y * canvas.width + x) * 4;
      // 检查像素是否有内容（alpha > 100）
      if (imageData.data[i + 3] > 100) {
        pixels.push({
          x: (x - canvas.width / 2) / fontSize,
          y: -(y - canvas.height / 2) / fontSize
        });
      }
    }
  }

  return pixels;
};

export const ParticleText: React.FC<ParticleTextProps> = ({
  text,
  color,
  state,
  position = [0, 25, -30],
  size = 15,
  particleSize = 0.25
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  // 生成粒子数据
  const { positions, targetPositions, randoms, count } = useMemo(() => {
    const pixels = getTextPixels(text);
    const count = pixels.length;

    const positions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // 初始位置：随机散开
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      // 目标位置：文字形状
      targetPositions[i * 3] = pixels[i].x * size;
      targetPositions[i * 3 + 1] = pixels[i].y * size;
      targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

      randoms[i] = Math.random();
    }

    return { positions, targetPositions, randoms, count };
  }, [text, size]);

  // 更新颜色
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(color);
    }
  }, [color]);

  // 动画
  useFrame((stateObj, delta) => {
    if (!pointsRef.current) return;

    const posAttr = pointsRef.current.geometry.attributes.position;
    const targetAttr = pointsRef.current.geometry.attributes.aTargetPos;
    const randomAttr = pointsRef.current.geometry.attributes.aRandom;
    const time = stateObj.clock.elapsedTime;
    const isFormed = state === 'FORMED';

    for (let i = 0; i < count; i++) {
      const tx = targetAttr.getX(i);
      const ty = targetAttr.getY(i);
      const tz = targetAttr.getZ(i);
      const rand = randomAttr.getX(i);

      const cx = posAttr.getX(i);
      const cy = posAttr.getY(i);
      const cz = posAttr.getZ(i);

      if (isFormed) {
        // 聚合到文字形状
        const wobble = Math.sin(time * 2 + rand * 10) * 0.03;
        posAttr.setXYZ(
          i,
          THREE.MathUtils.lerp(cx, tx + wobble, delta * 2),
          THREE.MathUtils.lerp(cy, ty + wobble, delta * 2),
          THREE.MathUtils.lerp(cz, tz, delta * 2)
        );
      } else {
        // 散开
        const chaosX = (rand - 0.5) * 100;
        const chaosY = (rand * 1.5 - 0.5) * 100;
        const chaosZ = ((rand * 2) % 1 - 0.5) * 50;
        posAttr.setXYZ(
          i,
          THREE.MathUtils.lerp(cx, chaosX, delta * 1.5),
          THREE.MathUtils.lerp(cy, chaosY, delta * 1.5),
          THREE.MathUtils.lerp(cz, chaosZ, delta * 1.5)
        );
      }
    }
    posAttr.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <group position={position}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aTargetPos" args={[targetPositions, 3]} />
          <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
        </bufferGeometry>
        <pointsMaterial
          ref={materialRef}
          color={color}
          size={particleSize}
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
