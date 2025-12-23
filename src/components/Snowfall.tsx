import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Snowfall: React.FC = () => {
    const count = 2000;
    const mesh = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const temp = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            temp[i * 3] = (Math.random() - 0.5) * 200; // x
            temp[i * 3 + 1] = Math.random() * 100 + 20; // y
            temp[i * 3 + 2] = (Math.random() - 0.5) * 200; // z
        }
        return temp;
    }, []);

    const speed = useMemo(() => new Float32Array(count).map(() => Math.random() * 0.2 + 0.1), []);

    useFrame(() => {
        if (!mesh.current) return;
        const positions = mesh.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < count; i++) {
            // Y axis movement
            positions[i * 3 + 1] -= speed[i];

            // Reset if below ground
            if (positions[i * 3 + 1] < -20) {
                positions[i * 3 + 1] = 100;
                positions[i * 3] = (Math.random() - 0.5) * 200; // Random x
                positions[i * 3 + 2] = (Math.random() - 0.5) * 200; // Random z
            }
        }
        mesh.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[particles, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.5}
                color="#ffffff"
                transparent
                opacity={0.8}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
};
