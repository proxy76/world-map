import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";

const preloadTexture = new THREE.TextureLoader().load('/earth3.png');

// Optional: force early decoding to reduce first interaction delay
preloadTexture.encoding = THREE.sRGBEncoding;
preloadTexture.anisotropy = 8;

const Globe = () => {
    const containerRef = useRef(null);
    const rendererRef = useRef(null);
    const globeRef = useRef(null);
    const cameraRef = useRef(null);
    const { lang } = useLanguage();

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 3;
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Low-poly sphere for perf, preloaded texture
        const geometry = new THREE.SphereGeometry(1.5, 24, 24);
        const material = new THREE.MeshBasicMaterial({ map: preloadTexture });
        const globe = new THREE.Mesh(geometry, material);
        globeRef.current = globe;
        scene.add(globe);

        // GPU-optimal animation loop
        renderer.setAnimationLoop((time) => {
            if (globeRef.current) {
                globeRef.current.rotation.y = time * 0.0001;
                renderer.render(scene, camera);
            }
        });

        const handleResize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize, { passive: true });
        handleResize();

        return () => {
            renderer.setAnimationLoop(null);
            window.removeEventListener('resize', handleResize);
            if (globeRef.current) {
                globeRef.current.geometry.dispose();
                if (globeRef.current.material.map) globeRef.current.material.map.dispose();
                globeRef.current.material.dispose();
            }
            if (rendererRef.current) {
                rendererRef.current.dispose();
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '500px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div className='globeText'>
                {translations[lang].globeText}
            </div>
        </div>
    );
};

// Prevents unnecessary re-renders
export default React.memo(Globe);
