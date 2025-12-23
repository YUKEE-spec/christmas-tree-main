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

const Animal: React.FC<AnimalProps> = ({ type, startAngle, radius, speed, yOffset }) => {
    const groupRef = useRef<THREE.Group>(null);

    // 生成动物粒子
    const { positions, colors, randoms } = useMemo(() => {
        const isDog = type === 'samoyed';
        const count = isDog ? 800 : 400; // 狗大一点，粒子多一点
        const bodySize = isDog ? 1.5 : 0.8;
        const colorBase = isDog ? '#ffffff' : '#eeeeee';

        const p = [];
        const colorObj = new THREE.Color(colorBase);

        // 身体 (椭球)
        for (let i = 0; i < count * 0.6; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = (Math.random() * 0.5 + 0.5) * bodySize;

            // 拉长一点做身体
            p.push({
                x: r * Math.sin(phi) * Math.cos(theta) * 1.5, // 长
                y: r * Math.sin(phi) * Math.sin(theta),
                z: r * Math.cos(phi),
                r: Math.random(),
            });
        }

        // 头
        for (let i = 0; i < count * 0.2; i++) {
            const r = (Math.random() * 0.5 + 0.5) * (bodySize * 0.6);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            p.push({
                x: bodySize * 1.2 + r * Math.sin(phi) * Math.cos(theta), // 头在身体前面
                y: bodySize * 0.5 + r * Math.sin(phi) * Math.sin(theta),
                z: r * Math.cos(phi),
                r: Math.random(),
            });
        }

        // 尾巴
        for (let i = 0; i < count * 0.1; i++) {
            p.push({
                x: -bodySize - Math.random() * 0.5,
                y: bodySize * 0.5 + Math.random() * 0.5,
                z: (Math.random() - 0.5) * 0.5,
                r: Math.random(),
            })
        }

        // 耳朵 (猫的尖一点)
        for (let i = 0; i < count * 0.05; i++) {
            const isLeft = Math.random() > 0.5 ? 1 : -1;
            p.push({
                x: bodySize * 1.3,
                y: bodySize * 1.0 + Math.random() * 0.3,
                z: isLeft * (bodySize * 0.3),
                r: Math.random()
            })
        }

        const posArray = new Float32Array(p.length * 3);
        const colArray = new Float32Array(p.length * 3);
        const rndArray = new Float32Array(p.length);

        p.forEach((pt, i) => {
            posArray[i * 3] = pt.x;
            posArray[i * 3 + 1] = pt.y;
            posArray[i * 3 + 2] = pt.z;

            colArray[i * 3] = colorObj.r;
            colArray[i * 3 + 1] = colorObj.g;
            colArray[i * 3 + 2] = colorObj.b;

            rndArray[i] = pt.r;
        });

        return { positions: posArray, colors: colArray, randoms: rndArray };
    }, [type]);

    useFrame((state) => {
        if (groupRef.current) {
            const t = state.clock.elapsedTime * speed;
            const angle = startAngle + t; // 绕圈跑

            // 圆周运动位置
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            groupRef.current.position.set(x, yOffset, z);

            // 朝向切线方向 (奔跑方向)
            groupRef.current.rotation.y = -angle;

            // 奔跑跳跃动态
            const bounce = Math.abs(Math.sin(t * 10)) * 0.5;
            groupRef.current.position.y = yOffset + bounce;

            // 摇摆
            groupRef.current.rotation.z = Math.sin(t * 10) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[colors, 3]} />
                    <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
                </bufferGeometry>
                <pointsMaterial
                    vertexColors
                    size={type === 'samoyed' ? 0.6 : 0.4}
                    transparent
                    opacity={0.8}
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
            {/* 萨摩耶：半径 25， 速度 0.5 */}
            <Animal type="samoyed" startAngle={0} radius={25} speed={0.5} yOffset={-18} />

            {/* 小猫：半径 25，速度 0.5 (跟在后面，角度偏移) */}
            <Animal type="kitten" startAngle={-0.5} radius={25} speed={0.55} yOffset={-18.5} />
        </>
    );
};
