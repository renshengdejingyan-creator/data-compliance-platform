// Three.js 粒子背景效果
(function() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.position.z = 50;

    // 创建粒子系统
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);
    const velocities = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 100;
        posArray[i + 1] = (Math.random() - 0.5) * 100;
        posArray[i + 2] = (Math.random() - 0.5) * 100;
        
        velocities[i] = (Math.random() - 0.5) * 0.02;
        velocities[i + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i + 2] = (Math.random() - 0.5) * 0.02;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // 粒子材质
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15,
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // 创建连接线
    const linesMaterial = new THREE.LineBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
    });

    let linesGeometry = new THREE.BufferGeometry();
    let linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(linesMesh);

    // 鼠标交互
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // 动画循环
    function animate() {
        requestAnimationFrame(animate);

        // 更新粒子位置
        const positions = particlesGeometry.attributes.position.array;
        for (let i = 0; i < particlesCount * 3; i += 3) {
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];

            // 边界检测
            if (Math.abs(positions[i]) > 50) velocities[i] *= -1;
            if (Math.abs(positions[i + 1]) > 50) velocities[i + 1] *= -1;
            if (Math.abs(positions[i + 2]) > 50) velocities[i + 2] *= -1;
        }
        particlesGeometry.attributes.position.needsUpdate = true;

        // 创建连接线
        const linePositions = [];
        const maxDistance = 8;
        
        for (let i = 0; i < particlesCount; i++) {
            for (let j = i + 1; j < particlesCount; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance < maxDistance) {
                    linePositions.push(
                        positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                        positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                    );
                }
            }
        }

        linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

        // 鼠标交互效果
        targetX = mouseX * 5;
        targetY = mouseY * 5;
        
        particlesMesh.rotation.y += 0.0005;
        particlesMesh.rotation.x += (targetY - particlesMesh.rotation.x) * 0.05;
        particlesMesh.rotation.y += (targetX - particlesMesh.rotation.y) * 0.05;

        renderer.render(scene, camera);
    }

    animate();

    // 响应式调整
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 添加额外的视觉效果
    const ambientLight = new THREE.AmbientLight(0x60a5fa, 0.5);
    scene.add(ambientLight);

    // 创建光晕效果
    const glowGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < 10; i++) {
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80
        );
        scene.add(glow);

        // 光晕动画
        (function(glowMesh) {
            const originalY = glowMesh.position.y;
            const speed = 0.001 + Math.random() * 0.002;
            const amplitude = 5 + Math.random() * 10;
            
            function animateGlow() {
                glowMesh.position.y = originalY + Math.sin(Date.now() * speed) * amplitude;
                requestAnimationFrame(animateGlow);
            }
            animateGlow();
        })(glow);
    }
})();
