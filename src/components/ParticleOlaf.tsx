import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleOlafProps {
    position?: [number, number, number];
    scale?: number;
}

export const ParticleOlaf: React.FC<ParticleOlafProps> = ({ position = [15, -15, 10], scale = 1 }) => {
    const groupRef = useRef<THREE.Group>(null);

    // 生成 Olaf 的粒子数据
    const { particles } = useMemo(() => {
        const p: { pos: [number, number, number], color: string, size: number, speed: number }[] = [];

        // 辅助函数：生成球体粒子
        const addSphere = (center: [number, number, number], radius: number, count: number, color: string, size: number) => {
            for (let i = 0; i < count; i++) {
                const phi = Math.acos(-1 + (2 * i) / count);
                const theta = Math.sqrt(count * Math.PI) * phi;

                // 添加一些随机性，不那么完美
                const r = radius * (0.9 + Math.random() * 0.2);

                p.push({
                    pos: [
                        center[0] + r * Math.cos(theta) * Math.sin(phi),
                        center[1] + r * Math.sin(theta) * Math.sin(phi),
                        center[2] + r * Math.cos(phi)
                    ],
                    color,
                    size: size * (0.8 + Math.random() * 0.4),
                    speed: Math.random()
                });
            }
        };

        // 1. 底部大雪球 (身体)
        addSphere([0, 0, 0], 2.5, 400, '#ffffff', 0.25);

        // 2. 中间雪球 (胸部)
        addSphere([0, 3.5, 0], 1.8, 300, '#ffffff', 0.22);

        // 3. 头部 (椭圆，用球体变形模拟，这里简化)
        addSphere([0, 6.5, 0], 1.4, 250, '#ffffff', 0.2);

        // 4. 纽扣 (黑色粒子团)
        addSphere([0, 3.5, 1.6], 0.3, 30, '#1a1a1a', 0.15); // 胸扣
        addSphere([0, 0.5, 2.3], 0.35, 40, '#1a1a1a', 0.15); // 肚扣

        // 5. 眼睛
        addSphere([-0.5, 7, 1.2], 0.25, 20, '#1a1a1a', 0.15);
        addSphere([0.5, 7, 1.2], 0.25, 20, '#1a1a1a', 0.15);

        // 6. 鼻子 (橙色胡萝卜)
        // 需要旋转一下方向，这里简化直接用坐标堆叠
        for (let i = 0; i < 60; i++) {
            const t = i / 60;
            const r = 0.3 * (1 - t);
            const angle = Math.random() * Math.PI * 2;
            const rad = Math.random() * r;
            p.push({
                pos: [
                    rad * Math.cos(angle),
                    6.5 + rad * Math.sin(angle),
                    1.4 + t * 2 // 向前伸出 2 单位
                ],
                color: '#ff8800',
                size: 0.2,
                speed: Math.random()
            })
        }

        // 7. 树枝头发
        for (let i = 0; i < 30; i++) {
            p.push({
                pos: [
                    (Math.random() - 0.5) * 0.5,
                    7.8 + Math.random() * 1.5,
                    (Math.random() - 0.5) * 0.5
                ],
                color: '#5d4037',
                size: 0.1,
                speed: Math.random()
            });
        }

        // 8. 树枝手臂 (简化为两团长条粒子)
        // 左臂
        for (let i = 0; i < 50; i++) {
            p.push({
                pos: [-2 - Math.random() * 2, 4 + Math.random(), 0 + Math.random() * 0.5],
                color: '#5d4037',
                size: 0.12,
                speed: Math.random()
            });
        }
        // 右臂
        for (let i = 0; i < 50; i++) {
            p.push({
                pos: [2 + Math.random() * 2, 4 + Math.random(), 0 + Math.random() * 0.5],
                color: '#5d4037',
                size: 0.12,
                speed: Math.random()
            });
        }

        return { particles: p };
    }, []);

    const positions = useMemo(() => {
        const pos = new Float32Array(particles.length * 3);
        particles.forEach((p, i) => {
            pos[i * 3] = p.pos[0];
            pos[i * 3 + 1] = p.pos[1];
            pos[i * 3 + 2] = p.pos[2];
        });
        return pos;
    }, [particles]);

    const colors = useMemo(() => {
        const cols = new Float32Array(particles.length * 3);
        const colorObj = new THREE.Color();
        particles.forEach((p, i) => {
            colorObj.set(p.color);
            cols[i * 3] = colorObj.r;
            cols[i * 3 + 1] = colorObj.g;
            cols[i * 3 + 2] = colorObj.b;
        });
        return cols;
    }, [particles]);

    const sizes = useMemo(() => {
        return new Float32Array(particles.map(p => p.size));
    }, [particles]);

    useFrame((state) => {
        if (groupRef.current) {
            const t = state.clock.elapsedTime;
            // 整体欢乐摇摆
            groupRef.current.rotation.z = Math.sin(t * 2) * 0.05;
            groupRef.current.rotation.y = Math.sin(t * 1.5) * 0.05;
            groupRef.current.position.y = position[1] + Math.sin(t * 3) * 0.2; // 上下跳动
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[colors, 3]} />
                    <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
                </bufferGeometry>
                {/* @ts-ignore */}
                <pointsMaterial
                    vertexColors
                    size={1}
                    sizeAttenuation
                    transparent
                    opacity={0.9}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    );
};
