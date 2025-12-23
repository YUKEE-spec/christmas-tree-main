import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AnimalProps {
    type: 'samoyed' | 'kitten';
    startAngle: number;
    radius: number;
    speed: number;
    yOffset: number;
}

// 辅助函数：生成球体粒子
const generateSphere = (
    center: [number, number, number],
    radiusX: number,
    radiusY: number,
    radiusZ: number,
    count: number,
    color: THREE.Color
) => {
    const particles: { x: number; y: number; z: number; color: THREE.Color }[] = [];
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.cbrt(Math.random()); // 均匀填充

        particles.push({
            x: center[0] + r * radiusX * Math.sin(phi) * Math.cos(theta),
            y: center[1] + r * radiusY * Math.sin(phi) * Math.sin(theta),
            z: center[2] + r * radiusZ * Math.cos(phi),
            color: color.clone()
        });
    }
    return particles;
};

// 辅助函数：添加毛茸茸效果
const addFluffyLayer = (
    particles: { x: number; y: number; z: number; color: THREE.Color }[],
    center: [number, number, number],
    baseRadius: number,
    count: number,
    color: THREE.Color
) => {
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = baseRadius * (0.9 + Math.random() * 0.3); // 外层毛发

        particles.push({
            x: center[0] + r * Math.sin(phi) * Math.cos(theta),
            y: center[1] + r * Math.sin(phi) * Math.sin(theta),
            z: center[2] + r * Math.cos(phi),
            color: color.clone()
        });
    }
};

const Animal: React.FC<AnimalProps> = ({ type, startAngle, radius, speed, yOffset }) => {
    const groupRef = useRef<THREE.Group>(null);

    const { positions, colors } = useMemo(() => {
        const isDog = type === 'samoyed';
        const particles: { x: number; y: number; z: number; color: THREE.Color }[] = [];

        // 颜色定义
        const furWhite = new THREE.Color('#fffef5');
        const furCream = new THREE.Color('#f5e6d3');
        const noseBlack = new THREE.Color('#1a1a1a');
        const eyeBlack = new THREE.Color('#0a0a0a');
        const tongueRed = new THREE.Color('#ff6b6b');
        const scarfRed = new THREE.Color('#b22222');
        const scarfDarkRed = new THREE.Color('#8b0000');

        if (isDog) {
            // ============ 萨摩耶 ============
            const scale = 1.2;

            // 身体 (大椭球，蓬松)
            particles.push(...generateSphere([0, 0, 0], 2.5 * scale, 2 * scale, 1.8 * scale, 1500, furWhite));
            addFluffyLayer(particles, [0, 0, 0], 2.8 * scale, 500, furCream);

            // 头部 (圆形，位于身体前上方)
            const headCenter: [number, number, number] = [2.5 * scale, 1.5 * scale, 0];
            particles.push(...generateSphere(headCenter, 1.5 * scale, 1.4 * scale, 1.3 * scale, 800, furWhite));
            addFluffyLayer(particles, headCenter, 1.6 * scale, 300, furCream);

            // 耳朵 (两个三角形区域)
            // 左耳
            for (let i = 0; i < 150; i++) {
                const t = Math.random();
                particles.push({
                    x: headCenter[0] - 0.3 * scale + Math.random() * 0.3 * scale,
                    y: headCenter[1] + 1.2 * scale + t * 0.8 * scale,
                    z: headCenter[2] - 0.8 * scale - t * 0.3 * scale,
                    color: furWhite.clone()
                });
            }
            // 右耳
            for (let i = 0; i < 150; i++) {
                const t = Math.random();
                particles.push({
                    x: headCenter[0] - 0.3 * scale + Math.random() * 0.3 * scale,
                    y: headCenter[1] + 1.2 * scale + t * 0.8 * scale,
                    z: headCenter[2] + 0.8 * scale + t * 0.3 * scale,
                    color: furWhite.clone()
                });
            }

            // 鼻子 (黑色小球)
            particles.push(...generateSphere(
                [headCenter[0] + 1.3 * scale, headCenter[1] - 0.2 * scale, 0],
                0.25 * scale, 0.2 * scale, 0.2 * scale, 100, noseBlack
            ));

            // 眼睛 (两个黑色小球)
            particles.push(...generateSphere(
                [headCenter[0] + 0.8 * scale, headCenter[1] + 0.3 * scale, -0.5 * scale],
                0.15 * scale, 0.15 * scale, 0.1 * scale, 60, eyeBlack
            ));
            particles.push(...generateSphere(
                [headCenter[0] + 0.8 * scale, headCenter[1] + 0.3 * scale, 0.5 * scale],
                0.15 * scale, 0.15 * scale, 0.1 * scale, 60, eyeBlack
            ));

            // 嘴巴/舌头 (粉红色)
            particles.push(...generateSphere(
                [headCenter[0] + 1.1 * scale, headCenter[1] - 0.5 * scale, 0],
                0.15 * scale, 0.3 * scale, 0.15 * scale, 80, tongueRed
            ));

            // 前腿 (两条)
            for (let leg = -1; leg <= 1; leg += 2) {
                for (let i = 0; i < 200; i++) {
                    const t = Math.random();
                    particles.push({
                        x: 1.5 * scale + Math.random() * 0.3 * scale,
                        y: -1.5 * scale - t * 1.5 * scale,
                        z: leg * 0.8 * scale + (Math.random() - 0.5) * 0.4 * scale,
                        color: furWhite.clone()
                    });
                }
            }

            // 后腿 (两条)
            for (let leg = -1; leg <= 1; leg += 2) {
                for (let i = 0; i < 200; i++) {
                    const t = Math.random();
                    particles.push({
                        x: -1.5 * scale + Math.random() * 0.3 * scale,
                        y: -1.5 * scale - t * 1.2 * scale,
                        z: leg * 0.9 * scale + (Math.random() - 0.5) * 0.5 * scale,
                        color: furWhite.clone()
                    });
                }
            }

            // 尾巴 (卷曲向上)
            for (let i = 0; i < 300; i++) {
                const t = Math.random();
                const angle = t * Math.PI * 0.8;
                particles.push({
                    x: -2.5 * scale - Math.cos(angle) * 0.8 * scale,
                    y: 0.5 * scale + Math.sin(angle) * 1.2 * scale,
                    z: (Math.random() - 0.5) * 0.5 * scale,
                    color: furWhite.clone()
                });
            }

            // 红色围巾
            for (let i = 0; i < 400; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = 1.0 * scale + Math.random() * 0.15 * scale;
                const y = 0.8 * scale + (Math.random() - 0.5) * 0.4 * scale;
                particles.push({
                    x: 1.8 * scale + Math.cos(angle) * 0.3,
                    y: y,
                    z: Math.sin(angle) * r,
                    color: Math.random() > 0.3 ? scarfRed.clone() : scarfDarkRed.clone()
                });
            }

        } else {
            // ============ 小猫 ============
            const scale = 0.8;
            const catGray = new THREE.Color('#e8e8e8');

            // 身体 (较小的椭球)
            particles.push(...generateSphere([0, 0, 0], 1.5 * scale, 1.2 * scale, 1.0 * scale, 800, catGray));
            addFluffyLayer(particles, [0, 0, 0], 1.6 * scale, 200, furWhite);

            // 头部 (圆润)
            const headCenter: [number, number, number] = [1.5 * scale, 0.8 * scale, 0];
            particles.push(...generateSphere(headCenter, 1.0 * scale, 0.9 * scale, 0.9 * scale, 600, catGray));
            addFluffyLayer(particles, headCenter, 1.1 * scale, 150, furWhite);

            // 尖耳朵 (三角形)
            // 左耳
            for (let i = 0; i < 100; i++) {
                const t = Math.random();
                particles.push({
                    x: headCenter[0] + Math.random() * 0.2 * scale,
                    y: headCenter[1] + 0.8 * scale + t * 0.6 * scale,
                    z: headCenter[2] - 0.5 * scale - t * 0.2 * scale,
                    color: catGray.clone()
                });
            }
            // 右耳
            for (let i = 0; i < 100; i++) {
                const t = Math.random();
                particles.push({
                    x: headCenter[0] + Math.random() * 0.2 * scale,
                    y: headCenter[1] + 0.8 * scale + t * 0.6 * scale,
                    z: headCenter[2] + 0.5 * scale + t * 0.2 * scale,
                    color: catGray.clone()
                });
            }

            // 鼻子 (粉色小点)
            const noseColor = new THREE.Color('#ffb6c1');
            particles.push(...generateSphere(
                [headCenter[0] + 0.85 * scale, headCenter[1] - 0.1 * scale, 0],
                0.1 * scale, 0.08 * scale, 0.08 * scale, 40, noseColor
            ));

            // 眼睛 (大而圆)
            particles.push(...generateSphere(
                [headCenter[0] + 0.5 * scale, headCenter[1] + 0.15 * scale, -0.35 * scale],
                0.12 * scale, 0.15 * scale, 0.08 * scale, 50, eyeBlack
            ));
            particles.push(...generateSphere(
                [headCenter[0] + 0.5 * scale, headCenter[1] + 0.15 * scale, 0.35 * scale],
                0.12 * scale, 0.15 * scale, 0.08 * scale, 50, eyeBlack
            ));

            // 前腿
            for (let leg = -1; leg <= 1; leg += 2) {
                for (let i = 0; i < 100; i++) {
                    const t = Math.random();
                    particles.push({
                        x: 0.8 * scale + Math.random() * 0.2 * scale,
                        y: -1.0 * scale - t * 0.8 * scale,
                        z: leg * 0.5 * scale + (Math.random() - 0.5) * 0.3 * scale,
                        color: catGray.clone()
                    });
                }
            }

            // 后腿
            for (let leg = -1; leg <= 1; leg += 2) {
                for (let i = 0; i < 100; i++) {
                    const t = Math.random();
                    particles.push({
                        x: -0.8 * scale + Math.random() * 0.2 * scale,
                        y: -1.0 * scale - t * 0.6 * scale,
                        z: leg * 0.6 * scale + (Math.random() - 0.5) * 0.4 * scale,
                        color: catGray.clone()
                    });
                }
            }

            // 尾巴 (细长弯曲)
            for (let i = 0; i < 150; i++) {
                const t = i / 150;
                const curve = Math.sin(t * Math.PI) * 0.5;
                particles.push({
                    x: -1.5 * scale - t * 1.5 * scale,
                    y: 0.3 * scale + curve * scale,
                    z: (Math.random() - 0.5) * 0.2 * scale,
                    color: catGray.clone()
                });
            }

            // 红色围巾
            for (let i = 0; i < 200; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = 0.6 * scale + Math.random() * 0.1 * scale;
                const y = 0.5 * scale + (Math.random() - 0.5) * 0.25 * scale;
                particles.push({
                    x: 1.0 * scale + Math.cos(angle) * 0.2,
                    y: y,
                    z: Math.sin(angle) * r,
                    color: Math.random() > 0.3 ? scarfRed.clone() : scarfDarkRed.clone()
                });
            }
        }

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
    }, [type]);

    useFrame((state) => {
        if (groupRef.current) {
            const t = state.clock.elapsedTime * speed;
            const angle = startAngle + t;

            // 圆周运动
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            groupRef.current.position.set(x, yOffset, z);

            // 朝向运动方向
            groupRef.current.rotation.y = -angle + Math.PI / 2;

            // 奔跑弹跳
            const bounce = Math.abs(Math.sin(t * 8)) * 0.3;
            groupRef.current.position.y = yOffset + bounce;

            // 轻微摇摆
            groupRef.current.rotation.z = Math.sin(t * 8) * 0.05;
        }
    });

    return (
        <group ref={groupRef} scale={0.8}>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[colors, 3]} />
                </bufferGeometry>
                <pointsMaterial
                    vertexColors
                    size={type === 'samoyed' ? 0.25 : 0.2}
                    transparent
                    opacity={0.95}
                    sizeAttenuation
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    );
};

export const ParticleAnimals: React.FC = () => {
    return (
        <>
            {/* 萨摩耶 */}
            <Animal type="samoyed" startAngle={0} radius={28} speed={0.3} yOffset={-16} />

            {/* 小猫跟在后面 */}
            <Animal type="kitten" startAngle={-0.8} radius={26} speed={0.35} yOffset={-17} />
        </>
    );
};
