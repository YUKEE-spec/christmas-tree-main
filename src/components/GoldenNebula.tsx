import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Cloud, Clouds } from '@react-three/drei';

interface GoldenNebulaProps {
    state: 'CHAOS' | 'FORMED';
}

export const GoldenNebula: React.FC<GoldenNebulaProps> = ({ state }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((rootState) => {
        if (groupRef.current) {
            const speed = state === 'CHAOS' ? 0.2 : 0.05;
            groupRef.current.rotation.y = rootState.clock.elapsedTime * speed;
        }
    });

    // Only show in formed state or always? Assuming always if enabled.
    // Using Drei's Cloud for convenience if possible, or simple particle system.
    // Standard implementation:
    return (
        <group ref={groupRef} position={[0, 10, 0]}>
            <Clouds material={THREE.MeshBasicMaterial}>
                <Cloud
                    seed={1}
                    scale={2}
                    volume={5}
                    color="#FFD700"
                    fade={100}
                    speed={0.1}
                    opacity={0.3}
                    bounds={[20, 10, 20]} // x, y, z
                />
                <Cloud
                    seed={2}
                    scale={3}
                    volume={4}
                    color="#FFA500" // Orange-ish gold
                    fade={100}
                    speed={0.1}
                    opacity={0.2}
                    position={[10, 5, -10]}
                />
            </Clouds>
            {/* Add some sparkling particles for "Nebula" feel */}
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[new Float32Array(Array.from({ length: 300 }, () => (Math.random() - 0.5) * 50)), 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    color="#FFD700"
                    size={0.5}
                    transparent
                    opacity={0.6}
                />
            </points>
        </group>
    );
};
