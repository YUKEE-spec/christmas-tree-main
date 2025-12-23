import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SnowGroundProps {
    opacity?: number;
}

export const SnowGround: React.FC<SnowGroundProps> = ({ opacity = 0.5 }) => {
    const pointsRef = useRef<THREE.Points>(null);

    // 生成地面粒子
    const { positions, randoms } = useMemo(() => {
        const count = 3000;
        const positions = new Float32Array(count * 3);
        const randoms = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // 在圆盘范围内随机分布
            const radius = 40 + Math.random() * 60; // 40-100 范围
            const angle = Math.random() * Math.PI * 2;

            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            // 地面稍微起伏
            const y = -20 + (Math.random() - 0.5) * 2;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            randoms[i] = Math.random();
        }

        return { positions, randoms };
    }, []);

    useFrame((state) => {
        if (pointsRef.current && pointsRef.current.material instanceof THREE.PointsMaterial) {
            // 简单的呼吸闪烁效果
            const time = state.clock.elapsedTime;
            // pointsRef.current.material.opacity = opacity + Math.sin(time) * 0.1;
            // 旋转地面
            pointsRef.current.rotation.y = time * 0.02;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
            </bufferGeometry>
            <pointsMaterial
                color="#ffffff"
                size={0.8}
                transparent
                opacity={opacity}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};
