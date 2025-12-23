import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SnowGroundProps {
    opacity?: number;
}

// 地形高度函数 - 创建雪谷和雪坡
const getTerrainHeight = (x: number, z: number): number => {
    const baseHeight = -20;
    
    // 主要的雪谷 - 在一侧形成凹陷
    const valleyX = x - 30;
    const valleyZ = z + 20;
    const valleyDist = Math.sqrt(valleyX * valleyX + valleyZ * valleyZ);
    const valley = valleyDist < 25 ? -3 * Math.cos(valleyDist / 25 * Math.PI / 2) : 0;
    
    // 雪坡 - 在另一侧形成隆起
    const hillX = x + 40;
    const hillZ = z - 30;
    const hillDist = Math.sqrt(hillX * hillX + hillZ * hillZ);
    const hill = hillDist < 30 ? 4 * Math.cos(hillDist / 30 * Math.PI / 2) : 0;
    
    // 小丘陵 - 随机分布的小起伏
    const smallHills = 
        Math.sin(x * 0.08) * Math.cos(z * 0.08) * 1.5 +
        Math.sin(x * 0.15 + 1) * Math.cos(z * 0.12 + 2) * 0.8;
    
    // 柏林噪声模拟的自然起伏
    const noise = 
        Math.sin(x * 0.05) * Math.sin(z * 0.05) * 2 +
        Math.cos(x * 0.03 + z * 0.04) * 1.5;
    
    return baseHeight + valley + hill + smallHills + noise;
};

// 检查点是否在文字笔画上 - 用于创建凹陷效果
const isPointOnText = (x: number, z: number): boolean => {
    const text = "5114, 2017-2025";
    
    // 文字位置参数 - 文字放在前方（负Z方向），面向相机
    const startX = -35;
    const startZ = -55;  // 改为负值，放在前方
    const charWidth = 4;
    const charHeight = 6;
    const spacing = 4.5;
    const strokeWidth = 0.5; // 笔画宽度
    
    // 简单的像素字体定义 (5x7 网格)
    const font: { [key: string]: number[][] } = {
        '5': [
            [1,1,1,1,1],
            [1,0,0,0,0],
            [1,1,1,1,0],
            [0,0,0,0,1],
            [0,0,0,0,1],
            [1,0,0,0,1],
            [0,1,1,1,0]
        ],
        '1': [
            [0,0,1,0,0],
            [0,1,1,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,1,1,1,0]
        ],
        '4': [
            [0,0,0,1,0],
            [0,0,1,1,0],
            [0,1,0,1,0],
            [1,0,0,1,0],
            [1,1,1,1,1],
            [0,0,0,1,0],
            [0,0,0,1,0]
        ],
        ',': [
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,1,0,0],
            [0,1,0,0,0]
        ],
        ' ': [
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0]
        ],
        '2': [
            [0,1,1,1,0],
            [1,0,0,0,1],
            [0,0,0,0,1],
            [0,0,1,1,0],
            [0,1,0,0,0],
            [1,0,0,0,0],
            [1,1,1,1,1]
        ],
        '0': [
            [0,1,1,1,0],
            [1,0,0,0,1],
            [1,0,0,1,1],
            [1,0,1,0,1],
            [1,1,0,0,1],
            [1,0,0,0,1],
            [0,1,1,1,0]
        ],
        '7': [
            [1,1,1,1,1],
            [0,0,0,0,1],
            [0,0,0,1,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0]
        ],
        '-': [
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [1,1,1,1,1],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0]
        ]
    };
    
    let offsetX = 0;
    for (const char of text) {
        const charData = font[char];
        if (charData) {
            for (let row = 0; row < charData.length; row++) {
                for (let col = 0; col < charData[row].length; col++) {
                    if (charData[row][col] === 1) {
                        const cellX = startX + offsetX + col * (charWidth / 5);
                        // Z方向：row增加时Z减小（文字从上到下）
                        const cellZ = startZ + row * (charHeight / 7);
                        
                        // 检查点是否在这个笔画单元格内
                        if (Math.abs(x - cellX) < strokeWidth && Math.abs(z - cellZ) < strokeWidth) {
                            return true;
                        }
                    }
                }
            }
        }
        offsetX += spacing;
    }
    
    return false;
};

// 获取文字凹陷深度
const getTextDepth = (x: number, z: number): number => {
    if (isPointOnText(x, z)) {
        return -1.2; // 凹陷深度
    }
    return 0;
};

export const SnowGround: React.FC<SnowGroundProps> = ({ opacity = 0.5 }) => {
    const groundRef = useRef<THREE.Points>(null);
    const grooveRef = useRef<THREE.Points>(null);

    // 生成地面粒子 - 带地形变化和文字凹陷
    const { positions, randoms } = useMemo(() => {
        const count = 5000;
        const positions = new Float32Array(count * 3);
        const randoms = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // 在圆盘范围内随机分布
            const radius = 25 + Math.random() * 80;
            const angle = Math.random() * Math.PI * 2;

            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // 使用地形函数计算高度，加上文字凹陷
            const textDepth = getTextDepth(x, z);
            const y = getTerrainHeight(x, z) + textDepth + (Math.random() - 0.5) * 0.5;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            randoms[i] = Math.random();
        }

        return { positions, randoms };
    }, []);

    // 生成凹槽内的深色粒子 - 模拟划痕露出的泥土/阴影
    const grooveParticles = useMemo(() => {
        const particles: number[] = [];
        const text = "5114, 2017-2025";
        
        const startX = -35;
        const startZ = -55;  // 改为负值，与isPointOnText一致
        const charWidth = 4;
        const charHeight = 6;
        const spacing = 4.5;
        
        const font: { [key: string]: number[][] } = {
            '5': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            '1': [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
            '4': [[0,0,0,1,0],[0,0,1,1,0],[0,1,0,1,0],[1,0,0,1,0],[1,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0]],
            ',': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,1,0,0,0]],
            ' ': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
            '2': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,1,1,0],[0,1,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
            '0': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,1,1],[1,0,1,0,1],[1,1,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            '7': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
            '-': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]
        };
        
        let offsetX = 0;
        for (const char of text) {
            const charData = font[char];
            if (charData) {
                for (let row = 0; row < charData.length; row++) {
                    for (let col = 0; col < charData[row].length; col++) {
                        if (charData[row][col] === 1) {
                            // 在凹槽底部生成深色粒子
                            for (let p = 0; p < 6; p++) {
                                const px = startX + offsetX + col * (charWidth / 5) + (Math.random() - 0.5) * 0.7;
                                const pz = startZ + row * (charHeight / 7) + (Math.random() - 0.5) * 0.7;
                                const py = getTerrainHeight(px, pz) - 1.0 + Math.random() * 0.3;
                                particles.push(px, py, pz);
                            }
                        }
                    }
                }
            }
            offsetX += spacing;
        }
        
        return new Float32Array(particles);
    }, []);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        if (groundRef.current) {
            groundRef.current.rotation.y = time * 0.015;
        }
        if (grooveRef.current) {
            grooveRef.current.rotation.y = time * 0.015;
        }
    });

    return (
        <group>
            {/* 主雪地 */}
            <points ref={groundRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                    <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
                </bufferGeometry>
                <pointsMaterial
                    color="#e8f4fc"
                    size={0.9}
                    transparent
                    opacity={opacity}
                    sizeAttenuation
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
            
            {/* 凹槽底部的深色粒子 - 像划痕露出的阴影 */}
            <points ref={grooveRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[grooveParticles, 3]} />
                </bufferGeometry>
                <pointsMaterial
                    color="#8b9dc3"
                    size={0.4}
                    transparent
                    opacity={0.7}
                    sizeAttenuation
                    depthWrite={false}
                />
            </points>
        </group>
    );
};
