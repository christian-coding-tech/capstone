(function() {
    const canvas = document.getElementById('threeCanvas');
    if (!canvas) return;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding || 3001;    
    renderer.shadowMap.enabled = true;

    // ── Scene ──
    const scene = new THREE.Scene();

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 2.1, 5.1);
    camera.lookAt(0, 0.1, 0);

    // ── Lights ──
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x7dc4f5, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x4a90d9, 0.4);
    fillLight.position.set(-5, 2, -5);
    scene.add(fillLight);

    // ── Load GLB ──
    const loader = new THREE.GLTFLoader();
    loader.crossOrigin = 'anonymous';

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    loader.load(
        'ACLC3.glb',
        function(gltf) {
            model = gltf.scene;

            // Center the model inside the group
            const box    = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size   = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale  = 30 / maxDim;

            model.position.sub(center);
            model.scale.setScalar(scale);

            modelGroup.add(model);
            modelGroup.position.y = -16.5;
            modelGroup.position.x = 4.5;

            // Hide label once loaded
            const label = document.querySelector('.model-label');
            if (label) label.textContent = 'ACLC Fatima Campus';
        },
        function(progress) {
            // Loading progress
        },
        function(error) {
            console.warn('GLB load error:', error);
            const label = document.querySelector('.model-label');
            if (label) label.textContent = '3D model ready';
        }
    );

    // ── Resize handler ──
    function resize() {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (canvas.width !== w || canvas.height !== h) {
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
    }

    // ── Float animation ──
    let floatTime = 0;

    // ── Animate ──
    function animate() {
        requestAnimationFrame(animate);
        resize();

        floatTime += 0.01;

        if (model) {
            // Slow rotation
            model.rotation.y += 0.003;
            // Float up and down
            model.position.y = Math.sin(floatTime) * 0.12;
        }

        renderer.render(scene, camera);
    }

    animate();
})();