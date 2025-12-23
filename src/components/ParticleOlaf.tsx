import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleOlafProps {
    position?: [number, number, number];
    scale?: number;
}

export const ParticleOlaf: React.FC<ParticleOlafProps> = ({ position = [18, -12, 12], scale = 1 }) => {
    const groupRef = useRef<THREE.Group>(null);

    const { positions, colors } = useMemo(() => {
        const particles: { x: number; y: number; z: number; color: THREE.Color }[] = [];

        // 颜色定义
        const snowWhite = new THREE.Color('#ffffff');
        const snowBlue = new THREE.Color('#e8f4fc');
        const eyeBlack = new THREE.Color('#0a0a0a');
        const eyeBrow = new THREE.Color('#4a3c31');
        const carrotOrange = new THREE.Color('#ff6b00');
        const carrotTip = new THREE.Color('#ff8c00');
        const stickBrown = new THREE.Color('#5d4037');
        const stickDark = new THREE.Color('#3e2723');
        const toothWhite = new THREE.Color('#fffef0');

        // 辅助函数：生成填充球体
        const addSphere = (
            center: [number, number, number],
            rx: number, ry: number, rz: number,
            count: number,
            color: THREE.Color
        ) => {
            for (let i = 0; i < count; i++) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = Math.cbrt(Math.random());

                particles.push({
                    x: center[0] + r * rx * Math.sin(phi) * Math.cos(theta),
                    y: center[1] + r * ry * Math.sin(phi) * Math.sin(theta),
                    z: center[2] + r * rz * Math.cos(phi),
                    color: color.clone()
                });
            }
        };

        // 辅助函数：表面粒子（雪花效果）
        const addSnowSurface = (
            center: [number, number, number],
            rx: number, ry: number, rz: number,
            count: number
        ) => {
            for (let i = 0; i < count; i++) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = 0.95 + Math.random() * 0.1;

                particles.push({
                    x: center[0] + r * rx * Math.sin(phi) * Math.cos(theta),
                    y: center[1] + r * ry * Math.sin(phi) * Math.sin(theta),
                    z: center[2] + r * rz * Math.cos(phi),
                    color: Math.random() > 0.5 ? snowWhite.clone() : snowBlue.clone()
                });
            }
        };

        // ========== 雪宝身体 ==========

        // 底部大雪球 (屁股)
        addSphere([0, 0, 0], 2.8, 2.5, 2.5, 1200, snowWhite);
        addSnowSurface([0, 0, 0], 3.0, 2.7, 2.7, 400);

        // 中间小一点的雪球 (肚子)
        addSphere([0, 4.0, 0], 2.0, 1.8, 1.8, 800, snowWhite);
        addSnowSurface([0, 4.0, 0], 2.2, 2.0, 2.0, 300);

        // 头部 (略扁的椭圆)
        addSphere([0, 7.2, 0], 1.8, 1.6, 1.5, 700, snowWhite);
        addSnowSurface([0, 7.2, 0], 1.9, 1.7, 1.6, 250);

        // ========== 面部特征 ==========

        // 眼睛 - 大而圆，黑色（雪宝标志性的大眼睛）
        // 左眼
        addSphere([-0.6, 7.5, 1.3], 0.28, 0.32, 0.15, 80, eyeBlack);
        // 右眼
        addSphere([0.6, 7.5, 1.3], 0.28, 0.32, 0.15, 80, eyeBlack);

        // 眉毛 - 用树枝一样的深棕色
        for (let i = 0; i < 40; i++) {
            const t = Math.random();
            particles.push({
                x: -0.6 - 0.3 + t * 0.6,
                y: 7.9 + Math.sin(t * Math.PI) * 0.15,
                z: 1.3 + Math.random() * 0.1,
                color: eyeBrow.clone()
            });
        }
        for (let i = 0; i < 40; i++) {
            const t = Math.random();
            particles.push({
                x: 0.6 - 0.3 + t * 0.6,
                y: 7.9 + Math.sin(t * Math.PI) * 0.15,
                z: 1.3 + Math.random() * 0.1,
                color: eyeBrow.clone()
            });
        }

        // 胡萝卜鼻子 (锥形向前)
        for (let i = 0; i < 150; i++) {
            const t = i / 150; // 0到1
            const radius = 0.35 * (1 - t * 0.85);
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * radius;

            particles.push({
                x: r * Math.cos(angle),
                y: 7.0 + r * Math.sin(angle) * 0.3,
                z: 1.5 + t * 2.5,
                color: t < 0.7 ? carrotOrange.clone() : carrotTip.clone()
            });
        }

        // 嘴巴 - 微笑弧线
        for (let i = 0; i < 60; i++) {
            const t = i / 60;
            const angle = -Math.PI * 0.3 + t * Math.PI * 0.6;
            particles.push({
                x: Math.cos(angle) * 0.8,
                y: 6.3 + Math.sin(angle) * 0.3,
                z: 1.3 + Math.random() * 0.05,
                color: stickDark.clone()
            });
        }

        // 牙齿 (雪宝标志性的大门牙)
        addSphere([0, 6.4, 1.4], 0.25, 0.2, 0.1, 40, toothWhite);

        // ========== 头顶树枝头发 ==========
        // 三根主要的树枝
        for (let branch = 0; branch < 3; branch++) {
            const baseX = (branch - 1) * 0.4;
            for (let i = 0; i < 50; i++) {
                const t = i / 50;
                particles.push({
                    x: baseX + (Math.random() - 0.5) * 0.15,
                    y: 8.8 + t * 1.8 + Math.random() * 0.2,
                    z: (Math.random() - 0.5) * 0.15,
                    color: t < 0.7 ? stickBrown.clone() : stickDark.clone()
                });
            }
        }

        // ========== 纽扣 ==========
        // 胸口两颗
        addSphere([0, 4.5, 1.8], 0.22, 0.22, 0.15, 50, stickDark);
        addSphere([0, 3.5, 1.9], 0.22, 0.22, 0.15, 50, stickDark);
        // 肚子一颗
        addSphere([0, 1.0, 2.3], 0.25, 0.25, 0.15, 50, stickDark);

        // ========== 树枝手臂 ==========
        // 左臂 (向外伸展)
        for (let i = 0; i < 80; i++) {
            const t = i / 80;
            particles.push({
                x: -2.0 - t * 2.5,
                y: 4.5 + Math.sin(t * Math.PI * 0.5) * 0.5 + (Math.random() - 0.5) * 0.2,
                z: 0.5 + t * 0.8 + (Math.random() - 0.5) * 0.2,
                color: stickBrown.clone()
            });
        }
        // 左手指（分叉）
        for (let finger = 0; finger < 3; finger++) {
            for (let i = 0; i < 20; i++) {
                const t = i / 20;
                const angle = (finger - 1) * 0.4;
                particles.push({
                    x: -4.5 - t * 0.8,
                    y: 4.8 + Math.sin(angle) * t * 0.5,
                    z: 1.3 + Math.cos(angle) * t * 0.5,
                    color: stickDark.clone()
                });
            }
        }

        // 右臂
        for (let i = 0; i < 80; i++) {
            const t = i / 80;
            particles.push({
                x: 2.0 + t * 2.5,
                y: 4.5 + Math.sin(t * Math.PI * 0.5) * 0.5 + (Math.random() - 0.5) * 0.2,
                z: 0.5 + t * 0.8 + (Math.random() - 0.5) * 0.2,
                color: stickBrown.clone()
            });
        }
        // 右手指
        for (let finger = 0; finger < 3; finger++) {
            for (let i = 0; i < 20; i++) {
                const t = i / 20;
                const angle = (finger - 1) * 0.4;
                particles.push({
                    x: 4.5 + t * 0.8,
                    y: 4.8 + Math.sin(angle) * t * 0.5,
                    z: 1.3 + Math.cos(angle) * t * 0.5,
                    color: stickDark.clone()
                });
            }
        }

        // ========== 雪脚 ==========
        // 左脚
        addSphere([-1.2, -2.5, 0.5], 0.8, 0.5, 1.0, 150, snowWhite);
        // 右脚
        addSphere([1.2, -2.5, 0.5], 0.8, 0.5, 1.0, 150, snowWhite);

        // 转换为 Float32Array
        const posArray = new Float32Array(particles.length * 3);
        const colArray = new Float32Array(particles.length * 3);

        particles.forEach((pt, i) => {
            posArray[i * 3] = pt.x;
            posArray[i * 3 + 1] = pt.y;
            posArray[i * 3 + 2] = pt.z;

            colArray[i * 3] = pt.color.r;
            colArray[i * 3 + 1] = pt.color.g;
            colArray[i * 3 + 2] = pt.color.b;
        });

        return { positions: posArray, colors: colArray };
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            const t = state.clock.elapsedTime;
            // 欢乐摇摆
            groupRef.current.rotation.z = Math.sin(t * 2.5) * 0.08;
            groupRef.current.rotation.y = Math.sin(t * 1.5) * 0.1;
            // 上下弹跳
            groupRef.current.position.y = position[1] + Math.sin(t * 3) * 0.3;
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale * 0.6}>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[colors, 3]} />
                </bufferGeometry>
                <pointsMaterial
                    vertexColors
                    size={0.18}
                    sizeAttenuation
                    transparent
                    opacity={0.95}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    );
};
